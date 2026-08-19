/**
 * The frame every service page shares.
 *
 * Forty-one pages sit under the Valeting, Detailing, Mobile Car Wash and More
 * Services menus, and they are all built the same way: a title, an opening
 * paragraph or standfirst, "What's included", a vehicle-class price ladder,
 * "+ Add-on services", a photo strip, "AREAS WE PROVIDE …" and sometimes an
 * FAQ. Rendered block-by-block that comes out as one flat scroll opening on a
 * bare heading — no header, the price several screens down, the coverage list
 * stranded under the photographs and the questions after it.
 *
 * This reads the shape a page already has and hands `components/ServicePage`
 * the four pieces the frame needs: the opening copy, the entry price, the
 * coverage list and the questions. **Nothing is rewritten and nothing is
 * dropped** — every block the frame does not claim is passed through to the
 * ordinary renderer in document order, and a page that matches none of these
 * shapes simply keeps its whole body and gets a header with its title in it.
 *
 * `lib/headlight.ts` and `lib/motorcycle.ts` are the other end of the same
 * idea: one page, copy transcribed by hand, layout written from scratch. That
 * is worth it for a page the extractor mangled. These extract cleanly — what
 * they lack is a frame.
 */

import { type Block, heroImageFor, type Page, type Section } from "@/lib/blocks";

/**
 * Routes that render through `ServicePage`.
 *
 * Listed rather than detected: the shape test would also match a long blog
 * post, and a header built around an entry price is wrong for an article.
 * These are the service pages in `NAV` — the four service menus, minus
 * `/headlight-restoration`, `/motorcycle-valeting-detailing` and
 * `/car-lovers-club`, which have hand-built routes of their own.
 */
export const SERVICE_SLUGS = new Set([
  // Valeting
  "car-valeting",
  "car-valeting/mini-valet",
  "car-valeting/premium-full-valet",
  "car-interior-cleaning/interior-valet",
  "car-valeting/deep-clean-full-valet",
  "car-valeting/pre-sale-valet",
  "car-valeting/summer-glow-valet",
  "car-valeting/winter-protection",
  "car-interior-cleaning/mould-removal",
  "car-valeting/convertible-roof-cleaning",
  // Detailing
  "car-detailing",
  "ceramic-coating/new-car-protection",
  "car-detailing/mini-detail",
  "ceramic-coating/enhancement-detail",
  "ceramic-coating/paint-correction",
  "ceramic-coating/perfection-detail",
  "mobile-car-wash/alloy-wheel-cleaning",
  "ceramic-coating/machine-polish",
  "ceramic-coating",
  // Mobile car wash
  "mobile-car-wash",
  "mobile-car-wash/bronze-wash",
  "mobile-car-wash/silver-wash",
  "mobile-car-wash/gold-wash",
  "mobile-car-wash/platinum-wash",
  "mobile-car-wash/exterior-wash",
  "mobile-car-wash/exterior-plus-wash",
  "car-interior-cleaning/premium-interior-wash",
  // More services
  "car-interior-cleaning/steam-cleaning",
  "commercial-valeting/mobile-truck-cleaning",
  "car-detailing/paint-overspray-removal",
  "car-interior-cleaning/vomit-cleaning",
  "car-detailing/car-graffiti-removal",
  "car-interior-cleaning/flooded-car-cleaning",
  "commercial-valeting/car-van-stickers-removal",
  "car-interior-cleaning/leather-cleaning",
  "ceramic-coating/windscreen-protection",
  "vehicles/caravan-cleaning",
  "mobile-car-wash/car-wax-service",
  "car-interior-cleaning/pet-hair-removal",
  "car-interior-cleaning/odour-removal",
  "car-detailing/engine-bay-steam-cleaning",
]);

