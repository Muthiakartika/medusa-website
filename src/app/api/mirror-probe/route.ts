/**
 * TEMPORARY — delete once the mirror domains are blocked (PROJECT.md §14).
 *
 * Reports which request headers reach the origin, so a request made directly
 * and the same request made through medusaautodetailing.pro can be compared.
 * The Cloudflare WAF rule on `cf.worker.upstream_zone` was active and matched
 * nothing, so the field that does tell the mirrors apart has to be read off
 * a real request rather than guessed.
 *
 * Values only for an allowlist that carries nothing secret: the caller's own
 * IP, country and user agent, and the routing headers Cloudflare and Vercel
 * add. Every other header is reported by name alone.
 */
const VALUES = [
  "host",
  "user-agent",
  "referer",
  "origin",
  "via",
  "cdn-loop",
  "cf-connecting-ip",
  "cf-connecting-ipv6",
  "cf-ipcountry",
  "cf-ray",
  "cf-visitor",
  "cf-worker",
  "cf-ew-via",
  "true-client-ip",
  "x-forwarded-for",
  "x-forwarded-host",
  "x-forwarded-proto",
  "x-real-ip",
  "x-vercel-forwarded-for",
  "x-vercel-ip-country",
];

export function GET(request: Request) {
  const values: Record<string, string> = {};
  const names: string[] = [];
  request.headers.forEach((value, name) => {
    if (VALUES.includes(name)) values[name] = value;
    else names.push(name);
  });
  return Response.json({ values, otherHeaders: names.sort() });
}
