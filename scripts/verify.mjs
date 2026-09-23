/**
 * Crawls every generated route on the running dev/prod server and checks:
 *   - HTTP 200
 *   - page has an <h1> and non-trivial body text
 *   - every internal link points at a route that actually exists
 *   - every referenced /assets image exists on disk
 *   - each page carries a parseable JSON-LD graph and one well-formed
 *     BreadcrumbList (none on the homepage)
 * Then checks the site-level SEO surfaces: sitemap, robots, and the 404.
 */
import fs from 'node:fs';
import path from 'node:path';
import { PAGES_JSON, PUBLIC } from './paths.mjs';

const BASE = process.env.BASE || 'http://localhost:3000';

const pages = JSON.parse(fs.readFileSync(PAGES_JSON, 'utf8'));

/* Routes the app serves that have no entry in pages.json, so the loop below
   cannot see them. Each menu-group hub is built out of the pages it links to
   — see lib/hubs.ts. */
const EXTRA_ROUTES = ['/repairs', '/car-interior-cleaning', '/vehicles'];

/* The 49 location pages the SEO plan asks for that the mirror has no page for.
   Like the redirect table below, they are read out of the TypeScript rather
   than imported from it — see lib/planned-locations.ts. */
const PLANNED = [...fs
  .readFileSync(path.join(path.dirname(PAGES_JSON), '../lib/planned-locations.ts'), 'utf8')
  .matchAll(/^ {2}\["([^"]+)", "(?:wash|valeting|detailing)"\],$/gm)].map((m) => '/' + m[1]);
if (PLANNED.length === 0) throw new Error('verify: no planned locations parsed');

/* The 301 table, read out of the TypeScript rather than imported from it —
   this is a .mjs script and that is a .ts module. Two files, because the 127
   location moves are spread into the table from lib/location-moves.ts rather
   than written out in it, and a regex over one file would miss them.

   Every path is bare, as both files now write them: `trailingSlash` is off, so
   that is the form the rules match and the form a route is keyed by here.

   The sources drive the sitemap count: the sitemap deliberately leaves them
   out, so without them it compares against every page in the mirror and is
   permanently wrong. The destinations drive the check below. */
const lib = (name) => path.join(path.dirname(PAGES_JSON), '../lib/' + name);
const REDIRECT_PAIRS = [
  ...[...fs
    .readFileSync(lib('redirects.ts'), 'utf8')
    .matchAll(/\["(\/[^"]*)", "(\/[^"]*)"\]/g)].map((m) => [m[1], m[2]]),
  ...[...fs
    .readFileSync(lib('location-moves.ts'), 'utf8')
    .matchAll(/^ {2}\["([^"]+)", "([^"]+)"\],$/gm)].map((m) => [`/${m[1]}`, `/${m[2]}`]),
];
if (REDIRECT_PAIRS.length < 150) throw new Error('verify: redirect table parsed short');
const REDIRECTED = new Set(REDIRECT_PAIRS.map(([from]) => from));

const routes = new Set([
  '/',
  ...Object.keys(pages).filter(Boolean).map((s) => '/' + s),
  ...EXTRA_ROUTES,
  ...PLANNED,
]);

/* A redirect that lands on a 404 is worse than no redirect: it spends a
   crawler's budget to arrive nowhere, and it looks like it worked. Static, so
   it fails before a single page is fetched. */
const strandedTargets = REDIRECT_PAIRS
  .map(([, to]) => to)
  .filter((to) => !routes.has(to.replace(/\/$/, '') || '/'));
if (strandedTargets.length)
  throw new Error(
    `verify: ${strandedTargets.length} redirect target(s) have no route, e.g. ${strandedTargets[0]}`,
  );

/* Links that are already broken on medusaautodetailing.co.uk (verified 404
   there), so reproducing them is correct clone behaviour, not a defect. */
const DEAD_ON_SOURCE = new Set([
  '/interior-valet',
  '/mould-odour-removal',
  '/tritone-interior-detail',
  '/medusa-gold-detail',
  '/neptune-exterior-detail',
  '/summer-winter-protection',
  '/pandora-maintenance-valet',
  '/services',
]);

/* Pages with no <h1> on the live site either: all Elementor-built blog posts,
   plus aircraft cleaning (verified — it opens straight into an <h2>). The
   second arm was written against the live site's own /aircraft-cleaning/ and
   stopped matching when the page moved under /commercial-valeting/, which is
   why this check has been reporting it ever since. */
const NO_H1_ON_SOURCE = /^\/(20\d\d\/|commercial-valeting\/aircraft-cleaning$)/;

const badStatus = [];
const noH1 = [];
/** Characters of non-link prose inside <main> that a real page must clear. */
const THIN = 500;

/*
  Three routes are short on purpose and always will be.

  /blog is an index: 4,900 characters of text, effectively all of it inside the
  post cards' own anchors. /contact-us is a form and an address. /gift-card is
  the source's own page — four sentences over a purchase widget.
*/
const THIN_BY_DESIGN = /^\/(blog|contact-us|gift-card)$/;

const thin = [];
const badSchema = [];
const deadLinks = new Map();   // href -> [pages]
const missingImgs = new Map(); // src  -> [pages]

const imgExists = (() => {
  const cache = new Map();
  return (src) => {
    if (cache.has(src)) return cache.get(src);
    const ok = fs.existsSync(path.join(PUBLIC, decodeURIComponent(src)));
    cache.set(src, ok);
    return ok;
  };
})();

const add = (map, key, page) => {
  if (!map.has(key)) map.set(key, []);
  const arr = map.get(key);
  if (arr.length < 4) arr.push(page);
};

/*
  The BreadcrumbList — see src/lib/breadcrumbs.ts. One per page and none on the
  homepage; positions 1…n; Home first and the page itself last; every item an
  absolute URL on this site that is a route here; each rung the one above's
  child, except a blog post, whose parent is /blog; and no name still carrying
  a WordPress entity, which JSON-LD does not decode.
*/
const SITE = 'https://medusaautodetailing.co.uk';
function breadcrumbIssues(route, graphs) {
  const lists = graphs.filter((n) => n['@type'] === 'BreadcrumbList');
  if (route === '/') return lists.length ? ['breadcrumb on the homepage'] : [];
  if (lists.length !== 1) return [`${lists.length} BreadcrumbLists`];
  const items = lists[0].itemListElement ?? [];
  const out = [];
  if (items.length < 2) out.push('breadcrumb shorter than 2');
  items.forEach((it, i) => {
    if (it.position !== i + 1) out.push(`breadcrumb position ${it.position} at ${i + 1}`);
    if (!it.name?.trim() || /&#?\w+;/.test(it.name)) out.push(`breadcrumb name "${it.name}"`);
    if (typeof it.item !== 'string' || !it.item.startsWith(SITE + '/')) {
      out.push(`breadcrumb item "${it.item}"`);
      return;
    }
    const path = it.item.slice(SITE.length);
    if (!routes.has(path) || REDIRECTED.has(path)) out.push(`breadcrumb item ${path} is not a live route`);
    if (i > 0) {
      const parent = items[i - 1].item.slice(SITE.length);
      const blogPost = parent === '/blog' && /^\/\d{4}\/\d{2}\/\d{2}\//.test(path);
      if (!blogPost && !(parent === '/' || path.startsWith(parent + '/'))) {
        out.push(`breadcrumb ${path} is not a child of ${parent}`);
      }
    }
  });
  if (items[0]?.item !== SITE + '/') out.push('breadcrumb does not start at Home');
  if (items.at(-1)?.item !== SITE + route) out.push('breadcrumb does not end on the page');
  return out;
}

const all = [...routes];
const CONC = 8;
let done = 0;

async function check(route) {
  let res, html;
  try {
    res = await fetch(BASE + route);
    html = await res.text();
  } catch (e) {
    badStatus.push(`${route} :: ${e.message}`);
    return;
  }
  if (!res.ok) { badStatus.push(`${route} :: HTTP ${res.status}`); return; }

  if (!/<h1[\s>]/i.test(html) && !NO_H1_ON_SOURCE.test(route)) noH1.push(route);

  /*
    Prose inside <main>, with link text removed.

    This used to measure the whole document against 1200 characters, and the
    whole document includes the navigation, the footer, the footer's location
    strip and the A-Z index — several thousand characters of link text on every
    page, which no page could fall below. It reported `thin pages: 0` while
    /our-locations/city-of-westminster was going out with an h1 reading "Our
    Locations" and three words under it (built properly on 2026-09-22, in
    content/overrides.ts).

    Anchors go because a list of place names is navigation, not copy; <main>
    because the header and footer are identical on all 306 routes.
  */
  const main = (html.match(/<main[\s\S]*?<\/main>/i) || [''])[0];
  const bodyText = main
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<a\b[^>]*>[\s\S]*?<\/a>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  if (bodyText.length < THIN && !THIN_BY_DESIGN.test(route)) {
    thin.push(`${route} (${bodyText.length} chars)`);
  }

  // structured data: must parse, and must name the page in a WebPage node
  const ld = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)];
  if (!ld.length) {
    badSchema.push(`${route} :: no JSON-LD`);
  } else {
    try {
      const graphs = ld.flatMap((m) => {
        const j = JSON.parse(m[1].replace(/\\u003c/g, '<'));
        return j['@graph'] ?? [j];
      });
      if (!graphs.some((n) => n['@type'] === 'WebPage')) {
        badSchema.push(`${route} :: no WebPage node`);
      }
      // A 301'd source lands on another page's trail; that page is checked in its own right.
      if (!res.redirected) {
        for (const issue of breadcrumbIssues(route, graphs)) badSchema.push(`${route} :: ${issue}`);
      }
    } catch (e) {
      badSchema.push(`${route} :: unparseable (${e.message})`);
    }
  }

  // internal links
  for (const m of html.matchAll(/href="(\/[^"#?]*)"/g)) {
    let href = m[1];
    if (href.startsWith('/assets/') || href.startsWith('/_next/') || href.startsWith('/favicon')) continue;
    href = href.length > 1 ? href.replace(/\/$/, '') : href;
    if (!routes.has(href) && !DEAD_ON_SOURCE.has(href)) add(deadLinks, href, route);
  }

  // images
  for (const m of html.matchAll(/(?:src|srcSet)="([^"]*\/assets\/[^"]*)"/g)) {
    const raw = m[1];
    const src = raw.includes('/_next/image')
      ? decodeURIComponent((raw.match(/url=([^&]+)/) || [])[1] || '')
      : raw.split('?')[0];
    if (src.startsWith('/assets/') && !imgExists(src)) add(missingImgs, src, route);
  }

  // background-image: url(/assets/...)
  for (const m of html.matchAll(/url\((\/assets\/[^)"']+)\)/g)) {
    if (!imgExists(m[1])) add(missingImgs, m[1], route);
  }

  if (++done % 50 === 0) console.log(`  ${done}/${all.length}`);
}

for (let i = 0; i < all.length; i += CONC) {
  await Promise.all(all.slice(i, i + CONC).map(check));
}

/* ── site-level SEO surfaces ──────────────────────────────────────────── */

const seo = [];

async function checkSeo() {
  const sitemap = await fetch(BASE + '/sitemap.xml');
  if (!sitemap.ok) seo.push(`/sitemap.xml :: HTTP ${sitemap.status}`);
  else {
    const xml = await sitemap.text();
    const locs = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
    // every route the site serves, minus the ones that only 301
    const want =
      Object.keys(pages).filter((s) => !REDIRECTED.has(`/${s}`)).length +
      EXTRA_ROUTES.length +
      PLANNED.length;
    if (locs.length !== want) seo.push(`/sitemap.xml :: ${locs.length} urls, expected ${want}`);
    const strays = locs
      .map((u) => new URL(u).pathname.replace(/\/$/, '') || '/')
      .filter((p) => !routes.has(p));
    if (strays.length) seo.push(`/sitemap.xml :: ${strays.length} urls with no route (${strays[0]})`);
    /* Every URL carries a date: app/sitemap.ts falls back from dateModified to
       datePublished for the 19 posts the mirror never dated, the hubs take the
       newest of the pages they are built from, and the 49 planned locations
       take their hub's. A <url> with no <lastmod> is a kind of page that got
       past all three. */
    const undated = [...xml.matchAll(/<url>([\s\S]*?)<\/url>/g)].filter(
      (m) => !m[1].includes('<lastmod>'),
    );
    if (undated.length) seo.push(`/sitemap.xml :: ${undated.length} urls with no lastmod`);
  }

  const robots = await fetch(BASE + '/robots.txt');
  if (!robots.ok) seo.push(`/robots.txt :: HTTP ${robots.status}`);
  else {
    const txt = await robots.text();
    if (!/Sitemap:/i.test(txt)) seo.push('/robots.txt :: no Sitemap line');
    /* The cache flush and the build stamp. Neither answers a GET with anything
       indexable, and a purge endpoint in a crawl log is nobody's idea of a
       good time. */
    if (!/^Disallow: \/api\/$/m.test(txt)) seo.push('/robots.txt :: /api/ is crawlable');
  }

  const missing = await fetch(BASE + '/definitely-not-a-real-page');
  if (missing.status !== 404) seo.push(`404 handling :: HTTP ${missing.status}, expected 404`);
  else if (!/<h1[\s>]/i.test(await missing.text())) seo.push('404 handling :: no <h1> on the 404 page');
}

await checkSeo();

const line = (t) => console.log('\n' + t + '\n' + '-'.repeat(t.length));
console.log(`\nchecked ${all.length} routes against ${BASE}`);

line(`bad status: ${badStatus.length}`);
badStatus.slice(0, 15).forEach((s) => console.log('  ' + s));

line(`missing <h1>: ${noH1.length}`);
noH1.slice(0, 15).forEach((s) => console.log('  ' + s));

line(`thin pages: ${thin.length}`);
thin.slice(0, 15).forEach((s) => console.log('  ' + s));

line(`dead internal links: ${deadLinks.size}`);
[...deadLinks.entries()].slice(0, 25).forEach(([h, ps]) => console.log(`  ${h}  <- ${ps.join(', ')}`));

line(`missing images: ${missingImgs.size}`);
[...missingImgs.entries()].slice(0, 20).forEach(([s, ps]) => console.log(`  ${s}  <- ${ps.join(', ')}`));

line(`bad structured data: ${badSchema.length}`);
badSchema.slice(0, 15).forEach((s) => console.log('  ' + s));

line(`SEO surfaces: ${seo.length}`);
seo.forEach((s) => console.log('  ' + s));

const clean =
  !badStatus.length && !noH1.length && !deadLinks.size && !missingImgs.size &&
  !badSchema.length && !seo.length;
console.log('\n' + (clean ? 'ALL CLEAN' : 'ISSUES FOUND'));
