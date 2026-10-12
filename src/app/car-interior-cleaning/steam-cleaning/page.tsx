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
import { pageSchema } from "@/lib/schema";
import {
  type InfoItem,
  ODOUR_PATH,
  type Package,
  PATH,
  PHOTOS,
  SLUG,
  STEAM,
  type Step,
  TRACK,
  VALETS,
  type ValetKey,
} from "@/lib/steam-cleaning";

/**
 * Car interior steam cleaning — rebuilt from the client's brief.
 *
 * Client, 2026-10-06: "Replace/re-optimise the existing Steam Cleaning page
 * using the content below. KEEP EXISTING URL". Every word of the brief's
 * sections is in `lib/steam-cleaning.ts`; this file is only layout, in the
 * order of the brief's "RECOMMENDED ELEMENTOR PAGE STRUCTURE", which is also
 * the order of its sixteen sections:
 *
 *   1 hero · 2 how we use steam · 3 where we use it, beside 4 where we don't
 *   automatically · 5 the seven steps · 6 benefits · 7 the three valets ·
 *   8 stains beside 9 smells · 10 specialist services · 12 why Medusa ·
 *   13 reviews · 14 FAQ · 15 important service information · 16 the closing
 *   package selector.
 *
 * Section 11, "Before & After", is not here: "Add genuine Medusa
 * before-and-after photographs" — and none exists yet.
 *
 * What decided the shape is the brief's last page: "Do NOT turn this into
 * another confusing standalone service. The page should rank for: CAR
 * INTERIOR STEAM CLEANING LONDON but convert visitors into: TRITON INTERIOR
 * VALET · ZEUS FULL VALET · MEDUSA GOLD VALET." So the three valets are in the
 * hero's first panel, each a link to the page that sells it — "Show the three
 * eligible valet packages early" — under "STEAM CLEANING INCLUDED WHERE
 * REQUIRED", which the layout wants above the fold with the booking button;
 * both are, on a 375px phone. Every booking button books a valet; none books
 * "steam cleaning". The phone's sticky bar is the brief's "BOOK A VALET |
 * WHATSAPP".
 *
 * Sections 3 and 4 share a band, side by side — where steam is used and where
 * it is not automatically used, which is the comparison the layout says
 * "helps differentiate Medusa from cheap operators who simply advertise that
 * they 'steam everything'" — and 8 and 9 share one because the layout asks
 * for "Two-column section: STAINS · ODOURS". That is what lets gold and ink
 * alternate the whole way down (client, 2026-09-22: "pastikan warna bg tetap
 * selang seling") and end on the gold service information over the ink close.
 *
 * The route wins over `app/[...slug]` because a static segment outranks a
 * catch-all; the slug has to be in `CUSTOM_ROUTES` so only one page is built.
 */

const BOOK = STEAM.book;
const WHATSAPP = STEAM.whatsapp;
const VALET_KEYS = Object.keys(VALETS) as ValetKey[];

export function generateMetadata(): Metadata {
  const { title, description } = STEAM.seo;
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

export default function SteamCleaningPage() {
  const page = getPage(SLUG);
  if (!page) notFound();

  return (
    <>
      {/* "Add appropriate: Service schema · FAQPage schema". No offer: the
          brief quotes no price, because steam cleaning is not sold alone. */}
      <JsonLd
        data={pageSchema(page, {
          service: {
            slug: SLUG,
            /* A4: the page's h1 is "Car Interior Steam Cleaning London" and stays
               so; a Service name carries the service, never the city. */
            name: "Car Interior Steam Cleaning",
            serviceType: "Car interior steam cleaning",
            description: STEAM.seo.description,
            image: PHOTOS.hero.src,
          },
          faq: STEAM.faq.items,
        })}
      />
      <TrackClicks />

      <Header />
      <main className="flex-1">
        <Hero />
        <HowItWorks />
        <Methods />
        <Process />
        <Benefits />
        <Packages />
        <StainsAndSmells />
        <Specialist />
        <WhyMedusa />
        <Testimonials title={STEAM.reviews.heading} />
        <Faq />
        <ServiceInfo />
        <FinalCta />
      </main>
      <Footer />

      {/* "MOBILE STICKY BAR: BOOK A VALET | WHATSAPP" */}
      <StickyBookBar
        primary={{ label: STEAM.sticky.book, href: BOOK, track: TRACK.book }}
        secondary={{ label: STEAM.sticky.whatsapp, href: WHATSAPP, icon: "whatsapp", external: true }}
        after="steam-hero-actions"
        hideOver={["steam-final"]}
      />
    </>
  );
}

/* ── Shared pieces ──────────────────────────────────────────────────────── */

/*
  Five marks the site's set does not have, drawn on its grid — 24px, 1.75
  stroke, round caps and joins, `currentColor` — for the places steam is and
  is not used. `Glyph` takes either kind of name.
*/
type LocalGlyph = "steam" | "console" | "door" | "door-shut" | "fabric";
type GlyphName = IconName | LocalGlyph;

const LOCAL_GLYPHS: Record<LocalGlyph, React.ReactNode> = {
  /* A floor nozzle on its wand, steam rising beside it. */
  steam: (
    <>
      <path d="M3.5 20h10.5l-1.3-2.6H4.8L3.5 20Z" />
      <path d="M11.4 17.4 19.5 7" />
      <path d="m18 5.8 2.6 2" />
      <path d="M5.6 14.4c0-1.3 1.2-1.6 1.2-2.9S5.6 10 5.6 8.7" />
      <path d="M9 14.4c0-1.5 1.3-1.8 1.3-3.3S9 9.5 9 8" />
    </>
  ),
  /* A gear lever in the console between the seats. */
  console: (
    <>
      <circle cx="12" cy="5.8" r="2.6" />
      <path d="M12 8.4v6.6" />
      <rect x="5.5" y="15" width="13" height="5.5" rx="1.5" />
      <path d="M9 17.75h6" />
    </>
  ),
  /* A front door from the side: window, pillar, pull. */
  door: (
    <>
      <path d="M4 11.5 9.5 4.5H20v10.5a4.5 4.5 0 0 1-4.5 4.5H4v-8Z" />
      <path d="M4 11.5h16" />
      <path d="M14 4.5v7" />
      <path d="M14.5 14.5h2.8" />
    </>
  ),
  /* The door swung open off its pillar — the shut it closes on. */
  "door-shut": (
    <>
      <path d="M4.5 3.5v17" />
      <path d="M8 5.2 19.5 8v12.5L8 18.8V5.2Z" />
      <path d="M8 11.2l11.5 1.8" />
      <path d="M6.2 9v2.5" />
    </>
  ),
  /* A swatch of woven cloth. */
  fabric: (
    <>
      <rect x="4.5" y="4.5" width="15" height="15" rx="2" />
      <path d="M4.5 11 11 4.5" />
      <path d="M4.5 17 17 4.5" />
      <path d="M8.5 19.5 19.5 8.5" />
      <path d="m14.5 19.5 5-5" />
    </>
  ),
};

const isLocal = (name: GlyphName): name is LocalGlyph => name in LOCAL_GLYPHS;

function Glyph({
  name,
  size = 20,
  className,
  strokeWidth = 1.75,
}: {
  name: GlyphName;
  size?: number;
  className?: string;
  strokeWidth?: number;
}) {
  if (!isLocal(name)) return <Icon name={name} size={size} className={className} strokeWidth={strokeWidth} />;
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
      {LOCAL_GLYPHS[name]}
    </svg>
  );
}

