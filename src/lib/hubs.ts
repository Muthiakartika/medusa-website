/**
 * The menu-group hubs: one spec per column of the Services mega-menu that the
 * client has asked for a page behind. `lib/hub.ts` is the machinery that turns
 * one of these into a page's worth of content; `components/HubPage.tsx` lays
 * it out. Everything either of them shows is read back out of the pages the
 * column links to — see the note at the top of `lib/hub.ts`.
 *
 * Adding a third is this file plus a four-line route: give the NAV group an
 * `href`, add the slug to `app/sitemap.ts` and to `EXTRA_ROUTES` in
 * `scripts/verify.mjs`, and the rest follows.
 */

import { HEADLIGHT } from "@/lib/headlight";
import type { HubSpec } from "@/lib/hub";

/** Client, 2026-09-15. Four services, two of which quote a price. */
export const REPAIRS: HubSpec = {
  slug: "repairs",
  title: "Repairs & Restoration",
  menuLabel: "Repairs & Restoration",
  /*
    A technician sanding a body panel, from `/repairs/paint-overspray-removal`.
    The only landscape file of header size among the four — the graffiti page's
    is an 800px square Elementor thumbnail and the headlight one is a 1200x1500
    portrait — and the one that reads as repair work rather than cleaning.
  */
  heroImage:
    "/assets/2025/02/polishing-the-surface-repairman-is-working-with-c-2024-02-28-19-11-55-utc-1.webp",
  /* A machine polisher on a panel, from the page the reasons come from. */
  whyImage:
    "/assets/elementor/thumbs/close-up-of-the-hands-of-a-car-mechanic-at-a-servi-2024-12-02-11-55-00-utc-1-r1e9o8d56eqisnmplho9bfo70eb8lujn6d3l6oh2kg.webp",
  /*
    The graffiti page's list: the longest of the three the group carries, and
    the only one whose reasons past the lead are about the company rather than
    about one service.
  */
  why: {
    slug: "repairs/car-graffiti-removal",
    heading: "Why Choose Medusa Auto Detailing?",
    dropLead: 1,
  },
  /* No page in this group carries an `faq` block, so the accordion is built
     from these pages' own question-shaped headings instead. */
  questionHeadings: [
    ["repairs/headlight-restoration", "Why Headlight Restoration Matters"],
    ["repairs/headlight-restoration", "The Headlight Restoration Process"],
    ["repairs/engine-bay-steam-cleaning", "Why Engine Bay Steam Cleaning Matters"],
    ["repairs/car-graffiti-removal", "Why Trust Professionals for Car Graffiti Removal?"],
    ["repairs/paint-overspray-removal", "What to Do If You Have Paint Spillage in Your Car"],
    ["repairs/paint-overspray-removal", "Why Removing Paint from Car Interiors Is Challenging:"],
  ],
  cardImages: {
    /* Headlight restoration is a hand-built route and the photograph it
       actually runs is in `lib/headlight.ts`; its `ogImage` is a 1474x2208
       portrait that a 3:2 card would crop to a sliver. */
    "repairs/headlight-restoration": HEADLIGHT.hero.image,
  },
  /* Four across only from `xl`: at `lg` the shell is 834px and four columns
     are 193px each, narrower than the add-on cards' 220px floor. */
  cardCols: "sm:grid-cols-2 xl:grid-cols-4",
};

/** Client, 2026-09-16: "one more master page to create, with links on the
 *  master page going to its childs". Nine services, five of which quote a
 *  price. */
export const INTERIOR: HubSpec = {
  slug: "car-interior-cleaning",
  title: "Interior Cleaning",
  menuLabel: "Interior Cleaning",
  /* A technician steam-cleaning a seat, from `/car-interior-cleaning/
     steam-cleaning`. Landscape and the largest interior photograph the group
     has that is not a portrait crop. */
  heroImage:
    "/assets/2025/02/servise-specialist-doing-car-seats-dry-cleaning-wi-2024-10-20-10-15-55-utc-1.webp",
  /* Vacuuming a driver's seat, from the page the reasons come from. */
  whyImage:
    "/assets/2025/02/partial-view-of-car-cleaner-vacuuming-drivers-seat-2024-11-17-07-05-45-utc-1.webp",
  /*
    Every list in this group names its own service somewhere in the bodies —
    there is no fully general one to take. This is the least specific of the
    nine: past the lead, "Convenience on Your Terms" and "Professional and
    Fully Insured Service" say nothing about leather at all, and the other two
    mention it only in passing. The alternatives are worse: `interior-valet`'s
    second reason points at "the booking form on this page", which this page
    does not have, and `steam-cleaning`'s fourth is entirely about steam.
  */
  why: {
    slug: "car-interior-cleaning/leather-cleaning",
    heading: "Why Choose Medusa Auto Detailing?",
    dropLead: 1,
  },
  /* Three of the nine carry real `faq` blocks — twenty-one questions between
     them — so `hubQuestions` never reaches a fallback here. */
  /* Nine cards: three across from `lg`, which is what `CardRow` uses. */
  cardCols: "sm:grid-cols-2 lg:grid-cols-3",
};
