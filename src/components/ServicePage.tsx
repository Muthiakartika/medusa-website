import { asLinkChips, LinkChips } from "@/components/blocks-groups";
import { Sections } from "@/components/Blocks";
import FaqAccordion from "@/components/FaqAccordion";
import Image from "next/image";
import Icon from "@/components/Icon";
import Reveal from "@/components/Reveal";
import SectionHead from "@/components/SectionHead";
import type { Page } from "@/lib/blocks";
import { BOOK_URL } from "@/lib/site";
import { parseServicePage } from "@/lib/service-frame";

/**
 * The frame the forty-one service pages share.
 *
 * A header with the page's own entry price attached to it, the coverage list
 * as chips and the questions as an accordion — but the middle of the page is
 * the page's own content, passed straight through to the ordinary block
 * renderer. `lib/service-frame.ts` decides what the frame takes and what the
 * body keeps.
 *
 * The frame writes no copy of its own. Every heading, price and sentence on
 * these pages comes from `pages.json`; the only words it contributes are the
 * button label "Book Now", which is the label these pages already use.
 *
 * Written once rather than forty-one times: these pages differ in their copy
 * and their prices, not in their shape, and separate copies of this file would
 * drift apart the first time one of them was touched.
 */
export default function ServicePage({ page }: { page: Page }) {
  const model = parseServicePage(page);
  const chips = model.areas ? asLinkChips(model.areas.html) : null;

  return (
    <main className="flex-1">
      <Hero page={page} model={model} />

      {model.body.length > 0 && (
        <Sections
          sections={model.body}
          slug={page.slug}
          pageH1={page.h1}
          // The hero above has already set this page's one <h1>.
          h1Taken
          opensPage={false}
          /*
            No gold bands. The only row that qualified was the add-ons one,
            and it now carries the gold price table inside it — the panel
            treatment marks it instead.
          */
          bands="none"
          panel={model.priced}
        />
      )}

      {model.areas && (
        <section className="w-full border-t border-white/[0.07] py-12 lg:py-[72px]">
          <div className="shell grid gap-6 lg:grid-cols-12 lg:gap-14">
            <div className="lg:col-span-4">
              <Reveal>
                <span aria-hidden className="speed-rule speed-rule-sm" />
              </Reveal>
              {/*
                The source heading verbatim, but not at section-head size.
                These run to sixty characters of capitals — "AREAS WE PROVIDE
                CONVERTIBLE SOFT TOP CLEAN & REPROOFING SERVICES IN LONDON:" —
                and at the 50px display size that is three lines of shouting
                over a row of small chips. The coverage list is a footnote to
                the page, so its heading is sized like one.
              */}
              <Reveal delay={1}>
                <h2 className="mt-5 font-[family-name:var(--font-sub)] text-[20px] leading-tight text-white uppercase lg:text-[23px]">
                  {model.areas.heading}
                </h2>
              </Reveal>
            </div>
            <div className="lg:col-span-8">
              {chips ? (
                <Reveal>
                  <LinkChips chips={chips} />
                </Reveal>
              ) : (
                <Reveal>
                  <p
                    className="text-[15.5px] leading-[26px] font-normal text-body [&_a]:text-gold [&_a:hover]:underline"
                    dangerouslySetInnerHTML={{ __html: model.areas.html }}
                  />
                </Reveal>
              )}
            </div>
          </div>
        </section>
      )}

      {model.faq.length > 0 && (
        <section className="w-full py-16 lg:py-[104px]">
          <div className="shell grid gap-8 lg:grid-cols-12 lg:gap-14">
            <div className="lg:col-span-5">
              <SectionHead title={model.faqHeading ?? "Frequently Asked Questions"} />
            </div>
            <div className="lg:col-span-7">
              <FaqAccordion items={model.faq} />
            </div>
          </div>
        </section>
      )}

    </main>
  );
}

