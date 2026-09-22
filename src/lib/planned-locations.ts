/**
 * The 49 location pages the SEO plan asks for that have no source page.
 *
 * From the "Location build list" tab of Medusa_SEO_Plan — every row whose Kind
 * is `New build` and whose old URL reads `(new page, no old URL)`. The other 75
 * rows are moves and are in `lib/location-moves.ts`.
 *
 * The service half of each page is built the way the menu-group hubs are
 * (`lib/hub.ts`) — every word read back out of the service's own hub. What the
 * plan supplies is the place name, and what this file adds is structure: an
 * `h1`, a `title` and a breadcrumb in the shape the mirror's own 127 location
 * pages already use ("Mobile Car Wash in Wembley").
 *
 * **The local half comes from `lib/local-copy.ts`**, and it is the one file on
 * the site whose words are written rather than borrowed — rule 8.1 was lifted
 * for it, and only for it, on 2026-09-22. Until then these 49 pages shared
 * 100% of their eight-word sequences with a sibling and 48 of them never named
 * their own place below the h1, which is what the client had noticed: "some
 * location pages only mention the location in the h1". Each page now opens on
 * two paragraphs about its own town and closes the copy on the districts
 * around it.
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
import { localPlace } from "@/lib/local-copy";

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

/**
 * The photograph that sits beside the opening copy on a built page.
 *
 * Client, 2026-09-22, looking at `/car-detailing/watford`: "coba tambahkan
 * gambar di bagian ini, agar tidak keliatan sepi". That band was two
 * paragraphs in the left 45% of a gold row and nothing in the rest of it.
 *
 * Six per service, **rotated by the page's position in the build list**, so
 * neighbouring places do not open on the same picture. Every one is a
 * photograph the service's own pages already run; nothing was added to
 * `public/assets` for this.
 */
type Photo = { src: string; alt: string; w: number; h: number };