function BookButton({
  label,
  inCard,
  className = "",
}: {
  label: string;
  /** At the foot of a card, where a long label has to wrap rather than run
   *  past the button's edge. */
  inCard?: boolean;
  className?: string;
}) {
  return (
    <a
      href={BOOK}
      data-track={TRACK.book}
      className={`btn btn-gold min-h-[52px] rounded-full px-5 text-center text-[14px] ${
        inCard ? "py-3 leading-[18px]" : "sm:px-7 sm:text-[15px] sm:whitespace-nowrap"
      } ${className}`}
    >
      {label}
      <Icon name="arrow" size={18} className="ml-2.5 shrink-0" />
    </a>
  );
}

/** The outlined partner of a gold button: on ink the site's outline, on gold
 *  an ink ring. */
const OUTLINE = (onGold?: boolean) =>
  onGold
    ? "text-ink shadow-[inset_0_0_0_2px_rgb(0_0_0/0.8)] hover:-translate-y-0.5 hover:bg-ink hover:text-white"
    : "btn-outline";

function WhatsAppButton({ label, className = "" }: { label: string; className?: string }) {
  return (
    <a
      href={WHATSAPP}
      target="_blank"
      rel="noopener noreferrer"
      className={`btn min-h-[52px] rounded-full px-5 text-[14px] sm:px-7 sm:text-[15px] sm:whitespace-nowrap ${OUTLINE()} ${className}`}
    >
      <Icon name="whatsapp" size={19} className="mr-2.5 shrink-0" />
      {label}
    </a>
  );
}

/** "VIEW OUR VALET PACKAGES" — the three cards further down this page. */
function PackagesButton({ label, onGold, className = "" }: { label: string; onGold?: boolean; className?: string }) {
  return (
    <a
      href="#packages"
      className={`btn min-h-[52px] rounded-full px-5 text-[14px] sm:px-7 sm:text-[15px] sm:whitespace-nowrap ${OUTLINE(
        onGold,
      )} ${className}`}
    >
      {label}
      <Icon name="arrow" size={18} className="ml-2.5 shrink-0 rotate-90" />
    </a>
  );
}

/** Any link to a valet's own page — each one is a "Triton / Zeus / Medusa
 *  Gold click". */
function ValetLink({
  valet,
  className,
  children,
}: {
  valet: ValetKey;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <Link href={VALETS[valet].href} data-track={TRACK[valet]} className={className}>
      {children}
    </Link>
  );
}

/* The brief gives every section a name and then a heading — "WHERE CAN STEAM
   BE USED?" over "Targeted Interior Steam Cleaning". The name is the h2, as on
   the other rebuilt pages; the heading is the line under it, in the condensed
   face. */
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

/** The brief's "IMPORTANT" notes: a label, the line it sets in bold, and
 *  what follows. On ink. */
function Important({ title, strong, body = [] }: { title: string; strong: string; body?: string[] }) {
  return (
    <div className="rounded-[12px] bg-gold/[0.07] p-5 ring-1 ring-gold/40 sm:p-6">
      <p className="flex items-center gap-2.5 font-[family-name:var(--font-ui)] text-[11.5px] font-semibold tracking-[0.22em] text-gold uppercase">
        <Icon name="info" size={16} className="shrink-0" />
        {title}
      </p>
      <p className="mt-2.5 text-[15.5px] leading-[24px] font-semibold text-white">{strong}</p>
      {body.map((p) => (
        <p key={p} className="mt-2 text-[14.5px] leading-[23px] font-normal text-white/70">
          {p}
        </p>
      ))}
    </div>
  );
}