/* ── Hero ─────────────────────────────────────────────────────────────────
   The source opens these pages on a bare <h1> against flat black with the
   price four screens down. Here the title, the standfirst and the opening
   paragraph sit beside a card carrying the entry price and both ways to
   book — the two things a visitor arrives wanting. */

function Hero({ page, model }: { page: Page; model: ReturnType<typeof parseServicePage> }) {
  return (
    <section className="cut-bottom relative flex w-full items-center overflow-hidden bg-ink-panel pt-[150px] pb-[calc(var(--cut)+3.5rem)] lg:min-h-[700px] lg:pt-[200px]">
      {model.heroImage ? (
        <>
          <Image
            src={model.heroImage}
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover object-center"
          />
          {/* The same left-to-right scrim every header on the site carries. */}
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
        <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-12">
          <div className={model.priceFrom ? "lg:col-span-7" : "lg:col-span-9"}>
            <Reveal>
              <span className="hero-rule speed-rule" aria-hidden />
            </Reveal>

            <Reveal delay={1}>
              <h1 className="mt-7 max-w-[18ch] text-[clamp(30px,4.7vw,52px)] leading-[1.02] text-white">
                {page.h1}
              </h1>
            </Reveal>

            {model.lede && (
              <Reveal delay={2}>
                <p className="mt-6 max-w-[46ch] font-[family-name:var(--font-sub)] text-[17px] leading-[1.35] text-gold uppercase lg:text-[19px]">
                  {model.lede}
                </p>
              </Reveal>
            )}

            {/* Every opening paragraph, not the first two: on `/detailing`
                and `/deep-clean-full-valet` the third one is where the copy
                actually explains the service. */}
            {model.introHtml.map((html, i) => (
              <Reveal key={i} delay={3 + i}>
                <p
                  className="mt-5 max-w-[62ch] text-[16px] leading-[27px] font-normal text-white/80 [&_a]:text-gold [&_strong]:font-semibold [&_strong]:text-white lg:text-[16.5px]"
                  dangerouslySetInnerHTML={{ __html: html }}
                />
              </Reveal>
            ))}

          </div>

          {model.priceFrom && (
            <Reveal delay={5} className="lg:col-span-5 lg:justify-self-end">
              <div className="surface w-full max-w-[420px] p-7 backdrop-blur-sm lg:p-8">
                <p className="font-[family-name:var(--font-ui)] text-[11px] tracking-[0.18em] text-white/55 uppercase">
                  {short(page.h1)}
                </p>
                <p className="mt-3 flex items-baseline gap-2">
                  <span className="text-[14px] font-normal text-white/60">from</span>
                  <span className="font-[family-name:var(--font-display)] text-[44px] leading-none text-gold lg:text-[52px]">
                    {model.priceFrom}
                  </span>
                </p>
                <span aria-hidden className="my-6 block h-px w-full bg-white/10" />

                {/* "Book Now" is the button these pages already carry under
                    their price table; nothing else is added to the card. */}
                <a href={BOOK_URL} className="btn btn-gold w-full rounded-full text-[15px]">
                  Book Now
                  <Icon name="arrow" size={18} className="ml-2.5" />
                </a>
              </div>
            </Reveal>
          )}
        </div>
      </div>
    </section>
  );
}

/* ── copy helpers ─────────────────────────────────────────────────────── */

/**
 * The page title as a service name that can sit inside a sentence.
 *
 * Drops the trailing "in London" — every sentence the frame writes already
 * says where we work — and the leading "The", which only reads as English at
 * the start of a title. Four of the nine titles are set in capitals in the
 * source ("MOBILE MINI VALET IN LONDON"), so those are recased; the rest keep
 * the casing they were written with, because "Zeus – Full Car Valet" and
 * "WHEELUV" are names, not shouting.
 */
function short(h1: string) {
  let t = h1.replace(/\s+in\s+London\s*$/i, "").trim();
  if (t === t.toUpperCase()) {
    t = t.toLowerCase().replace(/\b[a-z]/g, (c) => c.toUpperCase());
  }
  return t.replace(/^the\s+/i, "");
}
