import Image from "next/image";
import FaqAccordion from "@/components/FaqAccordion";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import Icon from "@/components/Icon";
import JsonLd from "@/components/JsonLd";
import PageHero from "@/components/PageHero";
import PriceCard from "@/components/PriceCard";
import Reveal from "@/components/Reveal";
import SectionHead from "@/components/SectionHead";
import { FeatureCards, LinkChips } from "@/components/blocks-groups";
import type { Page } from "@/lib/blocks";
import {
  type HubSpec,
  hubAreas,
  hubCards,
  hubIntro,
  hubQuestions,
  hubReasons,
} from "@/lib/hub";
import { pageSchema } from "@/lib/schema";
import { BOOK_URL } from "@/lib/site";

/**
 * A menu-group hub, laid out.
 *
 * Five bands, in the order the client asked for on 2026-09-16: the header with
 * the group's entry price beside it, the case for the company *before* the
 * services and their prices, the services, the questions, and coverage as the
 * closing. `/car-detailing` is the reference for all of it — same header, same
 * gold-on-ink alternation, same sections.
 *
 * The homepage's own `WhyChoose` used to close `/repairs` and does not any
 * more: "ss 4 bisa dihapus bagian itu agar tidak mengulang yang ada di home".
 * The reasons here are the ones the service pages carry instead.
 *
 * **Almost nothing on a hub is written.** `lib/hub.ts` reads every name, blurb,
 * price, reason, question, region and photograph back out of the pages the
 * group links to. Three strings per hub are not from the source, because no
 * source supplies them: the `<title>` and meta description, and the two section
 * heads "Our … Services" and "… Near You" — both the site's own pattern over
 * the client's own name for the group.
 *
 * `lib/hubs.ts` holds the specs. Both routes are four lines over this.
 */

/** Enough of a `Page` for `pageSchema`; a hub has no entry in `pages.json`. */
export function hubMetaPage(spec: HubSpec): Page {
  return {
    slug: spec.slug,
    title: `${spec.title} | Medusa Auto Detailing`,
    description: hubCards(spec)
      .map((c) => c.name)
      .join(", "),
    h1: spec.title,
    breadcrumb: [{ name: "Home", href: "/" }, { name: spec.title }],
    sections: [],
  };
}

