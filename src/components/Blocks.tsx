import Image from "next/image";
import {
  AddonCards,
  asAddonCards,
  asFeatures,
  asInlineTicks,
  asLinkChips,
  asReviewBadges,
  asRungCards,
  asTicks,
  CardRow,
  clean,
  FeatureCards,
  Gallery,
  group,
  hasContent,
  isSequence,
  LinkChips,
  PriceGrid,
  ReviewBadges,
  Steps,
  unbullet,
} from "@/components/blocks-groups";
import EnquiryForm from "@/components/EnquiryForm";
import FaqAccordion from "@/components/FaqAccordion";
import Icon from "@/components/Icon";
import Reveal from "@/components/Reveal";
import PackageTabs from "@/components/PackageTabs";
import TableCards from "@/components/TableCards";
import { type Block, getForms, type Section } from "@/lib/blocks";
import { BOOK_URL } from "@/lib/site";
import { DEFAULT_ACCENT, parseTable, shortLabel, TIER_ACCENT } from "@/lib/table-model";

/**
 * The container width at which a table stops needing to be re-read, by how
 * many packages it compares. Written out rather than computed because these
 * class names have to survive Tailwind's scanner.
 *
 * The numbers are the table's own: roughly 200px for the feature name, 240px
 * for its description and 110px per verdict column. Below that the columns
 * start colliding, and a `<table>` answers a squeeze with a scrollbar.
 */
const WIDE_ENOUGH: Record<number, { table: string; cards: string }> = {
  1: { table: "hidden @min-[560px]:block", cards: "@min-[560px]:hidden" },
  2: { table: "hidden @min-[720px]:block", cards: "@min-[720px]:hidden" },
  3: { table: "hidden @min-[820px]:block", cards: "@min-[820px]:hidden" },
  4: { table: "hidden @min-[820px]:block", cards: "@min-[820px]:hidden" },
  5: { table: "hidden @min-[990px]:block", cards: "@min-[990px]:hidden" },
};

/**
 * A block that is only a card flag — "MOST POPULAR" over a package name.
 *
 * 107 pages carry one, and the source is inconsistent about it: 60 write it as
 * an `<h3>` above the package's own `<h3>`, 39 as a paragraph, the rest as a
 * paragraph over a list. Rendered literally it is a heading with nothing under
 * it, which is how it read on the location and valeting pages — a shouty line
 * of its own above the card title instead of a flag on the card.
 *
 * Nothing but this one label qualifies: a short, fully capitalised phrase that
 * says popular. Anything longer is a real heading.
 */
const BADGE = /^\s*(most\s+popular|popular|best\s+seller|bestseller)\s*$/i;

const isBadge = (text: string) => {
  const t = text.replace(/&nbsp;/gi, " ").replace(/\s+/g, " ").trim();
  return Boolean(t) && t === t.toUpperCase() && BADGE.test(t);
};

function Badge({ text, onGold }: { text: string; onGold?: boolean }) {
  return (
    <p className="mt-6 first:mt-0">
      <span
        className={`inline-flex rounded-full px-3 py-1.5 font-[family-name:var(--font-ui)] text-[10px] font-semibold tracking-[0.14em] uppercase ${
          onGold ? "bg-ink text-gold" : "bg-gold text-ink"
        }`}
      >
        {text.replace(/&nbsp;/gi, " ").trim()}
      </span>
    </p>
  );
}

/**
 * A paragraph that is really a heading.
 *
 * Eleven blog posts and a handful of service pages are written as one long run
 * of paragraphs with their section titles typed inside them — bold on their
 * own line ("Comprehensive Detailing on the Go"), numbered ("1. Why London
 * Winters Damage Your Car"), or flagged with the author's own bullet ("• Road
 * Salt & Grit", "✔ Full Decontamination"). The live site prints them as body
 * copy too, which is why those posts scroll for four thousand characters with
 * a single heading in them.
 *
 * Nothing is moved or reworded — the line is set as the heading it already is.
 * The three tests are deliberately narrow: short, no sentence-ending
 * punctuation, and a marker the author put there on purpose. 103 all-bold
 * lines across 33 pages match, and every one of them is a section title.
 */
const NUMBERED = /^\d{1,2}\.\s+\S/;
/** An emoji or a keycap digit, which is how four of the posts flag a title. */
const PICTOGRAPH = /^(?:\p{Extended_Pictographic}|\d️?⃣)/u;
const FLAGGED = /^[•✔✓]\s*\S/u;
const ALL_BOLD = /^\s*<(?:strong|b)>[\s\S]*<\/(?:strong|b)>\s*$/i;

function asLeadIn(html: string): { text: string; flagged?: boolean } | null {
  const text = clean(html)
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/\s+/g, " ")
    .trim();
  if (!text || /[.!?]$/.test(text)) return null;

  if (ALL_BOLD.test(clean(html)) && text.length >= 6 && text.length <= 90) return { text };
  if (NUMBERED.test(text) && text.length <= 90) return { text };
  if (PICTOGRAPH.test(text) && text.length <= 90) return { text };
  if (FLAGGED.test(text) && text.length <= 70) {
    return { text: text.replace(FLAGGED, (m) => m.replace(/^[•✔✓]\s*/u, "")), flagged: true };
  }
  return null;
}

function LeadIn({
  text,
  flagged,
  light,
}: {
  text: string;
  flagged?: boolean;
  light?: boolean;
}) {
  return (
    <p
      className={`mt-9 flex items-start gap-2.5 text-[18px] leading-snug font-semibold first:mt-0 lg:text-[19px] ${
        light ? "text-ink" : "text-white"
      }`}
    >
      {flagged && (
        <Icon name="check" size={18} strokeWidth={2.4} className="mt-[3px] shrink-0 text-gold" />
      )}
      {text}
    </p>
  );
}

/* Shared inline-link styling for any HTML we inject from the source site. */
/*
  `break-words` because nine posts paste a bare URL as the link text —
  "https://medusaautodetailing.co.uk/detailing/" is 44 characters with nothing
  to break on, so on a phone it ran past the edge of its column.
*/
const PROSE =
  "break-words [&_a]:text-gold [&_a:hover]:underline [&_strong]:text-white";

/*
  The same, for copy set on a gold band. Gold links measured 1:1 against the
  band they sat on — a phone number on /car-van-stickers-removal was invisible
  — and bold runs went white at 2.8:1. Ink for both: the link keeps its
  underline on hover to stay tellable from the sentence around it.
*/
const PROSE_ON_GOLD =
  "break-words [&_a]:text-ink [&_a]:underline [&_a]:decoration-ink/40 [&_a:hover]:decoration-ink [&_strong]:text-ink";

/** Whichever of the two the surface calls for. */
const prose = (light?: boolean) => (light ? PROSE_ON_GOLD : PROSE);

/**
 * Forms need to know which page and which form-on-that-page they are, so the
 * server action can re-read their schema. `forms` holds the page's form blocks
 * in document order; identity lookup against it gives each one its index.
 */
