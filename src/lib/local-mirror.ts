/**
 * The other half of `lib/local-copy.ts`: the 75 **mirror** location pages.
 *
 * Those two files are the whole of the written word on this site. `local-copy`
 * holds the places and the per-service copy for the pages this repo builds from
 * a hub; this one holds what the mirror's own location pages needed, which is a
 * much smaller thing, because their bodies are already about their own towns —
 * Watford's names Cassiobury, Croxley Park and Nascot Wood, and every one of
 * the 75 names its place below the h1, a median of thirteen times.
 *
 * **What was wrong with them was the structure, not the prose.** Measured
 * 2026-09-22 across the 124 pages on the client's Ahrefs-verified list:
 *
 * - **162 section-opening headings on 54 pages are written as `h3` or `h4`**
 *   where they are the title of a whole row — "How Our Services Work?" on 41
 *   pages, "Experience Convenient Car Care in X: Book Our Mobile Car Wash
 *   Now!" on 30, "Enhancing Vehicle Longevity in …", "Why Medusa Auto
 *   Detailing?". The section title therefore sits at the same rank as the
 *   items inside it, and below the rank of the row above. `promoteSections`
 *   fixes that and **changes no words at all**.
 * - **150 of 339 source H2s never name their page's place.** The worst are the
 *   valeting pages, seven of which have one of six. `headings` renames only
 *   those, and only where that row's own body already talks about the town, so
 *   the heading describes what is under it rather than reaching for a keyword.
 * - **Machine-spun English**, still live on the client's site: "scrapes and
 *   swirls on the lorry's surface area" (9 pages), "Just how usually should I
 *   have my car valeted" (9), "Say goodbye to Waiting: Mobile Car Wash That
 *   Fits Your Hectic Way Of Life" (7), "Convenient Mobile Car Wash sERVICES"
 *   (1). `text` corrects those sentences and nothing else.
 * - **No districts row.** The 49 built pages and the 19 borough hubs all name
 *   the places around them; the mirror's service-in-a-place pages never did.
 *   `districts()` gives them the same row, out of `LOCAL_PLACES[…].areas`, so
 *   every name is one this repo already publishes.
 *
 * The rule the repo owner set on 2026-09-22 stands here too: **headings and
 * typos only**. No source paragraph is rewritten. Everything written below is
 * either the page's own words rearranged, geography, or a restatement of what
 * the business already says about itself — never a new claim about response
 * times, customer counts, years in a place, prices or awards.
 *
 * Every rule is matched on the **exact source text** and throws when it finds
 * nothing, the way `content/overrides.ts` does: `npm run content` rewrites
 * `pages.json` wholesale, and a rename that quietly missed is a page that
 * quietly went back to how it was.
 */

import type { Block, Page, Section } from "@/lib/blocks";
import { LOCAL_PLACES } from "@/lib/local-copy";

/* ── The audit scope ─────────────────────────────────────────────── */

/**
 * The 75 mirror pages on the client's list, 2026-09-22.
 *
 * `medusa_location_urls.txt` — 124 URLs pulled from the Ahrefs-verified
 * keyword sheet, which is every location page that existed before the round-two
 * build of the same day. 49 of them this repo builds (`PLANNED_LOCATIONS`);
 * these are the other 75.
 *
 * It is a list rather than "every moved location page" because the client
 * scoped it that way: "Only audit/update URLs included in this list." The 52
 * mirror location pages not on it carry the same demoted headings and would
 * take the same free fix.
 */
export const MIRROR_AUDIT: ReadonlySet<string> = new Set([
  "car-detailing/harrow",
  "car-valeting/barnet",
  "car-valeting/borehamwood",
  "car-valeting/central-london",
  "car-valeting/chiswick",
  "car-valeting/croydon",
  "car-valeting/edgware",
  "car-valeting/enfield",
  "car-valeting/finchley",
  "car-valeting/harrow",
  "car-valeting/hertfordshire",
  "car-valeting/ilford",
  "car-valeting/islington",
  "car-valeting/kensington",
  "car-valeting/north-london",
  "car-valeting/northwood",
  "car-valeting/park-royal",
  "car-valeting/pinner",
  "car-valeting/preston",
  "car-valeting/putney",
  "car-valeting/ruislip",
  "car-valeting/slough",
  "car-valeting/st-albans",
  "car-valeting/stanmore",
  "car-valeting/uxbridge",
  "car-valeting/wandsworth",
  "car-valeting/watford",
  "car-valeting/west-london",
  "car-valeting/westminster",
  "car-valeting/windsor",
  "mobile-car-wash/barnet",
  "mobile-car-wash/borehamwood",
  "mobile-car-wash/central-london",
  "mobile-car-wash/chelsea",
  "mobile-car-wash/chingford",
  "mobile-car-wash/chiswick",
  "mobile-car-wash/croydon",
  "mobile-car-wash/ealing",
  "mobile-car-wash/edgware",
  "mobile-car-wash/enfield",
  "mobile-car-wash/finchley",
  "mobile-car-wash/fulham",
  "mobile-car-wash/golders-green",
  "mobile-car-wash/hammersmith",
  "mobile-car-wash/harrow",
  "mobile-car-wash/hayes",
  "mobile-car-wash/hounslow",
  "mobile-car-wash/ilford",
  "mobile-car-wash/islington",
  "mobile-car-wash/kensington",
  "mobile-car-wash/kingston",
  "mobile-car-wash/knightsbridge",
  "mobile-car-wash/north-london",
  "mobile-car-wash/north-west-london",
  "mobile-car-wash/northwood",
  "mobile-car-wash/notting-hill",
  "mobile-car-wash/park-royal",
  "mobile-car-wash/pinner",
  "mobile-car-wash/preston",
  "mobile-car-wash/richmond-upon-thames",
  "mobile-car-wash/ruislip",
  "mobile-car-wash/slough",
  "mobile-car-wash/st-albans",
  "mobile-car-wash/stanmore",
  "mobile-car-wash/streatham",
  "mobile-car-wash/sudbury",
  "mobile-car-wash/twickenham",
  "mobile-car-wash/uxbridge",
  "mobile-car-wash/walthamstow",
  "mobile-car-wash/wandsworth",
  "mobile-car-wash/watford",
  "mobile-car-wash/wembley",
  "mobile-car-wash/west-london",
  "mobile-car-wash/wimbledon",
  "mobile-car-wash/windsor",
]);

/* ── The edit tables ──────────────────────────────────────────────────── */

export type MirrorEdit = {
  /** Headings to rewrite, by their exact source text. */
  headings?: { from: string; to: string }[];
  /** Sentences to correct, by their exact source text. */
  text?: { from: string; to: string }[];
};

/**
 * Keyed by slug, because these are page edits rather than place descriptions —
 * `car-valeting/harrow` and `mobile-car-wash/harrow` need different headings
 * from each other even though they are the same town.
 */
