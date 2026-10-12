import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
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
import { ODOUR, PATH, PHOTOS, SLUG, type Step, type Tier, VALETS } from "@/lib/odour-removal";
import { pageSchema } from "@/lib/schema";
import { EVENTS } from "@/lib/track";

/**
 * Car odour & ozone treatment — rebuilt from the client's brief.
 *
 * Client, 2026-10-06: "Replace/re-optimise the existing Odour Removal page
 * using the content below. KEEP EXISTING URL". Every word of the brief's
 * sections is in `lib/odour-removal.ts`; this file is only layout, in the
 * brief's order, which is also the order of its "RECOMMENDED PAGE LAYOUT":
 *
 *   1 hero · 2 why it is an add-on, the three valets, how it works · 3 the
 *   three odour levels · 4 the six steps · 5 types of odour · 6 no
 *   guarantee · 7 why a smell returns, with 8 the cabin filter beside it ·
 *   9 specialist contamination · 10 which valet · 11 pricing · 12 why
 *   Medusa · 13 reviews · 14 FAQ · 15 service terms · 16 the closing band.
 *
 * Sections 7 and 8 share a band — both are about a source the treatment
 * cannot reach — which is what lets gold and ink alternate the whole way
 * down (client, 2026-09-22: "pastikan warna bg tetap selang seling") and end
 * on the gold terms over the ink close.
 *
 * What decided the shape is the brief's last page: "The customer should
 * understand these four points almost immediately: OZONE / ODOUR TREATMENT
 * IS AN ADD-ON · IT REQUIRES TRITON, ZEUS OR MEDUSA GOLD · TREATMENTS START
 * FROM +£60 · COMPLETE OR PERMANENT SMELL REMOVAL IS NOT GUARANTEED". They
 * are the first panel under the h1, with BOOK NOW and WHATSAPP under it, as
 * the layout's hero asks, and the closing card repeats them. No button reads
 * "Book Ozone": "we don't want customers believing ozone can be purchased
 * independently" — every booking button books a valet with the treatment,
 * and the phone's sticky bar says so.
 *
 * The no-guarantee section "must be prominent. Do NOT hide it exclusively in
 * the T&Cs" — it is a full gold band whose last line is set as large as the
 * h1.
 */

const BOOK = ODOUR.book;
const WHATSAPP = ODOUR.whatsapp;
const CONTACT_PATH = "/contact-us";