export type ServiceModel = {
  /** The standfirst the page opens with, where it has one. */
  lede?: string;
  /** The opening paragraphs, as HTML, in document order. */
  introHtml: string[];
  /** Entry price off the page's first price ladder — "£55". */
  priceFrom?: string;
  /** Everything the ordinary renderer still owns, in document order. */
  body: Section[];
  /**
   * Sections that belong to one another: the price ladder and the add-on
   * cards the page sells alongside it. The source puts them in two rows, so
   * they rendered as two unrelated bands with a full band of black between —
   * you could read the prices without ever seeing that extras existed.
   * Merged, in the source's own order, so the ask and its upsell sit together.
   */
  priced: Set<Section>;
  /** The coverage list at the foot of the page. */
  areas?: { heading: string; html: string };
  /** Every FAQ pair on the page, in document order. */
  faq: { q: string; a: string[] }[];
  /** The heading the page put over them — "FAQs" on some, spelled out on others. */
  faqHeading?: string;
  /**
   * The photograph behind the header.
   *
   * Twenty-one of these pages declare one on their opening row and the frame
   * was throwing it away. The other twenty are Elementor-built, and the
   * extractor only reads row backgrounds off WPBakery rows — see the
   * `hasClass('wpb_row')` test in `scripts/extract-content.mjs` — so their
   * hero image never reached `pages.json` at all. `heroImageFor` picks between
   * that background and the page's OG image on measured size, so a small
   * square never gets stretched across the band when a bigger file exists.
   */
  heroImage?: string;
};

const AREAS_RE = /^\s*areas?\s+we\s+(provide|cover)/i;
const FAQ_RE = /^\s*(faqs?|frequently asked questions)\b/i;
const PRICE_RE = /^\s*(?:from\s*)?£\s*([\d,]+(?:\.\d{2})?)/i;
const ADDON_RE = /add-?on/i;

const isHeading = (b: Block | undefined): b is Extract<Block, { type: "heading" }> =>
  b?.type === "heading";

const priceOf = (b: Block) => {
  if (!isHeading(b) || b.level > 5) return null;
  const m = b.text.match(PRICE_RE);
  return m ? Number(m[1].replace(/,/g, "")) : null;
};

const sameText = (a: string, b: string) =>
  a.replace(/\s+/g, " ").trim().toLowerCase() === b.replace(/\s+/g, " ").trim().toLowerCase();

/**
 * The entry price, taken off the page's *first* price ladder rather than the
 * cheapest number on the page.
 *
 * `/car-ceramic-paint-protection` is why: its coating tiers run £300–£600, and
 * four sections further down "Gtechniq C4 Permanent Restorer" starts from £25.
 * A page-wide minimum advertises a ceramic coating from £25. The first section
 * that quotes two or more prices is the package ladder on every one of these
 * pages, so that section's minimum is the ask.
 *
 * The scan stops at the add-ons heading — those cards price themselves, and on
 * the wash pages they are the only prices on the page at all.
 */
function entryPrice(sections: Section[]): string | undefined {
  let single: string | undefined;

  for (const section of sections) {
    const found: { n: number; text: string }[] = [];
    let stop = false;

    const walk = (blocks: Block[]) => {
      for (const b of blocks) {
        if (stop) return;
        if (isHeading(b) && ADDON_RE.test(b.text)) {
          stop = true;
          return;
        }
        if (b.type === "columns") {
          b.cols.forEach(walk);
          continue;
        }
        const n = priceOf(b);
        if (n !== null && isHeading(b)) found.push({ n, text: b.text.trim() });
      }
    };
    walk(section.blocks);

    if (found.length >= 2) {
      return found.reduce((a, b) => (b.n < a.n ? b : a)).text;
    }
    if (found.length === 1 && !single) single = found[0].text;
    if (stop) break;
  }

  return single;
}

/**
 * The opening run of a page: an optional standfirst, the title, and the prose
 * under it, up to the first block that is neither.
 *
 * Split rather than all-or-nothing. The first section is a clean title-plus-
 * prose block on only a handful of these pages; far more often it also holds
 * the "what's included" list (`/bronze-wash`), a column layout
 * (`/enhancement`) or — on the six single-section wash pages — the entire
 * rest of the page. Taking the run and handing the remainder back means the
 * header gets its copy without the body losing anything.
 */
