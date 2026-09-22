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

import { cardsFrom, type HubCard } from "@/lib/hub";
import { NAV, type NavItem } from "@/lib/site";

type ServiceGroup = {
  /** The section's heading. */
  heading: string;
  /** The services to show, by slug, in the order the client listed them. */
  services: string[];
};

export const SERVICE_GROUPS: Record<string, ServiceGroup> = {
  "mobile-car-wash": {
    heading: "Our Car Wash Services",
    services: [
      "mobile-car-wash/exterior-wash",
      "mobile-car-wash/alloy-wheel-cleaning",
      /* In the Car Valeting column since 2026-09-08 and under this page's
         prefix on disk; the client lists it here, which is where its URL
         has always said it belongs. */
      "mobile-car-wash/car-wax-service",
    ],
  },
  "car-detailing": {
    heading: "Our Car Detailing Services",
    services: [
      "car-detailing/ceramic-coating",
      "car-detailing/machine-polish",
      "car-detailing/windscreen-protection",
    ],
  },
  "car-valeting": {
    heading: "Our Car Valeting Services",
    services: ["car-valeting/mini-valet", "car-valeting/premium-full-valet"],
  },
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
function navItemFor(slug: string, owner: string): NavItem {
  const href = "/" + slug;
  const found = everyNavItem(NAV).find((i) => i.href === href);
  if (!found) throw new Error(`${owner}: ${href} is not in the navigation`);
  return found;
}

/** The band of cards a page carries, or null for the 301 pages that carry none. */
export function serviceCardsFor(
  slug: string,
): { heading: string; cards: HubCard[] } | null {
  const group = SERVICE_GROUPS[slug];
  if (!group) return null;
  return {
    heading: group.heading,
    cards: cardsFrom(
      group.services.map((s) => navItemFor(s, slug)),
      { owner: slug },
    ),
  };
}