export function generateMetadata(): Metadata {
  const { title, description } = ODOUR.seo;
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

export default function OdourRemovalPage() {
  const page = getPage(SLUG);
  if (!page) notFound();

  return (
    <>
      <JsonLd
        data={pageSchema(page, {
          service: {
            slug: SLUG,
            name: "Odour & Ozone Treatment",
            serviceType: "Car odour and ozone treatment",
            description: ODOUR.seo.description,
            image: PHOTOS.hero.src,
            /* Each tier is an exact price that must be added to a Triton, Zeus
               or Medusa Gold valet, so none is a standalone purchase. */
            offers: ODOUR.tiers.items.map((t) => ({
              name: `${t.name} — ${t.duration}`,
              price: t.price.replace(/[^\d.]/g, ""),
              currency: "GBP",
              description: `${t.lead} ${ODOUR.tiers.mustAdd}`,
              requires: true,
            })),
          },
          faq: ODOUR.faq.items,
        })}
      />
      <TrackClicks />

      <Header />
      <main className="flex-1">
        <Hero />
        <AddOn />
        <Tiers />
        <Process />
        <Types />
        <Guarantee />
        <Hidden />
        <Specialist />
        <Selector />
        <Pricing />
        <WhyMedusa />
        <Testimonials title={ODOUR.reviews.heading} />
        <Faq />
        <Terms />
        <FinalCta />
      </main>
      <Footer />

      {/* "MOBILE STICKY CTA — Use: BOOK VALET + ODOUR TREATMENT". */}
      <StickyBookBar
        primary={{ label: ODOUR.stickyLabel, href: BOOK, track: EVENTS.bookOdour }}
        after="odour-hero-actions"
        hideOver={["odour-final"]}
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
      data-track={EVENTS.bookOdour}
      className={`btn ${tone === "gold" ? "btn-gold" : "btn-dark"} min-h-[52px] rounded-full px-5 text-center text-[14px] ${
        inCard ? "py-3 leading-[18px]" : "sm:px-7 sm:text-[15px] sm:whitespace-nowrap"
      } ${className}`}
    >
      {label}
      <Icon name="arrow" size={18} className="ml-2.5 shrink-0" />
    </a>
  );
}

function WhatsAppButton({
  label,
  onGold,
  className = "",
}: {
  label: string;
  onGold?: boolean;
  className?: string;
}) {
  return (
    <a
      href={WHATSAPP}
      target="_blank"
      rel="noopener noreferrer"
      className={`btn min-h-[52px] rounded-full px-5 text-[14px] sm:px-7 sm:text-[15px] sm:whitespace-nowrap ${
        onGold
          ? "text-ink shadow-[inset_0_0_0_2px_rgb(0_0_0/0.8)] hover:-translate-y-0.5 hover:bg-ink hover:text-white"
          : "btn-outline"
      } ${className}`}
    >
      <Icon name="whatsapp" size={19} className="mr-2.5 shrink-0" />
      {label}
    </a>
  );
}

/** A plain link styled as the site's secondary button — contact, not booking. */
function ContactButton({ label, onGold, className = "" }: { label: string; onGold?: boolean; className?: string }) {
  return (
    <Link
      href={CONTACT_PATH}
      className={`btn min-h-[52px] rounded-full px-5 text-[14px] sm:px-7 sm:text-[15px] sm:whitespace-nowrap ${
        onGold
          ? "text-ink shadow-[inset_0_0_0_2px_rgb(0_0_0/0.8)] hover:-translate-y-0.5 hover:bg-ink hover:text-white"
          : "btn-outline"
      } ${className}`}
    >
      {label}
      <Icon name="arrow" size={18} className="ml-2.5 shrink-0" />
    </Link>
  );
}

/* The brief gives every section a name and then a heading — "WHY CAN A SMELL
   RETURN?" over "Sometimes the Source Is Deeper Than the Surface". The name
   is the h2, as on the other rebuilt pages; the heading is the line under
   it, in the condensed face. */
function Kicker({ children, onGold }: { children: React.ReactNode; onGold?: boolean }) {
  return (
    <Reveal delay={2}>
      <h3
        className={`mt-5 font-[family-name:var(--font-sub)] text-[19px] leading-[1.25] font-semibold tracking-[0.02em] uppercase lg:text-[23px] ${
          onGold ? "text-ink" : "text-gold"
        }`}
      >
        {children}
      </h3>
    </Reveal>
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

function IconDisc({ name, size = 46, solid }: { name: IconName; size?: number; solid?: boolean }) {
  return (
    <span
      className={`flex shrink-0 items-center justify-center rounded-full ${
        solid ? "bg-gold text-ink" : "bg-gold/12 text-gold ring-1 ring-gold/35"
      }`}
      style={{ width: size, height: size }}
    >
      <Icon name={name} size={Math.round(size * 0.46)} />
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

const valet = (key: keyof typeof VALETS) => VALETS[key];

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

/* ── 1. Hero ──────────────────────────────────────────────────────────────
   "Immediately show: CAR ODOUR & OZONE TREATMENT · FROM +£60 · ADD-ON TO
   SELECTED VALETS · Buttons: BOOK NOW, WHATSAPP". The h1, then the four
   points as one panel — the price beside the three conditions that come
   with it — then both buttons. The brief's card (its five ticks, the three
   valets it is available with and the standalone note) sits beside them
   from `lg`, beside its photograph on a tablet and under them on a phone. */

const POINT_ICONS: IconName[] = ["plus", "layers", "info"];

function Hero() {
  const h = ODOUR.hero;
  const pts = ODOUR.points;
  const [question, sources, offer] = h.intro;
  const conditions = [pts.addOn, pts.requires, pts.guarantee];

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
              <h1 className="max-w-[20ch] text-[clamp(31px,4.4vw,60px)] leading-[1.0] text-white sm:mt-7 lg:mt-6">
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
              <div className="mt-6 flex max-w-[640px] flex-col overflow-hidden rounded-[14px] bg-white/[0.04] ring-1 ring-gold/35 sm:flex-row xl:mt-8">
                {/* "From" over the figure from `sm`, so the cell is only as
                    wide as "+£60" — beside it, at 1024px it ran into the
                    conditions column. */}
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 bg-gold/[0.1] px-5 py-3.5 sm:shrink-0 sm:flex-col sm:flex-nowrap sm:items-start sm:justify-center sm:gap-2 sm:px-6 sm:py-5">
                  <p className="flex shrink-0 items-baseline gap-2 whitespace-nowrap sm:flex-col sm:items-start sm:gap-1.5">
                    <span className="font-[family-name:var(--font-ui)] text-[12px] font-semibold tracking-[0.16em] text-white/75 uppercase">
                      {pts.price.label}
                    </span>
                    <span className="font-[family-name:var(--font-display)] text-[44px] leading-[0.85] text-gold sm:text-[54px]">
                      {pts.price.value}
                    </span>
                  </p>
                  <p className="font-[family-name:var(--font-ui)] text-[11.5px] leading-[15px] font-semibold tracking-[0.14em] text-white/80 uppercase sm:max-w-[150px]">
                    {pts.price.caption}
                  </p>
                </div>
                <ul className="flex flex-1 flex-col justify-center gap-2.5 border-t border-gold/25 px-5 py-4 sm:border-t-0 sm:border-l sm:px-6">
                  {conditions.map((c, i) => (
                    <li
                      key={c}
                      className="flex items-center gap-3 text-[14px] leading-[19px] font-semibold text-white sm:text-[14.5px]"
                    >
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gold text-ink">
                        <Icon name={POINT_ICONS[i]} size={15} strokeWidth={2.1} />
                      </span>
                      <span>
                        <KeepHyphens text={c} />
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>

            <Reveal delay={4}>
              <div id="odour-hero-actions" className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap xl:mt-8">
                <BookButton label={h.bookLabel} className="w-full sm:w-auto" />
                <WhatsAppButton label={h.whatsappLabel} className="w-full sm:w-auto" />
              </div>
            </Reveal>

            <Reveal delay={5}>
              <p className="mt-7 text-[17px] leading-[26px] font-semibold text-white xl:mt-8">{question}</p>
              <p className="mt-2 max-w-[58ch] text-[16px] leading-[26px] font-normal text-white/75 xl:text-[17px] xl:leading-[28px]">
                {sources}
              </p>
            </Reveal>
          </div>

          <Reveal delay={4} className="lg:col-span-5">
            <HeroCard />
          </Reveal>
        </div>

        <Reveal delay={5}>
          <p
            className="mt-10 max-w-[92ch] border-t border-white/10 pt-7 text-[15.5px] leading-[26px] font-normal text-white/70 lg:mt-12 [&_strong]:font-semibold [&_strong]:text-white"
            dangerouslySetInnerHTML={{ __html: offer }}
          />
        </Reveal>
      </div>
    </section>
  );
}

function HeroCard() {
  const c = ODOUR.hero.card;
  return (
    /* Photograph over the copy in the hero's column and on a phone; side by
       side on a tablet, where a stacked card ran a 450px-tall picture
       across the full width. */
    <figure className="surface relative overflow-hidden md:grid md:grid-cols-2 lg:block">
      <div className="relative aspect-[3/2] w-full md:aspect-auto md:min-h-[300px] lg:aspect-[16/10] lg:min-h-0">
        <Image
          src={PHOTOS.hero.src}
          alt={PHOTOS.hero.alt}
          fill
          priority
          sizes="(min-width: 1024px) 38vw, (min-width: 768px) 46vw, 92vw"
          className="object-cover object-[50%_55%]"
        />
        <div
          aria-hidden
          className="absolute inset-x-0 bottom-0 h-1/3 bg-[linear-gradient(to_top,rgba(13,13,13,0.85),transparent)]"
        />
      </div>
      <figcaption className="p-5 sm:p-6">
        <h3 className="font-[family-name:var(--font-sub)] text-[18px] leading-tight tracking-[0.03em] text-white uppercase sm:text-[20px]">
          {c.title}
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
        <Label className="mt-5">{c.withLabel}</Label>
        <ul className="mt-2.5 flex flex-wrap gap-2">
          {(Object.keys(VALETS) as (keyof typeof VALETS)[]).map((k) => (
            <li key={k}>
              <Link
                href={valet(k).href}
                className="inline-flex items-center rounded-full bg-white/[0.05] px-3 py-1.5 font-[family-name:var(--font-ui)] text-[11.5px] font-semibold tracking-[0.1em] text-white uppercase ring-1 ring-white/15 transition-colors hover:bg-gold hover:text-ink"
              >
                {valet(k).name}
              </Link>
            </li>
          ))}
        </ul>
        <p className="mt-5 flex gap-3 rounded-[10px] bg-gold/[0.08] px-4 py-3.5 text-[14px] leading-[21px] font-semibold text-white ring-1 ring-gold/30">
          <Icon name="info" size={18} className="mt-px shrink-0 text-gold" />
          {c.note}
        </p>
      </figcaption>
    </figure>
  );
}

/* ── 2. Why odour treatment is an add-on ──────────────────────────────────
   "AVAILABLE WITH — Show three package cards: TRITON INTERIOR · ZEUS FULL
   VALET · MEDUSA GOLD". The section's argument beside the photograph of an
   interior that needs cleaning before anything else, the three valets as
   cards — each a link to the page that sells it — and the brief's four-step
   "HOW IT WORKS" as the band's one dark strip. */

function AddOn() {
  const s = ODOUR.addOn;
  return (
    <section className="w-full bg-gold-wash py-16 lg:py-[104px]">
      <div className="shell">
        <div className="grid items-center gap-10 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-7">
            <SectionHead title={s.heading} tone="gold" />
            <Kicker onGold>{s.title}</Kicker>
            <Reveal delay={3}>
              <p className="measure mt-5 text-[18px] leading-[28px] font-semibold text-ink">{s.body[0]}</p>
              <Prose html={s.body[1]} onGold />
            </Reveal>
          </div>
          <Reveal delay={2} className="lg:col-span-5">
            <figure className="relative overflow-hidden rounded-[14px] ring-1 ring-ink/15">
              <div className="relative aspect-[3/2] w-full">
                <Image
                  src={PHOTOS.interior.src}
                  alt={PHOTOS.interior.alt}
                  fill
                  sizes="(min-width: 1024px) 38vw, 92vw"
                  className="object-cover"
                />
              </div>
            </figure>
          </Reveal>
        </div>

        <Reveal delay={1}>
          <Prose html={s.packagesLeadHtml} onGold space="mt-12" className="text-[17px]" />
        </Reveal>
        <ul className="mt-6 grid gap-4 md:grid-cols-3 lg:gap-5">
          {s.packages.map((p, i) => (
            <Reveal as="li" key={p.valet} delay={i} className="surface-on-gold group relative overflow-hidden">
              <Link href={valet(p.valet).href} className="flex h-full flex-col p-6 sm:p-7">
                <span className="flex items-center justify-between">
                  <span className="font-[family-name:var(--font-display)] text-[30px] leading-none text-gold/90">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span
                    aria-hidden
                    className="flex h-9 w-9 items-center justify-center rounded-full bg-gold/12 text-gold ring-1 ring-gold/35 transition-colors group-hover:bg-gold group-hover:text-ink"
                  >
                    <Icon name="arrow" size={17} />
                  </span>
                </span>
                <h3 className="mt-4 font-[family-name:var(--font-sub)] text-[21px] leading-tight tracking-[0.02em] text-white uppercase transition-colors group-hover:text-gold sm:text-[22px]">
                  {valet(p.valet).name}
                </h3>
                <p className="mt-2.5 text-[15px] leading-[24px] font-normal text-white/75">{p.body}</p>
              </Link>
              <HoverRule />
            </Reveal>
          ))}
        </ul>

        <Reveal delay={1}>
          <div className="mt-6 rounded-[14px] bg-ink p-6 sm:p-8 lg:mt-8 lg:p-10">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between lg:gap-10">
              <h3 className="shrink-0 font-[family-name:var(--font-sub)] text-[22px] leading-tight tracking-[0.03em] text-white uppercase sm:text-[24px]">
                {s.howHeading}
              </h3>
              <BookButton label={s.bookLabel} className="w-full sm:w-auto" />
            </div>
            <ol className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-4 lg:gap-4">
              {s.how.map((step, i) => (
                <li
                  key={step}
                  className="flex items-center gap-4 rounded-[12px] bg-white/[0.04] px-4 py-4 ring-1 ring-white/[0.08] lg:flex-col lg:items-start lg:gap-3 lg:px-5 lg:py-5"
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gold font-[family-name:var(--font-display)] text-[19px] leading-none text-ink">
                    {i + 1}
                  </span>
                  <span className="font-[family-name:var(--font-sub)] text-[17px] leading-[1.2] font-semibold tracking-[0.03em] text-white uppercase">
                    {step}
                  </span>
                </li>
              ))}
            </ol>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ── 3. Choose your odour treatment ───────────────────────────────────────
   "THREE ODOUR LEVELS — MILD +£60 · MODERATE +£90 · STRONG +£100". A card
   each, the price large, and under it a bar filled to the treatment's share
   of the longest — 15, 30, 60 minutes — so the three read as one scale. */

function Tiers() {
  const s = ODOUR.tiers;
  return (
    <section id="treatments" className="w-full scroll-mt-24 py-16 lg:py-[104px]">
      <div className="shell">
        <SectionHead title={s.heading} />
        <Kicker>{s.title}</Kicker>

        <ul className="mt-12 grid gap-4 lg:grid-cols-3 lg:gap-5">
          {s.items.map((t, i) => (
            <TierCard key={t.name} tier={t} index={i} />
          ))}
        </ul>

        <Reveal delay={1}>
          <div className="mt-6 flex flex-col gap-6 rounded-[14px] bg-gold/[0.07] p-6 ring-1 ring-gold/40 sm:p-8 lg:mt-8 lg:flex-row lg:items-center lg:justify-between lg:gap-12 lg:p-10">
            <div className="flex flex-col gap-4 sm:flex-row sm:gap-5">
              <IconDisc name="whatsapp" size={46} solid />
              <div>
                <h3 className="font-[family-name:var(--font-sub)] text-[20px] leading-tight tracking-[0.03em] text-white uppercase sm:pt-2 sm:text-[22px]">
                  {s.unsure.title}
                </h3>
                {s.unsure.body.map((p, i) => (
                  <p
                    key={p}
                    className={`mt-2 max-w-[70ch] text-[15px] leading-[24px] font-normal ${
                      i === 0 ? "text-white/85" : "text-white/65"
                    }`}
                  >
                    {p}
                  </p>
                ))}
              </div>
            </div>
            <WhatsAppButton label={s.unsure.whatsappLabel} className="w-full shrink-0 lg:w-auto" />
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function TierCard({ tier: t, index }: { tier: Tier; index: number }) {
  const s = ODOUR.tiers;
  return (
    <Reveal as="li" delay={index} className="surface group relative flex flex-col overflow-hidden p-6 sm:p-7">
      <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-2">
        <h3 className="font-[family-name:var(--font-sub)] text-[21px] leading-[1.05] tracking-[0.03em] text-white uppercase">
          {t.name}
        </h3>
        <p className="shrink-0 font-[family-name:var(--font-display)] text-[46px] leading-[0.85] whitespace-nowrap text-gold lg:text-[52px]">
          {t.price}
        </p>
      </div>

      <div className="mt-5">
        <p className="flex items-center gap-2 font-[family-name:var(--font-ui)] text-[12.5px] font-semibold tracking-[0.12em] text-white uppercase">
          <Icon name="clock" size={17} className="shrink-0 text-gold" />
          {t.duration}
        </p>
        <span aria-hidden className="mt-3 block h-1.5 overflow-hidden rounded-full bg-white/[0.07]">
          <span
            className="block h-full rounded-full bg-[linear-gradient(90deg,var(--color-gold),var(--color-gold-bright))]"
            style={{ width: `${(t.minutes / 60) * 100}%` }}
          />
        </span>
      </div>

      <p className="mt-5 text-[15px] leading-[24px] font-normal text-white/85">{t.lead}</p>
      <Label className="mt-5">{s.examplesLabel}</Label>
      <ul className="mt-3 grid gap-2">
        {t.examples.map((e) => (
          <li key={e} className="flex gap-2.5 text-[14.5px] leading-[21px] font-normal text-white/80">
            <span aria-hidden className="mt-[8px] h-1.5 w-1.5 shrink-0 rounded-full bg-gold" />
            {e}
          </li>
        ))}
      </ul>
      <p className="mt-6 rounded-[10px] bg-white/[0.04] px-4 py-3 text-[13.5px] leading-[20px] font-semibold text-white/90 ring-1 ring-white/[0.07]">
        {s.mustAdd}
      </p>
      <div className="mt-auto pt-6">
        <BookButton label={t.bookLabel} inCard className="w-full" />
      </div>
      <HoverRule />
    </Reveal>
  );
}

/* ── 4. The process ───────────────────────────────────────────────────────
   "Use: INSPECT → CLEAN → TARGET SOURCE → OZONE → CIRCULATE → VENTILATE".
   That line is the band's picture, ozone the one gold stage so "cleaning
   first" is visible before it is read; the six steps follow it as cards
   with the brief's full wording. Beside the heading, the machine itself, in
   an empty car — which is the step's own rule. */

const STEP_ICONS: IconName[] = ["search", "vacuum", "target", "ozone", "refresh", "wind"];

function Process() {
  const s = ODOUR.process;
  return (
    <section id="process" className="w-full bg-gold-wash py-16 lg:py-[104px]">
      <div className="shell">
        <div className="grid items-center gap-10 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-7">
            <SectionHead title={s.heading} tone="gold" />
            <Kicker onGold>{s.title}</Kicker>
            <Reveal delay={3}>
              <p className="measure mt-5 text-[18px] leading-[28px] font-semibold text-ink">{s.lead}</p>
            </Reveal>
          </div>
          <Reveal delay={2} className="lg:col-span-5">
            <figure className="relative mx-auto max-w-[600px] overflow-hidden rounded-[14px] ring-1 ring-ink/15">
              <div className="relative aspect-[3/2] w-full">
                <Image
                  src={PHOTOS.ozone.src}
                  alt={PHOTOS.ozone.alt}
                  fill
                  sizes="(min-width: 1024px) 38vw, 92vw"
                  className="object-cover"
                />
              </div>
            </figure>
          </Reveal>
        </div>

        {/* The layout's line, as a strip. */}
        <Reveal delay={1}>
          <ol aria-hidden className="mt-12 grid grid-cols-2 gap-2.5 rounded-[14px] bg-ink p-3 sm:grid-cols-3 lg:grid-cols-6">
            {s.steps.map((step, i) => {
              const gold = i === 3;
              const last = i === s.steps.length - 1;
              return (
                <li
                  key={step.flow}
                  className={`flex min-h-[78px] flex-col justify-between rounded-[10px] px-4 py-3 ${
                    gold ? "bg-gold text-ink" : "bg-white/[0.04] text-white ring-1 ring-white/[0.08]"
                  }`}
                >
                  <span className="flex items-center justify-between">
                    <span
                      className={`font-[family-name:var(--font-display)] text-[18px] leading-none ${
                        gold ? "text-ink/70" : "text-gold"
                      }`}
                    >
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    {!last && <Icon name="arrow" size={15} className={gold ? "text-ink/60" : "text-white/35"} />}
                  </span>
                  <span className="mt-2.5 font-[family-name:var(--font-sub)] text-[15.5px] leading-tight font-semibold tracking-[0.05em] uppercase">
                    {step.flow}
                  </span>
                </li>
              );
            })}
          </ol>
        </Reveal>

        <ol className="mt-6 grid gap-4 sm:grid-cols-2 lg:mt-8 lg:grid-cols-3 lg:gap-5">
          {s.steps.map((step, i) => (
            <ProcessStep key={step.title} step={step} n={i + 1} />
          ))}
        </ol>
      </div>
    </section>
  );
}

function ProcessStep({ step, n }: { step: Step; n: number }) {
  const para = (html: string) => (
    <p
      key={html}
      className="mt-2.5 text-[14.5px] leading-[23px] font-normal text-white/75 [&_strong]:font-semibold [&_strong]:text-white"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
  return (
    <Reveal as="li" delay={n % 3} className="surface-on-gold group relative flex flex-col overflow-hidden p-6 sm:p-7">
      <div className="flex items-start justify-between gap-4">
        <IconDisc name={STEP_ICONS[n - 1] ?? "check"} />
        <span
          aria-hidden
          className="font-[family-name:var(--font-display)] text-[48px] leading-[0.8] text-white/[0.09]"
        >
          {String(n).padStart(2, "0")}
        </span>
      </div>
      <Label className="mt-5">Step {n}</Label>
      <h3 className="mt-1 font-[family-name:var(--font-sub)] text-[20px] leading-tight tracking-[0.02em] text-white uppercase sm:text-[21px]">
        {step.title}
      </h3>
      {step.body.map(para)}
      {step.list && (
        <div className="mt-4 rounded-[10px] bg-white/[0.04] px-4 py-3.5 ring-1 ring-white/[0.07]">
          <p className="text-[13.5px] leading-[20px] font-semibold text-gold">{step.list.lead}</p>
          <ul className="mt-2 grid gap-1.5">
            {step.list.items.map((item) => (
              <li key={item} className="flex gap-2.5 text-[14px] leading-[20px] font-semibold text-white/90">
                <span aria-hidden className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-gold" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      )}
      {step.after?.map((html) => (
        <p
          key={html}
          className="mt-3.5 text-[14.5px] leading-[23px] font-semibold text-white"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      ))}
      <HoverRule />
    </Reveal>
  );
}

/* ── 5. What types of odours can we treat? ────────────────────────────────
   "Use visual cards." Four, each marked by what the smell comes from — there
   are no smoke or pet photographs to use, and none is borrowed — and the
   fifth, specialist contamination, set apart as the one that is not this
   service. */

const TYPE_ICONS: Record<string, IconName> = {
  Pets: "paw",
  Smoke: "smoke",
  "Food & Drink": "cup",
  "General Interior Odours": "wind",
};

function Types() {
  const s = ODOUR.types;
  return (
    <section className="w-full py-16 lg:py-[104px]">
      <div className="shell">
        <div className="grid gap-6 lg:grid-cols-12 lg:items-end lg:gap-16">
          <div className="lg:col-span-7">
            <SectionHead title={s.heading} />
            <Kicker>{s.title}</Kicker>
          </div>
          <Reveal delay={3} className="lg:col-span-5">
            <Prose html={s.lead} className="lg:mt-0" />
          </Reveal>
        </div>

        <ul className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-5">
          {s.items.map((t, i) => (
            <Reveal as="li" key={t.name} delay={i} className="surface group relative overflow-hidden p-6 sm:p-7">
              <div
                aria-hidden
                className="absolute -top-10 -right-10 h-36 w-36 rounded-full bg-[radial-gradient(circle,rgba(193,146,49,0.16),transparent_70%)]"
              />
              <IconDisc name={TYPE_ICONS[t.name] ?? "check"} size={58} />
              <h3 className="relative mt-6 font-[family-name:var(--font-sub)] text-[21px] leading-tight tracking-[0.02em] text-white uppercase">
                {t.name}
              </h3>
              <ul className="relative mt-4 flex flex-wrap gap-2">
                {t.items.map((item) => (
                  <li
                    key={item}
                    className="rounded-full bg-white/[0.05] px-3 py-1.5 text-[13.5px] leading-[18px] font-normal text-white/85 ring-1 ring-white/10"
                  >
                    {item}
                  </li>
                ))}
              </ul>
              <HoverRule />
            </Reveal>
          ))}
        </ul>

        <Reveal delay={1}>
          <div className="mt-6 flex flex-col gap-6 rounded-[14px] bg-gold/[0.07] p-6 ring-1 ring-gold/45 sm:p-8 lg:mt-8 lg:flex-row lg:items-center lg:justify-between lg:gap-12 lg:p-10">
            <div className="flex flex-col gap-4 sm:flex-row sm:gap-5">
              <IconDisc name="warning" size={50} solid />
              <div>
                <h3 className="font-[family-name:var(--font-sub)] text-[20px] leading-tight tracking-[0.03em] text-white uppercase sm:pt-2.5 sm:text-[22px]">
                  {s.specialist.title}
                </h3>
                <p
                  className="mt-2.5 max-w-[75ch] text-[15.5px] leading-[25px] font-normal text-white/80 [&_strong]:font-semibold [&_strong]:text-white"
                  dangerouslySetInnerHTML={{ __html: s.specialist.bodyHtml }}
                />
                <p className="mt-2 text-[15px] leading-[24px] font-normal text-white/65">{s.specialist.unsure}</p>
              </div>
            </div>
            <ContactButton label={s.specialist.ctaLabel} className="w-full shrink-0 lg:w-auto" />
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ── 6. Important: odour removal is not guaranteed ────────────────────────
   "This must be prominent. Do NOT hide it exclusively in the T&Cs.
   Highlight: COMPLETE OR PERMANENT ODOUR REMOVAL CANNOT BE GUARANTEED." The
   sixteen factors in one panel beside the statement that introduces them,
   then the brief's "OUR COMMITMENT" as the band's one dark panel — its
   "However:" leading into the line, set in the display face at the size of
   a section heading. */

function Guarantee() {
  const s = ODOUR.guarantee;
  const c = s.commitment;
  return (
    <section id="no-guarantee" className="w-full scroll-mt-24 bg-gold-wash py-16 lg:py-[104px]">
      <div className="shell">
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-14">
          <div className="lg:col-span-5">
            <SectionHead title={s.heading} tone="gold" />
            <Kicker onGold>{s.title}</Kicker>
            <Reveal delay={3}>
              <p
                className="mt-5 text-[18px] leading-[29px] font-normal text-ink/85 [&_strong]:font-semibold [&_strong]:text-ink"
                dangerouslySetInnerHTML={{ __html: s.leadHtml }}
              />
              <Prose html={s.body} onGold />
            </Reveal>
          </div>

          <Reveal delay={2} className="lg:col-span-7">
            <div className="surface-on-gold p-6 sm:p-8 lg:p-10">
              <div className="flex items-center gap-3">
                <IconDisc name="info" size={40} />
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
            </div>
          </Reveal>
        </div>

        <Reveal delay={1}>
          <div className="relative mt-6 overflow-hidden rounded-[14px] bg-ink p-6 ring-1 ring-gold/40 sm:p-8 lg:mt-8 lg:p-12">
            <div
              aria-hidden
              className="absolute inset-0"
              style={{ background: "radial-gradient(60% 90% at 85% 100%, rgba(193,146,49,0.14) 0%, transparent 70%)" }}
            />
            <div className="relative grid gap-8 lg:grid-cols-12 lg:items-center lg:gap-12">
              <div className="lg:col-span-5">
                <div className="flex items-center gap-3">
                  <IconDisc name="shield" size={42} solid />
                  <h3 className="font-[family-name:var(--font-ui)] text-[12px] font-semibold tracking-[0.22em] text-gold uppercase">
                    {c.title}
                  </h3>
                </div>
                <p className="mt-5 text-[16px] leading-[26px] font-normal text-white/80">{c.body}</p>
              </div>
              <div className="lg:col-span-7">
                <p className="font-[family-name:var(--font-sub)] text-[17px] tracking-[0.04em] text-white/60 uppercase">
                  {c.however}
                </p>
                <p className="mt-2 font-[family-name:var(--font-heading)] text-[23px] leading-[1.05] font-black text-gold uppercase min-[400px]:text-[28px] sm:text-[38px] lg:text-[46px]">
                  {c.statement}
                </p>
                <p
                  className="mt-5 max-w-[70ch] text-[15.5px] leading-[25px] font-normal text-white/75 [&_strong]:font-semibold [&_strong]:text-white"
                  dangerouslySetInnerHTML={{ __html: c.paymentHtml }}
                />
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ── 7 & 8. Why can a smell return? · Cabin / pollen filter ───────────────
   "Educational section explaining inaccessible sources." The five places
   liquid can travel as a path, top to bottom, and beside it the cabin
   filter — the other hidden source — as a card of its own with the old
   page's air-vent photograph and the brief's IMPORTANT note. */

function Hidden() {
  const r = ODOUR.returns;
  const f = ODOUR.filter;
  return (
    <section className="w-full py-16 lg:py-[104px]">
      <div className="shell grid gap-12 lg:grid-cols-12 lg:gap-14">
        <div className="lg:col-span-7">
          <SectionHead title={r.heading} />
          <Kicker>{r.title}</Kicker>
          <Reveal delay={3}>
            <p className="measure mt-5 text-[18px] leading-[28px] font-semibold text-white">{r.lead}</p>
            <Label className="mt-7">{r.listLead}</Label>
            <ol className="mt-4">
              {r.list.map((item, i) => {
                const last = i === r.list.length - 1;
                return (
                  <li key={item} className={`relative flex items-center gap-4 ${last ? "" : "pb-3"}`}>
                    {!last && (
                      <span aria-hidden className="absolute top-9 bottom-0 left-[17px] w-[2px] rounded-full bg-gold/25" />
                    )}
                    <span className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gold/12 text-gold ring-1 ring-gold/35">
                      <Icon name="arrow" size={15} strokeWidth={2.2} className="rotate-90" />
                    </span>
                    <span className="text-[15.5px] leading-[22px] font-semibold text-white/90">{item}</span>
                  </li>
                );
              })}
            </ol>
            {r.body.map((p, i) => (
              <Prose key={p} html={p} space={i === 0 ? "mt-7" : "mt-4"} />
            ))}
            <p className="mt-6 border-l-2 border-gold pl-4 text-[17px] leading-[26px] font-semibold text-white">
              {r.strong}
            </p>
            <Prose html={r.after} />
          </Reveal>
        </div>

        <Reveal delay={2} className="lg:col-span-5">
          <article className="surface overflow-hidden lg:sticky lg:top-32">
            <div className="relative aspect-[16/9] w-full">
              <Image
                src={PHOTOS.vent.src}
                alt={PHOTOS.vent.alt}
                fill
                sizes="(min-width: 1024px) 36vw, 92vw"
                className="object-cover"
              />
              <div
                aria-hidden
                className="absolute inset-x-0 bottom-0 h-1/2 bg-[linear-gradient(to_top,rgba(13,13,13,0.95),transparent)]"
              />
            </div>
            <div className="p-6 sm:p-7">
              <div className="flex items-center gap-3">
                <IconDisc name="filter" size={42} />
                <h2 className="font-[family-name:var(--font-sub)] text-[22px] leading-tight font-semibold tracking-[0.03em] text-white uppercase sm:text-[24px]">
                  {f.heading}
                </h2>
              </div>
              <h3 className="mt-4 font-[family-name:var(--font-sub)] text-[17px] leading-tight font-semibold tracking-[0.03em] text-gold uppercase">
                {f.title}
              </h3>
              {f.body.map((p) => (
                <p key={p} className="mt-3 text-[15px] leading-[24px] font-normal text-white/75">
                  {p}
                </p>
              ))}
              <div className="mt-6 rounded-[12px] bg-gold/[0.07] p-5 ring-1 ring-gold/40">
                <p className="flex items-center gap-2.5 font-[family-name:var(--font-ui)] text-[11.5px] font-semibold tracking-[0.22em] text-gold uppercase">
                  <Icon name="info" size={16} className="shrink-0" />
                  {f.important.title}
                </p>
                <p className="mt-2.5 text-[15px] leading-[23px] font-semibold text-white">{f.important.strong}</p>
                <p className="mt-2 text-[14.5px] leading-[23px] font-normal text-white/70">{f.important.body}</p>
              </div>
            </div>
          </article>
        </Reveal>
      </div>
    </section>
  );
}

/* ── 9. Specialist contamination ──────────────────────────────────────────
   "Link to Vomit Cleaning and Mould Removal pages." Four cards, the two
   with a service of their own linked to it, and the brief's IMPORTANT line
   as the band's one dark panel beside the contact button. */

const SPECIALIST_ICONS: IconName[] = ["droplet", "mould", "camera", "cup"];

function Specialist() {
  const s = ODOUR.specialist;
  return (
    <section className="w-full bg-gold-wash py-16 lg:py-[104px]">
      <div className="shell">
        <div className="grid gap-6 lg:grid-cols-12 lg:items-end lg:gap-16">
          <div className="lg:col-span-7">
            <SectionHead title={s.heading} tone="gold" />
            <Kicker onGold>{s.title}</Kicker>
          </div>
          <Reveal delay={3} className="lg:col-span-5">
            <Prose html={s.lead} onGold className="lg:mt-0" />
          </Reveal>
        </div>

        <ul className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-5">
          {s.items.map((it, i) => (
            <Reveal as="li" key={it.title} delay={i} className="surface-on-gold group relative overflow-hidden p-6 sm:p-7">
              <IconDisc name={SPECIALIST_ICONS[i] ?? "info"} size={50} />
              <h3 className="mt-5 font-[family-name:var(--font-sub)] text-[20px] leading-tight tracking-[0.02em] text-white uppercase">
                {it.title}
              </h3>
              <p
                className="mt-3 text-[15px] leading-[24px] font-normal text-white/75 [&_a]:font-semibold [&_a]:text-gold [&_a]:underline [&_a]:underline-offset-2 [&_a:hover]:text-gold-bright"
                dangerouslySetInnerHTML={{ __html: it.bodyHtml }}
              />
              <HoverRule />
            </Reveal>
          ))}
        </ul>

        <Reveal delay={1}>
          <Link
            href={s.related.href}
            className="group mt-5 inline-flex items-center gap-2.5 rounded-full bg-ink px-5 py-3 text-[14.5px] font-semibold text-white transition-colors hover:text-gold"
          >
            <Icon name="droplet" size={17} className="shrink-0 text-gold" />
            {s.related.label}
            <Icon name="arrow" size={16} className="shrink-0 transition-transform duration-300 group-hover:translate-x-1" />
          </Link>
        </Reveal>

        <Reveal delay={1}>
          <div className="mt-6 flex flex-col gap-6 rounded-[14px] bg-ink p-6 ring-1 ring-gold/40 sm:p-8 lg:mt-8 lg:flex-row lg:items-center lg:justify-between lg:gap-12 lg:p-10">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-5">
              <IconDisc name="warning" size={46} solid />
              <div>
                <h3 className="font-[family-name:var(--font-ui)] text-[12px] font-semibold tracking-[0.22em] text-gold uppercase">
                  {s.important.title}
                </h3>
                <p className="mt-2 text-[17px] leading-[27px] font-semibold text-white sm:text-[18px]">
                  {s.important.body}
                </p>
              </div>
            </div>
            <ContactButton label={s.ctaLabel} className="w-full shrink-0 lg:w-auto" />
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ── 10. Which valet should I add it to? ──────────────────────────────────
   "PACKAGE SELECTOR — Triton / Zeus / Medusa Gold." Three cards, each named
   for the valet and linked to its page, its "Best for:" leading, and its
   own booking button at the foot so the three share a baseline. */

function Selector() {
  const s = ODOUR.selector;
  return (
    <section id="choose-valet" className="w-full scroll-mt-24 py-16 lg:py-[104px]">
      <div className="shell">
        <SectionHead title={s.heading} />
        <Kicker>{s.title}</Kicker>

        <ul className="mt-12 grid gap-4 md:grid-cols-3 lg:gap-5">
          {s.items.map((it, i) => (
            <Reveal as="li" key={it.valet} delay={i} className="surface group relative flex flex-col overflow-hidden p-6 sm:p-7">
              <span className="font-[family-name:var(--font-display)] text-[30px] leading-none text-gold/90">
                {String(i + 1).padStart(2, "0")}
              </span>
              <h3 className="mt-4 font-[family-name:var(--font-sub)] text-[21px] leading-tight tracking-[0.02em] uppercase sm:text-[22px]">
                <Link
                  href={valet(it.valet).href}
                  className="text-white underline decoration-gold/45 underline-offset-[5px] transition-colors hover:text-gold"
                >
                  {valet(it.valet).name}
                </Link>
              </h3>
              <p className="mt-4 rounded-[10px] bg-white/[0.04] px-4 py-3 text-[14.5px] leading-[22px] font-normal text-white/85 ring-1 ring-white/[0.07]">
                <strong className="mr-1 font-semibold text-gold">{s.bestFor}</strong>
                {it.bestFor}
              </p>
              <p className="mt-4 text-[15px] leading-[24px] font-normal text-white/75">{it.body}</p>
              <div className="mt-auto pt-6">
                <BookButton label={it.bookLabel} inCard className="w-full" />
              </div>
              <HoverRule />
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}

/* ── 11. Pricing ──────────────────────────────────────────────────────────
   The brief's three-column table, as a table — three columns fit a phone —
   and its IMPORTANT note beside it with the booking button. */

function Pricing() {
  const s = ODOUR.pricing;
  return (
    <section id="pricing" className="w-full scroll-mt-24 bg-gold-wash py-16 lg:py-[104px]">
      <div className="shell grid gap-10 lg:grid-cols-12 lg:items-center lg:gap-14">
        <div className="lg:col-span-5">
          <SectionHead title={s.heading} tone="gold" />
          <Kicker onGold>{s.title}</Kicker>
          <Reveal delay={3}>
            <div className="mt-7 rounded-[14px] bg-ink/[0.08] p-5 ring-1 ring-ink/25 sm:p-6">
              <p className="flex items-center gap-2.5 font-[family-name:var(--font-ui)] text-[11.5px] font-semibold tracking-[0.22em] text-ink uppercase">
                <Icon name="info" size={16} className="shrink-0" />
                {s.important.title}
              </p>
              {s.important.bodyHtml.map((html) => (
                <p
                  key={html}
                  className="mt-2.5 text-[15.5px] leading-[24px] font-normal text-ink/85 [&_strong]:font-semibold [&_strong]:text-ink"
                  dangerouslySetInnerHTML={{ __html: html }}
                />
              ))}
            </div>
          </Reveal>
        </div>

        <Reveal delay={2} className="min-w-0 lg:col-span-7">
          <div className="surface-on-gold overflow-hidden">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-white/[0.08]">
                  {/* Three columns from `sm`. On a phone the treatment time
                      moves under the level, because three columns of
                      display type were 361px wide at their narrowest. */}
                  {s.columns.map((c, i) => (
                    <th
                      key={c}
                      scope="col"
                      className={`px-4 py-4 font-[family-name:var(--font-ui)] text-[11px] font-semibold tracking-[0.16em] text-gold uppercase sm:px-7 sm:text-[11.5px] lg:px-5 xl:px-7 ${
                        i === 2 ? "text-right" : ""
                      } ${i === 1 ? "hidden sm:table-cell" : ""}`}
                    >
                      {c}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {s.rows.map(([level, time, price]) => (
                  <tr key={level} className="border-b border-white/[0.06] last:border-b-0">
                    <th
                      scope="row"
                      className="px-4 py-5 font-[family-name:var(--font-sub)] text-[18px] font-semibold tracking-[0.03em] text-white uppercase sm:px-7 sm:text-[21px] lg:px-5 xl:px-7"
                    >
                      {level}
                      <span className="mt-1.5 flex items-center gap-1.5 font-[family-name:var(--font-ui)] text-[12.5px] font-normal tracking-normal text-white/70 normal-case sm:hidden">
                        <Icon name="clock" size={14} className="shrink-0 text-gold" />
                        {time}
                      </span>
                    </th>
                    <td className="hidden px-4 py-5 text-[14.5px] text-white/80 sm:table-cell sm:px-7 sm:text-[15.5px] lg:px-5 xl:px-7">
                      <span className="inline-flex items-center gap-2">
                        <Icon name="clock" size={16} className="shrink-0 text-gold" />
                        {time}
                      </span>
                    </td>
                    <td className="px-4 py-5 text-right font-[family-name:var(--font-display)] text-[30px] leading-none whitespace-nowrap text-gold sm:px-7 sm:text-[38px] lg:px-5 lg:text-[34px] xl:px-7 xl:text-[38px]">
                      {price}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="border-t border-white/[0.08] px-4 py-5 sm:px-7">
              <BookButton label={s.bookLabel} className="w-full sm:w-auto" />
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ── 12. Why choose Medusa? ─────────────────────────────────────────────── */

const WHY_ICONS: Record<string, IconName> = {
  "Clean First": "vacuum",
  "Treatment Options": "clock",
  "Realistic Expectations": "gauge",
  "Mobile Service": "van",
  "Professional Valeting": "shield",
};

function WhyMedusa() {
  const w = ODOUR.why;
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

        {/* Five cards: three over two from `lg`, on a six-track grid so the
            second row's pair fills the width rather than leaving a hole. */}
        <ul className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-6 lg:gap-5">
          {w.items.map((it, i) => (
            <Reveal
              as="li"
              key={it.title}
              delay={i % 3}
              className={`surface group relative overflow-hidden p-6 sm:p-7 ${
                i < 3 ? "lg:col-span-2" : "lg:col-span-3"
              } ${i === 4 ? "sm:col-span-2 lg:col-span-3" : ""}`}
            >
              <div className="flex items-center gap-4 sm:block">
                <IconDisc name={WHY_ICONS[it.title] ?? "check"} size={50} />
                <h3 className="font-[family-name:var(--font-sub)] text-[20px] leading-tight text-white uppercase sm:mt-6">
                  {it.title}
                </h3>
              </div>
              {it.body.map((p, j) => (
                <p
                  key={p}
                  className={`mt-3 text-[15px] leading-[25px] ${
                    it.title === "Realistic Expectations" && j === 1
                      ? "font-semibold text-white"
                      : "font-normal text-white/75"
                  }`}
                >
                  {p}
                </p>
              ))}
              <HoverRule />
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}

/* ── 14. FAQ ──────────────────────────────────────────────────────────────
   "Accordion." */

function Faq() {
  const f = ODOUR.faq;
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

/* ── 15. Important service terms ──────────────────────────────────────────
   "The following should be clearly displayed" — the eight, numbered as the
   brief numbers them, the first with the three valets it names, and the
   customer acknowledgement as the band's last and strongest line. */

function Terms() {
  const s = ODOUR.terms;
  return (
    <section id="terms" className="w-full scroll-mt-24 bg-gold-wash py-16 lg:py-[104px]">
      <div className="shell">
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-14">
          <div className="lg:col-span-4">
            <div className="lg:sticky lg:top-32">
              <SectionHead title={s.heading} tone="gold" />
              <Kicker onGold>{s.title}</Kicker>
            </div>
          </div>

          <Reveal delay={2} className="lg:col-span-8">
            <ol className="surface-on-gold px-6 py-3 sm:px-8 sm:py-4 lg:px-10">
              {s.list.map((t, i) => (
                <li key={t} className="flex gap-4 border-b border-white/[0.06] py-4 last:border-b-0">
                  <span
                    aria-hidden
                    className="w-7 shrink-0 font-[family-name:var(--font-display)] text-[19px] leading-[23px] text-gold"
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <p className="text-[15.5px] leading-[23px] font-semibold text-white">{t}</p>
                    {i === 0 && (
                      <>
                        <p className="mt-2 text-[14.5px] leading-[22px] font-semibold text-white/80">{s.firstWith}</p>
                        <ul className="mt-2.5 flex flex-wrap gap-2">
                          {(Object.keys(VALETS) as (keyof typeof VALETS)[]).map((k) => (
                            <li key={k}>
                              <Link
                                href={valet(k).href}
                                className="inline-flex items-center rounded-full bg-gold/12 px-3 py-1.5 font-[family-name:var(--font-ui)] text-[11.5px] font-semibold tracking-[0.1em] text-gold uppercase ring-1 ring-gold/35 transition-colors hover:bg-gold hover:text-ink"
                              >
                                {valet(k).name}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </>
                    )}
                  </div>
                </li>
              ))}
            </ol>
          </Reveal>
        </div>

        <Reveal delay={1}>
          <div className="mt-6 flex flex-col gap-4 rounded-[14px] bg-ink p-6 ring-1 ring-gold/40 sm:flex-row sm:gap-6 sm:p-8 lg:mt-8 lg:p-10">
            <IconDisc name="shield" size={48} solid />
            <div>
              <h3 className="font-[family-name:var(--font-ui)] text-[11.5px] font-semibold tracking-[0.22em] text-gold uppercase">
                {s.acknowledgement.title}
              </h3>
              <p className="mt-2.5 max-w-[90ch] text-[16.5px] leading-[27px] font-semibold text-white sm:text-[17.5px] sm:leading-[29px]">
                {s.acknowledgement.body}
              </p>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ── 16. Final CTA ─────────────────────────────────────────────────────────
   "Repeat pricing and eligible valets." The three treatments, the three
   valets and the no-guarantee line in one card beside the two buttons; the
   sticky bar steps aside while it is on screen. */

function FinalCta() {
  const f = ODOUR.finalCta;
  return (
    <section
      id="odour-final"
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
            <p className="measure mt-6 text-[17px] leading-[28px] font-normal text-body">{f.body}</p>
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
            <ul className="divide-y divide-white/[0.07]">
              {f.prices.map((p) => {
                const [price, time] = p.line.split(/\s+—\s+/);
                return (
                  <li key={p.name} className="flex items-center justify-between gap-4 px-6 py-4 sm:px-7">
                    <span className="font-[family-name:var(--font-ui)] text-[13px] font-semibold tracking-[0.16em] text-white/85 uppercase">
                      {p.name}
                    </span>
                    <span className="flex flex-col items-end gap-1 whitespace-nowrap sm:flex-row sm:items-baseline sm:gap-3">
                      <span className="font-[family-name:var(--font-display)] text-[30px] leading-none text-gold">
                        {price}
                      </span>
                      <span className="font-[family-name:var(--font-ui)] text-[11.5px] font-semibold tracking-[0.14em] text-white/60 uppercase">
                        {time}
                      </span>
                    </span>
                  </li>
                );
              })}
            </ul>
            <div className="border-t border-white/[0.07] px-6 py-5 sm:px-7">
              <Label>{f.withLabel}</Label>
              <ul className="mt-3 flex flex-wrap gap-2">
                {(Object.keys(VALETS) as (keyof typeof VALETS)[]).map((k) => (
                  <li key={k}>
                    <Link
                      href={valet(k).href}
                      className="inline-flex items-center rounded-full bg-white/[0.05] px-3 py-1.5 font-[family-name:var(--font-ui)] text-[11.5px] font-semibold tracking-[0.1em] text-white uppercase ring-1 ring-white/15 transition-colors hover:bg-gold hover:text-ink"
                    >
                      {valet(k).name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <p className="flex items-center gap-2.5 bg-gold/[0.08] px-6 py-4 text-[13.5px] leading-[20px] font-semibold text-gold sm:px-7">
              <Icon name="info" size={16} className="shrink-0" />
              {f.guarantee}
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
