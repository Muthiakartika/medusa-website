/**
 * Mirrors every URL in the source site's sitemaps into .cache/html/.
 * Run this first if .cache/html is empty; extract-content.mjs reads from it.
 */
import fs from 'node:fs';
import path from 'node:path';
import { CACHE, HTML, SITE, UA } from './paths.mjs';

fs.mkdirSync(HTML, { recursive: true });

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const get = (u) => fetch(u, { headers: { 'User-Agent': UA, 'Accept-Language': 'en-GB,en' } });

async function sitemapUrls() {
  const out = [];
  for (const name of ['page-sitemap.xml', 'post-sitemap.xml']) {
    const xml = await (await get(`${SITE}/${name}`)).text();
    const locs = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
    fs.writeFileSync(path.join(CACHE, name.replace('.xml', '.txt')), locs.join('\n'), 'utf8');
    out.push(...locs);
  }
  return [...new Set(out)];
}

/** .../our-locations/harrow/ -> our-locations__harrow.html */
const fileOf = (u) => {
  const p = new URL(u).pathname.replace(/^\/|\/$/g, '');
  return (p === '' ? 'index' : p.replace(/\//g, '__')) + '.html';
};

const urls = await sitemapUrls();
console.log(`sitemap lists ${urls.length} urls`);

let ok = 0, skip = 0, fail = 0;
const failures = [];

async function grab(u) {
  const dest = path.join(HTML, fileOf(u));
  if (fs.existsSync(dest) && fs.statSync(dest).size > 5000) { skip++; return; }
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const res = await get(u);
      if (!res.ok) throw new Error('HTTP ' + res.status);
      const html = await res.text();
      if (html.length < 5000) throw new Error('too short ' + html.length);
      fs.writeFileSync(dest, html, 'utf8');
      ok++;
      return;
    } catch (e) {
      if (attempt === 3) { fail++; failures.push(u + ' :: ' + e.message); }
      else await sleep(1200 * attempt);
    }
  }
}

const CONC = 4;
for (let i = 0; i < urls.length; i += CONC) {
  await Promise.all(urls.slice(i, i + CONC).map(grab));
  await sleep(250); // be polite to the origin
  if ((i / CONC) % 10 === 0) console.log(`  ${Math.min(i + CONC, urls.length)}/${urls.length}  ok=${ok} skip=${skip} fail=${fail}`);
}

console.log(`\nDONE ok=${ok} skip=${skip} fail=${fail} of ${urls.length}`);
if (failures.length) console.log('FAILURES:\n' + failures.join('\n'));
