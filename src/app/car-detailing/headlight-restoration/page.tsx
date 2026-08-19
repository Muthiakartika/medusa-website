import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import Icon, { type IconName } from "@/components/Icon";
import JsonLd from "@/components/JsonLd";
import Reveal from "@/components/Reveal";
import SectionHead from "@/components/SectionHead";
import { getPage } from "@/lib/blocks";
import { HEADLIGHT } from "@/lib/headlight";
import { pageSchema } from "@/lib/schema";

/**
 * Headlight restoration, laid out rather than rendered.
 *
 * Every other content page goes through the generic block renderer in
 * `components/Blocks.tsx`, which faithfully reproduces whatever row structure
 * the source WordPress page happened to have — here, a stack of two-column
 * rows with a bare "£ 100" heading floating under the h1. This page gets the
 * treatment the homepage gets instead: a real hero with the price attached to
 * the ask, the diagnostic copy as a card grid, the five-stage service as a
 * numbered timeline, and one gold band for brand rhythm.
 *
 * The copy is unchanged — see `lib/headlight.ts`. The route wins over
 * `app/[...slug]` because a static segment outranks a catch-all, and the slug
 * is excluded from that route's `generateStaticParams` so only one page is
 * ever built for it.
 */

const SLUG = "car-detailing/headlight-restoration";

export function generateMetadata(): Metadata {
  const page = getPage(SLUG);
  if (!page) return {};
  return {
    title: page.title,
    description: page.description,
    alternates: { canonical: `/${SLUG}/` },
    openGraph: {
      title: page.title,
      description: page.description,
      url: `/${SLUG}/`,
      images: page.ogImage ? [{ url: page.ogImage }] : undefined,
    },
  };
}

export default function HeadlightRestorationPage() {
  const page = getPage(SLUG);
  if (!page) notFound();

  return (
    <>
      <JsonLd data={pageSchema(page)} />
      <Header />
      <main className="flex-1">
        <Hero />
        <Proof />
        <Signs />
        <Matters />
        <Process />
        <WhyUs />
        <Areas />
        <Cta />
      </main>
      <Footer />
    </>
  );
}

/* ── Hero ─────────────────────────────────────────────────────────────────
   The photograph carries the left-to-right scrim used by every hero on the
   site; the price leaves the body copy and sits in the card next to the ask,
   where it is the thing a visitor is actually looking for. */

