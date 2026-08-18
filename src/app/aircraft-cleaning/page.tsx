import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import FaqAccordion from "@/components/FaqAccordion";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import Icon, { type IconName } from "@/components/Icon";
import JsonLd from "@/components/JsonLd";
import Reveal from "@/components/Reveal";
import SectionHead from "@/components/SectionHead";
import { getFaq, getPage, heroImageFor } from "@/lib/blocks";
import { pageSchema } from "@/lib/schema";

/**
 * Aircraft cleaning, laid out rather than rendered.
 *
 * The worst-reading page left on the site, and the sweep says so: fifteen
 * headings in a row with nothing under any of them. That is not the renderer's
 * doing — medusaautodetailing.co.uk/aircraft-cleaning/ is built the same way.
 * Its four service categories are bare `<h2>`s, and both of its "what we do"
 * lists are written as runs of `<h3>`s, one per bullet.
 *
 * Every word below is that page's own, in its order. What changes is that the
 * runs of headings render as the lists they are and the categories as the row
 * of labels they are.
 *
 * The questions come from `pages.json` like every other page's. They used to
 * be transcribed here, because the source keeps them in hand-written
 * `<details class="faq-item">` markup the extractor had no branch for; it has
 * one now, so there is a single source of truth again.
 */

const SLUG = "aircraft-cleaning";

export function generateMetadata(): Metadata {
  const page = getPage(SLUG);
  if (!page) return {};
  return {
    title: page.title,
    description: page.description,
    alternates: { canonical: `/${SLUG}` },
    openGraph: {
      title: page.title,
      description: page.description,
      url: `/${SLUG}`,
      images: page.ogImage ? [{ url: page.ogImage }] : undefined,
    },
  };
}

const TITLE = "Detailed Aircraft Cleaning";
const LEDE =
  "Premium Aircraft Valeting & Detailing Across the UK — Jets, Light Aircraft & Helicopters";
const INTRO =
  "Looking for professional aircraft valeting UK services? At Medusa Auto Detailing, we specialise in jet valeting, plane cleaning services, and aircraft detailing for private jets, helicopters, and commercial aircraft across the UK. Our team combines aviation expertise with CAA-approved cleaning products to deliver outstanding results that protect your aircraft inside and out.";

const WHY = {
  heading: "Why Choose Our Aircraft Cleaning Services?",
  items: [
    {
      icon: "star",
      title: "Expertise in Aviation Cleaning",
      body: "From private jet detailing London to helicopter cleaning services UK, we tailor every valet to aviation standards.",
    },
    {
      icon: "shield",
      title: "CAA-Approved & Compliant",
      body: "All cleaning solutions and sanitisation processes meet Civil Aviation Authority (CAA) requirements for safety and compliance.",
    },
    {
      icon: "pin",
      title: "Mobile Aircraft Valeting Nationwide",
      body: "We bring our services directly to you, whether you’re at a private airstrip, airport, or hangar.",
    },
    {
      icon: "spark",
      title: "Comprehensive Solutions",
      body: "Exterior protection, cabin sanitisation, upholstery care, and brightwork polishing — we do it all.",
    },
  ] as const,
};

/*
  The source prints "Disinfection Services" twice in a row. The block renderer
  already drops a heading whose only content is the same heading again — that
  rule was written for this page — so it is said once here too.
*/
const CATEGORIES = [
  "Disinfection Services",
  "Exterior Valet Services",
  "Disinsection Services",
  "Bright Work Polishing",
];

const WORK = [
  {
    image: {
      src: "/assets/2025/09/Jet-Cleaning-on-a-Sunny-Day-1024x683.webp",
      w: 1024,
      h: 683,
      alt: "A jet being washed in the sun",
    },
    title: "Exterior Aircraft Cleaning",
    items: [
      "Wet or dry-wash cleaning to minimise water use",
      "Brightwork polishing, waxing, and ceramic coatings for long-lasting shine",
      "Paint protection sealants to reduce drag and protect surfaces",
      "Full jet detailing including wheel wells, landing gear, and windows",
    ],
  },
  {
    image: {
      src: "/assets/2025/09/Jet-Seat-Cleaning-in-Luxurious-Cabin-1024x683.webp",
      w: 1024,
      h: 683,
      alt: "Seats being cleaned in a jet cabin",
    },
    title: "Interior Aircraft Detailing & Sanitisation",
    items: [
      "Deep cabin cleaning: upholstery, carpets, dashboards, tray tables, lavatories",
      "Leather conditioning & luxury cabin detailing",
      "High-touch surface sanitisation with WHO-compliant disinfectants",
      "Certificates provided for operational and compliance records",
    ],
  },
];