function takeOpening(section: Section | undefined, h1: string) {
  if (!section) return null;

  const ledes: string[] = [];
  const intro: string[] = [];
  let titleSeen = false;
  let i = 0;

  for (; i < section.blocks.length; i++) {
    const b = section.blocks[i];

    // A standfirst — this theme sets them as h4–h6, before or after the title.
    if (isHeading(b) && b.level >= 4) {
      ledes.push(b.text);
      continue;
    }

    if (isHeading(b) && b.level <= 3) {
      if (!titleSeen && sameText(b.text, h1)) {
        titleSeen = true;
        continue;
      }
      /*
        A second h2 straight after the title is a subtitle on some pages
        ("Effectively Remove Spray Paint & Graffiti from Car") and a section
        heading on others. It is only safe to lift it into the header when the
        run goes on to consume the whole section — otherwise it owns content
        that would be left with nothing above it.
      */
      const rest = section.blocks.slice(i + 1);
      if (titleSeen && !ledes.length && rest.every((r) => r.type === "paragraph")) {
        ledes.push(b.text);
        continue;
      }
      break;
    }

    if (b.type === "paragraph") {
      intro.push(b.html);
      continue;
    }

    break;
  }

  if (!titleSeen) return null;

  return {
    lede: ledes[0],
    // Any further standfirsts are copy too, and read as opening paragraphs.
    introHtml: [...ledes.slice(1), ...intro],
    rest: section.blocks.slice(i),
  };
}

/** A section that is nothing but an FAQ heading, its lede and its accordion. */
function faqOnly(section: Section) {
  const [first, ...rest] = section.blocks;
  if (!isHeading(first) || !FAQ_RE.test(first.text)) return null;
  const items: { q: string; a: string[] }[] = [];
  for (const b of rest) {
    if (b.type === "faq") items.push(...b.items);
    else if (b.type !== "paragraph") return null; // a lede is fine, content is not
  }
  return items.length ? items : null;
}

export function parseServicePage(page: Page): ServiceModel {
  const sections = page.sections;
  const body: Section[] = [];
  const priced = new Set<Section>();
  const faq: { q: string; a: string[] }[] = [];
  let faqHeading: string | undefined;
  let areas: ServiceModel["areas"];

  const opening = takeOpening(sections[0], page.h1);

  sections.forEach((section, i) => {
    if (i === 0 && opening) {
      // Whatever the opening run did not take stays exactly where it was.
      if (opening.rest.length) body.push({ ...section, blocks: opening.rest });
      return;
    }

    const first = section.blocks[0];

    /*
      The coverage list — the same forty borough links on most of these pages,
      left stranded under the photo strip. The frame gives it its own row.
    */
    if (
      !areas &&
      isHeading(first) &&
      AREAS_RE.test(first.text) &&
      section.blocks.length === 2 &&
      section.blocks[1].type === "paragraph"
    ) {
      areas = { heading: first.text, html: section.blocks[1].html };
      return;
    }

    /*
      Questions. `/mould-sanitisation-sterilisation-service` carries two FAQ
      headings — one with only a lede under it, and the real accordion further
      down — so every matching section is taken and the pairs are pooled.
    */
    const questions = faqOnly(section);
    if (questions) {
      faq.push(...questions);
      if (!faqHeading && isHeading(first)) faqHeading = first.text;
      return;
    }

    body.push(section);
  });

  /*
    Fold an add-ons row into the pricing row above it. Only when they are
    genuinely adjacent — on the pages where other content sits between them,
    that content is the page's and stays where it is.
  */
  for (let i = body.length - 1; i > 0; i--) {
    const head = body[i].blocks[0];
    const above = body[i - 1].blocks[0];
    if (
      !isHeading(head) ||
      !/add-?on/i.test(head.text) ||
      !isHeading(above) ||
      !/pricing/i.test(above.text)
    )
      continue;

    /*
      The add-ons heading and its lede are one row; the cards themselves are
      the row after it. Take that one as well when it is nothing but the
      cards — otherwise the panel closes under the lede and the cards land a
      full band lower, which is exactly how it looked.
    */
    const cards = body[i + 1];
    const opensWithHeading = cards && isHeading(cards.blocks[0]) && cards.blocks[0].level <= 2;
    const cardsOnly =
      cards &&
      !opensWithHeading && // a row of its own title is a row of its own
      cards.blocks.length > 0 &&
      cards.blocks.some((b) => b.type === "columns");

    const parts = cardsOnly ? [body[i - 1], body[i], cards] : [body[i - 1], body[i]];
    const merged: Section = {
      ...body[i - 1],
      blocks: parts.flatMap((p) => p.blocks),
    };
    body.splice(i - 1, parts.length, merged);
    priced.add(merged);
  }

  return {
    heroImage: heroImageFor(page),
    lede: opening?.lede,
    introHtml: opening?.introHtml ?? [],
    priceFrom: entryPrice(sections),
    body,
    priced,
    areas,
    faq,
    faqHeading,
  };
}
