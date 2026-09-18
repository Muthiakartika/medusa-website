/**
 * The 146 location pages — the borough hubs under `/our-locations/` and the
 * three service-in-a-place families, each of which now wears two URL shapes:
 * the 75 pages the SEO plan re-parented under their service hub
 * (`/mobile-car-wash/wembley/`, `lib/location-moves.ts`) and the 52 it does
 * not mention, still on the old `/mobile-car-wash-in-…` shape. The plan's 49
 * pages that had no source at all are built under the hub shape too
 * (`lib/planned-locations.ts`), so they are location pages here like any other.
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
import { MOVED_LOCATIONS } from "@/lib/location-moves";
import { PLANNED_SLUGS } from "@/lib/planned-locations";

/** Every location page that sits under a service hub: the 75 moved, the 49 built. */
const UNDER_HUB = new Set([...MOVED_LOCATIONS, ...PLANNED_SLUGS]);

/**
 * The four families, and the title each one's A–Z index wears.
 *
 * `prefix` is the shape the mirror gave these pages; `hub` is where the move
 * put them. A page under `hub` counts only when the move table names it,
 * because the hub's own service pages are its neighbours there and are not
 * places — `/mobile-car-wash/wembley/` is in the family, `/mobile-car-wash/
 * gold-wash/` is not.
 *
 * `indexTitle` names what the list holds, so it says the service rather than
 * repeating the page's own heading back at it. The borough family has no
 * service of its own — its pages cover all three — so it is "All Locations".
 * `rowLabel` is the same name at the head of a footer strip, where the space is
 * one line and the word "Locations" is already implied by everything in it.
 */
export const LOCATION_FAMILIES = [
  {
    prefix: "our-locations/",
    hub: null,
    indexTitle: "All Locations",
    rowLabel: "Boroughs",
  },
  {
    prefix: "mobile-car-wash-in-",
    hub: "mobile-car-wash/",
    indexTitle: "Mobile Car Wash Locations",
    rowLabel: "Car Wash",
  },
  {
    prefix: "mobile-car-valeting-in-",
    hub: "car-valeting/",
    indexTitle: "Mobile Car Valeting Locations",
    rowLabel: "Valeting",
  },
  {
    prefix: "mobile-car-detailing-in-",
    hub: "car-detailing/",
    indexTitle: "Mobile Car Detailing Locations",
    rowLabel: "Detailing",
  },
] as const;

type Family = (typeof LOCATION_FAMILIES)[number];

/** The place part of a slug in this family, or null when it is not one of its pages. */
function tailOf(family: Family, slug: string) {
  if (slug.startsWith(family.prefix) && slug !== family.prefix.replace(/\/$/, ""))
    return slug.slice(family.prefix.length);
  if (family.hub && slug.startsWith(family.hub) && UNDER_HUB.has(slug))
    return slug.slice(family.hub.length);
  return null;
}

export const isLocationSlug = (slug: string) =>
  LOCATION_FAMILIES.some((f) => tailOf(f, slug) !== null);

const familyOf = (slug: string) => LOCATION_FAMILIES.find((f) => tailOf(f, slug) !== null);

/** "car-valeting/golders-green" -> "Golders Green" */
export function placeName(slug: string) {
  const family = familyOf(slug);
  const rest = (family && tailOf(family, slug)) ?? slug;
  return rest
    .split("-")
    .map((w) => (w === "upon" || w === "and" || w === "of" ? w : w.charAt(0).toUpperCase() + w.slice(1)))
    .join(" ");
}

/**
 * The page's siblings — what the dead shortcode was supposed to print.
 *
 * Every other page in the same family, in the order `pages.json` holds them,
 * which is the sitemap's order. The page itself is excluded. A family spans
 * both URL shapes, so a page that moved still lists the ones that did not.
 */
export function siblings(slug: string) {
  const family = familyOf(slug);
  if (!family) return [];
  return membersOf(family).filter((m) => m.slug !== slug);
}

