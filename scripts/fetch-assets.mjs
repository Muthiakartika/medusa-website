import fs from 'node:fs';
import path from 'node:path';
import { ASSETS as ROOT, CACHE, SITE, UA, UPLOADS as PREFIX } from './paths.mjs';

const LIST = path.join(CACHE, 'page-images.txt');

const urls = [...new Set(
  fs.readFileSync(LIST, 'utf8').split('\n').map((s) => s.trim()).filter(Boolean),
)];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

let ok = 0, skip = 0, fail = 0, bytes = 0;
const failures = [];

async function grab(u) {
  const rel = decodeURIComponent(u.slice(PREFIX.length));
  const abs = path.join(ROOT, rel);
  if (fs.existsSync(abs) && fs.statSync(abs).size > 0) { skip++; return; }
  fs.mkdirSync(path.dirname(abs), { recursive: true });
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const res = await fetch(u, { headers: { 'User-Agent': UA, Referer: SITE + '/' } });
      if (!res.ok) throw new Error('HTTP ' + res.status);
      const buf = Buffer.from(await res.arrayBuffer());
      if (!buf.length) throw new Error('empty');
      fs.writeFileSync(abs, buf);
      ok++; bytes += buf.length;
      return;
    } catch (e) {
      if (attempt === 3) { fail++; failures.push(rel + ' :: ' + e.message); }
      else await sleep(800 * attempt);
    }
  }
}

const CONC = 6;
for (let i = 0; i < urls.length; i += CONC) {
  await Promise.all(urls.slice(i, i + CONC).map(grab));
  if ((i / CONC) % 12 === 0) console.log(`${Math.min(i + CONC, urls.length)}/${urls.length}  ok=${ok} skip=${skip} fail=${fail}`);
}

console.log(`\nDONE ok=${ok} skip=${skip} fail=${fail} of ${urls.length}  (${(bytes / 1048576).toFixed(1)}MB new)`);
if (failures.length) console.log('FAILURES:\n' + failures.join('\n'));
