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
import { HEADLIGHT, PATH, PHOTOS, SLUG, type Stage, TRACK } from "@/lib/headlight";
import { pageSchema } from "@/lib/schema";

/**
 * Headlight restoration — rebuilt from the client's brief.
 *
 * Client, 2026-10-06: "Completely replace/re-optimise the existing Headlight
 * Restoration page using the content below. KEEP EXISTING URL". Every word
 * of the brief's sections is in `lib/headlight.ts`; this file is only
 * layout, in the order of the brief's "ELEMENTOR PAGE STRUCTURE":
 *
 *   1 hero · 3 problem cards · 4 restore vs replace · 5 the five stages ·
 *   6 what it can treat · 7 what it can't fix · 8 light output · 9 UV
 *   protection · 10 pricing · 12 why Medusa · 13 is it right for my car,
 *   with 14 pre-sale beside it · 15 reviews · 16 FAQ · 17 important
 *   information · 18 the closing band.
 *
 * **Sections 2 and 11, the before & after slider and gallery, are not
 * built.** The brief wants both "extremely high on the page" because "this
 * service is visual", and both on "genuine Medusa jobs" only — "Do NOT
 * heavily edit the photographs … The transformation needs to represent
 * genuine Medusa work". No such photograph exists. What the page can do
 * honestly toward "this page needs to SELL VISUALLY" it does: the hero's
 * photograph comes straight after its buttons on a phone, each problem card
 * carries a small drawn lens showing its word (yellow, cloudy, hazy …) —
 * a picture of the condition, not of anyone's car — and the five stages are
 * a strip before they are prose.
 *
 * Sections 13 and 14 share a band — "You're preparing your vehicle for
 * sale" is one of Section 13's reasons, and Section 14 is that reason
 * spelled out — which is what keeps gold and ink alternating the whole way
 * down (client, 2026-09-22: "pastikan warna bg tetap selang seling") and
 * puts the gold service information over the ink close.
 *
 * "MOBILE UX — The first mobile screen should communicate: HEADLIGHT
 * RESTORATION LONDON · FROM £100 · WET SANDING • POLISHING • UV PROTECTION ·
 * [BOOK NOW]": the h1, the brief's subheading, one panel of the price and
 * the three methods, then the buttons — all above the fold at 375x812. The
 * three hero paragraphs follow the photograph, not precede it: "Do not put
 * huge blocks of text above the first restoration result."
 */

const BOOK = HEADLIGHT.book;
const WHATSAPP = HEADLIGHT.whatsapp;

