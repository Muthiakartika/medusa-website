/**
 * The 146 location pages — the borough hubs under `/our-locations/` and the
 * three service-in-a-place families (`/mobile-car-wash-in-…`,
 * `/mobile-car-valeting-in-…`, `/mobile-car-detailing-in-…`).
 *
 * They are the site's long tail and its worst-served pages. Each one opens on
 * a bare heading; each ends on "Our Other Locations" with nothing under it —
 * on the live site that heading is followed by an unrendered WordPress
 * shortcode, `[page-generator-pro-related-links …]`, so the plugin that was
 * meant to print the sibling links is not running and 127 pages end on a
 * promise of links that were never there. The borough hubs also carry a
 * "Portfolio" heading over an empty row and, on the service pages, an FAQ
 * heading whose questions the extractor dropped.
 *
 * This reads the shape each page has and hands `components/LocationPage` the
 * parts worth laying out — the opening copy, the coverage lists, the local
 * photographs, the map and the questions — and passes everything else through
 * to the ordinary block renderer in document order. Nothing is rewritten and
 * nothing is added: the rows these pages share with the homepage keep their
 * own copy rather than borrowing the homepage components, and the empty
 * "Portfolio" heading stays empty, because that is what the source has.
 */

import type { Block, Page, Section } from "@/lib/blocks";
import { PAGES } from "@/lib/blocks";

/** The four families, and the label each one wears in a list of siblings. */
export const LOCATION_FAMILIES = [
  { prefix: "our-locations/", label: "Locations" },
  { prefix: "mobile-car-wash-in-", label: "Mobile Car Wash" },
  { prefix: "mobile-car-valeting-in-", label: "Mobile Car Valeting" },
  { prefix: "mobile-car-detailing-in-", label: "Mobile Car Detailing" },
] as const;

export const isLocationSlug = (slug: string) =>
  LOCATION_FAMILIES.some((f) => slug.startsWith(f.prefix) && slug !== f.prefix.replace(/\/$/, ""));

const familyOf = (slug: string) => LOCATION_FAMILIES.find((f) => slug.startsWith(f.prefix));

/** "mobile-car-valeting-in-golders-green" -> "Golders Green" */
export function placeName(slug: string) {
  const family = familyOf(slug);
  const rest = family ? slug.slice(family.prefix.length) : slug;
  return rest
    .split("-")
    .map((w) => (w === "upon" || w === "and" || w === "of" ? w : w.charAt(0).toUpperCase() + w.slice(1)))
    .join(" ");
}

/**
 * The page's siblings — what the dead shortcode was supposed to print.
 *
 * Every other page in the same family, in the order `pages.json` holds them,
 * which is the sitemap's order. The page itself is excluded.
 */
