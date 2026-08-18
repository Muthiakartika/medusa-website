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
import { getFaq, getPage } from "@/lib/blocks";
import { type Extra, MOTORCYCLE } from "@/lib/motorcycle";
import { pageSchema } from "@/lib/schema";

/**
 * Motorcycle valeting & detailing, laid out rather than rendered.
 *
 * The generic block renderer reproduced this page as the extractor saw it: an
 * h1 reading "Bike Wash Packages" two thirds of the way down, three unpriced
 * bullet lists under it, and fifty stacked paragraphs alternating add-on name
 * and add-on description with no prices and no rows. The page's own numbers —
 * £165 / £240 / £375 and the twenty-five add-on prices — never survived
 * extraction, and neither did its four FAQ answers.
 *
 * So it gets the treatment `/headlight-restoration` gets: the copy comes back
 * whole from `lib/motorcycle.ts`, and the shapes it always was become the
 * shapes it renders as — a three-card price row with the popular tier carrying
 * the page's one gold moment, the add-ons as three grouped price lists, the
 * coverage list as zone rows beside the map, and the questions as an accordion.
 *
 * The route wins over `app/[...slug]` because a static segment outranks a
 * catch-all, and the slug is in `CUSTOM_ROUTES` so only one page is built.
 */

const SLUG = "motorcycle-valeting-detailing";

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

export default function MotorcyclePage() {
  const page = getPage(SLUG);
  if (!page) notFound();

  const faq = getFaq(SLUG);

  return (
    <>
      <JsonLd data={pageSchema(page)} />
      {faq && <JsonLd data={faqSchema(faq.items)} />}
      <Header />
      <main className="flex-1">
        <Hero />
        <Why />
        <Packages />
        <Extras />
        <Areas />
        {faq && <Faq faq={faq} />}
        <Cta />
      </main>
      <Footer />
    </>
  );
}

/** The four Q&As, as the source's own FAQ block would have emitted them. */
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

/* ── Hero ─────────────────────────────────────────────────────────────────
   No full-bleed photograph here: the site's one motorcycle image is a poster
   with its own title text baked in, so it is framed inside the booking card
   and cropped to the bike instead of being stretched behind the h1. The band
   itself carries the livery stripes and a gold glow, the way the CTA does. */

