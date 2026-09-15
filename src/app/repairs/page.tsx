import type { Metadata } from "next";
import Image from "next/image";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import Icon from "@/components/Icon";
import JsonLd from "@/components/JsonLd";
import PageHero from "@/components/PageHero";
import Reveal from "@/components/Reveal";
import type { Page } from "@/lib/blocks";
import { repairCards } from "@/lib/repairs";
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

  return (
    <>
      <JsonLd data={pageSchema(metaPage())} />
      <Header />
      <main className="flex-1">
        <PageHero title={TITLE} />

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
      </main>
      <Footer />
    </>
  );
}