export function generateMetadata(): Metadata {
  const { title, description } = HEADLIGHT.seo;
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

export default function HeadlightRestorationPage() {
  const page = getPage(SLUG);
  if (!page) notFound();

  return (
    <>
      {/* "STRUCTURED DATA — Service schema, FAQPage schema. Do not add
          unsupported ratings or fabricated review markup." */}
      <JsonLd
        data={pageSchema(page, {
          service: {
            slug: SLUG,
            name: "Headlight Restoration",
            serviceType: "Mobile headlight restoration",
            description: HEADLIGHT.seo.description,
            image: PHOTOS.hero.src,
            /* "starts from £100. Final pricing can depend on the condition" —
               a floor, so it is minPrice rather than an exact claim. */
            offer: {
              price: HEADLIGHT.pricing.amount.replace(/[^\d.]/g, ""),
              currency: "GBP",
              description: HEADLIGHT.faq.items[0].a.map((p) => p.replace(/<[^>]+>/g, "")).join(" "),
              from: true,
            },
          },
          faq: HEADLIGHT.faq.items,
        })}
      />
      <TrackClicks />

      <Header />
      <main className="flex-1">
        <Hero />
        <Signs />
        <Replace />
        <Process />
        <Treat />
        <CannotFix />
        <LightOutput />
        <UvProtection />
        <Pricing />
        <WhyMedusa />
        <Suitable />
        <Testimonials title={HEADLIGHT.reviews.heading} />
        <Faq />
        <Info />
        <FinalCta />
      </main>
      <Footer />

      {/* "MOBILE STICKY CTA — Use: BOOK NOW | WHATSAPP. Keep visible while
          scrolling." */}
      <StickyBookBar
        primary={{ label: HEADLIGHT.sticky.book, href: BOOK, track: TRACK.book }}
        secondary={{ label: HEADLIGHT.sticky.whatsapp, href: WHATSAPP, icon: "whatsapp", external: true }}
        after="headlight-hero-actions"
        hideOver={["headlight-final"]}
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

function WhatsAppButton({
  label,
  onGold,
  track,
  className = "",
}: {
  label: string;
  onGold?: boolean;
  /** An event of its own — the photo enquiry — instead of the plain
   *  WhatsApp click `TrackClicks` would report. */
  track?: string;
  className?: string;
}) {
  return (
    <a
      href={WHATSAPP}
      target="_blank"
      rel="noopener noreferrer"
      data-track={track}
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

/* The brief gives every section a name and then a heading — "WHAT HEADLIGHT
   RESTORATION CANNOT FIX" over "Not Every Headlight Problem Is on the
   Outside". The name is the h2, as on the other rebuilt pages; the heading
   is the line under it, in the condensed face. */
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

function Tick({ size = 20, cross }: { size?: number; cross?: boolean }) {
  return (
    <span
      className={`flex shrink-0 items-center justify-center rounded-full ${
        cross ? "bg-white/[0.08] text-white/60" : "bg-gold/15 text-gold"
      }`}
      style={{ width: size, height: size }}
    >
      <Icon name={cross ? "close" : "check"} size={Math.round(size * (cross ? 0.5 : 0.6))} strokeWidth={2.8} />
    </span>
  );
}

/*
  Two marks the site's set does not have: the sun, for UV, and the
  dashboard's headlamp symbol — a lens with its beam — for light output.
  Drawn on `Icon`'s own grid (24px, 1.75 stroke, round caps and joins,
  `currentColor`) so they read as the same family.
*/
type LocalIconName = "sun" | "beam";

const LOCAL_PATHS: Record<LocalIconName, React.ReactNode> = {
  sun: (
    <>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2.8v2.1M12 19.1v2.1M2.8 12h2.1M19.1 12h2.1M5.5 5.5 7 7M17 17l1.5 1.5M5.5 18.5 7 17M17 7l1.5-1.5" />
    </>
  ),
  beam: (
    <>
      <path d="M11.5 5.5C7.4 5.5 4 8.4 4 12s3.4 6.5 7.5 6.5V5.5Z" />
      <path d="M15 8h5.5M15 12h6M15 16h5.5" />
    </>
  ),
};

function LocalIcon({ name, size = 20, className }: { name: LocalIconName; size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
      focusable="false"
    >
      {LOCAL_PATHS[name]}
    </svg>
  );
}

function IconDisc({
  name,
  local,
  size = 46,
  solid,
}: {
  name?: IconName;
  local?: LocalIconName;
  size?: number;
  solid?: boolean;
}) {
  const glyph = Math.round(size * 0.46);
  return (
    <span
      className={`flex shrink-0 items-center justify-center rounded-full ${
        solid ? "bg-gold text-ink" : "bg-gold/12 text-gold ring-1 ring-gold/35"
      }`}
      style={{ width: size, height: size }}
    >
      {local ? <LocalIcon name={local} size={glyph} /> : <Icon name={name ?? "check"} size={glyph} />}
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

/** A short list the brief bullets — exposures, factors — set as pills. */
function Pills({ items, onGold }: { items: string[]; onGold?: boolean }) {
  return (
    <ul className="mt-4 flex flex-wrap gap-2">
      {items.map((item) => (
        <li
          key={item}
          className={`rounded-full px-3.5 py-1.5 text-[14px] leading-[19px] ${
            onGold
              ? "bg-ink/[0.08] font-semibold text-ink ring-1 ring-ink/20"
              : "bg-white/[0.05] font-normal text-white/85 ring-1 ring-white/10"
          }`}
        >
          {item}
        </li>
      ))}
    </ul>
  );
}

/** "From £100", as the price is set wherever it stands alone. */
function Price({ label, value, size = "md" }: { label: string; value: string; size?: "md" | "lg" }) {
  return (
    <p className="flex shrink-0 items-baseline gap-2.5 whitespace-nowrap">
      <span className="font-[family-name:var(--font-ui)] text-[12px] font-semibold tracking-[0.16em] text-white/75 uppercase">
        {label}
      </span>
      <span
        className={`font-[family-name:var(--font-display)] leading-[0.85] text-gold ${
          size === "lg" ? "text-[48px] sm:text-[58px]" : "text-[40px] sm:text-[46px]"
        }`}
      >
        {value}
      </span>
    </p>
  );
}

/* ── 1. Hero ──────────────────────────────────────────────────────────────
   "LEFT — H1, Short description, FROM £100, Trust/service points, BOOK NOW,
   WHATSAPP. RIGHT — Large genuine before/after headlight image." The h1,
   the brief's subheading, the price beside the three methods the mobile
   screen must show, both buttons and the small print. On the right, the
   old page's own headlight photograph — there is no before & after — over
   the card's six ticks. The three paragraphs close the hero beneath both
   columns, so a phone reaches the photograph before it reaches prose. */

const METHOD_ICONS: IconName[] = ["droplet", "spark", "shield"];

function Hero() {
  const h = HEADLIGHT.hero;
  const pts = HEADLIGHT.points;
  const [question, ...rest] = h.intro;

  return (
    <section className="cut-bottom relative w-full overflow-hidden bg-ink-panel pt-[124px] pb-[calc(var(--cut)+2.75rem)] lg:pt-[158px] lg:pb-[calc(var(--cut)+4rem)]">
      <div aria-hidden className="livery absolute inset-0 opacity-60" />
      {/* The beam. A headlight page should look lit from one side. */}
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(58% 70% at 82% 38%, rgba(237,179,38,0.17) 0%, rgba(193,146,49,0.05) 46%, transparent 76%)",
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

            {/* "FROM £100 · WET SANDING • POLISHING • UV PROTECTION". */}
            <Reveal delay={3}>
              <div className="mt-6 flex max-w-[600px] flex-col overflow-hidden rounded-[14px] bg-white/[0.04] ring-1 ring-gold/35 sm:flex-row xl:mt-8">
                <div className="flex items-center bg-gold/[0.1] px-5 py-3.5 sm:shrink-0 sm:px-7 sm:py-5">
                  <p className="flex items-baseline gap-2.5 whitespace-nowrap sm:flex-col sm:gap-1.5">
                    <span className="font-[family-name:var(--font-ui)] text-[12px] font-semibold tracking-[0.16em] text-white/75 uppercase">
                      {pts.price.label}
                    </span>
                    <span className="font-[family-name:var(--font-display)] text-[44px] leading-[0.85] text-gold sm:text-[56px]">
                      {pts.price.value}
                    </span>
                  </p>
                </div>
                <ul className="flex flex-1 flex-wrap items-center gap-x-4 gap-y-2.5 border-t border-gold/25 px-5 py-4 sm:flex-col sm:flex-nowrap sm:items-start sm:justify-center sm:border-t-0 sm:border-l sm:px-6">
                  {pts.methods.map((m, i) => (
                    <li
                      key={m}
                      className="flex items-center gap-2.5 text-[14px] leading-[19px] font-semibold whitespace-nowrap text-white sm:gap-3 sm:text-[14.5px]"
                    >
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gold text-ink sm:h-7 sm:w-7">
                        <Icon name={METHOD_ICONS[i]} size={14} strokeWidth={2.1} />
                      </span>
                      {m}
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>

            <Reveal delay={4}>
              <div id="headlight-hero-actions" className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap xl:mt-8">
                <BookButton label={h.bookLabel} className="w-full sm:w-auto" />
                <WhatsAppButton label={h.whatsappLabel} className="w-full sm:w-auto" />
              </div>
            </Reveal>

            {/* "SMALL TEXT:" — italic in the brief. */}
            <Reveal delay={5}>
              <p className="mt-4 flex max-w-[60ch] gap-2 text-[13.5px] leading-[20px] font-normal text-white/60 italic">
                <Icon name="info" size={15} className="mt-[2px] shrink-0 text-gold/80" />
                {h.small}
              </p>
            </Reveal>
          </div>

          <Reveal delay={4} className="lg:col-span-5">
            <HeroCard />
          </Reveal>
        </div>

        <Reveal delay={5}>
          <div className="mt-10 grid gap-4 border-t border-white/10 pt-7 md:grid-cols-12 md:gap-10 lg:mt-12">
            <p className="text-[18px] leading-[27px] font-semibold text-white md:col-span-4 lg:text-[20px] lg:leading-[30px]">
              {question}
            </p>
            <div className="grid gap-4 md:col-span-8 lg:grid-cols-2 lg:gap-8">
              {rest.map((html) => (
                <p
                  key={html}
                  className="text-[15px] leading-[25px] font-normal text-white/65 [&_strong]:font-semibold [&_strong]:text-white"
                  dangerouslySetInnerHTML={{ __html: html }}
                />
              ))}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* "HEADLIGHT RESTORATION FROM £100" and its six ticks, under the photograph. */
function HeroCard() {
  const c = HEADLIGHT.hero.card;
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
          className="object-cover object-[50%_45%]"
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
      </figcaption>
    </figure>
  );
}

/* ── 3. Do your headlights look like this? ────────────────────────────────
   "PROBLEM CARDS — YELLOW · CLOUDY · HAZY · OXIDISED". All six the copy
   names, each a card with a small drawn lens showing its word: the same
   headlamp under a film of yellow, of cloud, of haze. It illustrates the
   condition — no photograph of a customer's lens exists to show, and none
   is implied. The causes sit beside the heading as pills. */

const LENS_FILM: Record<string, React.CSSProperties> = {
  Yellow: { background: "linear-gradient(160deg, rgba(240,190,60,0.66), rgba(196,138,22,0.58))" },
  Cloudy: { background: "rgba(232,232,232,0.52)", backdropFilter: "blur(2.5px)" },
  Hazy: {
    background: "linear-gradient(180deg, rgba(255,255,255,0.36), rgba(255,255,255,0.12))",
    backdropFilter: "blur(1.2px)",
  },
  Oxidised: {
    backgroundImage:
      "radial-gradient(rgba(255,255,255,0.62) 0.8px, transparent 1.4px), linear-gradient(rgba(214,198,150,0.32), rgba(214,198,150,0.32))",
    backgroundSize: "4px 4px, auto",
  },
  Dull: { background: "rgba(105,105,105,0.66)" },
  Uneven: { background: "linear-gradient(112deg, transparent 0 40%, rgba(236,236,236,0.58) 60% 100%)" },
};

function Lens({ look }: { look: string }) {
  return (
    <span
      aria-hidden
      className="relative block h-[52px] w-[84px] shrink-0 overflow-hidden rounded-[26px_32px_16px_22px] bg-[linear-gradient(135deg,#2c2c2c,#070707)] ring-1 ring-white/25"
    >
      {/* Projector, and the two light strips beside it. */}
      <span className="absolute top-1/2 left-2.5 h-[34px] w-[34px] -translate-y-1/2 rounded-full bg-[radial-gradient(circle_at_40%_35%,#f4f4f4_0,#9c9c9c_24%,#262626_62%)] ring-2 ring-white/80" />
      <span className="absolute top-3.5 right-3 left-[52px] h-[3px] rounded-full bg-white/85" />
      <span className="absolute right-3 bottom-3.5 left-[52px] h-[3px] rounded-full bg-white/45" />
      {/* The condition. */}
      <span className="absolute inset-0" style={LENS_FILM[look]} />
      {/* Gloss. */}
      <span className="absolute -top-3 left-5 h-6 w-16 rounded-full bg-white/10 blur-[2px]" />
    </span>
  );
}

function Signs() {
  const s = HEADLIGHT.signs;
  return (
    <section className="w-full bg-gold-wash py-16 lg:py-[104px]">
      <div className="shell">
        <div className="grid gap-8 lg:grid-cols-12 lg:items-end lg:gap-16">
          <div className="lg:col-span-7">
            <SectionHead title={s.heading} tone="gold" />
            <Kicker onGold>{s.title}</Kicker>
          </div>
          <Reveal delay={3} className="lg:col-span-5">
            <p className="text-[16px] leading-[25px] font-semibold text-ink">{s.exposureLead}</p>
            <Pills items={s.exposures} onGold />
          </Reveal>
        </div>

        <Reveal delay={1}>
          <Label onGold className="mt-12 lg:mt-14">
            {s.lookLead}
          </Label>
        </Reveal>
        <ul className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-5">
          {s.looks.map((l, i) => (
            <Reveal
              as="li"
              key={l.name}
              delay={i % 3}
              className="surface-on-gold group relative overflow-hidden p-6 sm:p-7"
            >
              {/* The lens and its word side by side — they wrap apart only
                  where a card is narrower than both. */}
              <div className="flex flex-wrap items-center gap-x-4 gap-y-3">
                <Lens look={l.name} />
                <h3 className="font-[family-name:var(--font-sub)] text-[21px] leading-tight tracking-[0.04em] text-white uppercase sm:text-[22px]">
                  {l.name}
                </h3>
              </div>
              <p className="mt-4 text-[15px] leading-[24px] font-normal text-white/75">{l.body}</p>
              <HoverRule />
            </Reveal>
          ))}
        </ul>

        <Reveal delay={1}>
          <div className="mt-6 flex flex-col gap-6 rounded-[14px] bg-ink p-6 sm:p-8 lg:mt-8 lg:flex-row lg:items-center lg:justify-between lg:gap-12 lg:p-10">
            <p
              className="max-w-[70ch] text-[17px] leading-[27px] font-normal text-white/85 sm:text-[18px] sm:leading-[29px] [&_strong]:font-semibold [&_strong]:text-gold"
              dangerouslySetInnerHTML={{ __html: s.closingHtml }}
            />
            <BookButton label={s.bookLabel} className="w-full shrink-0 lg:w-auto" />
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ── 4. Restore before you replace ────────────────────────────────────────
   "Short section explaining when restoration can be considered. Do NOT make
   specific replacement-cost savings claims" — and the copy makes none. The
   argument on the left; what restoration may help improve, the price and
   the booking button as one card on the right. */

function Replace() {
  const s = HEADLIGHT.replace;
  const [lead, ...body] = s.body;
  return (
    <section className="w-full py-16 lg:py-[104px]">
      <div className="shell grid items-center gap-10 lg:grid-cols-12 lg:gap-16">
        <div className="lg:col-span-7">
          <SectionHead title={s.heading} />
          <Kicker>{s.title}</Kicker>
          <Reveal delay={3}>
            <p className="measure mt-5 text-[18px] leading-[28px] font-semibold text-white">{lead}</p>
            {body.map((p) => (
              <Prose key={p} html={p} />
            ))}
          </Reveal>
        </div>

        <Reveal delay={2} className="lg:col-span-5">
          <div className="surface relative overflow-hidden p-6 ring-1 ring-gold/30 sm:p-8">
            <Label>{s.improveLead}</Label>
            <ul className="mt-4 grid gap-2.5">
              {s.improve.map((t) => (
                <li key={t} className="flex items-start gap-3 text-[15px] leading-[22px] font-semibold text-white/90">
                  <span className="mt-px">
                    <Tick size={20} />
                  </span>
                  {t}
                </li>
              ))}
            </ul>
            <div className="mt-7 flex flex-wrap items-center justify-between gap-x-4 gap-y-4 border-t border-white/[0.08] pt-6">
              <Price label={s.price.label} value={s.price.value} />
              <BookButton label={s.bookLabel} inCard className="w-full" />
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ── 5. The five-stage process ────────────────────────────────────────────
   "Visual timeline: INSPECT → PREPARE → WET SAND → MACHINE POLISH →
   PROTECT". That line is the band's picture, the last stage gold because
   the brief's point is that restoration "shouldn't finish with polishing";
   the five stages follow it as cards with the brief's full wording, the
   first — the one with a list — the height of two. Beside the heading, the
   machine polisher on a lens. The IMPORTANT note closes the band with its
   booking button. */

const STAGE_ICONS: IconName[] = ["search", "layers", "droplet", "spark", "shield"];

function Process() {
  const s = HEADLIGHT.process;
  return (
    <section id="process" className="w-full scroll-mt-24 bg-gold-wash py-16 lg:py-[104px]">
      <div className="shell">
        <div className="grid items-center gap-10 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-7">
            <SectionHead title={s.heading} tone="gold" />
            <Kicker onGold>{s.title}</Kicker>
            <Reveal delay={3}>
              <p className="measure mt-5 text-[18px] leading-[28px] font-semibold text-ink">{s.lead[0]}</p>
              <Prose html={s.lead[1]} onGold />
            </Reveal>
          </div>
          <Reveal delay={2} className="lg:col-span-5">
            <figure className="relative mx-auto max-w-[600px] overflow-hidden rounded-[14px] ring-1 ring-ink/15">
              <div className="relative aspect-[3/2] w-full">
                <Image
                  src={PHOTOS.polishing.src}
                  alt={PHOTOS.polishing.alt}
                  fill
                  sizes="(min-width: 1024px) 38vw, 92vw"
                  className="object-cover"
                />
              </div>
            </figure>
          </Reveal>
        </div>

        {/* The layout's timeline, as a strip. */}
        <Reveal delay={1}>
          <ol aria-hidden className="mt-12 grid grid-cols-2 gap-2.5 rounded-[14px] bg-ink p-3 md:grid-cols-5">
            {s.stages.map((stage, i) => {
              const last = i === s.stages.length - 1;
              return (
                <li
                  key={stage.flow}
                  className={`flex min-h-[78px] flex-col justify-between rounded-[10px] px-4 py-3 ${
                    last ? "col-span-2 bg-gold text-ink md:col-span-1" : "bg-white/[0.04] text-white ring-1 ring-white/[0.08]"
                  }`}
                >
                  <span className="flex items-center justify-between">
                    <span
                      className={`font-[family-name:var(--font-display)] text-[18px] leading-none ${
                        last ? "text-ink/70" : "text-gold"
                      }`}
                    >
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    {!last && <Icon name="arrow" size={15} className="text-white/35" />}
                  </span>
                  <span className="mt-2.5 font-[family-name:var(--font-sub)] text-[15.5px] leading-tight font-semibold tracking-[0.05em] uppercase">
                    {stage.flow}
                  </span>
                </li>
              );
            })}
          </ol>
        </Reveal>

        <ol className="mt-6 grid gap-4 sm:grid-cols-2 lg:mt-8 lg:grid-cols-3 lg:gap-5">
          {s.stages.map((stage, i) => (
            <StageCard key={stage.title} stage={stage} n={i + 1} />
          ))}
        </ol>

        <Reveal delay={1}>
          <div className="mt-6 flex flex-col gap-6 rounded-[14px] bg-ink p-6 ring-1 ring-gold/40 sm:p-8 lg:mt-8 lg:flex-row lg:items-center lg:justify-between lg:gap-12 lg:p-10">
            <div className="flex flex-col gap-4 sm:flex-row sm:gap-5">
              <IconDisc name="info" size={46} solid />
              <div>
                <h3 className="font-[family-name:var(--font-ui)] text-[12px] font-semibold tracking-[0.22em] text-gold uppercase sm:pt-1">
                  {s.important.title}
                </h3>
                {s.important.bodyHtml.map((html, i) => (
                  <p
                    key={html}
                    className={`mt-2 max-w-[70ch] text-[15.5px] leading-[25px] [&_strong]:font-bold [&_strong]:text-gold ${
                      i === 0 ? "font-semibold text-white" : "font-normal text-white/70"
                    }`}
                    dangerouslySetInnerHTML={{ __html: html }}
                  />
                ))}
              </div>
            </div>
            <BookButton label={s.bookLabel} className="w-full shrink-0 lg:w-auto" />
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function StageCard({ stage, n }: { stage: Stage; n: number }) {
  return (
    <Reveal
      as="li"
      delay={n % 3}
      className={`surface-on-gold group relative flex flex-col overflow-hidden p-6 sm:p-7 ${
        stage.list ? "sm:row-span-2" : ""
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <IconDisc name={STAGE_ICONS[n - 1] ?? "check"} />
        <span
          aria-hidden
          className="font-[family-name:var(--font-display)] text-[48px] leading-[0.8] text-white/[0.09]"
        >
          {String(n).padStart(2, "0")}
        </span>
      </div>
      <Label className="mt-5">Stage {n}</Label>
      <h3 className="mt-1 font-[family-name:var(--font-sub)] text-[20px] leading-tight tracking-[0.02em] text-white uppercase sm:text-[21px]">
        {stage.title}
      </h3>
      {stage.body.map((p) => (
        <p key={p} className="mt-2.5 text-[14.5px] leading-[23px] font-normal text-white/75">
          {p}
        </p>
      ))}
      {stage.list && (
        <div className="mt-4 rounded-[10px] bg-white/[0.04] px-4 py-3.5 ring-1 ring-white/[0.07]">
          <p className="text-[13.5px] leading-[20px] font-semibold text-gold">{stage.list.lead}</p>
          <ul className="mt-2 grid gap-x-4 gap-y-1.5 min-[400px]:grid-cols-2 sm:grid-cols-1 xl:grid-cols-2">
            {stage.list.items.map((item) => (
              <li key={item} className="flex gap-2.5 text-[14px] leading-[20px] font-semibold text-white/90">
                <span aria-hidden className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-gold" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      )}
      {stage.after?.map((p) => (
        <p key={p} className="mt-3.5 text-[14.5px] leading-[23px] font-semibold text-white">
          {p}
        </p>
      ))}
      <HoverRule />
    </Reveal>
  );
}

/* ── 6. What can headlight restoration treat? ─────────────────────────────
   "Simple checklist." The scope beside it, and the brief's closing line
   under the ticks. */

function Treat() {
  const s = HEADLIGHT.treat;
  return (
    <section className="w-full py-16 lg:py-[104px]">
      <div className="shell grid items-center gap-10 lg:grid-cols-12 lg:gap-16">
        <div className="lg:col-span-5">
          <SectionHead title={s.heading} />
          <Kicker>{s.title}</Kicker>
          <Reveal delay={3}>
            <Prose html={s.leadHtml} space="mt-5" className="text-[17px] leading-[28px]" />
          </Reveal>
        </div>

        <Reveal delay={2} className="lg:col-span-7">
          <div className="surface p-6 sm:p-8 lg:p-10">
            <Label>{s.listLead}</Label>
            <ul className="mt-5 grid gap-x-8 gap-y-3 sm:grid-cols-2">
              {s.items.map((t) => (
                <li key={t} className="flex items-start gap-3 text-[15.5px] leading-[22px] font-semibold text-white/90">
                  <span className="mt-px">
                    <Tick size={21} />
                  </span>
                  {t}
                </li>
              ))}
            </ul>
            <p className="mt-7 flex gap-2.5 border-t border-white/[0.08] pt-5 text-[14.5px] leading-[22px] font-normal text-white/65">
              <Icon name="info" size={17} className="mt-[2px] shrink-0 text-gold" />
              {s.after}
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ── 7. What headlight restoration cannot fix ─────────────────────────────
   "Use a contrasting information panel. Include: INTERNAL DAMAGE ·
   CONDENSATION · CRACKS · ELECTRICAL FAULTS · STRUCTURAL DAMAGE". The nine
   it will not repair as one ink panel on the gold — the band's contrast —
   and the brief's IMPORTANT, with its one line in capitals, as an outlined
   panel under it beside the nine factors the result depends on. */

function CannotFix() {
  const s = HEADLIGHT.cannot;
  const g = s.guarantee;
  return (
    <section id="limits" className="w-full scroll-mt-24 bg-gold-wash py-16 lg:py-[104px]">
      <div className="shell">
        <div className="grid gap-6 lg:grid-cols-12 lg:items-end lg:gap-16">
          <div className="lg:col-span-7">
            <SectionHead title={s.heading} tone="gold" />
            <Kicker onGold>{s.title}</Kicker>
          </div>
          <Reveal delay={3} className="lg:col-span-5">
            <p className="text-[19px] leading-[28px] font-semibold text-ink">{s.important}</p>
            <p className="mt-2 text-[16px] leading-[26px] font-normal text-ink/80">{s.lead}</p>
          </Reveal>
        </div>

        <Reveal delay={1}>
          <div className="mt-10 rounded-[16px] bg-ink p-6 ring-1 ring-ink sm:p-8 lg:mt-12 lg:p-10">
            <div className="flex items-center gap-3">
              <IconDisc name="warning" size={40} solid />
              <h3 className="font-[family-name:var(--font-ui)] text-[12px] font-semibold tracking-[0.22em] text-gold uppercase">
                {s.listLead}
              </h3>
            </div>
            <ul className="mt-7 grid gap-x-8 gap-y-6 sm:grid-cols-2 lg:grid-cols-3">
              {s.items.map((it) => (
                <li key={it.title} className="flex gap-3.5">
                  <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/[0.06] text-gold ring-1 ring-white/10">
                    <Icon name="close" size={13} strokeWidth={2.6} />
                  </span>
                  <div className="min-w-0">
                    <h4 className="font-[family-name:var(--font-sub)] text-[17px] leading-tight tracking-[0.04em] text-white uppercase">
                      {it.title}
                    </h4>
                    <p className="mt-1.5 text-[14.5px] leading-[22px] font-normal text-white/70">{it.body}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </Reveal>

        <Reveal delay={1}>
          <div className="mt-6 grid gap-8 rounded-[16px] bg-ink/[0.07] p-6 ring-1 ring-ink/25 sm:p-8 lg:mt-8 lg:grid-cols-12 lg:gap-12 lg:p-10">
            <div className="lg:col-span-5">
              <p className="flex items-center gap-2.5 font-[family-name:var(--font-ui)] text-[11.5px] font-semibold tracking-[0.22em] text-ink uppercase">
                <Icon name="info" size={16} className="shrink-0" />
                {g.title}
              </p>
              <p className="mt-4 font-[family-name:var(--font-heading)] text-[23px] leading-[1.06] font-black text-ink uppercase min-[400px]:text-[27px] sm:text-[34px] lg:text-[30px] xl:text-[36px]">
                {g.statement}
              </p>
            </div>
            <div className="lg:col-span-7">
              <p className="text-[16px] leading-[24px] font-semibold text-ink">{g.factorsLead}</p>
              <ul className="mt-3 grid sm:grid-cols-2 sm:gap-x-8">
                {g.factors.map((f) => (
                  <li
                    key={f}
                    className="flex gap-3 border-b border-ink/[0.12] py-2.5 text-[14.5px] leading-[21px] font-semibold text-ink/85"
                  >
                    <span aria-hidden className="mt-[8px] h-1.5 w-1.5 shrink-0 rounded-full bg-ink" />
                    {f}
                  </li>
                ))}
              </ul>
              <p className="mt-5 text-[15.5px] leading-[25px] font-normal text-ink/85">{g.after}</p>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ── 8. Headlight restoration & light output ──────────────────────────────
   The question and its careful answer on the left, with the eight things
   that also decide a headlight's output; on the right, the two lines the
   brief sets in capitals — "HEADLIGHT RESTORATION IS NOT AN MOT TEST" and
   the no-guarantee that follows it — as a card of their own. */

function LightOutput() {
  const s = HEADLIGHT.light;
  return (
    <section className="w-full py-16 lg:py-[104px]">
      <div className="shell grid gap-12 lg:grid-cols-12 lg:gap-14">
        <div className="lg:col-span-7">
          <SectionHead title={s.heading} />
          <Kicker>{s.title}</Kicker>
          <Reveal delay={3}>
            <Prose html={s.leadHtml} space="mt-5" className="text-[17px] leading-[28px]" />
            <p className="mt-7 text-[16px] leading-[24px] font-semibold text-white">{s.listLead}</p>
            <Pills items={s.items} />
          </Reveal>
        </div>

        <Reveal delay={2} className="lg:col-span-5">
          <div className="surface relative overflow-hidden p-6 ring-1 ring-gold/35 sm:p-8 lg:sticky lg:top-32">
            <div
              aria-hidden
              className="absolute -top-16 -right-16 h-48 w-48 rounded-full bg-[radial-gradient(circle,rgba(193,146,49,0.18),transparent_70%)]"
            />
            <div className="relative">
              <IconDisc local="beam" size={50} solid />
              <p className="mt-6 font-[family-name:var(--font-sub)] text-[15px] tracking-[0.06em] text-white/60 uppercase">
                {s.forThis}
              </p>
              <p className="mt-2 font-[family-name:var(--font-heading)] text-[24px] leading-[1.06] font-black text-gold uppercase min-[400px]:text-[28px] sm:text-[34px] lg:text-[28px] xl:text-[34px]">
                {s.notMot}
              </p>
              <p className="mt-5 font-[family-name:var(--font-sub)] text-[15px] tracking-[0.06em] text-white/60 uppercase">
                {s.and}
              </p>
              <p className="mt-2 font-[family-name:var(--font-sub)] text-[19px] leading-[1.25] font-semibold tracking-[0.02em] text-white uppercase sm:text-[21px]">
                {s.noGuarantee}
              </p>
              <p className="mt-6 border-t border-white/[0.08] pt-5 text-[15px] leading-[24px] font-normal text-white/70">
                {s.after}
              </p>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ── 9. Why UV protection matters ─────────────────────────────────────────
   "Short educational section." What a lens is exposed to and why the last
   stage protects it, then the brief's two panels side by side: what UV
   protection helps with, and "BUT IT IS NOT PERMANENT". */

function UvProtection() {
  const s = HEADLIGHT.uv;
  const n = s.notPermanent;
  return (
    <section className="w-full bg-gold-wash py-16 lg:py-[104px]">
      <div className="shell grid gap-10 lg:grid-cols-12 lg:gap-14">
        <div className="lg:col-span-5">
          <SectionHead title={s.heading} tone="gold" />
          <Kicker onGold>{s.title}</Kicker>
          <Reveal delay={3}>
            <p className="mt-6 text-[16px] leading-[25px] font-semibold text-ink">{s.exposedLead}</p>
            <Pills items={s.exposed} onGold />
            {s.bodyHtml.map((html, i) => (
              <Prose key={html} html={html} onGold space={i === 0 ? "mt-7" : "mt-4"} />
            ))}
          </Reveal>
        </div>

        {/* Side by side, except in the `lg` column, where two were 172px of
            copy each. */}
        <div className="grid gap-4 sm:grid-cols-2 lg:col-span-7 lg:grid-cols-1 lg:gap-5 lg:self-center xl:grid-cols-2">
          <Reveal delay={2} className="surface-on-gold group relative overflow-hidden p-6 sm:p-7">
            <IconDisc local="sun" size={50} />
            <h3 className="mt-5 font-[family-name:var(--font-sub)] text-[20px] leading-tight tracking-[0.02em] text-white uppercase sm:text-[21px]">
              {s.helps.title}
            </h3>
            <ul className="mt-4 grid gap-2.5">
              {s.helps.items.map((t) => (
                <li key={t} className="flex items-start gap-3 text-[15px] leading-[22px] font-semibold text-white/90">
                  <span className="mt-px">
                    <Tick size={20} />
                  </span>
                  {t}
                </li>
              ))}
            </ul>
            <HoverRule />
          </Reveal>

          <Reveal delay={3} className="surface-on-gold group relative overflow-hidden p-6 sm:p-7">
            <IconDisc name="clock" size={50} />
            <h3 className="mt-5 font-[family-name:var(--font-sub)] text-[20px] leading-tight tracking-[0.02em] text-gold uppercase sm:text-[21px]">
              {n.title}
            </h3>
            <p className="mt-3 text-[15px] leading-[23px] font-semibold text-white">{n.body}</p>
            <p className="mt-4 text-[14px] leading-[21px] font-normal text-white/70">{n.factorsLead}</p>
            <ul className="mt-2.5 flex flex-wrap gap-1.5">
              {n.factors.map((f) => (
                <li
                  key={f}
                  className="rounded-full bg-white/[0.05] px-3 py-1 text-[13px] leading-[18px] font-normal text-white/85 ring-1 ring-white/10"
                >
                  {f}
                </li>
              ))}
            </ul>
            <p className="mt-4 border-t border-white/[0.08] pt-4 text-[14.5px] leading-[22px] font-semibold text-white">
              {n.after}
            </p>
            <HoverRule />
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/* ── 10. Pricing ──────────────────────────────────────────────────────────
   "Large: FROM £100. BOOK NOW." The figure as the band's picture, sized per
   breakpoint so it never outgrows its card, over what the standard service
   includes and the booking button; "WHY 'FROM' £100?" beside it; and the
   brief's NOT SURE? as the band's last strip, its WhatsApp button the photo
   enquiry. */

function Pricing() {
  const s = HEADLIGHT.pricing;
  const w = s.why;
  return (
    <section id="pricing" className="w-full scroll-mt-24 py-16 lg:py-[104px]">
      <div className="shell">
        <SectionHead title={s.heading} />
        <Kicker>{s.title}</Kicker>

        <div className="mt-12 grid gap-4 lg:grid-cols-12 lg:gap-5">
          <Reveal delay={1} className="min-w-0 lg:col-span-7">
            <div className="surface relative h-full overflow-hidden p-6 ring-1 ring-gold/35 sm:p-8 lg:p-10">
              <div
                aria-hidden
                className="absolute -top-24 -left-20 h-72 w-72 rounded-full bg-[radial-gradient(circle,rgba(193,146,49,0.16),transparent_70%)]"
              />
              <div className="relative">
                <p className="max-w-[40ch] text-[16px] leading-[25px] font-normal text-white/80">{s.startsFrom}</p>
                <p className="mt-3 font-[family-name:var(--font-display)] text-[92px] leading-[0.82] whitespace-nowrap text-gold min-[400px]:text-[112px] sm:text-[150px] lg:text-[110px] xl:text-[150px]">
                  {s.amount}
                </p>
                <Label className="mt-8">{s.includedLead}</Label>
                <ul className="mt-4 grid gap-x-6 gap-y-2.5 sm:grid-cols-2">
                  {s.included.map((t) => (
                    <li key={t} className="flex items-start gap-3 text-[15px] leading-[22px] font-semibold text-white/90">
                      <span className="mt-px">
                        <Tick size={20} />
                      </span>
                      {t}
                    </li>
                  ))}
                </ul>
                <div className="mt-8">
                  <BookButton label={s.bookLabel} className="w-full sm:w-auto" />
                </div>
              </div>
            </div>
          </Reveal>

          <Reveal delay={2} className="min-w-0 lg:col-span-5">
            <div className="surface h-full p-6 sm:p-8">
              <IconDisc name="tag" size={46} />
              <h3 className="mt-5 font-[family-name:var(--font-sub)] text-[21px] leading-tight tracking-[0.02em] text-white uppercase sm:text-[22px]">
                {w.title}
              </h3>
              <p className="mt-3 text-[15.5px] leading-[24px] font-semibold text-white/90">{w.body}</p>
              <p className="mt-5 text-[14.5px] leading-[22px] font-normal text-white/70">{w.factorsLead}</p>
              <ul className="mt-2 grid">
                {w.factors.map((f) => (
                  <li
                    key={f}
                    className="flex gap-3 border-b border-white/[0.06] py-2.5 text-[14.5px] leading-[21px] font-normal text-white/80"
                  >
                    <span aria-hidden className="mt-[8px] h-1.5 w-1.5 shrink-0 rounded-full bg-gold" />
                    {f}
                  </li>
                ))}
              </ul>
              <p className="mt-5 text-[14.5px] leading-[23px] font-normal text-white/75">{w.after}</p>
            </div>
          </Reveal>
        </div>

        <Reveal delay={1}>
          <div className="mt-4 flex flex-col gap-6 rounded-[14px] bg-gold/[0.07] p-6 ring-1 ring-gold/40 sm:p-8 lg:mt-5 lg:flex-row lg:items-center lg:justify-between lg:gap-12 lg:p-10">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-5">
              <IconDisc name="camera" size={46} solid />
              <div>
                <h3 className="font-[family-name:var(--font-sub)] text-[20px] leading-tight tracking-[0.03em] text-white uppercase sm:text-[22px]">
                  {s.unsure.title}
                </h3>
                <p className="mt-1.5 text-[15.5px] leading-[24px] font-normal text-white/80">{s.unsure.body}</p>
              </div>
            </div>
            <WhatsAppButton label={s.unsure.whatsappLabel} track={TRACK.photos} className="w-full shrink-0 lg:w-auto" />
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ── 12. Why choose Medusa? ───────────────────────────────────────────────
   "Keep concise." Six cards, three over three, the booking button beside
   the heading. */

const WHY_ICONS: Record<string, IconName> = {
  "We Come to You": "van",
  "Multi-Stage Process": "layers",
  "Professional Equipment": "brush",
  "UV Protection Included": "shield",
  "Realistic Expectations": "gauge",
  "From £100": "tag",
};

function WhyMedusa() {
  const w = HEADLIGHT.why;
  return (
    <section className="w-full bg-gold-wash py-16 lg:py-[104px]">
      <div className="shell">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <SectionHead title={w.heading} tone="gold" />
            <Kicker onGold>{w.title}</Kicker>
          </div>
          <Reveal delay={3} className="w-full sm:w-auto">
            <BookButton label={w.bookLabel} tone="dark" className="w-full sm:w-auto" />
          </Reveal>
        </div>

        <ul className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-5">
          {w.items.map((it, i) => (
            <Reveal as="li" key={it.title} delay={i % 3} className="surface-on-gold group relative overflow-hidden p-6 sm:p-7">
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
                    it.body.length > 1 && j === 0 ? "font-semibold text-white" : "font-normal text-white/75"
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

/* ── 13 & 14. Is it right for my car? · Pre-sale restoration ──────────────
   "CHECK WHETHER YOUR HEADLIGHT IS SUITABLE" — the journey's last step
   before BOOK. The two lists side by side, ticks against crosses, and
   "SEND US A PHOTO." as the strip under them. Then the one reason on the
   first list that has a section of its own — preparing a car for sale — with
   the pre-sale services the brief asks this page to link. */

function Suitable() {
  const s = HEADLIGHT.suitable;
  const p = HEADLIGHT.preSale;
  return (
    <section id="suitable" className="w-full scroll-mt-24 py-16 lg:py-[104px]">
      <div className="shell">
        <SectionHead title={s.heading} />

        <div className="mt-12 grid gap-4 md:grid-cols-2 lg:gap-5">
          <Reveal delay={1} className="surface relative overflow-hidden p-6 ring-1 ring-gold/35 sm:p-8">
            <h3 className="font-[family-name:var(--font-sub)] text-[19px] leading-[1.25] font-semibold tracking-[0.02em] text-gold uppercase sm:text-[21px]">
              {s.yes.title}
            </h3>
            <ul className="mt-5 grid gap-3">
              {s.yes.items.map((t) => (
                <li key={t} className="flex items-start gap-3 text-[15px] leading-[22px] font-semibold text-white/90">
                  <span className="mt-px">
                    <Tick size={20} />
                  </span>
                  {t}
                </li>
              ))}
            </ul>
          </Reveal>
          <Reveal delay={2} className="surface relative overflow-hidden p-6 sm:p-8">
            <h3 className="font-[family-name:var(--font-sub)] text-[19px] leading-[1.25] font-semibold tracking-[0.02em] text-white uppercase sm:text-[21px]">
              {s.no.title}
            </h3>
            <ul className="mt-5 grid gap-3">
              {s.no.items.map((t) => (
                <li key={t} className="flex items-start gap-3 text-[15px] leading-[22px] font-normal text-white/75">
                  <span className="mt-px">
                    <Tick size={20} cross />
                  </span>
                  {t}
                </li>
              ))}
            </ul>
          </Reveal>
        </div>

        <Reveal delay={1}>
          <div className="mt-4 flex flex-col gap-6 rounded-[14px] bg-gold/[0.07] p-6 ring-1 ring-gold/40 sm:p-8 lg:mt-5 lg:flex-row lg:items-center lg:justify-between lg:gap-12 lg:p-10">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-5">
              <IconDisc name="camera" size={46} solid />
              <div>
                <p className="text-[15px] leading-[22px] font-normal text-white/70">{s.unsure.lead}</p>
                <h3 className="mt-1 font-[family-name:var(--font-sub)] text-[22px] leading-tight tracking-[0.03em] text-white uppercase sm:text-[24px]">
                  {s.unsure.title}
                </h3>
                <p className="mt-1.5 text-[15.5px] leading-[24px] font-normal text-white/80">{s.unsure.body}</p>
              </div>
            </div>
            <WhatsAppButton label={s.unsure.whatsappLabel} track={TRACK.photos} className="w-full shrink-0 lg:w-auto" />
          </div>
        </Reveal>

        {/* 14 — pre-sale. */}
        <div className="mt-16 grid gap-10 border-t border-white/[0.08] pt-16 lg:mt-24 lg:grid-cols-12 lg:gap-16 lg:pt-24">
          <div className="lg:col-span-7">
            <SectionHead title={p.heading} />
            <Kicker>{p.title}</Kicker>
            <Reveal delay={3}>
              <p className="measure mt-5 text-[18px] leading-[28px] font-semibold text-white">{p.body[0]}</p>
              <Prose html={p.body[1]} />
              <Prose html={p.combineHtml} space="mt-6" />
              <ul className="mt-4 flex flex-wrap gap-2">
                {p.before.map((b, i) => (
                  <li
                    key={b}
                    className="flex items-center gap-2 rounded-full bg-white/[0.05] px-3.5 py-1.5 text-[14px] leading-[19px] font-normal text-white/85 ring-1 ring-white/10"
                  >
                    <span className="font-[family-name:var(--font-display)] text-[13px] leading-none text-gold">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    {b}
                  </li>
                ))}
              </ul>
            </Reveal>
          </div>

          <Reveal delay={2} className="lg:col-span-5 lg:self-end">
            <div className="surface overflow-hidden">
              <ul className="divide-y divide-white/[0.07]">
                {p.services.map((svc) => (
                  <li key={svc.href}>
                    <Link
                      href={svc.href}
                      className="group flex items-center justify-between gap-4 px-6 py-4 transition-colors hover:bg-white/[0.03] sm:px-7"
                    >
                      <span className="font-[family-name:var(--font-sub)] text-[18px] leading-tight tracking-[0.03em] text-white uppercase transition-colors group-hover:text-gold">
                        {svc.name}
                      </span>
                      <span
                        aria-hidden
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gold/12 text-gold ring-1 ring-gold/35 transition-colors group-hover:bg-gold group-hover:text-ink"
                      >
                        <Icon name="arrow" size={17} />
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
              <div className="border-t border-white/[0.07] px-6 py-5 sm:px-7">
                <Link
                  href={p.ctaHref}
                  className="btn btn-gold min-h-[52px] w-full rounded-full px-5 text-[14px] sm:w-auto sm:px-7 sm:text-[15px]"
                >
                  {p.ctaLabel}
                  <Icon name="arrow" size={18} className="ml-2.5 shrink-0" />
                </Link>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/* ── 16. FAQ ──────────────────────────────────────────────────────────────
   "Accordion." */

function Faq() {
  const f = HEADLIGHT.faq;
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

/* ── 17. Important service information ────────────────────────────────────
   "Clear but visually unobtrusive service limitations." Six short entries in
   one quiet panel, and the booking system's required acknowledgement under
   them in its own words, so it is read before the checkbox is reached. */

function Info() {
  const s = HEADLIGHT.info;
  return (
    <section id="service-information" className="w-full scroll-mt-24 bg-gold-wash py-16 lg:py-[104px]">
      <div className="shell grid gap-10 lg:grid-cols-12 lg:gap-14">
        <div className="lg:col-span-4">
          <div className="lg:sticky lg:top-32">
            <SectionHead title={s.heading} tone="gold" />
            <Kicker onGold>{s.title}</Kicker>
          </div>
        </div>

        <div className="lg:col-span-8">
          <Reveal delay={2}>
            <ul className="surface-on-gold grid px-6 py-2 sm:grid-cols-2 sm:gap-x-10 sm:px-8 sm:py-4 lg:px-10">
              {s.items.map((it) => (
                <li key={it.title} className="border-b border-white/[0.06] py-4 sm:[&:nth-last-child(-n+2)]:border-b-0 last:border-b-0">
                  <h3 className="font-[family-name:var(--font-ui)] text-[11.5px] leading-[17px] font-semibold tracking-[0.18em] text-gold uppercase">
                    {it.title}
                  </h3>
                  <p className="mt-2 text-[14.5px] leading-[22px] font-normal text-white/75">{it.body}</p>
                </li>
              ))}
            </ul>
          </Reveal>

          <Reveal delay={1}>
            <div className="mt-5 flex flex-col gap-4 rounded-[14px] bg-ink/[0.07] p-6 ring-1 ring-ink/25 sm:flex-row sm:gap-5 sm:p-7">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-ink text-gold">
                <Icon name="shield" size={19} />
              </span>
              <div>
                <h3 className="font-[family-name:var(--font-ui)] text-[11.5px] font-semibold tracking-[0.22em] text-ink uppercase sm:pt-1">
                  {s.acknowledgement.title}
                </h3>
                <p className="mt-2 text-[15px] leading-[24px] font-semibold text-ink/85">{s.acknowledgement.body}</p>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/* ── 18. Final CTA ─────────────────────────────────────────────────────────
   "Repeat: HEADLIGHT RESTORATION FROM £100 · [BOOK NOW] [WHATSAPP]". The
   brief's closing card — the price and its four methods — beside the two
   buttons; the sticky bar steps aside while it is on screen. */

function FinalCta() {
  const f = HEADLIGHT.finalCta;
  return (
    <section
      id="headlight-final"
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
            <p className="measure mt-6 text-[17px] leading-[28px] font-semibold text-white">{f.body[0]}</p>
            <p className="measure mt-3 text-[16px] leading-[27px] font-normal text-body">{f.body[1]}</p>
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
            <div className="flex flex-wrap items-end justify-between gap-x-4 gap-y-3 border-b border-white/[0.07] px-6 py-6 sm:px-7">
              <h3 className="max-w-[16ch] font-[family-name:var(--font-sub)] text-[19px] leading-tight tracking-[0.03em] text-white uppercase sm:text-[21px]">
                {f.card.title}
              </h3>
              <Price label={f.card.price.label} value={f.card.price.value} size="lg" />
            </div>
            <ul className="grid gap-3 px-6 py-6 sm:px-7">
              {f.card.points.map((t) => (
                <li
                  key={t}
                  className="flex items-center gap-2.5 font-[family-name:var(--font-ui)] text-[12px] leading-[17px] font-semibold tracking-[0.12em] text-white/90 uppercase"
                >
                  <Tick size={20} />
                  {t}
                </li>
              ))}
            </ul>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
