import Image from "next/image";
import Icon from "@/components/Icon";
import PriceTabs from "@/components/PriceTabs";
import type { Block } from "@/lib/blocks";

/**
 * The extractor unwraps tags it does not keep by replacing them with their own
 * inner HTML, which turned every inline `<svg>` icon into its bare `<path>`.
 * 382 of those sit inside `pages.json` today, at the head of most tick-marked
 * list items. `scripts/extract-content.mjs` no longer produces them, but the
 * content file is only rewritten by a full re-crawl, so the renderer has to
 * cope with what is actually there.
 */
export const clean = (html: string) =>
  html
    .replace(/<svg[\s\S]*?<\/svg>/gi, "")
    .replace(/<path\b[^>]*>\s*<\/path>/gi, "")
    .replace(/<path\b[^>]*\/?>/gi, "")
    .trim();

/**
 * The bullet the author typed.
 *
 * 171 list items across nine pages open with a literal "✔" — the wash pages
 * write their contents as "✔ Wash", "✔ Buff". The renderer draws its own tick
 * in front of every item, so those lines came out double-ticked. The glyph is
 * the source's bullet, not part of the sentence, so it goes.
 *
 * Only a leading one, and only when something follows it: "✔" alone would
 * leave an empty item, and a tick used mid-sentence is real punctuation.
 */
export const unbullet = (html: string) =>
  html.replace(
    /^(\s*(?:<(?:strong|b|em|i|span)>\s*)*)[✔✓✅☑✖✗✘×•·●▪▫◦▶►‣➔➜→»–—-]+\s+(?=\S)/u,
    "$1",
  );

/**
 * Plain text for somewhere React will escape it again — a card title, say.
 * The entities have to be decoded here or `&amp;` reaches the page verbatim:
 * "Engine Bay Steam Clean &amp; Dressing".
 */
const textOnly = (html: string) =>
  clean(html)
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#0?39;|&apos;/gi, "'")
    .replace(/&#8217;|&rsquo;/gi, "’")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/\s+/g, " ")
    .trim();

/**
 * The service pages are extracted from WordPress, so genuinely structured
 * content arrives as a flat run of blocks. Two shapes account for most of it:
 *
 *   price table  — icon, class name, example cars, price. Repeated four times,
 *                  once per vehicle class. 2,524 runs across 115 pages.
 *   add-on cards — a columns block whose cells each hold a price, an icon, a
 *                  name and a description. 199 groups across 122 pages.
 *
 * Rendered block-by-block these read as a stack of loose headings and pictures.
 * Recognising them here lets the renderer lay them out as the tables and cards
 * they already are, without touching the extracted content.
 */

const text = (b: Block | undefined) =>
  b?.type === "heading" ? b.text : b?.type === "paragraph" ? b.html : "";

const isPrice = (b: Block | undefined) =>
  b?.type === "heading" && /^\s*(£|from\s*£)\s*[\d,]/i.test(b.text);

const isIcon = (b: Block | undefined) => b?.type === "image" && Boolean(b.icon);

export type PriceItem = {
  icon?: Extract<Block, { type: "image" }>;
  label: string;
  note?: string;
  price: string;
};

export type TabPanel = { label: string; blocks: Block[] };

export type Grouped =
  | { kind: "block"; block: Block }
  | { kind: "priceGrid"; items: PriceItem[] }
  | { kind: "gallery"; images: Extract<Block, { type: "image" }>[] }
  | { kind: "addonCards"; cards: AddonCard[] }
  | { kind: "tabs"; panels: TabPanel[] };

/* ── A tab set the extractor flattened ────────────────────────────────────
   `/car-valeting` ends its "Our Packages" row with a WPBakery tab set: a nav
   of five package names and five panels, one shown at a time. `fetch-html`
   mirrors the markup but not the jQuery UI that drives it, so `extract-
   content.mjs` sees five panels' worth of blocks in a row and emits them as
   one 99-block stack. On a phone that is 14,908px where the source spends
   4,608px, and the paragraph directly above it still reads "Click on choice
   of package below to see what the package entails" — an instruction with
   nothing left to click.

   The nav survives intact, which is what makes this safe to detect rather
   than guess: its items are anchors to WPBakery's own `#tab-<id>` targets.
   Restoring the tabs is restoring the source's layout, not imposing one. */

const TAB_LINK = /^\s*<a\s[^>]*href="#tab-[^"]*"[^>]*>(.*?)<\/a>\s*$/i;

