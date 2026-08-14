/**
 * Crawls every generated route on the running dev/prod server and checks:
 *   - HTTP 200
 *   - page has an <h1> and non-trivial body text
 *   - every internal link points at a route that actually exists
 *   - every referenced /assets image exists on disk
 *   - each page carries a parseable JSON-LD graph
 * Then checks the site-level SEO surfaces: sitemap, robots, and the 404.
 */
import fs from 'node:fs';
import path from 'node:path';
import { PAGES_JSON, PUBLIC } from './paths.mjs';

const BASE = process.env.BASE || 'http://localhost:3000';

const pages = JSON.parse(fs.readFileSync(PAGES_JSON, 'utf8'));
const routes = new Set([
  '/',
  ...Object.keys(pages).filter(Boolean).map((s) => '/' + s),
  '/ceramic-coating', // 301 -> /car-ceramic-paint-protection, same as live
]);

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
   plus /aircraft-cleaning (verified — it opens straight into an <h2>). */
const NO_H1_ON_SOURCE = /^\/(20\d\d\/|aircraft-cleaning$)/;

const badStatus = [];
const noH1 = [];
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

  const bodyText = html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  if (bodyText.length < 1200) thin.push(`${route} (${bodyText.length} chars)`);

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
    // every page in pages.json, and nothing that isn't a real route
    const want = Object.keys(pages).length;
    if (locs.length !== want) seo.push(`/sitemap.xml :: ${locs.length} urls, expected ${want}`);
    const strays = locs
      .map((u) => new URL(u).pathname.replace(/\/$/, '') || '/')
      .filter((p) => !routes.has(p));
    if (strays.length) seo.push(`/sitemap.xml :: ${strays.length} urls with no route (${strays[0]})`);
  }

  const robots = await fetch(BASE + '/robots.txt');
  if (!robots.ok) seo.push(`/robots.txt :: HTTP ${robots.status}`);
  else if (!/Sitemap:/i.test(await robots.text())) seo.push('/robots.txt :: no Sitemap line');

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