export const MIRROR_EDITS: Record<string, MirrorEdit> = {
  "car-detailing/harrow": {
    headings: [
      {
        from: "Convenient Mobile Detailing for Busy Professionals",
        to: "Detailing for Commuters, Showrooms and Trade Clients",
      },
      {
        from: "Flexible Detailing Packages to Suit Every Need",
        to: "Enhancement, Correction and the Extras That Go With Them",
      },
      {
        from: "How Our Services Work?",
        to: "Detailing Without a Tap or a Socket",
      },
    ],
  },
  "car-valeting/barnet": {
    headings: [
      {
        from: "Convenient Mobile Valeting for Busy Professionals",
        to: "Fitting a Valet Around the Working Day",
      },
      {
        from: "Flexible Valeting Packages to Suit Every Need",
        to: "From a Mini Valet to a Full Detail",
      },
      {
        from: "Book Your Mobile Valeting Appointment Today.",
        to: "Book a Valet in Barnet",
      },
    ],
    text: [
      {
        from: "we guarantee attention to detail and a polished result, every time",
        to: "the same attention goes into the detail and the finish",
      },
      {
        from: "your car will be showroom-ready without you ever needing to leave Barnet",
        to: "your car will be clean inside and out without you ever needing to leave Barnet",
      },
    ],
  },
  "car-valeting/borehamwood": {
    headings: [
      {
        from: "Why Choose Medusa Mobile Valeting?",
        to: "Valeting Without a Trip to the Car Wash",
      },
      {
        from: "Key Benefits of Our Service",
        to: "What the Service Includes",
      },
      {
        from: "Flexible Valeting Packages for Every Need",
        to: "Maintenance Washes and Pre-Event Preparation",
      },
    ],
    text: [
      {
        from: "With Medusa, you can rest assured that your vehicle will always receive top-tier care.",
        to: "The work is done where the car is parked, with water and power brought along.",
      },
    ],
  },
  "car-valeting/central-london": {
    headings: [
      {
        from: "Why Choose Medusa Mobile Valeting?",
        to: "Keeping a Car Clean in Central London Traffic",
      },
      {
        from: "Flexible Valeting Packages for Every Requirement",
        to: "Packages for Residents and Professionals",
      },
      {
        from: "How Our Services Work?",
        to: "Choosing a Time and a Place",
      },
    ],
    text: [
      {
        from: "guarantee your car remains spotless amidst the hustle and bustle of city life",
        to: "are what keep the car clean between city journeys",
      },
    ],
  },
  "car-valeting/chiswick": {
    headings: [
      {
        from: "Convenient Mobile Valeting for Busy Professionals",
        to: "Valeting While You Are at Work",
      },
      {
        from: "Enhancing Vehicle Longevity in Urban Areas",
        to: "Keeping Paintwork and Interiors Sound in Chiswick",
      },
      {
        from: "How Our Services Work?",
        to: "A Valet at Your Chiswick Address, Step by Step",
      },
    ],
    text: [
      {
        from: "restoring your car’s interior and exterior to showroom condition",
        to: "cleaning your car’s interior and exterior",
      },
    ],
  },
  "car-valeting/croydon": {
    headings: [
      {
        from: "Convenient Mobile Valeting for Busy Professionals",
        to: "Valeting for a Car That Is Parked All Day",
      },
      {
        from: "Flexible Valeting Packages to Suit Every Need",
        to: "From a Touch-Up Wash to a Deep-Clean Detail",
      },
      {
        from: "Enhancing Vehicle Longevity in Urban Areas",
        to: "City Dust, Road Salt and Tree Sap in Croydon",
      },
    ],
    text: [
      {
        from: "our mobile valeting service is the smart choice",
        to: "we bring the valet to where the car is parked for the day",
      },
      {
        from: "We ensure consistent, showroom-quality results every time.",
        to: "Each one is carried out at the address, with our own water and power.",
      },
    ],
  },
  "car-valeting/edgware": {
    headings: [
      {
        from: "Convenient Mobile Valeting for Busy Professionals",
        to: "Valeting for Workplaces on Station Road and the Edgware Road",
      },
      {
        from: "Flexible Valeting Packages to Suit Every Need",
        to: "Maintenance Washes, Full Valets and Add-Ons",
      },
      {
        from: "Enhancing Vehicle Longevity in Urban Areas",
        to: "What Regular Valeting Protects Against",
      },
    ],
    text: [
      {
        from: "We work around your schedule and ensure consistent, high-quality results every time",
        to: "We fit around your schedule and bring our own water and power to the address",
      },
    ],
  },
  "car-valeting/enfield": {
    headings: [
      {
        from: "Convenient Mobile Valeting for Busy Professionals",
        to: "Valeting Around a Working Week in Enfield",
      },
      {
        from: "How Our Services Work?",
        to: "How a Valet Is Arranged Here",
      },
      {
        from: "Enhancing Vehicle Longevity in Urban Areas",
        to: "Keeping Ahead of Road Salt and Traffic Grime",
      },
    ],
    text: [
      {
        from: "You can count on Medusa for consistently brilliant results, every time.",
        to: "The work is done at your address, with the van bringing its own water and power.",
      },
    ],
  },
  "car-valeting/finchley": {
    headings: [
      {
        from: "Flexible Valeting Packages to Suit Every Need",
        to: "Packages for Regular Upkeep or a One-Off Clean",
      },
      {
        from: "How Our Services Work?",
        to: "Booked Online, Cleaned Where the Car Sits",
      },
      {
        from: "Enhancing Vehicle Longevity in Urban Areas",
        to: "Why Paint Dulls on a Finchley Street",
      },
    ],
    text: [
      {
        from: "who ensure consistent, high-quality results every time",
        to: "working to the same standard on every visit",
      },
    ],
  },
  "car-valeting/harrow": {
    headings: [
      {
        from: "Convenient Mobile Valeting for Busy Professionals",
        to: "A Valet That Works Around Meetings and Clients",
      },
      {
        from: "Flexible Valeting Packages to Suit Every Need",
        to: "Packages for Before a Road Trip and After One",
      },
      {
        from: "How Our Services Work?",
        to: "Nothing to Provide but the Vehicle",
      },
    ],
  },
  "car-valeting/hertfordshire": {
    headings: [
      {
        from: "Why Choose Medusa Mobile Valeting?",
        to: "From Busy Town Centres to Quiet Suburbs",
      },
      {
        from: "Flexible Valeting Packages for Every Need",
        to: "Valeting Packages Sized to the Car",
      },
      {
        from: "How Our Services Work?",
        to: "Scheduling a Valet Across Hertfordshire",
      },
    ],
    text: [
      {
        from: "provides the perfect solution, bringing",
        to: "brings",
      },
      {
        from: "and exceptional results every time",
        to: "without a trip to a wash bay",
      },
      {
        from: "proudly serves",
        to: "covers",
      },
      {
        from: "and top-tier convenience",
        to: "around the working week",
      },
      {
        from: "Medusa is your go-to choice",
        to: "Medusa comes to you",
      },
      {
        from: "to deliver a premium service",
        to: "to carry out the valet on site",
      },
    ],
  },
  "car-valeting/ilford": {
    headings: [
      {
        from: "Convenient Mobile Valeting for Busy Professionals",
        to: "Valeting for Offices, Dealerships and Fleets",
      },
      {
        from: "Transform Your Car-Arrange Your Mobile Valeting Service Today!",
        to: "Book a Mobile Valet in Ilford",
      },
      {
        from: "Enhancing Vehicle Longevity in Urban Areas",
        to: "What Traffic Dust and Tree Sap Do to Paintwork",
      },
    ],
  },
  "car-valeting/islington": {
    headings: [
      {
        from: "Convenient Mobile Valeting for Busy Professionals",
        to: "A Valet That Comes to Your Islington Office",
      },
      {
        from: "Flexible Valeting Packages to Suit Every Need",
        to: "From a Quick Touch-Up to In-Depth Detailing",
      },
      {
        from: "Enhancing Vehicle Longevity in Urban Areas",
        to: "Urban Pollutants and a Car’s Long-Term Value",
      },
    ],
  },
  "car-valeting/kensington": {
    headings: [
      {
        from: "Convenient Mobile Valeting for Busy Professionals",
        to: "Cleaning Cars at Clinics, Consultancies and Showrooms",
      },
      {
        from: "Flexible Valeting Packages to Suit Every Need",
        to: "Before an Event, Before a Sale, or Week to Week",
      },
      {
        from: "Enhancing Vehicle Longevity in Urban Areas",
        to: "What Wears Down a Car’s Finish in Kensington",
      },
    ],
  },
  "car-valeting/north-london": {
    headings: [
      {
        from: "Why Choose Medusa Mobile Valeting?",
        to: "Valeting That Works on Permit Bays and Drives Alike",
      },
      {
        from: "Key Benefits of Our Service",
        to: "What Is Included in a Mobile Valet",
      },
      {
        from: "How Our Services Work?",
        to: "From Booking to the Finished Car",
      },
    ],
  },
  "car-valeting/northwood": {
    headings: [
      {
        from: "Convenient Mobile Valeting for Busy Professionals",
        to: "Where the Car Sits During the Working Day",
      },
      {
        from: "Home Valeting for Islington’s Residential Areas",
        to: "On a Private Drive or in a Residential Bay",
      },
      {
        from: "Enhancing Vehicle Longevity in Urban Areas",
        to: "What Regular Valeting Protects in Suburban Northwood",
      },
    ],
  },
  "car-valeting/park-royal": {
    headings: [
      {
        from: "Convenient Mobile Valeting for Busy Professionals",
        to: "Fleet Vehicles, Company Vans and the People Who Drive Them",
      },
      {
        from: "How Our Services Work?",
        to: "How a Valet in Park Royal Works",
      },
      {
        from: "Enhancing Vehicle Longevity in Urban Areas",
        to: "Protecting Paintwork From Industrial Grime",
      },
    ],
  },
  "car-valeting/pinner": {
    headings: [
      {
        from: "Convenient Mobile Valeting for Busy Professionals",
        to: "A Valet Booked Around the Commute",
      },
      {
        from: "Flexible Valeting Packages to Suit Every Need",
        to: "Deciding How Much of a Clean the Car Needs",
      },
      {
        from: "How Our Services Work?",
        to: "Start to Finish, Without Moving the Car",
      },
    ],
  },
  "car-valeting/preston": {
    headings: [
      {
        from: "Convenient Mobile Valeting for Busy Professionals",
        to: "Valeting Near Preston Road and South Kenton Station",
      },
      {
        from: "How Our Services Work?",
        to: "Instant Confirmation, Then a Clean Car at the Door",
      },
      {
        from: "Enhancing Vehicle Longevity in Urban Areas",
        to: "Why Paint and Interiors Wear in City Traffic",
      },
    ],
  },
  "car-valeting/putney": {
    headings: [
      {
        from: "Convenient Mobile Valeting for Busy Professionals",
        to: "Valeting While You Work Around Putney Exchange",
      },
      {
        from: "Flexible Valeting Packages to Suit Every Need",
        to: "From a Quick Tidy-Up to a Full Valet",
      },
      {
        from: "How Our Services Work?",
        to: "Booking, Arrival and the Valet Itself",
      },
    ],
    text: [
      {
        from: "fits perfectly around the working day",
        to: "is arranged around the working day",
      },
      {
        from: "keeping it showroom-ready",
        to: "keeping it presentable week to week",
      },
    ],
  },
  "car-valeting/ruislip": {
    headings: [
      {
        from: "Convenient Mobile Valeting for Busy Professionals",
        to: "Cars Cleaned at the Workplace or the Dealership",
      },
      {
        from: "Flexible Valeting Packages to Suit Every Need",
        to: "A Weekly Clean, or a Full Valet Before a Trip",
      },
      {
        from: "Change Your Car-Schedule Your Mobile Valeting Service Today!",
        to: "Book a Mobile Valet in Ruislip",
      },
    ],
    text: [
      {
        from: "fits seamlessly into your workday",
        to: "runs alongside your working day",
      },
      {
        from: "to full interior and exterior transformations",
        to: "to a full interior and exterior valet",
      },
    ],
  },
  "car-valeting/slough": {
    headings: [
      {
        from: "Convenient Mobile Valeting for Busy Professionals",
        to: "Valeting a Company Car at the Office or the Unit",
      },
      {
        from: "Flexible Valeting Packages to Suit Every Need",
        to: "Quick Refreshes, Deep Cleans and Paint Protection",
      },
      {
        from: "How Our Services Work?",
        to: "From Booking to a Finished Valet",
      },
    ],
  },
  "car-valeting/st-albans": {
    headings: [
      {
        from: "Why Choose Medusa Mobile Valeting?",
        to: "Valeting Without Moving the Car Off the Street",
      },
      {
        from: "Tailored Valeting Packages",
        to: "Routine Cleans and Pre-Event Detailing",
      },
      {
        from: "Key Benefits of Our Service",
        to: "What Every Valet Includes",
      },
    ],
  },
  "car-valeting/stanmore": {
    headings: [
      {
        from: "Convenient Mobile Valeting for Busy Professionals",
        to: "Valeting for Commuters and Fleet Vehicles",
      },
      {
        from: "How Our Services Work?",
        to: "A Valet Wherever the Car Is Parked",
      },
    ],
  },
  "car-valeting/uxbridge": {
    headings: [
      {
        from: "Business Parks and Residential Areas We Serve",
        to: "Business Parks and Homes Across Uxbridge",
      },
      {
        from: "Flexible Valeting Packages to Match Your Needs",
        to: "Mini Valets and Full Details for Uxbridge Drivers",
      },
    ],
  },
  "car-valeting/wandsworth": {
    headings: [
      {
        from: "Convenient Mobile Valeting for Busy Professionals",
        to: "Valeting While You Work in Wandsworth",
      },
      {
        from: "Flexible Valeting Packages to Suit Every Need",
        to: "From a Quick Refresh to a Full Detail",
      },
    ],
  },
  "car-valeting/watford": {
    headings: [
      {
        from: "Convenient Mobile Valeting for Busy Professionals",
        to: "Valeting at Work in Watford’s Business Parks",
      },
      {
        from: "How Our Services Work?",
        to: "How the Valet Is Booked and Carried Out",
      },
      {
        from: "Enhancing Vehicle Longevity in Urban Areas",
        to: "What Road Salt and Tree Sap Do to Paintwork",
      },
    ],
  },
  "car-valeting/west-london": {
    headings: [
      {
        from: "Why Choose Medusa Mobile Valeting?",
        to: "City Grime and Suburban Dust in West London",
      },
      {
        from: "How Our Services Work?",
        to: "Picking a Time and a Place to Suit You",
      },
    ],
  },
  "car-valeting/westminster": {
    headings: [
      {
        from: "Flexible Valeting Packages to Suit Every Need",
        to: "Packages That Fit the Schedule and the Vehicle",
      },
      {
        from: "Change Your Car-Schedule Your Mobile Valeting Service Today!",
        to: "A Mobile Valet, Wherever the Car Is Parked",
      },
      {
        from: "How Our Services Work?",
        to: "Choose a Time and a Westminster Location",
      },
    ],
  },
  "car-valeting/windsor": {
    headings: [
      {
        from: "Flexible Valeting Packages to Suit Every Need​",
        to: "From an Interior Refresh to a Full Exterior Valet",
      },
      {
        from: "Transform Your Car-Arrange Your Mobile Valeting Service Today!",
        to: "Arrange a Valet at Your Windsor Home or Workplace",
      },
      {
        from: "How Our Services Work?",
        to: "Water, Power and Tools Come With the Valeter",
      },
    ],
  },
  "mobile-car-wash/barnet": {
    headings: [
      {
        from: "How Our Services Work?",
        to: "What Happens on the Day",
      },
      {
        from: "Experience Convenient Car Care in Barnet: Reserve Our Mobile Car Wash Now!",
        to: "Have the Wash Come to You",
      },
    ],
    text: [
      {
        from: "Bookings are confirmed instantly.",
        to: "There is no need to bring the car anywhere.",
      },
    ],
  },
  "mobile-car-wash/borehamwood": {
    headings: [
      {
        from: "How It Works",
        to: "Setting Up the Visit",
      },
    ],
    text: [
      {
        from: "No, our team gets here completely geared up with whatever required to valet your car.",
        to: "No, our team arrives fully equipped with everything needed to valet your car.",
      },
      {
        from: "The moment varies relying on the package, but the majority of services are completed within 1-2 hours.",
        to: "The time varies depending on the package, but most services are completed within 1-2 hours.",
      },
      {
        from: "provides exceptional service with unmatched convenience",
        to: "brings the wash to the address, with its own water and power",
      },
      {
        from: "Book your appointment today and enjoy a showroom-ready finish, every time.",
        to: "Book a time that suits the week and the car is cleaned where it stands.",
      },
      {
        from: "Exactly how do you",
        to: "How do you",
      },
      {
        from: "the lorry",
        to: "the car",
      },
      {
        from: "surface area",
        to: "paintwork",
      },
      {
        from: "Just how usually",
        to: "How often",
      },
      {
        from: "the solution provided",
        to: "the service",
      },
      {
        from: "For best outcomes, we advise a complete valet every 4-6 weeks to keep your car in excellent problem.",
        to: "For the best results, we recommend a full valet every 4-6 weeks to keep your car in good condition.",
      },
    ],
  },
  "mobile-car-wash/central-london": {
    headings: [
      {
        from: "Premium Mobile Car Wash Service for Central London",
        to: "Cleaning a Car Inside the Congestion Charge Zone",
      },
      {
        from: "How It Works",
        to: "A Wash in Four Steps",
      },
    ],
    text: [
      {
        from: "No, our team gets here completely geared up with whatever required to valet your car.",
        to: "No, our team arrives fully equipped with everything needed to valet your car.",
      },
      {
        from: "The moment varies relying on the package, but the majority of services are completed within 1-2 hours.",
        to: "The time varies depending on the package, but most services are completed within 1-2 hours.",
      },
      {
        from: "fully equipped and ready to transform your car’s appearance",
        to: "fully equipped, with our own water, power and products",
      },
      {
        from: "From thorough interior detailing to a showroom-level exterior shine",
        to: "From a thorough interior clean to the paintwork outside",
      },
      {
        from: "Exactly how do you",
        to: "How do you",
      },
      {
        from: "the lorry",
        to: "the car",
      },
      {
        from: "surface area",
        to: "paintwork",
      },
      {
        from: "Just how usually",
        to: "How often",
      },
      {
        from: "the solution provided",
        to: "the service",
      },
      {
        from: "For best outcomes, we advise a complete valet every 4-6 weeks to keep your car in excellent problem.",
        to: "For the best results, we recommend a full valet every 4-6 weeks to keep your car in good condition.",
      },
    ],
  },
  "mobile-car-wash/chelsea": {
    headings: [
      {
        from: "How Our Services Work?",
        to: "Everything Arrives in the Van, Water Included",
      },
    ],
    text: [
      {
        from: "our own water, power, and top-tier cleaning equipment",
        to: "our own water, power and cleaning equipment",
      },
      {
        from: "your car will look pristine inside and out",
        to: "your car will be clean inside and out",
      },
    ],
  },
  "mobile-car-wash/chingford": {
    headings: [
      {
        from: "How Our Services Work?",
        to: "We Work Wherever the Car Is Parked",
      },
      {
        from: "Experience Convenient Car Treatment in Chingford: Reserve Our Mobile Car Wash Now!",
        to: "Experience Convenient Car Care in Chingford: Reserve Our Mobile Car Wash Now!",
      },
    ],
    text: [
      {
        from: "your vehicle will be gleaming",
        to: "your vehicle will be clean",
      },
    ],
  },
  "mobile-car-wash/chiswick": {
    headings: [
      {
        from: "How Our Services Work?",
        to: "What a Mobile Wash in Chiswick Involves",
      },
      {
        from: "Why Regular Car Washing Matters in Urban Areas",
        to: "What Trees, Birds and Traffic Do to Paintwork",
      },
      {
        from: "Experience Convenient Car Treatment in Chiswick: Reserve Our Mobile Car Wash Now!",
        to: "Experience Convenient Car Care in Chiswick: Reserve Our Mobile Car Wash Now!",
      },
    ],
    text: [
      {
        from: "showroom presentation washes",
        to: "washes for cars on display",
      },
    ],
  },
  "mobile-car-wash/croydon": {
    headings: [
      {
        from: "How Our Services Work?",
        to: "Booked in a Few Steps, Washed on Site",
      },
      {
        from: "Protecting Your Vehicle in Urban Environments",
        to: "What Croydon’s Streets Leave on Your Paintwork",
      },
    ],
    text: [
      {
        from: "In no time at all, your car will be clean, fresh, and ready to hit the road",
        to: "Your car is left clean, fresh and ready to drive",
      },
    ],
  },
  "mobile-car-wash/ealing": {
    headings: [
      {
        from: "How Our Services Work?",
        to: "What We Bring and What You Need to Do",
      },
      {
        from: "Experience Convenient Car Treatment in Ealing: Book Our Mobile Car Wash Now!",
        to: "Have the Car Washed Where It Stands in Ealing",
      },
    ],
    text: [
      {
        from: "we’ll give your vehicle a premium wash and shine",
        to: "we’ll wash the car where it is parked",
      },
      {
        from: "delivering consistent, showroom-ready results",
        to: "working on site with our own water and power",
      },
    ],
  },
  "mobile-car-wash/edgware": {
    headings: [
      {
        from: "How Our Services Work?",
        to: "No Queue, No Drive: How the Visit Works",
      },
      {
        from: "Enhancing Vehicle Longevity in Suburban Environments",
        to: "Paintwork, Alloys and Edgware’s Everyday Miles",
      },
    ],
    text: [
      {
        from: "and it’s clear why our mobile car wash service in Edgware is the smarter choice",
        to: "which is why a mobile round makes sense here",
      },
    ],
  },
  "mobile-car-wash/enfield": {
    text: [
      {
        from: "Car Treatment",
        to: "Car Care",
      },
      {
        from: "maintain vehicles to showroom standards",
        to: "keep vehicles clean and presentable",
      },
    ],
  },
  "mobile-car-wash/finchley": {
    headings: [
      {
        from: "Convenient Mobile Car Wash for Busy Professionals",
        to: "Washing Business Vehicles Around Ballards Lane",
      },
      {
        from: "Enhancing Vehicle Longevity in Suburban Environments",
        to: "The Toll of Leaving a Car Parked Outside",
      },
    ],
  },
  "mobile-car-wash/fulham": {
    text: [
      {
        from: "Professional Car Wash Service for Fulham's Workplaces",
        to: "Professional Car Wash Service for Fulham’s Workplaces",
      },
      {
        from: "curb appeal",
        to: "kerb appeal",
      },
    ],
  },
  "mobile-car-wash/golders-green": {
    headings: [
      {
        from: "Mobile Car Wash for Local Professionals",
        to: "For Drivers Working in Brent Cross and Hendon Central",
      },
      {
        from: "Flexible Valeting Packages to Suit Every Need",
        to: "Choosing Between a Maintenance Wash and a Deep Clean",
      },
      {
        from: "How Our Services Work?",
        to: "Everything Needed Arrives With the Team",
      },
    ],
  },
  "mobile-car-wash/hammersmith": {
    headings: [
      {
        from: "Protecting Your Vehicle in a Busy Borough",
        to: "What Hammersmith Traffic Does to Paintwork",
      },
      {
        from: "How Our Services Work?",
        to: "Booking, Arrival and the Finished Car",
      },
      {
        from: "Experience Convenient Car Treatment in Hammersmith: Reserve Our Mobile Car Wash Now!",
        to: "Book a Wash Outside the Flat or the Office",
      },
    ],
  },
  "mobile-car-wash/harrow": {
    headings: [
      {
        from: "Convenient Car Wash for Harrow Professionals",
        to: "Workday Washes for Lyon Road Offices and Local Showrooms",
      },
      {
        from: "How Our Services Work?",
        to: "Booked Ahead, Washed on the Spot",
      },
      {
        from: "Enhancing Vehicle Longevity in Harrow",
        to: "Why Salt and Grime Are Worth Removing Early",
      },
    ],
  },
  "mobile-car-wash/hayes": {
    headings: [
      {
        from: "Convenient Mobile Car Wash for Busy Professionals",
        to: "Washed While You Work, Across UB3 and UB4",
      },
      {
        from: "Enhancing Vehicle Longevity in Urban Environments",
        to: "Hayes Dust and the Paintwork It Settles On",
      },
      {
        from: "How Our Services Work?",
        to: "A Wash That Fits a Hayes Routine",
      },
    ],
    text: [
      {
        from: "Experience Convenient Car Treatment in Hayes",
        to: "Experience Convenient Car Care in Hayes",
      },
    ],
  },
  "mobile-car-wash/hounslow": {
    headings: [
      {
        from: "Convenient Mobile Car Wash for Busy Professionals",
        to: "Cleaning for Dealerships and Fleets in West London",
      },
      {
        from: "Enhancing Vehicle Longevity in Urban Areas",
        to: "Road Salt, Pollutants and a Dulling Finish",
      },
      {
        from: "How Our Services Work?",
        to: "Pick the Time and Place in Hounslow",
      },
    ],
    text: [
      {
        from: "premium valeting products",
        to: "valeting products",
      },
    ],
  },
  "mobile-car-wash/ilford": {
    headings: [
      {
        from: "Convenient Mobile Wash for Busy Professionals",
        to: "Washing the Car During the Working Day",
      },
      {
        from: "How Our Services Work?",
        to: "How a Wash Works at Your Ilford Address",
      },
      {
        from: "Experience Convenient Car Treatment in Ilford: Schedule Our Mobile Car Wash Now!",
        to: "Arrange a Wash Where the Car Is Parked",
      },
    ],
  },
  "mobile-car-wash/islington": {
    headings: [
      {
        from: "What’s Included in Medusa’s Mobile Car Wash Service",
        to: "What a Mobile Car Wash in Islington Covers",
      },
      {
        from: "How It Works",
        to: "Four Steps, From Booking to a Clean Car",
      },
    ],
    text: [
      {
        from: "Exactly how do you manage scrapes and swirls on the lorry's surface area?",
        to: "How do you deal with scratches and swirls on the car’s paintwork?",
      },
      {
        from: "No, our team gets here completely geared up with whatever required to valet your car.",
        to: "No, our team arrives fully equipped with everything needed to valet your car.",
      },
      {
        from: "The moment varies relying on the package, but the majority of services are completed within 1-2 hours.",
        to: "The time varies depending on the package, but most services are completed within 1-2 hours.",
      },
      {
        from: "Just how usually should I have my car valeted?",
        to: "How often should I have my car valeted?",
      },
      {
        from: "For best outcomes, we advise a complete valet every 4-6 weeks to keep your car in excellent problem.",
        to: "For the best results, we recommend a full valet every 4-6 weeks to keep your car in good condition.",
      },
      {
        from: "We use specialized products and strategies to lessen and remedy surface area flaws.",
        to: "We use specialist products and techniques to reduce and correct flaws in the paintwork.",
      },
      {
        from: "What happens if I'm not satisfied with the solution provided?",
        to: "What happens if I’m not satisfied with the service provided?",
      },
      {
        from: "If you’re not pleased, let us understand promptly, and we’ll function to fix any issues without delay.",
        to: "If you’re not happy, tell us straight away and we will put any issues right without delay.",
      },
    ],
  },
  "mobile-car-wash/kensington": {
    headings: [
      {
        from: "How Our Services Work?",
        to: "A Wash That Happens Without Leaving Kensington",
      },
      {
        from: "Experience Convenient Car Treatment in Kensington: Schedule Our Mobile Car Wash Now!",
        to: "Book a Mobile Car Wash Today",
      },
      {
        from: "Protecting Your Car from City Wear and Tear",
        to: "Congestion, Pollution and Tree Debris",
      },
    ],
  },
  "mobile-car-wash/kingston": {
    headings: [
      {
        from: "How Our Services Work?",
        to: "Book a Time, and We Bring the Rest",
      },
      {
        from: "Keeping Your Car in Top Condition",
        to: "Why Regular Washing Matters on Leaf-Heavy Roads",
      },
    ],
  },
  "mobile-car-wash/knightsbridge": {
    headings: [
      {
        from: "Mobile Car Wash for Busy Professionals",
        to: "Washing Cars Outside Offices and Showrooms",
      },
      {
        from: "How Our Services Work?",
        to: "Arranging a Wash, Step by Step",
      },
      {
        from: "Why It’s Worth It in Central London",
        to: "What Knightsbridge Driving Leaves on Your Paintwork",
      },
    ],
    text: [
      {
        from: "Car Treatment",
        to: "Car Cleaning",
      },
    ],
  },
  "mobile-car-wash/north-london": {
    headings: [
      {
        from: "Why Choose Medusa Auto Detailing’s Mobile Car Wash?",
        to: "Washing Cars from Islington Out to Enfield",
      },
      {
        from: "How It Works",
        to: "Four Steps to a Wash at Your Address",
      },
    ],
    text: [
      {
        from: "Exactly how do you manage scrapes and swirls on the lorry's surface area?",
        to: "How do you deal with scratches and swirls on the car’s paintwork?",
      },
      {
        from: "No, our team gets here completely geared up with whatever required to valet your car.",
        to: "No, our team arrives fully equipped with everything needed to valet your car.",
      },
      {
        from: "The moment varies relying on the package, but the majority of services are completed within 1-2 hours.",
        to: "The time varies depending on the package, but most services are completed within 1-2 hours.",
      },
      {
        from: "Just how usually should I have my car valeted?",
        to: "How often should I have my car valeted?",
      },
      {
        from: "For best outcomes, we advise a complete valet every 4-6 weeks to keep your car in excellent problem.",
        to: "For the best results, we recommend a full valet every 4-6 weeks to keep your car in good condition.",
      },
      {
        from: "We use specialized products and strategies to lessen and remedy surface area flaws.",
        to: "We use specialist products and techniques to reduce and correct flaws in the paintwork.",
      },
      {
        from: "What happens if I'm not satisfied with the solution provided?",
        to: "What happens if I’m not satisfied with the service provided?",
      },
      {
        from: "If you’re not pleased, let us understand promptly, and we’ll function to fix any issues without delay.",
        to: "If you’re not happy, tell us straight away and we will put any issues right without delay.",
      },
    ],
  },
  "mobile-car-wash/north-west-london": {
    headings: [
      {
        from: "Premium Mobile Car Wash Service at Your Convenience",
        to: "Washing a Car Without Driving It Anywhere",
      },
      {
        from: "How It Works",
        to: "Four Steps to Book a Wash",
      },
    ],
    text: [
      {
        from: "We use specialized products and strategies to lessen and remedy surface area flaws.",
        to: "We use specialist products and techniques to reduce and correct flaws in the paintwork.",
      },
      {
        from: "No, our team gets here completely geared up with whatever required to valet your car.",
        to: "No, our team arrives fully equipped with everything needed to valet your car.",
      },
      {
        from: "The moment varies relying on the package, but the majority of services are completed within 1-2 hours.",
        to: "The time varies depending on the package, but most services are completed within 1-2 hours.",
      },
      {
        from: "scrapes and swirls on the lorry's surface area",
        to: "scratches and swirls on the car’s surface",
      },
      {
        from: "Just how usually",
        to: "How often",
      },
      {
        from: "Exactly how do you",
        to: "How do you",
      },
      {
        from: "the solution provided",
        to: "the service",
      },
      {
        from: "providing unmatched convenience and care for your vehicle",
        to: "with the van carrying its own water, power and products",
      },
      {
        from: "ensuring a showroom-worthy finish every time",
        to: "cleaned properly where it is parked",
      },
      {
        from: "For best outcomes, we advise a complete valet every 4-6 weeks to keep your car in excellent problem.",
        to: "For the best results, we recommend a full valet every 4-6 weeks to keep your car in good condition.",
      },
    ],
  },
  "mobile-car-wash/northwood": {
    headings: [
      {
        from: "Convenient Mobile Car Wash for Busy Professionals",
        to: "Cars Cleaned While Their Owners Are at Work",
      },
      {
        from: "How Our Services Work?",
        to: "The Van Arrives With Its Own Water and Power",
      },
      {
        from: "Enhancing Vehicle Longevity in Suburban Environments",
        to: "Dust, Grit and Cars That Sit Under Trees",
      },
    ],
  },
  "mobile-car-wash/notting-hill": {
    headings: [
      {
        from: "Benefits of Medusa’s Mobile Car Wash Services",
        to: "Choosing a Package, From a Quick Wash to a Full Detail",
      },
      {
        from: "How It Works",
        to: "How a Wash in Notting Hill Works",
      },
    ],
    text: [
      {
        from: "We use specialized products and strategies to lessen and remedy surface area flaws.",
        to: "We use specialist products and techniques to reduce and correct flaws in the paintwork.",
      },
      {
        from: "No, our team gets here completely geared up with whatever required to valet your car.",
        to: "No, our team arrives fully equipped with everything needed to valet your car.",
      },
      {
        from: "The moment varies relying on the package, but the majority of services are completed within 1-2 hours.",
        to: "The time varies depending on the package, but most services are completed within 1-2 hours.",
      },
      {
        from: "scrapes and swirls on the lorry's surface area",
        to: "scratches and swirls on the car’s surface",
      },
      {
        from: "Just how usually",
        to: "How often",
      },
      {
        from: "Exactly how do you",
        to: "How do you",
      },
      {
        from: "the solution provided",
        to: "the service",
      },
      {
        from: "brings a premier mobile car wash service to Notting Hill, providing ultimate convenience and quality for car owners in this vibrant area.",
        to: "brings its mobile car wash service to Notting Hill, where parking is permit-only and the streets are busy for much of the week.",
      },
      {
        from: "we bring top-tier car care directly to you.",
        to: "we bring the wash to wherever the car is parked.",
      },
      {
        from: "For best outcomes, we advise a complete valet every 4-6 weeks to keep your car in excellent problem.",
        to: "For the best results, we recommend a full valet every 4-6 weeks to keep your car in good condition.",
      },
    ],
  },
  "mobile-car-wash/park-royal": {
    headings: [
      {
        from: "How Our Services Work?",
        to: "You Book, We Arrive, the Vehicle Is Finished",
      },
    ],
    text: [
      {
        from: "it's your office car park",
        to: "it’s your office car park",
      },
    ],
  },
  "mobile-car-wash/pinner": {
    headings: [
      {
        from: "How Our Services Work?",
        to: "Booked in Minutes, With Water and Power Brought Along",
      },
    ],
    text: [
      {
        from: "Car Treatment",
        to: "Car Care",
      },
    ],
  },
  "mobile-car-wash/preston": {
    headings: [
      {
        from: "How Our Services Work?",
        to: "Set a Time, and the Wash Comes to the Car",
      },
      {
        from: "Protecting Your Car in a London Environment",
        to: "Frequent Washing Does More Than Improve the Look",
      },
    ],
    text: [
      {
        from: "Preston's Residential",
        to: "Preston’s Residential",
      },
    ],
  },
  "mobile-car-wash/richmond-upon-thames": {
    headings: [
      {
        from: "Why Our Mobile Car Wash Service is Worth It",
        to: "What Richmond’s Greenery Leaves on Your Paintwork",
      },
      {
        from: "Why Medusa Auto Detailing?",
        to: "Eco-Friendly Cleaning at Home or at the Office",
      },
      {
        from: "No More Waiting: Mobile Car Wash That Fits Your Active Way Of Life",
        to: "No More Waiting: A Mobile Car Wash That Fits Your Week",
      },
    ],
    text: [
      {
        from: "We use just ecologically risk-free products, guaranteeing your lorry shines without dangerous side effects on the setting.",
        to: "We use only eco-friendly products, so your car is cleaned without any harm to its surroundings.",
      },
      {
        from: "Our Richmond Upon Thames -based group is fully trained, with years of experience supplying excellent car washing services right at your doorstep.",
        to: "Our team is fully trained, and the wash is carried out at your doorstep.",
      },
      {
        from: "making car care as very easy and hassle-free as possible",
        to: "making car care as easy and hassle-free as possible",
      },
      {
        from: "Whether you’re handling job, family, or various other dedications, we make it easy to maintain your vehicle tidy without taking time out of your active day.",
        to: "Whether you’re juggling work, family or other commitments, we make it easy to keep your car clean without taking time out of your day.",
      },
      {
        from: "Our team involves you, so you can take pleasure in the luxury of a spotless car without the wait.",
        to: "Our team comes to you, so you can enjoy a spotless car without the wait.",
      },
      {
        from: "Experience the convenience and professionalism that establishes us apart as leading mobile car wash service.",
        to: "Experience the convenience and professionalism that set us apart as a mobile car wash service.",
      },
      {
        from: "our group concerns you",
        to: "our team comes to you",
      },
      {
        from: "Shielding Your Car and the Environment",
        to: "Protecting Your Car and the Environment",
      },
    ],
  },
  "mobile-car-wash/ruislip": {
    headings: [
      {
        from: "Why Our Mobile Car Wash Service Matters",
        to: "Why a Ruislip Car Still Needs Regular Washing",
      },
      {
        from: "Why Medusa Auto Detailing?",
        to: "Washing Your Car Where It Is Parked",
      },
      {
        from: "Say goodbye to Waiting: Mobile Car Wash That Fits Your Active Way Of Life",
        to: "Cleaning the Car Without Taking Time Out of Your Day",
      },
    ],
    text: [
      {
        from: "We make use of just environmentally risk-free items, guaranteeing your automobile shines without dangerous side effects on the atmosphere.",
        to: "We use only environmentally responsible products, safe around children, pets and gardens.",
      },
      {
        from: "Our Ruislip -based group is completely educated, with years of experience offering high-quality car washing services right at your front door.",
        to: "The car is washed on the drive or at the front door by a fully trained team.",
      },
      {
        from: "making car treatment as simple and practical as possible",
        to: "making car care as simple and practical as possible",
      },
      {
        from: "Mobile Ease: Car Wash",
        to: "Mobile Convenience: A Car Wash That Comes to You",
      },
      {
        from: "Whether you’re managing work, household, or other commitments, we make it simple to maintain your car tidy without taking time out of your active day. Our group concerns you, so you can appreciate the deluxe of a clean car without the delay.",
        to: "Whether you’re juggling work, home or other commitments, we make it simple to keep your car clean without taking time out of your day. Our team comes to you, so you can enjoy a clean car without the delay.",
      },
      {
        from: "Experience the convenience and expertise that establishes us apart as premier mobile car wash solution.",
        to: "Experience the convenience and professionalism that set us apart as a mobile car wash service.",
      },
      {
        from: "our group involves you",
        to: "our team comes to you",
      },
    ],
  },
  "mobile-car-wash/slough": {
    headings: [
      {
        from: "How Our Services Work?",
        to: "What to Expect on the Day",
      },
      {
        from: "Say goodbye to Waiting: Mobile Car Wash That Fits Your Active Way Of Living",
        to: "Skipping the Trip to the Car Wash",
      },
    ],
    text: [
      {
        from: "We make use of just environmentally safe items, guaranteeing your vehicle radiates without hazardous negative effects on the atmosphere.",
        to: "We use only environmentally safe products, so your car is cleaned without harm to its surroundings.",
      },
      {
        from: "Whether you’re managing job, family members, or various other dedications, we make it simple to keep your vehicle tidy without taking time out of your active day. Our team pertains to you, so you can delight in the high-end of a spotless car without the wait. Experience the comfort and professionalism and trust that sets us apart as top mobile car wash solution.",
        to: "Whether you’re juggling work, family or other commitments, we make it simple to keep your car clean without taking time out of your day. Our team comes to you, so you can enjoy a spotless car without the wait. Experience the convenience, professionalism and trust that set us apart as a mobile car wash service.",
      },
      {
        from: "Our Slough -based team is fully educated, with years of experience supplying high-grade car washing services right at your doorstep.",
        to: "Our team arrives with its own water, power and products, and works on the car wherever it is parked.",
      },
    ],
  },
  "mobile-car-wash/st-albans": {
    headings: [
      {
        from: "Top-Tier Mobile Car Wash Service in St Albans",
        to: "An Exterior and Interior Clean at Your Address",
      },
      {
        from: "Why Medusa Auto Detailing is the Best Choice in St Albans",
        to: "Why a Mobile Wash Suits St Albans’ Narrow Centre",
      },
    ],
    text: [
      {
        from: "We use specialized products and strategies to lessen and remedy surface area flaws.",
        to: "We use specialist products and techniques to reduce and correct flaws in the paintwork.",
      },
      {
        from: "No, our team gets here completely geared up with whatever required to valet your car.",
        to: "No, our team arrives fully equipped with everything needed to valet your car.",
      },
      {
        from: "The moment varies relying on the package, but the majority of services are completed within 1-2 hours.",
        to: "The time varies depending on the package, but most services are completed within 1-2 hours.",
      },
      {
        from: "Exactly how do you",
        to: "How do you",
      },
      {
        from: "Just how usually",
        to: "How often",
      },
      {
        from: "the solution provided",
        to: "the service",
      },
      {
        from: "For best outcomes, we advise a complete valet every 4-6 weeks to keep your car in excellent problem.",
        to: "For the best results, we recommend a full valet every 4-6 weeks to keep your car in good condition.",
      },
      {
        from: "the lorry's surface area?",
        to: "the car’s paintwork?",
      },
    ],
  },
  "mobile-car-wash/stanmore": {
    headings: [
      {
        from: "Convenient Car Wash Services for Local Professionals",
        to: "On-Site Cleaning for Business Premises and Dealerships",
      },
      {
        from: "No More Waiting: Mobile Car Wash That Fits Your Busy Lifestyle",
        to: "A Clean That Fits Around the Working Week",
      },
    ],
    text: [
      {
        from: "Our Stanmore -based team is completely educated, with years of experience giving excellent car washing solutions right at your doorstep.",
        to: "Our team arrives with its own water, power and products, and works on the car wherever it is parked.",
      },
      {
        from: "Whether you’re managing job, family members, or various other dedications, we make it simple to maintain your car clean without taking time out of your busy day.",
        to: "Whether you’re juggling work, family or other commitments, we make it easy to keep your car clean without taking time out of your day.",
      },
      {
        from: "Our group involves you, so you can delight in the luxury of a spick-and-span car without the delay.",
        to: "Our team comes to you, so you can enjoy a spotless car without the wait.",
      },
      {
        from: "Experience the ease and professionalism and trust that sets us apart as premier mobile car wash solution.",
        to: "Experience the convenience and professionalism that set us apart as a mobile car wash service.",
      },
      {
        from: "We make use of only ecologically secure items, guaranteeing your car shines without dangerous side effects on the atmosphere.",
        to: "We use only environmentally safe products, so your car is cleaned without harm to its surroundings.",
      },
      {
        from: "Whether you go to home, job, or anywhere in Stanmore, our group concerns you, making car care as very easy and convenient as possible.",
        to: "Whether you are at home, at work, or anywhere across Stanmore, our team comes to you, making car care as easy and convenient as possible.",
      },
    ],
  },
  "mobile-car-wash/streatham": {
    headings: [
      {
        from: "Convenient Mobile Car Wash sERVICES for Local Professionals",
        to: "Washing Cars Parked Near Streatham Business Centre",
      },
      {
        from: "How Our Services Work?",
        to: "A Time, a Place, and Nothing to Supply",
      },
      {
        from: "Why Regular Mobile Car Washes Are Essential in Streatham",
        to: "Traffic, Weather and Brake Dust Along the A23",
      },
    ],
    text: [
      {
        from: "we’re the efficient solution that keeps your car presentable with zero disruption to your day",
        to: "the car is washed where it stands, with nothing taken out of the working day",
      },
    ],
  },
  "mobile-car-wash/sudbury": {
    headings: [
      {
        from: "Experience Convenient Car Treatment in Sudbury: Book Our Mobile Car Wash Now!",
        to: "Experience Convenient Car Care in Sudbury: Book Our Mobile Car Wash Now!",
      },
      {
        from: "Clean on the move: Experience the Deluxe of Mobile Car Washing",
        to: "Clean on the Move: Standard Washes and Detail Work",
      },
      {
        from: "Enhancing Vehicle Longevity in Urban Areas",
        to: "What Sudbury’s Roads and Trees Leave on Your Paintwork",
      },
    ],
    text: [
      {
        from: "bringing top-tier describing directly to your place",
        to: "bringing the work directly to where the car is parked",
      },
      {
        from: "Our Sudbury -based team is completely trained, with years of experience offering high-quality car washing solutions right at your doorstep.",
        to: "Our team arrives ready to wash the car properly wherever it is parked, whether that is a drive, a car park or the kerb.",
      },
      {
        from: "Eco-Friendly Products: Shielding Your Car and the Atmosphere",
        to: "Eco-Friendly Products: Protecting Your Car and the Environment",
      },
      {
        from: "Whether you go to home, job, or throughout Sudbury, our team pertains to you, making car care as easy and convenient as possible.",
        to: "Whether you are at home, at work, or anywhere across Sudbury, our team comes to you, making car care as easy and convenient as possible.",
      },
      {
        from: "We make use of only environmentally safe items, guaranteeing your lorry shines without harmful negative effects on the setting.",
        to: "We use only environmentally safe products, so your car is cleaned without harm to its surroundings.",
      },
    ],
  },
  "mobile-car-wash/twickenham": {
    headings: [
      {
        from: "Say goodbye to Waiting: Mobile Car Wash That Fits Your Busy Way Of Living",
        to: "A Clean Car Without the Trip or the Wait",
      },
      {
        from: "Why Medusa Auto Detailing?",
        to: "Booked Around a Busy Twickenham Day",
      },
      {
        from: "How Our Services Work?",
        to: "How the Booking Works",
      },
    ],
    text: [
      {
        from: "Our Twickenham -based team is totally trained, with years of experience giving top-quality car washing solutions right at your doorstep.",
        to: "Our team brings its own water, power and products, and works on the car where you have left it.",
      },
      {
        from: "Our team pertains to you, so you can take pleasure in the deluxe of a spotless car without the delay.",
        to: "Our team comes to you, so there is no waiting around at a car wash.",
      },
      {
        from: "Experience the comfort and professionalism and reliability that sets us apart as top mobile car wash service.",
        to: "The work is done at the address, and the rest of the day carries on as planned.",
      },
      {
        from: "Whether you go to home, job, or throughout Twickenham, our group pertains to you, making car treatment as simple and hassle-free as possible.",
        to: "Whether you are at home, at work, or anywhere across Twickenham, our team comes to you, making car care as simple and hassle-free as possible.",
      },
      {
        from: "Whether you’re managing job, family members, or other commitments, we make it easy to keep your car tidy without taking time out of your busy day.",
        to: "Whether you’re juggling work, family or other commitments, we make it easy to keep your car clean without taking time out of your busy day.",
      },
      {
        from: "We use just environmentally secure products, guaranteeing your vehicle radiates without dangerous adverse effects on the atmosphere.",
        to: "We use only environmentally safe products, so your car is cleaned without harm to its surroundings.",
      },
    ],
  },
  "mobile-car-wash/uxbridge": {
    headings: [
      {
        from: "How It Works",
        to: "The Four Steps of a Mobile Wash",
      },
      {
        from: "Book Now",
        to: "Booking a Wash Where You Are",
      },
    ],
    text: [
      {
        from: "We use specialized products and strategies to lessen and remedy surface area flaws.",
        to: "We use specialist products and techniques to reduce and correct flaws in the paintwork.",
      },
      {
        from: "No, our team gets here completely geared up with whatever required to valet your car.",
        to: "No, our team arrives fully equipped with everything needed to valet your car.",
      },
      {
        from: "The moment varies relying on the package, but the majority of services are completed within 1-2 hours.",
        to: "The time varies depending on the package, but most services are completed within 1-2 hours.",
      },
      {
        from: "Exactly how do you",
        to: "How do you",
      },
      {
        from: "Just how usually",
        to: "How often",
      },
      {
        from: "scrapes and swirls on the lorry",
        to: "scrapes and swirls on the car",
      },
      {
        from: "the solution provided",
        to: "the service provided",
      },
      {
        from: "For best outcomes, we advise a complete valet every 4-6 weeks to keep your car in excellent problem.",
        to: "For the best results, we recommend a full valet every 4-6 weeks to keep your car in good condition.",
      },
      {
        from: "surface area?",
        to: "paintwork?",
      },
    ],
  },
  "mobile-car-wash/walthamstow": {
    headings: [
      {
        from: "Convenient Mobile Car Wash for Local Professionals",
        to: "Car Washing for Walthamstow’s Workplaces and Dealerships",
      },
      {
        from: "How Our Services Work?",
        to: "What Happens After You Book",
      },
      {
        from: "Say goodbye to Waiting: Mobile Car Wash That Fits Your Active Way Of Living",
        to: "Fitting a Wash Into a Busy Week",
      },
    ],
    text: [
      {
        from: "maintain your automobile clean",
        to: "keep your car clean",
      },
      {
        from: "Our Walthamstow -based team is fully educated, with years of experience providing high-quality car washing solutions right at your front door.",
        to: "Our team is trained and turns up with everything the job needs, right at your front door.",
      },
      {
        from: "Our group concerns you, so you can enjoy the high-end of a pristine car without the wait.",
        to: "Our team comes to you, so you can enjoy a spotless car without the wait.",
      },
      {
        from: "Experience the ease and professionalism and trust that establishes us apart as top mobile car wash solution.",
        to: "Experience the convenience and professionalism that set us apart as a mobile car wash service.",
      },
      {
        from: "We utilize just eco secure items, ensuring your vehicle beams without dangerous adverse effects on the atmosphere.",
        to: "We use only environmentally safe products, so your car is cleaned without harm to its surroundings.",
      },
      {
        from: "Whether you go to home, work, or anywhere in Walthamstow, our group concerns you, making car care as simple and convenient as possible.",
        to: "Whether you are at home, at work, or anywhere across Walthamstow, our team comes to you, making car care as easy and convenient as possible.",
      },
      {
        from: "Whether you’re handling job, family members, or various other dedications",
        to: "Whether you’re juggling work, family or other commitments",
      },
    ],
  },
  "mobile-car-wash/wandsworth": {
    headings: [
      {
        from: "How Our Services Work?",
        to: "Nothing to Plug In, Nothing to Fill",
      },
      {
        from: "No More Waiting: Mobile Car Wash That Fits Your Busy Way Of Living",
        to: "A Clean Car Without the Queue",
      },
    ],
    text: [
      {
        from: "Our Wandsworth -based group is totally educated, with years of experience offering top-notch car washing services right at your front door.",
        to: "The valeters who come to you are trained, and they bring their own water, power and products.",
      },
      {
        from: "Whether you’re managing work, family, or various other dedications, we make it very easy to maintain your lorry tidy without taking time out of your busy day. Our group pertains to you, so you can enjoy the deluxe of a pristine car without the delay. Experience the convenience and expertise that sets us apart as leading mobile car wash solution.",
        to: "Whether you’re juggling work, family or other commitments, we make it easy to keep your car clean without taking time out of your busy day. Our team comes to you, so you can enjoy a spotless car without the delay. Experience the convenience and expertise that set us apart as a mobile car wash service.",
      },
      {
        from: "We utilize only environmentally safe products, guaranteeing your lorry shines without harmful adverse effects on the atmosphere.",
        to: "We use only environmentally safe products, so your car is cleaned without harm to its surroundings.",
      },
      {
        from: "Whether you're at home, work, or throughout Wandsworth, our group involves you, making car care as very easy and convenient as feasible.",
        to: "Whether you are at home, at work, or anywhere across Wandsworth, our team comes to you, making car care as easy and convenient as possible.",
      },
    ],
  },
  "mobile-car-wash/watford": {
    headings: [
      {
        from: "How Our Services Work?",
        to: "From Booking to a Clean Car",
      },
      {
        from: "Why Medusa Auto Detailing?",
        to: "Why the Van Comes to You",
      },
      {
        from: "Say goodbye to Waiting: Mobile Car Wash That Fits Your Hectic Way Of Life",
        to: "Keeping the Car Clean Without Taking Time Out of Your Day",
      },
    ],
    text: [
      {
        from: "maintain your lorry clean",
        to: "keep your car clean",
      },
      {
        from: "Our Watford -based group is totally educated, with years of experience offering top-notch car washing services right at your doorstep.",
        to: "The whole clean is carried out at the address you give us, with nothing to drop off and nothing to collect.",
      },
      {
        from: "Eco-Friendly Products: Shielding Your Car and the Atmosphere",
        to: "Eco-Friendly Products: Protecting Your Car and the Environment",
      },
      {
        from: "Mobile Ease: Car Wash",
        to: "Mobile Convenience: A Car Wash That Comes to You",
      },
      {
        from: "Our team involves you, so you can take pleasure in the high-end of a clean car without the wait.",
        to: "Our team comes to you, so you can enjoy a spotless car without the wait.",
      },
      {
        from: "Experience the comfort and professionalism and reliability that sets us apart as premier mobile car wash service.",
        to: "Experience the convenience and professionalism that set us apart as a mobile car wash service.",
      },
      {
        from: "We utilize only eco risk-free products, guaranteeing your car shines without unsafe side effects on the environment.",
        to: "We use only environmentally safe products, so your car is cleaned without harm to its surroundings.",
      },
      {
        from: "making car treatment as simple and practical as feasible",
        to: "making car care as simple and practical as possible",
      },
      {
        from: "Whether you’re juggling job, household, or other dedications",
        to: "Whether you’re juggling work, family or other commitments",
      },
    ],
  },
  "mobile-car-wash/wembley": {
    headings: [
      {
        from: "How Our Services Work?",
        to: "Three Steps to a Clean Car",
      },
      {
        from: "Why Medusa Auto Detailing?",
        to: "Cleaning a Car at Home or at Work",
      },
      {
        from: "No More Waiting: Mobile Car Wash That Fits Your Hectic Way Of Living",
        to: "Fitting a Car Wash Around a Full Week",
      },
    ],
    text: [
      {
        from: "keep your automobile tidy",
        to: "keep your car clean",
      },
      {
        from: "Our Wembley -based group is totally trained, with years of experience providing top-notch car washing solutions right at your doorstep.",
        to: "None of the work needs a garage or a forecourt, and it is done in the space the car is parked in.",
      },
      {
        from: "Our group concerns you, so you can take pleasure in the deluxe of a pristine car without the delay.",
        to: "Our team comes to you, so you can enjoy a spotless car without the wait.",
      },
      {
        from: "Experience the comfort and professionalism and reliability that establishes us apart as leading mobile car wash solution.",
        to: "Experience the convenience and professionalism that set us apart as a mobile car wash service.",
      },
      {
        from: "We utilize just ecologically secure items, ensuring your car shines without harmful adverse effects on the atmosphere.",
        to: "We use only environmentally safe products, so your car is cleaned without harm to its surroundings.",
      },
      {
        from: "Whether you're at home, work, or throughout Wembley, our group involves you, making car care as very easy and practical as feasible.",
        to: "Whether you are at home, at work, or anywhere across Wembley, our team comes to you, making car care as easy and convenient as possible.",
      },
      {
        from: "Whether you’re handling job, family members, or various other dedications",
        to: "Whether you’re juggling work, family or other commitments",
      },
    ],
  },
  "mobile-car-wash/west-london": {
    headings: [
      {
        from: "Why Choose Medusa’s Mobile Car Wash Service?",
        to: "From a Quick Exterior Wash to Full Detailing",
      },
      {
        from: "How It Works",
        to: "Setting Up the Visit Online",
      },
    ],
    text: [
      {
        from: "Exactly how do you manage scrapes and swirls on the lorry's surface area?",
        to: "How do you deal with scratches and swirls on the car’s paintwork?",
      },
      {
        from: "No, our team gets here completely geared up with whatever required to valet your car.",
        to: "No, our team arrives fully equipped with everything needed to valet your car.",
      },
      {
        from: "The moment varies relying on the package, but the majority of services are completed within 1-2 hours.",
        to: "The time varies depending on the package, but most services are completed within 1-2 hours.",
      },
      {
        from: "Just how usually should I have my car valeted?",
        to: "How often should I have my car valeted?",
      },
      {
        from: "For best outcomes, we advise a complete valet every 4-6 weeks to keep your car in excellent problem.",
        to: "For the best results, we recommend a full valet every 4-6 weeks to keep your car in good condition.",
      },
      {
        from: "We use specialized products and strategies to lessen and remedy surface area flaws.",
        to: "We use specialist products and techniques to reduce and correct flaws in the paintwork.",
      },
      {
        from: "What happens if I'm not satisfied with the solution provided?",
        to: "What happens if I’m not satisfied with the service provided?",
      },
      {
        from: "If you’re not pleased, let us understand promptly, and we’ll function to fix any issues without delay.",
        to: "If you’re not happy, tell us straight away and we will put any issues right without delay.",
      },
    ],
  },
  "mobile-car-wash/wimbledon": {
    headings: [
      {
        from: "Professional Car Wash at Your Business Location",
        to: "Washing Staff Cars and Fleets Where They Park",
      },
      {
        from: "Why Regular Mobile Car Washing Matters",
        to: "Sap, Salt and Bird Lime on Wimbledon’s Streets",
      },
      {
        from: "No More Waiting: Mobile Car Wash That Fits Your Active Way Of Living",
        to: "Cleaning the Car Around Work and Family",
      },
    ],
    text: [
      {
        from: "Our Wimbledon -based team is totally educated, with years of experience supplying premier car washing services right at your doorstep.",
        to: "The van is self-contained, carrying its own water and power, so the wash is done on the doorstep with nothing needed from the house.",
      },
      {
        from: "our group involves you, making car treatment as simple and convenient as feasible",
        to: "the van comes to you, making car care as simple and convenient as possible",
      },
      {
        from: "Our group pertains to you, so you can take pleasure in the deluxe of a pristine car without the wait. Experience the comfort and professionalism and reliability that establishes us apart as premier mobile car wash service.",
        to: "The work is done where the car already stands, so there is no wait and no trip to a forecourt. It is the same wash, with the water and power carried in the van.",
      },
      {
        from: "Experience Convenient Car Treatment in Wimbledon",
        to: "Experience Convenient Car Care in Wimbledon",
      },
      {
        from: "Whether you’re juggling work, family, or various other dedications, we make it easy to keep your vehicle clean without taking time out of your hectic day.",
        to: "Whether you’re juggling work, family or other commitments, we make it easy to keep your car clean without taking time out of your busy day.",
      },
      {
        from: "We use just eco risk-free items, ensuring your lorry radiates without dangerous side effects on the atmosphere.",
        to: "We use only environmentally safe products, so your car is cleaned without harm to its surroundings.",
      },
    ],
  },
  "mobile-car-wash/windsor": {
    headings: [
      {
        from: "How Our Services Work?",
        to: "What Happens Once the Van Reaches the Car",
      },
      {
        from: "Why Medusa Auto Detailing?",
        to: "Skipping the Wait at a Traditional Car Wash",
      },
      {
        from: "Say goodbye to Waiting: Mobile Car Wash That Fits Your Busy Way Of Life",
        to: "A Wash That Fits Into the Working Week",
      },
    ],
    text: [
      {
        from: "Our Windsor -based team is totally trained, with years of experience supplying top-quality car washing solutions right at your front door.",
        to: "Cars are washed at the address instead, with the water, power and products all brought along in the van.",
      },
      {
        from: "Whether you go to home, job, or anywhere in Windsor, our group pertains to you,",
        to: "Whether the car is at home, at work, or anywhere else in Windsor, the van comes to it,",
      },
      {
        from: "Our team concerns you, so you can take pleasure in the luxury of a pristine car without the wait. Experience the benefit and professionalism and reliability that establishes us apart as premier mobile car wash service.",
        to: "The team comes to the car, so there is nothing to drop off and nothing to wait for. The wash happens on the drive, in the car park or at the kerb, whichever the car is on.",
      },
      {
        from: "We utilize just ecologically safe items, ensuring your lorry beams without unsafe adverse effects on the setting.",
        to: "We use only environmentally safe products, so your car is cleaned without harm to its surroundings.",
      },
      {
        from: "Whether you’re handling work, family members, or other dedications, we make it simple to maintain your vehicle clean without taking time out of your active day.",
        to: "Whether you’re juggling work, family or other commitments, we make it easy to keep your car clean without taking time out of your day.",
      },
    ],
  },


  /*
    ── The 52 the client’s list never covered ───────────────────────────

    Same job, same narrowing: headings and broken English only, never a
    rewritten paragraph. `MIRROR_REST` is the set; these are its rules.
  */
  "car-detailing/brent": {
    headings: [
      {
        from: "Convenient Mobile Detailing for Busy Professionals",
        to: "Detailing at Brent Cross, Park Royal and Neasden",
      },
      {
        from: "Flexible Detailing Packages to Suit Every Need",
        to: "From Faded Paint to a Show Car",
      },
      {
        from: "Enhancing Vehicle Longevity in Urban Areas",
        to: "Traffic, Road Salt and Tree-Lined Streets",
      },
    ],
  },
  "car-detailing/colindale": {
    headings: [
      {
        from: "Convenient Mobile Detailing for Busy Professionals",
        to: "Detailing at Colindale Business Park and Beaufort Park",
      },
      {
        from: "Flexible Detailing Packages to Suit Every Need",
        to: "From a Light Polish to Full Correction",
      },
      {
        from: "Enhancing Vehicle Longevity in Urban Areas",
        to: "Road Debris, Sunlight and Construction Dust",
      },
    ],
    text: [
      {
        from: "Golders Green, an Harrow.",
        to: "Golders Green, and Harrow.",
      },
    ],
  },
  "car-detailing/edgware": {
    headings: [
      {
        from: "Convenient Mobile Detailing for Busy Professionals",
        to: "Detailing Near Edgware Community Hospital and Premier House",
      },
      {
        from: "Flexible Detailing Packages to Suit Every Need",
        to: "Gloss Enhancement, Multi-Stage Correction and the Add-Ons",
      },
      {
        from: "Enhancing Vehicle Longevity in Urban Areas",
        to: "Pollutants, Road Grime and Long-Term Paint Damage",
      },
    ],
  },
  "car-detailing/golders-green": {
    headings: [
      {
        from: "Convenient Mobile Detailing for Busy Professionals",
        to: "Detailing Near Golders Green Station and Temple Fortune",
      },
      {
        from: "Flexible Detailing Packages to Suit Every Need",
        to: "A Quick Gloss Boost or a Multi-Day Correction",
      },
      {
        from: "Enhancing Vehicle Longevity in Urban Areas",
        to: "Greenery, Travel Routes and What They Leave Behind",
      },
    ],
  },
  "car-detailing/hendon": {
    headings: [
      {
        from: "Convenient Mobile Detailing for Busy Professionals",
        to: "Detailing at Hendon Business Centre and Hendon Central",
      },
      {
        from: "Flexible Detailing Packages to Suit Every Need",
        to: "Machine Polishing, Correction and Ceramic Protection",
      },
      {
        from: "Enhancing Vehicle Longevity in Urban Areas",
        to: "Urban Traffic, Construction Dust and Sun Exposure",
      },
    ],
  },
  "car-detailing/mill-hill": {
    headings: [
      {
        from: "Convenient Mobile Detailing for Busy Professionals",
        to: "Detailing Brought Straight to the Workplace",
      },
      {
        from: "Flexible Detailing Packages to Suit Every Need",
        to: "Light Polishing Through to Ceramic Treatments",
      },
      {
        from: "Enhancing Vehicle Longevity in Urban Areas",
        to: "Road Salt, UV Rays and Airborne Contaminants",
      },
    ],
    text: [
      {
        from: "60+ hours of precision work delivering flawless, better-than-new finish.",
        to: "60+ hours of precision work delivering a flawless, better-than-new finish.",
      },
    ],
  },
  "car-valeting/belgravia": {
    headings: [
      {
        from: "Convenient Mobile Valeting for Busy Professionals",
        to: "Valeting Around Victoria, Sloane Square and Knightsbridge",
      },
      {
        from: "Flexible Valeting Packages to Suit Every Need",
        to: "A Refresh Before an Event or a Deep Clean",
      },
      {
        from: "Enhancing Vehicle Longevity in Urban Areas",
        to: "What City Life Does to a Car in Belgravia",
      },
    ],
  },
  "car-valeting/brent": {
    headings: [
      {
        from: "Convenient Mobile Valeting for Busy Professionals",
        to: "Valeting in Brent’s Business Hubs and Showrooms",
      },
      {
        from: "Flexible Valeting Packages to Suit Every Need",
        to: "Maintenance Washes and All-Out Interior Detailing",
      },
    ],
  },
  "car-valeting/chelsea": {
    headings: [
      {
        from: "Convenient Mobile Valeting for Busy Professionals",
        to: "Valeting Around Sloane Square and Chelsea Harbour",
      },
      {
        from: "Flexible Valeting Packages to Suit Every Need",
        to: "Interior Tidy-Ups, Deep Cleans and Odour Removal",
      },
      {
        from: "Enhancing Vehicle Longevity in Urban Areas",
        to: "Traffic Grime, Acid Rain and Airborne Pollutants",
      },
    ],
  },
  "car-valeting/chingford": {
    headings: [
      {
        from: "Convenient Mobile Valeting for Busy Professionals",
        to: "Valeting for Commuters From Chingford Station",
      },
      {
        from: "Flexible Valeting Packages to Suit Every Need",
        to: "A Quick Clean or a Valet Before Selling",
      },
      {
        from: "Enhancing Vehicle Longevity in Urban Areas",
        to: "Bird Droppings and Road Salt on Chingford’s Streets",
      },
    ],
  },
  "car-valeting/colindale": {
    headings: [
      {
        from: "Convenient Mobile Valeting for Busy Professionals",
        to: "Valeting at Colindale Business Park and the RAF Museum",
      },
      {
        from: "Flexible Valeting Packages to Suit Every Need",
        to: "Weekly Upkeep or a Clean Before an Occasion",
      },
      {
        from: "Enhancing Vehicle Longevity in Urban Areas",
        to: "Construction Dust, Road Grit and Tree Sap",
      },
    ],
  },
  "car-valeting/ealing": {
    headings: [
      {
        from: "Convenient Mobile Valeting for Busy Professionals",
        to: "Valeting at Ealing Cross and Westgate House",
      },
      {
        from: "Flexible Valeting Packages to Suit Every Need",
        to: "Mini Valets, Clay Bar Work and Paint Protection",
      },
      {
        from: "Enhancing Vehicle Longevity in Urban Areas",
        to: "Tree Sap in Summer, Grit in Winter",
      },
    ],
    text: [
      {
        from: "We pride ourselves on giving top-tier services that focus on supplying unmatched sanitation, defense, and aesthetic interest your lorry in Ealing",
        to: "We pride ourselves on top-tier services focused on cleanliness, protection and appearance for your car in Ealing.",
      },
    ],
  },
  "car-valeting/earls-court": {
    headings: [
      {
        from: "Convenient Mobile Valeting for Busy Professionals",
        to: "Valeting Near the Earls Court Exhibition Centre",
      },
      {
        from: "Flexible Valeting Packages to Suit Every Need",
        to: "A Freshen-Up After the Commute or Before an Event",
      },
      {
        from: "Enhancing Vehicle Longevity in Urban Areas",
        to: "Road Grime and Tree Sap in Earls Court",
      },
    ],
  },
  "car-valeting/eastcote": {
    headings: [
      {
        from: "Convenient Mobile Valeting for Busy Professionals",
        to: "Valeting Near Eastcote Station and Highgrove House",
      },
      {
        from: "Flexible Valeting Packages to Suit Every Need",
        to: "From a Maintenance Wash to a Full Valet",
      },
      {
        from: "Enhancing Vehicle Longevity in Suburban Areas",
        to: "Leafy Roads, Busy Junctions and Everyday Wear",
      },
    ],
  },
  "car-valeting/friern-barnet": {
    headings: [
      {
        from: "Convenient Mobile Valeting for Busy Professionals",
        to: "Cleaning Cars Around North Finchley Business Park",
      },
      {
        from: "Flexible Valeting Packages to Suit Every Need",
        to: "Touch-Ups, Maintenance Washes and Full Valets",
      },
      {
        from: "Enhancing Vehicle Longevity in Urban Areas",
        to: "Traffic Pollution and Changing Weather in Friern Barnet",
      },
    ],
  },
  "car-valeting/fulham": {
    headings: [
      {
        from: "Reliable Detailing, Car Valeting in Fulham",
        to: "Valeting for Fulham’s Riverside and High Streets",
      },
      {
        from: "Convenient Mobile Valeting for Busy Professionals",
        to: "On-Site Valeting for SW6 Offices and Showrooms",
      },
      {
        from: "Flexible Valeting Packages to Suit Every Need",
        to: "A Quick Refresh or a Thorough Clean",
      },
    ],
  },
  "car-valeting/golders-green": {
    headings: [
      {
        from: "Convenient Mobile Valeting for Busy Professionals",
        to: "Valeting for Offices, Clinics and Retail Units",
      },
      {
        from: "Flexible Valeting Packages to Suit Every Need",
        to: "Packages for a Compact Car or a Large SUV",
      },
      {
        from: "Enhancing Vehicle Longevity in Urban Areas",
        to: "Tree Sap and Road Dust in Golders Green",
      },
    ],
  },
  "car-valeting/greater-london": {
    headings: [
      {
        from: "Why Choose Medusa Mobile Valeting?",
        to: "Valeting Across Greater London’s Urban and Residential Streets",
      },
      {
        from: "Key Benefits of Our Service",
        to: "Convenience, Expert Care and Flexible Scheduling",
      },
      {
        from: "Flexible Valeting Packages for Every Need",
        to: "Routine Washes and Detailing for Special Occasions",
      },
    ],
  },
  "car-valeting/hammersmith": {
    headings: [
      {
        from: "Convenient Mobile Valeting for Busy Professionals",
        to: "Cars Cleaned at The Ark and Hammersmith Grove",
      },
      {
        from: "Flexible Valeting Packages to Suit Every Need",
        to: "Express Washes and Full Interior Deep Cleans",
      },
      {
        from: "Enhancing Vehicle Longevity in Urban Areas",
        to: "How City Driving Wears Paintwork and Trim",
      },
    ],
    text: [
      {
        from: "Dirt from city driving, tree sap from parked streets, and everyday build-up make car maintenance a challenge.",
        to: "Dirt from city driving, tree sap where cars are parked, and everyday build-up make car maintenance a challenge.",
      },
    ],
  },
  "car-valeting/hayes": {
    headings: [
      {
        from: "Convenient Mobile Valeting for Busy Professionals",
        to: "Valeting at Stockley Park and Hayes Business Studios",
      },
      {
        from: "Flexible Valeting Packages to Suit Every Need",
        to: "Packages for a Trip, an Occasion or Upkeep",
      },
      {
        from: "Enhancing Vehicle Longevity in Urban Areas",
        to: "Daily Traffic, Weather and a Car’s Value",
      },
    ],
  },
  "car-valeting/hendon": {
    headings: [
      {
        from: "Convenient Mobile Valeting for Busy Professionals",
        to: "Cleaning Cars at Middlesex University and Local Offices",
      },
      {
        from: "Flexible Valeting Packages to Suit Every Need",
        to: "Before the School Run or a Weekend Away",
      },
      {
        from: "Enhancing Vehicle Longevity in Urban Areas",
        to: "Traffic Film and Bird Droppings in Hendon",
      },
    ],
  },
  "car-valeting/hillingdon": {
    headings: [
      {
        from: "Convenient Mobile Valeting for Busy Professionals",
        to: "Valeting Near Brunel University and Uxbridge High Street",
      },
      {
        from: "Flexible Valeting Packages to Suit Every Need",
        to: "Wax Protection, Shampooing and Weekly Refreshes",
      },
      {
        from: "Enhancing Vehicle Longevity in Urban Areas",
        to: "Keeping Hillingdon Grime Off the Paintwork",
      },
    ],
  },
  "car-valeting/hounslow": {
    headings: [
      {
        from: "Convenient Mobile Valeting for Busy Professionals",
        to: "Workday Valeting Around Heathrow and Matrix Park",
      },
      {
        from: "Flexible Valeting Packages to Suit Every Need",
        to: "Maintenance Washes, Interior Cleans and Pre-Sale Valets",
      },
      {
        from: "Enhancing Vehicle Longevity in Urban Areas",
        to: "Dust and Traffic Grime on Hounslow Roads",
      },
    ],
  },
  "car-valeting/kingston": {
    headings: [
      {
        from: "Convenient Mobile Valeting for Busy Professionals",
        to: "Valeting at Canbury Business Park and Norbiton",
      },
      {
        from: "Flexible Valeting Packages to Suit Every Need",
        to: "Mini Valets, Interior Cleans and Wax Treatments",
      },
      {
        from: "Enhancing Vehicle Longevity in Urban Areas",
        to: "Kingston’s Environment and the Wear It Causes",
      },
    ],
  },
  "car-valeting/knightsbridge": {
    headings: [
      {
        from: "Convenient Mobile Valeting for Busy Professionals",
        to: "Valeting Around Brompton Road and Hans Crescent",
      },
      {
        from: "Flexible Valeting Packages to Suit Every Need",
        to: "A One-Off Treatment or a Regular Routine",
      },
      {
        from: "Enhancing Vehicle Longevity in Urban Areas",
        to: "Air Pollution and Tree Sap in Knightsbridge",
      },
    ],
    text: [
      {
        from: "Full valets can take 2.5–4 hours, depending on vehicle size and condition",
        to: "Full valets can take 2.5–4 hours, depending on vehicle size and condition.",
      },
    ],
  },
  "car-valeting/mill-hill": {
    headings: [
      {
        from: "Convenient Mobile Valeting for Busy Professionals",
        to: "Valeting at Stirling Way and Mill Hill Broadway",
      },
      {
        from: "Flexible Valeting Packages to Suit Every Need",
        to: "An Express Wash or a Pre-Sale Deep Clean",
      },
    ],
  },
  "car-valeting/north-west-london": {
    headings: [
      {
        from: "Why Choose Medusa Mobile Valeting?",
        to: "Valeting at Your Door in North West London",
      },
      {
        from: "Key Benefits of Our Service",
        to: "Convenience, Expertise and Eco-Friendly Products",
      },
      {
        from: "Flexible Valeting Packages for Every Need",
        to: "Touch-Ups, Detailing and Preparation for Special Occasions",
      },
    ],
  },
  "car-valeting/notting-hill": {
    headings: [
      {
        from: "Comprehensive Services for Every Need",
        to: "What the Valeters Clean, Inside and Out",
      },
      {
        from: "Our Valeting Packages",
        to: "A Maintenance Clean or a Full Detail",
      },
    ],
  },
  "car-valeting/richmond-upon-thames": {
    headings: [
      {
        from: "Convenient Mobile Valeting for Busy Professionals",
        to: "Cars Cleaned Around Richmond Riverside and Kew Road",
      },
      {
        from: "Hassle-free Clean: Experience the Future of Car Treatment with Mobile Valeting",
        to: "Touch-Ups and Deep Cleans at Your Richmond Address",
      },
    ],
    text: [
      {
        from: "we transform car treatment by bringing our mobile valeting service straight to you in Richmond Upon Thames",
        to: "we bring our mobile valeting service straight to you in Richmond Upon Thames",
      },
      {
        from: "No more will you require to drive to a car wash or wait in line; we bring the clean to your home, office, or any type of place of your option.",
        to: "There is no need to drive to a car wash or wait in line; we bring the clean to your home, office, or anywhere else you choose.",
      },
      {
        from: "Our mobile devices are totally outfitted to take care of every aspect of valeting, from exterior cleans to complete indoor describing.",
        to: "Our mobile units are fully equipped to take care of every aspect of valeting, from exterior cleans to full interior detailing.",
      },
      {
        from: "Whether you require a quick touch-up or a deep tidy, our solution ensures your car looks its ideal without you needing to lift a finger.",
        to: "Whether you need a quick touch-up or a deep clean, our service leaves your car looking its best without you needing to lift a finger.",
      },
      {
        from: "Convenience and quality go to the heart of our service, making it less complicated than ever to maintain your car in excellent condition.",
        to: "Convenience and quality are at the heart of our service, making it easier than ever to keep your car in excellent condition.",
      },
    ],
  },
  "car-valeting/stratford": {
    headings: [
      {
        from: "Convenient Mobile Valeting for Busy Professionals",
        to: "Valeting Near International Quarter London and Westfield",
      },
      {
        from: "Flexible Valeting Packages to Suit Every Need",
        to: "Express Washes, Deep Interior Cleans and Ceramic Coating",
      },
    ],
  },
  "car-valeting/streatham": {
    headings: [
      {
        from: "Convenient Mobile Valeting for Busy Professionals",
        to: "Valeting for Workplaces Along Leigham Court Road",
      },
      {
        from: "Flexible Valeting Packages to Suit Every Need",
        to: "Advanced Exterior Treatments and Express Interior Cleans",
      },
    ],
  },
  "car-valeting/sudbury": {
    headings: [
      {
        from: "Convenient Mobile Valeting for Busy Professionals",
        to: "Valeting Near Watford Road and Sudbury Hill Station",
      },
      {
        from: "Transform Your Car-Schedule Your Mobile Valeting Solution Today!",
        to: "Book a Mobile Valet in Sudbury",
      },
      {
        from: "Flexible Valeting Packages to Suit Every Need",
        to: "Tailored to the Car, the Place and the Day",
      },
    ],
  },
  "car-valeting/twickenham": {
    headings: [
      {
        from: "Convenient Mobile Valeting for Busy Professionals",
        to: "Valeting at Regal House and Twickenham Trading Estate",
      },
      {
        from: "Flexible Valeting Packages to Suit Every Need",
        to: "Before a Weekend Away, or After Bushy Park",
      },
      {
        from: "Enhancing Vehicle Longevity in Urban Areas",
        to: "Protecting Paintwork and Upholstery Over Time",
      },
    ],
  },
  "car-valeting/walthamstow": {
    headings: [
      {
        from: "Convenient Mobile Valeting for Busy Professionals",
        to: "Valeting Around Central Parade and Blackhorse Lane",
      },
      {
        from: "Change Your Car-Schedule Your Mobile Valeting Service Today!",
        to: "Arrange a Valet at Your Walthamstow Address",
      },
      {
        from: "Flexible Valeting Packages to Suit Every Need",
        to: "A Package to Suit the Car and the Budget",
      },
    ],
  },
  "car-valeting/wembley": {
    headings: [
      {
        from: "Convenient Mobile Valeting for Busy Professionals",
        to: "Cleaning Cars at Offices, Warehouses and Dealerships",
      },
      {
        from: "Change Your Car-Arrange Your Mobile Valeting Solution Today!",
        to: "Book a Mobile Valet in Wembley",
      },
      {
        from: "Enhancing Vehicle Longevity in Urban Areas",
        to: "Protecting Paintwork, Alloys and Interiors in Wembley",
      },
    ],
  },
  "car-valeting/west-brompton": {
    headings: [
      {
        from: "Flexible Valeting Packages to Suit Every Need",
        to: "A Basic Clean, or Advanced Paint Protection",
      },
      {
        from: "How Our Services Work?",
        to: "Booked in Under a Minute, Valeted on Site",
      },
    ],
  },
  "car-valeting/wimbledon": {
    headings: [
      {
        from: "Flexible Valeting Packages to Suit Every Need",
        to: "Mini Valets, Deep Interior Cleans and Paint Protection",
      },
      {
        from: "Change Your Car-Arrange Your Mobile Valeting Service Today!",
        to: "Arrange a Valet at Your Wimbledon Address",
      },
      {
        from: "How Our Services Work?",
        to: "Nothing to Set Up Before the Van Arrives",
      },
    ],
    text: [
      {
        from: "Our skilled team delivers professional results using high-end, eco-friendly products",
        to: "Our skilled team delivers professional results using high-end, eco-friendly products.",
      },
    ],
  },
  "mobile-car-wash/belgravia": {
    headings: [
      {
        from: "How Our Services Work?",
        to: "From the Booking to a Gleaming Car",
      },
    ],
  },
  "mobile-car-wash/brent": {
    headings: [
      {
        from: "Experience Convenient Car Treatment in Brent: Reserve Our Mobile Car Wash Now!",
        to: "Experience Convenient Car Care in Brent: Reserve Our Mobile Car Wash Now!",
      },
      {
        from: "How Our Services Work?",
        to: "How a Wash Is Arranged in Brent",
      },
    ],
  },
  "mobile-car-wash/colindale": {
    headings: [
      {
        from: "How Our Services Work?",
        to: "Booked Online, Washed Where You Park",
      },
      {
        from: "Why Regular Car Washing Matters in Urban Areas",
        to: "What City Air Does to Colindale Paintwork",
      },
    ],
  },
  "mobile-car-wash/earls-court": {
    headings: [
      {
        from: "Convenient Mobile Car Wash for Professionals",
        to: "A Wash While You Work in Earl’s Court",
      },
      {
        from: "How Our Services Work?",
        to: "Booked by Phone, Washed at the Kerb",
      },
      {
        from: "Experience Convenient Car Treatment in Earls Court: Schedule Our Mobile Car Wash Now!",
        to: "Experience Convenient Car Care in Earls Court: Schedule Our Mobile Car Wash Now!",
      },
    ],
    text: [
      {
        from: "parked curbside",
        to: "parked kerbside",
      },
    ],
  },
  "mobile-car-wash/eastcote": {
    headings: [
      {
        from: "Mobile Car Wash for Professionals in Eastcote",
        to: "Washed Without Giving Up a Lunch Break",
      },
      {
        from: "Why Regular Mobile Car Cleaning Matters",
        to: "Why Sap and Dust Wear Down Paintwork",
      },
    ],
  },
  "mobile-car-wash/friern-barnet": {
    headings: [
      {
        from: "Convenient Mobile Car Wash for Busy Professionals",
        to: "Washing Cars at Friern Barnet Retail Park",
      },
      {
        from: "Enhancing Vehicle Longevity in Suburban Environments",
        to: "Why Regular Washing Extends a Car’s Life",
      },
    ],
    text: [
      {
        from: "Effortless 0nline Booking with Instant Confirmation",
        to: "Effortless Online Booking with Instant Confirmation",
      },
    ],
  },
  "mobile-car-wash/greater-london": {
    headings: [
      {
        from: "Why Choose Medusa Auto Detailing’s Mobile Car Wash?",
        to: "Cleaned to the Same Standard, Inside and Out",
      },
    ],
    text: [
      {
        from: "Exactly how do you manage scrapes and swirls on the lorry's surface area?",
        to: "How do you deal with scratches and swirls on the car’s paintwork?",
      },
      {
        from: "Do I need to offer anything for the service?",
        to: "Do I need to provide anything for the service?",
      },
      {
        from: "No, our team gets here completely geared up with whatever required to valet your car.",
        to: "No, our team arrives fully equipped with everything needed to valet your car.",
      },
      {
        from: "The moment varies relying on the package, but the majority of services are completed within 1-2 hours.",
        to: "The time varies depending on the package, but most services are completed within 1-2 hours.",
      },
      {
        from: "We use specialized products and strategies to lessen and remedy surface area flaws.",
        to: "We use specialist products and techniques to reduce and correct flaws in the paintwork.",
      },
      {
        from: "Just how usually should I have my car valeted?",
        to: "How often should I have my car valeted?",
      },
      {
        from: "For best outcomes, we advise a complete valet every 4-6 weeks to keep your car in excellent problem.",
        to: "For the best results, we recommend a full valet every 4-6 weeks to keep your car in good condition.",
      },
      {
        from: "What happens if I'm not satisfied with the solution provided?",
        to: "What happens if I’m not satisfied with the service provided?",
      },
      {
        from: "If you’re not pleased, let us understand promptly, and we’ll function to fix any issues without delay.",
        to: "If you’re not happy, tell us straight away and we will put any issues right without delay.",
      },
    ],
  },
  "mobile-car-wash/hendon": {
    headings: [
      {
        from: "Convenient Mobile car washing for Busy Professionals",
        to: "Business Parks, Dealerships and Fleets in Hendon",
      },
      {
        from: "Home car wash for Hendon’s Residential Areas",
        to: "No Hose or Driveway Needed in Hendon",
      },
      {
        from: "Enhancing Vehicle Longevity in Urban Areas",
        to: "What Traffic Fumes and Brake Dust Leave Behind",
      },
    ],
  },
  "mobile-car-wash/hertfordshire": {
    headings: [
      {
        from: "Why Medusa Auto Detailing is the Perfect Choice for Hertfordshire",
        to: "A Professionally Cleaned Car Without Lifting a Finger",
      },
    ],
    text: [
      {
        from: "Exactly how do you manage scrapes and swirls on the lorry's surface area?",
        to: "How do you deal with scratches and swirls on the car’s paintwork?",
      },
      {
        from: "Do I need to offer anything for the service?",
        to: "Do I need to provide anything for the service?",
      },
      {
        from: "No, our team gets here completely geared up with whatever required to valet your car.",
        to: "No, our team arrives fully equipped with everything needed to valet your car.",
      },
      {
        from: "The moment varies relying on the package, but the majority of services are completed within 1-2 hours.",
        to: "The time varies depending on the package, but most services are completed within 1-2 hours.",
      },
      {
        from: "We use specialized products and strategies to lessen and remedy surface area flaws.",
        to: "We use specialist products and techniques to reduce and correct flaws in the paintwork.",
      },
      {
        from: "Just how usually should I have my car valeted?",
        to: "How often should I have my car valeted?",
      },
      {
        from: "For best outcomes, we advise a complete valet every 4-6 weeks to keep your car in excellent problem.",
        to: "For the best results, we recommend a full valet every 4-6 weeks to keep your car in good condition.",
      },
      {
        from: "What happens if I'm not satisfied with the solution provided?",
        to: "What happens if I’m not satisfied with the service provided?",
      },
      {
        from: "If you’re not pleased, let us understand promptly, and we’ll function to fix any issues without delay.",
        to: "If you’re not happy, tell us straight away and we will put any issues right without delay.",
      },
    ],
  },
  "mobile-car-wash/hillingdon": {
    headings: [
      {
        from: "Convenient Mobile CAR Wash for Busy Professionals",
        to: "Washing Cars at Stockley Park and Uxbridge",
      },
      {
        from: "Home car wash for Hillingdon’s Residential Areas",
        to: "A Wash Without a Driveway or a Tap",
      },
      {
        from: "Enhancing Vehicle Longevity in Urban Areas",
        to: "Sap, Grime and a Car’s Resale Value",
      },
    ],
  },
  "mobile-car-wash/mill-hill": {
    headings: [
      {
        from: "Convenient Car Wash for Professionals in Mill Hill",
        to: "Washes for Mill Hill Commuters and Showrooms",
      },
      {
        from: "Why Regular Car Washes Matter in Mill Hill",
        to: "Open Spaces, Busy Roads and Everyday Dirt",
      },
    ],
  },
  "mobile-car-wash/putney": {
    headings: [
      {
        from: "How Our Services Work?",
        to: "Booking, Arrival and a Clean Car in Putney",
      },
      {
        from: "Why Medusa Auto Detailing?",
        to: "Trained Valeters, Eco-Friendly Products and No Queue",
      },
      {
        from: "Experience Convenient Car Treatment in Putney: Schedule Our Mobile Car Wash Now!",
        to: "Experience Convenient Car Care in Putney: Schedule Our Mobile Car Wash Now!",
      },
    ],
    text: [
      {
        from: "Our mobile car wash solution in Putney fits your active day, conserving you the problem of waiting at a standard car wash.",
        to: "Our mobile car wash service in Putney fits your busy day, saving you the wait at a standard car wash.",
      },
      {
        from: "We utilize only environmentally risk-free items, ensuring your vehicle shines without damaging side effects on the setting.",
        to: "We use only environmentally safe products, so your car is cleaned without harm to its surroundings.",
      },
      {
        from: "Our Putney -based group is fully educated, with years of experience providing top-quality car washing solutions right at your doorstep.",
        to: "Our Putney-based team is fully trained, with years of experience providing top-quality car washing at your doorstep.",
      },
      {
        from: "Whether you go to home, work, or anywhere in Putney, our group comes to you, making car care as easy and convenient as feasible.",
        to: "Whether you are at home, at work, or anywhere in Putney, our team comes to you, making car care as easy and convenient as possible.",
      },
      {
        from: "Life in Putney can be frantic, but that does not imply your car has to suffer.",
        to: "Life in Putney can be frantic, but that does not mean your car has to suffer.",
      },
      {
        from: "At Medusa Auto Detailing, we provide a mobile car wash solution that fits effortlessly into your routine.",
        to: "At Medusa Auto Detailing, we provide a mobile car wash service that fits effortlessly into your routine.",
      },
      {
        from: "Whether you’re managing work, family, or other commitments, we make it simple to maintain your car clean without taking time out of your hectic day.",
        to: "Whether you’re juggling work, family or other commitments, we make it simple to keep your car clean without taking time out of your day.",
      },
      {
        from: "Our team comes to you, so you can delight in the luxury of a clean car without the wait.",
        to: "Our team comes to you, so you can enjoy a clean car without the wait.",
      },
      {
        from: "Experience the benefit and professionalism and reliability that establishes us apart as leading mobile car wash service.",
        to: "Experience the convenience, professionalism and reliability that set us apart as a mobile car wash service.",
      },
    ],
  },
  "mobile-car-wash/stratford": {
    headings: [
      {
        from: "How Our Services Work?",
        to: "Three Steps, No Trip to the Forecourt",
      },
      {
        from: "Why Medusa Auto Detailing?",
        to: "Why Drivers in Stratford Use a Mobile Wash",
      },
      {
        from: "Say goodbye to Waiting: Mobile Car Wash That Fits Your Busy Way Of Life",
        to: "Keeping the Car Clean Around a Busy Week",
      },
    ],
    text: [
      {
        from: "Time-Saving Solution: We Function Around Your Set up",
        to: "Time-Saving Solution: We Work Around Your Schedule",
      },
      {
        from: "Our mobile car wash solution in Stratford fits your hectic day, conserving you the inconvenience of waiting at a conventional car wash.",
        to: "Our mobile car wash service in Stratford fits your busy day, saving you the inconvenience of waiting at a conventional car wash.",
      },
      {
        from: "Eco-Friendly Products: Shielding Your Car and the Atmosphere",
        to: "Eco-Friendly Products: Protecting Your Car and the Environment",
      },
      {
        from: "We utilize just environmentally safe products, ensuring your car radiates without harmful adverse effects on the environment.",
        to: "We use only environmentally safe products, so your car is cleaned without harm to its surroundings.",
      },
      {
        from: "Our Stratford -based group is completely educated, with years of experience giving high-quality car washing solutions right at your doorstep.",
        to: "Our Stratford-based team is fully trained, with years of experience providing high-quality car washing at your doorstep.",
      },
      {
        from: "Mobile Benefit: Car Wash",
        to: "Mobile Convenience: Car Wash",
      },
      {
        from: "Whether you're at home, job, or throughout Stratford, our group concerns you, making car treatment as very easy and hassle-free as feasible.",
        to: "Whether you are at home, at work, or anywhere in Stratford, our team comes to you, making car care as easy and hassle-free as possible.",
      },
      {
        from: "Life in Stratford can be chaotic, yet that does not indicate your car needs to experience.",
        to: "Life in Stratford can be chaotic, but that does not mean your car has to suffer.",
      },
      {
        from: "At Medusa Auto Detailing, we give a mobile car wash service that fits perfectly right into your schedule.",
        to: "At Medusa Auto Detailing, we provide a mobile car wash service that fits into your schedule.",
      },
      {
        from: "Whether you’re juggling work, family members, or other commitments, we make it easy to keep your car tidy without taking time out of your active day.",
        to: "Whether you’re juggling work, family or other commitments, we make it easy to keep your car clean without taking time out of your day.",
      },
      {
        from: "Our group comes to you, so you can appreciate the deluxe of a spick-and-span car without the delay.",
        to: "Our team comes to you, so you can enjoy a spotless car without the delay.",
      },
      {
        from: "Experience the benefit and expertise that sets us apart as leading mobile car wash service.",
        to: "Experience the convenience and expertise that set us apart as a mobile car wash service.",
      },
      {
        from: "Exactly how do you make certain the security of my car during the wash?",
        to: "How do you make sure my car is safe during the wash?",
      },
      {
        from: "We make use of mild, environmentally friendly products and techniques that are risk-free for your automobile’s paint and indoor surface areas.",
        to: "We use gentle, environmentally friendly products and techniques that are safe for your car’s paint and interior surfaces.",
      },
    ],
  },
  "mobile-car-wash/west-brompton": {
    headings: [
      {
        from: "Convenient Mobile Car Wash for Local Professionals",
        to: "Cars Cleaned Around Lillie Square and Fulham Broadway",
      },
      {
        from: "How Our Services Work?",
        to: "Nothing to Supply but the Parking Space",
      },
      {
        from: "Experience Convenient Car Treatment in West Brompton: Schedule Our Mobile Car Wash Now!",
        to: "Experience Convenient Car Care in West Brompton: Schedule Our Mobile Car Wash Now!",
      },
    ],
    text: [
      {
        from: "Time-Saving Solution: We Function Around Your Schedule",
        to: "Time-Saving Solution: We Work Around Your Schedule",
      },
      {
        from: "Our mobile car wash solution in West Brompton fits your active day, saving you the inconvenience of waiting at a traditional car wash.",
        to: "Our mobile car wash service in West Brompton fits your busy day, saving you the inconvenience of waiting at a traditional car wash.",
      },
      {
        from: "Eco-Friendly Products: Securing Your Car and the Setting",
        to: "Eco-Friendly Products: Protecting Your Car and the Environment",
      },
      {
        from: "We make use of only environmentally secure products, guaranteeing your automobile shines without unsafe negative effects on the environment.",
        to: "We use only environmentally safe products, so your car is cleaned without harm to its surroundings.",
      },
      {
        from: "Expert Know-how: Educated and Experienced Professionals",
        to: "Expert Know-how: Trained and Experienced Professionals",
      },
      {
        from: "Our West Brompton -based team is completely educated, with years of experience supplying excellent car washing solutions right at your front door.",
        to: "Our West Brompton-based team is fully trained, with years of experience providing excellent car washing at your front door.",
      },
      {
        from: "Mobile Comfort: Car Wash",
        to: "Mobile Convenience: Car Wash",
      },
      {
        from: "Whether you go to home, job, or throughout West Brompton, our group pertains to you, making car treatment as very easy and hassle-free as feasible.",
        to: "Whether you are at home, at work, or anywhere in West Brompton, our team comes to you, making car care as easy and hassle-free as possible.",
      },
      {
        from: "Life in West Brompton can be busy, however that doesn’t suggest your car needs to suffer.",
        to: "Life in West Brompton can be busy, but that does not mean your car has to suffer.",
      },
      {
        from: "At Medusa Auto Detailing, we give a mobile car wash service that fits seamlessly right into your schedule.",
        to: "At Medusa Auto Detailing, we provide a mobile car wash service that fits seamlessly into your schedule.",
      },
      {
        from: "Whether you’re handling work, family members, or other dedications, we make it very easy to keep your vehicle tidy without taking time out of your busy day.",
        to: "Whether you’re juggling work, family or other commitments, we make it easy to keep your car clean without taking time out of your busy day.",
      },
      {
        from: "Our group involves you, so you can take pleasure in the luxury of a pristine car without the wait.",
        to: "Our team comes to you, so you can enjoy a spotless car without the wait.",
      },
      {
        from: "Experience the benefit and professionalism and trust that establishes us apart as top mobile car wash solution.",
        to: "Experience the convenience, professionalism and trust that set us apart as a mobile car wash service.",
      },
    ],
  },
  "mobile-car-wash/westminster": {
    headings: [
      {
        from: "Convenient Mobile Car Wash for Westminster Professionals",
        to: "Washes for Offices Around Whitehall and Victoria",
      },
      {
        from: "Why Medusa Auto Detailing?",
        to: "Why Book a Mobile Wash in Westminster",
      },
      {
        from: "Say goodbye to Waiting: Mobile Car Wash That Fits Your Active Way Of Life",
        to: "A Car Wash That Fits a Full Diary",
      },
    ],
    text: [
      {
        from: "Time-Saving Service: We Work Around Your Set up",
        to: "Time-Saving Service: We Work Around Your Schedule",
      },
      {
        from: "Eco-Friendly Products: Securing Your Car and the Environment",
        to: "Eco-Friendly Products: Protecting Your Car and the Environment",
      },
      {
        from: "We utilize just environmentally secure items, ensuring your car radiates without dangerous negative effects on the environment.",
        to: "We use only environmentally safe products, so your car is cleaned without harm to its surroundings.",
      },
      {
        from: "Professional Experience: Educated and Experienced Professionals",
        to: "Professional Experience: Trained and Experienced Professionals",
      },
      {
        from: "Our Westminster -based group is fully trained, with years of experience providing high-quality car washing solutions right at your doorstep.",
        to: "Our Westminster-based team is fully trained, with years of experience providing high-quality car washing at your doorstep.",
      },
      {
        from: "Mobile Benefit: Car Wash",
        to: "Mobile Convenience: Car Wash",
      },
      {
        from: "Whether you go to home, work, or throughout Westminster, our group concerns you, making car care as very easy and hassle-free as feasible.",
        to: "Whether you are at home, at work, or anywhere in Westminster, our team comes to you, making car care as easy and hassle-free as possible.",
      },
      {
        from: "Life in Westminster can be chaotic, but that does not suggest your car has to suffer.",
        to: "Life in Westminster can be chaotic, but that does not mean your car has to suffer.",
      },
      {
        from: "Whether you’re managing work, household, or other dedications, we make it easy to maintain your automobile clean without taking time out of your busy day.",
        to: "Whether you’re juggling work, home or other commitments, we make it easy to keep your car clean without taking time out of your busy day.",
      },
      {
        from: "Our group involves you, so you can delight in the deluxe of a spotless car without the wait.",
        to: "Our team comes to you, so you can enjoy a spotless car without the wait.",
      },
      {
        from: "Experience the benefit and professionalism and reliability that sets us apart as premier mobile car wash service.",
        to: "Experience the convenience, professionalism and reliability that set us apart as a mobile car wash service.",
      },
    ],
  },
  /*
    ── The four borough hubs outside London ───────────────────────────────

    Not part of the 75-page audit (`MIRROR_AUDIT`) and not location pages in
    the sense the rest of this file means. They are here because the audit of
    2026-09-22 turned them up and the repo owner asked for them fixed: all
    nineteen `/our-locations/*` hubs carry the same caption under their map,
    and on these four it names the wrong place.

    The heading above it — "WE OFFER OUR VALETING AND DETAILING SERVICES IN
    LONDON & SURROUNDING AREAS." — is true on all nineteen and is left alone.
    It is the sentence below that says the map itself is of London.

    Each also carries a real typo in the same sentence, "if you're location
    isn't covered", which the client's site has shipped for years; it is
    corrected here because these four are being rewritten anyway. The other
    fifteen pages that carry the caption — fourteen London boroughs and the
    homepage — still have it, and are a separate call.

    The apostrophes are the page's own: three of the four were extracted with
    straight quotes and `our-locations/hertfordshire` with curly ones, and
    `pattern()` normalises whitespace but not punctuation.
  */
  "our-locations/watford": {
    text: [
      {
        from: "All areas we cover in London are highlighted on the map, if you're location isn't covered",
        to: "All areas we cover around Watford are highlighted on the map, if your location isn't covered",
      },
    ],
  },
  "our-locations/slough": {
    text: [
      {
        from: "All areas we cover in London are highlighted on the map, if you're location isn't covered",
        to: "All areas we cover around Slough are highlighted on the map, if your location isn't covered",
      },
    ],
  },
  "our-locations/buckinghamshire": {
    text: [
      {
        from: "All areas we cover in London are highlighted on the map, if you're location isn't covered",
        to: "All areas we cover in Buckinghamshire are highlighted on the map, if your location isn't covered",
      },
    ],
  },
  "our-locations/hertfordshire": {
    text: [
      {
        from: "All areas we cover in London are highlighted on the map, if you’re location isn’t covered",
        to: "All areas we cover in Hertfordshire are highlighted on the map, if your location isn’t covered",
      },
    ],
  },
};

