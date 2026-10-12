import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Fragment } from "react";
import FaqAccordion from "@/components/FaqAccordion";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import Icon, { type IconName } from "@/components/Icon";
import JsonLd from "@/components/JsonLd";
import Reveal from "@/components/Reveal";
import SectionHead from "@/components/SectionHead";
import StickyBookBar from "@/components/StickyBookBar";
import TrackClicks from "@/components/TrackClicks";
import Testimonials from "@/components/sections/Testimonials";
import { getPage } from "@/lib/blocks";
import { LINKS, PATH, PHOTOS, SLUG, TRACK, VALETS, WAX } from "@/lib/car-wax";
import { pageSchema } from "@/lib/schema";

/**
 * Car wax service — rebuilt from the client's brief.
 *
 * Client, 2026-10-06: "Completely replace/re-optimise the existing Car Wax
 * Service page using the content below. KEEP EXISTING URL". Every word of the
 * brief's sections is in `lib/car-wax.ts`; this file is only layout. The order
 * is the brief's "ELEMENTOR PAGE STRUCTURE", item by item, with the sections
 * that list leaves out (5, 6, 8, 10, 12, 16, 17) where the copy puts them:
 *
 *   1 hero · the add-on bar · 2 benefits · 3 how it works · 4 what's
 *   included · 5 why wax after valeting · 6 what wax does · 7 what it does
 *   not do · 8 wax vs machine polishing · 9 wax vs ceramic · 10 the wax used
 *   · 12 how long it lasts · 14 pricing · 15 eligible valets · 16 who it is
 *   for, with 17 pre-sale beside it · 13 maintenance · 18 why Medusa ·
 *   19 reviews · 20 FAQ · 21 service information · 22 the closing band.
 *
 * Maintenance (13) follows the eligible valets because the structure lists it
 * there ("10 — ELIGIBLE VALETS · 11 — MAINTENANCE · 12 — WHY MEDUSA"). Who it
 * is for and pre-sale share a band — the second is one case of the first —
 * which is what lets gold and ink alternate the whole way down (client,
 * 2026-09-22: "pastikan warna bg tetap selang seling") and end on the gold
 * service information over the ink close. Section 11, the finish gallery, is
 * not here: "Use genuine Medusa photographs showing freshly waxed vehicles",
 * and none exists yet.
 *
 * What decided the shape is the brief's first instruction: the service is "AN
 * ADD-ON TO MEDUSA VALETING SERVICES … NOT intended to be booked as a
 * standalone £40 mobile appointment … This needs to be obvious throughout the
 * page". So the h1 is followed by the four things a customer "should
 * immediately understand" as one panel — from +£40, an add-on, not a
 * standalone appointment, not paint correction — with the first view's
 * "GLOSS • PROTECTION • PROFESSIONAL FINISH" and both buttons under it, above
 * the fold on a 375x812 phone; the add-on bar sits straight under the hero, as
 * the structure asks. No button sells wax on its own: every booking button
 * books a valet with the wax, and the phone's sticky bar reads "Book Valet +
 * Wax" — "Not: BOOK £40 WAX".
 *
 * The route wins over `app/[...slug]` because a static segment outranks a
 * catch-all; the slug has to be in `CUSTOM_ROUTES` so only one page is built.
 */

const BOOK = WAX.book;
const WHATSAPP = WAX.whatsapp;

export function generateMetadata(): Metadata {
  const { title, description } = WAX.seo;
  return {
    title,
    description,
    alternates: { canonical: PATH },
    openGraph: {
      title,
      description,
      url: PATH,
      images: [{ url: PHOTOS.hero.src, width: PHOTOS.hero.w, height: PHOTOS.hero.h, alt: PHOTOS.hero.alt }],
    },
  };
}

export default function CarWaxServicePage() {
  const page = getPage(SLUG);
  if (!page) notFound();

  return (
    <>
      {/* "STRUCTURED DATA — Service schema … Service name: Mobile Car Wax
          Service. Area served: London. Do not add unsupported ratings/reviews
          to structured data." */}
      <JsonLd
        data={pageSchema(page, {
          service: {
            slug: SLUG,
            name: "Mobile Car Wax Service",
            serviceType: "Car waxing",
            description: WAX.seo.description,
            image: PHOTOS.hero.src,
            /* An add-on to an eligible valet, never a standalone £40 service. */
            offer: {
              price: "40",
              currency: "GBP",
              description: WAX.hero.card.note,
              requires: true,
            },
          },
          faq: WAX.faq.items,
        })}
      />
      <TrackClicks />

      <Header />
      <main className="flex-1">
        <Hero />
        <AddOnBar />
        <Benefits />
        <HowItWorks />
        <Included />
        <AfterValet />
        <WhatWaxDoes />
        <NotCorrection />
        <VsPolishing />
        <VsCeramic />
        <Product />
        <HowLong />
        <Pricing />
        <EligibleValets />
        <WhoFor />
        <Maintenance />
        <WhyMedusa />
        <Testimonials title={WAX.reviews.heading} />
        <Faq />
        <ServiceInfo />
        <FinalCta />
      </main>
      <Footer />

      {/* "MOBILE STICKY CTA — Use: BOOK VALET + WAX". */}
      <StickyBookBar
        primary={{ label: WAX.stickyLabel, href: BOOK, track: TRACK.book }}
        after="wax-hero-actions"
        hideOver={["wax-final"]}
      />
    </>
  );
}

/* ── Shared pieces ──────────────────────────────────────────────────────── */

function BookButton({
  label,
  tone = "gold",
  inCard,
  className = "",
}: {
  label: string;
  tone?: "gold" | "dark";
  /** At the foot of a card, where a long label has to wrap rather than run
   *  past the button's edge. */
  inCard?: boolean;
  className?: string;
}) {
  return (
    <a
      href={BOOK}
      data-track={TRACK.book}
      className={`btn ${tone === "gold" ? "btn-gold" : "btn-dark"} min-h-[52px] rounded-full px-5 text-center text-[14px] ${
        inCard ? "py-3 leading-[18px]" : "sm:px-7 sm:text-[15px] sm:whitespace-nowrap"
      } ${className}`}
    >
      {label}
      <Icon name="arrow" size={18} className="ml-2.5 shrink-0" />
    </a>
  );
}

const ON_GOLD_OUTLINE =
  "text-ink shadow-[inset_0_0_0_2px_rgb(0_0_0/0.8)] hover:-translate-y-0.5 hover:bg-ink hover:text-white";

function WhatsAppButton({ label, className = "" }: { label: string; className?: string }) {
  return (
    <a
      href={WHATSAPP}
      target="_blank"
      rel="noopener noreferrer"
      className={`btn btn-outline min-h-[52px] rounded-full px-5 text-[14px] sm:px-7 sm:text-[15px] sm:whitespace-nowrap ${className}`}
    >
      <Icon name="whatsapp" size={19} className="mr-2.5 shrink-0" />
      {label}
    </a>
  );
}

/** A link to another of the site's pages, set as the secondary button — it
 *  views a service, it does not book one. */
function PageButton({
  href,
  label,
  onGold,
  inCard,
  className = "",
}: {
  href: string;
  label: string;
  onGold?: boolean;
  inCard?: boolean;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={`btn min-h-[52px] rounded-full px-5 text-center text-[14px] ${
        inCard ? "py-3 leading-[18px]" : "sm:px-7 sm:text-[15px] sm:whitespace-nowrap"
      } ${onGold ? ON_GOLD_OUTLINE : "btn-outline"} ${className}`}
    >
      {label}
      <Icon name="arrow" size={18} className="ml-2.5 shrink-0" />
    </Link>
  );
}

/* The brief gives every section a name and then a heading — "WHAT CAR WAX
   DOES NOT DO" over "Wax Is Protection — Not Paint Correction". The name is
   the h2, as on the other rebuilt pages; the heading is the line under it, in
   the condensed face. */
function Kicker({ children, onGold }: { children: React.ReactNode; onGold?: boolean }) {
  return (
    <Reveal delay={2}>
      <h3
        className={`mt-5 font-[family-name:var(--font-sub)] text-[19px] leading-[1.25] font-semibold tracking-[0.02em] uppercase lg:text-[23px] ${
          onGold ? "text-ink" : "text-gold"
        }`}
      >
        {typeof children === "string" ? <KeepHyphens text={children} /> : children}
      </h3>
    </Reveal>
  );
}

/* `SectionHead`'s own markup, for the one section name with a hyphen in it:
   "WHO IS THIS ADD-ON FOR?" broke after "ADD-" on a 320px phone, and the
   shared component takes its title as a plain string. */
function HyphenatedHead({ title }: { title: string }) {
  return (
    <div>
      <Reveal>
        <span aria-hidden className="block h-[3px] w-[52px] rounded-full bg-gold" />
      </Reveal>
      <Reveal delay={1}>
        <h2 className="mt-6 text-[30px] leading-[1.02] text-white sm:text-[40px] lg:text-[50px]">
          <KeepHyphens text={title} />
        </h2>
      </Reveal>
    </div>
  );
}