const COVERAGE = {
  heading: "Service Coverage & Benefits",
  image: {
    src: "/assets/2025/08/mechanic-and-aircraft-2024-10-18-08-23-51-utc-scaled-1-800x800.jpg",
    w: 800,
    h: 800,
    alt: "An engineer beside an aircraft",
  },
  items: [
    "Available at airports & private airfields across London, Manchester, Birmingham, Cardiff, and nationwide",
    "Fully equipped mobile aircraft cleaning service units for convenience",
    "Experienced, security-cleared staff with airport access approval",
    "Suitable for light aircraft, business jets, helicopters, and commercial fleets",
  ],
};

const CLOSING = "Ready to give your aircraft the luxury finish it deserves?";

export default function AircraftCleaningPage() {
  const page = getPage(SLUG);
  if (!page) notFound();

  const faq = getFaq(SLUG);

  return (
    <>
      <JsonLd data={pageSchema(page)} />
      {faq && <JsonLd data={faqSchema(faq.items)} />}
      <Header />
      <main className="flex-1">
        <Hero image={heroImageFor(page)} />
        <Why />
        <Categories />
        {WORK.map((w, i) => (
          <Work key={w.title} work={w} flip={i % 2 === 1} />
        ))}
        {faq && <Faq faq={faq} />}
        <Coverage />
        <Closing />
      </main>
      <Footer />
    </>
  );
}

function faqSchema(items: { q: string; a: string[] }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a.join(" ") },
    })),
  };
}

/* ── Header ───────────────────────────────────────────────────────────────
   The source has no <h1> on this page and neither does this one — its opening
   line is an <h2>, which `scripts/verify.mjs` already expects here. */

function Hero({ image }: { image?: string | null }) {
  return (
    <section className="cut-bottom relative flex w-full items-center overflow-hidden bg-ink-panel pt-[150px] pb-[calc(var(--cut)+3.5rem)] lg:min-h-[560px] lg:pt-[200px]">
      {/* The page's own OG image — the jet it publishes of itself. Its opening
          row carries no background of its own in the mirror. */}
      {image ? (
        <>
          <Image src={image} alt="" fill priority sizes="100vw" className="object-cover object-center" />
          <div
            aria-hidden
            className="absolute inset-0 bg-[linear-gradient(78deg,rgba(0,0,0,0.95)_0%,rgba(0,0,0,0.82)_48%,rgba(0,0,0,0.58)_100%)]"
          />
        </>
      ) : (
        <>
          <div aria-hidden className="livery absolute inset-0 opacity-70" />
          <div
            aria-hidden
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(70% 62% at 80% 36%, rgba(237,179,38,0.18) 0%, rgba(193,146,49,0.05) 46%, transparent 76%)",
            }}
          />
        </>
      )}
      <div
        aria-hidden
        className="absolute inset-x-0 bottom-0 h-2/5 bg-[linear-gradient(to_top,rgba(0,0,0,0.85),transparent)]"
      />

      <div className="shell relative z-10">
        <Reveal>
          <span className="hero-rule speed-rule" aria-hidden />
        </Reveal>
        <Reveal delay={1}>
          <h2 className="mt-7 max-w-[18ch] text-[clamp(30px,4.7vw,52px)] leading-[1.02] text-white">
            {TITLE}
          </h2>
        </Reveal>
        <Reveal delay={2}>
          <p className="mt-6 max-w-[52ch] font-[family-name:var(--font-sub)] text-[17px] leading-[1.35] text-gold uppercase lg:text-[19px]">
            {LEDE}
          </p>
        </Reveal>
        <Reveal delay={3}>
          <p className="mt-5 max-w-[64ch] text-[16px] leading-[27px] font-normal text-white/80 lg:text-[16.5px]">
            {INTRO}
          </p>
        </Reveal>
      </div>
    </section>
  );
}

/* ── Why choose ───────────────────────────────────────────────────────── */