const plain = (html: string) =>
  html
    .replace(/<[^>]+>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();

/**
 * The panels a `#tab-…` nav list introduces, or null when the run underneath
 * it does not line up with the nav.
 *
 * Every nav label has to find its own heading, in the nav's order, with the
 * first one sitting immediately after the nav — anything looser and a page
 * that merely links to anchors would have its content swallowed into a tab
 * set that was never there.
 */
function asTabs(blocks: Block[], start: number): { panels: TabPanel[]; end: number } | null {
  const nav = blocks[start];
  if (nav?.type !== "list" || nav.items.length < 2) return null;

  const labels = nav.items.map((item) => item.match(TAB_LINK)?.[1]);
  if (labels.some((l) => !l)) return null;
  const wanted = labels.map((l) => plain(l!));

  // Where each label's panel begins.
  const heads: number[] = [];
  let at = start + 1;
  for (const label of wanted) {
    const head = blocks[at];
    if (
      head?.type !== "heading" ||
      isPrice(head) ||
      !plain(head.text).startsWith(label)
    ) {
      // Not this block — scan on, but only past blocks the previous panel
      // could plausibly own, and never past a heading that matches nothing.
      let scan = at;
      while (
        scan < blocks.length &&
        !(
          blocks[scan].type === "heading" &&
          !isPrice(blocks[scan]) &&
          plain((blocks[scan] as Extract<Block, { type: "heading" }>).text).startsWith(label)
        )
      )
        scan++;
      if (scan >= blocks.length) return null;
      at = scan;
    }
    heads.push(at);
    at += 1;
  }

  // The first panel must follow the nav directly; a gap means these headings
  // are something else that happens to share the nav's words.
  if (heads[0] !== start + 1) return null;

  const end = blocks.length;
  const panels = heads.map((h, n) => ({
    label: nav.items[n].match(TAB_LINK)![1].replace(/<[^>]+>/g, "").trim(),
    blocks: blocks.slice(h, heads[n + 1] ?? end),
  }));

  return { panels, end };
}

/**
 * Collapses `icon → h3 → (paragraph) → £heading` runs into one price grid.
 * A run of fewer than two is left alone — a lone trio is not a table.
 */
export function group(blocks: Block[]): Grouped[] {
  const out: Grouped[] = [];
  let i = 0;

  while (i < blocks.length) {
    // A flattened tab set claims everything from its nav to the end of the
    // run, so it is tried before the shapes that would eat into its panels.
    const tabs = asTabs(blocks, i);
    if (tabs) {
      out.push({ kind: "tabs", panels: tabs.panels });
      i = tabs.end;
      continue;
    }

    const items: PriceItem[] = [];
    let j = i;

    for (;;) {
      const icon = blocks[j];
      const label = blocks[j + 1];
      if (!isIcon(icon) || label?.type !== "heading" || label.level !== 3) break;

      // The example-cars line is optional.
      const maybeNote = blocks[j + 2];
      const hasNote = maybeNote?.type === "paragraph" && !isPrice(maybeNote);
      const price = blocks[j + (hasNote ? 3 : 2)];
      if (!isPrice(price)) break;

      items.push({
        icon: icon as Extract<Block, { type: "image" }>,
        label: label.text,
        note: hasNote ? text(maybeNote) : undefined,
        price: text(price),
      });
      j += hasNote ? 4 : 3;
    }

    if (items.length >= 2) {
      out.push({ kind: "priceGrid", items });
      i = j;
      continue;
    }

    /*
      The same add-on shape, but loose in the block stream instead of inside a
      columns block — the thirteenth item that did not fit the source's 4×3
      grid, and every add-on on pages that never used columns at all. Left
      alone it rendered as a price, an icon, a heading and a paragraph stacked
      down the full width of the page.
    */
    const cards: AddonCard[] = [];
    let a = i;
    while (
      isPrice(blocks[a]) &&
      isIcon(blocks[a + 1]) &&
      blocks[a + 2]?.type === "heading"
    ) {
      let end = a + 3;
      while (blocks[end]?.type === "paragraph") end++;
      cards.push({
        price: text(blocks[a]),
        icon: blocks[a + 1] as Extract<Block, { type: "image" }>,
        rest: blocks.slice(a + 2, end),
      });
      a = end;
    }
    if (cards.length) {
      out.push({ kind: "addonCards", cards });
      i = a;
      continue;
    }

    /*
      Consecutive photographs are a gallery, not a column. One page carries
      nine 576px images in a row, which stacked to roughly 3,600px of scroll;
      site-wide there are runs of up to ten.
    */
    let k = i;
    while (blocks[k]?.type === "image" && !(blocks[k] as { icon?: boolean }).icon) k++;
    if (k - i >= 2) {
      out.push({
        kind: "gallery",
        images: blocks.slice(i, k) as Extract<Block, { type: "image" }>[],
      });
      i = k;
      continue;
    }

    out.push({ kind: "block", block: blocks[i] });
    i += 1;
  }

  return out;
}

export type AddonCard = {
  price: string;
  icon?: Extract<Block, { type: "image" }>;
  /** Everything the card chrome did not take, rendered in document order. */
  rest: Block[];
};

/**
 * A columns block whose cells are add-on cards rather than free layout.
 *
 * The price and the icon are lifted into the card's header; every other block
 * is handed back untouched. Picking out a title and some paragraphs instead
 * looked tidier and quietly dropped content — the subscription tiers carry an
 * h4 plan name above their h3, and that name vanished.
 */
export function asAddonCards(
  block: Extract<Block, { type: "columns" }>,
): AddonCard[] | null {
  const cards = block.cols.map((col) => {
    /*
      Only look for the card's own price and icon *above* any price ladder.

      `find` over the whole column took the first £ heading and the first icon
      wherever they were — and on /car-lovers-club the first of each belongs to
      the Small Car rung of the tier's own ladder. Lifting them into the card
      header put "£55 p/m" on the card as though it were the package price, and
      left the ladder starting at Medium: the Small tier vanished off the page.
    */
    const ladder = ladderStart(col);
    const pool = ladder === -1 ? col : col.slice(0, ladder);
    const priceBlock = pool.find(isPrice);
    const iconBlock = pool.find(isIcon);
    return {
      price: text(priceBlock),
      icon: iconBlock as Extract<Block, { type: "image" }> | undefined,
      rest: col.filter((b) => b !== priceBlock && b !== iconBlock),
      hasTitle: col.some((b) => b.type === "heading" && !isPrice(b)),
      hasLadder: ladder !== -1,
    };
  });

  // Only treat it as a card row when the cells genuinely share that shape. A
  // cell that prices itself through a ladder counts as priced.
  const solid = cards.filter((c) => (c.price || c.hasLadder) && c.hasTitle).length;
  if (solid < 2 || solid < block.cols.length - 1) return null;
  return cards.map(({ price, icon, rest }) => ({ price, icon, rest }));
}

/**
 * Where a column's vehicle-class ladder begins — the first `icon → h3 →
 * (note) → £heading` run long enough for `group` to collapse into a table.
 * Returns -1 when the column has no ladder.
 */
function ladderStart(col: Block[]): number {
  for (let i = 0; i < col.length; i++) {
    let j = i;
    let rungs = 0;
    for (;;) {
      const icon = col[j];
      const label = col[j + 1];
      if (!isIcon(icon) || label?.type !== "heading" || label.level !== 3) break;
      const maybeNote = col[j + 2];
      const hasNote = maybeNote?.type === "paragraph" && !isPrice(maybeNote);
      if (!isPrice(col[j + (hasNote ? 3 : 2)])) break;
      rungs++;
      j += hasNote ? 4 : 3;
    }
    if (rungs >= 2) return i;
  }
  return -1;
}

/* ── Lists that are not lists ─────────────────────────────────────────────
   Three quarters of the bullet lists on this site are structured content the
   source had no component for. Rendered as bullets they are a wall of grey
   sentences; recognising the shape is what turns a page into a layout.

     "<b>Cloudy or Dull Lenses:</b><br> If your headlights still look…"
     "<strong>Wet Sanding:</strong> Using a multi-stage process…"
     "Enhanced Safety: Cloudy or damaged headlights reduce…"

   All three are one idea — a short label and its explanation. */

export type Feature = { title: string; body: string };

function titleBody(itemHtml: string): Feature | null {
  const s = unbullet(clean(itemHtml));

  const tagged = s.match(/^\s*<(b|strong)>([\s\S]*?)<\/\1>\s*(?:<br\s*\/?>)?\s*([\s\S]*)$/i);
  if (tagged) {
    const title = textOnly(tagged[2]).replace(/\s*[:–—-]\s*$/, "");
    // The separator sits inside the label on some pages and outside it on
    // others — "<strong>Wet Sanding:</strong> …" against
    // "<strong>Interior Light Clean</strong> – …". Either way it is punctuation
    // between the two, not the first word of the explanation.
    const body = clean(tagged[3]).replace(/^\s*(?:&[a-z]+;\s*)?[:–—-]\s*/i, "");
    if (title && textOnly(body)) return { title, body };
  }

  // The same shape with no markup at all. Capped at 64 characters so a
  // sentence that merely contains a colon is not mistaken for a label.
  const flat = textOnly(s);
  const colon = flat.match(/^([^:]{3,64}):\s+(\S[\s\S]{12,})$/);
  if (colon && !/^https?/i.test(colon[1])) return { title: colon[1].trim(), body: colon[2].trim() };

  return null;
}

/**
 * A list whose items are mostly label + explanation. Two is not a pattern and
 * a single stray label among plain bullets is not either, so it takes at least
 * three items with two thirds of them carrying a label.
 */
export function asFeatures(block: Extract<Block, { type: "list" }>): Feature[] | null {
  if (block.items.length < 3) return null;
  const parsed = block.items.map(titleBody);
  const found = parsed.filter(Boolean).length;
  if (found < 3 || found < block.items.length * 0.66) return null;
  // Items that did not parse keep their text as an untitled card rather than
  // being dropped.
  return parsed.map((p, i) => p ?? { title: "", body: unbullet(clean(block.items[i])) });
}

/**
 * A list of one- and two-word items — "Wash, Buff, In/Out Glass Shine, Light
 * Vacuum, Dashboard". Stacked one per line they take a third of the hero to
 * say five words; on one wrapped row they read as the summary they are.
 */
export function asTicks(block: Extract<Block, { type: "list" }>): string[] | null {
  if (block.ordered || block.items.length < 3) return null;
  const items = block.items.map((it) => unbullet(clean(it)));
  /*
    Deliberately tight. At five words and 34 characters this also swallowed
    the lists inside the blog posts — "Swirl marks from poor washing",
    "Pet hair embedded in seats" — which are sentences doing a list's job and
    belong stacked in an article. A label is four words at most.
  */
  const short = (s: string) => {
    const t = textOnly(s);
    return t.length > 0 && t.length <= 28 && t.split(/\s+/).length <= 4;
  };
  return items.every(short) ? items : null;
}

/** Does this fragment put anything on the page at all? */
export const hasContent = (html: string) =>
  Boolean(textOnly(html)) || /<(img|iframe|video|a\b)/i.test(clean(html));

/**
 * A paragraph that is a checklist typed on one line: "✅ Fully mobile across
 * London ✅ Expert technicians ✅ Free quotes". Ten of these across the blog,
 * and each rendered as a single run-on sentence with ticks buried in it.
 */
export function asInlineTicks(html: string): string[] | null {
  const s = clean(html);
  if ((s.match(/[✅✔✓]/gu) ?? []).length < 3) return null;
  // Only when the glyph is doing the work of a bullet — a paragraph that
  // merely mentions a tick has other text before the first one.
  if (textOnly(s.split(/[✅✔✓]/u)[0]).length > 12) return null;
  const parts = s
    .split(/[✅✔✓]️?/u)
    .map((p) => p.replace(/^\s*(?:<br\s*\/?>)?\s*/i, "").replace(/\s*(?:<br\s*\/?>)?\s*$/i, "").trim())
    .filter((p) => textOnly(p));
  return parts.length >= 3 ? parts : null;
}

/** Headings that mean the list under them is a sequence, not a set. */
const PROCESS =
  /\b(process|procedure|how (it|we|our|the)|step[s]?\b|stages?\b|what happens|our method|works)\b/i;

/** A sequence: an ordered list, or a labelled list under a process heading. */
export function isSequence(block: Extract<Block, { type: "list" }>, heading?: string) {
  return block.ordered || (Boolean(heading) && PROCESS.test(heading!));
}

/**
 * Label-and-explanation items as a card grid.
 *
 * The column count follows the item count rather than a fixed grid: four cards
 * across is right for four, and wrong for five, which lands one alone on a
 * second row.
 */
export function FeatureCards({
  items,
  onGold,
  numbered,
}: {
  items: Feature[];
  onGold?: boolean;
  /** Ordinals instead of ticks — for sets that read as a progression. */
  numbered?: boolean;
}) {
  const cols =
    items.length === 3
      ? "sm:grid-cols-3"
      : items.length === 4
        ? "sm:grid-cols-2 lg:grid-cols-4"
        : items.length <= 6
          ? "sm:grid-cols-2 lg:grid-cols-3"
          : "sm:grid-cols-2 lg:grid-cols-3";

  return (
    <ul className={`mt-7 grid gap-4 ${cols}`}>
      {items.map((it, i) => (
        <li
          key={i}
          className={`group relative flex flex-col overflow-hidden p-6 ${
            onGold ? "surface-on-gold" : "surface"
          }`}
        >
          {numbered ? (
            <span
              aria-hidden
              className="font-[family-name:var(--font-display)] text-[26px] leading-none text-white/[0.11] transition-colors duration-500 group-hover:text-gold/40"
            >
              {String(i + 1).padStart(2, "0")}
            </span>
          ) : (
            <Icon name="check" size={19} strokeWidth={2.4} className="text-gold" />
          )}

          {it.title && (
            <h3 className="mt-4 text-[17px] leading-snug font-semibold text-white">{it.title}</h3>
          )}
          <p
            className={`text-[15px] leading-[24px] font-normal text-body ${it.title ? "mt-2.5" : "mt-4"} [&_a]:text-gold [&_a:hover]:underline [&_strong]:text-white`}
            dangerouslySetInnerHTML={{ __html: it.body }}
          />

          <span
            aria-hidden
            className="absolute inset-x-0 bottom-0 h-[3px] origin-left scale-x-0 bg-gold transition-transform duration-500 ease-[var(--ease-out-expo)] group-hover:scale-x-100"
          />
        </li>
      ))}
    </ul>
  );
}

/**
 * The same items as a sequence, on a rail.
 *
 * A five-stage service written as five bullets tells you what happens; written
 * as a numbered run it tells you it is a process with an order, which is the
 * thing the page is actually selling.
 */
export function Steps({ items, light }: { items: Feature[]; light?: boolean }) {
  return (
    <ol className="relative mt-8">
      <span
        aria-hidden
        className={`absolute top-2 bottom-10 left-[23px] w-px ${
          light
            ? "bg-[linear-gradient(to_bottom,rgba(0,0,0,0.45),rgba(0,0,0,0.08))]"
            : "bg-[linear-gradient(to_bottom,rgba(193,146,49,0.55),rgba(255,255,255,0.06))]"
        }`}
      />
      {items.map((it, i) => (
        <li key={i} className="relative flex gap-5 pb-9 last:pb-0 sm:gap-6">
          <span
            className={`relative z-10 flex h-[47px] w-[47px] shrink-0 items-center justify-center rounded-full font-[family-name:var(--font-sub)] text-[16px] ${
              light ? "bg-ink text-gold ring-1 ring-ink/20" : "bg-ink-panel text-gold ring-1 ring-gold/40"
            }`}
          >
            {String(i + 1).padStart(2, "0")}
          </span>
          <div className="pt-2">
            {it.title && (
              <h3
                className={`text-[17px] leading-snug font-semibold lg:text-[18px] ${
                  light ? "text-ink" : "text-white"
                }`}
              >
                {it.title}
              </h3>
            )}
            <p
              className={`max-w-[62ch] text-[15.5px] leading-[25px] font-normal ${
                it.title ? "mt-1.5" : ""
              } ${light ? "text-ink/80" : "text-body"} [&_a]:text-gold [&_a:hover]:underline`}
              dangerouslySetInnerHTML={{ __html: it.body }}
            />
          </div>
        </li>
      ))}
    </ol>
  );
}

/**
 * A paragraph that is nothing but links separated by commas — the coverage
 * lists at the foot of the service pages, 40 of them across the site. As prose
 * it reads as one long gold sentence with no scanning structure; as chips each
 * area becomes a target you can find and click.
 */
export function asLinkChips(html: string) {
  const links = [...html.matchAll(/<a\s+href="([^"]+)"[^>]*>(.*?)<\/a>/gi)];
  if (links.length < 4) return null;
  // Everything outside the anchors must be punctuation and whitespace only.
  const between = html.replace(/<a[^>]*>.*?<\/a>/gi, "").replace(/<\/?[a-z][^>]*>/gi, "");
  if (/[^\s,;&·|/–—-]|&(?!amp;|nbsp;)/i.test(between.replace(/&amp;|&nbsp;/gi, " "))) return null;
  return links.map((m) => ({ href: m[1], label: m[2].replace(/<[^>]+>/g, "").trim() }));
}

export function LinkChips({
  chips,
  onGold,
}: {
  chips: { href: string; label: string }[];
  onGold?: boolean;
}) {
  return (
    <ul className="mt-6 flex flex-wrap gap-2">
      {chips.map((c) => (
        <li key={c.href + c.label}>
          <a
            href={c.href}
            className={`inline-flex rounded-full px-4 py-2 text-[14px] font-normal transition-colors ${
              onGold
                ? "bg-ink/10 text-ink ring-1 ring-ink/25 hover:bg-ink hover:text-white hover:ring-ink"
                : "bg-white/[0.05] text-white/80 ring-1 ring-white/10 hover:bg-gold hover:text-ink hover:ring-gold"
            }`}
          >
            {c.label}
          </a>
        </li>
      ))}
    </ul>
  );
}

export function Gallery({
  images,
}: {
  images: Extract<Block, { type: "image" }>[];
}) {
  /*
    Pairs read better side by side; longer runs step up to five, matching the
    homepage portfolio. At three across these 576px source images were painted
    at ~380px and went soft — the same problem the portfolio had.
  */
  const cols =
    images.length === 2
      ? "sm:grid-cols-2"
      : images.length <= 4
        ? "grid-cols-2 lg:grid-cols-4"
        : "grid-cols-2 sm:grid-cols-3 lg:grid-cols-5";
  return (
    <ul className={`mt-7 grid gap-3 ${cols}`}>
      {images.map((img, i) => (
        <li key={i} className="relative aspect-4/3 overflow-hidden rounded-[12px]">
          <Image
            src={img.src}
            alt={img.alt}
            fill
            sizes="(min-width: 1024px) 18vw, (min-width: 640px) 30vw, 46vw"
            className="object-cover"
          />
        </li>
      ))}
    </ul>
  );
}

/**
 * The price table is the commercial peak of a service page, and on a run of
 * otherwise black content it is the natural place for the brand gold. Type is
 * ink — white on this gold measures 2.83:1 — and the car icons are knocked to
 * ink to match.
 */
export function PriceGrid({ items }: { items: PriceItem[] }) {
  return (
    /*
      Sized off its own container, not the window.

      `lg:grid-cols-4` asks how wide the *viewport* is, but this grid is not
      always the width of the page: on /car-lovers-club the three subscription
      tiers each carry their own price ladder inside a 253px card, and four
      columns there gave 56px cells — "MEDIUM CAR" and "£60 p/m" printed over
      their neighbours. `@container` plus an auto-fit track means the same
      component reads correctly at 250px and at 1250px.
    */
    <div className="@container mt-9">
      {/*
        Narrow: tabs, because four cards stacked is four screens of scrolling
        inside a card that is a third of a column. Wide: one card per class,
        because seeing all four prices at once is the point of a price table.
        Both are rendered and the container query chooses.
      */}
      <div className="bg-gold-wash overflow-hidden rounded-[14px] @min-[560px]:hidden">
        <PriceTabs
          items={items.map((it) => ({
            icon: it.icon ? { src: it.icon.src, w: it.icon.w, h: it.icon.h } : undefined,
            label: it.label,
            note: it.note,
            price: it.price,
          }))}
        />
      </div>

      {/*
        A card per vehicle, with air between them. Run together as one slab of
        gold the four classes read as a single block you have to parse; apart,
        each is its own price you can point at.
      */}
      <ul className="hidden gap-3 [grid-template-columns:repeat(auto-fit,minmax(160px,1fr))] @min-[560px]:grid">
        {items.map((it, i) => (
          <li
            key={i}
            className="bg-gold-wash flex flex-col items-center rounded-[14px] px-4 py-6 text-center @min-[620px]:px-6 @min-[620px]:py-8"
          >
            {it.icon && (
              <Image
                src={it.icon.src}
                alt=""
                width={it.icon.w ?? 339}
                height={it.icon.h ?? 339}
                className="h-[42px] w-auto brightness-0 @min-[620px]:h-[56px]"
              />
            )}
            <h3 className="mt-3 font-[family-name:var(--font-sub)] text-[15px] tracking-[0.04em] text-ink uppercase @min-[620px]:mt-4 @min-[620px]:text-[17px]">
              {it.label}
            </h3>
            {it.note && (
              <p
                className="mt-2 text-[12.5px] leading-[19px] font-normal text-ink/85 @min-[620px]:text-[13px] @min-[620px]:leading-[20px]"
                dangerouslySetInnerHTML={{ __html: it.note }}
              />
            )}
            <p className="mt-auto pt-4 font-[family-name:var(--font-display)] text-[26px] leading-none text-ink @min-[620px]:pt-5 @min-[620px]:text-[34px]">
              {it.price}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function AddonCards({
  cards,
  renderBlocks,
  onGold,
}: {
  cards: AddonCard[];
  /** The ordinary block renderer, passed in to avoid a circular import. */
  renderBlocks: (blocks: Block[]) => React.ReactNode;
  /** Sitting on a gold band — the tile goes solid ink for contrast. */
  onGold?: boolean;
}) {
  return (
    /*
      `items-start`, so a card is only as tall as what is in it.

      A grid stretches its cells by default, and these four cards are wildly
      uneven — "Congestion Zone Surcharge" is one sentence, "Excessive Soiled
      Interior" is six. Stretched, the long one set the height for all four and
      the other three carried several hundred pixels of nothing underneath.
    */
    <ul className="mt-7 grid items-start gap-4 sm:grid-cols-2 lg:[grid-template-columns:repeat(auto-fit,minmax(250px,1fr))]">
      {cards.map((c, i) => (
        <li
          key={i}
          className={`flex flex-col p-6 ${onGold ? "surface-on-gold" : "surface"}`}
        >
          <div className="flex items-start justify-between gap-3">
            {c.icon ? (
              <Image
                src={c.icon.src}
                alt=""
                width={c.icon.w ?? 339}
                height={c.icon.h ?? 339}
                className="h-[46px] w-auto"
              />
            ) : (
              <span />
            )}
            {c.price && (
              <span
                className={`shrink-0 rounded-full px-3 py-1 font-[family-name:var(--font-ui)] text-[13px] font-semibold ${
                  onGold ? "bg-white text-ink" : "bg-gold text-ink"
                }`}
              >
                {c.price}
              </span>
            )}
          </div>

          {/*
            Tightens the first heading against the card header, and steps the
            body copy down: a card is a ~400px column, and the page's 16.5/28
            prose setting turned a six-sentence add-on into a 900px tower.
          */}
          {/*
            Direct children only. As descendant rules (`[&_p]`) these reached
            into anything the card happened to contain — a card holding a price
            ladder had its £60 set in 14.5px body type instead of the 24px
            display face the grid asks for.
          */}
          <div className="[&>*:first-child]:mt-4 [&>h3]:text-[16px] [&>h4]:text-[15px] [&>p]:mt-3 [&>p]:text-[14.5px] [&>p]:leading-[23px]">
            {renderBlocks(c.rest)}
          </div>
        </li>
      ))}
    </ul>
  );
}