/** Copy the brief sets partly in bold, or with a link laid on its words. */
function Prose({
  html,
  onGold,
  space = "mt-4",
  className = "",
}: {
  html: string;
  onGold?: boolean;
  /** The margin above — one class, so a caller's never fights the default. */
  space?: string;
  className?: string;
}) {
  return (
    <p
      className={`measure ${space} text-[16px] leading-[27px] font-normal ${
        onGold
          ? "text-ink/80 [&_a]:font-semibold [&_a]:underline [&_strong]:font-semibold [&_strong]:text-ink"
          : "text-body [&_a]:text-gold [&_a]:underline [&_a]:underline-offset-2 [&_strong]:font-semibold [&_strong]:text-white"
      } ${className}`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

/** A lead line — the sentence a section opens its argument on. */
function Lead({ children, onGold, className = "" }: { children: React.ReactNode; onGold?: boolean; className?: string }) {
  return (
    <p
      className={`measure mt-5 text-[18px] leading-[28px] font-semibold ${onGold ? "text-ink" : "text-white"} ${className}`}
    >
      {children}
    </p>
  );
}

function Tick({ size = 20 }: { size?: number }) {
  return (
    <span
      className="flex shrink-0 items-center justify-center rounded-full bg-gold/15 text-gold"
      style={{ width: size, height: size }}
    >
      <Icon name="check" size={Math.round(size * 0.6)} strokeWidth={2.8} />
    </span>
  );
}

/* One mark the set does not have: a wax applicator — a foam puck over the arcs
   it works in. Same grid and stroke as `Icon`; listed in the handoff so it can
   join the shared set. */
function WaxGlyph({ size = 20, className, strokeWidth = 1.75 }: { size?: number; className?: string; strokeWidth?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
      focusable="false"
    >
      <ellipse cx="12" cy="7.5" rx="6.5" ry="2.5" />
      <path d="M5.5 7.5v2.6c0 1.4 2.9 2.5 6.5 2.5s6.5-1.1 6.5-2.5V7.5" />
      <path d="M3.5 17.4c2.6 1.8 5.4 2.6 8.5 2.6s5.9-.8 8.5-2.6" />
      <path d="M7 15.5c1.6.7 3.2 1 5 1s3.4-.3 5-1" />
    </svg>
  );
}

type GlyphName = IconName | "wax";

function Glyph({
  name,
  size = 20,
  strokeWidth,
  className,
}: {
  name: GlyphName;
  size?: number;
  strokeWidth?: number;
  className?: string;
}) {
  return name === "wax" ? (
    <WaxGlyph size={size} strokeWidth={strokeWidth} className={className} />
  ) : (
    <Icon name={name} size={size} strokeWidth={strokeWidth} className={className} />
  );
}

function IconDisc({ name, size = 46, solid }: { name: GlyphName; size?: number; solid?: boolean }) {
  return (
    <span
      className={`flex shrink-0 items-center justify-center rounded-full ${
        solid ? "bg-gold text-ink" : "bg-gold/12 text-gold ring-1 ring-gold/35"
      }`}
      style={{ width: size, height: size }}
    >
      <Glyph name={name} size={Math.round(size * 0.46)} />
    </span>
  );
}

/** The thin gold rule that draws in under a card on hover, as elsewhere. */
function HoverRule() {
  return (
    <span
      aria-hidden
      className="absolute inset-x-0 bottom-0 h-[3px] origin-left scale-x-0 bg-gold transition-transform duration-500 ease-[var(--ease-out-expo)] group-hover:scale-x-100"
    />
  );
}

function Label({ children, onGold, className = "" }: { children: React.ReactNode; onGold?: boolean; className?: string }) {
  return (
    <p
      className={`font-[family-name:var(--font-ui)] text-[11.5px] font-semibold tracking-[0.2em] uppercase ${
        onGold ? "text-ink/70" : "text-gold"
      } ${className}`}
    >
      {children}
    </p>
  );
}

/** Keeps a hyphenated word — "Add-On" — from breaking at its hyphen. */
function KeepHyphens({ text }: { text: string }) {
  return (
    <>
      {text.split(/(\S+-\S+)/).map((part, i) =>
        i % 2 ? (
          <span key={i} className="whitespace-nowrap">
            {part}
          </span>
        ) : (
          part
        ),
      )}
    </>
  );
}

/** "CLEAN ↓ PREPARE ↓ WAX ↓ FINISH" — the stages the brief draws, top to
 *  bottom, each with its mark. The wax stage is the gold one. */
const STAGE_ICONS: Record<string, GlyphName> = {
  "Choose Valet": "calendar",
  Clean: "droplet",
  Prepare: "search",
  Wax: "wax",
  Finish: "spark",
  Protect: "shield",
};

function StageColumn({ stages, compact }: { stages: string[]; compact?: boolean }) {
  return (
    <ol className="flex flex-col">
      {stages.map((stage, i) => {
        const wax = stage === "Wax";
        const last = i === stages.length - 1;
        return (
          <li key={stage} className="flex flex-col items-start">
            <span
              className={`flex w-full items-center gap-3.5 rounded-[12px] ${compact ? "px-3.5 py-2.5" : "px-4 py-3.5"} ${
                wax ? "bg-gold text-ink" : "bg-white/[0.04] text-white ring-1 ring-white/[0.08]"
              }`}
            >
              <span
                className={`flex shrink-0 items-center justify-center rounded-full ${compact ? "h-8 w-8" : "h-10 w-10"} ${
                  wax ? "bg-ink text-gold" : "bg-gold/12 text-gold ring-1 ring-gold/35"
                }`}
              >
                <Glyph name={STAGE_ICONS[stage] ?? "check"} size={compact ? 16 : 19} />
              </span>
              <strong
                className={`font-[family-name:var(--font-sub)] leading-none font-semibold tracking-[0.06em] uppercase ${
                  compact ? "text-[16px]" : "text-[19px]"
                }`}
              >
                {stage}
              </strong>
            </span>
            {!last && (
              <span aria-hidden className={`flex ${compact ? "h-5 pl-[23px]" : "h-6 pl-[29px]"} items-center text-gold`}>
                <Icon name="arrow" size={14} strokeWidth={2.2} className="rotate-90" />
              </span>
            )}
          </li>
        );
      })}
    </ol>
  );
}

/* ── 1. Hero ──────────────────────────────────────────────────────────────
   "First mobile/desktop view must show: CAR WAX SERVICE LONDON · FROM £40 ·
   ADD-ON TO YOUR VALET · GLOSS • PROTECTION • PROFESSIONAL FINISH · [BOOK
   VALET + WAX]". The h1, then the panel of the four points, then the two
   buttons Section 1 names. Section 1's own card — "FROM £40 · ADD-ON TO
   ELIGIBLE MEDUSA VALETING SERVICES", its six ticks and its IMPORTANT line —
   sits beside them from `lg`, beside its photograph on a tablet and under
   them on a phone. */

function Hero() {
  const h = WAX.hero;
  const pts = WAX.points;
  const [upgrade, premium] = h.intro;
  const conditions: { text: string; icon: IconName }[] = [
    { text: pts.standalone, icon: "info" },
    { text: pts.scratches, icon: "close" },
  ];

  return (
    <section className="cut-bottom relative w-full overflow-hidden bg-ink-panel pt-[124px] pb-[calc(var(--cut)+2.75rem)] lg:pt-[158px] lg:pb-[calc(var(--cut)+4rem)]">
      <div aria-hidden className="livery absolute inset-0 opacity-60" />
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(58% 70% at 80% 40%, rgba(237,179,38,0.15) 0%, rgba(193,146,49,0.05) 46%, transparent 76%)",
        }}
      />

      <div className="shell relative z-10">
        <div className="grid items-center gap-10 lg:grid-cols-12 lg:gap-12 xl:gap-16">
          <div className="lg:col-span-7">
            <Reveal className="hidden sm:block">
              <span className="hero-rule speed-rule" aria-hidden />
            </Reveal>

            <Reveal delay={1}>
              <h1 className="max-w-[18ch] text-[clamp(31px,4.4vw,60px)] leading-[1.0] text-white sm:mt-7 lg:mt-6">
                {h.h1}
              </h1>
            </Reveal>

            <Reveal delay={2}>
              <h2 className="mt-3.5 max-w-[40ch] font-[family-name:var(--font-sub)] text-[16.5px] leading-[1.3] font-semibold tracking-[0.03em] text-gold sm:text-[19px] xl:mt-5 xl:text-[21px]">
                {h.title}
              </h2>
            </Reveal>

            {/* The four points. */}
            <Reveal delay={3}>
              <div className="mt-6 max-w-[640px] overflow-hidden rounded-[14px] bg-white/[0.04] ring-1 ring-gold/35 xl:mt-8">
                <div className="flex flex-col sm:flex-row">
                  {/* "From" over the figure from `sm`, so the cell is only as
                      wide as "+£40". */}
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 bg-gold/[0.1] px-5 py-3.5 sm:shrink-0 sm:flex-col sm:flex-nowrap sm:items-start sm:justify-center sm:gap-2 sm:px-6 sm:py-5">
                    <p className="flex shrink-0 items-baseline gap-2 whitespace-nowrap sm:flex-col sm:items-start sm:gap-1.5">
                      <span className="font-[family-name:var(--font-ui)] text-[12px] font-semibold tracking-[0.16em] text-white/75 uppercase">
                        {pts.price.label}
                      </span>
                      <span className="font-[family-name:var(--font-display)] text-[44px] leading-[0.85] text-gold sm:text-[54px]">
                        {pts.price.value}
                      </span>
                    </p>
                    <p className="font-[family-name:var(--font-ui)] text-[11.5px] leading-[15px] font-semibold tracking-[0.14em] text-white/80 uppercase sm:max-w-[130px]">
                      <KeepHyphens text={pts.price.caption} />
                    </p>
                  </div>
                  <ul className="flex flex-1 flex-col justify-center gap-2.5 border-t border-gold/25 px-5 py-4 sm:border-t-0 sm:border-l sm:px-6">
                    {conditions.map((c) => (
                      <li
                        key={c.text}
                        className="flex items-center gap-3 text-[14px] leading-[19px] font-semibold text-white sm:text-[14.5px]"
                      >
                        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gold text-ink">
                          <Icon name={c.icon} size={15} strokeWidth={2.1} />
                        </span>
                        <span>{c.text}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                {/* "GLOSS • PROTECTION • PROFESSIONAL FINISH", bold in the
                    brief, across the panel's foot. */}
                <p className="flex flex-wrap items-center gap-x-2.5 gap-y-1 border-t border-gold/25 bg-gold/[0.06] px-5 py-3 font-[family-name:var(--font-ui)] text-[12px] leading-[16px] font-bold tracking-[0.16em] text-gold uppercase sm:px-6">
                  {pts.finish.map((f, i) => (
                    <Fragment key={f}>
                      {i > 0 && (
                        <span aria-hidden className="text-gold/50">
                          •
                        </span>
                      )}
                      <span className="whitespace-nowrap">{f}</span>
                    </Fragment>
                  ))}
                </p>
              </div>
            </Reveal>

            <Reveal delay={4}>
              <div id="wax-hero-actions" className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap xl:mt-8">
                <BookButton label={h.bookLabel} className="w-full sm:w-auto" />
                <WhatsAppButton label={h.whatsappLabel} className="w-full sm:w-auto" />
              </div>
            </Reveal>

            <Reveal delay={5}>
              <p className="mt-7 max-w-[58ch] text-[17px] leading-[26px] font-semibold text-white xl:mt-8">
                {h.question}
              </p>
              <p
                className="mt-2 max-w-[58ch] text-[16px] leading-[26px] font-normal text-white/75 xl:text-[17px] xl:leading-[28px] [&_strong]:font-semibold [&_strong]:text-white"
                dangerouslySetInnerHTML={{ __html: upgrade }}
              />
            </Reveal>
          </div>

          <Reveal delay={4} className="lg:col-span-5">
            <HeroCard />
          </Reveal>
        </div>

        <Reveal delay={5}>
          <p className="mt-10 max-w-[92ch] border-t border-white/10 pt-7 text-[15.5px] leading-[26px] font-normal text-white/70 lg:mt-12">
            {premium}
          </p>
        </Reveal>
      </div>
    </section>
  );
}

function HeroCard() {
  const c = WAX.hero.card;
  return (
    /* Photograph over the copy in the hero's column and on a phone; side by
       side on a tablet, where a stacked card ran a tall picture across the
       full width. */
    <figure className="surface relative overflow-hidden md:grid md:grid-cols-2 lg:block">
      <div className="relative aspect-[3/2] w-full md:aspect-auto md:min-h-[300px] lg:aspect-[3/2] lg:min-h-0">
        <Image
          src={PHOTOS.hero.src}
          alt={PHOTOS.hero.alt}
          fill
          priority
          sizes="(min-width: 1024px) 38vw, (min-width: 768px) 46vw, 92vw"
          className="object-cover object-[40%_60%]"
        />
        <div
          aria-hidden
          className="absolute inset-x-0 bottom-0 h-1/3 bg-[linear-gradient(to_top,rgba(13,13,13,0.85),transparent)]"
        />
        <span className="absolute top-4 right-4 rounded-full bg-gold px-4 py-2 font-[family-name:var(--font-ui)] text-[12px] font-bold tracking-[0.14em] whitespace-nowrap text-ink uppercase shadow-[0_10px_30px_-10px_rgba(0,0,0,0.7)]">
          {c.price}
        </span>
      </div>
      <figcaption className="p-5 sm:p-6">
        <h3 className="font-[family-name:var(--font-sub)] text-[18px] leading-tight tracking-[0.03em] text-white uppercase sm:text-[20px]">
          <KeepHyphens text={c.title} />
        </h3>
        <ul className="mt-4 grid gap-x-4 gap-y-2.5 sm:grid-cols-2 md:grid-cols-1 xl:grid-cols-2">
          {c.ticks.map((t) => (
            <li key={t} className="flex items-start gap-2.5 text-[14px] leading-[20px] font-semibold text-white/90">
              <span className="mt-px">
                <Tick size={18} />
              </span>
              {t}
            </li>
          ))}
        </ul>
        <div className="mt-5 rounded-[10px] bg-gold/[0.08] px-4 py-3.5 ring-1 ring-gold/30">
          <p className="flex items-center gap-2 font-[family-name:var(--font-ui)] text-[11px] font-semibold tracking-[0.2em] text-gold uppercase">
            <Icon name="info" size={15} className="shrink-0" />
            {c.important}
          </p>
          <p className="mt-1.5 text-[14px] leading-[21px] text-white">
            <strong className="font-semibold">{c.note}</strong>
          </p>
        </div>
      </figcaption>
    </figure>
  );
}

/* ── The add-on bar ───────────────────────────────────────────────────────
   "2 — IMPORTANT ADD-ON BAR. Immediately underneath hero: CAR WAX IS AN
   ADD-ON SERVICE — Choose an eligible Medusa valet first, then add premium
   wax from £40." A bar, as the structure calls it: the one gold band on the
   page that keeps the continuing-surface rhythm (`py-9 lg:py-12`) rather than
   a section's, so it reads as the hero's footnote rather than as a section of
   two lines. The band after it is ink, so the alternation holds. */

function AddOnBar() {
  const b = WAX.addOnBar;
  return (
    <section aria-labelledby="wax-add-on" className="w-full bg-gold-wash py-9 lg:py-12">
      <div className="shell">
        <Reveal>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-6">
            <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-ink text-gold">
              <Icon name="plus" size={26} strokeWidth={2.2} />
            </span>
            <div>
              <h2 id="wax-add-on" className="text-[25px] leading-[1.05] text-ink sm:text-[30px] lg:text-[36px]">
                <KeepHyphens text={b.heading} />
              </h2>
              <p className="mt-2 text-[16.5px] leading-[25px] text-ink sm:text-[18px] sm:leading-[27px]">
                <strong className="font-semibold">{b.body}</strong>
              </p>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ── 2. Want more than just a clean car? ──────────────────────────────────
   "3 — BENEFITS. Four visual cards: GLOSS · PROTECTION · WATER BEHAVIOUR ·
   FINISH." The copy writes five — Paint Depth is the fifth — and it is a card
   of its own rather than dropped: three over two from `lg`, five across from
   `xl`. The section's "ADD FROM £40" and its button close the band. */

const BENEFIT_ICONS: Record<string, GlyphName> = {
  Gloss: "spark",
  "Paint Depth": "layers",
  "Water Behaviour": "droplet",
  Protection: "shield",
  Finish: "star",
};

function Benefits() {
  const s = WAX.benefits;
  return (
    <section className="w-full py-16 lg:py-[104px]">
      <div className="shell">
        <div className="grid gap-6 lg:grid-cols-12 lg:items-end lg:gap-16">
          <div className="lg:col-span-7">
            <SectionHead title={s.heading} />
            <Kicker>{s.title}</Kicker>
          </div>
          <Reveal delay={3} className="lg:col-span-5">
            <Lead className="lg:mt-0">{s.body[0]}</Lead>
            <Prose html={s.body[1]} space="mt-2" />
          </Reveal>
        </div>

        <Reveal delay={1}>
          <Prose html={s.lead} space="mt-12" className="text-[17px]" />
        </Reveal>
        <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-6 lg:gap-5 xl:grid-cols-5">
          {s.items.map((it, i) => (
            <Reveal
              as="li"
              key={it.title}
              delay={i % 3}
              className={`surface group relative overflow-hidden p-6 sm:p-7 xl:p-6 ${i === 4 ? "sm:col-span-2" : ""} ${
                i < 3 ? "lg:col-span-2" : "lg:col-span-3"
              } xl:col-span-1`}
            >
              <div className="flex items-center gap-4 sm:block">
                <IconDisc name={BENEFIT_ICONS[it.title] ?? "check"} size={50} />
                <h3 className="font-[family-name:var(--font-sub)] text-[20px] leading-tight tracking-[0.02em] text-white uppercase sm:mt-6">
                  {it.title}
                </h3>
              </div>
              <p className="mt-3 text-[15px] leading-[24px] font-normal text-white/75">{it.body}</p>
              <HoverRule />
            </Reveal>
          ))}
        </ul>

        <Reveal delay={1}>
          <div className="mt-6 flex flex-col gap-5 rounded-[14px] bg-gold/[0.07] p-6 ring-1 ring-gold/40 sm:flex-row sm:items-center sm:justify-between sm:p-8 lg:mt-8">
            <p className="flex items-baseline gap-3 whitespace-nowrap">
              <span className="font-[family-name:var(--font-sub)] text-[20px] leading-none font-semibold tracking-[0.06em] text-white uppercase sm:text-[23px]">
                {s.price.label}
              </span>
              <span className="font-[family-name:var(--font-display)] text-[48px] leading-[0.8] text-gold sm:text-[58px]">
                {s.price.value}
              </span>
            </p>
            <BookButton label={s.bookLabel} className="w-full sm:w-auto" />
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ── 3. How it works ──────────────────────────────────────────────────────
   "4 — HOW IT WORKS. Visual: CHOOSE VALET ↓ CLEAN ↓ PREPARE ↓ WAX ↓ FINISH".
   That line is the band's picture, the wax the one gold stage; the copy's
   three steps follow it as cards joined by the brief's arrows — across from
   `lg`, down the page on a phone — the add-on step in ink with the option it
   selects set as the thing selected. "ONE APPOINTMENT. CLEANED + PROTECTED."
   closes the band beside its button. */

const STEP_ICONS: GlyphName[] = ["calendar", "plus", "van"];

function HowItWorks() {
  const s = WAX.how;
  return (
    <section id="how-it-works" className="w-full scroll-mt-24 bg-gold-wash py-16 lg:py-[104px]">
      <div className="shell">
        <SectionHead title={s.heading} tone="gold" />
        <Kicker onGold>{s.title}</Kicker>

        <Reveal delay={1}>
          <ol
            aria-hidden
            className="mt-10 flex flex-wrap items-center gap-x-2 gap-y-2.5 rounded-[14px] bg-ink px-4 py-4 sm:px-5 lg:grid lg:grid-cols-5 lg:gap-x-2 lg:p-3"
          >
            {s.flow.map((stage, i) => {
              const wax = stage === "Wax";
              return (
                <li key={stage} className="flex items-center gap-2">
                  <span
                    className={`inline-flex items-center gap-2 rounded-full px-3.5 py-2 font-[family-name:var(--font-sub)] text-[14px] leading-none font-semibold tracking-[0.05em] whitespace-nowrap uppercase lg:flex-1 lg:justify-center lg:rounded-[10px] lg:py-3.5 lg:text-[15px] ${
                      wax ? "bg-gold text-ink" : "bg-white/[0.05] text-white ring-1 ring-white/10"
                    }`}
                  >
                    <Glyph name={STAGE_ICONS[stage] ?? "check"} size={16} className={wax ? "" : "text-gold"} />
                    {stage}
                  </span>
                  {i < s.flow.length - 1 && <Icon name="arrow" size={15} className="shrink-0 text-gold/70" />}
                </li>
              );
            })}
          </ol>
        </Reveal>

        <ol className="mt-12 grid gap-10 lg:grid-cols-3 lg:gap-8">
          {s.steps.map((step, i) => {
            const addOn = i === 1;
            const last = i === s.steps.length - 1;
            return (
              <Reveal
                as="li"
                key={step.title}
                delay={i}
                className={`relative flex flex-col p-6 sm:p-7 ${
                  addOn
                    ? "rounded-[14px] bg-ink shadow-[0_24px_50px_-24px_rgba(0,0,0,0.7)] ring-2 ring-gold-bright/70"
                    : "surface-on-gold"
                }`}
              >
                <div className="flex items-center justify-between gap-4">
                  <IconDisc name={STEP_ICONS[i]} size={50} solid={addOn} />
                  <span className="font-[family-name:var(--font-ui)] text-[11.5px] font-semibold tracking-[0.2em] text-gold uppercase">
                    Step {i + 1}
                  </span>
                </div>
                <h3 className="mt-6 font-[family-name:var(--font-sub)] text-[21px] leading-tight tracking-[0.02em] text-white uppercase sm:text-[22px]">
                  {step.title}
                </h3>
                {step.before && (
                  <p className="mt-2.5 text-[15px] leading-[24px] font-normal text-white/75">{step.before}</p>
                )}
                {step.pick && (
                  <p className="mt-2.5 flex items-center gap-2.5 self-start rounded-[10px] bg-gold/[0.1] px-3.5 py-2.5 font-[family-name:var(--font-sub)] text-[16px] leading-[1.2] font-semibold tracking-[0.03em] text-gold uppercase ring-1 ring-gold/45">
                    <Icon name="plus" size={16} strokeWidth={2.2} className="shrink-0" />
                    {step.pick}
                  </p>
                )}
                <p className="mt-2.5 text-[15px] leading-[24px] font-normal text-white/75">{step.body}</p>

                {/* The brief's arrow, between this step and the next. */}
                {!last && (
                  <span
                    aria-hidden
                    className="absolute -bottom-[34px] left-1/2 z-10 flex h-9 w-9 -translate-x-1/2 rotate-90 items-center justify-center rounded-full bg-ink text-gold ring-4 ring-gold lg:top-1/2 lg:-right-[34px] lg:bottom-auto lg:left-auto lg:translate-x-0 lg:-translate-y-1/2 lg:rotate-0"
                  >
                    <Icon name="arrow" size={17} strokeWidth={2.2} />
                  </span>
                )}
              </Reveal>
            );
          })}
        </ol>

        <Reveal delay={2}>
          <div className="mt-12 flex flex-col gap-6 rounded-[14px] bg-ink p-6 ring-1 ring-gold/40 sm:p-8 lg:flex-row lg:items-center lg:justify-between lg:gap-10 lg:p-10">
            <p className="font-[family-name:var(--font-heading)] text-[24px] leading-[1.05] font-black text-gold uppercase min-[400px]:text-[27px] sm:text-[34px] lg:text-[38px]">
              {/* Two sentences; from `sm` neither breaks, so "+ PROTECTED"
                  never starts a line on its own. */}
              {s.statement.split(/(?<=\.)\s+/).map((part, i) => (
                <Fragment key={part}>
                  {i > 0 && " "}
                  <span className="sm:whitespace-nowrap">{part}</span>
                </Fragment>
              ))}
            </p>
            <BookButton label={s.bookLabel} className="w-full shrink-0 sm:w-auto" />
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ── 4. What's included? ──────────────────────────────────────────────────
   "5 — WHAT'S INCLUDED. Short visual checklist." The five as one ticked list,
   each line its title and sentence, beside the old page's own photograph of a
   technician at the paint, with the price and its button under it. */

const INCLUDED_ICONS: Record<string, GlyphName> = {
  "Paintwork Assessment": "eye",
  "Appropriate Paintwork Preparation": "droplet",
  "Premium Wax Application": "wax",
  "Buffing & Finishing": "refresh",
  "Final Inspection": "check",
};

function Included() {
  const s = WAX.included;
  return (
    <section className="w-full py-16 lg:py-[104px]">
      <div className="shell grid gap-12 lg:grid-cols-12 lg:items-center lg:gap-16">
        <div className="lg:col-span-7">
          <SectionHead title={s.heading} />
          <Kicker>{s.title}</Kicker>
          <Reveal delay={3}>
            <Lead>{s.lead}</Lead>
          </Reveal>
          <Reveal delay={2}>
            <ul className="surface mt-6 divide-y divide-white/[0.07] px-5 sm:px-7">
              {s.items.map((it) => (
                <li key={it.title} className="flex gap-4 py-4 sm:py-5">
                  <IconDisc name={INCLUDED_ICONS[it.title] ?? "check"} size={42} />
                  <div className="min-w-0">
                    <h4 className="font-[family-name:var(--font-sub)] text-[18px] leading-tight tracking-[0.02em] text-white uppercase sm:text-[19px]">
                      {it.title}
                    </h4>
                    <p className="mt-1.5 text-[15px] leading-[23px] font-normal text-white/75">{it.body}</p>
                  </div>
                </li>
              ))}
            </ul>
          </Reveal>
        </div>

        <Reveal delay={2} className="lg:col-span-5">
          <figure className="surface overflow-hidden">
            <div className="relative aspect-[4/3] w-full">
              <Image
                src={PHOTOS.waxing.src}
                alt={PHOTOS.waxing.alt}
                fill
                sizes="(min-width: 1024px) 38vw, 92vw"
                className="object-cover object-[45%_50%]"
              />
            </div>
            <div className="flex flex-col gap-5 p-6 sm:flex-row sm:items-center sm:justify-between sm:p-7 lg:flex-col lg:items-start xl:flex-row xl:items-center">
              <p className="flex items-baseline gap-2.5 whitespace-nowrap">
                <span className="font-[family-name:var(--font-ui)] text-[12px] font-semibold tracking-[0.16em] text-white/75 uppercase">
                  {s.price.label}
                </span>
                <span className="font-[family-name:var(--font-display)] text-[48px] leading-[0.8] text-gold">
                  {s.price.value}
                </span>
              </p>
              <BookButton label={s.bookLabel} inCard className="w-full sm:w-auto lg:w-full xl:w-auto" />
            </div>
          </figure>
        </Reveal>
      </div>
    </section>
  );
}

/* ── 5. Why wax after valeting? ───────────────────────────────────────────
   The argument on the left, its two roles — the valet's and the wax's — as a
   pair, and the brief's "CLEAN ↓ PREPARE ↓ WAX ↓ FINISH" drawn as it is
   written, top to bottom, on the band's one dark panel with the sentence it
   leads to. */

function AfterValet() {
  const s = WAX.afterValet;
  const roleIcons: GlyphName[] = ["droplet", "wax"];
  return (
    <section className="w-full bg-gold-wash py-16 lg:py-[104px]">
      <div className="shell grid gap-10 lg:grid-cols-12 lg:items-center lg:gap-16">
        <div className="lg:col-span-7">
          <SectionHead title={s.heading} tone="gold" />
          <Kicker onGold>{s.title}</Kicker>
          <Reveal delay={3}>
            <Lead onGold>{s.lead}</Lead>
            {s.body.map((html) => (
              <Prose key={html} html={html} onGold />
            ))}
          </Reveal>
          <ul className="mt-7 grid gap-3 sm:grid-cols-2">
            {s.roles.map((r, i) => (
              <Reveal
                as="li"
                key={r}
                delay={i + 1}
                className="flex items-center gap-3.5 rounded-[12px] bg-ink/[0.08] px-4 py-3.5 ring-1 ring-ink/20"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-ink text-gold">
                  <Glyph name={roleIcons[i]} size={19} />
                </span>
                <span className="text-[15.5px] leading-[22px] font-semibold text-ink">{r}</span>
              </Reveal>
            ))}
          </ul>
        </div>

        <Reveal delay={2} className="lg:col-span-5">
          <div className="surface-on-gold p-6 sm:p-8">
            <StageColumn stages={s.flow} />
            <p className="mt-6 border-t border-white/[0.08] pt-5 text-[15.5px] leading-[25px] font-normal text-white/80">
              {s.after}
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ── 6. What does car wax do? ─────────────────────────────────────────────
   "Gloss + Protection." The section's heading, its lead and the beading
   photograph hold still from `lg` while the five things wax "can help" with
   run beside them as cards. */

const DOES_ICONS: Record<string, GlyphName> = {
  "Enhance Gloss": "spark",
  "Improve Water Behaviour": "droplet",
  "Add a Protective Layer": "shield",
  "Make Maintenance Easier": "calendar",
  "Enhance the Final Valet": "star",
};

function WhatWaxDoes() {
  const s = WAX.does;
  return (
    <section className="w-full py-16 lg:py-[104px]">
      <div className="shell grid gap-12 lg:grid-cols-12 lg:gap-16">
        <div className="lg:col-span-5">
          <div className="lg:sticky lg:top-32">
            <SectionHead title={s.heading} />
            <Kicker>{s.title}</Kicker>
            <Reveal delay={3}>
              <Lead>{s.lead}</Lead>
            </Reveal>
            <Reveal delay={2}>
              <figure className="relative mt-8 overflow-hidden rounded-[14px] ring-1 ring-white/[0.08]">
                <div className="relative aspect-[3/2] w-full">
                  <Image
                    src={PHOTOS.beading.src}
                    alt={PHOTOS.beading.alt}
                    fill
                    sizes="(min-width: 1024px) 34vw, 92vw"
                    className="object-cover"
                  />
                </div>
              </figure>
            </Reveal>
          </div>
        </div>

        <div className="min-w-0 lg:col-span-7">
          <Reveal>
            <Label>{s.listLead}</Label>
          </Reveal>
          <ul className="mt-4 grid gap-4 sm:grid-cols-2 lg:gap-5">
            {s.items.map((it, i) => (
              <Reveal
                as="li"
                key={it.title}
                delay={i % 2}
                className={`surface group relative overflow-hidden p-6 sm:p-7 ${i === 4 ? "sm:col-span-2" : ""}`}
              >
                <div className="flex items-start justify-between gap-4">
                  <IconDisc name={DOES_ICONS[it.title] ?? "check"} />
                  <span
                    aria-hidden
                    className="font-[family-name:var(--font-display)] text-[44px] leading-[0.8] text-white/[0.09]"
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>
                </div>
                <h3 className="mt-5 font-[family-name:var(--font-sub)] text-[20px] leading-tight tracking-[0.02em] text-white uppercase sm:text-[21px]">
                  {it.title}
                </h3>
                <p className="mt-2.5 text-[15px] leading-[24px] font-normal text-white/75">{it.body}</p>
                <HoverRule />
              </Reveal>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

/* ── 7. What car wax does not do ──────────────────────────────────────────
   "7 — WAX DOESN'T REMOVE SCRATCHES. Important conversion section. Offer:
   Machine Polishing, Enhancement Detail." The ten things wax does not remove
   in one panel beside the distinction, then the offer as the band's one dark
   panel with the two buttons the brief names. */

function NotCorrection() {
  const s = WAX.doesNot;
  const i = s.improve;
  return (
    <section id="not-paint-correction" className="w-full scroll-mt-24 bg-gold-wash py-16 lg:py-[104px]">
      <div className="shell">
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-14">
          <div className="lg:col-span-5">
            <SectionHead title={s.heading} tone="gold" />
            <Kicker onGold>{s.title}</Kicker>
            <Reveal delay={3}>
              <Lead onGold>{s.lead}</Lead>
            </Reveal>
          </div>

          <Reveal delay={2} className="lg:col-span-7">
            <div className="surface-on-gold p-6 sm:p-8 lg:p-10">
              <div className="flex items-center gap-3">
                <IconDisc name="close" size={40} />
                <h3 className="text-[16px] leading-[23px] font-semibold text-white">{s.listLead}</h3>
              </div>
              <ul className="mt-6 grid sm:grid-cols-2 sm:gap-x-8">
                {s.list.map((f) => (
                  <li
                    key={f}
                    className="flex items-center gap-3 border-b border-white/[0.06] py-2.5 text-[14.5px] leading-[21px] font-normal text-white/85"
                  >
                    <Icon name="close" size={14} strokeWidth={2.4} className="shrink-0 text-gold" />
                    {f}
                  </li>
                ))}
              </ul>
              <p className="mt-6 text-[15.5px] leading-[25px] font-semibold text-white">{s.after}</p>
            </div>
          </Reveal>
        </div>

        <Reveal delay={1}>
          <div className="mt-6 flex flex-col gap-6 rounded-[14px] bg-ink p-6 ring-1 ring-gold/40 sm:p-8 lg:mt-8 lg:p-10 xl:flex-row xl:items-center xl:justify-between xl:gap-12">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-5">
              <IconDisc name="spark" size={50} solid />
              <div>
                <h3 className="font-[family-name:var(--font-sub)] text-[20px] leading-tight tracking-[0.03em] text-white uppercase sm:text-[23px]">
                  {i.title}
                </h3>
                <p className="mt-2 max-w-[60ch] text-[15.5px] leading-[25px] font-normal text-white/75">{i.body}</p>
              </div>
            </div>
            <div className="flex shrink-0 flex-col gap-3 sm:flex-row">
              <PageButton href={LINKS.enhancement} label={i.enhancementLabel} className="w-full sm:w-auto" />
              <PageButton href={LINKS.machinePolish} label={i.polishingLabel} className="w-full sm:w-auto" />
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ── 8. Car wax vs machine polishing ──────────────────────────────────────
   Two cards, side by side from `md`, and the brief's "SIMPLE RULE" under
   them as two questions and their answers. */

function VsPolishing() {
  const s = WAX.vsPolishing;
  return (
    <section className="w-full py-16 lg:py-[104px]">
      <div className="shell">
        <SectionHead title={s.heading} />
        <Kicker>{s.title}</Kicker>

        <div className="mt-12 grid gap-4 md:grid-cols-2 lg:gap-5">
          <Reveal className="surface group relative flex flex-col overflow-hidden p-6 sm:p-8">
            <div className="flex items-center gap-4">
              <IconDisc name="wax" size={50} solid />
              <h3 className="font-[family-name:var(--font-sub)] text-[22px] leading-tight tracking-[0.03em] text-white uppercase sm:text-[24px]">
                {s.wax.name}
              </h3>
            </div>
            <Label className="mt-7">{s.wax.lead}</Label>
            <p className="mt-2 font-[family-name:var(--font-heading)] text-[30px] leading-[1.05] font-black text-gold uppercase sm:text-[36px]">
              <strong className="font-black">{s.wax.strong}</strong>
            </p>
            <p className="mt-4 text-[15.5px] leading-[25px] font-normal text-white/75">{s.wax.body}</p>
            <HoverRule />
          </Reveal>

          <Reveal delay={1} className="surface group relative flex flex-col overflow-hidden p-6 sm:p-8">
            <div className="flex items-center gap-4">
              <IconDisc name="refresh" size={50} />
              <h3 className="font-[family-name:var(--font-sub)] text-[22px] leading-tight tracking-[0.03em] uppercase sm:text-[24px]">
                <Link
                  href={LINKS.machinePolish}
                  className="text-white underline decoration-gold/45 underline-offset-[5px] transition-colors hover:text-gold"
                >
                  {s.polishing.name}
                </Link>
              </h3>
            </div>
            <p className="mt-7 text-[15.5px] leading-[24px] font-semibold text-white">{s.polishing.lead}</p>
            <ul className="mt-3 grid gap-2">
              {s.polishing.list.map((item) => (
                <li key={item} className="flex gap-2.5 text-[15px] leading-[22px] font-normal text-white/85">
                  <span aria-hidden className="mt-[8px] h-1.5 w-1.5 shrink-0 rounded-full bg-gold" />
                  {item}
                </li>
              ))}
            </ul>
            <p className="mt-3 text-[15px] leading-[24px] font-normal text-white/65">{s.polishing.after}</p>
            <HoverRule />
          </Reveal>
        </div>

        <Reveal delay={1}>
          <div className="mt-6 rounded-[14px] bg-gold/[0.07] p-6 ring-1 ring-gold/40 sm:p-8 lg:mt-8 lg:p-10">
            <h3 className="font-[family-name:var(--font-ui)] text-[12px] font-semibold tracking-[0.22em] text-gold uppercase">
              {s.rule.title}
            </h3>
            <dl className="mt-5 grid gap-6 md:grid-cols-2 md:gap-10">
              {s.rule.rows.map((r) => (
                <div key={r.q}>
                  <dt className="font-[family-name:var(--font-sub)] text-[18px] leading-tight font-semibold tracking-[0.04em] text-white uppercase sm:text-[20px]">
                    {r.q}
                  </dt>
                  <dd
                    className="mt-2 flex items-start gap-2.5 font-[family-name:var(--font-heading)] text-[21px] leading-[1.15] font-black text-gold uppercase sm:text-[26px] [&_a]:underline [&_a]:decoration-gold/50 [&_a]:underline-offset-4 [&_a:hover]:text-gold-bright"
                  >
                    <Icon name="arrow" size={20} strokeWidth={2.2} className="mt-[3px] shrink-0 sm:mt-[5px]" />
                    <span dangerouslySetInnerHTML={{ __html: r.aHtml }} />
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ── 9. Car wax vs ceramic coating ────────────────────────────────────────
   "8 — WAX VS CERAMIC COATING. Simple two-column comparison. Do not
   overcomplicate it." Two cards: the wax with its five reasons and its price,
   the coating with its two sentences and the link the brief puts under it. */

function VsCeramic() {
  const s = WAX.vsCeramic;
  return (
    <section className="w-full bg-gold-wash py-16 lg:py-[104px]">
      <div className="shell">
        <SectionHead title={s.heading} tone="gold" />
        <Kicker onGold>{s.title}</Kicker>

        <div className="mt-12 grid gap-4 md:grid-cols-2 lg:gap-5">
          <Reveal className="surface-on-gold group relative flex flex-col overflow-hidden p-6 sm:p-8">
            <h3 className="font-[family-name:var(--font-sub)] text-[22px] leading-tight tracking-[0.03em] text-white uppercase sm:text-[24px]">
              {s.wax.name}
            </h3>
            <p className="mt-5 text-[15.5px] leading-[24px] font-semibold text-white">{s.wax.lead}</p>
            <ul className="mt-3 grid gap-2.5">
              {s.wax.list.map((item) => (
                <li key={item} className="flex items-start gap-2.5 text-[15px] leading-[22px] font-normal text-white/85">
                  <span className="mt-px">
                    <Tick size={20} />
                  </span>
                  {item}
                </li>
              ))}
            </ul>
            <p className="mt-auto pt-7">
              <span className="inline-flex rounded-full bg-gold px-4 py-2 font-[family-name:var(--font-ui)] text-[12.5px] font-bold tracking-[0.14em] whitespace-nowrap text-ink uppercase">
                {s.wax.price}
              </span>
            </p>
            <HoverRule />
          </Reveal>

          <Reveal delay={1} className="surface-on-gold group relative flex flex-col overflow-hidden p-6 sm:p-8">
            <h3 className="font-[family-name:var(--font-sub)] text-[22px] leading-tight tracking-[0.03em] text-white uppercase sm:text-[24px]">
              {s.ceramic.name}
            </h3>
            {s.ceramic.body.map((p, i) => (
              <p
                key={p}
                className={`mt-4 text-[15.5px] leading-[25px] font-normal ${i === 0 ? "text-white/85" : "text-white/70"}`}
              >
                {p}
              </p>
            ))}
            <div className="mt-auto pt-7">
              <PageButton href={LINKS.ceramic} label={s.ceramic.ctaLabel} inCard className="w-full sm:w-auto" />
            </div>
            <HoverRule />
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/* ── 10. Premium wax ──────────────────────────────────────────────────────
   "Do not make 'Autoglym' the H1 … The product supports the service." The
   product is a card under the section's own two headings — an h3 — beside
   the gloss photograph, which shows the finish rather than the tin. */

function Product() {
  const s = WAX.product;
  return (
    <section className="w-full py-16 lg:py-[104px]">
      <div className="shell grid gap-10 lg:grid-cols-12 lg:items-center lg:gap-16">
        <div className="lg:col-span-6">
          <SectionHead title={s.heading} />
          <Kicker>{s.title}</Kicker>
          <Reveal delay={3}>
            <Lead>{s.body}</Lead>
          </Reveal>
          <Reveal delay={2}>
            <div className="surface mt-8 flex gap-4 p-6 sm:p-7">
              <IconDisc name="wax" size={46} />
              <div>
                <h3 className="font-[family-name:var(--font-sub)] text-[20px] leading-tight tracking-[0.03em] text-white uppercase sm:pt-1 sm:text-[22px]">
                  {s.autoglym.title}
                </h3>
                <p className="mt-2 text-[15.5px] leading-[25px] font-normal text-white/75">{s.autoglym.body}</p>
              </div>
            </div>
          </Reveal>
        </div>

        <Reveal delay={2} className="lg:col-span-6">
          <figure className="relative overflow-hidden rounded-[14px] ring-1 ring-white/[0.08]">
            <div className="relative aspect-[3/2] w-full">
              <Image
                src={PHOTOS.gloss.src}
                alt={PHOTOS.gloss.alt}
                fill
                sizes="(min-width: 1024px) 44vw, 92vw"
                className="object-cover"
              />
            </div>
          </figure>
        </Reveal>
      </div>
    </section>
  );
}

/* ── 12. How long does car wax last? ──────────────────────────────────────
   "DO NOT ADVERTISE A UNIVERSAL GUARANTEED LIFESPAN." So there is no number
   anywhere in the band: the statement, the nine things the answer depends
   on in one panel, and the brief's garaged-or-outdoors example as its last
   line. */

function HowLong() {
  const s = WAX.lasts;
  return (
    <section className="w-full bg-gold-wash py-16 lg:py-[104px]">
      <div className="shell grid gap-10 lg:grid-cols-12 lg:gap-14">
        <div className="lg:col-span-5">
          <SectionHead title={s.heading} tone="gold" />
          <Kicker onGold>{s.title}</Kicker>
          <Reveal delay={3}>
            <Lead onGold>{s.lead}</Lead>
          </Reveal>
        </div>

        <Reveal delay={2} className="lg:col-span-7">
          <div className="surface-on-gold p-6 sm:p-8 lg:p-10">
            <div className="flex items-center gap-3">
              <IconDisc name="clock" size={40} />
              <h3 className="text-[16px] leading-[23px] font-semibold text-white">{s.factorsLead}</h3>
            </div>
            <ul className="mt-6 grid sm:grid-cols-2 sm:gap-x-8">
              {s.factors.map((f) => (
                <li
                  key={f}
                  className="flex gap-3 border-b border-white/[0.06] py-2.5 text-[14.5px] leading-[21px] font-normal text-white/80"
                >
                  <span aria-hidden className="mt-[8px] h-1.5 w-1.5 shrink-0 rounded-full bg-gold" />
                  {f}
                </li>
              ))}
            </ul>
            <p className="mt-6 border-l-2 border-gold pl-4 text-[15.5px] leading-[25px] font-semibold text-white">
              {s.after}
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ── 14. Pricing ──────────────────────────────────────────────────────────
   "9 — FROM £40. Large pricing block. ADD-ON ONLY [CHOOSE MY VALET]." The
   price as large as anything on the site, ADD-ON ONLY under it and the
   brief's IMPORTANT lines; beside them the customer journey as a sum —
   valet, plus wax, equals the result — with the booking button and CHOOSE MY
   VALET, which goes to the eligible valets in the next band. */

function Pricing() {
  const s = WAX.pricing;
  return (
    <section id="pricing" className="w-full scroll-mt-24 py-16 lg:py-[104px]">
      <div className="shell grid gap-10 lg:grid-cols-12 lg:items-center lg:gap-16">
        <div className="lg:col-span-5">
          <SectionHead title={s.heading} />
          <Kicker>{s.title}</Kicker>
          <Reveal delay={2}>
            <p className="mt-8 flex items-end gap-3 text-white">
              <span className="pb-[0.32em] font-[family-name:var(--font-sub)] text-[22px] leading-none font-semibold tracking-[0.06em] uppercase sm:text-[26px]">
                {s.price.label}
              </span>
              <span className="font-[family-name:var(--font-display)] text-[92px] leading-[0.78] text-gold min-[400px]:text-[112px] sm:text-[150px] lg:text-[110px] xl:text-[150px]">
                {s.price.value}
              </span>
            </p>
            <p className="mt-6">
              <span className="inline-flex items-center gap-2 rounded-full bg-gold px-4 py-2 font-[family-name:var(--font-ui)] text-[12.5px] font-bold tracking-[0.16em] whitespace-nowrap text-ink uppercase">
                <Icon name="plus" size={15} strokeWidth={2.4} className="shrink-0" />
                {s.addOnOnly}
              </span>
            </p>
          </Reveal>
          <Reveal delay={3}>
            <div className="mt-7 rounded-[14px] bg-white/[0.04] p-5 ring-1 ring-white/[0.1] sm:p-6">
              <p className="flex items-center gap-2.5 font-[family-name:var(--font-ui)] text-[11.5px] font-semibold tracking-[0.22em] text-gold uppercase">
                <Icon name="info" size={16} className="shrink-0" />
                {s.important.title}
              </p>
              {s.important.bodyHtml.map((html) => (
                <p
                  key={html}
                  className="mt-2.5 text-[15.5px] leading-[24px] font-normal text-white/80 [&_strong]:font-semibold [&_strong]:text-white"
                  dangerouslySetInnerHTML={{ __html: html }}
                />
              ))}
            </div>
          </Reveal>
        </div>

        <Reveal delay={2} className="min-w-0 lg:col-span-7">
          <Journey />
        </Reveal>
      </div>
    </section>
  );
}

function Journey() {
  const s = WAX.pricing;
  const j = s.journey;
  const row = "flex items-center gap-3 rounded-[12px] px-3.5 py-3.5 sm:gap-4 sm:px-5 sm:py-4";
  const text =
    "font-[family-name:var(--font-sub)] text-[17px] leading-[1.2] font-semibold tracking-[0.03em] uppercase sm:text-[21px]";
  return (
    <div className="surface p-5 sm:p-8 lg:p-10">
      <div className="flex flex-col">
        <div className={`${row} bg-white/[0.04] ring-1 ring-white/[0.08]`}>
          <span className="hidden min-[380px]:block">
            <IconDisc name="calendar" size={38} />
          </span>
          <span className={`${text} text-white`}>{j.base}</span>
        </div>

        <Operator sign="+" label="plus" />

        <div className={`${row} bg-white/[0.04] ring-1 ring-white/[0.08]`}>
          <span className="hidden min-[380px]:block">
            <IconDisc name="wax" size={38} />
          </span>
          <span className={`${text} text-white`}>{j.addOn}</span>
        </div>

        <Operator sign="=" label="equals" />

        <div className={`${row} bg-gold text-ink`}>
          <span className="flex h-[38px] w-[38px] shrink-0 items-center justify-center rounded-full bg-ink text-gold">
            <Icon name="check" size={20} strokeWidth={2.6} />
          </span>
          <span className={text}>
            <KeepHyphens text={j.result} />
          </span>
        </div>
      </div>
      <p className="mt-6 text-[14.5px] leading-[23px] font-normal text-white/65">{s.note}</p>
      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
        <BookButton label={s.bookLabel} className="w-full sm:w-auto" />
        <PageButton href="#eligible-valets" label={s.chooseLabel} className="w-full sm:w-auto" />
      </div>
    </div>
  );
}

function Operator({ sign, label }: { sign: string; label: string }) {
  return (
    <span className="relative z-10 -my-1.5 flex justify-center">
      <span className="sr-only">{label}</span>
      <span
        aria-hidden
        className="flex h-9 w-9 items-center justify-center rounded-full bg-ink font-[family-name:var(--font-display)] text-[22px] leading-none text-gold ring-1 ring-gold/40"
      >
        {sign}
      </span>
    </span>
  );
}

/* ── 15. Which valets can I add wax to? ───────────────────────────────────
   "10 — ELIGIBLE VALETS. Show relevant package cards." The brief's three:
   Zeus and Medusa Gold, each with VIEW PACKAGE and ADD WAX, and the card for
   every other eligible exterior or full valet with VIEW VALETING SERVICES.
   Triton is not one of them — "Do not automatically list Triton Interior
   Valet if it does not include an exterior wash" — and the rule behind that
   is the band's closing note. */

function EligibleValets() {
  const s = WAX.valets;
  return (
    <section id="eligible-valets" className="w-full scroll-mt-24 bg-gold-wash py-16 lg:py-[104px]">
      <div className="shell">
        <SectionHead title={s.heading} tone="gold" />
        <Kicker onGold>{s.title}</Kicker>

        <ul className="mt-12 grid gap-4 md:grid-cols-3 lg:gap-5">
          {s.items.map((key, i) => {
            const v = VALETS[key];
            return (
              <Reveal as="li" key={key} delay={i} className="surface-on-gold group relative flex flex-col overflow-hidden p-6 sm:p-7">
                <span className="flex items-center justify-between">
                  <span className="font-[family-name:var(--font-display)] text-[30px] leading-none text-gold/90">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span
                    aria-hidden
                    className="flex h-9 w-9 items-center justify-center rounded-full bg-gold/12 text-gold ring-1 ring-gold/35"
                  >
                    <Icon name="plus" size={17} strokeWidth={2.2} />
                  </span>
                </span>
                <h3 className="mt-5 font-[family-name:var(--font-sub)] text-[22px] leading-tight tracking-[0.02em] uppercase sm:text-[24px]">
                  <Link
                    href={v.href}
                    className="text-white underline decoration-gold/45 underline-offset-[5px] transition-colors hover:text-gold"
                  >
                    {v.name}
                  </Link>
                </h3>
                <div className="mt-auto flex flex-col gap-2.5 pt-8 sm:flex-row md:flex-col">
                  <PageButton href={v.href} label={s.viewLabel} inCard className="w-full sm:flex-1 md:flex-none" />
                  <BookButton label={s.addLabel} inCard className="w-full sm:flex-1 md:flex-none" />
                </div>
                <HoverRule />
              </Reveal>
            );
          })}
          <Reveal as="li" delay={2} className="surface-on-gold group relative flex flex-col overflow-hidden p-6 sm:p-7">
            <span className="flex items-center justify-between">
              <span className="font-[family-name:var(--font-display)] text-[30px] leading-none text-gold/90">03</span>
              <span
                aria-hidden
                className="flex h-9 w-9 items-center justify-center rounded-full bg-gold/12 text-gold ring-1 ring-gold/35"
              >
                <Icon name="layers" size={17} />
              </span>
            </span>
            <h3 className="mt-5 font-[family-name:var(--font-sub)] text-[22px] leading-tight tracking-[0.02em] text-white uppercase sm:text-[24px]">
              {s.other.name}
            </h3>
            <div className="mt-auto pt-8">
              <PageButton href={s.other.href} label={s.other.ctaLabel} inCard className="w-full" />
            </div>
            <HoverRule />
          </Reveal>
        </ul>

        <Reveal delay={1}>
          <div className="mt-6 flex items-start gap-4 rounded-[14px] bg-ink/[0.08] p-5 ring-1 ring-ink/25 sm:items-center sm:p-6 lg:mt-8">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-ink text-gold">
              <Icon name="info" size={21} />
            </span>
            <p className="text-[16px] leading-[25px] font-semibold text-ink sm:text-[17px]">{s.note}</p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ── 16 & 17. Who is this add-on for? · Pre-sale car waxing ───────────────
   The eight reasons as a ticked grid with the button under them, and beside
   them the one reason with a section of its own — selling the car — as a
   card with the finished-car photograph and its link to the Pre-Sale Valet. */

function WhoFor() {
  const w = WAX.who;
  const p = WAX.preSale;
  return (
    <section className="w-full py-16 lg:py-[104px]">
      <div className="shell grid gap-12 lg:grid-cols-12 lg:gap-14">
        <div className="lg:col-span-7">
          <HyphenatedHead title={w.heading} />
          <Kicker>{w.title}</Kicker>
          <ul className="mt-8 grid gap-3 sm:grid-cols-2">
            {w.items.map((item, i) => (
              <Reveal
                as="li"
                key={item}
                delay={i % 2}
                className="flex items-start gap-3 rounded-[12px] bg-white/[0.04] px-4 py-3.5 ring-1 ring-white/[0.07]"
              >
                <span className="mt-px">
                  <Tick size={22} />
                </span>
                <span className="text-[15px] leading-[22px] font-semibold text-white/90">{item}</span>
              </Reveal>
            ))}
          </ul>
          <Reveal delay={2}>
            <BookButton label={w.bookLabel} className="mt-8 w-full sm:w-auto" />
          </Reveal>
        </div>

        <Reveal delay={2} className="lg:col-span-5">
          <article className="surface overflow-hidden lg:sticky lg:top-32">
            <div className="relative aspect-[16/10] w-full">
              <Image
                src={PHOTOS.finished.src}
                alt={PHOTOS.finished.alt}
                fill
                sizes="(min-width: 1024px) 36vw, 92vw"
                className="object-cover object-[50%_60%]"
              />
              <div
                aria-hidden
                className="absolute inset-x-0 bottom-0 h-1/2 bg-[linear-gradient(to_top,rgba(13,13,13,0.95),transparent)]"
              />
            </div>
            <div className="p-6 sm:p-7">
              <h2 className="font-[family-name:var(--font-sub)] text-[22px] leading-tight font-semibold tracking-[0.03em] text-white uppercase sm:text-[24px]">
                {p.heading}
              </h2>
              <h3 className="mt-3 font-[family-name:var(--font-sub)] text-[17px] leading-tight font-semibold tracking-[0.03em] text-gold uppercase">
                {p.title}
              </h3>
              <p className="mt-3 text-[15px] leading-[24px] font-normal text-white/80">{p.lead}</p>
              <p
                className="mt-3 text-[15px] leading-[24px] font-semibold text-white [&_a]:text-gold [&_a]:underline [&_a]:underline-offset-2"
                dangerouslySetInnerHTML={{ __html: p.listLeadHtml }}
              />
              <ul className="mt-3 flex flex-wrap gap-2">
                {p.list.map((item) => (
                  <li
                    key={item}
                    className="flex items-center gap-2 rounded-full bg-white/[0.05] py-1.5 pr-3.5 pl-3 text-[13.5px] leading-[18px] font-normal text-white/90 ring-1 ring-white/10"
                  >
                    <span aria-hidden className="h-1.5 w-1.5 shrink-0 rounded-full bg-gold" />
                    {item}
                  </li>
                ))}
              </ul>
              <p className="mt-4 text-[15px] leading-[24px] font-normal text-white/70">{p.after}</p>
              <PageButton href={LINKS.preSale} label={p.ctaLabel} inCard className="mt-6 w-full sm:w-auto" />
            </div>
          </article>
        </Reveal>
      </div>
    </section>
  );
}

/* ── 13. Maintaining your waxed car ───────────────────────────────────────
   "11 — MAINTENANCE. Short section." The five recommendations as compact
   cards — three over two from `lg`, five across from `xl` — and the link to
   regular car cleaning under them. */

const MAINTAIN_ICONS: Record<string, GlyphName> = {
  "Regular Washing": "droplet",
  "Appropriate Car-Cleaning Products": "tag",
  "Avoid Aggressive Chemicals": "warning",
  "Safe Washing Techniques": "brush",
  "Regular Medusa Maintenance": "calendar",
};

function Maintenance() {
  const s = WAX.maintain;
  return (
    <section className="w-full bg-gold-wash py-16 lg:py-[104px]">
      <div className="shell">
        <div className="grid gap-6 lg:grid-cols-12 lg:items-end lg:gap-16">
          <div className="lg:col-span-7">
            <SectionHead title={s.heading} tone="gold" />
            <Kicker onGold>{s.title}</Kicker>
          </div>
          <Reveal delay={3} className="lg:col-span-5">
            <Lead onGold className="lg:mt-0">
              {s.lead}
            </Lead>
          </Reveal>
        </div>

        <Reveal delay={1}>
          <Label onGold className="mt-12">
            {s.listLead}
          </Label>
        </Reveal>
        <ul className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-6 lg:gap-5 xl:grid-cols-5">
          {s.items.map((it, i) => (
            <Reveal
              as="li"
              key={it.title}
              delay={i % 3}
              className={`surface-on-gold group relative overflow-hidden p-6 ${i === 4 ? "sm:col-span-2" : ""} ${
                i < 3 ? "lg:col-span-2" : "lg:col-span-3"
              } xl:col-span-1`}
            >
              <IconDisc name={MAINTAIN_ICONS[it.title] ?? "check"} size={44} />
              <h3 className="mt-5 font-[family-name:var(--font-sub)] text-[18px] leading-tight tracking-[0.02em] text-white uppercase">
                <KeepHyphens text={it.title} />
              </h3>
              <p className="mt-2.5 text-[14.5px] leading-[23px] font-normal text-white/75">{it.body}</p>
              <HoverRule />
            </Reveal>
          ))}
        </ul>

        <Reveal delay={2}>
          <PageButton href={LINKS.regular} label={s.ctaLabel} onGold className="mt-10 w-full sm:w-auto" />
        </Reveal>
      </div>
    </section>
  );
}

/* ── 18. Why choose Medusa? ───────────────────────────────────────────────
   "12 — WHY MEDUSA. Keep concise." Six cards, an icon each, on ink. */

const WHY_ICONS: Record<string, GlyphName> = {
  "We Come to You": "van",
  "Professional Application": "wax",
  "Premium Products": "star",
  "Convenient Add-On": "plus",
  "From £40": "tag",
  "Complete Vehicle Care": "shield",
};

function WhyMedusa() {
  const w = WAX.why;
  return (
    <section className="w-full py-16 lg:py-[104px]">
      <div className="shell">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <SectionHead title={w.heading} />
            <Kicker>{w.title}</Kicker>
          </div>
          <Reveal delay={3} className="w-full sm:w-auto">
            <BookButton label={w.bookLabel} className="w-full sm:w-auto" />
          </Reveal>
        </div>

        <ul className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-5">
          {w.items.map((it, i) => (
            <Reveal as="li" key={it.title} delay={i % 3} className="surface group relative overflow-hidden p-6 sm:p-7">
              {/* Beside its title on a phone, where six cards stack; above it
                  from `sm`, where they sit in a grid. */}
              <div className="flex items-center gap-4 sm:block">
                <IconDisc name={WHY_ICONS[it.title] ?? "check"} size={50} />
                <h3 className="font-[family-name:var(--font-sub)] text-[20px] leading-tight text-white uppercase sm:mt-6">
                  <KeepHyphens text={it.title} />
                </h3>
              </div>
              <p
                className="mt-3 text-[15px] leading-[25px] font-normal text-white/75 [&_a]:font-semibold [&_a]:text-gold [&_a]:underline [&_a]:underline-offset-2 [&_a:hover]:text-gold-bright"
                dangerouslySetInnerHTML={{ __html: it.bodyHtml }}
              />
              <HoverRule />
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}

/* ── 20. FAQ ──────────────────────────────────────────────────────────────
   "14 — FAQ. Accordion." */

function Faq() {
  const f = WAX.faq;
  return (
    <section className="w-full py-16 lg:py-[104px]">
      <div className="shell grid gap-10 lg:grid-cols-12 lg:gap-16">
        <div className="lg:col-span-4">
          <div className="lg:sticky lg:top-32">
            <SectionHead title={f.heading} />
          </div>
        </div>
        <div className="lg:col-span-8">
          <FaqAccordion items={f.items} />
        </div>
      </div>
    </section>
  );
}

/* ── 21. Important service information ────────────────────────────────────
   "15 — IMPORTANT INFORMATION. Service limitations." The seven, numbered, in
   one panel, each its title and sentence; the damage-proof one carries its
   list as chips. */

function ServiceInfo() {
  const s = WAX.info;
  return (
    <section id="service-information" className="w-full scroll-mt-24 bg-gold-wash py-16 lg:py-[104px]">
      <div className="shell grid gap-10 lg:grid-cols-12 lg:gap-14">
        <div className="lg:col-span-4">
          <div className="lg:sticky lg:top-32">
            <SectionHead title={s.heading} tone="gold" />
            <Kicker onGold>{s.title}</Kicker>
          </div>
        </div>

        <Reveal delay={2} className="lg:col-span-8">
          <ol className="surface-on-gold px-6 py-3 sm:px-8 sm:py-4 lg:px-10">
            {s.items.map((it, i) => (
              <li key={it.title} className="flex gap-4 border-b border-white/[0.06] py-5 last:border-b-0">
                <span
                  aria-hidden
                  className="w-7 shrink-0 font-[family-name:var(--font-display)] text-[19px] leading-[23px] text-gold"
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div className="min-w-0">
                  <h3 className="font-[family-name:var(--font-sub)] text-[18px] leading-[23px] font-semibold tracking-[0.03em] text-white uppercase sm:text-[19px]">
                    <KeepHyphens text={it.title} />
                  </h3>
                  <p className="mt-1.5 text-[15px] leading-[24px] font-normal text-white/75">{it.body}</p>
                  {it.list && (
                    <ul className="mt-3 flex flex-wrap gap-2">
                      {it.list.map((item) => (
                        <li
                          key={item}
                          className="flex items-center gap-1.5 rounded-full bg-white/[0.05] py-1.5 pr-3 pl-2.5 text-[13.5px] leading-[18px] font-normal text-white/85 ring-1 ring-white/10"
                        >
                          <Icon name="close" size={12} strokeWidth={2.4} className="shrink-0 text-gold" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </li>
            ))}
          </ol>
        </Reveal>
      </div>
    </section>
  );
}

/* ── 22. Final CTA ─────────────────────────────────────────────────────────
   "ADD GLOSS & PROTECTION TO YOUR NEXT VALET" with Section 22's own two
   buttons, and its card — PROFESSIONAL CAR WAX, FROM £40, ADD-ON TO ELIGIBLE
   MEDUSA VALETING SERVICES, then CLEAN ↓ PREPARE ↓ WAX ↓ PROTECT. The sticky
   bar steps aside while it is on screen. */

function FinalCta() {
  const f = WAX.finalCta;
  return (
    <section
      id="wax-final"
      className="cut-top relative w-full overflow-hidden bg-ink-panel pt-[calc(var(--cut)+4rem)] pb-16 lg:pb-[104px]"
    >
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background: "radial-gradient(80% 90% at 50% 0%, rgba(193,146,49,0.16) 0%, transparent 62%)",
        }}
      />
      <div className="shell relative grid items-center gap-10 lg:grid-cols-12 lg:gap-14">
        <div className="lg:col-span-7">
          <SectionHead title={f.heading} />
          <Reveal delay={3}>
            <p className="measure mt-6 text-[19px] leading-[29px] font-semibold text-white">{f.body[0]}</p>
            <p className="measure mt-1 text-[17px] leading-[28px] font-normal text-body">{f.body[1]}</p>
          </Reveal>
          <Reveal delay={4}>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <BookButton label={f.bookLabel} className="w-full sm:w-auto" />
              <WhatsAppButton label={f.whatsappLabel} className="w-full sm:w-auto" />
            </div>
          </Reveal>
        </div>

        <Reveal delay={2} className="lg:col-span-5">
          <div className="surface overflow-hidden">
            <div className="flex flex-wrap items-end justify-between gap-x-4 gap-y-2 px-6 pt-7 pb-5 sm:px-7">
              <p className="font-[family-name:var(--font-sub)] text-[20px] leading-tight tracking-[0.03em] text-white uppercase">
                {f.card.title}
              </p>
              <p className="shrink-0 font-[family-name:var(--font-display)] text-[40px] leading-[0.8] whitespace-nowrap text-gold sm:text-[48px]">
                {f.card.price}
              </p>
            </div>
            <p className="border-t border-white/[0.07] bg-gold/[0.08] px-6 py-3.5 font-[family-name:var(--font-ui)] text-[11.5px] leading-[16px] font-semibold tracking-[0.14em] text-gold uppercase sm:px-7">
              <KeepHyphens text={f.card.caption} />
            </p>
            <div className="border-t border-white/[0.07] px-6 py-6 sm:px-7">
              <StageColumn stages={f.card.flow} compact />
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