/**
 * The same siblings, as the A–Z index takes them: the list and the title that
 * says what is in it. Null for a page that is not a location page.
 */
export function siblingIndex(slug: string) {
  const family = familyOf(slug);
  if (!family) return null;
  const items = membersOf(family).filter((m) => m.slug !== slug);
  return items.length ? { title: family.indexTitle, items } : null;
}

/** Every page in a family, by place name. */
function membersOf(family: Family) {
  return Object.keys(PAGES)
    .filter((s) => tailOf(family, s) !== null)
    .map((s) => ({ slug: s, name: placeName(s) }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

/**
 * Every location page a service hub is the parent of — what the A–Z index at
 * the foot of `/mobile-car-wash/`, `/car-valeting/` and `/car-detailing/`
 * lists (`components/LocationIndex.tsx`).
 *
 * The client asked for "their corresponding location child pages"
 * (2026-09-17), and a family's children are in two URL shapes: the ones the
 * SEO plan re-parented under the hub and the ones it left on
 * `mobile-car-…-in-…`. Both are that service in that place, so both are
 * listed — the same reading of "family" that "Our Other Locations" uses.
 *
 * Empty for every other slug, which is what keeps the index on the three hubs
 * the client named: no other page is a family's `hub`.
 */
export function hubLocations(slug: string) {
  const family = LOCATION_FAMILIES.find((f) => f.hub === `${slug}/`);
  if (!family) return null;
  const items = membersOf(family);
  return items.length ? { title: family.indexTitle, items } : null;
}

/**
 * Every location page, as one strip per family — the footer's scrolling
 * directory.
 *
 * Client, 2026-09-18: "all the new location pages can be in a scroll in the
 * footer, like each being a location word then clicking into the location
 * page… like our seo boost one, but a bit better".
 *
 * **One strip per family rather than one long strip.** A place is not a page
 * here, it is up to four: Barnet has a borough hub, a car wash page and a
 * detailing page. Run together, the strip would carry "Barnet" three times with
 * three different destinations and no way to tell them apart. Split by family,
 * each strip's label says which of the three a name goes to.
 */
export function locationStrips() {
  return LOCATION_FAMILIES.map((family) => ({
    label: family.rowLabel,
    items: membersOf(family),
  })).filter((strip) => strip.items.length > 0);
}

/**
 * The A–Z index with a page's "areas we cover" row folded into it.
 *
 * Client, 2026-09-17: "ini double, pake yg browser A-Z aja tapi judulnya pake
 * yg areas we provides". Two pages carry both — `/mobile-car-wash/`, whose
 * "AREAS WE PROVIDE STANDARD CAR WASH SERVICES IN LONDON:" row is seventeen
 * borough chips, and each of the nineteen borough hubs, whose "Service Areas"
 * row is the same seventeen. Read as lists of places they are the same list
 * twice, so the row's links join the index and the index wears the row's own
 * heading.
 *
 * It is a merge, not a replacement, because the two lists are not the same
 * pages: the chips point at the borough hubs (`/our-locations/camden/`) and the
 * index at the service in a place (`/mobile-car-wash/barnet/`). Ten of the
 * seventeen names are in both — those keep the index's target, which is the
 * more specific page and the one the heading promises — and the seven that are
 * not (Camden, Haringey, Kensington and Chelsea…) come in as their own rows.
 * Nothing the source names is dropped. A link to the page itself is, since a
 * page listing itself is what the chips row did and the index does not.
 */
export function withAreaLinks(
  items: { slug: string; name: string }[],
  areas: { href: string; label: string }[],
  selfSlug: string,
) {
  const seen = new Set(items.map((i) => i.name.toLowerCase()));
  const out = [...items];

  for (const area of areas) {
    const name = area.label.trim();
    const slug = area.href.replace(/^\/+|\/+$/g, "");
    if (!name || !slug || slug === selfSlug) continue;
    if (seen.has(name.toLowerCase())) continue;
    seen.add(name.toLowerCase());
    out.push({ slug, name });
  }

  return out.sort((a, b) => a.name.localeCompare(b.name));
}

/** Can that row be folded in without losing a link the index cannot express? */
export const foldableAreas = (areas: { href: string; label: string }[]) =>
  areas.length > 0 && areas.every((a) => a.href.startsWith("/"));

export type DirectoryEntry = { slug: string; name: string; blurbHtml?: string };

/** Every block on a page, columns recursed into, in document order. */
function flatten(blocks: Block[], into: Block[] = []): Block[] {
  for (const b of blocks) {
    if (b.type === "columns") b.cols.forEach((c) => flatten(c, into));
    else into.push(b);
  }
  return into;
}

const plain = (html: string) =>
  html
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/\s+/g, " ")
    .trim();

/**
 * The index again, one entry per page, each carrying that page's own words.
 *
 * Client, 2026-09-17, against `/car-detailing/`: "thats good, we just need the
 * extra individual sections below that link to each page" — the other half of
 * the reference widget, which pairs its A–Z control with one titled block per
 * item. The control is for finding a place you already have in mind; this is
 * for reading down them.
 *
 * **Every entry carries a line.** Two sources, in order:
 *
 * 1. **The page's own opening paragraph**, chosen the way `lib/hub.ts` chooses
 *    a card blurb — the first that is prose rather than a phone number — and
 *    used whole. Nothing is written and nothing is trimmed.
 * 2. **The page's meta description**, where that paragraph is not the page's
 *    own to lend. Two ways it can fail to be: it is a paragraph the reading
 *    page already carries (`skip`), or it is shared with another place in the
 *    same list. Both mean the same thing — the 49 pages in
 *    `lib/planned-locations.ts` are built out of their service hub, so they all
 *    open on the hub's sentence, and a sentence shared between places is about
 *    none of them. Their descriptions at least name the place: "Mobile Car
 *    Detailing in Barnet. Car detailing refers to…", 150 characters, and all 49
 *    distinct. One mirror page needs the fallback for a different reason —
 *    `/our-locations/city-of-westminster/` carries no paragraph block at all.
 *
 * The client was shown the bare version first and asked for the fallback
 * anyway: "gak apa isi deskripsi singkat aja" (2026-09-17). So these entries
 * read alike below the place name until per-place copy replaces them, at which
 * point the paragraph wins on its own with no change here.
 */
export function locationDirectory(
  items: { slug: string; name: string }[],
  skip: string[] = [],
): DirectoryEntry[] {
  const theirs = new Set(skip.map(plain));
  const count = new Map<string, number>();

  const draft = items.map(({ slug, name }) => {
    const page = PAGES[slug];
    let para: { text: string; html: string } | null = null;

    for (const b of flatten(page?.sections.flatMap((s) => s.blocks) ?? [])) {
      if (b.type !== "paragraph") continue;
      if (/href="tel:/i.test(b.html)) continue;
      const text = plain(b.html);
      if (text.length < 90) continue;
      // The reading page's own words. Nothing further down will be better.
      if (theirs.has(text)) break;
      para = { text, html: b.html };
      break;
    }

    if (para) count.set(para.text, (count.get(para.text) ?? 0) + 1);
    return { slug, name, page, para };
  });

  return draft.map(({ slug, name, page, para }): DirectoryEntry => {
    if (para && count.get(para.text) === 1) return { slug, name, blurbHtml: para.html };
    const meta = (page?.description ?? "").trim();
    return meta ? { slug, name, blurbHtml: escapeHtml(meta) } : { slug, name };
  });
}

/** The meta description is plain text; it is rendered through the same prop. */
const escapeHtml = (text: string) =>
  text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/**
 * The borough family, for `/our-locations/` — the one hub whose family has no
 * `hub` prefix, because its children live under the index's own path rather
 * than under a service.
 */
export function boroughLocations() {
  const family = LOCATION_FAMILIES[0];
  return { title: family.indexTitle, items: membersOf(family) };
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

