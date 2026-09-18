/**
 * Flush the caches in front of the deployment.
 *
 *   npm run purge                                 everything
 *   npm run purge -- blog mobile-car-wash         just those pages
 *
 * Without the leading slash, because Git Bash on Windows rewrites `/blog` into
 * `C:/Program Files/Git/blog` before node is handed it. Either form works
 * everywhere else, and the check below catches the one that does not.
 *
 * One POST to /api/revalidate/, which flushes Next's prerender cache and then
 * purges Cloudflare — see app/api/revalidate/route.ts and lib/cloudflare.ts
 * for what each half does and when each one matters.
 *
 * Environment, read from the shell first and `.env.local` second:
 *
 *   REVALIDATE_SECRET  required; the same value the deployment was given
 *   BASE               the origin to flush, default https://medusaautodetailing.co.uk
 *
 * The default is production on purpose. `npm run verify` defaults to localhost
 * because crawling a local build is the point of it; purging a local build is
 * not a thing anyone wants to do.
 */
import fs from 'node:fs';
import path from 'node:path';
import { ROOT, SITE } from './paths.mjs';

/* Only fills what the shell has not already set, so `BASE=… npm run purge`
   still wins over the file. */
function loadEnvLocal() {
  const file = path.join(ROOT, '.env.local');
  if (!fs.existsSync(file)) return;
  for (const line of fs.readFileSync(file, 'utf8').split(/\r?\n/)) {
    const m = /^\s*([A-Z0-9_]+)\s*=\s*(.*)$/.exec(line);
    if (!m) continue;
    const value = m[2].trim().replace(/^(['"])(.*)\1$/, '$2');
    if (value && process.env[m[1]] === undefined) process.env[m[1]] = value;
  }
}

loadEnvLocal();

const BASE = (process.env.BASE || SITE).replace(/\/$/, '');
const SECRET = process.env.REVALIDATE_SECRET;

if (!SECRET) {
  console.error('purge: REVALIDATE_SECRET is not set (shell or .env.local).');
  process.exit(1);
}

const paths = process.argv.slice(2).filter((a) => !a.startsWith('-'));

/* A path that arrives as a Windows one was mangled by Git Bash on its way in.
   Left alone it reaches the endpoint as `/C:/Program Files/Git/blog`, comes
   back in `unknown`, and flushes nothing while looking like it tried. */
const mangled = paths.filter((a) => /^[A-Za-z]:[\\/]/.test(a) || a.includes('\\'));
if (mangled.length) {
  console.error(`purge: "${mangled[0]}" is not a path on the site.`);
  console.error('purge: Git Bash rewrites a leading slash into a Windows path before');
  console.error('purge: node sees it. Write the paths without one:');
  console.error('purge:   npm run purge -- blog mobile-car-wash/mini-valet');
  process.exit(1);
}

const body = paths.length
  ? { paths: paths.map((p) => (p.startsWith('/') ? p : '/' + p)) }
  : { all: true };

console.log(
  paths.length
    ? `purge: ${paths.length} path(s) on ${BASE}`
    : `purge: everything on ${BASE}`,
);

/* The trailing slash is load-bearing: `trailingSlash: true` answers the bare
   form with a 308, and a POST that is not followed looks like a success. */
const response = await fetch(`${BASE}/api/revalidate/`, {
  method: 'POST',
  headers: {
    authorization: `Bearer ${SECRET}`,
    'content-type': 'application/json',
  },
  body: JSON.stringify(body),
  redirect: 'error',
});

const text = await response.text();
let payload;
try {
  payload = JSON.parse(text);
} catch {
  console.error(`purge: HTTP ${response.status}, and the body is not JSON:\n${text.slice(0, 400)}`);
  process.exit(1);
}

console.log(JSON.stringify(payload, null, 2));

if (!response.ok) process.exit(1);

/* A skipped Cloudflare purge is not a failure - a deployment with no CDN in
   front of it has nothing to purge - but it is worth saying out loud, because
   the usual reason on production is a missing env var rather than a missing
   CDN. */
if (payload.purge?.status === 'skipped') {
  console.log(`purge: Cloudflare not purged - ${payload.purge.reason}`);
}