function Hero() {
  return (
    <section className="cut-bottom relative flex min-h-[720px] w-full items-center overflow-hidden pt-[170px] pb-[calc(var(--cut)+3rem)] lg:min-h-[840px] lg:pt-[210px]">
      <Image
        src={HEADLIGHT.hero.image}
        alt="A detailer machine-polishing a car headlight back to clarity"
        fill
        priority
        sizes="100vw"
        className="object-cover object-center"
      />
      <div
        aria-hidden
        className="absolute inset-0 bg-[linear-gradient(78deg,rgba(0,0,0,0.95)_0%,rgba(0,0,0,0.82)_48%,rgba(0,0,0,0.55)_100%)]"
      />
      {/* The beam. A headlight page should look lit from one side. */}
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(70% 60% at 88% 42%, rgba(237,179,38,0.26) 0%, rgba(193,146,49,0.08) 42%, transparent 74%)",
        }}
      />

      <div className="shell relative z-10">
        <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-10">
          <div className="lg:col-span-7">
            <Reveal>
              <span className="hero-rule speed-rule" aria-hidden />
            </Reveal>

            <Reveal delay={1}>
              <h1 className="mt-7 max-w-[16ch] text-[clamp(32px,5.6vw,60px)] leading-[0.98] text-white">
                {HEADLIGHT.h1}
              </h1>
            </Reveal>

            <Reveal delay={2}>
              <p className="mt-6 font-[family-name:var(--font-sub)] text-[19px] leading-[1.3] text-gold uppercase lg:text-[22px]">
                {HEADLIGHT.lead}
              </p>
            </Reveal>

            <Reveal delay={3}>
              <p
                className="mt-5 max-w-[62ch] text-[16px] leading-[27px] font-normal text-white/80 [&_strong]:font-semibold [&_strong]:text-white lg:text-[17px]"
                dangerouslySetInnerHTML={{ __html: HEADLIGHT.introHtml }}
              />
            </Reveal>

            <Reveal delay={4}>
              <ul className="mt-8 flex flex-col gap-x-8 gap-y-2.5 sm:flex-row sm:flex-wrap">
                {HEADLIGHT.hero.ticks.map((t) => (
                  <li
                    key={t}
                    className="flex items-center gap-2.5 text-[14px] leading-[22px] font-semibold text-white"
                  >
                    <Icon
                      name="check"
                      size={17}
                      strokeWidth={2.4}
                      className="shrink-0 text-gold"
                    />
                    {t}
                  </li>
                ))}
              </ul>
            </Reveal>
          </div>

          {/* Price card — the ask, kept whole. */}
          <Reveal delay={5} className="lg:col-span-5 lg:justify-self-end">
            <div className="surface w-full max-w-[420px] p-7 backdrop-blur-sm lg:p-8">
              <p className="font-[family-name:var(--font-ui)] text-[11px] tracking-[0.18em] text-white/55 uppercase">
                Headlight restoration
              </p>
              <p className="mt-3 flex items-baseline gap-2">
                <span className="font-[family-name:var(--font-display)] text-[46px] leading-none text-gold lg:text-[54px]">
                  {HEADLIGHT.price.from}
                </span>
                <span className="text-[14px] font-normal text-white/60">from</span>
              </p>
              <p className="mt-3 flex items-center gap-2 text-[14px] font-normal text-white/70">
                <Icon name="pin" size={16} className="shrink-0 text-gold" />
                {HEADLIGHT.price.note}
              </p>

              <span aria-hidden className="my-6 block h-px w-full bg-white/10" />

              <a href={HEADLIGHT.book} className="btn btn-gold w-full rounded-full text-[15px]">
                Book Now
                <Icon name="arrow" size={18} className="ml-2.5" />
              </a>
              <a
                href={`tel:${HEADLIGHT.phone}`}
                className="btn btn-outline mt-3 w-full rounded-full"
              >
                <Icon name="phone" size={16} className="mr-2.5" />
                {HEADLIGHT.phone}
              </a>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/* ── Proof strip ──────────────────────────────────────────────────────────
   Four facts on one line, sitting in the wedge the hero's diagonal opens up. */

function Proof() {
  return (
    <section className="w-full border-b border-white/[0.07] py-8 lg:py-10">
      <ul className="shell grid grid-cols-2 gap-x-6 gap-y-7 lg:grid-cols-4">
        {HEADLIGHT.proof.map((p, i) => (
          <Reveal as="li" key={p.value} delay={i} className="flex items-start gap-3.5">
            <Icon name={p.icon as IconName} size={22} className="mt-[3px] shrink-0 text-gold" />
            <div>
              <p className="font-[family-name:var(--font-sub)] text-[17px] leading-tight text-white uppercase">
                {p.value}
              </p>
              <p className="mt-1 text-[13.5px] leading-[19px] font-normal text-white/55">
                {p.label}
              </p>
            </div>
          </Reveal>
        ))}
      </ul>
    </section>
  );
}

/* ── Signs ────────────────────────────────────────────────────────────────
   Four symptoms, four tiles. As a bulleted list in a half-width column they
   read as small print; as cards they read as a diagnostic. */