/**
 * The 52 mirror location pages the client's Ahrefs list never covered.
 *
 * The audit of 2026-09-22 was scoped by the client — "Only audit/update URLs
 * included in this list" — and these are the service-in-a-place pages that
 * were not on it. They were left carrying exactly the faults `MIRROR_AUDIT`'s
 * 75 were fixed of; measured on the day, 44 of 52 still had their section
 * titles at `h3`/`h4`, 41 had no districts row and 7 still read as the
 * machine-spun English WordPress shipped.
 *
 * The repo owner lifted the scope later the same day, after the client asked
 * for "all location pages". They take the **same three passes** as the 75 —
 * `promoteSections`, `applyMirrorEdits`, `districtsRow` — and the same rule 2
 * narrowing: headings and typos only, never a rewritten paragraph.
 *
 * Kept as a separate set rather than merged into `MIRROR_AUDIT` because the
 * provenance differs and this repo keeps track of that: one list is the
 * client's, the other is ours.
 */
export const MIRROR_REST: ReadonlySet<string> = new Set([
  "car-detailing/brent",
  "car-detailing/colindale",
  "car-detailing/edgware",
  "car-detailing/golders-green",
  "car-detailing/hendon",
  "car-detailing/mill-hill",
  "car-valeting/belgravia",
  "car-valeting/brent",
  "car-valeting/chelsea",
  "car-valeting/chingford",
  "car-valeting/colindale",
  "car-valeting/ealing",
  "car-valeting/earls-court",
  "car-valeting/eastcote",
  "car-valeting/friern-barnet",
  "car-valeting/fulham",
  "car-valeting/golders-green",
  "car-valeting/greater-london",
  "car-valeting/hammersmith",
  "car-valeting/hayes",
  "car-valeting/hendon",
  "car-valeting/hillingdon",
  "car-valeting/hounslow",
  "car-valeting/kingston",
  "car-valeting/knightsbridge",
  "car-valeting/mill-hill",
  "car-valeting/north-west-london",
  "car-valeting/notting-hill",
  "car-valeting/richmond-upon-thames",
  "car-valeting/stratford",
  "car-valeting/streatham",
  "car-valeting/sudbury",
  "car-valeting/twickenham",
  "car-valeting/walthamstow",
  "car-valeting/wembley",
  "car-valeting/west-brompton",
  "car-valeting/wimbledon",
  "mobile-car-wash/belgravia",
  "mobile-car-wash/brent",
  "mobile-car-wash/colindale",
  "mobile-car-wash/earls-court",
  "mobile-car-wash/eastcote",
  "mobile-car-wash/friern-barnet",
  "mobile-car-wash/greater-london",
  "mobile-car-wash/hendon",
  "mobile-car-wash/hertfordshire",
  "mobile-car-wash/hillingdon",
  "mobile-car-wash/mill-hill",
  "mobile-car-wash/putney",
  "mobile-car-wash/stratford",
  "mobile-car-wash/west-brompton",
  "mobile-car-wash/westminster",
]);

