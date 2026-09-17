/**
 * The 49 location pages the SEO plan asks for that have no source page.
 *
 * From the "Location build list" tab of Medusa_SEO_Plan — every row whose Kind
 * is `New build` and whose old URL reads `(new page, no old URL)`. The other 75
 * rows are moves and are in `lib/location-moves.ts`.
 *
 * Nothing here is written. Rule 8.1 in PROJECT.md stands: no invented copy. So
 * these are built the way the menu-group hubs are (`lib/hub.ts`) — every word
 * is read back out of a page the site already has, in this case the service's
 * own hub. What the plan supplies is the place name, and what this file adds is
 * structure: an `h1`, a `title` and a breadcrumb in the shape the mirror's own
 * 127 location pages already use ("Mobile Car Wash in Wembley").
 *
 * **These 49 pages therefore carry the same service copy and differ only in
 * the place.** That is the honest limit of building a page with no source: the
 * site has nothing written about Luton, Reading, Surrey or Kent. Nine of the
 * 49 are places another service already has a page for, but that page is about
 * a different service, so its words do not belong here either. Real per-place
 * copy from the client replaces `intro`/`topics` below one hub at a time.
 *
 * A hub's content is cut into runs at the headings named in `cuts`, and the
 * runs named in `keep` are carried over in that order. Cutting only at named
 * headings is what stops a price ladder being split: `/car-valeting/`'s
 * package section writes "£70" as a top-level h2 forty times, and none of them
 * is a cut point. A name that matches nothing throws at build, the way a rule
 * in `content/overrides.ts` does, so a regeneration cannot quietly drop a
 * section.
 *
 * The closing rows of all three hubs ("A Mobile Car Wash Near You" and its two
 * siblings) are deliberately left behind: each one lists the London boroughs
 * the company covers, which on a Kent or Bedfordshire page would be a claim
 * about the wrong place.
 */

import type { Block, Page, Section } from "@/lib/blocks";

type Family = "wash" | "valeting" | "detailing";

type Plan = {
  /** The page every word comes from. */
  hub: string;
  /** The label the mirror's own pages wear: "Mobile Car Wash in Wembley". */
  label: string;
  /** The opening paragraph, by its first words. */
  intro: string;
  /** Every heading a run starts at, in document order. */
  cuts: string[];
  /** The runs to carry over, in the order the page should read. */
  keep: string[];
  /**
   * FAQ questions to leave behind, by their exact text.
   *
   * One per hub, and always the same kind: the question that prices the
   * service "in London". Keeping it would have a Kent page answer a question
   * about somewhere else. The rest of the accordion is place-neutral.
   */
  dropQuestions: string[];
};

const PLANS: Record<Family, Plan> = {
  wash: {
    hub: "mobile-car-wash",
    label: "Mobile Car Wash",
    intro: "Our standard mobile car wash service",
    cuts: [
      "Professional Mobile Car Wash in London",
      "A Quick Clean, Inside and Out",
      "What\u2019s included",
      "OUR PRICING",
      "+ Add-on services",
      "A Mobile Car Wash Near You",
      "Book a Mobile Car Wash in London Today",
      "FAQs",
      "AREAS WE PROVIDE STANDARD CAR WASH SERVICES IN LONDON:",
    ],
    /* "+ Add-on services" also carries the hub's "Why Choose Medusa Auto
       Detailing?" columns, which sit inside that run rather than above it. */
    keep: [
      "A Quick Clean, Inside and Out",
      "What\u2019s included",
      "OUR PRICING",
      "+ Add-on services",
      "FAQs",
    ],
    dropQuestions: ["How much does a mobile car wash cost in London?"],
  },
  valeting: {
    hub: "car-valeting",
    label: "Car Valeting",
    /* The hub opens on two paragraphs; the first says the company serves
       "London and Hertfordshire", which is a claim about the wrong county on
       most of these pages. The second is about the service alone. */
    intro: "A high-quality valet service is crucial",
    cuts: [
      "MOBILE CAR VALETING IN LONDON",
      "Our Mobile Car Valeting Packages",
      "OUR PACKAGES",
      "MORE VALETING PACKAGES",
      "+ Add-on services",
      "At-Home Car Valet Service Near You",
      "FAQs",
    ],
    /* "Our Mobile Car Valeting Packages" is left behind: it is the 7x58
       comparison matrix, and repeating it on fourteen pages is a lot of markup
       for a table the hub itself already carries. */
    keep: ["OUR PACKAGES", "MORE VALETING PACKAGES", "+ Add-on services", "FAQs"],
    dropQuestions: ["How much does a full valet cost in the London?"],
  },
  detailing: {
    hub: "car-detailing",
    label: "Mobile Car Detailing",
    intro: "Car detailing refers to a process",
    cuts: [
      "Mobile Car Detailing in London",
      "Our Mobile Car Detailing Packages",
      "Car Detailing at Home Near You",
      "FAQs",
    ],
    /* The packages run carries the four price grids, the level descriptions
       and the "Why Choose Medusa Auto Detailing?" columns — none of those
       sections opens on a top-level heading of its own. */
    keep: ["Our Mobile Car Detailing Packages", "FAQs"],
    /* This hub's own pricing question asks about the UK, not London, so the
       accordion carries over whole. */
    dropQuestions: [],
  },
};