export function siblings(slug: string) {
  const family = familyOf(slug);
  if (!family) return [];
  return Object.keys(PAGES)
    .filter((s) => s !== slug && s.startsWith(family.prefix) && s !== "our-locations")
    .map((s) => ({ slug: s, name: placeName(s) }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

export type Sight = { src: string; alt: string; caption?: string };

export type LocationModel = {
  /** Opening paragraphs, as the page wrote them. */
  introHtml: string[];
  /** The tick list some of these pages open with. */
  ticks: string[];
  /** The hero's own buttons — borough hubs carry four. */
  buttons: Extract<Block, { type: "button" }>[];
  video?: Extract<Block, { type: "video" }>;
  /** "Service Areas" — the borough links, flattened out of their columns. */
  areas: { href: string; label: string }[];
  /**
   * "<Place>'s Neighborhoods" — one comma-separated line, every name of which
   * is a Google Maps link on the borough hubs.
   */
  neighbourhoods?: { heading: string; items: { label: string; href?: string }[] };
  /** "<Place>'s Top Sight" — a photograph and a caption, nine times. */
  sights?: { heading: string; items: Sight[] };
  /** The borough hubs' four-step booking explainer. */
  steps?: Section;
  /** The page's own Car Lovers Club row — its copy, not `lib/site.ts`'s. */
  club?: Section;
  /**
   * True when the page carries the "Our Other Locations" heading — the row
   * whose `[page-generator-pro-related-links …]` shortcode never ran.
   */
  hasRelated: boolean;
  /** "Our Location" and its map. */
  map?: { heading: string; embed: Extract<Block, { type: "embed" }> };
  /** The FAQ row, whatever state it is in. */
  faqSection?: Section;
  /** Everything the ordinary renderer still owns. */
  body: Section[];
  /**
   * True when the page arrived as one undivided section and `rows()` had to
   * cut it up. Those rows are ours, not the source's, so the block renderer
   * must not decorate them — see the `bands` prop in `components/Blocks`.
   */
  split: boolean;
};

/**
 * The heading a row opens with — looking inside a leading column layout, because
 * the borough hubs put "How It works" in the first cell of one rather than
 * above it.
 */
const headingOf = (section: Section) => {
  const first = section.blocks[0];
  if (first?.type === "heading") return first.text.trim();
  if (first?.type === "columns") {
    const nested = first.cols[0]?.find((x) => x.type !== "image");
    if (nested?.type === "heading" && nested.level <= 2) return nested.text.trim();
  }
  return "";
};

const AREAS_RE = /^service areas$/i;
const HOOD_RE = /neighbou?rhoods?$/i;
const SIGHT_RE = /top sights?$/i;
const STEPS_RE = /^how it works$/i;
const CLUB_RE = /^the car lovers club$/i;
const MAP_RE = /^our locations?$/i;
const FAQ_RE = /^(faqs?|frequently asked questions)\b/i;
const RELATED_RE = /other locations/i;

/** Strips the `<path>` fragments the extractor left inside tick-marked items. */
const unpath = (html: string) =>
  html
    .replace(/<svg[\s\S]*?<\/svg>/gi, "")
    .replace(/<path\b[^>]*>\s*<\/path>/gi, "")
    .replace(/<path\b[^>]*\/?>/gi, "")
    .trim();

const flatText = (html: string) =>
  unpath(html)
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/\s+/g, " ")
    .trim();

/** Every `<a>` in a fragment. */
const linksIn = (html: string) =>
  [...html.matchAll(/<a\s+href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi)].map((m) => ({
    href: m[1],
    label: m[2].replace(/<[^>]+>/g, "").trim(),
  }));

/**
 * Five borough hubs — Brent, Buckinghamshire, City of Westminster, Slough and
 * Watford — arrive as a single sixty-block section holding the whole page,
 * because the source builds them from one WPBakery row instead of eleven. Left
 * as they are, the frame sees one lump and every row on those pages falls
 * through to the ordinary renderer.
 *
 * Splitting at each top-level heading gives them the same shape the other
 * fourteen already have. It moves no blocks and changes no order.
 */
function rows(sections: Section[]): Section[] {
  if (sections.length > 1) return sections;
  const only = sections[0];
  if (!only || only.blocks.length < 12) return sections;

  const out: Section[] = [];
  let current: Block[] = [];
  for (const b of only.blocks) {
    if (opensRow(b) && current.length) {
      out.push({ ...only, blocks: current });
      current = [];
    }
    current.push(b);
  }
  if (current.length) out.push({ ...only, blocks: current });
  return out.length > 1 ? out : sections;
}

/**
 * Does this block start a new row?
 *
 * A bare `<h2>` does. So does a column layout whose first cell opens with one:
 * the borough hubs put "How It works" inside its own two-column block, and
 * cutting only at top-level headings left that block glued to the end of the
 * "Top Sight" row — which then failed the covers() test and printed ten
 * full-width photographs in a column.
 */
function opensRow(b: Block) {
  if (b.type === "heading") return b.level === 2;
  if (b.type !== "columns") return false;
  const first = b.cols[0]?.find((x) => x.type !== "image");
  return first?.type === "heading" && first.level <= 2;
}

/** A block that puts something on the page — the source pads rows with blanks. */
const contentful = (b: Block) =>
  !(b.type === "paragraph" && !flatText(b.html)) && !(b.type === "heading" && !b.text.trim());

/**
 * A row may only be claimed by the frame when the frame renders all of it.
 *
 * Learned the hard way: the booking-steps renderer reads the "Step n" pairs out
 * of a column and nothing else, so on the five borough hubs that arrive as one
 * undivided section it swallowed the row and printed a fraction of it. Every
 * claim below now states which blocks it consumes, and hands the row back to
 * the ordinary renderer unless that covers the lot.
 */
const covers = (section: Section, used: (Block | undefined)[]) =>
  section.blocks.filter(contentful).every((b) => used.includes(b));

export function parseLocationPage(page: Page): LocationModel {
  const model: LocationModel = {
    introHtml: [],
    ticks: [],
    buttons: [],
    areas: [],
    hasRelated: false,
    body: [],
    split: false,
  };

  const sections = rows(page.sections);
  model.split = sections.length !== page.sections.length;

  sections.forEach((section, i) => {
    const heading = headingOf(section);

    /* The opening row: title, prose, and on the service pages a tick list. */
    if (i === 0) {
      for (const b of section.blocks) {
        if (b.type === "heading" && b.level <= 2) continue; // the title
        else if (b.type === "paragraph") model.introHtml.push(unpath(b.html));
        else if (b.type === "list") model.ticks.push(...b.items.map(flatText).filter(Boolean));
        else if (b.type === "button") model.buttons.push(b);
        else if (b.type === "video") model.video = b;
        else {
          // Anything else and the row is doing more than opening the page.
          model.body.push(section);
          model.introHtml = [];
          model.ticks = [];
          model.buttons = [];
          model.video = undefined;
          return;
        }
      }
      return;
    }

    if (AREAS_RE.test(heading)) {
      const cols = section.blocks.find((b) => b.type === "columns");
      const cells = cols?.type === "columns" ? cols.cols.flat() : section.blocks.slice(1);
      const links = cells.filter((b) => b.type === "paragraph").flatMap((b) => linksIn(b.html));
      const allCellsAreLinkLists =
        cells.length > 0 && cells.every((b) => b.type === "paragraph" && linksIn(b.html).length);
      if (links.length && allCellsAreLinkLists && covers(section, [section.blocks[0], cols])) {
        model.areas.push(...links);
        return;
      }
    }

    if (HOOD_RE.test(heading)) {
      const body = section.blocks.find((b) => b.type === "paragraph");
      if (body?.type === "paragraph" && covers(section, [section.blocks[0], body])) {
        /*
          Each name is a link to that neighbourhood on Google Maps — around
          thirty of them per borough. Reading the text and throwing the anchors
          away would strip 600 links off these nineteen pages.
        */
        const linked = linksIn(body.html);
        model.neighbourhoods = {
          heading,
          items: linked.length
            ? linked.map((l) => ({ label: l.label, href: l.href }))
            : flatText(body.html)
                .split(/\s*,\s*/)
                .map((s) => ({ label: s.trim() }))
                .filter((s) => s.label),
        };
        return;
      }
    }

    /*
      A photograph and the place it shows, repeated. Buckinghamshire is why the
      caption is optional: it lists ten pictures and nine names, and requiring
      a caption for each made the row fail the covers() test and fall back to
      ten full-width photographs stacked down the page.
    */
    if (SIGHT_RE.test(heading)) {
      const items: Sight[] = [];
      const used: Block[] = [section.blocks[0]];
      section.blocks.forEach((b, j) => {
        if (b.type !== "image" || used.includes(b)) return;
        const next = section.blocks[j + 1];
        const caption = next?.type === "paragraph" ? flatText(next.html) : undefined;
        items.push({ src: b.src, alt: b.alt, caption });
        used.push(b);
        if (caption && next) used.push(next);
      });
      if (items.length && covers(section, used)) {
        model.sights = { heading, items };
        return;
      }
    }

    /*
      The booking explainer, only when the whole row is the heading, its
      standfirst, the "Step n" pairs, the button and the picture beside them —
      which is how fourteen of the nineteen borough hubs write it. Anything
      else in the row and the ordinary renderer keeps it.
    */
    if (STEPS_RE.test(heading) && stepPairs(section).length >= 2) {
      const cols = section.blocks.find((b) => b.type === "columns");
      const head = section.blocks[0] === cols ? undefined : section.blocks[0];
      if (cols && covers(section, [head, cols]) && stepsCoverColumn(cols)) {
        model.steps = section;
        return;
      }
    }

    if (CLUB_RE.test(heading)) {
      const title = section.blocks.find((b) => b.type === "heading" && b.level <= 2);
      const kicker = section.blocks.find((b) => b.type === "heading" && b.level === 3);
      const body = section.blocks.find((b) => b.type === "paragraph");
      const cta = section.blocks.find((b) => b.type === "button");
      if (covers(section, [title, kicker, body, cta])) {
        model.club = section;
        return;
      }
    }

    if (MAP_RE.test(heading)) {
      const embed = section.blocks.find((b) => b.type === "embed");
      if (embed?.type === "embed" && covers(section, [section.blocks[0], embed])) {
        model.map = { heading, embed };
        return;
      }
    }

    if (FAQ_RE.test(heading)) {
      model.faqSection = section;
      return;
    }

    /* The dead shortcode row. Its links are generated instead. */
    if (RELATED_RE.test(heading) && section.blocks.length === 1) {
      model.hasRelated = true;
      return;
    }

    model.body.push(section);
  });

  return model;
}

/**
 * Does the steps renderer print everything in this columns block? It reads the
 * first cell's headings and button, and one picture from the second.
 */
function stepsCoverColumn(cols: Extract<Block, { type: "columns" }>) {
  const [copy = [], art = [], ...rest] = cols.cols;
  if (rest.some((c) => c.filter(contentful).length)) return false;
  const copyOk = copy.every(
    (b) => b.type === "heading" || b.type === "button" || !contentful(b),
  );
  const artOk = art.filter(contentful).every((b) => b.type === "image");
  return copyOk && artOk;
}

/**
 * The "Step n" / instruction pairs in a booking explainer, as the borough
 * hubs write them: an h4 naming the step, an h5 saying what to do.
 */
export function stepPairs(section: Section) {
  const cols = section.blocks.find((b) => b.type === "columns");
  const copy = cols?.type === "columns" ? (cols.cols[0] ?? []) : section.blocks;
  const out: { label: string; body: string }[] = [];
  copy.forEach((b, i) => {
    const next = copy[i + 1];
    if (b.type === "heading" && b.level === 4 && next?.type === "heading") {
      out.push({ label: b.text, body: next.text });
    }
  });
  return out;
}