/**
 * Pages that take a text correction from `MIRROR_EDITS` and nothing else.
 *
 * `MIRROR_AUDIT`'s pages get three passes — `promoteSections`, the edits, and
 * a districts row. These four are borough hubs with their own heading ranks
 * and their own areas row already, so all they want is `applyMirrorEdits`.
 */
export const MIRROR_FIXES: ReadonlySet<string> = new Set([
  "our-locations/watford",
  "our-locations/slough",
  "our-locations/buckinghamshire",
  "our-locations/hertfordshire",
]);

/** "car-valeting/golders-green" -> "Golders Green", the way `placeName` does it. */
const placeOf = (slug: string) =>
  (slug.split("/").pop() ?? slug)
    .split("-")
    .map((w) => (w === "upon" || w === "and" || w === "of" ? w : w.charAt(0).toUpperCase() + w.slice(1)))
    .join(" ");

/* ── Applying them ────────────────────────────────────────────────────── */

const norm = (s: string) => s.replace(/\s+/g, " ").trim();

/** Every block on a page, columns recursed into, in document order. */
function flatten(blocks: Block[], into: Block[] = []): Block[] {
  for (const b of blocks) {
    if (b.type === "columns") b.cols.forEach((c) => flatten(c, into));
    else into.push(b);
  }
  return into;
}