const PHOTOS: Record<Family, Photo[]> = {
  wash: [
    {
      src: "/assets/2025/02/car-cleaning-with-high-pressure-in-exterior-carwas-2023-11-27-05-35-22-utc-1.webp",
      alt: "A car being rinsed with a pressure washer",
      w: 1642,
      h: 1094,
    },
    {
      src: "/assets/2025/02/young-man-washing-car-on-carwash-station-outdoor-2023-11-27-05-27-22-utc-1-1.webp",
      alt: "A technician washing a car by hand",
      w: 968,
      h: 626,
    },
    {
      src: "/assets/2025/02/professional-car-wash-with-high-pressure-washer-an-2023-11-27-05-33-04-utc-e1720860612612.webp",
      alt: "Foam laid onto a car with a pressure washer",
      w: 900,
      h: 600,
    },
    {
      src: "/assets/2025/02/car-wash-2023-11-27-05-28-52-utc-e1720860749845.webp",
      alt: "A car under foam at a mobile wash",
      w: 900,
      h: 600,
    },
    {
      src: "/assets/2025/02/professional-car-cleaning-cleaning-the-steering-w-2023-11-27-05-30-02-utc-e1720860904413.webp",
      alt: "A steering wheel and dashboard being cleaned",
      w: 900,
      h: 600,
    },
    {
      src: "/assets/2021/12/20210528_114017-1870x770.jpg",
      alt: "A car drying after a wash",
      w: 1870,
      h: 770,
    },
  ],
  valeting: [
    {
      src: "/assets/2020/10/1128998174-huge-scaled.webp",
      alt: "A car interior being valeted",
      w: 2560,
      h: 1707,
    },
    {
      src: "/assets/2024/10/Untitled-design.webp",
      alt: "A valeted car, inside and out",
      w: 1650,
      h: 1275,
    },
    {
      src: "/assets/2021/12/20210729_195538-900x604.jpg",
      alt: "A car after a deep clean valet",
      w: 900,
      h: 604,
    },
    {
      src: "/assets/2023/08/4-a-900x604.webp",
      alt: "A convertible roof cleaned and reproofed",
      w: 900,
      h: 604,
    },
    {
      src: "/assets/2020/11/20201116_141524-1024x768.webp",
      alt: "A car being valeted at the kerb",
      w: 1024,
      h: 768,
    },
    {
      src: "/assets/2021/12/20210214_144341-1000x500.jpg",
      alt: "A car prepared for sale after a full valet",
      w: 1000,
      h: 500,
    },
  ],
  detailing: [
    {
      src: "/assets/2021/12/20210627_204813.webp",
      alt: "Paintwork after machine correction",
      w: 2000,
      h: 1500,
    },
    {
      src: "/assets/2021/12/20210528_164628.webp",
      alt: "A car detailed to an enhancement finish",
      w: 2000,
      h: 1500,
    },
    {
      src: "/assets/2021/12/20210729_195854.webp",
      alt: "A new car protected and sealed",
      w: 2000,
      h: 1500,
    },
    {
      src: "/assets/2020/10/pexels-jae-park-4141962-scaled.webp",
      alt: "A detailed car, its paintwork reflecting",
      w: 2560,
      h: 1920,
    },
    {
      src: "/assets/2024/10/Is-It-Worth-Getting-A-New-Car-Ceramic-Coated-900x604.webp",
      alt: "A ceramic-coated car beading water",
      w: 900,
      h: 604,
    },
    {
      src: "/assets/2021/12/20210820_184955-1000x500.jpg",
      alt: "A car finished to a perfection detail",
      w: 1000,
      h: 500,
    },
  ],
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

  /*
    Round two, 2026-09-22, from "Medusa ads keywords, Ahrefs verified.xlsx" —
    the "By area" sheet, where a pink cell against a service means that area
    has no page for it. 101 cells were pink; 24 of them this repo had already
    built in round one, leaving these 77. The sheet ranks every area by
    verified search demand, and these rows are in that order within each
    service, so the ones worth the most are the ones built first.
  */

  /* Mobile Car Wash — 17 more. */
  ["mobile-car-wash/basildon", "wash"],
  ["mobile-car-wash/bedfordshire", "wash"],
  ["mobile-car-wash/berkshire", "wash"],
  ["mobile-car-wash/bromley", "wash"],
  ["mobile-car-wash/chelmsford", "wash"],
  ["mobile-car-wash/cheshunt", "wash"],
  ["mobile-car-wash/essex", "wash"],
  ["mobile-car-wash/gravesend", "wash"],
  ["mobile-car-wash/guildford", "wash"],
  ["mobile-car-wash/harlow", "wash"],
  ["mobile-car-wash/hemel-hempstead", "wash"],
  ["mobile-car-wash/kent", "wash"],
  ["mobile-car-wash/milton-keynes", "wash"],
  ["mobile-car-wash/rickmansworth", "wash"],
  ["mobile-car-wash/surrey", "wash"],
  ["mobile-car-wash/sutton", "wash"],
  ["mobile-car-wash/welwyn-garden-city", "wash"],

  /* Car Valeting — 13 more. */
  ["car-valeting/basildon", "valeting"],
  ["car-valeting/chelmsford", "valeting"],
  ["car-valeting/clapham", "valeting"],
  ["car-valeting/east-london", "valeting"],
  ["car-valeting/essex", "valeting"],
  ["car-valeting/gravesend", "valeting"],
  ["car-valeting/harlow", "valeting"],
  ["car-valeting/high-wycombe", "valeting"],
  ["car-valeting/hornchurch", "valeting"],
  ["car-valeting/reading", "valeting"],
  ["car-valeting/romford", "valeting"],
  ["car-valeting/sidcup", "valeting"],
  ["car-valeting/welwyn-garden-city", "valeting"],

  /* Car Detailing — 47 more. */
  ["car-detailing/bedfordshire", "detailing"],
  ["car-detailing/borehamwood", "detailing"],
  ["car-detailing/central-london", "detailing"],
  ["car-detailing/chelsea", "detailing"],
  ["car-detailing/cheshunt", "detailing"],
  ["car-detailing/chingford", "detailing"],
  ["car-detailing/chiswick", "detailing"],
  ["car-detailing/clapham", "detailing"],
  ["car-detailing/ealing", "detailing"],
  ["car-detailing/enfield", "detailing"],
  ["car-detailing/finchley", "detailing"],
  ["car-detailing/fulham", "detailing"],
  ["car-detailing/hammersmith", "detailing"],
  ["car-detailing/hayes", "detailing"],
  ["car-detailing/hornchurch", "detailing"],
  ["car-detailing/islington", "detailing"],
  ["car-detailing/kensington", "detailing"],
  ["car-detailing/kent", "detailing"],
  ["car-detailing/knightsbridge", "detailing"],
  ["car-detailing/north-london", "detailing"],
  ["car-detailing/north-west-london", "detailing"],
  ["car-detailing/northwood", "detailing"],
  ["car-detailing/notting-hill", "detailing"],
  ["car-detailing/park-royal", "detailing"],
  ["car-detailing/pinner", "detailing"],
  ["car-detailing/preston", "detailing"],
  ["car-detailing/putney", "detailing"],
  ["car-detailing/reading", "detailing"],
  ["car-detailing/richmond-upon-thames", "detailing"],
  ["car-detailing/rickmansworth", "detailing"],
  ["car-detailing/ruislip", "detailing"],
  ["car-detailing/sidcup", "detailing"],
  ["car-detailing/south-london", "detailing"],
  ["car-detailing/stanmore", "detailing"],
  ["car-detailing/streatham", "detailing"],
  ["car-detailing/sudbury", "detailing"],
  ["car-detailing/surrey", "detailing"],
  ["car-detailing/sutton", "detailing"],
  ["car-detailing/twickenham", "detailing"],
  ["car-detailing/uxbridge", "detailing"],
  ["car-detailing/walthamstow", "detailing"],
  ["car-detailing/wandsworth", "detailing"],
  ["car-detailing/watford", "detailing"],
  ["car-detailing/wembley", "detailing"],
  ["car-detailing/westminster", "detailing"],
  ["car-detailing/wimbledon", "detailing"],
  ["car-detailing/windsor", "detailing"],
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
  const taken: Record<Family, number> = { wash: 0, valeting: 0, detailing: 0 };

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

    /*
      The written half. Throwing rather than falling back: a page added to
      `PLANNED_LOCATIONS` without a matching entry in `lib/local-copy.ts` is a
      page that would quietly go out as the hub's words again, which is the
      state the client asked us out of.
    */
    const local = localPlace(slug);
    if (!local) throw new Error(`planned-locations: no local copy for ${slug} — add it to lib/local-copy.ts`);

    /* Rotated by position within the family, so two neighbouring places do
       not open on the same picture. */
    const pool = PHOTOS[family];
    const at = taken[family]++;
    const photo = pool[at % pool.length];
    /* Half a turn ahead of the body's, so the header and the band under it
       are never the same picture. */
    const banner = pool[(at + pool.length / 2) % pool.length];

    const opener = cut
      .get(norm(plan.cuts[0]))!
      .flatMap((s) => s.blocks)
      .find((b) => b.type === "paragraph" && b.html.includes(plan.intro));
    if (!opener) throw new Error(`planned-locations: "${plan.hub}" has no opener "${plan.intro}"`);

    built[slug] = {
      slug,
      title: `${plan.label} ${place} | Book Now 0203 3556435`,
      /* The place's own sentence rather than the hub's, so all 49 meta
         descriptions differ from each other as well as from the hub's. */
      description: `${lead} ${firstSentence(local.opening, 155 - lead.length)}`,
      ogImage: hub.ogImage,
      ogW: hub.ogW,
      ogH: hub.ogH,
      /* Every word on the page is the hub's, so the day the hub was last
         edited is the only modification date this page has. `app/sitemap.ts`
         is what reads it. */
      modified: hub.modified ?? hub.published,
      breadcrumb: [{ name: "Home", href: "/" }, { name: heading }],
      h1: heading,
      sections: [
        /*
          The header carries the place sentence and a photograph behind it.

          Client, 2026-09-22: "ini bannernya gk ada gambar". No location page
          had one — 18 of the mirror's open on a video and 128 on the livery
          pattern alone — so this is the section's own background and
          `lib/location-frame.ts` reads it like any other.

          All three paragraphs were in here first, and that is 165 words of
          header — a screen and a half on a phone before the page begins. The
          same judgement is already written into `app/commercial-valeting`:
          "all three stacked made a header you had to scroll past".
        */
        {
          bg: { image: banner.src, w: banner.w, h: banner.h },
          blocks: [
            { type: "heading", level: 1, text: heading },
            { type: "paragraph", html: local.opening },
          ],
        },
        /*
          What being mobile means in this place, the hub's own description of
          the service, and a photograph beside them.

          A two-cell row where one cell is nothing but a picture is what
          `Blocks.tsx` reads as a media split: it centres the two and lets the
          picture stick while the copy scrolls. Without it this band was text
          in the left 45% of a gold row and nothing in the rest.
        */
        {
          blocks: [
            {
              type: "columns",
              spans: [7, 5],
              cols: [
                [{ type: "paragraph", html: local.why }, opener],
                [
                  {
                    type: "image",
                    src: photo.src,
                    alt: photo.alt,
                    w: photo.w,
                    h: photo.h,
                  },
                ],
              ],
            },
          ],
        },
        ...foldHeadings(
          dropTables(
            pruneQuestions(
              plan.keep.flatMap((name) => cut.get(norm(name))!),
              plan.dropQuestions,
              plan.hub,
            ),
          ),
        ),
        /*
          The districts around this one, as the heading `location-frame.ts`
          already recognises — it renders them as chips, the way it does the
          mirror's own borough pages. Real neighbouring places, so the page
          answers the search someone types rather than the one we wish for.
        */
        {
          blocks: [
            { type: "heading", level: 2, text: `${place}’s Neighborhoods` },
            { type: "paragraph", html: local.areas.join(", ") },
          ],
        },
        /* The heading the frame answers with the sibling chips — the one row
           these 49 pages do not share with each other. */
        { blocks: [{ type: "heading", level: 4, text: "Our Other Locations" }] },
      ],
    };
  }
  return built;
}
