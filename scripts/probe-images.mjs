/**
 * Fills in real pixel dimensions for every image block in pages.json.
 * next/image needs width+height, and the source HTML often omits them.
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

for (const page of Object.values(pages)) {
  for (const section of page.sections) section.blocks = fix(section.blocks);
  // section background images: verify they exist too
  for (const section of page.sections) {
    if (section.bg?.image && !dims(section.bg.image)) {
      missing.add(section.bg.image);
      delete section.bg.image;
    }
  }
}

fs.writeFileSync(PAGES, JSON.stringify(pages, null, 1), 'utf8');
console.log(`image blocks: ${filled} dimensions filled, ${kept} already correct, ${dropped} dropped (file missing)`);
if (missing.size) {
  console.log(`\nmissing files (${missing.size}):`);
  console.log([...missing].slice(0, 20).join('\n'));
}