/**
 * The rows `components/LocationPage` renders itself, with a heading of its own.
 *
 * Their level in `pages.json` never reaches the page — `SectionHead` prints an
 * `h2` whatever the source wrote — so promoting them would be a diff that
 * changes nothing. Mirrors the regexes in `lib/location-frame.ts`.
 */
const FRAME_ROW =
  /^(service areas|how it works|the car lovers club|our locations?|faqs?|frequently asked questions|.*neighbou?rhoods?|.*top sights?|.*other locations.*)$/i;

/**
 * Headings that open a row but are not its title.
 *
 * "LEVEL 1" heads one cell of a five-cell price grid and is caught by the
 * parallel-cell test below; "Book Now" and "Portfolio" are a button label and
 * a dead WordPress row, and neither is a section topic. Portfolio is left
 * exactly as the mirror has it — see PROJECT.md §10.
 */
const NOT_A_TITLE = /^(book now|portfolio|level\s*\d)/i;

/**
 * The heading that titles a row, and whether the row is really a set of cards.
 *
 * Looks inside a leading column layout the way `headingOf` in
 * `lib/location-frame.ts` does, because half of these titles are written into
 * the first cell rather than above it. A row whose *other* cells also open on a
 * heading of the same level is a card grid — five `LEVEL n` cells, four `Small
 * Car` cells — and its first heading titles one card, not the row.
 */
