/**
 * Purging Cloudflare, the cache that sits one hop outside Next's own.
 *
 * medusaautodetailing.co.uk resolves to Cloudflare, which proxies to Vercel.
 * The two caches are not the same thing and are not flushed by the same call:
 * `revalidatePath` invalidates Next's prerender cache so Vercel starts serving
 * the new page, and Cloudflare goes on handing out whatever it already holds
 * until its own TTL expires. Next's CDN guide puts it plainly — on-demand
 * revalidation has to be paired with a purge of the CDN in front.
 *
 * So every flush goes through here as well, and the two env vars decide
 * whether that means anything:
 *
 *   CLOUDFLARE_ZONE_ID    the zone for medusaautodetailing.co.uk
 *   CLOUDFLARE_API_TOKEN  a token with exactly one permission, Zone ·
 *                         Cache Purge · Purge, scoped to that zone
 *
 * With either unset this is a no-op that says so rather than a failure: a
 * deployment with no Cloudflare in front of it — a preview, a self-hosted
 * `next start`, a local build — has nothing to purge, and the caller's own
 * revalidation has already done the whole job.
 */

const ENDPOINT = (zone: string) =>
  `https://api.cloudflare.com/client/v4/zones/${zone}/purge_cache`;

/**
 * Cloudflare takes at most 30 URLs per purge-by-URL call on every plan below
 * Enterprise. 275 pages is ten calls, which is cheaper than it looks and still
 * far cheaper than purging the whole zone for one corrected paragraph.
 */
const BATCH = 30;

export type PurgeResult =
  | { status: "skipped"; reason: string }
  | { status: "purged"; scope: "everything" | "urls"; urls?: number }
  | { status: "failed"; error: string };

/**
 * `"everything"` empties the zone; an array of site-absolute paths purges just
 * those URLs.
 *
 * Purge-by-URL matches on the exact URL, which on an App Router site means the
 * HTML but not the `?_rsc=…` payload a client-side navigation asks for. That
 * is not a gap here: the `_rsc` value is a hash that includes the build, so a
 * deployment gives every payload a new cache key of its own, and this site's
 * content cannot change without one — `pages.json` is bundled at build time.
 * See PROJECT.md §7.
 */
export async function purgeCloudflare(
  target: "everything" | string[],
): Promise<PurgeResult> {
  const zone = process.env.CLOUDFLARE_ZONE_ID;
  const token = process.env.CLOUDFLARE_API_TOKEN;
  if (!zone || !token) {
    return {
      status: "skipped",
      reason: "CLOUDFLARE_ZONE_ID / CLOUDFLARE_API_TOKEN not set",
    };
  }

  const bodies =
    target === "everything"
      ? [{ purge_everything: true }]
      : chunk(target, BATCH).map((files) => ({ files }));

  try {
    for (const body of bodies) {
      const response = await fetch(ENDPOINT(zone), {
        method: "POST",
        headers: {
          authorization: `Bearer ${token}`,
          "content-type": "application/json",
        },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(10_000),
      });
      /* Cloudflare answers 200 with `success: false` for a rejected purge as
         readily as it answers 4xx, so both have to be read. */
      const payload = (await response.json().catch(() => null)) as {
        success?: boolean;
        errors?: { message?: string }[];
      } | null;
      if (!response.ok || !payload?.success) {
        return {
          status: "failed",
          error:
            payload?.errors?.map((e) => e.message).filter(Boolean).join("; ") ||
            `HTTP ${response.status}`,
        };
      }
    }
  } catch (error) {
    return { status: "failed", error: String(error) };
  }

  return target === "everything"
    ? { status: "purged", scope: "everything" }
    : { status: "purged", scope: "urls", urls: target.length };
}

function chunk<T>(items: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < items.length; i += size) out.push(items.slice(i, i + size));
  return out;
}
