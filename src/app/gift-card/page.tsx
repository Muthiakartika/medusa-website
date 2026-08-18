import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import JsonLd from "@/components/JsonLd";
import PageHero from "@/components/PageHero";
import Reveal from "@/components/Reveal";
import SectionHead from "@/components/SectionHead";
import { getPage, heroImageFor } from "@/lib/blocks";
import { pageSchema } from "@/lib/schema";

/**
 * Gift cards, laid out rather than rendered — and with the shop put back.
 *
 * The source page is a title, three untitled paragraphs in three columns, two
 * pictures of the card, a heading reading "Customise Your Gift Card", and then
 * the thing the page exists for: an `<iframe>` holding the fieldd purchase
 * widget. The extractor has no branch for a bare iframe outside a figure, so
 * it kept the heading and dropped the shop — leaving a page that describes a
 * gift card and gives you no way to buy one.
 *
 * `PURCHASE` restores it from `.cache/html/gift-card.html`. The three
 * paragraphs are the source's, verbatim; only the labels above them are new,
 * and they name what each paragraph already says.
 */

const SLUG = "gift-card";

export function generateMetadata(): Metadata {
  const page = getPage(SLUG);
  if (!page) return {};
  return {
    title: page.title,
    description: page.description,
    alternates: { canonical: `/${SLUG}` },
    openGraph: {
      title: page.title,
      description: page.description,
      url: `/${SLUG}`,
      images: page.ogImage ? [{ url: page.ogImage }] : undefined,
    },
  };
}

/** The purchase widget the source page embeds. */
const PURCHASE = "https://medusaautodetailing.fieldd.co/gift-cards/purchase";

/** The source's three columns, verbatim and untitled — as it wrote them. */
const COLUMNS = [
  "Your gift card will be sent via email or post immediately or on a scheduled date.",
  "The gift card will be sent to the recipient with a unique code that they can use. They can select a date to book and we will come on that date.",
  "Use it across any of our services: Mobile Car Detailing | Paint Protection | & Much More",
];

const CARDS = [
  {
    src: "/assets/2021/12/templett_106394482.webp",
    alt: "Medusa Auto Detailing gift card, first design",
  },
  {
    src: "/assets/2021/12/templett_10639448.webp",
    alt: "Medusa Auto Detailing gift card, second design",
  },
];

export default function GiftCardPage() {
  const page = getPage(SLUG);
  if (!page) notFound();

  return (
    <>
      <JsonLd data={pageSchema(page)} />
      <Header />
      <main className="flex-1">
        <PageHero title={page.h1} image={heroImageFor(page)} />

        <section className="w-full border-b border-white/[0.07] py-14 lg:py-[88px]">
          <ul className="shell grid gap-5 lg:grid-cols-3">
            {COLUMNS.map((body, i) => (
              <Reveal as="li" key={i} delay={i} className="surface h-full p-7">
                <span aria-hidden className="speed-rule speed-rule-sm" />
                <p className="mt-5 text-[15.5px] leading-[25px] font-normal text-body">
                  {body}
                </p>
              </Reveal>
            ))}
          </ul>
        </section>

        <section className="w-full py-16 lg:py-[104px]">
          <div className="shell">
            <ul className="grid gap-5 lg:grid-cols-2 lg:gap-6">
              {CARDS.map((card, i) => (
                <Reveal as="li" key={card.src} delay={i}>
                  <div className="overflow-hidden rounded-[14px] ring-1 ring-white/[0.08]">
                    <Image
                      src={card.src}
                      alt={card.alt}
                      width={2400}
                      height={1200}
                      sizes="(min-width: 1024px) 50vw, 100vw"
                      className="h-auto w-full"
                    />
                  </div>
                </Reveal>
              ))}
            </ul>
          </div>
        </section>

        {/* The shop. The source's own heading, over the widget it embedded. */}
        <section
          id="buy"
          className="cut-top relative w-full overflow-hidden bg-ink-panel pt-[calc(var(--cut)+3.5rem)] pb-16 lg:pb-[104px]"
        >
          <div
            aria-hidden
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(80% 100% at 50% 0%, rgba(193,146,49,0.16) 0%, transparent 62%)",
            }}
          />
          <div className="shell relative">
            <SectionHead title="Customise Your Gift Card" align="center" />

            <Reveal delay={2}>
              <div className="mx-auto mt-11 max-w-[900px] overflow-hidden rounded-[14px] bg-white ring-1 ring-white/[0.08]">
                <iframe
                  src={PURCHASE}
                  title="Buy a Medusa Auto Detailing gift card"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="h-[820px] w-full border-0"
                />
              </div>
            </Reveal>

          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
