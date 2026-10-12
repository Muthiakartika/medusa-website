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
import { PATH, PET_HAIR, PHOTOS, SLUG, type Step, TRITON_PATH } from "@/lib/pet-hair-removal";
import { pageSchema } from "@/lib/schema";
import { EVENTS } from "@/lib/track";

/**
 * Car pet hair removal — rebuilt from the client's brief.
 *
 * Client, 2026-10-06: "Replace/re-optimise the existing Pet Hair Removal page
 * with the content below. KEEP EXISTING URL". Every word of the brief's
 * sections is in `lib/pet-hair-removal.ts`; this file is only layout, in the
 * order of the brief's "RECOMMENDED PAGE LAYOUT":
 *
 *   1 hero · 2 how it works · 3 why pet hair needs extra work · 4 the six
 *   steps · 5 what's included · 6 up to 90% · 7 excessive pet hair ·
 *   9 price · 10 why Medusa · 11 reviews · 12 FAQ · the service terms ·
 *   13 the closing booking band.
 *
 * Section 8, "Before & After", is not here: "Add genuine Medusa
 * before-and-after photographs here" — and none exists yet.
 *
 * What decided the shape is the brief's last page: "The customer should
 * understand these four points within seconds: PET HAIR REMOVAL = +£20 · ONLY
 * AVAILABLE WITH TRITON INTERIOR VALET · WE AIM FOR UP TO 90% REMOVAL ·
 * EXCESSIVE PET HAIR = ADDITIONAL CHARGE". So the four are the first thing
 * under the h1, above the fold on a 360px phone with the booking button under
 * them, and the closing card says them again. Every booking button books the
 * Triton Interior Valet with the add-on — "the pet-hair page should generate
 * bookings for the main Triton service rather than make customers think they
 * can purchase pet-hair removal by itself" — and the sticky bar on a phone
 * reads "Book Triton + Pet Hair", as the brief asks, and nothing else.
 *
 * The rest of the layout list is followed item by item: three visual steps,
 * six visual steps, "simple icon grid", the 90% made "prominent … Don't hide
 * the limitation in small print" (a full band, the statement set large over a
 * bar that shows the tenth it does not promise), the excessive-hair charges in
 * "an information box", the price "Large", the FAQ an accordion.
 *
 * Gold and ink alternate the whole way down (client, 2026-09-22: "pastikan
 * warna bg tetap selang seling").
 *
 * The route wins over `app/[...slug]` because a static segment outranks a
 * catch-all, and the slug is in `CUSTOM_ROUTES` so only one page is built.
 */

const BOOK = PET_HAIR.book;
const WHATSAPP = PET_HAIR.whatsapp;