/** Keeps a hyphenated word — "Air-vent" — from breaking at its hyphen. */
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
   "Desktop: LEFT — H1, Short description, Trust points, CTA. RIGHT — Strong
   photograph of a Medusa technician steam-cleaning an interior. Above the
   fold make clear: STEAM CLEANING INCLUDED WHERE REQUIRED WITH SELECTED
   INTERIOR VALETS [BOOK A VALET]". The h1, the brief's sub-heading, then
   Section 1's own panel — the statement beside the three valets it is
   available within — and both buttons, all above the fold on a phone ("Keep
   hero copy short"); the opening paragraphs follow. The photograph carries
   the six trust points, beside the copy from `lg`, beside each other on a
   tablet and under the copy on a phone. The page's message — "We don't
   simply steam the entire interior" — closes the band across its width. */

function Hero() {
  const h = STEAM.hero;
  const [lead, offer, notAll, instead] = h.intro;

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

            {/* STEAM CLEANING INCLUDED WHERE REQUIRED · Available within
                selected: TRITON · ZEUS · MEDUSA GOLD. */}
            <Reveal delay={3}>
              <div className="mt-6 flex max-w-[640px] flex-col overflow-hidden rounded-[14px] bg-white/[0.04] ring-1 ring-gold/35 sm:flex-row xl:mt-8">
                <div className="flex items-center gap-3.5 bg-gold/[0.1] px-5 py-4 sm:w-[44%] sm:shrink-0 sm:flex-col sm:items-start sm:justify-center sm:gap-3.5 sm:px-6 sm:py-5">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gold text-ink">
                    <Glyph name="steam" size={21} strokeWidth={2} />
                  </span>
                  <p className="font-[family-name:var(--font-sub)] text-[18px] leading-[1.15] font-semibold tracking-[0.03em] text-white uppercase sm:text-[21px]">
                    {h.included.title}
                  </p>
                </div>
                <div className="flex-1 border-t border-gold/25 px-5 py-3.5 sm:border-t-0 sm:border-l sm:px-6 sm:py-5">
                  <Label className="text-white/75">{h.included.label}</Label>
                  <ul className="mt-1.5 divide-y divide-white/[0.07]">
                    {VALET_KEYS.map((k) => (
                      <li key={k}>
                        <ValetLink
                          valet={k}
                          className="group flex min-h-[40px] items-center justify-between gap-3 font-[family-name:var(--font-sub)] text-[15.5px] font-semibold tracking-[0.05em] text-white uppercase transition-colors hover:text-gold"
                        >
                          {VALETS[k].name}
                          <Icon
                            name="arrow"
                            size={16}
                            className="shrink-0 text-gold transition-transform group-hover:translate-x-0.5"
                          />
                        </ValetLink>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </Reveal>

            <Reveal delay={4}>
              <div id="steam-hero-actions" className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap xl:mt-8">
                <BookButton label={h.bookLabel} className="w-full sm:w-auto" />
                <PackagesButton label={h.packagesLabel} className="w-full sm:w-auto" />
              </div>
            </Reveal>

            <Reveal delay={5}>
              <p className="mt-7 max-w-[60ch] text-[17px] leading-[27px] font-semibold text-white xl:mt-8">{lead}</p>
              <p
                className="mt-3 max-w-[60ch] text-[16px] leading-[26px] font-normal text-white/75 xl:text-[17px] xl:leading-[28px] [&_strong]:font-semibold [&_strong]:text-white"
                dangerouslySetInnerHTML={{ __html: offer }}
              />
            </Reveal>
          </div>

          <Reveal delay={4} className="lg:col-span-5">
            <HeroCard />
          </Reveal>
        </div>

        <Reveal delay={5}>
          <div className="mt-10 grid gap-3 border-t border-white/10 pt-7 lg:mt-12 lg:grid-cols-12 lg:items-baseline lg:gap-12">
            <p className="border-l-2 border-gold pl-4 text-[19px] leading-[27px] font-semibold text-white lg:col-span-5 sm:text-[21px]">
              {notAll}
            </p>
            <p className="max-w-[70ch] text-[15.5px] leading-[26px] font-normal text-white/70 lg:col-span-7">{instead}</p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function HeroCard() {
  return (
    /* Photograph over the ticks in the hero's column and on a phone; side by
       side on a tablet, where a stacked card ran a tall picture across the
       full width. */
    <figure className="surface relative overflow-hidden md:grid md:grid-cols-2 lg:block">
      <div className="relative aspect-[3/2] w-full md:aspect-auto md:min-h-[280px] lg:aspect-[16/11] lg:min-h-0">
        <Image
          src={PHOTOS.hero.src}
          alt={PHOTOS.hero.alt}
          fill
          priority
          sizes="(min-width: 1024px) 38vw, (min-width: 768px) 46vw, 92vw"
          className="object-cover object-[50%_40%]"
        />
        <div
          aria-hidden
          className="absolute inset-x-0 bottom-0 h-1/3 bg-[linear-gradient(to_top,rgba(13,13,13,0.85),transparent)]"
        />
      </div>
      <figcaption className="flex items-center p-5 sm:p-6">
        <ul className="grid w-full gap-x-4 gap-y-2.5 sm:grid-cols-2 md:grid-cols-1 xl:grid-cols-2">
          {STEAM.hero.ticks.map((t) => (
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

/* ── 2. How steam cleaning works at Medusa ────────────────────────────────
   "HOW WE USE STEAM — Visual process: VACUUM → CLEAN → AGITATE → STEAM →
   EXTRACT → FINISH". That line is the band's picture, steam its one gold
   stage — one stage of six, which is the section's own heading — and the six
   methods follow it as cards with the brief's full wording. Beside the
   argument, the old page's photograph of steam on a carpet. */

const STAGE_ICONS: GlyphName[] = ["vacuum", "droplet", "brush", "steam", "seat", "spark"];
const STEAM_STAGE = 3;

function HowItWorks() {
  const s = STEAM.how;
  return (
    <section id="how-it-works" className="w-full scroll-mt-24 bg-gold-wash py-16 lg:py-[104px]">
      <div className="shell">
        <div className="grid items-center gap-10 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-7">
            <SectionHead title={s.heading} tone="gold" />
            <Kicker onGold>{s.title}</Kicker>
            <Reveal delay={3}>
              <p className="measure mt-5 text-[18px] leading-[28px] font-semibold text-ink">{s.body[0]}</p>
              {s.body.slice(1).map((p, i) => (
                <Prose key={p} html={p} onGold space={i === 0 ? "mt-4" : "mt-2"} />
              ))}
            </Reveal>
          </div>
          <Reveal delay={2} className="lg:col-span-5">
            <figure className="relative overflow-hidden rounded-[14px] ring-1 ring-ink/15">
              <div className="relative aspect-[3/2] w-full">
                <Image
                  src={PHOTOS.carpet.src}
                  alt={PHOTOS.carpet.alt}
                  fill
                  sizes="(min-width: 1024px) 38vw, 92vw"
                  className="object-cover"
                />
              </div>
            </figure>
          </Reveal>
        </div>

        <Reveal delay={1}>
          <p className="mt-12 text-[17px] leading-[26px] font-semibold text-ink">{s.listLead}</p>
        </Reveal>

        {/* The layout's line, as a strip. */}
        <Reveal delay={1}>
          <ol aria-hidden className="mt-5 grid grid-cols-2 gap-2.5 rounded-[14px] bg-ink p-3 sm:grid-cols-3 lg:grid-cols-6">
            {s.stages.map((stage, i) => {
              const gold = i === STEAM_STAGE;
              const last = i === s.stages.length - 1;
              return (
                <li
                  key={stage.flow}
                  className={`flex min-h-[78px] flex-col justify-between rounded-[10px] px-4 py-3 ${
                    gold ? "bg-gold text-ink" : "bg-white/[0.04] text-white ring-1 ring-white/[0.08]"
                  }`}
                >
                  <span className="flex items-center justify-between">
                    <Glyph name={STAGE_ICONS[i]} size={19} className={gold ? "text-ink" : "text-gold"} />
                    {!last && <Icon name="arrow" size={15} className={gold ? "text-ink/60" : "text-white/35"} />}
                  </span>
                  <span className="mt-2.5 font-[family-name:var(--font-sub)] text-[15.5px] leading-tight font-semibold tracking-[0.05em] uppercase">
                    {stage.flow}
                  </span>
                </li>
              );
            })}
          </ol>
        </Reveal>

        <ol className="mt-4 grid gap-4 sm:grid-cols-2 lg:mt-5 lg:grid-cols-3 lg:gap-5">
          {s.stages.map((stage, i) => (
            <Reveal
              as="li"
              key={stage.title}
              delay={i % 3}
              className="surface-on-gold group relative flex flex-col overflow-hidden p-6 sm:p-7"
            >
              <div className="flex items-start justify-between gap-4">
                <IconDisc name={STAGE_ICONS[i]} solid={i === STEAM_STAGE} />
                <span
                  aria-hidden
                  className="font-[family-name:var(--font-display)] text-[48px] leading-[0.8] text-white/[0.09]"
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
              </div>
              <h3 className="mt-5 font-[family-name:var(--font-sub)] text-[20px] leading-tight tracking-[0.02em] text-white uppercase sm:text-[21px]">
                {stage.title}
              </h3>
              <p className="mt-2.5 text-[14.5px] leading-[23px] font-normal text-white/75">{stage.body}</p>
              <HoverRule />
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
}

/* ── 3 & 4. Where steam is used · Where it is not automatically used ──────
   "WHERE WE USE STEAM — Icon/grid section." and "WHERE WE DON'T
   AUTOMATICALLY USE STEAM — Professional/safety explanation. This helps
   differentiate Medusa from cheap operators who simply advertise that they
   'steam everything.'" Side by side, so the difference is the picture: twelve
   places as an icon grid with its IMPORTANT note, beside the explanation and
   the eleven things taken care around. Section 4's closing line in capitals
   closes the band at the size of a heading. */

const WHERE_ICONS: GlyphName[] = [
  "layers",
  "cup",
  "console",
  "door",
  "door-shut",
  "gauge",
  "wind",
  "seat",
  "fabric",
  "carpet",
  "seat-edge",
  "spark",
];

function Methods() {
  const w = STEAM.where;
  const c = STEAM.care;
  return (
    <section id="where-we-use-steam" className="w-full scroll-mt-24 py-16 lg:py-[104px]">
      <div className="shell">
        <div className="grid gap-14 lg:grid-cols-12 lg:gap-12 xl:gap-16">
          {/* Section 3 */}
          <div className="min-w-0 lg:col-span-6">
            <SectionHead title={w.heading} />
            <Kicker>{w.title}</Kicker>
            <Reveal delay={3}>
              <Prose html={w.lead} space="mt-5" />
            </Reveal>
            <ul className="mt-7 grid gap-2.5 sm:grid-cols-2">
              {w.items.map((item, i) => (
                <Reveal
                  as="li"
                  key={item}
                  delay={i % 2}
                  className="flex min-h-[60px] items-center gap-3.5 rounded-[12px] bg-white/[0.04] px-4 py-3 ring-1 ring-white/[0.08]"
                >
                  <IconDisc name={WHERE_ICONS[i] ?? "check"} size={36} />
                  <span className="text-[14.5px] leading-[20px] font-semibold text-white/90">
                    <KeepHyphens text={item} />
                  </span>
                </Reveal>
              ))}
            </ul>
            <Reveal delay={1} className="mt-5">
              <Important title={w.important.title} strong={w.important.strong} body={[w.important.body]} />
            </Reveal>
          </div>

          {/* Section 4 */}
          <div className="min-w-0 lg:col-span-6">
            <SectionHead title={c.heading} />
            <Kicker>{c.title}</Kicker>
            <Reveal delay={3}>
              <Prose html={c.body[0]} space="mt-5" />
              <Prose html={c.body[1]} space="mt-2" />
              <p
                className="mt-4 border-l-2 border-gold pl-4 text-[17px] leading-[26px] font-normal text-white/85 [&_strong]:font-semibold [&_strong]:text-white"
                dangerouslySetInnerHTML={{ __html: c.body[2] }}
              />
            </Reveal>
            <Reveal delay={2}>
              <div className="surface mt-7 p-6 sm:p-7">
                <div className="flex items-center gap-3">
                  <IconDisc name="eye" size={40} />
                  <h3 className="text-[16px] leading-[23px] font-semibold text-white">{c.listLead}</h3>
                </div>
                <ul className="mt-5 grid sm:grid-cols-2 sm:gap-x-6">
                  {c.items.map((item) => (
                    <li
                      key={item}
                      className="flex gap-3 border-b border-white/[0.06] py-2.5 text-[14.5px] leading-[21px] font-normal text-white/80"
                    >
                      <span aria-hidden className="mt-[6px] h-2.5 w-2.5 shrink-0 rounded-full ring-2 ring-gold/70" />
                      <span>
                        <KeepHyphens text={item} />
                      </span>
                    </li>
                  ))}
                </ul>
                <p className="mt-5 text-[15px] leading-[24px] font-semibold text-white">{c.after}</p>
              </div>
            </Reveal>
          </div>
        </div>

        <Reveal delay={1}>
          <div className="relative mt-12 overflow-hidden rounded-[14px] bg-gold/[0.07] p-6 ring-1 ring-gold/40 sm:p-8 lg:mt-14 lg:p-12">
            <div
              aria-hidden
              className="absolute inset-0"
              style={{ background: "radial-gradient(60% 90% at 85% 100%, rgba(193,146,49,0.14) 0%, transparent 70%)" }}
            />
            <p className="relative max-w-[30ch] font-[family-name:var(--font-heading)] text-[23px] leading-[1.08] font-black text-gold uppercase min-[400px]:text-[27px] sm:text-[36px] lg:text-[44px]">
              {c.statement}
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ── 5. Our interior steam-cleaning process ───────────────────────────────
   Not in the layout list, so set apart from Section 2's cards: the seven
   steps as one numbered run down a single panel, steam the one gold mark,
   and beside them the site's close-up of a brush working an air vent — the
   step before steam — kept in view while the steps scroll. Its caption is
   Section 11's IMAGE CAPTION, which says nothing about any one car. */

const STEP_ICONS: GlyphName[] = ["search", "vacuum", "droplet", "brush", "steam", "carpet", "eye"];
const STEAM_STEP = 4;

function Process() {
  const s = STEAM.process;
  return (
    <section id="process" className="w-full scroll-mt-24 bg-gold-wash py-16 lg:py-[104px]">
      <div className="shell">
        <div className="grid gap-6 lg:grid-cols-12 lg:items-end lg:gap-16">
          <div className="lg:col-span-7">
            <SectionHead title={s.heading} tone="gold" />
            <Kicker onGold>{s.title}</Kicker>
          </div>
          <Reveal delay={3} className="lg:col-span-5">
            <Prose html={s.lead[0]} onGold className="lg:mt-0" />
            <p className="mt-2 text-[16px] leading-[26px] font-semibold text-ink">{s.lead[1]}</p>
          </Reveal>
        </div>

        <div className="mt-12 grid gap-6 lg:grid-cols-12 lg:gap-8">
          <Reveal delay={1} className="lg:col-span-5">
            <figure className="surface-on-gold overflow-hidden lg:sticky lg:top-32">
              <div className="relative aspect-[3/2] w-full">
                <Image
                  src={PHOTOS.detail.src}
                  alt={PHOTOS.detail.alt}
                  fill
                  sizes="(min-width: 1024px) 38vw, 92vw"
                  className="object-cover"
                />
              </div>
              <figcaption className="px-5 py-4 text-[14px] leading-[22px] font-semibold text-white/80 sm:px-6">
                {s.caption}
              </figcaption>
            </figure>
          </Reveal>

          <Reveal delay={2} className="min-w-0 lg:col-span-7">
            <ol className="surface-on-gold px-5 py-2 sm:px-8 lg:px-9">
              {s.steps.map((step, i) => (
                <ProcessStep key={step.title} step={step} n={i + 1} />
              ))}
            </ol>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

function ProcessStep({ step, n }: { step: Step; n: number }) {
  const last = n === STEAM.process.steps.length;
  return (
    <li className="relative flex gap-4 py-6 sm:gap-5">
      {/* The run's thread, from this step's mark to the next. */}
      {!last && <span aria-hidden className="absolute top-[74px] bottom-[-22px] left-[21px] w-[2px] rounded-full bg-gold/25" />}
      <IconDisc name={STEP_ICONS[n - 1] ?? "check"} size={44} solid={n - 1 === STEAM_STEP} />
      <div className="min-w-0 pt-0.5">
        <Label>Step {n}</Label>
        <h3 className="mt-1 font-[family-name:var(--font-sub)] text-[20px] leading-tight tracking-[0.02em] text-white uppercase sm:text-[21px]">
          {step.title}
        </h3>
        {step.body.map((p) => (
          <p key={p} className="mt-2.5 text-[15px] leading-[24px] font-normal text-white/75">
            {p}
          </p>
        ))}
        {step.list && (
          <>
            <p className="mt-2.5 text-[15px] leading-[24px] font-normal text-white/75">{step.list.lead}</p>
            <ul className="mt-3 flex flex-wrap gap-2">
              {step.list.items.map((item) => (
                <li
                  key={item}
                  className="rounded-full bg-white/[0.05] px-3 py-1.5 text-[13.5px] leading-[18px] font-semibold text-white/85 ring-1 ring-white/10"
                >
                  {item}
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </li>
  );
}

/* ── 6. Benefits ──────────────────────────────────────────────────────────
   "Keep concise." Five short cards, three over two from `lg`, on a six-track
   grid so the second row's pair fills the width rather than leaving a hole. */

const BENEFIT_ICONS: GlyphName[] = ["steam", "seat-edge", "layers", "target", "van"];

function Benefits() {
  const b = STEAM.benefits;
  return (
    <section className="w-full py-16 lg:py-[104px]">
      <div className="shell">
        <SectionHead title={b.heading} />
        <Kicker>{b.title}</Kicker>

        <ul className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-6 lg:gap-5">
          {b.items.map((it, i) => (
            <Reveal
              as="li"
              key={it.title}
              delay={i % 3}
              className={`surface group relative overflow-hidden p-6 sm:p-7 ${i < 3 ? "lg:col-span-2" : "lg:col-span-3"} ${
                i === 4 ? "sm:col-span-2 lg:col-span-3" : ""
              }`}
            >
              <div className="flex items-center gap-4 sm:block">
                <IconDisc name={BENEFIT_ICONS[i] ?? "check"} size={50} />
                <h3 className="font-[family-name:var(--font-sub)] text-[20px] leading-tight text-white uppercase sm:mt-6">
                  {it.title}
                </h3>
              </div>
              <p className="mt-3 text-[15px] leading-[25px] font-normal text-white/75">{it.body}</p>
              <HoverRule />
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}

/* ── 7. Which Medusa packages include steam cleaning? ─────────────────────
   "PACKAGE SELECTION — Three large cards: TRITON Interior · ZEUS Interior +
   Exterior · MEDUSA GOLD Premium Valet. Each card should have its own CTA."
   The layout's label over each valet's name, Section 7's copy under it, and
   the button that opens the valet's own page at the foot, so the three share
   a baseline. The hero's "View Our Valet Packages" lands here. */

function Packages() {
  const s = STEAM.packages;
  return (
    <section id="packages" className="w-full scroll-mt-24 bg-gold-wash py-16 lg:py-[104px]">
      <div className="shell">
        <div className="grid gap-6 lg:grid-cols-12 lg:items-end lg:gap-16">
          <div className="lg:col-span-7">
            <SectionHead title={s.heading} tone="gold" />
            <Kicker onGold>{s.title}</Kicker>
          </div>
          <Reveal delay={3} className="lg:col-span-5">
            {s.leadHtml.map((html, i) => (
              <Prose key={html} html={html} onGold space={i === 0 ? "mt-0" : "mt-2"} />
            ))}
          </Reveal>
        </div>

        <ul className="mt-12 grid gap-4 lg:grid-cols-3 lg:gap-5">
          {s.items.map((p, i) => (
            <PackageCard key={p.valet} pkg={p} index={i} />
          ))}
        </ul>
      </div>
    </section>
  );
}

function PackageCard({ pkg: p, index }: { pkg: Package; index: number }) {
  const s = STEAM.packages;
  const premium = p.valet === "gold";
  return (
    <Reveal as="li" delay={index} className="surface-on-gold group relative flex flex-col overflow-hidden p-6 sm:p-8">
      {premium && (
        <span
          aria-hidden
          className="absolute -top-16 -right-16 h-52 w-52 rounded-full bg-[radial-gradient(circle,rgba(237,179,38,0.2),transparent_70%)]"
        />
      )}
      <div className="relative flex items-center justify-between gap-4">
        <span
          className={`rounded-full px-3 py-1.5 font-[family-name:var(--font-ui)] text-[11px] font-semibold tracking-[0.16em] uppercase ${
            premium ? "bg-gold text-ink" : "bg-gold/12 text-gold ring-1 ring-gold/35"
          }`}
        >
          {p.tag}
        </span>
        <span
          aria-hidden
          className="font-[family-name:var(--font-display)] text-[40px] leading-[0.8] text-white/[0.09]"
        >
          {String(index + 1).padStart(2, "0")}
        </span>
      </div>
      <h3 className="relative mt-6 font-[family-name:var(--font-sub)] text-[25px] leading-[1.05] tracking-[0.02em] text-white uppercase sm:text-[28px] lg:text-[25px] xl:text-[28px]">
        {VALETS[p.valet].name}
      </h3>
      <p className="relative mt-2.5 font-[family-name:var(--font-sub)] text-[16px] leading-[1.3] font-semibold tracking-[0.03em] text-gold uppercase">
        {p.title}
      </p>
      {p.body.map((b, j) => (
        <p
          key={b}
          className={`relative mt-3 text-[15px] leading-[24px] ${j === 0 ? "font-semibold text-white/90" : "font-normal text-white/70"}`}
        >
          {b}
        </p>
      ))}
      {p.suitable && (
        <div className="relative mt-5 rounded-[12px] bg-white/[0.04] px-4 py-4 ring-1 ring-white/[0.07]">
          <p className="text-[13.5px] leading-[20px] font-semibold text-gold">{s.suitableLabel}</p>
          <ul className="mt-2.5 grid gap-2">
            {p.suitable.map((item) => (
              <li key={item} className="flex items-start gap-2.5 text-[14px] leading-[20px] font-normal text-white/85">
                <span className="mt-px">
                  <Tick size={18} />
                </span>
                {item}
              </li>
            ))}
          </ul>
        </div>
      )}
      <div className="relative mt-auto pt-7">
        <ValetLink
          valet={p.valet}
          className="btn btn-gold min-h-[52px] w-full rounded-full px-5 py-3 text-center text-[14px] leading-[18px]"
        >
          {p.ctaLabel}
          <Icon name="arrow" size={18} className="ml-2.5 shrink-0" />
        </ValetLink>
      </div>
      <HoverRule />
    </Reveal>
  );
}

/* ── 8 & 9. What about stains? · What about smells? ───────────────────────
   "STAINS & ODOURS — Two-column section: STAINS — Explain results vary.
   ODOURS — Direct customers to Odour & Ozone Treatment." Each column its own
   section name and heading over one panel; the odour column ends on the
   brief's "NEED HELP WITH AN INTERIOR SMELL?" box and its button. */

function StainsAndSmells() {
  const st = STEAM.stains;
  const sm = STEAM.smells;
  return (
    <section className="w-full py-16 lg:py-[104px]">
      <div className="shell grid gap-14 lg:grid-cols-2 lg:gap-10 xl:gap-14">
        {/* Section 8 */}
        <div id="stains" className="flex min-w-0 scroll-mt-24 flex-col">
          <SectionHead title={st.heading} />
          <Kicker>{st.title}</Kicker>
          <Reveal delay={3} className="mt-7 flex-1">
            <div className="surface flex h-full flex-col p-6 sm:p-8">
              <p className="text-[17px] leading-[26px] font-semibold text-white">{st.lead}</p>
              <Label className="mt-6">{st.listLead}</Label>
              <ul className="mt-3 grid gap-2">
                {st.list.map((item) => (
                  <li key={item} className="flex gap-3 text-[15px] leading-[22px] font-normal text-white/80">
                    <span aria-hidden className="mt-[8px] h-1.5 w-1.5 shrink-0 rounded-full bg-gold" />
                    {item}
                  </li>
                ))}
              </ul>
              <p className="mt-4 text-[15px] leading-[24px] font-normal text-white/80">{st.after}</p>
              <div className="mt-6 lg:mt-auto lg:pt-6">
                <Important title={st.important.title} strong={st.important.strong} body={st.important.body} />
              </div>
            </div>
          </Reveal>
        </div>

        {/* Section 9 */}
        <div id="smells" className="flex min-w-0 scroll-mt-24 flex-col">
          <SectionHead title={sm.heading} />
          <Kicker>{sm.title}</Kicker>
          <Reveal delay={3} className="mt-7 flex-1">
            <div className="surface flex h-full flex-col p-6 sm:p-8">
              <p className="text-[17px] leading-[26px] font-semibold text-white">{sm.lead}</p>
              <Label className="mt-6">{sm.listLead}</Label>
              <ul className="mt-3 flex flex-wrap gap-2">
                {sm.list.map((item) => (
                  <li
                    key={item}
                    className="rounded-full bg-white/[0.05] px-3 py-1.5 text-[13.5px] leading-[18px] font-normal text-white/85 ring-1 ring-white/10"
                  >
                    {item}
                  </li>
                ))}
              </ul>
              <p className="mt-4 text-[15px] leading-[24px] font-semibold text-white">{sm.after}</p>

              <div className="mt-6 rounded-[12px] bg-gold/[0.07] p-5 ring-1 ring-gold/40 sm:p-6">
                <div className="flex items-center gap-3">
                  <IconDisc name="ozone" size={40} solid />
                  <h3 className="font-[family-name:var(--font-sub)] text-[18px] leading-tight tracking-[0.03em] text-white uppercase sm:text-[19px]">
                    {sm.help.title}
                  </h3>
                </div>
                <p className="mt-4 text-[14.5px] leading-[22px] font-normal text-white/70">{sm.help.offers}</p>
                <p className="mt-1 font-[family-name:var(--font-sub)] text-[22px] leading-tight font-semibold tracking-[0.03em] text-gold uppercase">
                  {sm.help.name}
                </p>
                <p className="mt-3 text-[14.5px] leading-[22px] font-normal text-white/70">{sm.help.addOnTo}</p>
                <ul className="mt-2.5 flex flex-wrap gap-2">
                  {VALET_KEYS.map((k) => (
                    <li key={k}>
                      <ValetLink
                        valet={k}
                        className="inline-flex items-center rounded-full bg-white/[0.05] px-3 py-1.5 font-[family-name:var(--font-ui)] text-[11.5px] font-semibold tracking-[0.1em] text-white uppercase ring-1 ring-white/15 transition-colors hover:bg-gold hover:text-ink"
                      >
                        {VALETS[k].name}
                      </ValetLink>
                    </li>
                  ))}
                </ul>
                <Link
                  href={ODOUR_PATH}
                  className="btn btn-gold mt-5 min-h-[52px] w-full rounded-full px-5 py-3 text-center text-[14px] leading-[18px] sm:w-auto sm:px-7"
                >
                  {sm.help.ctaLabel}
                  <Icon name="arrow" size={18} className="ml-2.5 shrink-0" />
                </Link>
              </div>

              <p className="mt-5 flex items-start gap-2.5 text-[14.5px] leading-[22px] font-semibold text-white">
                <span className="mt-px flex shrink-0 items-center gap-2 font-[family-name:var(--font-ui)] text-[11.5px] leading-[22px] tracking-[0.22em] text-gold uppercase">
                  <Icon name="info" size={16} className="shrink-0" />
                  {sm.important.title}
                </span>
                <span>{sm.important.body}</span>
              </p>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/* ── 10. Specialist interior problems ─────────────────────────────────────
   "SPECIALIST SERVICES — Four cards: PET HAIR · ODOUR · VOMIT · MOULD. This
   creates strong internal linking between your interior-cleaning pages."
   Each card ends on the brief's button to that service's own page. */

const SPECIALIST_ICONS: GlyphName[] = ["paw", "droplet", "mould", "ozone"];

function Specialist() {
  const s = STEAM.specialist;
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
            <Reveal
              as="li"
              key={it.title}
              delay={i}
              className="surface-on-gold group relative flex flex-col overflow-hidden p-6 sm:p-7"
            >
              <IconDisc name={SPECIALIST_ICONS[i] ?? "info"} size={50} />
              <h3 className="mt-5 font-[family-name:var(--font-sub)] text-[20px] leading-tight tracking-[0.02em] text-white uppercase">
                {it.title}
              </h3>
              <p className="mt-3 text-[15px] leading-[24px] font-normal text-white/75">{it.body}</p>
              <div className="mt-auto pt-6">
                <Link
                  href={it.href}
                  className="btn btn-outline min-h-[48px] w-full rounded-full px-4 py-2.5 text-center text-[13.5px] leading-[18px]"
                >
                  {it.ctaLabel}
                  <Icon name="arrow" size={17} className="ml-2 shrink-0" />
                </Link>
              </div>
              <HoverRule />
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}

/* ── 12. Why choose Medusa? ───────────────────────────────────────────────
   Six reasons as a numbered list rather than another run of cards — the
   page already has four — with the brief's VIEW VALET PACKAGES beside the
   heading. */

function WhyMedusa() {
  const w = STEAM.why;
  return (
    <section className="w-full py-16 lg:py-[104px]">
      <div className="shell">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <SectionHead title={w.heading} />
            <Kicker>{w.title}</Kicker>
          </div>
          <Reveal delay={3} className="w-full sm:w-auto">
            <PackagesButton label={w.ctaLabel} className="w-full sm:w-auto" />
          </Reveal>
        </div>

        <ol className="mt-12 grid gap-x-10 sm:grid-cols-2 lg:grid-cols-3">
          {w.items.map((it, i) => (
            <Reveal as="li" key={it.title} delay={i % 3} className="border-t border-white/10 py-7">
              <span className="font-[family-name:var(--font-display)] text-[30px] leading-none text-gold/90">
                {String(i + 1).padStart(2, "0")}
              </span>
              <h3 className="mt-4 font-[family-name:var(--font-sub)] text-[20px] leading-tight tracking-[0.02em] text-white uppercase sm:text-[21px]">
                {it.title}
              </h3>
              {it.body.map((p) => (
                <p key={p} className="mt-2.5 text-[15px] leading-[25px] font-normal text-white/75">
                  {p}
                </p>
              ))}
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
}

/* ── 14. FAQ ──────────────────────────────────────────────────────────────
   "Accordion format." */

function Faq() {
  const f = STEAM.faq;
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

/* ── 15. Important service information ────────────────────────────────────
   "Please Read Before Booking" — the five, numbered in the brief's order,
   on the band before the close, as the odour and pet hair pages set their
   terms. Existing damage keeps its one sentence round its list. */

function ServiceInfo() {
  const s = STEAM.info;
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
              <InfoRow key={it.title} item={it} n={i + 1} />
            ))}
          </ol>
        </Reveal>
      </div>
    </section>
  );
}

function InfoRow({ item: it, n }: { item: InfoItem; n: number }) {
  return (
    <li className="flex gap-4 border-b border-white/[0.06] py-5 last:border-b-0">
      <span
        aria-hidden
        className="w-7 shrink-0 font-[family-name:var(--font-display)] text-[19px] leading-[23px] text-gold"
      >
        {String(n).padStart(2, "0")}
      </span>
      <div className="min-w-0">
        <h3 className="font-[family-name:var(--font-sub)] text-[18px] leading-[23px] tracking-[0.03em] text-white uppercase sm:text-[19px]">
          {it.title}
        </h3>
        {it.body.map((p) => (
          <p key={p} className="mt-2 text-[15px] leading-[24px] font-normal text-white/75">
            {p}
          </p>
        ))}
        {it.list && (
          <ul className="mt-3 flex flex-wrap gap-2">
            {it.list.map((item) => (
              <li
                key={item}
                className="rounded-full bg-white/[0.05] px-3 py-1.5 text-[13.5px] leading-[18px] font-semibold text-white/85 ring-1 ring-white/10"
              >
                {item}
              </li>
            ))}
          </ul>
        )}
        {it.after?.map((p) => (
          <p key={p} className="mt-3 text-[15px] leading-[24px] font-normal text-white/75">
            {p}
          </p>
        ))}
        {it.strong && <p className="mt-3 text-[15px] leading-[24px] font-semibold text-white">{it.strong}</p>}
      </div>
    </li>
  );
}

/* ── 16. Final CTA ─────────────────────────────────────────────────────────
   "FINAL PACKAGE SELECTOR / CTA — Triton / Zeus / Medusa Gold." The two
   paragraphs and both buttons beside a card of the three valets, each with
   its line and its own link; the sticky bar steps aside while it is on
   screen. */

function FinalCta() {
  const f = STEAM.finalCta;
  return (
    <section
      id="steam-final"
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
            <p className="measure mt-6 text-[18px] leading-[28px] font-semibold text-white">{f.body[0]}</p>
            <p className="measure mt-3 text-[17px] leading-[28px] font-normal text-body">{f.body[1]}</p>
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
              {f.packages.map((p) => (
                <li key={p.valet} className="flex flex-wrap items-center justify-between gap-x-4 gap-y-3 px-6 py-5 sm:px-7">
                  <div className="min-w-0">
                    <p className="font-[family-name:var(--font-sub)] text-[18px] leading-tight font-semibold tracking-[0.04em] text-white uppercase">
                      {VALETS[p.valet].name}
                    </p>
                    <p className="mt-1 text-[14px] leading-[20px] font-semibold text-white/75">{p.line}</p>
                  </div>
                  <ValetLink
                    valet={p.valet}
                    className="inline-flex min-h-[44px] shrink-0 items-center rounded-full bg-gold/12 px-4 font-[family-name:var(--font-ui)] text-[12px] font-semibold tracking-[0.12em] whitespace-nowrap text-gold uppercase ring-1 ring-gold/35 transition-colors hover:bg-gold hover:text-ink"
                  >
                    {p.ctaLabel}
                    <Icon name="arrow" size={15} className="ml-2 shrink-0" />
                  </ValetLink>
                </li>
              ))}
            </ul>
            <p className="flex items-center gap-2.5 bg-gold/[0.08] px-6 py-4 font-[family-name:var(--font-ui)] text-[12.5px] leading-[20px] font-semibold tracking-[0.14em] text-gold uppercase sm:px-7">
              <Icon name="van" size={18} className="shrink-0" />
              {f.mobile}
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
