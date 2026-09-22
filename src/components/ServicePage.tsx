import { asLinkChips, LinkChips } from "@/components/blocks-groups";
import { bandAfter, Sections } from "@/components/Blocks";
import FaqAccordion from "@/components/FaqAccordion";
import Image from "next/image";
import { LocationIndexSection } from "@/components/LocationIndex";
import PriceCard from "@/components/PriceCard";
import Reveal from "@/components/Reveal";
import SectionHead from "@/components/SectionHead";
import { ServiceCardsSection } from "@/components/ServiceCards";
import type { Page, Section } from "@/lib/blocks";
import {
  foldableAreas,
  hubLocations,
  withAreaLinks,
} from "@/lib/location-frame";
import { serviceCardsFor } from "@/lib/service-cards";
import { parseServicePage, takeAreasFromBody } from "@/lib/service-frame";

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
  const index = hubLocations(page.slug);

  /*
    "ini double, pake yg browser A-Z aja tapi judulnya pake yg areas we
    provides" — client, 2026-09-17. A page that carries both an areas row and
    an A–Z index is showing the same kind of list twice, so the index takes the
    row's heading and its links and the row itself goes.

    Only a page with an index asks for the row out of its body: on
    `/mobile-car-wash/` — the one page where this doubling happens — the whole
    source page is a single row, so its coverage list never became a section of
    its own for `model.areas` to claim.
  */
  const lifted = index ? takeAreasFromBody(model.body) : null;
  const body = lifted?.body ?? model.body;
  const areas = model.areas ?? lifted?.areas;
  const chips = areas ? asLinkChips(areas.html) : null;

  const folded =
    index && areas && chips && foldableAreas(chips)
      ? { heading: areas.heading, items: withAreaLinks(index.items, chips, page.slug) }
      : null;
  const places = folded?.items ?? index?.items ?? [];

  /*
    The services this page's menu column carries and the page itself did
    not link to — client, 2026-09-22, "the same way you did for repairs
    page". Null on the other thirty-eight service pages.
  */
  const services = serviceCardsFor(page.slug);

  /*
    `/car-detailing` wants its band in the middle — "place it here where its
    black", client, 2026-09-22, pointing at the slot the duplicate LEVEL row
    left when `overrides.ts` dropped it. So the body is rendered in two calls
    with the band between them, and the second call is told where the
    black-gold-black rhythm had got to.

    Matched on the heading the client's section follows rather than on an
    index, so a regeneration that adds a row above cannot move it. A heading
    that is no longer there throws at build rather than quietly putting the
    band back at the end.
  */
  const cut = services?.after ? splitAfter(body, services.after, page.slug) : null;

  /*
    The band takes its turn in the rhythm rather than choosing a colour —
    client, 2026-09-22, "pastikan warna bg tetap selang seling". On
    `/car-detailing` the first half ends gold so the band is ink, which is
    also where the client pointed; on `/mobile-car-wash` it ends ink, so the
    band is gold and the half below it starts ink.
  */
  const bandGold = cut ? bandAfter(cut.before) : false;

  return (
    <main className="flex-1">
      <Hero page={page} model={model} />

      {cut && (
        <>
          <Sections
            sections={cut.before}
            slug={page.slug}
            pageH1={page.h1}
            h1Taken
            opensPage={false}
            bands="alternate"
            panel={model.priced}
          />
          {services && (
            <ServiceCardsSection
              heading={services.heading}
              cards={services.cards}
              onGold={bandGold}
            />
          )}
          {/* The band took one turn of the rhythm; the half below it takes
              the other. */}
          <Sections
            sections={cut.after}
            slug={page.slug}
            pageH1={page.h1}
            h1Taken
            opensPage={false}
            bands="alternate"
            startGold={!bandGold}
            panel={model.priced}
          />
        </>
      )}

      {!cut && body.length > 0 && (
        <Sections
          sections={body}
        
          slug={page.slug}
          pageH1={page.h1}
          // The hero above has already set this page's one <h1>.
          h1Taken
          opensPage={false}
          /*
            Black, gold, black, at the client's request: every section on
            every page is now told from the one below it by its background.
            This used to be "none" — the only row that qualified under the
            content rule was the add-ons one, which already carries the gold
            price table inside it.
          */
          bands="alternate"
          panel={model.priced}
        />
      )}


      {areas && !folded && (
        <section className="w-full border-t border-white/[0.07] py-16 lg:py-[104px]">
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
                  {areas.heading}
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
                    dangerouslySetInnerHTML={{ __html: areas.html }}
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

      {/*
        The services in this page's menu column that the page did not link to
        — client, 2026-09-22, "the same way you did for repairs page".

        Last of the page's own bands, immediately before the closing one.
        A hub puts its card grid above its questions, and two of these three
        pages cannot: their FAQ row is part of the source body, so "above the
        questions" would mean cutting the body in two.

        `/car-detailing` asked for exactly that on 2026-09-22 and gets it,
        through `after` in `lib/service-cards.ts` — which is why this is the
        `!cut` half of the same choice rather than the only position.
      */}
      {services && !cut && (
        <ServiceCardsSection heading={services.heading} cards={services.cards} />
      )}

      {/*
        The last thing on the page, above the footer, on the three hubs that
        have location pages under them — the client's "navigational widget"
        (2026-09-17). `hubLocations` is null everywhere else, so the other
        thirty-eight service pages are unchanged.
      */}
      {index && (
        <LocationIndexSection
          heading={folded?.heading}
          title={index.title}
          locations={places}
        />
      )}

    </main>
  );
}

/**
 * The body, cut in two after the run that `heading` opens.
 *
 * The cut falls immediately before the next top-level heading, which is a
 * boundary `group()` would have cut on anyway, so the two halves regroup into
 * the same bands the whole body did. Both are the source's own blocks in the
 * source's own order; nothing moves across the cut.
 *
 * It has to work at block level, not section level, because a quarter of the
 * site is one section per page: `/car-detailing` writes its eight rows as
 * eight sections and `/mobile-car-wash` writes its ten as **one**, and the
 * client asked for the band mid-page on both.
 *
 * A heading that is not there throws, because the alternative is a band that
 * silently reappears at the foot of the page and nobody notices for a month.
 */
function splitAfter(
  body: Section[],
  heading: string,
  slug: string,
): { before: Section[]; after: Section[] } {
  const want = heading.trim().toLowerCase();
  /* Columns recursed into: `/car-detailing` writes "Why Choose Medusa Auto
     Detailing?" inside the second cell of a two-column row, beside its
     photograph, so a top-level scan does not see it. */
  const carries = (blocks: Section["blocks"]): boolean =>
    blocks.some((b) =>
      b.type === "columns"
        ? b.cols.some(carries)
        : b.type === "heading" && b.text.trim().toLowerCase() === want,
    );

  const at = body.findIndex((s) => carries(s.blocks));
  if (at === -1) {
    throw new Error(`/${slug}: no body section headed "${heading}" to place the services band after`);
  }

  const section = body[at];
  const found = section.blocks.findIndex((b) => carries([b]));
  const next = section.blocks.findIndex(
    (b, i) => i > found && b.type === "heading" && b.level <= 2,
  );

  // The run ends with its section: cut on the section boundary.
  if (next === -1) {
    return { before: body.slice(0, at + 1), after: body.slice(at + 1) };
  }

  // The run is one of several in this section: cut the section itself.
  return {
    before: [
      ...body.slice(0, at),
      { ...section, blocks: section.blocks.slice(0, next) },
    ],
    after: [
      { ...section, blocks: section.blocks.slice(next) },
      ...body.slice(at + 1),
    ],
  };
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
              <PriceCard label={short(page.h1)} from={model.priceFrom} />
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