function rowTitle(section: Section): { heading: Extract<Block, { type: "heading" }>; parallel: boolean } | null {
  const first = section.blocks[0];
  if (first?.type === "heading") return { heading: first, parallel: false };
  if (first?.type === "columns") {
    const lead = first.cols[0]?.find((x) => x.type !== "image");
    if (lead?.type !== "heading") return null;
    const parallel = first.cols
      .slice(1)
      .some((col) => {
        const b = col.find((x) => x.type !== "image");
        return b?.type === "heading" && b.level === lead.level;
      });
    return { heading: lead, parallel };
  }
  return null;
}

/**
 * Section titles written below `h2`, put back at `h2`.
 *
 * **No word changes; only the level.** A row's title is promoted to 2 and every
 * other heading in that row moves down by the same amount, floored at 3 — so a
 * row titled `h3` whose steps are `h4` becomes `h2` over `h3`, and one whose
 * steps are already `h3` keeps them there. Without that second half the fix
 * would trade an `h2→h3→h3` for an `h2→h4`, which is worse.
 *
 * Returns how many rows it moved, so `content/overrides.ts` can throw when a
 * regeneration has reshaped the page out from under it.
 */
export function promoteSections(page: Page): number {
  let moved = 0;

  page.sections.forEach((section, i) => {
    if (i === 0) return; // the header; its h1 is the page title
    const title = rowTitle(section);
    if (!title || title.parallel) return;

    const { heading } = title;
    if (heading.level < 3) return;
    if (FRAME_ROW.test(norm(heading.text))) return;
    if (NOT_A_TITLE.test(norm(heading.text))) return;

    /*
      A row that is nothing but its heading still counts. Every one of them on
      these 75 pages is a closing statement — "Experience Convenient Car Care
      in Streatham: Book Our Mobile Car Wash Now!", "Transform Your Car-Arrange
      Your Mobile Valeting Service Today!" — and every one is already an `h2`
      on a sibling page that says the same thing. `Sections` then sets it
      centred across the full width, which is what PROJECT.md §5 calls a
      statement. The one heading-only row that is *not* a statement is
      "Portfolio", and `NOT_A_TITLE` has already turned it away.
    */

    const delta = heading.level - 2;
    for (const b of flatten(section.blocks)) {
      if (b.type !== "heading") continue;
      b.level = b === heading ? 2 : Math.max(3, b.level - delta);
    }
    moved++;
  });

  return moved;
}

