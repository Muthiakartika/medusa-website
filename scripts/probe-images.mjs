/**
 * Fills in real pixel dimensions for every image in pages.json.
 *
 * next/image needs width+height, and the source HTML often omits them. Beyond
 * the image blocks it also stamps the ones nothing else measures: the row
 * background photographs and the page's own OG image. The page frames pick a
 * header photograph between those two, and without the numbers they were
 * choosing blind — four valeting pages ran a 720x720 square across a 1270px
 * band while a 1650x1275 photograph of the same page sat unused.
 *
 * Also drops image blocks whose file failed to download.
 */
import fs from 'node:fs';
import path from 'node:path';
import { imageSize } from 'image-size';
import { PAGES_JSON as PAGES, PUBLIC } from './paths.mjs';

const pages = JSON.parse(fs.readFileSync(PAGES, 'utf8'));
const cache = new Map();

function dims(src) {
  if (cache.has(src)) return cache.get(src);
  const abs = path.join(PUBLIC, decodeURIComponent(src));
  let out = null;
  try {
    const { width, height } = imageSize(fs.readFileSync(abs));
    if (width && height) out = { w: width, h: height };
  } catch {
    out = null;
  }
  cache.set(src, out);
  return out;
}

let filled = 0, kept = 0, dropped = 0;
const missing = new Set();

/** blocks nest inside `columns` blocks, so this has to recurse */
function fix(blocks) {
  return blocks.filter((b) => {
    if (b.type === 'columns') {
      b.cols = b.cols.map(fix);
      return b.cols.some((c) => c.length);
    }
    if (b.type !== 'image') return true;
    const d = dims(b.src);
    if (!d) { dropped++; missing.add(b.src); return false; }
    if (!b.w || !b.h || b.w !== d.w || b.h !== d.h) { b.w = d.w; b.h = d.h; filled++; }
    else kept++;
    return true;
  });
}

let backgrounds = 0;
let ogs = 0;

for (const page of Object.values(pages)) {
  for (const section of page.sections) section.blocks = fix(section.blocks);

  // Row backgrounds: verify the file exists, and record how big it is.
  for (const section of page.sections) {
    if (!section.bg?.image) continue;
    const d = dims(section.bg.image);
    if (!d) {
      missing.add(section.bg.image);
      delete section.bg.image;
      continue;
    }
    section.bg.w = d.w;
    section.bg.h = d.h;
    backgrounds++;
  }

  // The page's own OG image, the other candidate for a header photograph.
  if (page.ogImage) {
    const d = dims(page.ogImage);
    if (d) {
      page.ogW = d.w;
      page.ogH = d.h;
      ogs++;
    } else {
      missing.add(page.ogImage);
    }
  }
}

fs.writeFileSync(PAGES, JSON.stringify(pages, null, 1), 'utf8');
console.log(`image blocks: ${filled} dimensions filled, ${kept} already correct, ${dropped} dropped (file missing)`);
console.log(`measured: ${backgrounds} row backgrounds, ${ogs} OG images`);
if (missing.size) {
  console.log(`\nmissing files (${missing.size}):`);
  console.log([...missing].slice(0, 20).join('\n'));
}