function Why() {
  return (
    <section className="w-full py-16 lg:py-[104px]">
      <div className="shell">
        <SectionHead title={WHY.heading} />
        <ul className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {WHY.items.map((w, i) => (
            <Reveal as="li" key={w.title} delay={i} className="surface h-full p-7">
              <span className="flex h-[48px] w-[48px] items-center justify-center rounded-full bg-gold/12 ring-1 ring-gold/35">
                <Icon name={w.icon as IconName} size={22} className="text-gold" />
              </span>
              <h3 className="mt-6 text-[18px] leading-snug font-semibold text-white">
                {w.title}
              </h3>
              <p className="mt-3 text-[15px] leading-[24px] font-normal text-body">{w.body}</p>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}

/* ── Categories ───────────────────────────────────────────────────────────
   Four labels with nothing under them on the source. Four labels here too —
   as a row rather than four full-width headings down the page. */

function Categories() {
  return (
    <section className="w-full border-y border-white/[0.07] py-11 lg:py-[64px]">
      <ul className="shell grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {CATEGORIES.map((c, i) => (
          <Reveal
            as="li"
            key={c}
            delay={i}
            className="flex items-center gap-3 rounded-[12px] px-5 py-4 ring-1 ring-white/10"
          >
            <Icon name="check" size={18} strokeWidth={2.4} className="shrink-0 text-gold" />
            <h2 className="font-[family-name:var(--font-sub)] text-[16px] leading-tight text-white uppercase">
              {c}
            </h2>
          </Reveal>
        ))}
      </ul>
    </section>
  );
}

/* ── What we do ───────────────────────────────────────────────────────────
   Each of these was a title followed by four more headings. They are a title
   and its four bullets, next to the photograph the source pairs them with. */

function Work({ work, flip }: { work: (typeof WORK)[number]; flip?: boolean }) {
  return (
    <section className="w-full py-14 lg:py-[88px]">
      <div className="shell grid items-center gap-12 lg:grid-cols-12 lg:gap-16">
        <Reveal className={`lg:col-span-5 ${flip ? "lg:order-2" : ""}`}>
          <div className="overflow-hidden rounded-[14px] ring-1 ring-white/[0.08]">
            <Image
              src={work.image.src}
              alt={work.image.alt}
              width={work.image.w}
              height={work.image.h}
              sizes="(min-width: 1024px) 520px, 100vw"
              className="h-auto w-full"
            />
          </div>
        </Reveal>

        <div className="lg:col-span-7">
          <Reveal>
            <h3 className="font-[family-name:var(--font-sub)] text-[22px] leading-tight text-white uppercase lg:text-[26px]">
              {work.title}
            </h3>
          </Reveal>
          <ul className="mt-7 flex flex-col gap-4">
            {work.items.map((item, i) => (
              <Reveal as="li" key={item} delay={i} className="flex gap-3.5">
                <Icon
                  name="check"
                  size={18}
                  strokeWidth={2.4}
                  className="mt-[4px] shrink-0 text-gold"
                />
                <span className="text-[16px] leading-[26px] font-normal text-body">{item}</span>
              </Reveal>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

/* ── Questions ────────────────────────────────────────────────────────── */

function Faq({ faq }: { faq: NonNullable<ReturnType<typeof getFaq>> }) {
  return (
    <section className="w-full py-16 lg:py-[104px]">
      <div className="shell grid gap-8 lg:grid-cols-12 lg:gap-14">
        <div className="lg:col-span-5">
          <SectionHead title={faq.heading} lede={faq.lede} />
        </div>
        <div className="lg:col-span-7">
          <FaqAccordion items={faq.items} />
        </div>
      </div>
    </section>
  );
}

/* ── Coverage ─────────────────────────────────────────────────────────── */

function Coverage() {
  return (
    <section className="w-full py-16 lg:py-[104px]">
      <div className="shell grid items-center gap-12 lg:grid-cols-12 lg:gap-16">
        <Reveal className="lg:col-span-5">
          <div className="overflow-hidden rounded-[14px] ring-1 ring-white/[0.08]">
            <Image
              src={COVERAGE.image.src}
              alt={COVERAGE.image.alt}
              width={COVERAGE.image.w}
              height={COVERAGE.image.h}
              sizes="(min-width: 1024px) 460px, 100vw"
              className="h-auto w-full"
            />
          </div>
        </Reveal>
        <div className="lg:col-span-7">
          <SectionHead title={COVERAGE.heading} />
          <ul className="mt-9 flex flex-col gap-4">
            {COVERAGE.items.map((item, i) => (
              <Reveal as="li" key={item} delay={i} className="flex gap-3.5">
                <Icon
                  name="check"
                  size={18}
                  strokeWidth={2.4}
                  className="mt-[4px] shrink-0 text-gold"
                />
                <span className="text-[16px] leading-[26px] font-normal text-body">{item}</span>
              </Reveal>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

/* ── Closing ──────────────────────────────────────────────────────────────
   The source's last line, and only that — it carries no button of its own. */

function Closing() {
  // One line of type does not need a full band under it — enough to clear the
  // diagonal, and no more.
  return (
    <section className="cut-top relative w-full overflow-hidden bg-ink-panel pt-[calc(var(--cut)+2rem)] pb-12 lg:pb-16">
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(80% 100% at 50% 0%, rgba(193,146,49,0.16) 0%, transparent 62%)",
        }}
      />
      <div className="shell relative flex flex-col items-center text-center">
        <SectionHead title={CLOSING} align="center" />
      </div>
    </section>
  );
}