/**
 * A `from` string as a pattern that tolerates the mirror's own whitespace.
 *
 * The extractor keeps WordPress's `&nbsp;` where the editor typed one, and
 * four of these pages carry one mid-sentence — "a spotless car&nbsp;without
 * the delay". A literal `includes()` misses that, and a missed patch throws,
 * so every run of whitespace in the needle matches a run of whitespace or a
 * non-breaking space entity in the haystack. Everything else is still exact.
 */
const pattern = (from: string) =>
  new RegExp(
    from
      .replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
      .replace(/\s+/g, "(?:\\s|&nbsp;|&#160;|&#xa0;)+"),
    "g",
  );

const swapIn = (s: string, from: string, to: string) => s.replace(pattern(from), to);
const holds = (s: string, from: string) => pattern(from).test(s);

/**
 * The renames and corrections for one page.
 *
 * Exact-match, and it throws on a miss: a rule that silently found nothing is
 * the failure mode this whole file exists to avoid.
 */
export function applyMirrorEdits(page: Page, slug: string): number {
  const edit = MIRROR_EDITS[slug];
  if (!edit) return 0;
  let n = 0;

  for (const { from, to } of edit.headings ?? []) {
    const hit = flatten(page.sections.flatMap((s) => s.blocks)).filter(
      (b) => b.type === "heading" && norm(b.text) === norm(from),
    );
    if (!hit.length) throw new Error(`local-mirror: ${slug} has no heading "${from}"`);
    for (const b of hit) if (b.type === "heading") b.text = to;
    n += hit.length;
  }

  for (const { from, to } of edit.text ?? []) {
    const hit = flatten(page.sections.flatMap((s) => s.blocks)).filter(
      (b) =>
        (b.type === "paragraph" && holds(b.html, from)) ||
        (b.type === "heading" && holds(b.text, from)) ||
        (b.type === "list" && b.items.some((i) => holds(i, from))) ||
        (b.type === "faq" && b.items.some((i) => holds(i.q, from) || i.a.some((a) => holds(a, from)))),
    );
    if (!hit.length) throw new Error(`local-mirror: ${slug} does not say "${from}"`);
    for (const b of hit) {
      if (b.type === "paragraph") b.html = swapIn(b.html, from, to);
      else if (b.type === "heading") b.text = swapIn(b.text, from, to);
      else if (b.type === "list") b.items = b.items.map((i) => swapIn(i, from, to));
      else if (b.type === "faq")
        b.items = b.items.map((i) => ({
          q: swapIn(i.q, from, to),
          a: i.a.map((a) => swapIn(a, from, to)),
        }));
    }
    n += hit.length;
  }

  return n;
}

