import type { Metadata } from "next";
import Image from "next/image";
import FaqAccordion from "@/components/FaqAccordion";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import Icon from "@/components/Icon";
import JsonLd from "@/components/JsonLd";
import PageHero from "@/components/PageHero";
import Reveal from "@/components/Reveal";
import SectionHead from "@/components/SectionHead";
import { LinkChips } from "@/components/blocks-groups";
import Areas from "@/components/sections/Areas";
import WhyChoose from "@/components/sections/WhyChoose";
import type { Page } from "@/lib/blocks";
import { REPAIRS_HERO, repairCards, repairQuestions } from "@/lib/repairs";
import { pageSchema } from "@/lib/schema";
import { BOOK_URL } from "@/lib/site";

/**
 * The Repairs & Restoration hub.
 *
 * Client, 2026-09-15: "a page for /Repairs will need to be created, which will
 * have links that go to its childs… since repairs is a master page, it would
 * follow a similar layout to the other master pages."
 *
 * A master page here is a header and then one card per service, which is what
 * `/car-detailing` and `/car-valeting` are. The difference is that those two
 * have a source page behind them and this one does not, so **nothing on it is
 * written**: `lib/repairs.ts` reads every name, blurb, price and photograph
 * back out of the four pages it links to. See the note there.
 *
 * The one exception is the `<title>` and meta description, which no page can
 * do without and which no source supplies; both are built from the client's
 * own menu label and the four service names.
 */

const SLUG = "repairs";
const TITLE = "Repairs & Restoration";

/** Enough of a `Page` for `pageSchema`; this hub has no entry in `pages.json`. */
function metaPage(): Page {
  return {
    slug: SLUG,
    title: `${TITLE} | Medusa Auto Detailing`,
    description: repairCards()
      .map((c) => c.name)
      .join(", "),
    h1: TITLE,
    breadcrumb: [{ name: "Home", href: "/" }, { name: TITLE }],
    sections: [],
  };
}

export function generateMetadata(): Metadata {
  const page = metaPage();
  return {
    title: page.title,
    description: page.description,
    alternates: { canonical: `/${SLUG}/` },
    openGraph: {
      title: page.title,
      description: page.description,
      url: `/${SLUG}/`,
    },
  };
}

export default function RepairsPage() {
  const cards = repairCards();
  const questions = repairQuestions();

  return (
    <>
      <JsonLd data={pageSchema(metaPage())} />
      <Header />
      <main className="flex-1">
        {/*
          The four services as chips under the title. `PageHero` holds a 620px
          band open only when something sits under the heading, and with no
          introduction to put there — see `lib/repairs.ts` — a title alone gave
          this hub a 383px header where every other master page has a full one.
          The chips are the client's "links that go to its childs" and carry no
          words but the names of the pages they open.
        */}
        <PageHero title={TITLE} image={REPAIRS_HERO}>
          <LinkChips chips={cards.map((c) => ({ href: c.href, label: c.name }))} />
        </PageHero>

        <section className="w-full bg-ink py-16 lg:py-[104px]">
          <div className="shell">
            {/*
              Four across only from `xl`. At `lg` the shell is 834px wide, so
              four columns are 193px each — narrower than the add-on cards'
              220px floor, and "Engine Bay Steam Cleaning" came out four lines
              deep. Two-up until there is room for the full row.
            */}
            <ul className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
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

        {/*
          The rest of a master page, and none of it written here either.
          `WhyChoose` and `Areas` are the homepage's own sections reading
          `lib/site.ts`, so this hub makes the same case and quotes the same
          coverage as everywhere else rather than a second version of it.
          The bands alternate ink / gold / ink / gold from here down.
        */}
        <WhyChoose />

        <section className="w-full py-16 lg:py-[104px]">
          <div className="shell grid gap-8 lg:grid-cols-12 lg:gap-14">
            <div className="lg:col-span-5">
              <SectionHead title="FAQs" />
            </div>
            <div className="lg:col-span-7">
              <FaqAccordion
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

        <Areas />
      </main>
      <Footer />
    </>
  );
}