function Hero() {
  const { hero } = MOTORCYCLE;

  return (
    <section className="cut-bottom relative flex w-full items-center overflow-hidden bg-ink-panel pt-[150px] pb-[calc(var(--cut)+3.5rem)] lg:min-h-[640px] lg:pt-[210px]">
      <div aria-hidden className="livery absolute inset-0 opacity-70" />
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(72% 62% at 78% 38%, rgba(237,179,38,0.20) 0%, rgba(193,146,49,0.06) 44%, transparent 76%)",
        }}
      />
      <div
        aria-hidden
        className="absolute inset-x-0 bottom-0 h-2/5 bg-[linear-gradient(to_top,rgba(0,0,0,0.85),transparent)]"
      />

      <div className="shell relative z-10">
        <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-12">
          <div className="lg:col-span-7">
            <Reveal>
              <span className="hero-rule speed-rule" aria-hidden />
            </Reveal>

            <Reveal delay={1}>
              <h1 className="mt-7 max-w-[18ch] text-[clamp(30px,4.9vw,54px)] leading-[1.0] text-white">
                {MOTORCYCLE.h1}
              </h1>
            </Reveal>

            <Reveal delay={3}>
              <p
                className="mt-5 max-w-[62ch] text-[16px] leading-[27px] font-normal text-white/80 [&_strong]:font-semibold [&_strong]:text-white lg:text-[17px]"
                dangerouslySetInnerHTML={{ __html: MOTORCYCLE.introHtml }}
              />
            </Reveal>
          </div>

          {/* Booking card — the bike, then the entry price, then the ask. */}
          <Reveal delay={5} className="lg:col-span-5 lg:justify-self-end">
            <div className="surface w-full max-w-[440px] overflow-hidden">
              <div className="relative aspect-[16/9] w-full">
                <Image
                  src={hero.image.src}
                  alt={hero.image.alt}
                  fill
                  priority
                  sizes="(min-width: 1024px) 440px, 100vw"
                  className="object-cover object-[50%_46%]"
                />
                <div
                  aria-hidden
                  className="absolute inset-x-0 bottom-0 h-1/2 bg-[linear-gradient(to_top,rgba(13,13,13,0.95),transparent)]"
                />
              </div>

              <div className="p-7 pt-5 lg:p-8 lg:pt-6">
                <p className="font-[family-name:var(--font-ui)] text-[11px] tracking-[0.18em] text-white/55 uppercase">
                  Bike wash packages
                </p>
                <p className="mt-3 flex items-baseline gap-2">
                  <span className="text-[14px] font-normal text-white/60">from</span>
                  <span className="font-[family-name:var(--font-display)] text-[44px] leading-none text-gold lg:text-[52px]">
                    {MOTORCYCLE.packages.items[0].price}
                  </span>
                </p>
                <span aria-hidden className="my-6 block h-px w-full bg-white/10" />

                <a
                  href={MOTORCYCLE.book}
                  className="btn btn-gold w-full rounded-full text-[15px]"
                >
                  Book Now
                  <Icon name="arrow" size={18} className="ml-2.5" />
                </a>
                <a
                  href={`tel:${MOTORCYCLE.phone}`}
                  className="btn btn-outline mt-3 w-full rounded-full"
                >
                  <Icon name="phone" size={16} className="mr-2.5" />
                  {MOTORCYCLE.phone}
                </a>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/* ── Why choose ───────────────────────────────────────────────────────────
   Five reasons. Read as a stack of h3-and-paragraph pairs they were five
   headings deep before the first price; as tiles they are one glance. The
   fifth spans two columns on the three-up grid so the row closes square. */