/**
 * The districts row, in the shape `location-frame.ts` already recognises.
 *
 * `<Place>’s Neighborhoods` over a comma-separated line is what the nineteen
 * borough hubs write and what the 126 built pages carry, and the frame renders
 * it as the chips under the header. The spelling is the source's own.
 *
 * Skipped when the page already lists its areas under any name — three pages
 * write "Areas We Cover in X" and four "Areas We Serve in X", and a second row
 * of the same names is exactly the doubling the client struck off the A–Z index
 * on 2026-09-17 ("ini double").
 */
export function districtsRow(page: Page, slug: string): boolean {
  const areas = LOCAL_PLACES[slug.split("/").pop() ?? ""]?.areas;
  if (!areas?.length) return false;

  /*
    Anchored, because eight of these pages head a prose row "At-Home Car Wash
    for Barnet’s Residential Neighbourhoods" — which ends in the word and is
    not a list of anywhere. A row that already names the districts is titled
    "<Place>’s Neighborhoods", "Areas We Cover/Serve in …" or "Service Areas",
    and nothing else.
  */
  const place = placeOf(slug);
  const own = place.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const ALREADY = new RegExp(
    "^(service areas|areas we (cover|serve)\\b.*|" + own + "[’']s neighbou?rhoods?)$",
    "i",
  );
  const lists = page.sections.some((s) => {
    const t = rowTitle(s);
    return t ? ALREADY.test(norm(t.heading.text)) : false;
  });
  if (lists) return false;

  const row: Section = {
    blocks: [
      { type: "heading", level: 2, text: `${placeOf(slug)}’s Neighborhoods` },
      { type: "paragraph", html: areas.join(", ") },
    ],
  };

  /* Above the closing rows, so `pages.json` reads in document order even
     though the frame hoists the chips to the top of the page either way. */
  const CLOSING = /^(faqs?|frequently asked questions|our locations?|.*other locations.*)$/i;
  const at = page.sections.findIndex((s) => {
    const t = rowTitle(s);
    return t ? CLOSING.test(norm(t.heading.text)) : false;
  });
  if (at === -1) page.sections.push(row);
  else page.sections.splice(at, 0, row);
  return true;
}
