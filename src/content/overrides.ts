import type { Block, Page, Section } from "@/lib/blocks";
import { AWP, PATH as ALLOY_WHEEL_PATH, PHOTOS as ALLOY_WHEEL_PHOTOS } from "@/lib/alloy-wheel-protection";
import { LOCAL_PLACES } from "@/lib/local-copy";
import { MOTORCYCLE, PHOTOS as MOTORCYCLE_PHOTOS } from "@/lib/motorcycle";
import { GUIDE, VOMIT, PHOTOS as VOMIT_PHOTOS } from "@/lib/vomit-cleaning";
import {
  PATH as PET_HAIR_PATH,
  PET_HAIR,
  PHOTOS as PET_HAIR_PHOTOS,
  TRITON_EXTRA,
} from "@/lib/pet-hair-removal";
import { ODOUR, PATH as ODOUR_PATH, PHOTOS as ODOUR_PHOTOS, VALET_EXTRA } from "@/lib/odour-removal";
import { REBUILD as CARAVAN_REBUILD } from "@/lib/caravan-cleaning";
import { PATH as WAX_PATH, REBUILD as WAX_REBUILD } from "@/lib/car-wax";
import { REBUILD as ENGINE_REBUILD } from "@/lib/engine-bay";
import { PATH as FLOOD_PATH, REBUILD as FLOOD_REBUILD } from "@/lib/flooded-car";
import { REBUILD as GRAFFITI_REBUILD } from "@/lib/graffiti-removal";
import { REBUILD as HEADLIGHT_REBUILD } from "@/lib/headlight";
import { REBUILD as PAINT_REBUILD } from "@/lib/paint-spill";
import { REBUILD as STEAM_REBUILD } from "@/lib/steam-cleaning";
import { SIGNAGE, PHOTOS as SIGNAGE_PHOTOS } from "@/lib/signage-removal";
import { CONTACT } from "@/lib/site";
import {
  MIRROR_AUDIT,
  MIRROR_FIXES,
  MIRROR_REST,
  applyMirrorEdits,
  districtsRow,
  promoteSections,
} from "@/lib/local-mirror";

/**
 * Corrections applied on top of `pages.json`.
 *
 * `pages.json` is a mirror of the live WordPress site: `npm run content`
 * rewrites it wholesale from `.cache/html`, so anything typed into it by hand
 * is lost on the next regeneration. Two kinds of change therefore live here.
 *
 * Most of it is what the **client** asked for and the live site has not made
 * yet — new prices, two retired wash packages, a renamed add-on.
 *
 * The rest is what **this build does better than the mirror** and the mirror
 * would undo: the hero video is transcoded here, and the mirror only knows the
 * source `.mov`.
 *
 * Rules are therefore written against the *shape* of the content ("the four
 * price headings after the TRITON heading"), never against array indices,
 * which a regeneration would shift.
 *
 * Source: "Website changes.docx", 2026-09-06. The item number in each rule's
 * comment is that document's numbering.
 *
 * When the live site catches up, delete the rule rather than editing it: the
 * next `npm run content` will bring the same value in from the mirror.
 */

/* ── Walking the block tree ───────────────────────────────────────────── */

/** Every block on a page, columns recursed into, in document order. */
function flatten(blocks: Block[], into: Block[] = []): Block[] {
  for (const b of blocks) {
    if (b.type === "columns") b.cols.forEach((c) => flatten(c, into));
    else into.push(b);
  }
  return into;
}

const allBlocks = (page: Page) =>
  page.sections.reduce<Block[]>((acc, s) => flatten(s.blocks, acc), []);

/** Visit every `columns` block, its own children included. */
function eachColumns(blocks: Block[], fn: (b: Extract<Block, { type: "columns" }>) => void) {
  for (const b of blocks) {
    if (b.type !== "columns") continue;
    fn(b);
    b.cols.forEach((c) => eachColumns(c, fn));
  }
}

const isPrice = (b: Block | undefined): b is Extract<Block, { type: "heading" }> =>
  b?.type === "heading" && /^\s*£\s?[\d,]/.test(b.text);

/**
 * Entities back to characters. Breadcrumb names are stored as WordPress wrote
 * them — "Mould Sanitisation &#038; Sterilisation Service" — and a button
 * label is rendered as text, not as HTML, so an undecoded one ships literally.
 */