/** One row of the tab, as `[slug, family]`. */
export const PLANNED_LOCATIONS: ReadonlyArray<readonly [slug: string, family: Family]> = [

  /* Mobile Car Wash — 10 pages. */
  ["mobile-car-wash/brentwood", "wash"],
  ["mobile-car-wash/clapham", "wash"],
  ["mobile-car-wash/east-london", "wash"],
  ["mobile-car-wash/high-wycombe", "wash"],
  ["mobile-car-wash/hornchurch", "wash"],
  ["mobile-car-wash/luton", "wash"],
  ["mobile-car-wash/reading", "wash"],
  ["mobile-car-wash/romford", "wash"],
  ["mobile-car-wash/sidcup", "wash"],
  ["mobile-car-wash/south-london", "wash"],

  /* Car Valeting — 14 pages. */
  ["car-valeting/bedfordshire", "valeting"],
  ["car-valeting/berkshire", "valeting"],
  ["car-valeting/brentwood", "valeting"],
  ["car-valeting/bromley", "valeting"],
  ["car-valeting/cheshunt", "valeting"],
  ["car-valeting/guildford", "valeting"],
  ["car-valeting/hemel-hempstead", "valeting"],
  ["car-valeting/kent", "valeting"],
  ["car-valeting/luton", "valeting"],
  ["car-valeting/milton-keynes", "valeting"],
  ["car-valeting/rickmansworth", "valeting"],
  ["car-valeting/south-london", "valeting"],
  ["car-valeting/surrey", "valeting"],
  ["car-valeting/sutton", "valeting"],

  /* Car Detailing — 25 pages. */
  ["car-detailing/barnet", "detailing"],
  ["car-detailing/basildon", "detailing"],
  ["car-detailing/berkshire", "detailing"],
  ["car-detailing/brentwood", "detailing"],
  ["car-detailing/bromley", "detailing"],
  ["car-detailing/chelmsford", "detailing"],
  ["car-detailing/croydon", "detailing"],
  ["car-detailing/east-london", "detailing"],
  ["car-detailing/essex", "detailing"],
  ["car-detailing/gravesend", "detailing"],
  ["car-detailing/guildford", "detailing"],
  ["car-detailing/harlow", "detailing"],
  ["car-detailing/hemel-hempstead", "detailing"],
  ["car-detailing/hertfordshire", "detailing"],
  ["car-detailing/high-wycombe", "detailing"],
  ["car-detailing/hounslow", "detailing"],
  ["car-detailing/ilford", "detailing"],
  ["car-detailing/kingston", "detailing"],
  ["car-detailing/luton", "detailing"],
  ["car-detailing/milton-keynes", "detailing"],
  ["car-detailing/romford", "detailing"],
  ["car-detailing/slough", "detailing"],
  ["car-detailing/st-albans", "detailing"],
  ["car-detailing/welwyn-garden-city", "detailing"],
  ["car-detailing/west-london", "detailing"],
];

export const PLANNED_SLUGS = new Set(PLANNED_LOCATIONS.map(([slug]) => slug));

const norm = (s: string) => s.replace(/\s+/g, " ").trim();

/** "welwyn-garden-city" -> "Welwyn Garden City", the way `placeName` does it. */
function placeOf(slug: string) {
  return slug
    .slice(slug.indexOf("/") + 1)
    .split("-")
    .map((w) => (w === "upon" || w === "and" || w === "of" ? w : w.charAt(0).toUpperCase() + w.slice(1)))
    .join(" ");
}

/**
 * The hub's content cut into runs at `cuts`, each run keeping the section
 * boundaries and backgrounds it had.
 *
 * A run reaches to the next cut, across sections — which is how the detailing
 * hub's four price grids come along with the heading that introduces them,
 * since none of those sections opens on a heading of its own.
 */
function runs(hub: Page, cuts: string[]) {
  const wanted = new Set(cuts.map(norm));
  const out = new Map<string, Section[]>();
  let open: string | null = null;

  for (const section of hub.sections) {
    let buffer: Block[] = [];
    const flush = () => {
      if (open && buffer.length) out.get(open)!.push({ ...section, blocks: buffer });
      buffer = [];
    };
    for (const block of section.blocks) {
      if (block.type === "heading" && wanted.has(norm(block.text))) {
        flush();
        open = norm(block.text);
        if (!out.has(open)) out.set(open, []);
      }
      if (open) buffer.push(block);
    }
    flush();
  }
  return out;
}

/**
 * A section carrying nothing but headings joins the section below it.
 *
 * The site's own regrouping rule (PROJECT.md §5): "a heading — or a heading and
 * its lede — joins the row below it." Here it is load-bearing rather than
 * cosmetic. `/car-valeting/` writes "FAQs" as one row and its nine questions as
 * the next, and a run that keeps them apart hands the location frame two rows:
 * it claims the one holding the `faq` block, renders it in the frame's own FAQ
 * slot, and leaves the bare title stranded further down the page.
 *
 * The last section is left alone — it is the "Our Other Locations" heading, and
 * there is nothing below it to join.
 */