type Ctx = {
  slug: string;
  forms: Block[];
  /** The one heading per section that carries the speed rule. */
  ruleOn?: Block;
  /** The section's own background is light, so copy has to be ink. */
  light?: boolean;
  /** Rendering on a gold band — cards and chips invert. */
  onGold?: boolean;
  /**
   * Text of the nearest heading above the block being rendered. A list of
   * labelled items is a grid of cards under "Signs Your Headlights Need
   * Restoration" and a numbered sequence under "The Restoration Process" —
   * same markup, different thing, and only the heading says which.
   */
  heading?: string;
  /** Headings that repeat the page title and should not render at all. */
  drop?: Set<Block>;
  /** Extra `<h1>`s, rendered as the section headings they actually are. */
  demote?: Set<Block>;
  /**
   * Rendering the run of actions pinned to a card's foot, where more than one
   * button sits together and one of them has to lead — see the `button` case.
   */
  actionRow?: boolean;
  /**
   * Paragraphs that are section titles the author typed into the prose.
   * Decided in `Sections`, where the following block can be looked at — a
   * marker alone is not enough, because the same "✅ …" opens a list item.
   */
  leadIn?: Set<Block>;
};

/**
 * Some extracted sections carry their own background colour, and 86 of them
 * across 20 pages are the brand gold. White copy on that gold measures 2.83:1,
 * so those sections flip to ink.
 *
 * Cards keep their own dark surface and white text either way — this only
 * governs copy sitting directly on the section.
 */