export default function HubPage({ spec }: { spec: HubSpec }) {
  const TITLE = spec.title;
  const cards = hubCards(spec);
  const questions = hubQuestions(spec);
  const reasons = hubReasons(spec);
  const areas = hubAreas(spec);
  const introHtml = hubIntro(spec);

  /* The cheapest of the four, for the header card. Two of them quote nothing
     at all, so this can legitimately be undefined and the header falls back to
     the wider, card-less layout `PageHero` uses everywhere else. */
  const entryPrice = cards
    .map((c) => c.priceFrom)
    .filter((p): p is string => Boolean(p))
    .sort((a, b) => Number(a.slice(1)) - Number(b.slice(1)))[0];

  return (
    <>
      <JsonLd data={pageSchema(hubMetaPage(spec))} />
      <Header />
      <main className="flex-1">
        {/*
          The group's own introduction, then its services as chips — the
          client's "links that go to its childs", carrying no words but the
          names of the pages they open. The paragraphs are read out of the
          child pages too; see `hubIntro`.
        */}
        <PageHero
          title={TITLE}
          image={spec.heroImage}
          introHtml={introHtml}
          /*
            The same card the forty-one service pages carry, so this hub reads
            as their equal rather than as a lesser page. `from` is the cheapest
            price in the group — engine bay steam cleaning's £60 — which is the
            same thing /car-detailing's "from £300" is: the cheapest of the
            things below it. The two services that quote nothing say so on
            their own cards.
          */
          aside={entryPrice && <PriceCard label={TITLE} from={entryPrice} />}
        >
          <LinkChips chips={cards.map((c) => ({ href: c.href, label: c.name }))} />
        </PageHero>

        {/*
          The case for the company, before the services and their prices —
          the client's order. Laid out the way the service pages lay the same
          section out: the photograph in a column beside the reasons rather
          than a band of its own. The words are read out of one of the four
          pages; see `repairReasons`.
        */}
        <section className="bg-gold-wash w-full py-16 lg:py-[104px]">
          <div className="shell grid items-center gap-10 lg:grid-cols-12 lg:gap-14">
            <Reveal className="lg:col-span-5">
              <Image
                src={spec.whyImage}
                alt=""
                width={800}
                height={800}
                sizes="(min-width: 1024px) 520px, 100vw"
                className="h-auto w-full rounded-[14px]"
              />
            </Reveal>
            <div className="lg:col-span-7">
              <SectionHead title={reasons.heading} tone="gold" />
              <FeatureCards items={reasons.items} onGold cols="sm:grid-cols-2" />
            </div>
          </div>
        </section>

        <section className="w-full py-16 lg:py-[104px]">
          <div className="shell">
            <SectionHead title={`Our ${TITLE} Services`} className="mb-12" />
            {/*
              Four across only from `xl`. At `lg` the shell is 834px wide, so
              four columns are 193px each — narrower than the add-on cards'
              220px floor, and "Engine Bay Steam Cleaning" came out four lines
              deep. Two-up until there is room for the full row.
            */}
            <ul className={`grid gap-5 ${spec.cardCols}`}>
              {cards.map((card, i) => (
                <Reveal
                  as="li"
                  key={card.slug}
                  delay={i}
                  className="surface flex flex-col overflow-hidden"
                >
                  {card.image && (
                    <div className="relative aspect-3/2 w-full">
                      <Image
                        src={card.image}
                        alt=""
                        fill
                        sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                        className="object-cover"
                      />
                    </div>
                  )}

                  <div className="flex flex-1 flex-col p-6">
                    {/* Title on its own line rather than beside the badge:
                        "Engine Bay Steam Cleaning" is three words too long to
                        share a 300px card with a price. */}
                    <h2 className="text-[19px] leading-[1.12] text-white lg:text-[21px]">
                      {card.name}
                    </h2>

                    {/* The client's rule: a page that quotes a price shows it
                        here, a page that does not gets the quote button at the
                        foot instead. Same badge the price ladders use. */}
                    {card.priceFrom && (
                      <p className="mt-3">
                        <span className="inline-flex rounded-full bg-gold px-3 py-1 font-[family-name:var(--font-ui)] text-[13px] font-semibold text-ink">
                          From {card.priceFrom}
                        </span>
                      </p>
                    )}

                    <p
                      className="mt-3.5 text-[14.5px] leading-[23px] font-normal text-white/80 [&_a]:text-gold [&_a:hover]:underline [&_strong]:text-white"
                      dangerouslySetInnerHTML={{ __html: card.blurbHtml }}
                    />

                    {/* Same shape as every other card on the site: one primary
                        action, and the link to the page named after the page
                        it opens rather than reading "Read More". */}
                    <div className="mt-auto flex flex-wrap gap-2.5 pt-7">
                      <a
                        href={card.priceFrom ? BOOK_URL : "/contact-us/"}
                        className="btn btn-gold w-full rounded-full sm:w-auto"
                        {...(card.priceFrom
                          ? { target: "_blank", rel: "noopener noreferrer" }
                          : {})}
                      >
                        {card.priceFrom ? "Book Now" : "Get a Free Quote"}
                        <Icon name="arrow" size={18} className="ml-2.5" />
                      </a>
                      <a href={card.href} className="btn btn-outline w-full rounded-full sm:w-auto">
                        {card.name}
                        <Icon name="arrow" size={18} className="ml-2.5" />
                      </a>
                    </div>
                  </div>
                </Reveal>
              ))}
            </ul>
          </div>
        </section>

        <section className="bg-gold-wash w-full py-16 lg:py-[104px]">
          <div className="shell grid gap-8 lg:grid-cols-12 lg:gap-14">
            <div className="lg:col-span-5">
              <SectionHead title="FAQs" tone="gold" />
            </div>
            <div className="lg:col-span-7">
              <FaqAccordion
                onGold
                items={questions.map((q) => ({
                  q: q.q,
                  /* The source's own answer, then the way to the rest of it.
                     These questions are lifted off four different pages, and
                     without the link the reader has no way of telling which
                     one an answer came from. The link carries the page's name
                     and nothing else — the same rule the cards follow. */
                  a: [...q.a, `<a href="${q.href}">${q.name}</a>`],
                }))}
              />
            </div>
          </div>
        </section>

        {/*
          Coverage, closing the page the way the service pages close theirs.

          Plain chips, not links: the four pages name regions where the wash
          and valeting pages name districts, and there is no page the source
          itself points a region at. `LinkChips`'s own styling, minus the
          anchor.
        */}
        <section className="w-full py-16 lg:py-[104px]">
          <div className="shell">
            <SectionHead title={`${TITLE} Near You`} />
            <ul className="mt-8 flex flex-wrap gap-2">
              {areas.map((area) => (
                <li key={area}>
                  <span className="inline-flex rounded-full bg-white/[0.05] px-4 py-2 text-[14px] font-normal text-white/80 ring-1 ring-white/10">
                    {area}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