function foldHeadings(sections: Section[]) {
  const out: Section[] = [];
  let carried: Block[] = [];
  for (const [i, section] of sections.entries()) {
    const headingOnly = section.blocks.every((b) => b.type === "heading");
    if (headingOnly && i < sections.length - 1) {
      carried = [...carried, ...section.blocks];
      continue;
    }
    out.push(carried.length ? { ...section, blocks: [...carried, ...section.blocks] } : section);
    carried = [];
  }
  return out;
}

/**
 * The per-package spec tables, gone.
 *
 * `/car-valeting/`'s "OUR PACKAGES" row prices five packages and then lists what
 * each one includes as a table — 216 rows across five of them. Carried over,
 * that made a location page ten times the weight of every other one: 56,343
 * characters against Preston's 5,824, and the only location page on the site
 * with a `<table>` in it. The price ladder is what a location page is for; the
 * line-by-line spec is a click away on the hub and on each package's own page.
 *
 * The wash and detailing hubs price in cards rather than tables, so this only
 * ever fires on the fourteen valeting pages.
 */
function dropTables(sections: Section[]) {
  const walk = (blocks: Block[]): Block[] =>
    blocks
      .filter((b) => b.type !== "table")
      .map((b) => (b.type === "columns" ? { ...b, cols: b.cols.map(walk) } : b));
  return sections.map((s) => ({ ...s, blocks: walk(s.blocks) }));
}

/** The same sections with `drop`'s questions gone from every `faq` block. */
function pruneQuestions(sections: Section[], drop: string[], hub: string) {
  if (drop.length === 0) return sections;
  const wanted = new Set(drop.map(norm));
  const seen = new Set<string>();
  const walk = (blocks: Block[]): Block[] =>
    blocks.map((b) => {
      if (b.type === "columns") return { ...b, cols: b.cols.map(walk) };
      if (b.type !== "faq") return b;
      return {
        ...b,
        items: b.items.filter((i) => {
          if (!wanted.has(norm(i.q))) return true;
          seen.add(norm(i.q));
          return false;
        }),
      };
    });
  const out = sections.map((s) => ({ ...s, blocks: walk(s.blocks) }));
  for (const q of drop)
    if (!seen.has(norm(q))) throw new Error(`planned-locations: "${hub}" has no question "${q}"`);
  return out;
}

/**
 * The borrowed opener's first sentence, cut to what is left of a meta
 * description after the place line — at a word boundary, so the snippet Google
 * shows ends on a word rather than mid-syllable.
 */
function firstSentence(html: string, budget: number) {
  const text = html
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/\s+/g, " ")
    .trim();
  const sentence = text.match(/^.*?[.!?](?=\s|$)/)?.[0] ?? text;
  if (sentence.length <= budget) return sentence;
  return sentence.slice(0, sentence.lastIndexOf(" ", budget)).replace(/[,;:]$/, "") + "…";
}

/**
 * The 49 pages, built from the hubs as they stand *after* `overrides.ts` — so a
 * price the client has corrected reaches these pages too.
 */
export function buildPlannedLocations(pages: Record<string, Page>): Record<string, Page> {
  const built: Record<string, Page> = {};

  for (const [slug, family] of PLANNED_LOCATIONS) {
    const plan = PLANS[family];
    const hub = pages[plan.hub];
    if (!hub) throw new Error(`planned-locations: no hub page "${plan.hub}" for ${slug}`);

    const cut = runs(hub, plan.cuts);
    for (const name of plan.cuts)
      if (!cut.has(norm(name)))
        throw new Error(`planned-locations: "${plan.hub}" has no heading "${name}"`);

    const place = placeOf(slug);
    const heading = `${plan.label} in ${place}`;
    const lead = `${plan.label} in ${place}.`;

    const opener = cut
      .get(norm(plan.cuts[0]))!
      .flatMap((s) => s.blocks)
      .find((b) => b.type === "paragraph" && b.html.includes(plan.intro));
    if (!opener) throw new Error(`planned-locations: "${plan.hub}" has no opener "${plan.intro}"`);

    built[slug] = {
      slug,
      title: `${plan.label} ${place} | Book Now 0203 3556435`,
      description: `${lead} ${firstSentence(
        (opener as Extract<Block, { type: "paragraph" }>).html,
        155 - lead.length,
      )}`,
      ogImage: hub.ogImage,
      ogW: hub.ogW,
      ogH: hub.ogH,
      breadcrumb: [{ name: "Home", href: "/" }, { name: heading }],
      h1: heading,
      sections: [
        { blocks: [{ type: "heading", level: 1, text: heading }, opener] },
        ...foldHeadings(
          dropTables(
            pruneQuestions(
              plan.keep.flatMap((name) => cut.get(norm(name))!),
              plan.dropQuestions,
              plan.hub,
            ),
          ),
        ),
        /* The heading the frame answers with the sibling chips — the one row
           these 49 pages do not share with each other. */
        { blocks: [{ type: "heading", level: 4, text: "Our Other Locations" }] },
      ],
    };
  }
  return built;
}
