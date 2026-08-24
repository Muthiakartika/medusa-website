/**
 * Reads the shape out of an extracted `table` block.
 *
 * The source site keeps its package comparison in one WPBakery table: two
 * header rows naming five packages, a description column, group dividers
 * ("Exterior", "Interior"), fifty-odd feature rows of ticks and dashes, and a
 * last row holding each package's price ladder. As a `<table>` that is 1062px
 * wide and 18,633px tall on a 375px screen — two axes of scrolling and about
 * fifty phone-screens of it.
 *
 * A table cannot be made narrow; it can only be re-read. So this returns the
 * meaning — which column is the description, which are the packages, which
 * rows are dividers — and `components/TableCards.tsx` renders that as one
 * package at a time. `components/Blocks.tsx` still renders the real table
 * wherever the container is wide enough to hold it.
 *
 * Nothing is dropped: every feature row survives, included or not, and the
 * descriptions move behind a disclosure rather than disappearing.
 */

/** A tick in the source's own vocabulary. It uses `✔` and nothing else. */
const TICK = /^[✔✓☑√]$/;

/** A cell that carries no information: empty, or the source's own `-`. */
const EMPTY = /^[\s-–—]*$/;

export type TableRow =
  /** A divider naming the run of features under it. */
  | { kind: "group"; label: string }
  /** One feature, and whether each package includes it. */
  | { kind: "feature"; label: string; desc?: string; values: string[] }
  /** A trailing row of prose per package — the price ladders on /valeting. */
  | { kind: "note"; values: string[] };

export type TableModel = {
  /** Header rows above the data, each already sliced to the value columns. */
  headers: string[][];
  /** How many packages the table compares. 1 means a single checklist. */
  valueCount: number;
  /** True when the table carries a description column worth disclosing. */
  hasDesc: boolean;
  rows: TableRow[];
};

const text = (cell: unknown) => String(cell ?? "").trim();
const blank = (cell: unknown) => EMPTY.test(text(cell));

export const isTick = (value: string) => TICK.test(value.trim());

export function parseTable(raw: unknown[][]): TableModel | null {
  const grid = raw.filter(Array.isArray).map((row) => row.map(text));
  if (!grid.length) return null;

  const width = Math.max(...grid.map((r) => r.length));
  if (width < 2) return null;

  /*
    The header rows are the leading ones that label the columns rather than a
    row: nothing in the first cell, something in the rest. The five per-package
    tables on /valeting have none — their first row is a group divider — and
    that is a shape this has to read, not correct.
  */
  let firstData = 0;
  const headers: string[][] = [];
  while (
    firstData < grid.length &&
    !grid[firstData][0] &&
    grid[firstData].slice(1).some(Boolean)
  ) {
    headers.push(grid[firstData]);
    firstData++;
  }

  const body = grid.slice(firstData);

  /*
    Column 1 is a description when it reads like prose rather than like a
    verdict. Measured, not assumed: a table of three short columns has no
    description column to hide, and hiding one of its answers would be a lie.
  */
  const secondCol = body.map((r) => r[1] ?? "").filter(Boolean);
  const hasDesc =
    width >= 3 &&
    secondCol.length > 0 &&
    secondCol.every((c) => !isTick(c)) &&
    secondCol.reduce((sum, c) => sum + c.length, 0) / secondCol.length >= 25;

  const firstValue = hasDesc ? 2 : 1;
  const valueCols: number[] = [];
  for (let c = firstValue; c < width; c++) valueCols.push(c);
  if (!valueCols.length) return null;

  const rows: TableRow[] = [];
  for (const row of body) {
    const label = row[0] ?? "";
    const values = valueCols.map((c) => row[c] ?? "");

    // Spacer rows: the extractor keeps the source's own empty `<tr>`.
    if (!label && values.every(blank) && blank(row[1])) continue;

    // A divider owns its row: a name in the first cell and nothing beside it.
    if (label && !row.slice(1).some(Boolean)) {
      rows.push({ kind: "group", label });
      continue;
    }

    // Prose in the value columns is a footnote, not a verdict — /valeting ends
    // its matrix with each package's four-class price ladder in one cell.
    if (!label && values.some((v) => v.length > 40)) {
      rows.push({ kind: "note", values });
      continue;
    }

    rows.push({
      kind: "feature",
      label,
      desc: hasDesc && row[1] ? row[1] : undefined,
      values,
    });
  }

  if (!rows.some((r) => r.kind === "feature")) return null;

  return {
    headers: headers.map((h) => valueCols.map((c) => h[c] ?? "")),
    valueCount: valueCols.length,
    hasDesc,
    rows,
  };
}

/**
 * A tab label short enough to sit four-across on a phone.
 *
 * The packages are named "Pandora – BRONZE Interior & Exterior" and the like,
 * which is unreadable at chip size and cannot be rewritten — so the tab takes
 * the name and the panel underneath prints the heading verbatim. Splitting on
 * the source's own dash is what makes "Pandora" and "Zeus" fall out; a name
 * with no dash keeps its first two words.
 */
export function shortLabel(full: string) {
  const head = full.split(/\s[–—-]\s/)[0].trim();
  if (head && head.length <= 14) return head;
  const words = head.split(/\s+/);
  const two = words.slice(0, 2).join(" ");
  return two.length <= 14 ? two : words[0];
}

/* ── The price row ────────────────────────────────────────────────────────
   The last row of /car-valeting's matrix is not prose. In the source each of
   its five cells is a carousel of vehicle-class cards — an icon, `<h3>Large
   Car</h3>`, `eg. Tesla Model S/ BMW 5 Series/ Porsche Macan`, `<h2>£85</h2>`
   — followed by a duration and a real BOOK NOW button pointing at
   `book.medusaautodetailing.co.uk`.

   `extract-content.mjs` flattens all of it into one 270-character string, so
   the four prices run together as `…Toyota yaris£70Medium Car…` and the site's
   primary call to action arrives as dead text. Reading the shape back is the
   same job `parseTable` above does for the matrix itself.

   Fixing the extractor would be the deeper repair, but regenerating
   `pages.json` rewrites 200-odd pages for one row — see PROJECT.md §3. */

export type Rung = { label: string; note?: string; price: string };

export type PriceLadder = {
  rungs: Rung[];
  /** "Approximately 2 hours (1 Technician)", verbatim. */
  duration?: string;
  /** The button's own words, when the cell ends in one. */
  cta?: string;
};

/** The four classes the site prices by, in the source's own order. */
const RUNG = /(Small|Medium|Large|XL)\s*Car\s*(eg\.[^£]*?)?£\s*([\d,]+)/gi;
const CTA = /\b(book\s*now)\.?\s*$/i;

export function parseLadder(cell: string): PriceLadder | null {
  const text = String(cell ?? "");
  const rungs: Rung[] = [];
  let end = 0;

  RUNG.lastIndex = 0;
  for (let m = RUNG.exec(text); m; m = RUNG.exec(text)) {
    rungs.push({
      label: `${m[1]} Car`,
      note: m[2]?.trim() || undefined,
      price: `£${m[3]}`,
    });
    end = RUNG.lastIndex;
  }

  // Two rungs is the least that is a ladder rather than a sentence with a
  // price in it. Anything shorter keeps its prose.
  if (rungs.length < 2) return null;

  let tail = text.slice(end).trim();
  const cta = tail.match(CTA)?.[1];
  if (cta) tail = tail.slice(0, tail.length - cta.length).trim();

  return { rungs, duration: tail || undefined, cta };
}
