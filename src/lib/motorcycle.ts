/**
 * Content for /motorcycle-valeting-detailing.
 *
 * The words are the source page's own — see `.cache/html/` and
 * `src/content/pages.json` → `motorcycle-valeting-detailing`. What is *not* in
 * `pages.json` is the half of the page that matters most: the extractor read
 * the three package cards and the twenty-five add-on rows as loose runs of
 * headings and paragraphs and dropped every price with them (£165 / £240 /
 * £375, and the whole add-on price column), and it dropped the four FAQ pairs
 * entirely — leaving a "Frequently Asked Questions" heading with nothing under
 * it.
 *
 * Rendered block-by-block that page was a wall of unpriced bullet lists. The
 * prices and questions below are transcribed back from the mirrored source
 * HTML so the layout can be what the content already was: a price table, a
 * card grid and an accordion.
 *
 * Same pattern as `lib/headlight.ts` — a page that earns its own layout keeps
 * its copy here rather than fighting the generic block renderer.
 */

import { BOOK_URL, CONTACT } from "@/lib/site";

/** One add-on row: what it is, an optional qualifier, and the ask. */
export type Extra = { name: string; note?: string; price: string };

export const MOTORCYCLE = {
  /*
    The source's own <h1> is "Bike Wash Packages" — the packages widget's
    title, which happened to be the only h1 on the page. It stays as the
    packages section heading, and the page's opening h2 (its real subject,
    verbatim) is promoted to h1.
  */
  h1: "Premium Motorcycle Valeting & Detailing Services in London",
  introHtml:
    "At <strong>Medusa Auto Detailing</strong>, we specialise in <strong>motorbike and motorcycle detailing London</strong>, delivering expert cleaning, polishing, and ceramic protection. Whether you ride a sports bike, cruiser, tourer, or classic, our <strong>mobile motorcycle valeting London</strong> service ensures your bike looks immaculate, performs at its best, and stays protected against London’s roads and weather.",

  book: BOOK_URL,
  phone: CONTACT.phone,

  hero: {
    /*
      The one motorcycle photograph on the site is a portrait poster with its
      own title text baked into the top third and a services list across the
      bottom. Framed at 16/9 and pulled to 46% it crops to the bike alone —
      see the `object-[50%_46%]` on the hero card.
    */
    image: {
      src: "/assets/2025/09/motorcycle-detailing-london-medusa-auto-detailing.jpg.webp",
      alt: "A blacked-out cruiser detailed by Medusa Auto Detailing",
      w: 1024,
      h: 1536,
    },
  },

  why: {
    heading: "Why Choose Medusa for Motorcycle Cleaning in London?",
    items: [
      {
        icon: "star",
        title: "Motorcycle Detailing Experts",
        body: "From basic washes to full paint correction, chrome polishing, and ceramic coatings.",
      },
      {
        icon: "pin",
        title: "Mobile Bike Valeting Across London",
        body: "We bring our fully equipped mobile units to your home, garage, or workplace.",
      },
      {
        icon: "shield",
        title: "Ceramic Coating Specialists",
        body: "Long-lasting protection (1–5 years) for paintwork, plastics, and chrome.",
      },
      {
        icon: "gauge",
        title: "Trusted by London Riders",
        body: "Serving Central, West, East, South & North London, Surrey, and Kent.",
      },
      {
        icon: "spark",
        title: "Safe, Scratch-Free Process",
        body: "Aviation-grade, pH-balanced products and the two-bucket method to protect your bike’s finish.",
      },
    ] as const,
  },

  packages: {
    heading: "Bike Wash Packages",
    lede: "Premium detailing for a brand-new look",
    note: "This price is for 1 bike",
    items: [
      {
        name: "Dream Wash",
        tagline: "Our most popular service",
        price: "£165",
        badge: "Popular",
        features: [
          "Low pressure hot water wash",
          "De-greasing the bike",
          "Dirt & road grime cleaning",
          "Snow foam soap",
          "Detailed wheel cleaning",
          "Shock & swingarm cleaning",
          "Engine clean (non-fairing)",
          "Brake & caliper clean",
          "Chain cleaning",
          "Drive chain & stand lubrication",
          "Weather protection spray",
          "Air dry",
        ],
      },
      {
        name: "Special Wash",
        tagline: "One of our premium washes",
        price: "£240",
        features: [
          "All Dream Wash features",
          "Plastic & vinyl dressing",
          "Front sprocket cover clean",
          "Wax beading agent",
          "Tyre pressure check",
          "Oil level check",
          "Hand polish alloys & chrome",
          "Fork legs touch-up",
        ],
      },
      {
        name: "Ultimate Wash",
        tagline: "The most comprehensive service",
        price: "£375",
        features: [
          "All Special Wash features",
          "Fairings removed for deep engine clean",
          "Metal surface treatment & re-paint",
          "Detailed paint polish",
          "Ceramic sealer",
          "Machine polish aluminium/chrome",
          "Geotechnical plastics (semi-permanent)",
        ],
      },
    ],
  },

  /*
    The add-ons, in the source's own words, prices and order. The source
    printed all twenty-five as one run and so does this — grouping them under
    headings of our own invention would put words on the page that the site
    never wrote.
  */
  extras: {
    heading: "Extra Services",
    lede: "Simple add-ons you can pair with any package.",
    items: [
      { name: "ACF-50", note: "All-weather protection spray", price: "£45" },
      {
        name: "Excessive Grease Removal",
        note: "Especially for bikes with Scot Oilers",
        price: "£15",
      },
      { name: "Wheel Weight Sticker Removal", note: "Per wheel", price: "£10" },
      {
        name: "Full Body Cream Polishing",
        note: "Shine & paint protection",
        price: "£30",
      },
      {
        name: "Rust Removal Treatment",
        note: "Metal, aluminium & chrome surfaces",
        price: "£15",
      },
      {
        name: "Aluminium Exhaust Can Polishing",
        note: "Restore lustre of the can",
        price: "£20",
      },
      {
        name: "Basic Exhaust & Pipes Re-painting",
        note: "Refresh heat-affected areas",
        price: "£30",
      },
      { name: "Basic Engine Re-painting", note: "Cosmetic refresh", price: "£45" },
      {
        name: "Side & Centre Stand Re-painting",
        note: "Basic paint for stands",
        price: "£10",
      },
      {
        name: "Machine Polishing",
        note: "Coverage varies by motorcycle size",
        price: "POA",
      },
      {
        name: "Geotechnical Black Plastics",
        note: "Semi-permanent treatment",
        price: "£65",
      },
      {
        name: "Aluminium Wheel Polishing",
        note: "Normal £20 / Spoked £25 (per wheel)",
        price: "£20–£25",
      },
      { name: "Leather Paniers Clean & Protect", price: "£25" },
      { name: "Front Fork Painting", price: "£30" },
      { name: "Wax Beading Finish", price: "£20" },
      {
        name: "Sprocket Clean",
        note: "May vary by manufacturer (extra labour)",
        price: "£20",
      },
      { name: "Chain Tightening / Adjustment", price: "£10" },
      { name: "Ceramic Coating (mudguard, forks & tank)", price: "£65" },
      { name: "Ceramic Coating — mirrors & front screen", price: "£30" },
      { name: "Semi-permanent Black Plastic Coating", price: "£65" },
      {
        name: "Engine Clean & Weather Protection (full fairing)",
        note: "We remove & refit the fairing",
        price: "£70",
      },
      { name: "Jump Start", price: "£10" },
      { name: "Stage 3 Ceramic Coating", note: "~5 years durability", price: "£550" },
      { name: "Stage 1 Ceramic Coating", note: "~2 years durability", price: "£350" },
      {
        name: "Ceramic Sealing",
        note: "Sealer ~8 months. +£25 excessive grease (Scott oilers). Wheel sticker removal £10 each.",
        price: "£125+",
      },
    ] as Extra[],
  },

  areas: {
    heading: "Where We Operate",
    introHtml:
      "Medusa Auto Detailing provides <strong>motorcycle valeting &amp; detailing London</strong> services in:",
    zones: [
      { zone: "Central London", places: "City, Westminster, Camden, Islington" },
      { zone: "West London", places: "Kensington, Hammersmith, Ealing, Chiswick" },
      { zone: "South London", places: "Clapham, Brixton, Croydon" },
      { zone: "East London", places: "Stratford, Canary Wharf, Hackney" },
      { zone: "North London", places: "Enfield, Barnet, Finchley" },
      { zone: "Surrounding areas", places: "Surrey, Kent, Essex" },
    ],
    outroHtml:
      "If you’re outside these zones, get in touch — our <strong>mobile bike valeting London</strong> team may be able to reach you.",
    map: {
      src: "https://maps.google.com/maps?q=London%2C%20United%20Kingdom&t=m&z=10&output=embed&iwloc=near",
      title: "London, United Kingdom",
    },
  },

  cta: {
    heading: "Ready to transform your ride?",
    bodyHtml:
      "Book your <strong>motorcycle detailing London</strong> service with Medusa Auto Detailing today. From <strong>mobile bike valeting London</strong> to <strong>ceramic coating motorcycle services</strong>, we’ll keep your motorbike spotless, protected, and looking better than ever.",
  },
};
