import { revalidatePath } from "next/cache";
import { ALL_SLUGS, CUSTOM_ROUTES, getPage } from "@/lib/blocks";

/**
 * On-demand revalidation, so a page can be refreshed without a redeploy and
 * without waiting out the hour set in `app/layout.tsx`.
 *
 * The endpoint exists because the alternative — redeploying to correct one
 * paragraph on one of 255 pages — is a poor trade, and because a page that is
 * generated on demand has no other way of being told it is stale.
 *
 * Guarded by REVALIDATE_SECRET. With the variable unset the route refuses
 * every request rather than defaulting to open: an unauthenticated flush of
 * the whole site is a denial-of-service primitive, not a convenience.
 *
 *   curl -X POST https://example.com/api/revalidate \
 *     -H "Authorization: Bearer $REVALIDATE_SECRET" \
 *     -H "Content-Type: application/json" \
 *     -d '{"paths":["/mini-valet","/blog"]}'
 *
 *   # everything, via the root layout
 *   curl -X POST … -d '{"all":true}'
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
    return json(200, { revalidated: "all", at: new Date().toISOString() });
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
  return json(200, { revalidated: done, unknown, at: new Date().toISOString() });
}

/** A GET here is nearly always someone testing the URL in a browser. */
export function GET() {
  return json(405, { error: "POST only — see app/api/revalidate/route.ts" });
}