function Signs() {
  return (
    <section className="w-full py-16 lg:py-[104px]">
      <div className="shell">
        <SectionHead
          title={HEADLIGHT.signs.heading}
          lede="Headlights fade slowly, so the change is easy to miss. These are the four things London drivers notice first."
        />

        <ul className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {HEADLIGHT.signs.items.map((s, i) => (
            <Reveal
              as="li"
              key={s.title}
              delay={i}
              className="surface group relative overflow-hidden p-7"
            >
              <span
                aria-hidden
                className="font-[family-name:var(--font-display)] text-[30px] leading-none text-white/[0.09] transition-colors duration-500 group-hover:text-gold/30"
              >
                {String(i + 1).padStart(2, "0")}
              </span>
              <h3 className="mt-4 text-[18px] leading-snug font-semibold text-white">
                {s.title}
              </h3>
              <p className="mt-3 text-[15px] leading-[24px] font-normal text-body">{s.body}</p>
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

/* ── Why it matters ───────────────────────────────────────────────────────
   The page's one gold band. Ink tiles on gold, the same construction the
   homepage's "Why Choose" row uses.

   No `.livery` on the band: its stripes are gold on gold, and its
   background-image wins over the wash's gradient, flattening the band. */

function Matters() {
  return (
    <section className="bg-gold-wash w-full py-16 lg:py-[104px]">
      <div className="shell">
        <SectionHead
          title={HEADLIGHT.matters.heading}
          lede="Restoration is not cosmetic work. It is the cheapest way to get a legal, bright beam back."
          tone="gold"
        />

        <ul className="mt-12 grid gap-5 lg:grid-cols-3">
          {HEADLIGHT.matters.items.map((m, i) => (
            <Reveal as="li" key={m.title} delay={i} className="surface-on-gold p-8">
              <span className="flex h-[52px] w-[52px] items-center justify-center rounded-full bg-gold/12 ring-1 ring-gold/35">
                <Icon name={m.icon as IconName} size={24} className="text-gold" />
              </span>
              <h3 className="mt-6 text-[20px] leading-snug font-semibold text-white">
                {m.title}
              </h3>
              <p className="mt-3 text-[15.5px] leading-[25px] font-normal text-body">{m.body}</p>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}

/* ── Process ──────────────────────────────────────────────────────────────
   Five stages on a rail. The photograph sticks alongside on desktop so the
   craft stays on screen for the whole read. */

function Process() {
  return (
    <section className="w-full py-16 lg:py-[104px]">
      <div className="shell grid gap-14 lg:grid-cols-12 lg:gap-16">
        <Reveal className="lg:col-span-5">
          <div className="lg:sticky lg:top-[130px]">
            <div className="relative overflow-hidden rounded-[14px] ring-1 ring-white/[0.08]">
              <Image
                src={HEADLIGHT.process.image.src}
                alt={HEADLIGHT.process.image.alt}
                width={HEADLIGHT.process.image.w}
                height={HEADLIGHT.process.image.h}
                sizes="(min-width: 1024px) 520px, 100vw"
                className="h-auto w-full"
              />
              <div
                aria-hidden
                className="absolute inset-x-0 bottom-0 h-1/3 bg-[linear-gradient(to_top,rgba(0,0,0,0.75),transparent)]"
              />
            </div>
            <p className="mt-5 flex items-center gap-2.5 text-[13.5px] font-normal text-white/55">
              <Icon name="clock" size={16} className="shrink-0 text-gold" />
              Carried out at your home or workplace, anywhere we cover.
            </p>
          </div>
        </Reveal>

        <div className="lg:col-span-7">
          <SectionHead
            title={HEADLIGHT.process.heading}
            lede={HEADLIGHT.process.lede}
          />

          <ol className="mt-11 relative">
            {/* The rail. Drawn behind the markers, stopped short of the last one. */}
            <span
              aria-hidden
              className="absolute top-2 bottom-10 left-[23px] w-px bg-[linear-gradient(to_bottom,rgba(193,146,49,0.55),rgba(255,255,255,0.06))]"
            />
            {HEADLIGHT.process.steps.map((step, i) => (
              <Reveal as="li" key={step.title} delay={i} className="relative flex gap-6 pb-10 last:pb-0">
                <span className="relative z-10 flex h-[47px] w-[47px] shrink-0 items-center justify-center rounded-full bg-ink-panel font-[family-name:var(--font-sub)] text-[16px] text-gold ring-1 ring-gold/40">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div className="pt-2">
                  <h3 className="text-[18px] leading-snug font-semibold text-white lg:text-[19px]">
                    {step.title}
                  </h3>
                  <p className="mt-2 max-w-[58ch] text-[15.5px] leading-[25px] font-normal text-body">
                    {step.body}
                  </p>
                </div>
              </Reveal>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}

/* ── Why us ───────────────────────────────────────────────────────────────
   Photograph left, four reasons right — each a tick and a bold lead-in rather
   than a run-on sentence. */

function WhyUs() {
  return (
    <section className="w-full py-16 lg:py-[104px]">
      <div className="shell grid items-center gap-12 lg:grid-cols-12 lg:gap-16">
        <Reveal className="lg:col-span-5">
          <div className="relative overflow-hidden rounded-[14px] ring-1 ring-white/[0.08]">
            <Image
              src={HEADLIGHT.why.image.src}
              alt={HEADLIGHT.why.image.alt}
              width={HEADLIGHT.why.image.w}
              height={HEADLIGHT.why.image.h}
              sizes="(min-width: 1024px) 520px, 100vw"
              className="h-auto w-full"
            />
          </div>
        </Reveal>

        <div className="lg:col-span-7">
          <SectionHead title={HEADLIGHT.why.heading} lede={HEADLIGHT.why.lede} />

          <ul className="mt-10 grid gap-x-8 gap-y-7 sm:grid-cols-2">
            {HEADLIGHT.why.items.map((w, i) => (
              <Reveal as="li" key={w.title} delay={i}>
                <p className="flex items-center gap-2.5 text-[16px] leading-snug font-semibold text-white">
                  <Icon name="check" size={17} strokeWidth={2.4} className="shrink-0 text-gold" />
                  {w.title}
                </p>
                <p className="mt-2 pl-[27px] text-[15px] leading-[24px] font-normal text-body">
                  {w.body}
                </p>
              </Reveal>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

/* ── Coverage ─────────────────────────────────────────────────────────────
   The area list as chips. Six place names inside a paragraph is a list
   pretending to be prose. */

function Areas() {
  return (
    <section className="w-full border-t border-white/[0.07] py-16 lg:py-[104px]">
      <div className="shell grid gap-10 lg:grid-cols-12 lg:gap-16">
        <div className="lg:col-span-5">
          <SectionHead title={HEADLIGHT.areas.heading} />
        </div>
        <div className="lg:col-span-7">
          <Reveal>
            <p className="max-w-[70ch] text-[16px] leading-[27px] font-normal text-body">
              {HEADLIGHT.areas.body}
            </p>
          </Reveal>
          <Reveal delay={1}>
            <ul className="mt-7 flex flex-wrap gap-2.5">
              {HEADLIGHT.areas.chips.map((c) => (
                <li
                  key={c}
                  className="flex items-center gap-2 rounded-full px-4 py-2 text-[13.5px] font-normal text-white/80 ring-1 ring-white/12"
                >
                  <Icon name="pin" size={14} className="shrink-0 text-gold" />
                  {c}
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/* ── Closing ask ──────────────────────────────────────────────────────────
   The source page's booking section, given the diagonal edge and the livery
   texture so the page closes on a beat rather than trailing off. */

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
        <SectionHead title={HEADLIGHT.cta.heading} align="center" />
        <Reveal>
          <p className="measure mt-6 text-[16px] leading-[27px] font-normal text-body">
            {HEADLIGHT.cta.body}
          </p>
        </Reveal>
        <Reveal delay={1}>
          <p
            className="measure mt-4 text-[16px] leading-[27px] font-normal text-white/75 [&_strong]:font-semibold [&_strong]:text-white"
            dangerouslySetInnerHTML={{ __html: HEADLIGHT.cta.closer }}
          />
        </Reveal>
        <Reveal delay={2} className="w-full sm:w-auto">
          <div className="mt-10 flex flex-col items-stretch gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-center">
            <a href={HEADLIGHT.book} className="btn btn-gold w-full rounded-full text-[15px] sm:w-auto">
              Book Now
              <Icon name="arrow" size={18} className="ml-2.5" />
            </a>
            <Link href="/contact-us/" className="btn btn-outline w-full rounded-full sm:w-auto">
              Contact Us
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
