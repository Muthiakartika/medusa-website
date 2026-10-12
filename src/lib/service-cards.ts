/**
 * "Our … Services" — the hub's card grid, on the four service pages that are
 * not hubs.
 *
 * Client, 2026-09-22, listing URLs under each of four headings — "On
 * /mobile-car-wash — add these 3 services:", the same for /car-detailing,
 * /car-valeting and /commercial-valeting — and then, over a screenshot of
 * `/repairs`: "And in, the same way you did for repairs page".
 *
 * **Each list is exactly what the page was missing.** Checked against the
 * rendered pages that day: /mobile-car-wash linked silver, gold, platinum and
 * exterior-plus and nothing else — bronze and exterior wash are the two tiers
 * `overrides.ts` retires from its price row — /car-valeting linked five of its
 * seven, /car-detailing five of its eight, and /commercial-valeting none of
 * its three. So a card here never repeats a package the page already sells;
 * it closes the hole between the menu column and the page under it.
 *
 * **Nothing is written.** `cardsFrom` in `lib/hub.ts` builds the same card a
 * hub builds — the menu's own label, the page's own opening paragraph, its own
 * entry price, its own photograph — so a price change on a service page
 * follows here, and a card is one shape wherever it appears. The only string
 * in this file is each section's heading, which is the pattern the client
 * approved on `/repairs`: "Our <the menu's name for the group> Services".
 */

import { PAGES } from "@/lib/blocks";
import { cardsFrom, type HubCard } from "@/lib/hub";
import { NAV, type NavItem } from "@/lib/site";

type ServiceGroup = {
  /** The section's heading. */
  heading: string;
  /** The services to show, by slug, in the order the client listed them. */
  services: string[];
  /**
   * Put the band immediately after the body section with this heading,
   * instead of last. Client, 2026-09-22, against `/car-detailing`: "place it
   * here where its black" — the slot the duplicate LEVEL row left when
   * `overrides.ts` dropped it, between the case for the company and the
   * closing call to action.
   */
  after?: string;
};

export const SERVICE_GROUPS: Record<string, ServiceGroup> = {
  "mobile-car-wash": {
    /* "add in here, and change the title to 'other' instead of 'our'" —
       client, 2026-09-22, arrow drawn on the seam above the gold "A Mobile
       Car Wash Near You" band. That is the end of the "Why Choose" run, and
       the whole page is one source section, so the cut falls inside it. */
    heading: "Other Car Wash Services",
    after: "Why Choose Medusa Auto Detailing?",
    services: [
      "mobile-car-wash/exterior-wash",
      /* Alloy wheel protection was the second card here until 2026-10-06,
         when the client moved it out of the car wash group altogether: "This
         page is not alloy wheel cleaning its alloy wheel protectors". It is a
         card on /car-detailing now, the column the menu moved it to. */
      /* In the Car Valeting column since 2026-09-08 and under this page's
         prefix on disk; the client lists it here, which is where its URL
         has always said it belongs. */
      "mobile-car-wash/car-wax-service",
    ],
  },
  "car-detailing": {
    /* "Instead of 'Our', add in 'Other' on this /car-deatiling page" —
       client, 2026-09-22. Only this page: it is the one whose band sits in
       the middle of its own packages rather than after them, so "Other" is
       what tells the reader these are not the five levels above. */
    heading: "Other Car Detailing Services",
    after: "Why Choose Medusa Auto Detailing?",
    services: [
      "car-detailing/ceramic-coating",
      "car-detailing/machine-polish",
      "car-detailing/windscreen-protection",
      /* Joined this column on 2026-10-06 (see the car wash list above), and
         the brief asks for exactly this: "Other relevant Medusa pages should
         link back using natural anchors such as: Alloy Wheel Protection". */
      "car-detailing/alloy-wheel-protection",
    ],
  },
  /*
    `/car-valeting` is deliberately absent. Its two services were a band here
    until 2026-09-22, when the client asked for them inside the existing
    "MORE VALETING PACKAGES" row instead — "add the to the existing area
    here". They are two more tiles in that row now, added by
    `content/overrides.ts`, so there is nothing for this file to render.
  */
  "commercial-valeting": {
    heading: "Our Commercial & Fleet Services",
    services: [
      "commercial-valeting/mobile-truck-cleaning",
      "commercial-valeting/aircraft-cleaning",
      "commercial-valeting/car-van-stickers-removal",
    ],
  },
};

/** Every entry in the navigation, however deep. */
function everyNavItem(items: NavItem[], into: NavItem[] = []): NavItem[] {
  for (const item of items) {
    into.push(item);
    if (item.children) everyNavItem(item.children, into);
  }
  return into;
}

/**
 * The menu entry for a service, wherever in the menu it sits.
 *
 * The whole tree rather than one column, because a service is not always in
 * the column of the page that shows it: Car Wax Service has been in the Car
 * Valeting column since 2026-09-08 and its page is under `/mobile-car-wash/`,
 * which is the page the client wants its card on. Throwing keeps every name
 * the client's own — a card must not carry a label this file invented.
 */
/**
 * The menu entry a card is named after — or, for a page the menu no longer
 * lists, that page's own breadcrumb tail.
 *
 * The throw exists so no card can carry a name this repo invented, and it
 * still does: the fallback is the page's own name, the same source
 * `nameReadMoreLinks` uses to label a Read More, so nothing is written here.
 * What it allows is the case the client created on 2026-10-12 by striking
 * Exterior Wash out of the Car Wash column while leaving the page selling:
 * off the menu, still on the page. A slug that is in neither still throws.
 */
function navItemFor(slug: string, owner: string): NavItem {
  const href = "/" + slug;
  const found = everyNavItem(NAV).find((i) => i.href === href);
  if (found) return found;

  const tail = PAGES[slug]?.breadcrumb?.at(-1)?.name?.trim();
  if (!tail) throw new Error(`${owner}: ${href} is not in the navigation and has no page to name it`);
  return { label: tail, href };
}

/**
 * Cards for named services, for a page that cross-sells a few rather than
 * carrying a band — `/car-detailing/alloy-wheel-protection`'s "This service
 * can also complement a Medusa: New Car Protection Detail or Ceramic Coating
 * Package". Same card, same menu-label rule, same throw.
 */
export function cardsForSlugs(slugs: string[], owner: string): HubCard[] {
  return cardsFrom(
    slugs.map((s) => navItemFor(s, owner)),
    { owner },
  );
}

/** The band of cards a page carries, or null for the 301 pages that carry none. */
export function serviceCardsFor(
  slug: string,
): { heading: string; after?: string; cards: HubCard[] } | null {
  const group = SERVICE_GROUPS[slug];
  if (!group) return null;
  return {
    heading: group.heading,
    after: group.after,
    cards: cardsFrom(
      group.services.map((s) => navItemFor(s, slug)),
      { owner: slug },
    ),
  };
}