function Why() {
  return (
    <section className="w-full py-16 lg:py-[104px]">
      <div className="shell">
        <SectionHead title={MOTORCYCLE.why.heading} />

        <ul className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-6">
          {MOTORCYCLE.why.items.map((w, i) => (
            <Reveal
              as="li"
              key={w.title}
              delay={i}
              className={`surface group relative overflow-hidden p-7 lg:col-span-2 ${
                i === 3 ? "lg:col-start-2" : ""
              }`}
            >
              <span className="flex h-[52px] w-[52px] items-center justify-center rounded-full bg-gold/12 ring-1 ring-gold/35">
                <Icon name={w.icon as IconName} size={24} className="text-gold" />
              </span>
              <h3 className="mt-6 text-[19px] leading-snug font-semibold text-white">
                {w.title}
              </h3>
              <p className="mt-3 text-[15px] leading-[25px] font-normal text-body">{w.body}</p>
              <span
                aria-hidden
                className="absolute inset-x-0 bottom-0 h-[3px] origin-left scale-x-0 bg-gold transition-transform duration-500 ease-[var(--ease-out-expo)] group-hover:scale-x-100"
              />
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}

/* ── Packages ─────────────────────────────────────────────────────────────
   The page's reason for existing, and the thing the extracted version buried:
   three tiers, three prices, each list a spec sheet rather than loose copy.
   Dream Wash carries the source's own POPULAR flag and the page's gold. */

function Packages() {
  const { packages } = MOTORCYCLE;

  return (
    <section id="packages" className="w-full bg-black py-16 lg:py-[104px]">
      <div className="shell">
        <SectionHead title={packages.heading} lede={packages.lede} />

        <ul className="mt-12 grid items-start gap-5 lg:grid-cols-3 lg:gap-6">
          {packages.items.map((p, i) => {
            const featured = Boolean(p.badge);
            return (
              <Reveal
                as="li"
                key={p.name}
                delay={i}
                className={`relative flex h-full flex-col overflow-hidden rounded-[14px] ${
                  featured
                    ? // No `.livery` here: gold stripes on a gold band are
                      // invisible, and its background-image would win over the
                      // wash's gradient and flatten the card.
                      "bg-gold-wash text-ink shadow-[0_28px_60px_-30px_rgba(193,146,49,0.75)] lg:-mt-4"
                    : "surface"
                }`}
              >
                <div className="p-7 lg:p-8">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3
                        className={`font-[family-name:var(--font-sub)] text-[24px] leading-tight uppercase ${
                          featured ? "text-ink" : "text-white"
                        }`}
                      >
                        {p.name}
                      </h3>
                      <p
                        className={`mt-1.5 text-[14px] font-normal ${
                          featured ? "text-ink/70" : "text-white/55"
                        }`}
                      >
                        {p.tagline}
                      </p>
                    </div>
                    {p.badge && (
                      <span className="shrink-0 rounded-full bg-ink px-3 py-1.5 font-[family-name:var(--font-ui)] text-[10px] font-semibold tracking-[0.14em] text-gold uppercase">
                        {p.badge}
                      </span>
                    )}
                  </div>

                  <p className="mt-6 flex items-baseline gap-2">
                    <span
                      className={`font-[family-name:var(--font-display)] text-[42px] leading-none lg:text-[48px] ${
                        featured ? "text-ink" : "text-gold"
                      }`}
                    >
                      {p.price}
                    </span>
                    <span
                      className={`text-[13px] font-normal ${
                        featured ? "text-ink/65" : "text-white/50"
                      }`}
                    >
                      {packages.note}
                    </span>
                  </p>

                  <a
                    href={MOTORCYCLE.book}
                    className={`btn mt-7 w-full rounded-full text-[14px] ${
                      featured ? "btn-dark" : "btn-gold"
                    }`}
                  >
                    Book Now
                    <Icon name="arrow" size={17} className="ml-2.5" />
                  </a>
                </div>

                <span
                  aria-hidden
                  className={`block h-px w-full ${featured ? "bg-ink/15" : "bg-white/10"}`}
                />

                <ul className="flex flex-col gap-3 p-7 lg:p-8">
                  {p.features.map((f) => (
                    <li
                      key={f}
                      className={`flex gap-3 text-[15px] leading-[23px] font-normal ${
                        featured ? "text-ink/85" : "text-body"
                      }`}
                    >
                      <Icon
                        name="check"
                        size={16}
                        strokeWidth={2.4}
                        className={`mt-[3px] shrink-0 ${featured ? "text-ink" : "text-gold"}`}
                      />
                      {f}
                    </li>
                  ))}
                </ul>
              </Reveal>
            );
          })}
        </ul>
      </div>
    </section>
  );
}

/* ── Extras ───────────────────────────────────────────────────────────────
   Twenty-five add-ons. As the extractor left them they were fifty paragraphs
   with the price column missing entirely; here they are the price list they
   always were, in the same order. */

function Extras() {
  return (
    <section className="w-full py-16 lg:py-[104px]">
      <div className="shell">
        <SectionHead title={MOTORCYCLE.extras.heading} lede={MOTORCYCLE.extras.lede} />

        {/*
          One list in the source's order, split into columns only so twenty-five
          rows do not run 2,000px down the page. Nothing is renamed or grouped.
        */}
        <ul className="mt-11 grid gap-x-6 lg:grid-cols-2 lg:gap-x-14">
          {MOTORCYCLE.extras.items.map((x) => (
            <ExtraRow key={x.name} item={x} />
          ))}
        </ul>
      </div>
    </section>
  );
}

function ExtraRow({ item }: { item: Extra }) {
  return (
    <li className="flex items-baseline justify-between gap-4 border-t border-white/[0.07] py-3.5 first:border-t-0 first:pt-0">
      <span className="min-w-0">
        <span className="block text-[15px] leading-[22px] font-semibold text-white">
          {item.name}
        </span>
        {item.note && (
          <span className="mt-1 block text-[13px] leading-[19px] font-normal text-white/55">
            {item.note}
          </span>
        )}
      </span>
      <span className="shrink-0 font-[family-name:var(--font-sub)] text-[17px] whitespace-nowrap text-gold tabular-nums">
        {item.price}
      </span>
    </li>
  );
}

/* ── Coverage ─────────────────────────────────────────────────────────────
   The zone list read as six bracketed run-on lines. Split at the bracket it
   becomes a zone and the boroughs under it, next to the map the source
   embedded but the renderer left floating above the heading. */

function Areas() {
  const { areas } = MOTORCYCLE;

  return (
    <section className="w-full border-t border-white/[0.07] py-16 lg:py-[104px]">
      <div className="shell grid gap-12 lg:grid-cols-12 lg:gap-16">
        <div className="lg:col-span-6">
          <SectionHead title={areas.heading} />

          <Reveal delay={3}>
            <p
              className="mt-6 max-w-[62ch] text-[16px] leading-[27px] font-normal text-body [&_strong]:font-semibold [&_strong]:text-white"
              dangerouslySetInnerHTML={{ __html: areas.introHtml }}
            />
          </Reveal>

          <ul className="mt-8 grid gap-x-8 gap-y-5 sm:grid-cols-2">
            {areas.zones.map((z, i) => (
              <Reveal as="li" key={z.zone} delay={i}>
                <p className="flex items-center gap-2.5 text-[15.5px] leading-snug font-semibold text-white">
                  <Icon name="pin" size={16} className="shrink-0 text-gold" />
                  {z.zone}
                </p>
                <p className="mt-1.5 pl-[26px] text-[14px] leading-[21px] font-normal text-white/60">
                  {z.places}
                </p>
              </Reveal>
            ))}
          </ul>

          <Reveal delay={2}>
            <p
              className="mt-8 max-w-[62ch] text-[15.5px] leading-[26px] font-normal text-white/70 [&_strong]:font-semibold [&_strong]:text-white"
              dangerouslySetInnerHTML={{ __html: areas.outroHtml }}
            />
          </Reveal>
        </div>

        <Reveal delay={1} className="lg:col-span-6">
          <div className="h-full overflow-hidden rounded-[14px] ring-1 ring-white/[0.08]">
            <iframe
              src={areas.map.src}
              title={areas.map.title}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              allowFullScreen
              className="h-full min-h-[380px] w-full border-0 lg:min-h-[520px]"
            />
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ── FAQ ──────────────────────────────────────────────────────────────────
   Four questions the extractor dropped on the floor, back under the heading
   that was left standing on its own. */

function Faq({ faq }: { faq: NonNullable<ReturnType<typeof getFaq>> }) {
  return (
    <section className="w-full py-16 lg:py-[104px]">
      <div className="shell grid gap-10 lg:grid-cols-12 lg:gap-16">
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

/* ── Closing ask ──────────────────────────────────────────────────────────
   The source's booking section, given the diagonal edge and the gold glow so
   the page closes on a beat rather than trailing off. */

function Cta() {
  return (
    <section className="cut-top relative w-full overflow-hidden bg-ink-panel pt-[calc(var(--cut)+4rem)] pb-16 lg:pb-[104px]">
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(80% 100% at 50% 0%, rgba(193,146,49,0.16) 0%, transparent 62%)",
        }}
      />
      <div className="shell relative flex flex-col items-center text-center">
        <SectionHead title={MOTORCYCLE.cta.heading} align="center" />
        <Reveal>
          <p
            className="measure mt-6 text-[16px] leading-[27px] font-normal text-body [&_strong]:font-semibold [&_strong]:text-white"
            dangerouslySetInnerHTML={{ __html: MOTORCYCLE.cta.bodyHtml }}
          />
        </Reveal>
        <Reveal delay={1} className="w-full sm:w-auto">
          <div className="mt-10 flex flex-col items-stretch gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-center">
            <a href={MOTORCYCLE.book} className="btn btn-gold w-full rounded-full text-[15px] sm:w-auto">
              Book Now
              <Icon name="arrow" size={18} className="ml-2.5" />
            </a>
            <a href={`tel:${MOTORCYCLE.phone}`} className="btn btn-outline w-full rounded-full sm:w-auto">
              <Icon name="phone" size={16} className="mr-2.5" />
              {MOTORCYCLE.phone}
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