export const decodeEntities = (s: string): string =>
  s
    .replace(/&nbsp;/gi, " ")
    .replace(/&#x([0-9a-f]+);/gi, (_, hex) => String.fromCodePoint(parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_, dec) => String.fromCodePoint(Number(dec)))
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#0?39;|&apos;/gi, "'")
    .replace(/&amp;/gi, "&");

/** The text a block carries, entities and markup stripped. */
const plain = (b: Block): string => {
  const html =
    b.type === "heading" ? b.text : b.type === "paragraph" ? b.html : "";
  return decodeEntities(html.replace(/<[^>]+>/g, " "))
    .replace(/\s+/g, " ")
    .trim();
};

/* ── Editing primitives ───────────────────────────────────────────────── */

/** Rewrite every string a block carries. */
function mapStrings(block: Block, fn: (s: string) => string) {
  switch (block.type) {
    case "heading":
      block.text = fn(block.text);
      break;
    case "paragraph":
      block.html = fn(block.html);
      break;
    case "list":
      block.items = block.items.map(fn);
      break;
    case "table":
      block.rows = block.rows.map((row) => row.map(fn));
      break;
    case "faq":
      block.items = block.items.map((i) => ({ q: fn(i.q), a: i.a.map(fn) }));
      break;
  }
}

/** A literal swap across every block below `blocks`. Asserts it landed. */
function swap(blocks: Block[], from: string, to: string, atLeast = 1) {
  let hits = 0;
  const run = (bs: Block[]) => {
    for (const b of bs) {
      if (b.type === "columns") {
        b.cols.forEach(run);
        continue;
      }
      mapStrings(b, (s) => {
        if (!s.includes(from)) return s;
        hits += s.split(from).length - 1;
        return s.split(from).join(to);
      });
    }
  };
  run(blocks);
  if (hits < atLeast) {
    throw new Error(`content override: "${from}" not found (expected ${atLeast})`);
  }
}

/**
 * Drop whole columns from every `columns` block on the page, and any column
 * the source already left empty. Spans are left alone: `Blocks.tsx` spreads a
 * row whose spans no longer reach 12 across the full width.
 */
function dropColumns(page: Page, unwanted: (col: Block[]) => boolean) {
  for (const section of page.sections) {
    eachColumns(section.blocks, (block) => {
      const keep = block.cols
        .map((col, i) => ({ col, span: block.spans[i] ?? 12 }))
        .filter(({ col }) => col.length > 0 && !unwanted(col));
      block.cols = keep.map((k) => k.col);
      block.spans = keep.map((k) => k.span);
    });
  }
}

/** The column whose leading heading is exactly `name`. */
const headed = (name: string) => (col: Block[]) =>
  col.some((b) => b.type === "heading" && plain(b).toUpperCase() === name);

/** The array and index a block was found at, so the caller can splice it. */
function locate(blocks: Block[], pred: (b: Block) => boolean): [Block[], number] | null {
  for (let i = 0; i < blocks.length; i++) {
    if (pred(blocks[i])) return [blocks, i];
    const b = blocks[i];
    if (b.type === "columns") {
      for (const col of b.cols) {
        const found = locate(col, pred);
        if (found) return found;
      }
    }
  }
  return null;
}

/** Splice new blocks in immediately before the first block matching `pred`. */
function insertBefore(page: Page, pred: (b: Block) => boolean, newBlocks: Block[]) {
  for (const section of page.sections) {
    const found = locate(section.blocks, pred);
    if (found) {
      const [blocks, i] = found;
      blocks.splice(i, 0, ...newBlocks);
      return;
    }
  }
  throw new Error("content override: insertBefore found nothing to insert before");
}

/** A "Read More" link — the label the source gives every package tile. */
const isReadMore = (b: Block): b is Extract<Block, { type: "button" }> =>
  b.type === "button" && /^\s*read\s+more\s*$/i.test(b.label);

/**
 * The site's own name for the page at `href`.
 *
 * Its breadcrumb tail, which is the short form the source itself uses in
 * navigation ("Ultimate Pre-Sale Valet", not the h1's "The Ultimate Pre-Sale
 * Valet in London"). Nothing is written here that the site does not already
 * say about itself, so a regeneration keeps the labels in step with the page
 * titles rather than freezing a transcription of them.
 */
function pageName(pages: Record<string, Page>, href: string): string | null {
  if (!href.startsWith("/")) return null;
  const page = pages[href.replace(/^\/+|\/+$/g, "")];
  if (!page) return null;
  const tail = page.breadcrumb?.[page.breadcrumb.length - 1]?.name;
  return decodeEntities(tail || page.h1).replace(/\s+/g, " ").trim() || null;
}

/**
 * Label each "Read More" with the page it opens.
 *
 * Client, 2026-09-14: "could we name these buttons the names of the pages they
 * lead into". A tile row hands the reader seven identical pills, and on a phone
 * — where the tiles stack and the buttons go full width — a pill is often all
 * that is on screen. Naming them is also the plainest fix for the oldest link
 * anti-pattern there is: "Read More" out of context tells a screen reader
 * nothing about where it goes.
 *
 * Only internal links are touched, and only ones that resolve to a page this
 * build actually carries; an unresolved one is left as it was rather than
 * guessed at.
 */
function nameReadMoreLinks(page: Page, pages: Record<string, Page>): number {
  let hits = 0;
  const run = (blocks: Block[]) => {
    for (const b of blocks) {
      if (b.type === "columns") {
        b.cols.forEach(run);
        continue;
      }
      if (!isReadMore(b)) continue;
      const name = pageName(pages, b.href);
      if (!name) continue;
      b.label = name;
      hits++;
    }
  };
  page.sections.forEach((s) => run(s.blocks));
  return hits;
}

/**
 * Give each package tile back the photograph it carries on the source.
 *
 * The source builds these tiles as WPBakery *column* backgrounds — a
 * `.column-image-bg` inside the cell, behind a gold wash — and
 * `extract-content.mjs` only reads `data-bg` off the `.column-image-bg-wrap`
 * around it. So every one of them is dropped, and the row extracts as bare
 * headings over a flat band: the weakest section on the page, and the one the
 * client pointed at.
 *
 * The image goes at the head of the cell, which is the shape `asCardRow` is
 * looking for. The source's two rows (three tiles, then four) then merge into
 * one grid of seven cards with a shared height and a shared button baseline,
 * the same treatment `/mobile-car-wash`'s packages already get.
 *
 * Keyed on the tile's own "Read More" href rather than on a position, so
 * resplitting or reordering the rows cannot mis-target one. Every file is
 * already committed under `public/assets` — `fetch-assets.mjs` met them all
 * elsewhere on the site.
 */
function restoreTilePhotos(page: Page, photos: Record<string, TilePhoto>) {
  const placed = new Set<string>();
  for (const section of page.sections) {
    eachColumns(section.blocks, (block) => {
      block.cols.forEach((col, i) => {
        if (col[0]?.type === "image") return;
        const link = col.find(isReadMore);
        const photo = link && photos[link.href];
        if (!link || !photo) return;
        block.cols[i] = [
          { type: "image", src: photo.src, alt: "", w: photo.w, h: photo.h },
          ...col,
        ];
        placed.add(link.href);
      });
    });
  }
  const missing = Object.keys(photos).filter((href) => !placed.has(href));
  if (missing.length) {
    throw new Error(`content override: no tile to photograph at ${missing.join(", ")}`);
  }
}

/**
 * One add-on mark the extractor did not recognise as a mark.
 *
 * `/car-valeting`'s "+ Add-on services" run carries 28 images. Twenty-seven are
 * the theme's `car-parts-icon-24-*` files at 339px square and arrive flagged
 * `icon`; the twenty-eighth — Autoglym HD Wax, uploaded on its own at 180px —
 * does not, so it renders at card width while its neighbours render as small
 * gold marks. It is the same line drawing in the same style, and the odd card
 * out was visible on the hub long before the location pages borrowed the row.
 *
 * Matched on the file, not a position, and it throws if the file is not there.
 */
function markAsIcon(page: Page, src: string) {
  let found = false;
  const walk = (blocks: Block[]) => {
    for (const b of blocks) {
      if (b.type === "columns") b.cols.forEach(walk);
      else if (b.type === "image" && b.src === src) {
        b.icon = true;
        found = true;
      }
    }
  };
  page.sections.forEach((s) => walk(s.blocks));
  if (!found) throw new Error(`content override: no image to mark as an icon at ${src}`);
}

type TilePhoto = { src: string; w: number; h: number };

/**
 * Replace the four vehicle-class prices that follow a package's heading.
 *
 * Anchored on the heading rather than a position because the same ladder is
 * repeated on 21 pages, and because a regeneration reorders nothing but can
 * add a block anywhere.
 */
function repriceLadder(page: Page, label: RegExp, prices: readonly number[]) {
  const blocks = allBlocks(page);
  let hits = 0;
  for (let i = 0; i < blocks.length; i++) {
    const b = blocks[i];
    if (b.type !== "heading" || !label.test(plain(b))) continue;
    let rung = 0;
    for (let j = i + 1; j < blocks.length && rung < prices.length; j++) {
      const price = blocks[j];
      if (!isPrice(price)) continue;
      // "£70" and "£70 p/m" both occur; keep whatever trails the number.
      price.text = price.text.replace(/£\s?[\d,]+/, `£${prices[rung]}`);
      rung++;
    }
    if (rung === prices.length) hits++;
  }
  if (!hits) throw new Error(`content override: no ladder under ${label}`);
}

/** Remove list items from the lists under a given heading. */
function dropListItems(page: Page, under: RegExp, unwanted: RegExp) {
  let hits = 0;
  const run = (bs: Block[]) => {
    let armed = false;
    for (const b of bs) {
      if (b.type === "columns") {
        b.cols.forEach(run);
        continue;
      }
      if (b.type === "heading") armed = under.test(plain(b));
      if (b.type === "list" && armed) {
        const kept = b.items.filter((i) => !unwanted.test(i));
        hits += b.items.length - kept.length;
        b.items = kept;
      }
    }
  };
  page.sections.forEach((s) => run(s.blocks));
  if (!hits) throw new Error(`content override: nothing to drop under ${under}`);
}

/**
 * Reprice one subscription product on the Car Lovers Club page.
 *
 * A product is a section whose first heading names it and whose second is
 * "Subscription Packages"; its `columns` block holds one cadence per column,
 * each a "from £x" line followed by the four-rung vehicle-class ladder.
 */
function repriceSubscription(
  page: Page,
  product: RegExp,
  cadences: readonly (readonly number[])[],
) {
  const section = page.sections.find((s: Section) => {
    const [first, second] = s.blocks;
    return (
      first?.type === "heading" &&
      product.test(plain(first)) &&
      second?.type === "heading" &&
      /subscription/i.test(plain(second))
    );
  });
  if (!section) throw new Error(`content override: no plans for ${product}`);

  const cols = section.blocks.find((b) => b.type === "columns");
  if (cols?.type !== "columns" || cols.cols.length !== cadences.length) {
    throw new Error(`content override: ${product} has no cadence columns`);
  }

  cols.cols.forEach((col, i) => {
    const prices = cadences[i];
    const blocks = flatten(col);
    // The lead-in reads "from £54 / month". It is the cheapest rung, so it
    // follows the small-car price rather than being quoted separately.
    const lead = blocks.find(
      (b) => b.type === "paragraph" && /from\s*£/i.test(plain(b)),
    );
    if (lead?.type === "paragraph") {
      lead.html = lead.html.replace(/£\s?[\d.,]+/, `£${prices[0]}`);
    }
    let rung = 0;
    for (const b of blocks) {
      if (!isPrice(b) || rung >= prices.length) continue;
      b.text = b.text.replace(/£\s?[\d,]+/, `£${prices[rung]}`);
      rung++;
    }
    if (rung !== prices.length) {
      throw new Error(`content override: ${product} cadence ${i} has ${rung} rungs`);
    }
  });
}

/**
 * Mark one feature included for Zeus on `/car-valeting`. The page carries
 * the same 52-feature list twice — once in the combined comparison matrix
 * (a header row naming all five packages, a "-"/"✔" column per package) and
 * once more in Zeus's own single-column table under "Our Packages"
 * (`PackageTabs.tsx`) — so both copies need the flip or the two views
 * disagree. The same row sits unmarked on Pandora's table too, which is why
 * the second pass is anchored on the "Zeus" heading rather than just any
 * single-package table carrying this label.
 */
function addToZeus(page: Page, featureLabel: string) {
  const blocks = allBlocks(page);
  let hits = 0;

  for (const block of blocks) {
    if (block.type !== "table") continue;
    const header = block.rows.find((r) => !r[0] && r.slice(1).some(Boolean));
    if (!header) continue; // a single-package table, not the matrix
    const row = block.rows.find((r) => r[0]?.trim() === featureLabel);
    if (!row) continue;
    const col = header.findIndex((cell) => /^zeus\b/i.test(cell));
    if (col < 1) throw new Error(`content override: no Zeus column for "${featureLabel}"`);
    if (row[col] !== "-") {
      throw new Error(`content override: matrix already has Zeus × "${featureLabel}"`);
    }
    row[col] = "✔";
    hits++;
  }

  for (let i = 0; i < blocks.length; i++) {
    const b = blocks[i];
    if (b.type !== "heading" || !/^zeus\b/i.test(plain(b))) continue;
    const table = blocks.slice(i + 1).find((x) => x.type === "table");
    if (table?.type !== "table") continue;
    const row = table.rows.find((r) => r[0]?.trim() === featureLabel);
    if (!row) continue;
    if (row[row.length - 1] !== "-") {
      throw new Error(`content override: Zeus's own table already has "${featureLabel}"`);
    }
    row[row.length - 1] = "✔";
    hits++;
  }

  if (hits !== 2) {
    throw new Error(
      `content override: expected to patch 2 tables for Zeus × "${featureLabel}", patched ${hits}`,
    );
  }
}

/**
 * The site's own per-vehicle-class price ladder — the same four icons and
 * "eg. <cars>" lines `car-valeting/mini-valet` already carries verbatim, not
 * new copy. `blocks-groups.tsx`'s `group()` collapses an
 * `icon → h3 → paragraph → £heading` run of two or more into a `PriceGrid`
 * on its own, so this only has to hand it the raw blocks in that shape.
 *
 * Item 6's "full price list" turned out to be per size, the same as every
 * other service, not per condition as `services.ts` assumed — confirmed
 * against this page's own FAQ ("prices vary depending on the size of the
 * vehicle") and against Mini Valet quoting the identical Silver Wash figures
 * for its own Small/Medium/Large/XL ladder.
 */
function pricingLadder(prices: readonly [number, number, number, number]): Block[] {
  const CLASSES = [
    { label: "Small Car", eg: "eg. Cooper/ Fiat 500/ Ford Ka/ Toyota yaris", icon: "24-01" },
    { label: "Medium Car", eg: "eg. VW Golf/ Audi A3/ Porsche Boxter/ BMW 1 Series", icon: "24-02" },
    { label: "Large Car", eg: "eg. Tesla Model S/ BMW 5 Series/ Porsche Macan", icon: "24-03" },
    { label: "XL Car", eg: "eg. BMW X5/ Volvo XC90/ Porsche Cayenne", icon: "24-04" },
  ] as const;

  const blocks: Block[] = [{ type: "heading", level: 2, text: "OUR PRICING" }];
  CLASSES.forEach((c, i) => {
    blocks.push(
      {
        type: "image",
        src: `/assets/2021/12/car-parts-icon-${c.icon}.png`,
        alt: "",
        icon: true,
        w: 339,
        h: 339,
      },
      { type: "heading", level: 3, text: c.label },
      { type: "paragraph", html: c.eg },
      { type: "heading", level: 2, text: `£${prices[i]}` },
    );
  });
  return blocks;
}

/** Every wash page's own "+ Add-on services" heading — where its price
 *  ladder belongs, ahead of the add-ons rather than after them. */
const addOnServices = (b: Block) => b.type === "heading" && /add-on services/i.test(plain(b));

/* ── The corrections themselves ───────────────────────────────────────── */

/** The retired wash tiers, item 2. Exact names — "EXTERIOR PLUS WASH" stays. */
const RETIRED_WASHES = ["BRONZE WASH", "EXTERIOR WASH"];

/**
 * The photograph behind each "MORE VALETING PACKAGES" tile on `/car-valeting`,
 * read off the source's own `.column-image-bg` for that cell — see
 * `restoreTilePhotos`. Sizes are the files on disk.
 */
const VALETING_TILES: Record<string, TilePhoto> = {
  "/car-valeting/deep-clean-full-valet": {
    src: "/assets/2020/11/20201116_141403.webp",
    w: 2016,
    h: 1512,
  },
  "/car-valeting/pre-sale-valet": {
    src: "/assets/2021/12/20210214_144341-scaled.webp",
    w: 2560,
    h: 1920,
  },
  "/car-interior-cleaning/mould-removal": {
    src: "/assets/2021/12/20210225_161935-scaled.webp",
    w: 2560,
    h: 1920,
  },
  "/car-valeting/summer-glow-valet": {
    src: "/assets/2022/01/shutterstock_552095587-min-scaled.webp",
    w: 2560,
    h: 1707,
  },
  "/car-valeting/winter-protection": {
    src: "/assets/2022/11/4-1.webp",
    w: 576,
    h: 576,
  },
  "/mobile-car-wash": {
    src: "/assets/2022/01/brad-starkey-eP8h7YVhFHk-unsplash-min-scaled.webp",
    w: 2560,
    h: 1707,
  },
  "/car-valeting/convertible-roof-cleaning": {
    src: "/assets/2023/08/3-a.webp",
    w: 1024,
    h: 768,
  },
  /* The two tiles added on 2026-09-22. Each page's own photograph: the mini
     valet's is the image the site already uses to represent it elsewhere, and
     the full valet's is its own lead picture — the two pages' OG images are
     the same file, so one of them had to come from somewhere else. */
  "/car-valeting/mini-valet": {
    src: "/assets/2024/10/Untitled-design-2.webp",
    w: 1650,
    h: 1275,
  },
  "/car-valeting/premium-full-valet": {
    src: "/assets/2024/10/Untitled-design-1-2-1650x770.webp",
    w: 1650,
    h: 770,
  },
};

/**
 * The two valeting services that join the row rather than standing under it.
 *
 * Client, 2026-09-22, against the gold "MORE VALETING PACKAGES" band: "for
 * car valeting page, add the to the existing area here". The first pass gave
 * them a band of their own below; this puts them where the client pointed, as
 * two more tiles in the shape the row's seven already have — `h2`, `h5`, Read
 * More, Book Now — which is exactly what lets `asCardRow` merge all nine into
 * one grid at one card size.
 *
 * Neither tile is written here. `title` is the client's own menu label, set in
 * the capitals every other title in this row is written in; the sentence under
 * it is the page's own opening paragraph, the same one a hub card borrows; the
 * Read More label is filled in later by `nameReadMoreLinks` from the page's own
 * breadcrumb; and the photograph is the page's own, named in `VALETING_TILES`
 * below so `restoreTilePhotos` places it with the other seven.
 *
 * The two pages share an OG image and a header background, so neither could be
 * picked by rule without printing the same photograph twice.
 */
const VALETING_EXTRA_TILES: { href: string; title: string }[] = [
  { href: "/car-valeting/mini-valet", title: "MINI VALET" },
  { href: "/car-valeting/premium-full-valet", title: "PREMIUM FULL VALET" },
];

/**
 * A page's opening paragraph — the first that is prose rather than a phone
 * number. The same test `lib/hub.ts` applies when it borrows one for a card;
 * it cannot be imported from there, because `blocks.ts` imports this file.
 */
function openingParagraph(page: Page): string | null {
  for (const b of allBlocks(page)) {
    if (b.type !== "paragraph") continue;
    if (/href="tel:/i.test(b.html)) continue;
    if (plain(b).length < 90) continue;
    return b.html;
  }
  return null;
}

/**
 * Append tiles to the package row, in the row's own cell shape.
 *
 * The row is found by a tile it already holds rather than by position, so a
 * regeneration that moves it cannot put these two somewhere else. Throws when
 * the row, a page or its opening paragraph has gone.
 */
function addPackageTiles(
  page: Page,
  pages: Record<string, Page>,
  tiles: { href: string; title: string }[],
  anchor: string,
) {
  let row: Extract<Block, { type: "columns" }> | null = null;
  for (const section of page.sections) {
    eachColumns(section.blocks, (block) => {
      if (block.cols.some((col) => col.some((b) => isReadMore(b) && b.href === anchor))) {
        row = block;
      }
    });
  }
  if (!row) throw new Error(`content override: no package row holding ${anchor}`);
  const target: Extract<Block, { type: "columns" }> = row;

  /* The booking link the row's own tiles carry, rather than a constant from
     elsewhere: whatever the source books through, these two book through. */
  const bookNow = target.cols
    .flat()
    .find((b): b is Extract<Block, { type: "button" }> =>
      b.type === "button" && /^\s*book\s+now\s*$/i.test(b.label),
    );
  if (!bookNow) throw new Error("content override: no Book Now in the package row");

  for (const tile of tiles) {
    const child = pages[tile.href.split("/").filter(Boolean).join("/")];
    if (!child) throw new Error(`content override: no page at ${tile.href}`);
    const blurb = openingParagraph(child);
    if (!blurb) throw new Error(`content override: no opening paragraph on ${tile.href}`);

    target.cols.push([
      { type: "heading", level: 2, text: tile.title },
      { type: "heading", level: 5, text: plain({ type: "paragraph", html: blurb }) },
      { type: "button", label: "READ MORE", href: tile.href },
      { type: "button", label: bookNow.label, href: bookNow.href },
    ]);
    target.spans.push(target.spans[target.spans.length - 1] ?? 3);
  }
}

/**
 * Drop `/car-detailing`'s bare LEVEL 1–5 row.
 *
 * Client, 2026-09-22: "remove the level 1 2 3 4 5, its a duplicate". It is:
 * five cells of nothing but `LEVEL n` and the package name, both linking to
 * the same pages the price cards higher up the page already link to, and the
 * descriptions between them say it a third time. It also carries a source
 * error the other two rows do not — its LEVEL 2 is labelled ENHANCEMENT,
 * which is LEVEL 3's name.
 *
 * Matched on shape, never on position: a cell of exactly an h3 reading
 * "LEVEL n" and an h4, with nothing else in it. The priced row's cells carry
 * an icon, four classes and two buttons besides, so they cannot match.
 */
function dropBareLevelRow(page: Page) {
  let dropped = false;
  for (const section of page.sections) {
    section.blocks = section.blocks.filter((b) => {
      if (b.type !== "columns" || b.cols.length < 2) return true;
      const bare = b.cols.every((col) => {
        const solid = col.filter((x) => !(x.type === "paragraph" && !plain(x)));
        return (
          solid.length === 2 &&
          solid[0].type === "heading" &&
          /^level \d$/i.test(solid[0].text.trim()) &&
          solid[1].type === "heading"
        );
      });
      if (bare) dropped = true;
      return !bare;
    });
  }
  if (!dropped) throw new Error("content override: no bare LEVEL row on /car-detailing");
  page.sections = page.sections.filter((s) => s.blocks.length > 0);
}

/**
 * The mobile number the source still prints on five pages. Client,
 * 2026-09-26: "Update phone number on the following page… replace with:
 * 02033556435" — which is `CONTACT.phone`, the number every other page
 * already carries. The `tel:` href sits in the same paragraph HTML as the
 * visible number, so one swap moves the link and the text together.
 */
const OLD_PHONE = "07434649960";

const PASTE_WAX =
  "<strong>Paste Wax</strong>: Protect and extend your car’s paintwork with a wax sealant that shields against the elements while delivering a brilliant shine.";
const LIQUID_WAX =
  "<strong>Liquid Wax</strong>: Protection for long-lasting gloss.";

const RULES: Record<string, (page: Page) => void> = {
  /* The mobile car wash hub: two tiers retired, three repriced, one add-on
     renamed. Items 2, 3, 4 and 5. */
  "mobile-car-wash": (page) => {
    for (const name of RETIRED_WASHES) {
      dropColumns(page, headed(name));
    }
    /*
      A word the source doubled — "we bring that experience and experience to
      every job" — live on the client's WordPress site and in `.cache/html`, so
      it is theirs rather than an extraction artefact. Repo owner asked for it
      corrected, 2026-09-22. Dropping the repeat is the whole fix: the likely
      intended word was "expertise", but that is a guess and this is not.

      `HUB_LINES.wash` in `lib/local-copy.ts` matches this sentence *after* the
      correction — overrides run first — so the two have to move together.
    */
    swap(
      page.sections.flatMap((s) => s.blocks),
      "that experience and experience to every job",
      "that experience to every job",
    );
    swap(page.sections.flatMap((s) => s.blocks), "£48-£60", "£59-£73");
    swap(page.sections.flatMap((s) => s.blocks), "£90-£120", "£115-£145");
    swap(page.sections.flatMap((s) => s.blocks), "£41-£52", "£49-£65");
    // Gold Wash keeps its paste wax; only Exterior Plus changes.
    for (const section of page.sections) {
      eachColumns(section.blocks, (block) => {
        for (const col of block.cols) {
          if (!headed("EXTERIOR PLUS WASH")(col)) continue;
          swap(col, "✔ Paste Wax", "✔ Liquid Wax");
        }
      });
    }
  },

  /* Item 3, plus item 6's own-page price ladder (Small/Medium/Large/XL). */
  "mobile-car-wash/silver-wash": (page) => {
    swap(page.sections.flatMap((s) => s.blocks), "£48-£60", "£59-£73");
    insertBefore(page, addOnServices, pricingLadder([59, 65, 69, 73]));
  },

  /* Item 6's own-page price ladder — the range was already correct. */
  "mobile-car-wash/gold-wash": (page) => {
    insertBefore(page, addOnServices, pricingLadder([110, 120, 130, 140]));
  },

  /* Item 6's own-page price ladder — the range was already correct. */
  "mobile-car-wash/platinum-wash": (page) => {
    insertBefore(page, addOnServices, pricingLadder([170, 190, 210, 225]));
  },

  /* Item 5, plus item 6's own-page price ladder. Under the car wash hub since
     2026-09-26; it was `car-interior-cleaning/premium-interior-wash`. */
  "mobile-car-wash/premium-interior-wash": (page) => {
    swap(page.sections.flatMap((s) => s.blocks), "£90-£120", "£115-£145");
    insertBefore(page, addOnServices, pricingLadder([115, 125, 135, 145]));
  },

  /* Item 4: the price band, and the wax the package now uses. Plus item 6's
     own-page price ladder. */
  "mobile-car-wash/exterior-plus-wash": (page) => {
    const blocks = page.sections.flatMap((s) => s.blocks);
    swap(blocks, "£41-£52", "£49-£65");
    swap(blocks, "✔ Paste Wax", "✔ Liquid Wax");
    swap(blocks, PASTE_WAX, LIQUID_WAX);
    insertBefore(page, addOnServices, pricingLadder([49, 55, 60, 65]));
  },

  /* Item 11. The page quotes its ladder under "OUR PRICING". */
  "car-valeting/mini-valet": (page) => {
    repriceLadder(page, /^our pricing$/i, [59, 65, 69, 73]);
  },

  /* Item 9: Zeus gets the upholstery-shampoo line (see `addToZeus`).
     Item 10, in the package comparison table. The trailing rung tells Triton
     from Neptune, which is otherwise priced identically and is unchanged. */
  /* Item, 2026-09-22: the LEVEL 1–5 row the client called a duplicate. The
     three services that replace it on the page are a band the frame renders
     — see `lib/service-cards.ts` — not content, so they are not written here. */
  /*
    The one borough hub the mirror never wrote. Its page in `pages.json` is a
    single block — an h1 reading "Our Locations" — so it went out as a 3-word
    page that still answered 200 and still sat in the sitemap. `verify.mjs`
    missed it because the A–Z index below it carries enough characters to
    clear the thin-page threshold on its own.

    Built here rather than in `lib/planned-locations.ts` because it is not one
    of the plan's 49: it is a page that exists and is empty, not one that was
    asked for. The words are in `lib/local-copy.ts` with the other written
    ones.
  */
  "our-locations/city-of-westminster": (page) => {
    const local = LOCAL_PLACES["city-of-westminster"];
    if (!local) throw new Error("content override: no local copy for city-of-westminster");
    if (page.sections.length !== 1 || page.sections[0].blocks.length !== 1) {
      throw new Error("content override: city-of-westminster is no longer the empty stub this rule is for");
    }

    /* The family's own shape, in the capitals Barnet's is written in —
       where the possessive is correct, rather than the "Brent’S" the mirror
       left on five of its siblings. This one is written here, so it does not
       have to carry their typo. */
    page.h1 = "CITY OF WESTMINSTER’S FINEST MOBILE CAR DETAILING & VALETING";
    page.sections = [
      /* One paragraph in the header, as the mirror's own location pages
         carry (34-73 words); the second goes below it. */
      {
        blocks: [
          { type: "heading", level: 1, text: page.h1 },
          { type: "paragraph", html: local.opening },
        ],
      },
      /* A photograph beside it, for the same reason the built pages have one:
         a lone paragraph on a full-width band is mostly empty band. This one
         is the valeting hub's own picture. */
      {
        blocks: [
          {
            type: "columns",
            spans: [7, 5],
            cols: [
              [{ type: "paragraph", html: local.why }],
              [
                {
                  type: "image",
                  src: "/assets/2020/10/1128998174-huge-scaled.webp",
                  alt: "A car interior being valeted",
                  w: 2560,
                  h: 1707,
                },
              ],
            ],
          },
        ],
      },
      {
        blocks: [
          { type: "heading", level: 2, text: "City of Westminster’s Neighborhoods" },
          { type: "paragraph", html: local.areas.join(", ") },
        ],
      },
      { blocks: [{ type: "heading", level: 4, text: "Our Other Locations" }] },
    ];
  },

  "car-detailing": (page) => {
    dropBareLevelRow(page);
    /*
      The hub counts its own packages wrong, and has since Mini Car Detail was
      added as LEVEL 2: the row prices five — New Car / Protection, Mini Car
      Detail, Enhancement, Correction, Perfection — and the sentence over it
      still says four. The page's own FAQ names the original four, which is
      where the number came from. Repo owner asked for it corrected,
      2026-09-22; it reaches the 72 built detailing location pages too, which
      all carry the same five cards.
    */
    swap(
      page.sections.flatMap((s) => s.blocks),
      "four distinct detailing packages",
      "five distinct detailing packages",
    );
  },

  /*
    The WHEELUV™ page, rebuilt from the client's brief of 2026-10-06 —
    "Completely rebuild the existing Alloy Wheel Cleaning page" — and moved to
    this URL the same day. It renders through its own route
    (`app/car-detailing/alloy-wheel-protection`), which reads the brief's copy
    out of `lib/alloy-wheel-protection.ts` directly.

    This rule is for everything else that reads the page: the card
    `/car-detailing` shows for it (`blurbOf` takes the opening paragraph,
    `entryPrice` the price heading), the sitemap's lastmod, and the WebPage
    node's name and description. Left alone they would keep quoting the old
    page — "Won't damage your wheels" among it, which is the one line the
    brief names as having to go. So the mirror's sections are replaced by the
    brief's opening, its price and its questions.

    Matched on the mirror's own h1, and it throws when that has changed: the
    day the live site publishes the rebuilt page, this rule is to be deleted
    rather than left overwriting it.
  */
  "car-detailing/alloy-wheel-protection": (page) => {
    if (page.h1 !== "Wheeluv™ Alloy Wheel Protection") {
      throw new Error(`content override: the alloy wheel page's h1 is "${page.h1}", not the mirror's`);
    }
    const { hero, faq, seo } = AWP;
    page.title = seo.title;
    page.description = seo.description;
    page.h1 = hero.h1;
    page.ogImage = ALLOY_WHEEL_PHOTOS.hero.src;
    page.ogW = ALLOY_WHEEL_PHOTOS.hero.w;
    page.ogH = ALLOY_WHEEL_PHOTOS.hero.h;
    page.modified = "2026-10-06";
    page.breadcrumb = [{ name: "Home", href: "/" }, { name: "Alloy Wheel Protection" }];
    page.sections = [
      {
        blocks: [
          { type: "heading", level: 1, text: hero.h1 },
          ...hero.intro.map((html): Block => ({ type: "paragraph", html })),
          { type: "heading", level: 4, text: hero.offer.price },
        ],
      },
      {
        blocks: [
          { type: "heading", level: 2, text: faq.heading },
          { type: "faq", items: faq.items },
        ],
      },
    ];
  },

  /*
    The motorcycle page, rebuilt from the client's brief of 2026-10-06 — "This
    page needs to be fully changes please". It renders through its own route
    (`app/vehicles/motorcycle-valeting-detailing`), which reads the brief's
    copy out of `lib/motorcycle.ts` directly.

    This rule is for everything else that reads the page: `/vehicles` borrows
    its opening paragraph, its card blurb and entry price and its first three
    questions; the sitemap reads its lastmod and the WebPage node its name and
    description. Left alone they would keep selling the old £165 / £240 /
    £375 washes, chain lubrication and "ceramic coating … 1–5 year
    durability" — every one of which the brief orders off the site. So the
    mirror's sections are replaced by the brief's opening, its three prices
    and its questions.

    Matched on the mirror's own h1, and it throws when that has changed: the
    day the live site publishes the rebuilt page, this rule is to be deleted
    rather than left overwriting it.
  */
  "vehicles/motorcycle-valeting-detailing": (page) => {
    if (page.h1 !== "Bike Wash Packages") {
      throw new Error(`content override: the motorcycle page's h1 is "${page.h1}", not the mirror's`);
    }
    const { hero, packages, faq, seo } = MOTORCYCLE;
    page.title = seo.title;
    page.description = seo.description;
    page.h1 = hero.h1;
    page.ogImage = MOTORCYCLE_PHOTOS.hero.src;
    page.ogW = MOTORCYCLE_PHOTOS.hero.w;
    page.ogH = MOTORCYCLE_PHOTOS.hero.h;
    page.modified = "2026-10-06";
    page.sections = [
      {
        blocks: [
          { type: "heading", level: 1, text: hero.h1 },
          { type: "heading", level: 2, text: hero.title },
          { type: "paragraph", html: hero.lead },
          ...hero.body.map((html): Block => ({ type: "paragraph", html })),
        ],
      },
      {
        blocks: [
          { type: "heading", level: 2, text: packages.heading },
          ...packages.items.flatMap((p): Block[] => [
            { type: "heading", level: 3, text: p.name },
            { type: "heading", level: 4, text: p.price },
            { type: "paragraph", html: p.body },
          ]),
        ],
      },
      {
        blocks: [
          { type: "heading", level: 2, text: faq.heading },
          { type: "faq", items: faq.items },
        ],
      },
    ];
  },

  /*
    The vomit cleaning page, restructured from the client's brief of
    2026-10-06 — "This document replaces/restructures the existing Vomit
    Cleaning page." It renders through its own route
    (`app/car-interior-cleaning/vomit-cleaning`), which reads the brief's copy
    out of `lib/vomit-cleaning.ts` directly.

    Unlike the two rebuilds above, part of the old page stays: "The useful
    educational/DIY information currently on the existing page can remain for
    SEO purposes, but move it underneath". So the mirror's sections are
    replaced by the brief's opening, its four prices and its questions — what
    `/car-interior-cleaning`'s card, the sitemap and the WebPage node read —
    followed by the old page's own guide, word for word, which the route sets
    below the FAQ. `GUIDE` names the rows kept and why the rest are not.

    Matched on the mirror's own h1, and it throws when that has changed: the
    day the live site publishes the restructured page, this rule is to be
    deleted rather than left overwriting it.
  */
  "car-interior-cleaning/vomit-cleaning": (page) => {
    if (page.h1 !== "Car Vomit Cleaning Service In London") {
      throw new Error(`content override: the vomit cleaning page's h1 is "${page.h1}", not the mirror's`);
    }
    const { hero, pricing, faq, seo } = VOMIT;

    /* The guide, read out of the mirror before its sections are replaced.
       Photographs are left behind: they were the old layout's, stock shots
       of valeting in general, and the guide is set as text below the FAQ. */
    const old = allBlocks(page).filter((b) => b.type !== "image");
    const isH2 = (b: Block) => b.type === "heading" && b.level <= 2;
    const row = (title: string): Section => {
      const at = old.findIndex((b) => isH2(b) && plain(b) === title);
      if (at === -1) throw new Error(`content override: the vomit cleaning guide has no "${title}" row`);
      let end = at + 1;
      while (end < old.length && !isH2(old[end])) end++;
      return { blocks: old.slice(at, end) };
    };
    const opener = GUIDE.intro.map((start) => {
      const p = old.find((b) => b.type === "paragraph" && plain(b).startsWith(start));
      if (!p) throw new Error(`content override: the vomit cleaning guide no longer opens "${start}…"`);
      return p;
    });

    page.title = seo.title;
    page.description = seo.description;
    page.h1 = hero.h1;
    page.ogImage = VOMIT_PHOTOS.hero.src;
    page.ogW = VOMIT_PHOTOS.hero.w;
    page.ogH = VOMIT_PHOTOS.hero.h;
    page.modified = "2026-10-06";
    page.breadcrumb = [{ name: "Home", href: "/" }, { name: hero.h1 }];
    page.sections = [
      {
        blocks: [
          { type: "heading", level: 1, text: hero.h1 },
          { type: "heading", level: 2, text: hero.title },
          ...hero.intro.map((html): Block => ({ type: "paragraph", html })),
          { type: "paragraph", html: hero.serviceHtml },
        ],
      },
      {
        blocks: [
          { type: "heading", level: 2, text: pricing.heading },
          { type: "paragraph", html: pricing.lead },
          ...pricing.sizes.flatMap((s): Block[] => [
            { type: "heading", level: 3, text: s.name },
            { type: "heading", level: 4, text: s.price },
            { type: "paragraph", html: `${pricing.examplesLabel} ${s.examples}` },
          ]),
        ],
      },
      {
        blocks: [
          { type: "heading", level: 2, text: faq.heading },
          { type: "faq", items: faq.items },
        ],
      },
      { blocks: [{ type: "heading", level: 2, text: GUIDE.heading }, ...opener] },
      ...GUIDE.topics.map(row),
    ];
  },

  /*
    The pet hair removal page, rebuilt from the client's brief of 2026-10-06 —
    "Replace/re-optimise the existing Pet Hair Removal page … The existing
    page currently displays Pet Hair Removal from £90. REMOVE THIS." It
    renders through its own route (`app/car-interior-cleaning/
    pet-hair-removal`), which reads the brief's copy out of
    `lib/pet-hair-removal.ts` directly.

    This rule is for everything else that reads the page: the card
    `/car-interior-cleaning` shows for it, the sitemap's lastmod and the
    WebPage node. Left alone the card would go on saying "From £90" — the one
    line the brief orders removed — so the mirror's sections are replaced by
    the brief's opening, its price as the add-on it is ("+£20", which
    `lib/hub.ts` reads as an add-on rather than an entry price) and its
    questions. Nothing of the old page is kept: it promised to eliminate
    "unpleasant and lingering pet odours" and listed steam cleaning and
    sanitation in the package, which the brief's list of claims to remove
    names one by one.

    The breadcrumb is left as the mirror has it, so a "Read More" pointing
    here is still labelled "Pet Hair Removal" by `nameReadMoreLinks`.

    Matched on the mirror's own h1, and it throws when that has changed: the
    day the live site publishes the rebuilt page, this rule is to be deleted
    rather than left overwriting it.
  */
  "car-interior-cleaning/pet-hair-removal": (page) => {
    if (page.h1 !== "Professional Pet Hair Removal in London") {
      throw new Error(`content override: the pet hair removal page's h1 is "${page.h1}", not the mirror's`);
    }
    const { hero, points, price, faq, seo } = PET_HAIR;
    page.title = seo.title;
    page.description = seo.description;
    page.h1 = hero.h1;
    page.ogImage = PET_HAIR_PHOTOS.hero.src;
    page.ogW = PET_HAIR_PHOTOS.hero.w;
    page.ogH = PET_HAIR_PHOTOS.hero.h;
    page.modified = "2026-10-06";
    page.sections = [
      {
        blocks: [
          { type: "heading", level: 1, text: hero.h1 },
          { type: "heading", level: 2, text: hero.title },
          ...hero.intro.map((html): Block => ({ type: "paragraph", html })),
        ],
      },
      {
        blocks: [
          { type: "heading", level: 2, text: price.heading },
          { type: "heading", level: 4, text: points.price.value },
          ...price.bodyHtml.map((html): Block => ({ type: "paragraph", html })),
        ],
      },
      {
        blocks: [
          { type: "heading", level: 2, text: faq.heading },
          { type: "faq", items: faq.items },
        ],
      },
    ];
  },

  /*
    The other half of the pet hair brief's internal linking: "The Triton
    Interior Valet page should also link back to this page from its optional
    extras section using: Pet Hair Removal +£20". That section is this page's
    "+ Add-on services" grid, whose "Pet Hair Removal" card already carries
    the £20 — so its title becomes the link, as the WHEELUV card's did.

    And its sentence is replaced, because it said "we ensure all pet hair is
    carefully removed from your car's interior": the 100% promise the brief
    withdraws, on the one page the add-on is sold from. The replacement is
    the brief's own wording for this same optional extra in the Triton
    booking flow (`TRITON_EXTRA`), so the card, the pet hair page and the
    checkout say the same four things. Throws if the card or its sentence
    has gone.
  */
  "car-interior-cleaning/interior-valet": (page) => {
    const blocks = allBlocks(page);
    const at = blocks.findIndex((b) => b.type === "heading" && plain(b) === "Pet Hair Removal");
    const title = blocks[at];
    const blurb = blocks[at + 1];
    if (
      title?.type !== "heading" ||
      blurb?.type !== "paragraph" ||
      !plain(blurb).startsWith("Pet hair can be difficult to remove")
    ) {
      throw new Error("content override: the Triton page's Pet Hair Removal add-on card has changed");
    }
    title.href = PET_HAIR_PATH;
    blurb.html = TRITON_EXTRA.body;

    relinkOdourAddOn(page);

    /* Item 10, the half that was missed. The brief's "Change price to 135,
       145, 155, 165" reached the homepage comparison table — `PACKAGES` in
       `lib/site.ts` has carried those four since — and not this page's own
       "OUR PRICING" ladder, which was still quoting 115/125/135/145. Client,
       2026-10-12, pointing back at it: "Point number 10 on first tab".

       Matched on the heading, never an index, and `repriceLadder` throws if
       the ladder is no longer under it. The same four numbers sit on
       `/mobile-car-wash/premium-interior-wash` for a different package, which
       is why this is keyed to the page rather than swapped site-wide. */
    repriceLadder(page, /^our pricing$/i, [135, 145, 155, 165]);
  },

  /*
    The second batch of the client's 2026-10-06 briefs ("Webite changes
    (1)…(7).pdf" and "Webite changes .pdf"): eight pages rebuilt at once, each
    a hand-built route whose copy lives in its own `lib/*.ts`. Every one of
    them exports a `REBUILD` record — the brief's SEO strings, its opening,
    its price as the hub should show it, its "Why choose" reasons and its
    FAQ — and `rebuiltFrom` turns that into the sections everything else
    reads: hub cards, the sitemap, the WebPage node, Read More labels.

    Each rule throws if the mirror's h1 has changed, so the day the live site
    publishes a rebuild, its rule is deleted rather than left overwriting it.
    The breadcrumb tails that move are the ones the briefs name: "Engine Bay
    Top Section Detail" ("The better service name is …"), "Car Wax Service"
    (it read "Autoglym"), "Flooded Car & Water Damage Cleaning" (it read
    "…Repair", which the brief says the service is not), "Caravan & Motorhome
    Valeting" and "Interior Paint Spill Removal".
  */
  "repairs/headlight-restoration": rebuiltFrom(HEADLIGHT_REBUILD),
  "car-interior-cleaning/steam-cleaning": rebuiltFrom(STEAM_REBUILD),
  "repairs/engine-bay-steam-cleaning": rebuiltFrom(ENGINE_REBUILD, "Engine Bay Top Section Detail"),
  "repairs/car-graffiti-removal": rebuiltFrom(GRAFFITI_REBUILD),
  "mobile-car-wash/car-wax-service": rebuiltFrom(WAX_REBUILD),
  "vehicles/caravan-cleaning": rebuiltFrom(CARAVAN_REBUILD, "Caravan & Motorhome Valeting"),
  "car-interior-cleaning/flooded-car-cleaning": rebuiltFrom(FLOOD_REBUILD, "Flooded Car & Water Damage Cleaning"),
  /* Moved here from /repairs/paint-overspray-removal the same day (301 in
     `lib/redirects.ts`): "This page is NOT for exterior paint overspray". */
  "repairs/car-interior-paint-spill-removal": rebuiltFrom(PAINT_REBUILD, "Interior Paint Spill Removal"),

  /* Zeus — the second of the three valets the odour brief names. */
  "car-valeting/premium-full-valet": (page) => {
    relinkOdourAddOn(page);
    addWaxLink(page);
  },

  /* Pre-Sale Valet — one of the three the car wax brief names as eligible. */
  "car-valeting/pre-sale-valet": (page) => {
    addWaxLink(page);
  },

  /*
    The flooded car brief, 2026-10-06: "The Mould Removal and Odour pages
    should also link back where appropriate using: Flooded Car & Water Damage
    Cleaning". This page's own list of when mould grows names "Vehicles
    affected by flooding or water ingress" — the place it is appropriate —
    and the link follows that item in the brief's words. (The odour page is a
    hand-built route and carries its link itself.)
  */
  "car-interior-cleaning/mould-removal": (page) => {
    let hits = 0;
    for (const b of allBlocks(page)) {
      if (b.type !== "list") continue;
      b.items = b.items.map((item) => {
        if (!/^Vehicles affected by flooding or water ingress$/i.test(item.trim())) return item;
        hits += 1;
        return `${item.trim()} — <a href="${FLOOD_PATH}">Flooded Car &amp; Water Damage Cleaning</a>`;
      });
    }
    if (hits !== 1) throw new Error(`content override: mould-removal has ${hits} flooding list items, not one`);
  },

  /*
    The car odour & ozone treatment page, rebuilt from the client's brief of
    2026-10-06 — "Replace/re-optimise the existing Odour Removal page". It
    renders through its own route (`app/car-interior-cleaning/
    odour-removal`), which reads the brief's copy out of
    `lib/odour-removal.ts` directly.

    This rule is for everything else that reads the page: the card
    `/car-interior-cleaning` shows for it, the sitemap's lastmod and the
    WebPage node. The old page was "OZONE Odour Removal & Disinfection" and
    promised to "eliminate viruses, germs, and unpleasant odors" — the brief's
    list of wording to remove, nearly line for line — so its sections are
    replaced by the brief's opening, its price as the add-on it is ("From
    +£60", which `lib/hub.ts` reads as an add-on rather than an entry price)
    and its questions.

    The breadcrumb's tail moves too, because `nameReadMoreLinks` labels every
    Read More pointing here with it, and "Disinfection" is one of the claims
    the brief withdraws. It becomes the name the brief gives the service.

    Matched on the mirror's own h1, and it throws when that has changed.
  */
  "car-interior-cleaning/odour-removal": (page) => {
    if (page.h1 !== "OZONE Odour Removal & Disinfection") {
      throw new Error(`content override: the odour removal page's h1 is "${page.h1}", not the mirror's`);
    }
    const { hero, points, tiers, pricing, faq, seo } = ODOUR;
    page.title = seo.title;
    page.description = seo.description;
    page.h1 = hero.h1;
    page.ogImage = ODOUR_PHOTOS.hero.src;
    page.ogW = ODOUR_PHOTOS.hero.w;
    page.ogH = ODOUR_PHOTOS.hero.h;
    page.modified = "2026-10-06";
    page.breadcrumb = [{ name: "Home", href: "/" }, { name: VALET_EXTRA.title }];
    page.sections = [
      {
        blocks: [
          { type: "heading", level: 1, text: hero.h1 },
          { type: "heading", level: 2, text: hero.title },
          ...hero.intro.map((html): Block => ({ type: "paragraph", html })),
        ],
      },
      {
        blocks: [
          { type: "heading", level: 2, text: tiers.heading },
          { type: "heading", level: 4, text: `${points.price.label} ${points.price.value}` },
          ...pricing.important.bodyHtml.map((html): Block => ({ type: "paragraph", html })),
        ],
      },
      {
        blocks: [
          { type: "heading", level: 2, text: faq.heading },
          { type: "faq", items: faq.items },
        ],
      },
    ];
  },

  /*
    The vehicle signage & sticker removal page, rebuilt from the client's
    brief of 2026-10-06 — "Full replacement/re-optimisation of the existing
    page. KEEP EXISTING URL". It renders through its own route
    (`app/commercial-valeting/car-van-stickers-removal`), which reads the
    brief's copy out of `lib/signage-removal.ts` directly.

    This rule is for everything else that reads the page: the card
    `/commercial-valeting` shows for it (`blurbOf` takes the opening
    paragraph), the sitemap's lastmod and the WebPage node's name and
    description. Left alone they would keep the old page's promise — "leaving
    your vehicle's paintwork flawless" — which is the opposite of what the
    brief now says about the paint underneath. So the mirror's sections are
    replaced by the brief's opening and its questions. Nothing of the old
    page is kept: its copy is what the brief replaces, and its photographs
    are on the new page under the brief's own filenames.

    Matched on the mirror's own h1, and it throws when that has changed: the
    day the live site publishes the rebuilt page, this rule is to be deleted
    rather than left overwriting it.
  */
  "commercial-valeting/car-van-stickers-removal": (page) => {
    if (page.h1 !== "Car & Van Sticker Removal in London") {
      throw new Error(`content override: the sticker removal page's h1 is "${page.h1}", not the mirror's`);
    }
    const { hero, faq, seo } = SIGNAGE;
    page.title = seo.title;
    page.description = seo.description;
    page.h1 = hero.h1;
    page.ogImage = SIGNAGE_PHOTOS.hero.src;
    page.ogW = SIGNAGE_PHOTOS.hero.w;
    page.ogH = SIGNAGE_PHOTOS.hero.h;
    page.modified = "2026-10-06";
    page.sections = [
      {
        blocks: [
          { type: "heading", level: 1, text: hero.h1 },
          { type: "heading", level: 2, text: hero.subtitle },
          { type: "paragraph", html: hero.lead },
          { type: "paragraph", html: hero.introHtml },
          { type: "paragraph", html: hero.body },
        ],
      },
      {
        blocks: [
          { type: "heading", level: 2, text: faq.heading },
          { type: "faq", items: faq.items },
        ],
      },
    ];
  },

  /*
    The one page on the site whose h1 names the wrong service. Turned up in the
    audit of the last 52 mirror location pages, 2026-09-22: `/car-detailing/brent`
    opens on "Mobile Car Valeting in Brent" while its `<title>`, its breadcrumb
    and every one of its h2s say detailing, and the body sells detailing
    packages. It is the mirror's own slip — a heading, so rule 2's narrowing
    covers it, and nothing is being written that the page does not already say
    about itself four other ways.

    Both copies have to move: the header's heading block and the `h1` field the
    metadata and the JSON-LD read.
  */
  "car-detailing/brent": (page) => {
    const wrong = "Mobile Car Valeting in Brent";
    const right = "Mobile Car Detailing in Brent";
    if (page.h1 !== wrong) throw new Error(`content override: car-detailing/brent h1 is "${page.h1}"`);
    page.h1 = right;
    swap(page.sections.flatMap((s) => s.blocks), wrong, right);
  },

  "car-valeting": (page) => {
    restoreTilePhotos(page, VALETING_TILES);
    markAsIcon(page, "/assets/2025/03/907dae74-cd56-491c-86f7-527943757154.webp");
    addToZeus(page, "Upholstery seats & mats shampoo + extract");
    swap(
      page.sections.flatMap((s) => s.blocks),
      "yaris£115Medium",
      "yaris£135Medium",
    );
    swap(page.sections.flatMap((s) => s.blocks), "Boxter/ BMW 1 Series£125Large", "Boxter/ BMW 1 Series£145Large");
    swap(page.sections.flatMap((s) => s.blocks), "Porsche Macan£135XL Careg. BMW X5/ Volvo XC90/ Porsche Cayenne£145", "Porsche Macan£155XL Careg. BMW X5/ Volvo XC90/ Porsche Cayenne£165");
    /* Medusa Gold has no page of its own; this is where it is sold. */
    relinkOdourAddOn(page);
    addWaxLink(page);
  },

  /* Item 16: the two checks the client struck off, and both subscription
     ladders.

     The XL fortnightly rung on the exterior detail is £104, which is what the
     client wrote and what they confirmed when asked. It is worth knowing it is
     deliberate rather than a typo, because it reads like one: the column steps
     £12 at a time (88, 100, 112) so the pattern points at 124, and at 104 the
     XL pays less than the Large above it. Their price, their call. */
  "car-lovers-club": (page) => {
    dropListItems(
      page,
      /vehicle health check/i,
      /Oil\s*(&amp;|&)\s*coolant check|Tyre Tread Safety Check/i,
    );
    repriceSubscription(page, /^the full maintenance detail$/i, [
      [60, 65, 70, 75],
      [110, 120, 130, 140],
      [200, 220, 240, 260],
    ]);
    repriceSubscription(page, /^the exterior maintenance detail$/i, [
      [47, 53, 59, 65],
      [88, 100, 112, 104],
      [164, 188, 212, 236],
    ]);
  },
};

/**
 * What a rebuilt page's content module exports for this file — `REBUILD` in
 * `lib/headlight.ts`, `lib/steam-cleaning.ts` and the rest of 2026-10-06's
 * second batch.
 */
type Rebuild = {
  slug: string;
  mirrorH1: string;
  title: string;
  description: string;
  h1: string;
  og: { src: string; w: number; h: number };
  intro: string[];
  /** "From £100" (entry price), "+£20" / "From +£40" (add-on only), or none. */
  price?: string;
  why?: { heading: string; items: { title: string; body: string | string[] }[] };
  faq: { heading: string; items: { q: string; a: string[] }[] };
  breadcrumbName?: string;
};

/**
 * The mirror page's sections replaced by the brief's own: the opening, the
 * price (a bare "£100" heading for an entry price, which `entryPrice` reads;
 * "+£40"-style for an add-on, which `lib/hub.ts` reads as one), the reasons as
 * "Label: sentence" items — the shape `hubReasons` parses, so `/repairs` and
 * `/vehicles` keep their "Why choose" band — and the FAQ, which the hubs'
 * accordions read before anything else.
 */
function rebuiltFrom(r: Rebuild, crumb?: string) {
  return (page: Page) => {
    if (page.h1 !== r.mirrorH1) {
      throw new Error(`content override: ${r.slug}'s h1 is "${page.h1}", not the mirror's "${r.mirrorH1}"`);
    }
    page.title = r.title;
    page.description = r.description;
    page.h1 = r.h1;
    page.ogImage = r.og.src;
    page.ogW = r.og.w;
    page.ogH = r.og.h;
    page.modified = "2026-10-06";
    const name = crumb ?? r.breadcrumbName;
    if (name) page.breadcrumb = [{ name: "Home", href: "/" }, { name }];

    const sections: Section[] = [
      {
        blocks: [
          { type: "heading", level: 1, text: r.h1 },
          ...r.intro.map((html): Block => ({ type: "paragraph", html })),
        ],
      },
    ];
    if (r.price) {
      const addOn = /\+\s*£/.test(r.price);
      sections.push({
        blocks: [
          { type: "heading", level: 2, text: "Price" },
          { type: "heading", level: 4, text: addOn ? r.price : r.price.replace(/^\s*from\s+(?=£)/i, "") },
        ],
      });
    }
    if (r.why?.items.length) {
      const amp = (t: string) => t.replace(/&(?!\w+;|#\d+;)/g, "&amp;");
      sections.push({
        blocks: [
          { type: "heading", level: 2, text: r.why.heading },
          {
            type: "list",
            ordered: false,
            items: r.why.items.map((it) => {
              const body = Array.isArray(it.body) ? it.body.join(" ") : it.body;
              return `<strong>${amp(it.title)}:</strong> ${amp(body)}`;
            }),
          },
        ],
      });
    }
    sections.push({
      blocks: [
        { type: "heading", level: 2, text: r.faq.heading },
        { type: "faq", items: r.faq.items },
      ],
    });
    page.sections = sections;
  };
}

/**
 * The car wax brief's link back, on the valets it names as eligible — Zeus,
 * Medusa Gold (`/car-valeting`, its only page) and Pre-Sale: "Then add
 * contextual links back to this page from relevant valet pages: WANT EXTRA
 * PAINT PROTECTION? Add Professional Car Wax From £40". The last row of the
 * page's add-on band — the brief's heading over a button carrying its line —
 * so it reads as one more optional extra, which is what it is.
 *
 * Found by the "+ Add-on services" heading and the run of card rows after it,
 * never by index; throws if the heading has gone.
 */
function addWaxLink(page: Page) {
  const at = page.sections.findIndex((s) =>
    s.blocks.some((b) => b.type === "heading" && /^\+\s*add-on services$/i.test(plain(b))),
  );
  if (at === -1) throw new Error(`content override: ${page.slug} has no "+ Add-on services" row for the wax link`);
  let last = at;
  /* The cards are columns rows carrying prices; on some pages they share the
     heading's own row, on others they follow it. */
  const isCardRow = (s: Section) => s.blocks.some((b) => b.type === "columns" && flatten([b]).some(isPrice));
  while (last + 1 < page.sections.length && isCardRow(page.sections[last + 1])) last += 1;
  /* Inside the add-ons' own band, as its last row — a band of its own
     landed ink under the ink add-on band. */
  page.sections[last].blocks.push(
    { type: "heading", level: 3, text: "Want Extra Paint Protection?" },
    { type: "button", label: "Add Professional Car Wax From £40", href: WAX_PATH },
  );
}

/**
 * The odour add-on card on the three valets the odour brief names — Triton,
 * Zeus and Medusa Gold (`/car-valeting`, its only page). "These three main
 * valet pages should also link back to this page from their optional extras:
 * Odour & Ozone Treatment — From +£60."
 *
 * Each page writes the card the same way — "£60", an icon, "Odour
 * Neutralisation & Ozone treatment" (plain "Ozone treatment" on
 * `/car-valeting`), one paragraph — and each paragraph promised what the
 * brief withdraws: "removing smoke, dust mites, mould, bacteria, and other
 * contaminants", "Effectively removes smoke & pet smells". So the card takes
 * the brief's name and is linked, the flat £60 becomes "From £60" (there are
 * three treatments now), and the paragraph becomes the brief's own lines for
 * this optional extra (`VALET_EXTRA`).
 *
 * Exactly one card per page, matched on its title and its £60, or it throws.
 * Mini Valet and Deep Clean carry the same card and are left alone: the brief
 * makes the treatment available with these three only.
 */
function relinkOdourAddOn(page: Page) {
  let hits = 0;
  const visit = (blocks: Block[]) => {
    for (let i = 0; i < blocks.length; i++) {
      const b = blocks[i];
      if (b.type === "columns") {
        b.cols.forEach(visit);
        continue;
      }
      if (b.type !== "heading" || !/^(odour neutralisation & ozone treatment|ozone treatment)$/i.test(plain(b))) continue;
      const price = blocks.slice(Math.max(0, i - 2), i).find(isPrice);
      const blurb = blocks[i + 1];
      if (!price || plain(price) !== "£60" || blurb?.type !== "paragraph") {
        throw new Error(`content override: ${page.slug}'s odour add-on card has changed shape`);
      }
      price.text = VALET_EXTRA.price;
      b.text = VALET_EXTRA.title;
      b.href = ODOUR_PATH;
      blocks.splice(i + 1, 1, ...VALET_EXTRA.body.map((html): Block => ({ type: "paragraph", html })));
      hits += 1;
    }
  };
  page.sections.forEach((s) => visit(s.blocks));
  if (hits !== 1) throw new Error(`content override: ${page.slug} has ${hits} odour add-on cards, not one`);
}

/* Item 10 again: the same Triton ladder is quoted on every location hub. */
const TRITON_LADDER = [135, 145, 155, 165] as const;

/**
 * The promotional film, transcoded.
 *
 * `Hero.tsx` was pointed at a 5.3 MB audio-free MP4 in place of the mirror's
 * 12.4 MB `.mov`, but the homepage is not the only page that plays one: twenty
 * `video` blocks across `/our-locations/*` carry a `.mov`, and those come from
 * `pages.json`, which only knows the masters. Without this they keep shipping
 * them.
 *
 * The `.mov` stays on disk and stays committed — it is the source the next
 * transcode would start from.
 */
const TRANSCODED: Record<string, string> = {
  // 12.4 MB -> 5.3 MB. 1280x720, 63s, unchanged.
  "/assets/2024/04/Medusa-Detailing-Promotional-Video.mov":
    "/assets/2024/04/Medusa-Detailing-Promotional-Video.mp4",
  // 6.0 MB -> 1.6 MB. Only 480x288 to begin with, and encoded at 706 kbps —
  // roughly seven times the bits per pixel the promotional film uses. It
  // plays under a 74% black scrim on three location pages, so CRF 30 costs
  // nothing anyone can see.
  "/assets/2024/02/video-output-3F38B028-1142-49B0-ADCB-A1E338818C41-1-1.mov":
    "/assets/2024/02/video-output-3F38B028-1142-49B0-ADCB-A1E338818C41-1-1.mp4",
};

function useTranscoded(page: Page): boolean {
  let hits = 0;
  for (const b of allBlocks(page)) {
    if (b.type !== "video") continue;
    const to = TRANSCODED[b.src];
    if (!to) continue;
    b.src = to;
    hits += 1;
  }
  return hits > 0;
}

/** "WHEELUV ™ – Alloy Wheel Protectors", with either dash the mirror uses. */
const isWheeluvAddon = (b: Block): b is Extract<Block, { type: "heading" }> =>
  b.type === "heading" && /^WHEELUV\s*™\s*[–—-]\s*Alloy Wheel Protectors$/i.test(decodeEntities(b.text).trim());

/* ── Application ──────────────────────────────────────────────────────── */

export function applyOverrides(
  pages: Record<string, Page>,
): Record<string, Page> {
  const out = { ...pages };

  const patch = (slug: string, fn: (page: Page) => void) => {
    const page = out[slug];
    if (!page) return;
    const copy = structuredClone(page);
    fn(copy);
    out[slug] = copy;
  };

  /*
    Before the rules, not after: `restoreTilePhotos` inside the car-valeting
    rule is what photographs these two, and it throws over a photograph with
    no tile to hang it on. `pages` rather than `out`, because what is borrowed
    is the child page's own opening paragraph and no rule touches it.
  */
  patch("car-valeting", (p) =>
    addPackageTiles(
      p,
      pages,
      VALETING_EXTRA_TILES,
      "/car-valeting/convertible-roof-cleaning",
    ),
  );

  /* `patch` skips a slug with no page, which is right for the site-wide passes
     below and wrong here: a rule keyed by a URL that has since moved would
     simply stop applying, and its price with it. */
  for (const [slug, fn] of Object.entries(RULES)) {
    if (!out[slug]) throw new Error(`content override: no page "${slug}" for its rule`);
    patch(slug, fn);
  }

  /*
    Site-wide rather than per page, so a regeneration that puts the old number
    on a sixth page is caught as well. Today it is `/repairs/car-graffiti-removal`,
    `/repairs/paint-overspray-removal`, `/commercial-valeting/mobile-truck-cleaning`,
    `/commercial-valeting/car-van-stickers-removal` and `/privacy-policy-cookies`
    — the client's list. The homepage's JSON-LD reads `BUSINESS` instead.
  */
  let rephoned = 0;
  for (const slug of Object.keys(out)) {
    if (!JSON.stringify(out[slug].sections).includes(OLD_PHONE)) continue;
    patch(slug, (p) => {
      swap(p.sections.flatMap((s) => s.blocks), OLD_PHONE, CONTACT.phone);
      rephoned++;
    });
  }
  if (!rephoned) throw new Error(`content override: ${OLD_PHONE} is on no page`);

  /*
    The location-page copy audit, 2026-09-22 (`lib/local-mirror.ts`).

    Three passes over each of the 75 mirror pages on the client's
    Ahrefs-verified list: the section titles the source wrote below `h2` go
    back to `h2`, the renames and typo corrections are applied, and the page
    gains the districts row every built location page already carries.

    Counted, and it throws on nothing having happened: these rules match on
    text that `npm run content` rewrites wholesale, and the failure that
    matters is the silent one.
  */
  let audited = 0;
  for (const slug of [...MIRROR_AUDIT, ...MIRROR_REST]) {
    if (!out[slug]) throw new Error(`content override: no page "${slug}" to audit`);
    patch(slug, (p) => {
      const n = promoteSections(p) + applyMirrorEdits(p, slug) + (districtsRow(p, slug) ? 1 : 0);
      if (n) audited++;
    });
  }
  if (!audited) throw new Error("content override: the location audit changed nothing");

  /*
    The four borough hubs outside London, 2026-09-22. Text correction only —
    they keep their own heading ranks and their own areas row, so none of the
    audit's other two passes applies. `applyMirrorEdits` throws on a rule that
    matched nothing, which is the whole guard here.
  */
  for (const slug of MIRROR_FIXES) {
    if (!out[slug]) throw new Error(`content override: no page "${slug}" to correct`);
    patch(slug, (p) => {
      if (!applyMirrorEdits(p, slug)) throw new Error(`content override: ${slug} took no correction`);
    });
  }

  for (const slug of Object.keys(out)) {
    const carriesTriton = allBlocks(out[slug]).some(
      (b) => b.type === "heading" && /^triton$/i.test(plain(b)),
    );
    if (carriesTriton) patch(slug, (p) => repriceLadder(p, /^triton$/i, TRITON_LADDER));

    const carriesSource = allBlocks(out[slug]).some(
      (b) => b.type === "video" && b.src in TRANSCODED,
    );
    if (carriesSource) patch(slug, useTranscoded);
  }

  /*
    The WHEELUV™ add-on card, linked to the page that sells it. Client,
    2026-10-06: "Other relevant Medusa pages should link back using natural
    anchors such as … WHEELUV™ Wheel Protectors". Four valeting pages offer it
    as an add-on at £159, under the heading "WHEELUV ™ – Alloy Wheel
    Protectors" — the anchor the brief asks for, already written — and none
    of them linked anywhere. Site-wide, and counted, like the pass below.
  */
  let wheeluv = 0;
  for (const slug of Object.keys(out)) {
    if (!allBlocks(out[slug]).some(isWheeluvAddon)) continue;
    patch(slug, (p) => {
      for (const b of allBlocks(p)) {
        if (isWheeluvAddon(b) && !b.href) {
          b.href = ALLOY_WHEEL_PATH;
          wheeluv += 1;
        }
      }
    });
  }
  if (!wheeluv) throw new Error("content override: no WHEELUV add-on card left to link");

  /*
    Last, because `restoreTilePhotos` finds its tiles by the label this pass
    rewrites. Site-wide rather than per-slug: two pages carry these links
    today, and a regeneration that moves the row onto a third should name its
    buttons too.
  */
  let named = 0;
  for (const slug of Object.keys(out)) {
    if (!allBlocks(out[slug]).some(isReadMore)) continue;
    patch(slug, (p) => {
      named += nameReadMoreLinks(p, out);
    });
  }
  if (!named) throw new Error('content override: no "Read More" link left to name');

  return out;
}