function isLightBackground(bg: Section["bg"]): boolean {
  if (!bg || bg.image) return false;
  const hex =
    (bg.color?.match(/#[0-9a-f]{3,8}/i) ?? bg.gradient?.match(/#[0-9a-f]{3,8}/i))?.[0];
  if (!hex) return false;

  let h = hex.slice(1);
  if (h.length === 3) h = [...h].map((c) => c + c).join("");
  const channel = (i: number) => {
    const v = parseInt(h.slice(i, i + 2), 16) / 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  };
  const luminance = 0.2126 * channel(0) + 0.7152 * channel(2) + 0.0722 * channel(4);
  return luminance > 0.18;
}

/** First level-2 heading in a section, columns included. */
function leadHeading(blocks: Block[]): Block | undefined {
  for (const b of blocks) {
    if (b.type === "heading" && b.level === 2) return b;
    if (b.type === "columns") {
      for (const col of b.cols) {
        const found = leadHeading(col);
        if (found) return found;
      }
    }
  }
  return undefined;
}

/**
 * What the eye reads as one surface. Sections are WordPress rows, not visual
 * sections: most pages are a run of rows that all sit on the same black, and
 * padding each one top and bottom put ~200px of nothing between paragraphs
 * that belong together.
 */
const surfaceOf = (bg: Section["bg"]) =>
  bg?.image ?? bg?.gradient ?? bg?.color ?? "none";

/* ── Rows into sections ───────────────────────────────────────────────────
   A WordPress row is a unit of editing, not a unit of design, and the
   difference only started to show once every other row took a gold band: on
   /car-valeting the band fell between "FAQs" and the questions under it, and
   again between "Book a Mobile Car Cleaning Today" and its own Book Now
   button. Three shapes account for all of it, and all three are re-partitions
   — no block is added, dropped or reordered. */

const onlyHeadings = (s: Section) =>
  s.blocks.length > 0 && s.blocks.every((b) => b.type === "heading");

const onlyButtons = (s: Section) =>
  s.blocks.length > 0 && s.blocks.every((b) => b.type === "button");

/**
 * A row that is a heading and, at most, the lede under it — a title with no
 * content of its own. `/car-detailing/mini-detail` puts "Want added
 * protection?…" and its sentence in one row and the four price cards it
 * introduces in the next; the band fell between them.
 */
const isLede = (s: Section) =>
  s.blocks[0]?.type === "heading" &&
  s.blocks[0].level === 2 &&
  s.blocks.slice(1).every((b) => b.type === "paragraph");

/** A row that opens with a heading is announcing itself, not continuing. */
const opensItself = (s: Section) => s.blocks[0]?.type === "heading";

const sameSurface = (a: Section, b: Section) => surfaceOf(a.bg) === surfaceOf(b.bg);

const plainLength = (html: string) => html.replace(/<[^>]+>/g, "").trim().length;

/**
 * A row holding two complete statements — heading, copy, heading, copy — with
 * nothing else in it. Four of these exist; every other multi-h2 row is a blog
 * post's body, which is one argument and must not be cut up.
 */
function isTwoStatements(s: Section): boolean {
  if (s.blocks.length > 8) return false;
  const heads = s.blocks.filter((b) => b.type === "heading" && b.level === 2).length;
  if (heads < 2) return false;
  return s.blocks.every(
    (b) => (b.type === "heading" && b.level === 2) || b.type === "paragraph",
  );
}

/**
 * A row that holds several whole topics is several rows.
 *
 * A quarter of the site ships as one row per page — /mobile-car-wash is a
 * single row carrying eight h2s, an entire page of pricing, add-ons, a
 * gallery and the FAQ. One row is one band, so the alternation had nothing to
 * alternate over and the whole page came out gold.
 *
 * The cut is made on `group()`'s boundaries, not on raw block indices, so a
 * price ladder, an add-on run, a gallery or a flattened tab set is never cut
 * through: each piece re-groups to exactly what the whole row grouped to. A
 * heading that is only a price is not a topic — those are `£115` set as an h2
 * inside a ladder, and they open nothing.
 */
function splitTopics(s: Section): Section[] {
  const breaks: number[] = [];
  for (const g of group(s.blocks)) {
    if (g.at === 0 || g.kind !== "block") continue;
    const b = g.block;
    if (b.type !== "heading" || b.level !== 2) continue;
    if (/^\s*(from\s*)?£\s*[\d,]/i.test(b.text)) continue;
    breaks.push(g.at);
  }
  if (!breaks.length) return [s];

  const out: Section[] = [];
  const edges = [0, ...breaks, s.blocks.length];
  for (let i = 0; i < edges.length - 1; i++) {
    const blocks = s.blocks.slice(edges[i], edges[i + 1]);
    if (blocks.length) out.push({ bg: s.bg, blocks });
  }
  return out;
}

/** A section as rendered, and the source rows it came from. */
type Regrouped = { section: Section; sources: Section[] };

function regroup(sections: Section[], topics: boolean): Regrouped[] {
  /*
    1. One row per topic. Only where the bands alternate: that is what the cut
       is for, and a blog post — which renders with the content-led rhythm —
       is one argument that must stay in one piece however many h2s it carries.
  */
  const byTopic: Regrouped[] = sections.flatMap((source) =>
    (topics ? splitTopics(source) : [source]).map((section) => ({ section, sources: [source] })),
  );

  // 2. Two statements in one row are two rows.
  const split: Regrouped[] = [];
  for (const { section: s, sources } of byTopic) {
    if (!isTwoStatements(s)) {
      split.push({ section: s, sources });
      continue;
    }
    let blocks: Block[] = [];
    const flush = () => {
      if (blocks.length) split.push({ section: { bg: s.bg, blocks }, sources });
      blocks = [];
    };
    for (const b of s.blocks) {
      if (b.type === "heading" && blocks.length) flush();
      blocks.push(b);
    }
    flush();
  }

  /*
    3. A row that is only a heading — or a heading and its lede — is the title
       of the row under it. 211 of the first kind, "FAQs" among them, and 148
       of the second.
    4. A row that is only a button is the call to action of the row above it.

    A lede only joins a row that does not open with a heading of its own: a
    row that announces itself is its own topic, which is what keeps two
    closing statements apart on /car-valeting.

    Both only when the two rows already sit on the same surface: a heading
    joining a row that carries its own photograph would be moved onto that
    photograph, which is a design decision rather than a regrouping.
  */
  const out: Regrouped[] = [];
  for (let i = 0; i < split.length; i++) {
    const cur = split[i];
    const next = split[i + 1];
    const title =
      onlyHeadings(cur.section) || (isLede(cur.section) && next && !opensItself(next.section));
    if (title && next && sameSurface(cur.section, next.section)) {
      split[i + 1] = {
        section: { bg: next.section.bg, blocks: [...cur.section.blocks, ...next.section.blocks] },
        sources: [...cur.sources, ...next.sources],
      };
      continue;
    }
    const prev = out[out.length - 1];
    if (onlyButtons(cur.section) && prev && sameSurface(cur.section, prev.section)) {
      out[out.length - 1] = {
        section: { bg: prev.section.bg, blocks: [...prev.section.blocks, ...cur.section.blocks] },
        sources: [...prev.sources, ...cur.sources],
      };
      continue;
    }
    out.push(cur);
  }
  return out;
}

/** A heading, one short paragraph, and any buttons that follow it. */
function isStatement(s: Section): boolean {
  const [head, body, ...rest] = s.blocks;
  if (head?.type !== "heading" || head.level !== 2) return false;
  if (body?.type !== "paragraph") return false;
  if (!rest.every((b) => b.type === "button")) return false;
  return plainLength(body.html) < 420;
}

const hasButton = (s: Section) => s.blocks.some((b) => b.type === "button");

/**
 * The page signing off: a closing statement that carries the call to action,
 * or the one immediately above it that sets it up.
 *
 * Set centred across the full width instead of in the narrow article column.
 * A statement anywhere else on the page is left alone — mid-page these are
 * product blurbs, and /ceramic-coating alone has several. The pairing with a
 * button is what tells the two apart, and it holds for four sections in the
 * whole site.
 */
function closingStatements(sections: Section[]): boolean[] {
  return sections.map((s, i) => {
    if (!isStatement(s)) return false;
    const next = sections[i + 1];
    return hasButton(s) || Boolean(next && isStatement(next) && hasButton(next));
  });
}

/**
 * Which sections carry the brand gold.
 *
 * The homepage punctuates a dark scroll with three gold bands; a service page
 * that is black end to end reads as a different site. Rather than painting
 * every other row — which lands gold wherever the source happened to split a
 * paragraph — the band goes to the two sections that are actually a moment:
 * the add-on cards and the coverage list. With the gold price panel that gives
 * three gold beats per page, the same rhythm as the homepage.
 *
 * Sections that already carry their own background keep it.
 */
function goldBands(sections: Section[]): boolean[] {
  return sections.map((s, i) => {
    // A photograph or a genuinely light background is a design decision worth
    // keeping. A black gradient is not — most of these rows carry one, and
    // preserving it would mean no service page ever gets a band.
    if (i === 0 || s.bg?.image || isLightBackground(s.bg)) return false;
    // Add-ons arrive either loose in the stream or inside a columns block.
    const groups = group(s.blocks);
    const hasAddons =
      groups.some((g) => g.kind === "addonCards") ||
      s.blocks.some((b) => b.type === "columns" && asAddonCards(b) !== null);
    const hasChips = s.blocks.some(
      (b) => b.type === "paragraph" && asLinkChips(b.html) !== null,
    );
    return hasAddons || hasChips;
  });
}

/**
 * Black, gold, black.
 *
 * In this mode the renderer owns the background of every row: a row's own
 * colour is dropped, because the source's colours do not alternate. The
 * location pages ship their own run of gold rows and /mobile-car-wash ships
 * none at all, and honouring either left the page in long stretches of one
 * colour — which is the thing the alternation exists to prevent.
 *
 * Two rows are exempt. A row carrying a photograph keeps it, and does not
 * move the rhythm on. And the page's own header is left as the source painted
 * it — it is the one row on the page that is already a designed surface.
 */
function alternating(
  sections: Section[],
  opensPage: boolean,
  startGold = true,
): { gold: boolean[]; next: boolean } {
  let wantGold = startGold;
  const gold = sections.map((s, i) => {
    if (opensPage && i === 0) {
      // A light header hands the dark half of the first pair to the row below.
      if (isLightBackground(s.bg)) wantGold = false;
      return false;
    }
    if (s.bg?.image) return false;
    const band = wantGold;
    wantGold = !wantGold;
    return band;
  });
  return { gold, next: wantGold };
}

/**
 * The colour the next band wants, for a frame that puts a band of its own
 * after — or in the middle of — a body it renders with `bands="alternate"`.
 *
 * Client, 2026-09-22: "pastikan warna bg tetap selang seling". A frame that
 * hard-codes its own band's colour cannot keep that promise: on the fourteen
 * borough hubs whose body ends gold, `LocationPage`'s gold "How It works" row
 * made a slab of two, and the services band on `/mobile-car-wash` landed ink
 * under an ink one. Both now ask.
 *
 * The regrouping has to happen here, because `Sections` is what merges rows —
 * a frame counting its own sections would count the wrong ones.
 */
export function bandAfter(sections: Section[], startGold = true): boolean {
  const rows = regroup(sections, true).map((g) => g.section);
  return alternating(rows, false, startGold).next;
}

/** The rows whose background the alternation paints, dark ones included. */
function paintedRows(
  sections: Section[],
  bands: string,
  opensPage: boolean,
): boolean[] {
  if (bands !== "alternate") return sections.map(() => false);
  return sections.map((s, i) => !(opensPage && i === 0) && !s.bg?.image);
}

/** Every block on the page in document order, columns flattened into place. */
function inOrder(blocks: Block[], into: Block[]) {
  for (const b of blocks) {
    if (b.type === "columns") b.cols.forEach((c) => inOrder(c, into));
    else into.push(b);
  }
  return into;
}

const sameText = (a: string, b: string) =>
  a.replace(/[^\p{L}\p{N}]+/gu, " ").trim().toLowerCase() ===
  b.replace(/[^\p{L}\p{N}]+/gu, " ").trim().toLowerCase();

export function Sections({
  sections,
  slug,
  bands = "content",
  pageH1,
  h1Taken = false,
  opensPage = true,
  startGold = true,
  panel,
}: {
  sections: Section[];
  slug: string;
  /**
   * `content` puts gold where the page has a moment worth marking.
   * `alternate` bands every other eligible section — a louder rhythm, used by
   * the editorial preview.
   * `none` leaves every row alone, for callers whose sections are not the
   * source's own — the location frame cuts five borough pages into rows
   * itself, and banding rows we invented would invent a design decision too.
   */
  bands?: "content" | "alternate" | "none";
  /** The page's own title, for spotting a content heading that repeats it. */
  pageH1?: string;
  /** The page has already rendered an h1 of its own — the post header does. */
  h1Taken?: boolean;
  /**
   * These sections open the page. False when a hand-built header sits above
   * them — the valeting frame does — so the first row is a body row and does
   * not take the 190px header padding or the opening light source.
   */
  opensPage?: boolean;
  /**
   * Where the black-gold-black rhythm picks up. A frame rendering one body in
   * two calls with a band of its own between them passes the opposite of that
   * band's colour — see `bandAfter`.
   */
  startGold?: boolean;
  /**
   * Sections to set inside a panel rather than flat on the page — used for
   * the merged price-and-extras row, which has to be findable at a glance.
   */
  panel?: Set<Section>;
}) {
  /*
    Some source posts mark every section heading as an <h1>: one carries
    thirteen, and the first of them repeats the post title the header has
    already set. Rendered faithfully that is thirteen 52px display headings
    down one article, and the title twice in a row at the top.

    So the first h1 stands and the rest step down to h2 — except one that is
    simply the page title again, which is dropped. Nothing else moves; these
    are section headings that were tagged wrong, and treating them as such is
    both the better outline and the better page.
  */
  /*
    The source's rows, re-partitioned into what the eye reads as a section —
    see `regroup`. Nothing is added or dropped, so everything below can be
    written against the result as though the content file had shipped it.
  */
  const grouped = regroup(sections, bands === "alternate");
  const rows = grouped.map((g) => g.section);
  // `panel` is keyed on the caller's own section objects; a regrouped row
  // inherits the flag from whichever source rows it was built from.
  const panelled = panel
    ? new Set(grouped.filter((g) => g.sources.some((x) => panel.has(x))).map((g) => g.section))
    : undefined;

  const drop = new Set<Block>();
  const demote = new Set<Block>();
  const ordered = rows.reduce<Block[]>((acc, s) => inOrder(s.blocks, acc), []);
  const headings = ordered.filter((b) => b.type === "heading");

  // The post header has already printed the title; a copy of it opening the
  // article is the same words twice. Two posts lead with it as an h1 and again
  // as an h2, so this takes both.
  if (h1Taken && pageH1) {
    for (const h of headings.slice(0, 2)) {
      if (h.type === "heading" && sameText(h.text, pageH1)) drop.add(h);
      else break;
    }
  }

  // A heading with nothing under it but the same heading again. Four of these
  // across the site — /aircraft-cleaning prints "Disinfection Services" twice
  // in a row. The second one owns the content, so the first goes.
  for (let i = 0; i < ordered.length - 1; i++) {
    const a = ordered[i];
    const b = ordered[i + 1];
    if (a.type === "heading" && b.type === "heading" && sameText(a.text, b.text)) drop.add(a);
  }

  // Extra <h1>s render as the section headings they actually are.
  headings.forEach((b) => {
    if (b.type !== "heading" || b.level !== 1 || drop.has(b)) return;
    const first = headings.find((h) => h.type === "heading" && h.level === 1 && !drop.has(h));
    if (h1Taken || b !== first) demote.add(b);
  });

  /*
    A typed section title is a marker *and* a paragraph of real prose under it.
    Without the second half, "✅ The difference between valeting and detailing"
    — one of four bulleted lines in a row on the valeting guide — would be set
    as a heading over the next bullet.
  */
  const leadIn = new Set<Block>();
  ordered.forEach((b, i) => {
    if (b.type !== "paragraph" || !asLeadIn(b.html)) return;
    const next = ordered[i + 1];
    if (next?.type !== "paragraph" || asLeadIn(next.html)) return;
    // 40 characters is enough: the test that matters is the line above —
    // the next block must be prose, not another marker line.
    if (clean(next.html).replace(/<[^>]+>/g, "").trim().length >= 40) leadIn.add(b);
  });

  const ctx: Ctx = { slug, forms: getForms(slug), drop, demote, leadIn };
  const gold =
    bands === "none"
      ? rows.map(() => false)
      : bands === "alternate"
        ? alternating(rows, opensPage, startGold).gold
        : goldBands(rows);
  const painted = paintedRows(rows, bands, opensPage);
  // A gold band is its own surface, so the seam either side keeps full padding.
  const surface = (i: number) =>
    gold[i] ? "gold" : painted[i] ? "ink" : surfaceOf(rows[i].bg);
  const centred = closingStatements(rows);

  return (
    <>
      {rows.map((s, i) => (
        <SectionBlock
          key={i}
          section={s}
          first={opensPage && i === 0}
          panel={panelled?.has(s)}
          gold={gold[i]}
          painted={painted[i]}
          statement={centred[i]}
          // Generous padding only where the surface actually changes.
          openSurface={i > 0 && surface(i - 1) === surface(i)}
          closeSurface={i < rows.length - 1 && surface(i + 1) === surface(i)}
          ctx={ctx}
        />
      ))}
    </>
  );
}

function SectionBlock({
  section,
  first,
  gold,
  painted,
  openSurface,
  closeSurface,
  panel,
  statement,
  ctx,
}: {
  section: Section;
  first: boolean;
  /**
   * The alternation owns this row's background. Its own colour is dropped —
   * see `alternating` — so a row the source painted gold can take the dark
   * half of a pair and still read as dark.
   */
  painted?: boolean;
  /** The page signing off — centred across the full width. */
  statement?: boolean;
  /** Set the row inside a bordered panel with a gold edge along its top. */
  panel?: boolean;
  /** Render this section as a gold band. */
  gold?: boolean;
  /** Previous section shares this background — do not re-pad the seam. */
  openSurface?: boolean;
  /** Next section shares this background. */
  closeSurface?: boolean;
  ctx: Ctx;
}) {
  const bg = section.bg;
  const style: React.CSSProperties = {};
  if (bg?.gradient) style.background = bg.gradient;
  else if (bg?.color) style.backgroundColor = bg.color;

  const hasImage = Boolean(bg?.image);
  // The opening section of a service page is its header. Given a photograph it
  // gets hero treatment — more height and a directional scrim — rather than the
  // flat 80% wash every other backgrounded row uses.
  const isHero = first && hasImage;

  /*
    Three tiers rather than one. A continuing surface barely breaks; a change
    of surface gets a real but not cavernous break; only the header keeps the
    generous opening. Padding every row 96px top and bottom put ~220px of
    nothing between paragraphs that read as one passage.
  */
  const padTop = isHero
    ? "pt-[190px] lg:pt-[250px]"
    : first
      ? "pt-[150px] lg:pt-[190px]"
      : openSurface
        ? "pt-9 lg:pt-12"
        : "pt-16 lg:pt-[104px]";

  const padBottom = closeSurface
    ? "pb-9 lg:pb-12"
    : isHero
      ? "pb-14 lg:pb-20"
      : "pb-16 lg:pb-[104px]";

  if (panel) {
    /*
      A panel, not a band. The row holds the price table — which is itself
      gold — so banding it would put gold on gold; the frame and the gold rule
      along its top do the work of marking it instead.
    */
    return (
      <section className="w-full py-16 lg:py-[104px]">
        <div className="shell">
          <div className="surface overflow-hidden border-t-[3px] border-gold px-6 py-10 lg:px-12 lg:py-14">
            <BlockList
              blocks={section.blocks}
              ctx={{ ...ctx, ruleOn: leadHeading(section.blocks) }}
            />
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      className={`relative w-full ${padTop} ${padBottom} ${
        gold ? "bg-gold-wash" : painted ? "bg-black" : ""
      }`}
      style={gold || painted ? undefined : style}
    >
      {hasImage && (
        <>
          <div
            aria-hidden
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${bg!.image})` }}
          />
          {isHero ? (
            <div
              aria-hidden
              className="absolute inset-0 bg-[linear-gradient(78deg,rgba(0,0,0,0.94)_0%,rgba(0,0,0,0.78)_46%,rgba(0,0,0,0.55)_100%)]"
            />
          ) : (
            <div
              aria-hidden
              className="absolute inset-0"
              style={{
                backgroundColor: bg!.overlay ?? "#000000",
                opacity: bg!.overlayOpacity ?? 0.8,
              }}
            />
          )}
        </>
      )}
      {/*
        Not on a gold band. The scrim is there to hold text off a photograph,
        and where the mirror lost the photograph it is a black film over
        nothing. Left on, it took the band to 20% gold and printed the ink
        type the band asks for onto near-black — /car-valeting/pre-sale-valet
        was unreadable. `style` is skipped for the same reason a line above.
      */}
      {!hasImage && !gold && !painted && bg?.overlay && (
        <div
          className="absolute inset-0"
          style={{ backgroundColor: bg.overlay, opacity: bg.overlayOpacity ?? 1 }}
        />
      )}

      {/* Most service pages open on flat black because the source row carried
          no photograph. One light source behind the headline gives the page
          somewhere to start without inventing imagery it does not have. */}
      {first && !hasImage && !gold && (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(70% 55% at 12% 22%, rgba(193,146,49,0.15) 0%, rgba(193,146,49,0.05) 38%, transparent 70%)",
          }}
        />
      )}

      <Reveal className={`relative ${statement ? "shell statement" : "shell-article"}`}>
        <BlockList
          blocks={section.blocks}
          ctx={{
            ...ctx,
            ruleOn: leadHeading(section.blocks),
            // A row the alternation painted dark is dark, whatever colour
            // the source gave it.
            light: gold || (!painted && isLightBackground(bg)),
            onGold: gold || (!painted && isLightBackground(bg)),
          }}
        />
      </Reveal>
    </section>
  );
}

export function BlockList({ blocks, ctx }: { blocks: Block[]; ctx: Ctx }) {
  // Repeating price runs collapse into a single grid before rendering.
  const groups = group(blocks);

  // The heading in force at each position, resolved up front — a list needs to
  // know what it sits under, and threading it through the map body would mean
  // mutating during render.
  const headings: (string | undefined)[] = [];
  let current = ctx.heading;
  for (const g of groups) {
    if (g.kind === "block" && g.block.type === "heading") current = g.block.text;
    headings.push(current);
  }

  return (
    <>
      {groups.map((g, i) => {
        if (g.kind === "tabs") {
          return (
            <PackageTabs
              key={i}
              panels={g.panels.map((panel) => ({
                label: panel.label,
                content: <BlockList blocks={panel.blocks} ctx={ctx} />,
                // The nav label is already the source's own short form
                // ("Pandora", not "Pandora – Bronze"), so it lines up with
                // TIER_ACCENT's keys without another shortLabel() pass.
                accent: TIER_ACCENT[panel.label],
              }))}
            />
          );
        }
        if (g.kind === "cardRow") {
          return (
            <CardRow
              key={i}
              cells={g.cells}
              onGold={ctx.onGold}
              renderBlocks={(cell, opts) => (
                <BlockList
                  blocks={cell}
                  // The card is a dark surface even on a gold band.
                  ctx={{ ...ctx, light: false, onGold: false, actionRow: opts?.actions }}
                />
              )}
            />
          );
        }
        if (g.kind === "priceGrid") {
          return <PriceGrid key={i} items={g.items} onGold={ctx.onGold} />;
        }
        if (g.kind === "gallery") return <Gallery key={i} images={g.images} />;
        if (g.kind === "addonCards") {
          return (
            <AddonCards
              key={i}
              cards={g.cards}
              onGold={ctx.onGold}
              renderBlocks={(rest) => (
                <BlockList
                  blocks={rest}
                  ctx={{ ...ctx, light: false, onGold: false }}
                />
              )}
            />
          );
        }
        return <BlockView key={i} block={g.block} ctx={{ ...ctx, heading: headings[i] }} />;
      })}
    </>
  );
}

function BlockView({ block, ctx }: { block: Block; ctx: Ctx }) {
  switch (block.type) {
    case "heading":
      if (ctx.drop?.has(block)) return null;
      if (isBadge(block.text)) return <Badge text={block.text} onGold={ctx.onGold} />;
      return (
        <Heading
          level={ctx.demote?.has(block) ? 2 : block.level}
          text={block.text}
          href={block.href}
          rule={ctx.ruleOn === block}
          light={ctx.light}
        />
      );

    case "paragraph": {
      /*
        88 paragraphs across 11 pages hold nothing but `&nbsp;` — spacer rows
        the page builder left behind. Each rendered as an empty <p> with a
        16px top margin, so they showed up as gaps in the middle of a passage.
      */
      if (!hasContent(block.html)) return null;

      // The card flag, wherever the source chose to put it.
      const flat = block.html.replace(/<[^>]+>/g, "");
      if (isBadge(flat)) return <Badge text={flat} onGold={ctx.onGold} />;

      /*
        A price is a price whichever tag it arrived in. 21 of them across nine
        pages are paragraphs rather than headings — the wash bands, "£59-£73"
        — and set as prose they came out at body size and body colour, one
        line under the duration and indistinguishable from it. The heading
        branch already gives a lone price the badge; this sends the paragraphs
        to the same place rather than keeping two treatments for one fact.
      */
      const price = flat.replace(/&nbsp;/gi, " ").trim();
      if (/^(from\s*)?£\s?[\d,]+(\s*[-–—]\s*£?\s?[\d,]+)?\.?$/i.test(price)) {
        return <PriceBadge text={price.replace(/\.$/, "")} light={ctx.light} />;
      }

      // A paragraph that is only links and commas is a list, not prose.
      const chips = asLinkChips(block.html);
      if (chips) return <LinkChips chips={chips} onGold={ctx.onGold} />;

      // A section title the author typed into a paragraph.
      if (ctx.leadIn?.has(block)) {
        const lead = asLeadIn(block.html);
        if (lead) return <LeadIn text={lead.text} flagged={lead.flagged} light={ctx.light} />;
      }

      // …and one with ticks scattered through it is a checklist typed flat.
      const inline = asInlineTicks(block.html);
      if (inline) {
        return (
          <ul className="mt-6 grid gap-x-8 gap-y-2.5">
            {inline.map((t, i) => (
              <li
                key={i}
                className={`flex gap-3 text-[16px] leading-[25px] font-normal ${
                  ctx.light ? "text-ink/85" : "text-body"
                } ${prose(ctx.light)}`}
              >
                <Icon
                  name="check"
                  size={16}
                  strokeWidth={2.4}
                  className={`mt-[4px] shrink-0 ${ctx.light ? "text-ink" : "text-gold"}`}
                />
                <span dangerouslySetInnerHTML={{ __html: t }} />
              </li>
            ))}
          </ul>
        );
      }

      return (
        <p
          className={`mt-4 max-w-[76ch] text-[16.5px] leading-[28px] font-normal ${
            ctx.light ? "text-ink/80" : "text-body"
          } ${prose(ctx.light)}`}
          dangerouslySetInnerHTML={{ __html: clean(block.html) }}
        />
      );
    }

    case "list": {
      // Blank bullets, six of them across the location pages.
      const items = block.items.filter(hasContent);
      if (!items.length) return null;
      const list = items.length === block.items.length ? block : { ...block, items };

      /*
        Most of these are not lists. An item of the form "Label: explanation"
        is a card, and a run of them under a process heading is a sequence.
        Left as bullets they were the flattest thing on every service page —
        four paragraphs of grey with a tick in front of each.
      */
      const features = asFeatures(list);
      if (features) {
        return isSequence(list, ctx.heading) ? (
          <Steps items={features} light={ctx.light} />
        ) : (
          <FeatureCards items={features} onGold={ctx.onGold} />
        );
      }

      // One- and two-word items belong on a row, not a column.
      const ticks = asTicks(list);
      if (ticks) {
        return (
          <ul className="mt-6 flex flex-wrap gap-x-7 gap-y-2.5">
            {ticks.map((t, i) => (
              <li
                key={i}
                className={`flex items-center gap-2.5 text-[15.5px] leading-[24px] font-semibold ${
                  ctx.light ? "text-ink" : "text-white"
                } ${prose(ctx.light)}`}
              >
                <Icon
                  name="check"
                  size={17}
                  strokeWidth={2.4}
                  className={`shrink-0 ${ctx.light ? "text-ink" : "text-gold"}`}
                />
                <span dangerouslySetInnerHTML={{ __html: t }} />
              </li>
            ))}
          </ul>
        );
      }

      // What is left really is a list: the what's-included checklists.
      const Tag = list.ordered ? "ol" : "ul";
      const panel = list.items.length >= 6;
      return (
        /*
          One column, always. These lists are ordered — a wash runs pre-wash,
          then wash, then dry — and two columns broke that: the eye reads
          across the row while the content runs down the column, so item 2 sat
          where item 7 was expected. The client asked for the single column by
          name, and it is also the only layout in which the sequence is
          readable.
        */
        <div className={`@container ${panel ? "mt-6" : ""}`}>
        <Tag
          className={`${panel ? "" : "mt-6"} ${
            panel
              ? `grid gap-x-8 gap-y-3.5 p-6 @min-[520px]:p-7 ${
                  ctx.onGold ? "surface-on-gold" : "surface"
                }`
              : "max-w-[76ch] space-y-2.5"
          }`}
        >
          {list.items.map((it, i) => (
            <li
              key={i}
              className={`flex gap-3 text-[16px] leading-[25px] font-normal ${
                // A checklist sits inside its own dark panel, so its copy stays
                // light even where the section around it is gold.
                ctx.light && list.items.length < 6 ? "text-ink/85" : "text-body"
              } ${prose(ctx.light)}`}
            >
              {list.ordered ? (
                <span
                  className={`mt-[1px] shrink-0 font-[family-name:var(--font-sub)] text-[15px] tabular-nums ${
                    ctx.light && list.items.length < 6 ? "text-ink" : "text-gold"
                  }`}
                  aria-hidden
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
              ) : (
                <Icon
                  name="check"
                  size={16}
                  strokeWidth={2.4}
                  className={`mt-[4px] shrink-0 ${
                    ctx.light && list.items.length < 6 ? "text-ink" : "text-gold"
                  }`}
                />
              )}
              {/* The source's own "✔" would sit next to the one drawn above. */}
              <span dangerouslySetInnerHTML={{ __html: unbullet(clean(it)) }} />
            </li>
          ))}
        </Tag>
        </div>
      );
    }

    case "image": {
      const w = block.w ?? 800;
      const h = block.h ?? 600;
      /*
        The theme's decorative icons, flagged during extraction. The source
        showed them inside a carousel at a fraction of their file size; pulled
        out of it they are ordinary image blocks, and a 339px icon rendered as
        content filled the whole 1710px column. Capping them and letting them
        flow inline rebuilds something close to the original row instead of a
        stack of billboards.
      */
      if (block.icon) {
        return (
          <Image
            src={block.src}
            alt={block.alt}
            width={w}
            height={h}
            className="mt-5 mr-5 inline-block h-[76px] w-auto align-middle"
          />
        );
      }

      return (
        <Image
          src={block.src}
          alt={block.alt}
          width={w}
          height={h}
          sizes="(min-width: 1024px) 1000px, 100vw"
          // Never enlarge past the source asset — upscaling an extracted
          // 400px image to a 1710px column only makes it soft.
          style={{ maxWidth: w }}
          className="mt-7 h-auto w-full rounded-[12px]"
        />
      );
    }

    case "button": {
      /*
        Three "Book Now" buttons carry `href="#"` — on the source they opened
        a popup this clone does not have, so they landed here as a gold call
        to action that goes nowhere. Only a booking label is redirected, and
        only to the booking URL every other Book Now on the site already uses.
      */
      const dead = !block.href || block.href === "#";
      const href = dead && /\bbook\b/i.test(block.label) ? BOOK_URL : block.href;
      if (!href || href === "#") return null;

      /*
        One primary action per card. A package card ends on two buttons — the
        booking link and a link to the package's own page — and since the
        second is named after the page it opens rather than reading "Read
        More", two gold pills of equal weight left the card with no point of
        entry, one of them repeating the card's own title back at it. Booking
        keeps the gold; the link beside it goes to the outline, which is what
        says which of the two the card is asking for.
      */
      const booking = href === BOOK_URL || href.startsWith("https://book.");
      const secondary = ctx.actionRow === true && !booking;

      /*
        Full width on a phone, content width from `sm` up. A page's buttons
        arrive as a run of separate blocks, so on a narrow screen they stack —
        and stacked, four labels of four lengths read as four sizes of button
        rather than four choices. The same reason the hero row does it.

        Those margins are for a run loose in the prose, and inside a card they
        were wrong twice over: `mt-7` landed on top of the action row's own
        `pt-7`, so 56px opened between a card's last sentence and its first
        button and 36px between the two buttons — two pills that belong
        together, read as two unrelated things; and `mx-1.5` inset them 6px
        from the copy above, so nothing in the card shared a left edge. The
        action row is a flex row with its own gap, so it needs neither.
      */
      const spacing = ctx.actionRow ? "" : "mt-7 mx-1.5";

      return (
        <a
          href={href}
          /* Gold on a gold band is one flat shape — "Read More" and "Book Now"
             beside each other were two ghosts. The ink pill is what the band
             uses instead, the same one `WhyChoose` and the portfolio carry. */
          /* `mx-1.5`, not `mr-3`: the gap between two of these is the same
             12px either way, and a symmetric margin keeps a lone button on
             the centre line of a closing statement. */
          className={`btn w-full rounded-full sm:w-auto ${spacing} ${
            secondary ? "btn-outline" : ctx.light ? "btn-dark" : "btn-gold"
          }`}
          {...(/^https?:/.test(href)
            ? { target: "_blank", rel: "noopener noreferrer" }
            : {})}
        >
          {block.label}
          <Icon name="arrow" size={18} className="ml-2.5" />
        </a>
      );
    }

    case "table": {
      // Defensive: a malformed row must not take down the whole prerender.
      const rows = (block.rows ?? []).filter(Array.isArray);
      if (!rows.length) return null;

      /*
        A table is the right shape for this content and the wrong one for a
        phone: /valeting's package matrix is 1062px wide and 18,633px tall at
        375px, which is two axes of scrolling and about fifty screens of it.
        So the table renders wherever its container can hold it, and
        `TableCards` renders the same rows wherever it cannot — see
        `lib/table-model.ts`. A table this cannot read keeps the old
        behaviour rather than being guessed at.
      */
      const model = parseTable(rows);
      const view = model ? WIDE_ENOUGH[Math.min(model.valueCount, 5)] : null;

      /*
        A comparison's package names get their own rounded, tier-coloured
        strip — the same segmented-chip shape `PackageTabs` and `PriceTabs`
        already use for "pick one of these" — rather than living as row 0 of
        the `<table>` beneath. A `<tr>` of five `<td>`s can't be given gaps
        or independent corners under `border-collapse`, and that was the
        real shape problem with every earlier attempt here: a flat, edge-to-
        edge band reads as part of the table's grid no matter what color it
        carries, where five separate rounded chips read as what they are —
        five distinct packages. A single-package table has only itself to
        tell apart from nothing, so it keeps the plain gold row 0 below.
      */
      const segmented = model && model.valueCount > 1;
      const bodyRows = segmented ? rows.slice(model.headers.length) : rows;

      return (
        <div
          /*
            `clip`, not `hidden`: both round the corners off the rows inside,
            but `hidden` makes this a scroll container and a scroll container
            is where `position: sticky` goes to die — which is what holds the
            column header in `TableCards` in place.
          */
          className={`surface mt-7 overflow-clip ${model ? "@container" : ""}`}
        >
          <div className={`w-full overflow-x-auto ${view ? view.table : ""}`}>
            <div className="min-w-[520px]">
              {segmented && (
                <div
                  className="grid pt-4 pb-3"
                  /*
                    The chips have to sit over the columns they name. Spread
                    across the whole width they did not: the table leads with a
                    200px feature column and a 240px description before the
                    first verdict column, so every chip was two columns to the
                    left of its own ticks.

                    Same ratio as the `colgroup` below, in `fr` rather than
                    pixels because both this row and the table are fluid, plus
                    a leading cell that spans the label columns and holds
                    nothing.
                  */
                  style={{
                    gridTemplateColumns: `${model.hasDesc ? "440fr" : "200fr"} repeat(${model.valueCount}, 110fr)`,
                  }}
                >
                  <div aria-hidden />
                  {model.headers[0].map((full, idx) => {
                    const accent = TIER_ACCENT[shortLabel(full)] ?? DEFAULT_ACCENT;
                    const sub = model.headers[1]?.[idx];
                    return (
                      <div
                        key={full + idx}
                        style={{ backgroundColor: accent }}
                        /*
                          The grid stretches every chip to the row's tallest
                          — Neptune's one-line name beside Pandora's two —
                          so top-anchored content left the short ones with a
                          lopsided gap under the subtitle. Centered, a short
                          chip and a tall one both read as one block sized to
                          its own text, not as a box with room left over.
                        */
                        className="mx-[3px] flex flex-col justify-center rounded-[9px] px-3 py-3.5 text-center"
                      >
                        <p className="font-[family-name:var(--font-sub)] text-[13.5px] leading-[17px] tracking-[0.01em] text-ink uppercase">
                          {full}
                        </p>
                        {sub && (
                          <p className="mt-1 font-[family-name:var(--font-ui)] text-[10.5px] leading-[13px] font-semibold tracking-[0.04em] text-ink/65 uppercase">
                            {sub}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
              <table className="w-full table-fixed border-collapse text-left">
                {model && (
                  /*
                    `table-layout: fixed` needs the table's own width pinned
                    to something other than `auto` before it will use these
                    `col` widths at all — `w-full` supplies that. From there
                    the ratio between the four numbers below (not their literal
                    pixel values) is what fixes the columns: name and
                    description stay proportionally wide, and the five verdict
                    columns stay equal, instead of a plain `<table>`'s
                    content-driven layout handing whatever space is left to
                    whichever column the browser feels like.
                  */
                  <colgroup>
                    <col style={{ width: 200 }} />
                    {model.hasDesc && <col style={{ width: 240 }} />}
                    {Array.from({ length: model.valueCount }).map((_, idx) => (
                      <col key={idx} style={{ width: 110 }} />
                    ))}
                  </colgroup>
                )}
                <tbody>
                  {bodyRows.map((row, i) => (
                    <tr
                      key={i}
                      className={
                        !segmented && i === 0
                          ? "bg-gold text-ink"
                          : "border-t border-white/[0.07] transition-colors hover:bg-white/[0.03]"
                      }
                    >
                      {row.map((cell, j) => (
                        <td
                          key={j}
                          /*
                            A verdict column is a column of ✓ and –, and a tick
                            pushed to the left edge of a 110px column sits
                            nowhere near the package chip that heads it. Only
                            the label and its description are prose.
                          */
                          className={`px-5 py-3.5 text-[15px] font-normal first:font-semibold ${
                            model && j >= (model.hasDesc ? 2 : 1) ? "text-center" : ""
                          }`}
                        >
                          {cell}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          {model && view && (
            <div className={view.cards}>
              <TableCards model={model} />
            </div>
          )}
        </div>
      );
    }

    case "faq":
      return <FaqAccordion items={block.items} onGold={ctx.onGold} />;

    case "form":
      return (
        <EnquiryForm
          slug={ctx.slug}
          index={Math.max(0, ctx.forms.indexOf(block))}
          submitLabel={block.submitLabel}
          fields={block.fields}
        />
      );

    case "embed":
      return (
        <div className="mt-7 overflow-hidden rounded-[14px] ring-1 ring-white/[0.08]">
          <iframe
            src={block.src}
            title={block.title || "Embedded content"}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            allowFullScreen
            className="aspect-video h-full min-h-[360px] w-full border-0"
          />
        </div>
      );

    case "video":
      return (
        <video
          className="mt-7 h-auto w-full rounded-[12px]"
          controls
          playsInline
          poster={block.poster}
          preload="metadata"
        >
          <source src={block.src} />
        </video>
      );

    case "columns": {
      /*
        Cells that are a mark and a caption are the review sources, not a
        layout: three logos over "5/5 Stars", which as columns stack into
        three 140px blocks on a phone. They get the tiles the homepage
        already gives the same three.
      */
      const badges = asReviewBadges(block);
      if (badges) return <ReviewBadges badges={badges} onGold={ctx.onGold} />;

      /*
        Cells labelled LEVEL 1 to LEVEL 5 are a ladder, not a layout: the rank
        is what the row is saying, so it goes to the numbered cards the site
        already gives a progression. See `asRungCards`.
      */
      const rungs = asRungCards(block);
      if (rungs) return <FeatureCards items={rungs} numbered onGold={ctx.onGold} />;

      // Cells that are all price + icon + name + copy are an add-on row, not
      // a free-form layout, so they render as cards instead of four stacks.
      const cards = asAddonCards(block);
      if (cards) {
        return (
          <AddonCards
            cards={cards}
            onGold={ctx.onGold}
            // The card is always a dark surface, even on a gold section, so
            // its contents go back to light-on-dark regardless of the band.
            renderBlocks={(rest) => (
              <BlockList
                blocks={rest}
                ctx={{ ...ctx, light: false, onGold: false }}
              />
            )}
          />
        );
      }

      /*
        A two-cell row where one cell is nothing but pictures is a media
        split, not a layout. Aligning the two centrally and letting the
        picture stick while the copy scrolls is the difference between a
        photograph parked above a wall of text and a section.
      */
      const imageCol = block.cols.findIndex(
        (col) => col.length > 0 && col.every((b) => b.type === "image" && !b.icon),
      );
      const split = block.cols.length === 2 && imageCol !== -1;

      /*
        The spans are a ratio, not a measurement. Fifteen rows in the content
        file carry `[1,1,1,1,1]` — every LEVEL 1–5 row on the detailing pages
        — and read literally that packs five columns into 5/12 of the width,
        which is where "Enhancement" came out one word per line. A row that
        does not reach 12 is spread evenly instead. A row that overshoots (one
        does, at 24) is left alone: it means two rows of two, and the 12-column
        grid already wraps it that way.
      */
      const filled = block.spans.reduce((a, b) => a + b, 0) >= 12;
      const even = filled ? undefined : EVEN[block.cols.length];

      return (
        <div
          className={`mt-8 grid gap-x-10 gap-y-8 ${even ?? "lg:grid-cols-12"} ${
            split ? "lg:items-center" : ""
          }`}
        >
          {block.cols.map((col, i) => (
            <div
              key={i}
              className={`${even ? "" : (SPAN[block.spans[i]] ?? "lg:col-span-12")} ${
                split && i === imageCol ? "lg:sticky lg:top-[120px] [&_img]:ring-1 [&_img]:ring-white/[0.08]" : ""
              }`}
            >
              <BlockList blocks={col} ctx={ctx} />
            </div>
          ))}
        </div>
      );
    }

    default:
      return null;
  }
}

/* Equal columns, for a row whose spans do not add up to the 12-column grid. */
const EVEN: Record<number, string> = {
  2: "lg:grid-cols-2",
  3: "lg:grid-cols-3",
  4: "lg:grid-cols-4",
  5: "lg:grid-cols-5",
  6: "lg:grid-cols-6",
};

/* Tailwind needs these spelled out to generate the classes. */
const SPAN: Record<number, string> = {
  1: "lg:col-span-1",
  2: "lg:col-span-2",
  3: "lg:col-span-3",
  4: "lg:col-span-4",
  5: "lg:col-span-5",
  6: "lg:col-span-6",
  7: "lg:col-span-7",
  8: "lg:col-span-8",
  9: "lg:col-span-9",
  10: "lg:col-span-10",
  11: "lg:col-span-11",
  12: "lg:col-span-12",
};

/**
 * A lone price, wherever it came from. One treatment for one fact — the
 * heading branch and the paragraph branch both land here.
 */
function PriceBadge({ text, light }: { text: string; light?: boolean }) {
  return (
    <p className="mt-6 first:mt-0">
      <span
        className={`inline-flex items-baseline rounded-full px-4 py-2 font-[family-name:var(--font-display)] text-[22px] leading-none ${
          light ? "bg-ink text-white" : "bg-gold/12 text-gold ring-1 ring-gold/35"
        }`}
      >
        {text.replace(/\s+/g, " ").trim()}
      </span>
    </p>
  );
}

function Heading({
  level,
  text,
  href,
  rule,
  light,
}: {
  level: number;
  text: string;
  /** Set when the source's heading was one link and nothing else. */
  href?: string;
  rule?: boolean;
  light?: boolean;
}) {
  const head = light ? "text-ink" : "text-white";
  const accent = light ? "text-ink" : "text-gold";

  /*
    A heading that was a link stays one. These are the package ladders — "LEVEL
    1" through "LEVEL 5", each pointing at the page it names — and the calls to
    action inside the blog posts.
  */
  const label = href ? (
    <a href={href} className="underline-offset-[6px] transition-colors hover:text-gold hover:underline">
      {text}
    </a>
  ) : (
    text
  );

  /*
    132 of the h5s on this site run past 90 characters — `car-lovers-club`
    has one of 188. Those are paragraphs the page builder happened to mark as
    a heading, and set at heading weight they shout a whole sentence. The tag
    stays, so the document outline is unchanged; only the type steps back.
  */
  const prose = level >= 4 && text.length > 90;
  const body = `max-w-[76ch] text-[16.5px] leading-[28px] font-normal ${
    light ? "text-ink/80" : "text-body"
  }`;

  /*
    A heading that is only a price is not a heading. The service pages carry
    one directly under the h1 — "£ 100" set as an h5 — where it read as a
    stray line of type between the title and the first paragraph. As a badge
    it becomes the thing a visitor is looking for.

    Price *tables* never reach here: `group()` collapses those runs first.
  */
  if (/^\s*(from\s*)?£\s*[\d,]/i.test(text)) {
    // The figure verbatim. Whether it is a fixed price or a starting one is
    // the source's to say — several of these pages quote an exact price, and
    // captioning them all "from" would be inventing a commercial claim.
    return <PriceBadge text={text} light={light} />;
  }

  switch (level) {
    case 1:
      return (
        <h1 className={`text-[32px] leading-[0.99] sm:text-[40px] lg:text-[52px] ${head}`}>
          {label}
        </h1>
      );
    case 2:
      // Only the section's lead h2 gets the rule. Some pages carry seventy of
      // these headings; marking every one would turn the motif into wallpaper.
      /*
        Two ranks, not one. The source marks a section title and an item title
        with the same h2 — /car-valeting opens "OUR PACKAGES" and then names
        five packages, all five at the section's own 40px — so the page had no
        third rank at all and everything shouted equally. The rule already
        tells the section's lead heading from the rest; the size now follows it.
      */
      return (
        <div className={rule ? "mt-16 first:mt-0" : "mt-12 first:mt-0"}>
          {rule && (
            <span
              aria-hidden
              className={`block h-[3px] w-[52px] rounded-full ${light ? "bg-ink" : "bg-gold"}`}
            />
          )}
          <h2
            className={`leading-[1.04] ${head} ${
              rule
                ? "mt-6 text-[26px] sm:text-[32px] lg:text-[40px]"
                : "text-[21px] sm:text-[24px] lg:text-[27px]"
            }`}
          >
            {label}
          </h2>
        </div>
      );
    /*
      h4 used to be 20/22px gold against h3's 18/20px white, so going down a
      level made the type bigger and louder. Monotonic now: h3 leads a group,
      h4 labels something inside it.
    */
    case 3:
      return (
        <h3 className={`mt-8 text-[19px] font-semibold lg:text-[21px] ${head}`}>
          {label}
        </h3>
      );
    case 4:
      return <h4 className={`mt-5 ${prose ? body : `text-[16px] font-semibold lg:text-[17px] ${accent}`}`}>{label}</h4>;
    case 5:
      return <h5 className={`mt-4 ${prose ? body : `text-[17px] font-semibold ${head}`}`}>{label}</h5>;
    default:
      return <h6 className={`mt-4 ${prose ? body : `text-[15px] font-semibold ${accent}`}`}>{label}</h6>;
  }
}