export function generateMetadata(): Metadata {
  const { title, description } = PET_HAIR.seo;
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

export default function PetHairRemovalPage() {
  const page = getPage(SLUG);
  if (!page) notFound();

  return (
    <>
      <JsonLd
        data={pageSchema(page, {
          service: {
            slug: SLUG,
            name: PET_HAIR.finalCta.card.title,
            serviceType: "Car pet hair removal",
            description: PET_HAIR.seo.description,
            image: PHOTOS.hero.src,
            /* +£20, and the page says it "cannot be booked as a standalone £20
               service": exact, but not payable alone. */
            offer: {
              price: "20",
              currency: "GBP",
              description: PET_HAIR.hero.addOn.note,
              requires: true,
            },
          },
          faq: PET_HAIR.faq.items,
        })}
      />
      <TrackClicks />

      <Header />
      <main className="flex-1">
        <Hero />
        <HowItWorks />
        <WhyExtra />
        <Process />
        <Included />
        <Ninety />
        <Excessive />
        <Price />
        <WhyMedusa />
        <Testimonials />
        <Faq />
        <Terms />
        <FinalCta />
      </main>
      <Footer />

      {/* "MOBILE STICKY CTA — Use: BOOK TRITON + PET HAIR". */}
      <StickyBookBar
        primary={{ label: PET_HAIR.stickyLabel, href: BOOK, track: EVENTS.bookPetHair }}
        after="pet-hero-actions"
        hideOver={["pet-final"]}
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
  /** Inside a card, where a long label has to wrap rather than run past the
   *  button's edge — at 1024px the target card is 230px inside. */
  inCard?: boolean;
  className?: string;
}) {
  return (
    <a
      href={BOOK}
      data-track={EVENTS.bookPetHair}
      className={`btn ${tone === "gold" ? "btn-gold" : "btn-dark"} min-h-[52px] rounded-full px-5 text-center text-[14px] ${
        inCard ? "py-3 leading-[18px]" : "sm:px-7 sm:text-[15px] sm:whitespace-nowrap"
      } ${className}`}
    >
      {label}
      <Icon name="arrow" size={18} className="ml-2.5 shrink-0" />
    </a>
  );
}

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

/* The brief gives every section a name and then a heading — "WHY PET HAIR
   NEEDS EXTRA ATTENTION" over "Normal Vacuuming Doesn't Always Remove
   Embedded Pet Hair". The name is the h2, as on the other rebuilt pages; the
   heading is the line under it, in the condensed face. */
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

function IconDisc({ name, size = 46, onGoldPanel }: { name: IconName; size?: number; onGoldPanel?: boolean }) {
  return (
    <span
      className={`flex shrink-0 items-center justify-center rounded-full ${
        onGoldPanel ? "bg-gold text-ink" : "bg-gold/12 text-gold ring-1 ring-gold/35"
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

/* ── 1. Hero ──────────────────────────────────────────────────────────────
   "Immediately show: CAR PET HAIR REMOVAL +£20 ADD TO TRITON INTERIOR VALET
   UP TO 90% REMOVAL [BOOK NOW] — This needs to be visible above the fold."
   The h1, then the four points as one panel — the price beside the three
   conditions that come with it — then the booking button. The add-on card
   (the brief's six ticks and its standalone note) sits beside them from
   `lg` and under them on a phone. */

const POINT_ICONS: IconName[] = ["seat", "gauge", "info"];

function Hero() {
  const h = PET_HAIR.hero;
  const pts = PET_HAIR.points;
  const [lead, ...rest] = h.intro;
  const conditions = [pts.triton, pts.aim, pts.excessive];

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
              <h1 className="max-w-[16ch] text-[clamp(31px,4.4vw,60px)] leading-[1.0] text-white sm:mt-7 lg:mt-6">
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
              <div className="mt-6 flex max-w-[620px] flex-col overflow-hidden rounded-[14px] bg-white/[0.04] ring-1 ring-gold/35 sm:flex-row xl:mt-8">
                <p className="flex items-center gap-3.5 bg-gold/[0.1] px-5 py-3.5 sm:flex-col sm:items-start sm:justify-center sm:gap-2 sm:px-6 sm:py-5">
                  <span className="shrink-0 font-[family-name:var(--font-display)] text-[44px] whitespace-nowrap leading-[0.85] text-gold sm:text-[58px]">
                    {pts.price.value}
                  </span>
                  <span className="font-[family-name:var(--font-ui)] text-[11.5px] leading-[15px] font-semibold tracking-[0.16em] text-white/80 uppercase">
                    {pts.price.label}
                  </span>
                </p>
                <ul className="flex flex-1 flex-col justify-center gap-2.5 border-t border-gold/25 px-5 py-4 sm:border-t-0 sm:border-l sm:px-6">
                  {conditions.map((c, i) => (
                    <li
                      key={c}
                      className="flex items-center gap-3 text-[14px] leading-[19px] font-semibold text-white sm:text-[14.5px]"
                    >
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gold text-ink">
                        <Icon name={POINT_ICONS[i]} size={15} strokeWidth={2.1} />
                      </span>
                      {c}
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>

            <Reveal delay={4}>
              <div id="pet-hero-actions" className="mt-6 flex xl:mt-8">
                <BookButton label={h.bookLabel} className="w-full sm:w-auto" />
              </div>
            </Reveal>

            <Reveal delay={5}>
              <p className="mt-7 max-w-[58ch] text-[16px] leading-[26px] font-normal text-white/80 xl:mt-8 xl:text-[17px] xl:leading-[28px]">
                {lead}
              </p>
            </Reveal>
          </div>

          <Reveal delay={4} className="lg:col-span-5">
            <AddOnCard />
          </Reveal>
        </div>

        <Reveal delay={5}>
          <div className="mt-10 grid gap-4 border-t border-white/10 pt-7 md:grid-cols-2 md:gap-10 lg:mt-12">
            {rest.map((html) => (
              <p
                key={html}
                className="text-[15px] leading-[25px] font-normal text-white/65 [&_a]:text-gold [&_a]:underline [&_a]:underline-offset-2 [&_strong]:font-semibold [&_strong]:text-white"
                dangerouslySetInnerHTML={{ __html: html }}
              />
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* "PET HAIR REMOVAL ADD-ON — £20", its six ticks, "£20 ADD-ON" and the note
   that it cannot be booked on its own — the price as a tag on the photograph,
   the note as the card's last and strongest line. */
function AddOnCard() {
  const a = PET_HAIR.hero.addOn;
  return (
    /* Photograph over the copy in the hero's narrow column and on a phone;
       side by side on a tablet, where the stacked card ran a 450px-tall
       picture across the full width. */
    <figure className="surface relative overflow-hidden md:grid md:grid-cols-2 lg:block">
      <div className="relative aspect-[3/2] w-full md:aspect-auto md:min-h-[300px] lg:aspect-[3/2] lg:min-h-0">
        <Image
          src={PHOTOS.hero.src}
          alt={PHOTOS.hero.alt}
          fill
          priority
          sizes="(min-width: 1024px) 38vw, (min-width: 768px) 46vw, 92vw"
          className="object-cover object-[60%_50%]"
        />
        <div
          aria-hidden
          className="absolute inset-x-0 bottom-0 h-1/3 bg-[linear-gradient(to_top,rgba(13,13,13,0.85),transparent)]"
        />
        <span className="absolute top-4 right-4 rounded-full bg-gold px-4 py-2 font-[family-name:var(--font-ui)] text-[12px] font-bold tracking-[0.14em] text-ink uppercase shadow-[0_10px_30px_-10px_rgba(0,0,0,0.7)]">
          {a.badge}
        </span>
      </div>
      <figcaption className="p-5 sm:p-6">
        <h3 className="font-[family-name:var(--font-sub)] text-[18px] leading-tight tracking-[0.03em] text-white uppercase sm:text-[20px]">
          {a.title}
        </h3>
        <ul className="mt-4 grid gap-x-4 gap-y-2.5 sm:grid-cols-2 md:grid-cols-1 xl:grid-cols-2">
          {a.ticks.map((t) => (
            <li key={t} className="flex items-start gap-2.5 text-[14px] leading-[20px] font-semibold text-white/90">
              <span className="mt-px">
                <Tick size={18} />
              </span>
              {t}
            </li>
          ))}
        </ul>
        <p className="mt-5 flex gap-3 rounded-[10px] bg-gold/[0.08] px-4 py-3.5 text-[14px] leading-[21px] font-semibold text-white ring-1 ring-gold/30">
          <Icon name="info" size={18} className="mt-px shrink-0 text-gold" />
          {a.note}
        </p>
      </figcaption>
    </figure>
  );
}

/* ── 2. How it works ──────────────────────────────────────────────────────
   "Use three visual steps: BOOK TRITON → ADD PET HAIR +£20 → WE COME TO YOU".
   Three cards joined by the arrows the brief draws between them — across
   from `lg`, down the page on a phone. The add-on step is the one in gold,
   and the Triton step carries the internal link the brief asks for. */

const HOW_ICONS: IconName[] = ["calendar", "plus", "van"];

function HowItWorks() {
  const s = PET_HAIR.how;
  return (
    <section id="how-it-works" className="w-full bg-gold-wash py-16 lg:py-[104px]">
      <div className="shell">
        <div className="grid gap-6 lg:grid-cols-12 lg:items-end lg:gap-16">
          <div className="lg:col-span-7">
            <SectionHead title={s.heading} tone="gold" />
            <Kicker onGold>{s.title}</Kicker>
          </div>
          <Reveal delay={3} className="lg:col-span-5">
            {s.leadHtml.map((html) => (
              <Prose key={html} html={html} onGold className="lg:mt-2 lg:first:mt-0" />
            ))}
          </Reveal>
        </div>

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
                  <IconDisc name={HOW_ICONS[i]} size={50} onGoldPanel={addOn} />
                  <span className="font-[family-name:var(--font-ui)] text-[11.5px] font-semibold tracking-[0.2em] text-gold uppercase">
                    Step {i + 1}
                  </span>
                </div>
                <h3 className="mt-6 font-[family-name:var(--font-sub)] text-[21px] leading-tight tracking-[0.02em] text-white uppercase sm:text-[22px]">
                  {step.title}
                </h3>
                {step.body.map((p) => (
                  <p key={p} className="mt-2.5 text-[15px] leading-[24px] font-normal text-white/75">
                    {p}
                  </p>
                ))}
                {i === 0 && (
                  <Link
                    href={TRITON_PATH}
                    className="group mt-auto inline-flex items-center gap-2 pt-5 text-[14.5px] font-semibold text-gold transition-colors hover:text-gold-bright"
                  >
                    {s.tritonLabel}
                    <Icon
                      name="arrow"
                      size={16}
                      className="shrink-0 transition-transform duration-300 group-hover:translate-x-1"
                    />
                  </Link>
                )}

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
          <BookButton label={s.bookLabel} tone="dark" className="mt-10 w-full sm:w-auto lg:mt-12" />
        </Reveal>
      </div>
    </section>
  );
}

/* ── 3. Why pet hair needs extra attention ────────────────────────────────
   "Short educational section." The places hair gets into as a row of chips,
   so the list reads at a glance, and the section's conclusion — the reason
   it is an add-on at all — as its last and strongest line. Beside it, the
   one photograph the site has of hair matted into a car's carpet. */

function WhyExtra() {
  const s = PET_HAIR.why;
  return (
    <section className="w-full py-16 lg:py-[104px]">
      <div className="shell grid items-center gap-12 lg:grid-cols-12 lg:gap-16">
        <div className="lg:order-2 lg:col-span-7">
          <SectionHead title={s.heading} />
          <Kicker>{s.title}</Kicker>
          <Reveal delay={3}>
            <p className="measure mt-5 text-[18px] leading-[28px] font-semibold text-white">{s.lead}</p>
            <p className="mt-7 font-[family-name:var(--font-ui)] text-[11.5px] font-semibold tracking-[0.2em] text-gold uppercase">
              {s.listLead}
            </p>
            <ul className="mt-4 flex flex-wrap gap-2">
              {s.places.map((p) => (
                <li
                  key={p}
                  className="flex items-center gap-2 rounded-full bg-white/[0.05] py-2 pr-3.5 pl-3 text-[14px] leading-[18px] font-normal text-white/90 ring-1 ring-white/10"
                >
                  <span aria-hidden className="h-1.5 w-1.5 shrink-0 rounded-full bg-gold" />
                  {p}
                </li>
              ))}
            </ul>
            {s.body.map((p, i) => (
              <Prose key={p} html={p} space={i === 0 ? "mt-7" : "mt-4"} />
            ))}
            <p className="mt-7 border-l-2 border-gold pl-4 text-[17px] leading-[26px] font-semibold text-white [&_strong]:text-gold">
              <span dangerouslySetInnerHTML={{ __html: s.conclusionHtml }} />
            </p>
          </Reveal>
        </div>

        <Reveal delay={2} className="lg:order-1 lg:col-span-5">
          <figure className="relative overflow-hidden rounded-[14px] ring-1 ring-white/[0.08]">
            <div className="relative aspect-[4/3] w-full sm:aspect-[3/2] lg:aspect-[3/4]">
              <Image
                src={PHOTOS.carpet.src}
                alt={PHOTOS.carpet.alt}
                fill
                sizes="(min-width: 1024px) 38vw, 92vw"
                className="object-cover object-[50%_55%]"
              />
            </div>
          </figure>
        </Reveal>
      </div>
    </section>
  );
}

/* ── 4. Our pet hair removal process ──────────────────────────────────────
   "Six visual steps." A card each, numbered and marked, two across beside
   the section's heading and photograph, which hold still from `lg`. */

const PROCESS_ICONS: Record<string, IconName> = {
  "Interior Assessment": "search",
  "Initial Vacuum": "vacuum",
  "Specialist Agitation": "brush",
  "Detailed Vacuuming": "target",
  "Boot Area": "boot",
  "Final Inspection": "eye",
};

function Process() {
  const s = PET_HAIR.process;
  return (
    <section id="process" className="w-full bg-gold-wash py-16 lg:py-[104px]">
      <div className="shell grid gap-10 lg:grid-cols-12 lg:gap-14">
        <div className="lg:col-span-4">
          <div className="lg:sticky lg:top-32">
            <SectionHead title={s.heading} tone="gold" />
            <Kicker onGold>{s.title}</Kicker>
            <Reveal delay={3}>
              <figure className="relative mt-8 overflow-hidden rounded-[14px] ring-1 ring-ink/15">
                <div className="relative aspect-[3/2] w-full lg:aspect-[4/5]">
                  <Image
                    src={PHOTOS.seat.src}
                    alt={PHOTOS.seat.alt}
                    fill
                    sizes="(min-width: 1024px) 30vw, 92vw"
                    className="object-cover object-[50%_62%]"
                  />
                </div>
              </figure>
            </Reveal>
          </div>
        </div>

        <ol className="grid gap-4 sm:grid-cols-2 lg:col-span-8 lg:gap-5">
          {s.steps.map((step, i) => (
            <ProcessStep key={step.title} step={step} n={i + 1} />
          ))}
        </ol>
      </div>
    </section>
  );
}

function ProcessStep({ step, n }: { step: Step; n: number }) {
  return (
    <Reveal as="li" delay={n % 2} className="surface-on-gold group relative flex flex-col overflow-hidden p-6 sm:p-7">
      <div className="flex items-start justify-between gap-4">
        <IconDisc name={PROCESS_ICONS[step.title] ?? "check"} />
        <span
          aria-hidden
          className="font-[family-name:var(--font-display)] text-[48px] leading-[0.8] text-white/[0.09]"
        >
          {String(n).padStart(2, "0")}
        </span>
      </div>
      <p className="mt-5 font-[family-name:var(--font-ui)] text-[11px] font-semibold tracking-[0.2em] text-gold uppercase">
        Step {n}
      </p>
      <h3 className="mt-1 font-[family-name:var(--font-sub)] text-[20px] leading-tight tracking-[0.02em] text-white uppercase sm:text-[21px]">
        {step.title}
      </h3>
      {step.body.map((html) => (
        <p
          key={html}
          className="mt-2.5 text-[14.5px] leading-[23px] font-normal text-white/75 [&_strong]:font-semibold [&_strong]:text-white"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      ))}
      <HoverRule />
    </Reveal>
  );
}

/* ── 5. What's included? ───────────────────────────────────────────────────
   "Simple icon grid." Eight tiles, four across, and beside them the brief's
   "OUR TARGET" as a gauge filled to the 90 it promises. */

const AREA_ICONS: Record<string, IconName> = {
  "Fabric seats": "seat",
  Carpets: "carpet",
  "Floor mats": "mat",
  Footwells: "footwell",
  "Seat edges": "seat-edge",
  "Boot carpet/area": "boot",
  "Upholstered interior surfaces": "layers",
  "Other areas containing accessible pet hair": "paw",
};

function Included() {
  const s = PET_HAIR.included;
  return (
    <section className="w-full py-16 lg:py-[104px]">
      <div className="shell grid gap-12 lg:grid-cols-12 lg:items-center lg:gap-16">
        <div className="lg:col-span-7">
          <SectionHead title={s.heading} />
          <Kicker>{s.title}</Kicker>
          <Reveal delay={3}>
            <Prose html={s.lead} />
          </Reveal>
          <ul className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-4">
            {s.areas.map((a, i) => (
              <Reveal
                as="li"
                key={a}
                delay={i % 4}
                className="flex flex-col gap-3.5 rounded-[12px] bg-white/[0.04] p-4 ring-1 ring-white/[0.07] sm:p-5"
              >
                <IconDisc name={AREA_ICONS[a] ?? "check"} size={44} />
                <span className="text-[14px] leading-[19px] font-semibold text-white">{a}</span>
              </Reveal>
            ))}
          </ul>
        </div>

        <Reveal delay={2} className="lg:col-span-5">
          <TargetCard />
        </Reveal>
      </div>
    </section>
  );
}

function TargetCard() {
  const t = PET_HAIR.included.target;
  /* r = 52 → circumference 326.7; 90% of it is drawn. */
  const C = 2 * Math.PI * 52;
  return (
    <div className="surface relative overflow-hidden p-6 text-center sm:p-8 lg:p-10">
      <div
        aria-hidden
        className="absolute inset-0"
        style={{ background: "radial-gradient(60% 50% at 50% 0%, rgba(193,146,49,0.16) 0%, transparent 70%)" }}
      />
      <div className="relative">
        <p className="font-[family-name:var(--font-ui)] text-[11.5px] font-semibold tracking-[0.22em] text-gold uppercase">
          {t.label}
        </p>
        <div aria-hidden className="relative mx-auto mt-5 h-[150px] w-[150px] sm:h-[168px] sm:w-[168px]">
          <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90">
            <circle cx="60" cy="60" r="52" fill="none" stroke="rgb(255 255 255 / 0.08)" strokeWidth="9" />
            <circle
              cx="60"
              cy="60"
              r="52"
              fill="none"
              stroke="var(--color-gold-bright)"
              strokeWidth="9"
              strokeLinecap="round"
              strokeDasharray={`${C * 0.9} ${C}`}
            />
          </svg>
          <span className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="font-[family-name:var(--font-ui)] text-[11px] font-semibold tracking-[0.2em] text-white/60 uppercase">
              Up to
            </span>
            <span className="mt-1 font-[family-name:var(--font-display)] text-[46px] leading-none text-white sm:text-[52px]">
              90%
            </span>
          </span>
        </div>
        <h3 className="mt-6 font-[family-name:var(--font-sub)] text-[22px] leading-tight tracking-[0.03em] text-white uppercase sm:text-[24px]">
          {t.title}
        </h3>
        {t.bodyHtml.map((html, i) => (
          <p
            key={html}
            className={`mx-auto mt-3 max-w-[40ch] text-[15px] leading-[24px] font-normal [&_strong]:font-semibold [&_strong]:text-white ${
              i === 0 ? "text-white/85" : "text-white/65"
            }`}
            dangerouslySetInnerHTML={{ __html: html }}
          />
        ))}
        <BookButton label={t.bookLabel} inCard className="mt-7 w-full sm:w-auto" />
      </div>
    </div>
  );
}

/* ── 6. Important: up to 90% removal ──────────────────────────────────────
   "Make this prominent. Don't hide the limitation in small print." A gold
   band of its own: the nine factors in one panel, then the conclusion set
   large on the band's one dark panel, over a bar that shows the 90 and the
   tenth that is not promised. */

function Ninety() {
  const s = PET_HAIR.ninety;
  return (
    <section id="up-to-90" className="w-full scroll-mt-24 bg-gold-wash py-16 lg:py-[104px]">
      <div className="shell">
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-14">
          <div className="lg:col-span-5">
            <SectionHead title={s.heading} tone="gold" />
            <Kicker onGold>{s.title}</Kicker>
            <Reveal delay={3}>
              <p className="measure mt-5 text-[18px] leading-[28px] font-semibold text-ink">{s.lead}</p>
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
          <div className="mt-6 rounded-[14px] bg-ink p-6 ring-1 ring-gold/40 sm:p-8 lg:mt-8 lg:p-10">
            <div className="grid gap-8 lg:grid-cols-12 lg:items-center lg:gap-12">
              <div className="lg:col-span-7">
                <p
                  className="font-[family-name:var(--font-sub)] text-[21px] leading-[1.3] font-normal tracking-[0.01em] text-white/85 sm:text-[25px] [&_strong]:font-semibold [&_strong]:text-gold"
                  dangerouslySetInnerHTML={{ __html: s.conclusionHtml }}
                />
                <p className="mt-4 max-w-[70ch] text-[15.5px] leading-[25px] font-normal text-white/70">{s.after}</p>
              </div>
              <RemovalBar />
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/** The 90 in gold, and the last tenth hatched — the part no one promises. */
function RemovalBar() {
  return (
    <div aria-hidden className="lg:col-span-5">
      <div className="relative pt-7">
        <span className="absolute top-0 left-0 font-[family-name:var(--font-ui)] text-[11.5px] font-semibold tracking-[0.18em] text-gold uppercase">
          Up to 90%
        </span>
        <div className="flex h-4 overflow-hidden rounded-full bg-white/[0.05] ring-1 ring-white/10">
          <span className="h-full w-[90%] rounded-full bg-[linear-gradient(90deg,var(--color-gold),var(--color-gold-bright))]" />
          <span className="h-full flex-1 bg-[repeating-linear-gradient(135deg,rgb(255_255_255/0.2)_0_3px,transparent_3px_7px)]" />
        </div>
        <p className="mt-2 text-right font-[family-name:var(--font-ui)] text-[11.5px] font-semibold tracking-[0.18em] text-white/45 uppercase">
          100%
        </p>
      </div>
    </div>
  );
}

/* ── 7. Excessive pet hair ─────────────────────────────────────────────────
   "Use an information box explaining additional charges." The list of when
   they apply beside the section's copy, and the brief's IMPORTANT block as
   that box — with the WhatsApp button the brief puts under it, since sending
   photographs is how a customer finds out. */

function Excessive() {
  const s = PET_HAIR.excessive;
  return (
    <section className="w-full py-16 lg:py-[104px]">
      <div className="shell">
        <div className="grid gap-10 lg:grid-cols-12 lg:items-center lg:gap-16">
          <div className="lg:col-span-6">
            <SectionHead title={s.heading} />
            <Kicker>{s.title}</Kicker>
            <Reveal delay={3}>
              {s.bodyHtml.map((html) => (
                <Prose key={html} html={html} />
              ))}
            </Reveal>
          </div>

          <Reveal delay={2} className="lg:col-span-6">
            <div className="surface p-6 sm:p-8">
              <div className="flex items-center gap-3">
                <IconDisc name="plus" size={40} />
                <h3 className="font-[family-name:var(--font-ui)] text-[12px] font-semibold tracking-[0.2em] text-gold uppercase">
                  {s.listLead}
                </h3>
              </div>
              <ul className="mt-5">
                {s.list.map((item) => (
                  <li
                    key={item}
                    className="flex gap-3 border-b border-white/[0.06] py-3 text-[15px] leading-[22px] font-normal text-white/85 last:border-b-0"
                  >
                    <Icon name="plus" size={16} strokeWidth={2.2} className="mt-[3px] shrink-0 text-gold" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        </div>

        <Reveal delay={1}>
          <div className="mt-8 flex flex-col gap-6 rounded-[14px] bg-gold/[0.07] p-6 ring-1 ring-gold/45 sm:p-8 lg:mt-10 lg:flex-row lg:items-center lg:justify-between lg:gap-12 lg:p-10">
            <div className="flex flex-col gap-4 sm:flex-row sm:gap-5">
              <IconDisc name="info" size={46} onGoldPanel />
              <div>
                <h3 className="font-[family-name:var(--font-ui)] text-[12px] font-semibold tracking-[0.22em] text-gold uppercase sm:pt-1">
                  {s.important.title}
                </h3>
                {s.important.bodyHtml.map((html, i) => (
                  <p
                    key={html}
                    className={`mt-2.5 max-w-[72ch] font-normal [&_strong]:font-semibold [&_strong]:text-white ${
                      i === 0 ? "text-[16.5px] leading-[26px] text-white" : "text-[15px] leading-[24px] text-white/75"
                    }`}
                    dangerouslySetInnerHTML={{ __html: html }}
                  />
                ))}
                <p className="mt-2.5 max-w-[72ch] text-[15px] leading-[24px] font-normal text-white/75">
                  {s.important.photos}
                </p>
              </div>
            </div>
            <WhatsAppButton label={s.important.whatsappLabel} className="w-full shrink-0 lg:w-auto" />
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ── 9. Price ─────────────────────────────────────────────────────────────
   "Large: +£20 WITH TRITON INTERIOR VALET." The brief's own words for the
   section are "ONLY £20 — When Added to a Triton Interior Valet", and they
   are the band's headline, set as large as anything on the site. Beside it,
   the brief's "YOUR SERVICE" sum, where the +£20 is, and the Triton line is
   a link to the service it adds to. */

function Price() {
  const s = PET_HAIR.price;
  return (
    <section id="price" className="w-full scroll-mt-24 bg-gold-wash py-16 lg:py-[104px]">
      <div className="shell grid gap-10 lg:grid-cols-12 lg:items-center lg:gap-16">
        <div className="lg:col-span-5">
          <SectionHead title={s.heading} tone="gold" />
          <Reveal delay={2}>
            <p className="mt-8 flex items-end gap-3 text-ink">
              <span className="pb-[0.32em] font-[family-name:var(--font-sub)] text-[22px] leading-none font-semibold tracking-[0.06em] uppercase sm:text-[26px]">
                {s.only}
              </span>
              <span className="font-[family-name:var(--font-display)] text-[92px] leading-[0.78] min-[400px]:text-[112px] sm:text-[150px] lg:text-[110px] xl:text-[150px]">
                {s.amount}
              </span>
            </p>
            <p className="mt-5 font-[family-name:var(--font-sub)] text-[20px] leading-[1.2] font-semibold tracking-[0.03em] text-ink uppercase sm:text-[23px]">
              {s.when}
            </p>
          </Reveal>
          <Reveal delay={3}>
            {s.bodyHtml.map((html) => (
              <Prose key={html} html={html} onGold />
            ))}
          </Reveal>
        </div>

        <Reveal delay={2} className="lg:col-span-7">
          <ServiceSum />
        </Reveal>

        <Reveal delay={1} className="lg:col-span-12">
          <div className="flex flex-col gap-4 rounded-[14px] bg-ink/[0.08] p-6 ring-1 ring-ink/25 sm:flex-row sm:gap-5 sm:p-7">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-ink text-gold">
              <Icon name="info" size={21} />
            </span>
            <div>
              <h3 className="font-[family-name:var(--font-sub)] text-[19px] leading-tight tracking-[0.03em] text-ink uppercase sm:pt-1.5 sm:text-[21px]">
                {s.excessive.title}
              </h3>
              <p className="mt-2 max-w-[90ch] text-[15.5px] leading-[25px] font-normal text-ink/85">
                {s.excessive.body.join(" ")}
              </p>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function ServiceSum() {
  const s = PET_HAIR.price;
  const sum = s.sum;
  const row = "flex items-center gap-3 rounded-[12px] px-3.5 py-3.5 sm:gap-4 sm:px-5 sm:py-4";
  return (
    <div className="surface-on-gold p-5 sm:p-8 lg:p-10">
      <p className="font-[family-name:var(--font-ui)] text-[11.5px] font-semibold tracking-[0.22em] text-gold uppercase">
        {sum.label}
      </p>
      <div className="mt-5 flex flex-col">
        <div className={`${row} bg-white/[0.04] ring-1 ring-white/[0.08]`}>
          <span className="hidden min-[380px]:block">
            <IconDisc name="seat" size={38} />
          </span>
          <Link
            href={TRITON_PATH}
            className="font-[family-name:var(--font-sub)] text-[17px] leading-tight font-semibold tracking-[0.03em] text-white uppercase underline decoration-gold/50 underline-offset-4 transition-colors hover:text-gold sm:text-[21px]"
          >
            {sum.base}
          </Link>
        </div>

        <Operator sign="+" label="plus" />

        <div className={`${row} bg-white/[0.04] ring-1 ring-white/[0.08]`}>
          <span className="hidden min-[380px]:block">
            <IconDisc name="paw" size={38} />
          </span>
          <span className="flex-1 font-[family-name:var(--font-sub)] text-[17px] leading-tight font-semibold tracking-[0.03em] text-white uppercase sm:text-[21px]">
            {sum.addOn}
          </span>
          <span className="shrink-0 font-[family-name:var(--font-display)] text-[30px] whitespace-nowrap leading-none text-gold sm:text-[40px]">
            {sum.addOnPrice}
          </span>
        </div>

        <Operator sign="=" label="equals" />

        <div className={`${row} bg-gold text-ink`}>
          <span className="flex h-[38px] w-[38px] shrink-0 items-center justify-center rounded-full bg-ink text-gold">
            <Icon name="check" size={20} strokeWidth={2.6} />
          </span>
          <span className="font-[family-name:var(--font-sub)] text-[17px] leading-[1.2] font-semibold tracking-[0.03em] uppercase sm:text-[19px]">
            {sum.result}
          </span>
        </div>
      </div>
      <BookButton label={s.bookLabel} className="mt-7 w-full sm:w-auto" />
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

/* ── 10. Why choose Medusa? ───────────────────────────────────────────────
   "Trust section." Six cards, an icon each, on ink. */

const WHY_ICONS: Record<string, IconName> = {
  "We Come to You": "van",
  "Specialist Tools": "brush",
  "Interior Valet + Pet Hair": "seat",
  "Clear Pricing": "tag",
  "Realistic Results": "gauge",
  "Professional Mobile Service": "shield",
};

function WhyMedusa() {
  const w = PET_HAIR.whyMedusa;
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
                  {it.title}
                </h3>
              </div>
              {it.bodyHtml.map((html) => (
                <p
                  key={html}
                  className="mt-3 text-[15px] leading-[25px] font-normal text-white/75 [&_strong]:font-semibold [&_strong]:text-white"
                  dangerouslySetInnerHTML={{ __html: html }}
                />
              ))}
              <HoverRule />
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}

/* ── 11. FAQ ──────────────────────────────────────────────────────────────
   "Use accordion format." */

function Faq() {
  const f = PET_HAIR.faq;
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

/* ── 12. Important service terms ──────────────────────────────────────────
   The seven terms, numbered, in one panel — they are what the booking's
   acknowledgement checkbox will ask the customer to accept — and the
   acknowledgement line itself as the band's last and strongest. */

function Terms() {
  const s = PET_HAIR.terms;
  return (
    <section id="terms" className="w-full scroll-mt-24 bg-gold-wash py-16 lg:py-[104px]">
      <div className="shell">
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-14">
          <div className="lg:col-span-5">
            <SectionHead title={s.heading} tone="gold" />
            <Kicker onGold>{s.title}</Kicker>
            <Reveal delay={3}>
              <p className="measure mt-5 text-[17px] leading-[28px] font-normal text-ink/85">{s.lead}</p>
            </Reveal>
          </div>

          <Reveal delay={2} className="lg:col-span-7">
            <div className="surface-on-gold p-6 sm:p-8 lg:p-10">
              <h3 className="font-[family-name:var(--font-ui)] text-[12px] font-semibold tracking-[0.22em] text-gold uppercase">
                {s.listLead}
              </h3>
              <ol className="mt-4">
                {s.list.map((t, i) => (
                  <li
                    key={t}
                    className="flex gap-4 border-b border-white/[0.06] py-3.5 last:border-b-0 last:pb-0"
                  >
                    <span
                      aria-hidden
                      className="w-7 shrink-0 font-[family-name:var(--font-display)] text-[19px] leading-[23px] text-gold"
                    >
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="text-[15.5px] leading-[23px] font-semibold text-white">{t}</span>
                  </li>
                ))}
              </ol>
            </div>
          </Reveal>
        </div>

        <Reveal delay={1}>
          <div className="mt-6 flex flex-col gap-4 rounded-[14px] bg-ink p-6 ring-1 ring-gold/40 sm:flex-row sm:items-center sm:gap-6 sm:p-8 lg:mt-8">
            <IconDisc name="shield" size={48} onGoldPanel />
            <p className="text-[16.5px] leading-[27px] font-semibold text-white sm:text-[18px] sm:leading-[29px]">
              {s.acknowledgement}
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ── 13. Final CTA ─────────────────────────────────────────────────────────
   "Repeat the £20 price and Triton requirement." The brief's closing card is
   the four points again; the sticky bar steps aside while it is on screen,
   since the band carries the same booking button. */

const CARD_ICONS: IconName[] = ["seat", "gauge", "info"];

function FinalCta() {
  const f = PET_HAIR.finalCta;
  return (
    <section
      id="pet-final"
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
            <div className="flex items-end justify-between gap-4 px-6 pt-7 pb-5 sm:px-7">
              <p className="font-[family-name:var(--font-sub)] text-[20px] leading-tight tracking-[0.03em] text-white uppercase">
                {f.card.title}
              </p>
              <p className="shrink-0 font-[family-name:var(--font-display)] text-[46px] whitespace-nowrap sm:text-[56px] leading-[0.8] text-gold">
                {f.card.price}
              </p>
            </div>
            <ul className="divide-y divide-white/[0.07] border-t border-white/[0.07]">
              {f.card.lines.map((line, i) => (
                <li
                  key={line}
                  className="flex items-center gap-3.5 px-6 py-4 text-[14.5px] leading-[21px] font-semibold text-white sm:px-7"
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gold/12 text-gold ring-1 ring-gold/35">
                    <Icon name={CARD_ICONS[i]} size={16} strokeWidth={2} />
                  </span>
                  {line}
                </li>
              ))}
            </ul>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
