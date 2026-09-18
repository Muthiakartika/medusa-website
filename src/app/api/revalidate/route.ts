import { revalidatePath } from "next/cache";
import { ALL_SLUGS, CUSTOM_ROUTES, getPage } from "@/lib/blocks";
import { purgeCloudflare, type PurgeResult } from "@/lib/cloudflare";
import { SITE } from "@/lib/site";

/**
 * On-demand revalidation, so a page can be refreshed without a redeploy and
 * without waiting out the hour set in `app/layout.tsx`.
 *
 * The endpoint exists because the alternative — redeploying to correct one
 * paragraph on one of 255 pages — is a poor trade, and because a page that is
 * generated on demand has no other way of being told it is stale.
 *
 * It flushes **both** caches in front of a page: `revalidatePath` for Next's
 * own prerender cache, then a Cloudflare purge for the CDN a hop further out,
 * which would otherwise keep serving the copy it already has. `lib/cloudflare.ts`
 * has the detail, including what happens when no Cloudflare is configured.
 *
 * Guarded by REVALIDATE_SECRET. With the variable unset the route refuses
 * every request rather than defaulting to open: an unauthenticated flush of
 * the whole site is a denial-of-service primitive, not a convenience.
 *
 * The trailing slash is not optional. `trailingSlash: true` in next.config.ts
 * is resolved before routing, so a POST to `/api/revalidate` is answered with
 * a 308 to `/api/revalidate/` — which curl does not follow unless told to, so
 * the call looks like it worked and nothing is flushed.
 *
 *   curl -X POST https://example.com/api/revalidate/ \
 *     -H "Authorization: Bearer $REVALIDATE_SECRET" \
 *     -H "Content-Type: application/json" \
 *     -d '{"paths":["/car-valeting/mini-valet","/blog"]}'
 *
 *   # everything, via the root layout
 *   curl -X POST … -d '{"all":true}'
 *
 * `npm run purge` is the same two calls with the secret read out of
 * `.env.local`; see scripts/purge.mjs.
 */

// Reads a request body, so it could never be prerendered — but say so, rather
// than leaving it to be inferred from the first line that happens to force it.
export const dynamic = "force-dynamic";

type Body = { paths?: unknown; all?: unknown };

const json = (status: number, body: Record<string, unknown>) =>
  Response.json(body, { status });

/** Constant-time-ish compare, so a wrong secret leaks no length information. */
function matches(given: string, expected: string) {
  if (given.length !== expected.length) return false;
  let diff = 0;
  for (let i = 0; i < given.length; i++) diff |= given.charCodeAt(i) ^ expected.charCodeAt(i);
  return diff === 0;
}

function authorised(request: Request) {
  const secret = process.env.REVALIDATE_SECRET;
  if (!secret) return false;
  const header = request.headers.get("authorization") ?? "";
  const bearer = header.startsWith("Bearer ") ? header.slice(7) : "";
  return Boolean(bearer) && matches(bearer, secret);
}

/**
 * Every path this site actually serves, as a set, so a request can only flush
 * a real page. `revalidatePath` on a path that does not exist is silently a
 * no-op, which is a confusing thing to get a 200 for.
 */
function knownPaths() {
  const paths = new Set<string>(["/"]);
  for (const slug of ALL_SLUGS) paths.add("/" + slug);
  for (const slug of CUSTOM_ROUTES) paths.add("/" + slug);
  return paths;
}

/**
 * The absolute URL Cloudflare has cached for a path.
 *
 * `trailingSlash: true`, so every page is held under its slashed form; the
 * bare form only ever answered a 308, which is correct forever and worth
 * leaving in the cache.
 */
const cachedUrl = (path: string) => SITE + (path.endsWith("/") ? path : path + "/");

/** A purge that was attempted and failed is the one outcome worth a non-2xx. */
const purgeFailed = (purge: PurgeResult) => purge.status === "failed";

export async function POST(request: Request) {
  if (!process.env.REVALIDATE_SECRET) {
    return json(503, { error: "REVALIDATE_SECRET is not configured" });
  }
  if (!authorised(request)) {
    return json(401, { error: "unauthorised" });
  }

  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return json(400, { error: "expected a JSON body" });
  }

  // The whole site, through the layout every page nests under.
  if (body.all === true) {
    revalidatePath("/", "layout");
    const purge = await purgeCloudflare("everything");
    return json(purgeFailed(purge) ? 502 : 200, {
      revalidated: "all",
      purge,
      at: new Date().toISOString(),
    });
  }

  if (!Array.isArray(body.paths) || !body.paths.length) {
    return json(400, { error: 'expected {"paths":["/a","/b"]} or {"all":true}' });
  }

  const known = knownPaths();
  const done: string[] = [];
  const unknown: string[] = [];

  for (const entry of body.paths) {
    if (typeof entry !== "string") continue;
    const path = entry.startsWith("/") ? entry : "/" + entry;
    // `getPage` is the same lookup the pages themselves use, so a path that
    // renders here is exactly a path that renders there.
    if (!known.has(path) && !getPage(path.slice(1))) {
      unknown.push(path);
      continue;
    }
    revalidatePath(path);
    done.push(path);
  }

  if (!done.length) return json(404, { error: "no known paths", unknown });

  const purge = await purgeCloudflare(done.map(cachedUrl));
  return json(purgeFailed(purge) ? 502 : 200, {
    revalidated: done,
    unknown,
    purge,
    at: new Date().toISOString(),
  });
}

/** A GET here is nearly always someone testing the URL in a browser. */
export function GET() {
  return json(405, { error: "POST only — see app/api/revalidate/route.ts" });
}
