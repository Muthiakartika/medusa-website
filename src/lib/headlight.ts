/**
 * Content for /headlight-restoration.
 *
 * The words are transcribed verbatim from the extracted page
 * (`src/content/pages.json` → `headlight-restoration`) so the copy, the
 * headings and the keyword coverage are unchanged; only the shape is
 * different. The extractor left the theme's tick-mark `<path>` fragments and
 * `<b>…</b><br>` wrappers inside the list items — those are markup accidents,
 * not content, so the pairs are stored here as title + body instead.
 *
 * This mirrors how the homepage works (hand-built sections reading from
 * `lib/site.ts`), which is the pattern for any page that earns its own layout.
 */

import { BOOK_URL, CONTACT } from "@/lib/site";

export const HEADLIGHT = {
  h1: "Mobile Headlight Restoration in London",
  lead: "Professional Headlight Restoration for Enhanced Safety and Visibility",
  /** The source page's opening paragraph. `<strong>` is kept — it is the copy's own emphasis. */
  introHtml:
    "At <strong>Medusa Auto Detailing</strong>, we specialise in <strong>mobile headlight restoration</strong>, bringing expert care directly to you. Our <strong>headlight restoration service</strong> eliminates cloudiness, scratches, and discolouration, restoring clarity and brightness for improved visibility and a refreshed vehicle appearance.",

  price: { from: "£100", note: "Mobile service — we come to you" },

  book: BOOK_URL,
  phone: CONTACT.phone,

  /** Shown against the hero image; each is a claim the site makes site-wide. */
  hero: {
    image:
      "/assets/2025/02/closeup-shot-of-a-man-cleaning-car-headlight-with-2025-02-11-21-21-49-utc.webp",
    ticks: [
      "Restored at your home or workplace",
      "Five-stage sand, polish and UV seal",
      "No replacement headlamps to pay for",
    ],
  },

  /** The trust strip under the hero. Icons are names from `components/Icon`. */
  proof: [
    { icon: "star", value: "5 stars", label: "Google & Trustpilot rated" },
    { icon: "shield", value: "£1,000,000", label: "Auto liability insured" },
    { icon: "pin", value: "We come to you", label: "Anywhere across London" },
    { icon: "clock", value: "On time", label: "Every pre-booked slot" },
  ] as const,

  signs: {
    heading: "Signs Your Headlights Need Restoration",
    items: [
      {
        title: "Cloudy or Dull Lenses",
        body: "If your headlights still look foggy after a regular wash, it's a sign that oxidation has built up and they need professional headlight restoration.",
      },
      {
        title: "Poor Visibility",
        body: "Struggling to see clearly at night or in bad weather? Foggy headlights can significantly reduce light output, making driving more dangerous.",
      },
      {
        title: "Yellowing or Discoloration",
        body: "Over time, headlights can develop a yellow tint due to UV exposure, reducing their effectiveness. Plastic headlight restoration removes this layer and restores a crystal-clear finish.",
      },
      {
        title: "Scratches or Cracks",
        body: "Scratches and minor cracks can scatter light, impacting performance. Our headlamp restoration service smooths out imperfections for better functionality and appearance.",
      },
    ],
  },

  matters: {
    heading: "Why Headlight Restoration Matters",
    items: [
      {
        icon: "gauge",
        title: "Enhanced Safety",
        body: "Cloudy or damaged headlights reduce light projection, making it harder to see the road ahead. Our headlight detailing ensures your car headlights provide maximum illumination for safer driving.",
      },
      {
        icon: "spark",
        title: "Cost-Effective Alternative",
        body: "Why replace expensive headlights when you can restore them? Our professional headlight restoration is a budget-friendly solution that delivers outstanding results without the cost of new headlamps.",
      },
      {
        icon: "star",
        title: "Improved Aesthetics",
        body: "Clear, well-maintained headlights enhance your vehicle's appearance. Whether you're keeping your car in top shape or preparing to sell it, headlight cleaning can make a big difference in curb appeal.",
      },
    ] as const,
  },

  process: {
    heading: "The Headlight Restoration Process",
    lede: "Our expert team follows a multi-stage process to ensure a high-quality restoration:",
    image: {
      src: "/assets/2025/02/cropped-view-of-car-cleaner-polishing-rear-lamp-wi-2024-11-18-08-44-22-utc-684x1024.webp",
      w: 684,
      h: 1024,
      alt: "A Medusa detailer polishing a car lamp by hand",
    },
    steps: [
      {
        title: "Surface Protection",
        body: "We mask off surrounding areas to prevent accidental damage to your car's paintwork.",
      },
      {
        title: "Deep Cleaning & Preparation",
        body: "The lenses are thoroughly cleaned to remove debris, oxidation, and contaminants before restoration begins.",
      },
      {
        title: "Wet Sanding",
        body: "Using a multi-stage process, we carefully sand the headlights to remove oxidation and restore clarity without damaging the plastic.",
      },
      {
        title: "Polishing for Maximum Clarity",
        body: "We polish the headlights to bring back their original shine, ensuring a crystal-clear finish.",
      },
      {
        title: "UV Clear Coat Protection",
        body: "To prevent future yellowing and damage, we apply a UV-resistant protective coating, ensuring long-lasting results.",
      },
    ],
  },

  why: {
    heading: "Why Choose Medusa Auto Detailing?",
    lede: "There are plenty of reasons to choose us when booking mobile headlight restoration in London. These are some of the most popular ones, based on extensive feedback from our satisfied customers:",
    image: {
      src: "/assets/2025/02/Untitled-design-1-2-1650x770-1-800x770.webp",
      w: 800,
      h: 770,
      alt: "Medusa Auto Detailing at work on a customer's car",
    },
    items: [
      {
        title: "Your Local Headlight Restoration Experts",
        body: "We have years of experience providing car headlight restoration services across London, helping drivers improve visibility and vehicle aesthetics.",
      },
      {
        title: "Convenient Mobile Service",
        body: "Our mobile headlight restoration service means we come directly to your location, making the process easy and stress-free.",
      },
      {
        title: "Trusted by London Drivers",
        body: "We've built a reputation for excellence, delivering professional headlight restoration with outstanding results.",
      },
      {
        title: "Safe & Reliable Service",
        body: "Our skilled team arrives fully equipped with specialist tools and high-quality products, ensuring a risk-free, professional-grade headlight restoration.",
      },
    ],
  },

  areas: {
    heading: "Mobile Car Headlight Restoration Near You",
    body: "Our mobile car headlight restoration service is available to customers in North London, North West London, West London, Central London, Greater London, and Hertfordshire. We pride ourselves on always arriving on time for any pre-booked valeting service.",
    chips: [
      "North London",
      "North West London",
      "West London",
      "Central London",
      "Greater London",
      "Hertfordshire",
    ],
  },

  cta: {
    heading: "Book Your Mobile Headlight Restoration in London",
    body: "Don't let foggy headlights affect your safety or vehicle's appearance. Our mobile headlight restoration service means we come to you—whether at home, work, or another location—providing expert restoration without the hassle.",
    closer:
      "Restore your headlights today and drive with confidence. <strong>Book online now or contact us for more details!</strong>",
  },
};
