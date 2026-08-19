import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import EnquiryForm from "@/components/EnquiryForm";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import Icon from "@/components/Icon";
import JsonLd from "@/components/JsonLd";
import Reveal from "@/components/Reveal";
import SectionHead from "@/components/SectionHead";
import { getForms, getPage } from "@/lib/blocks";
import { pageSchema } from "@/lib/schema";

/**
 * Fleet and commercial, laid out rather than rendered.
 *
 * Two problems on the extracted page. The obvious one is shape: three long
 * paragraphs beside a 2,560px photograph, then a heading, then a form.
 *
 * The other one is a hole. The source lists the nine kinds of fleet it cleans
 * as a three-by-three grid of tick marks with the label beside each one, and
 * those labels live in bare `<div class="iwt-text">` elements the extractor
 * has no branch for — so `pages.json` holds nine tick images in a row and not
 * one word of what they were ticking. `FLEET` below restores them from
 * `.cache/html/commercial-valeting-and-detailing.html`, verbatim and in the
 * source's order; everything else on this page is its own copy, unchanged.
 */

const SLUG = "commercial-valeting";

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

const INTRO = [
  "Established as a number-one mobile detailer, Medusa Auto Detailing now offers mobile fleet services, acting as a one-stop solution for all commercial vehicle cleaning and detailing requirements. We are proud of our history and the excellent reputation we’ve built over the years, and are happy to provide mobile fleet washing that cover all aspects of car, light commercial, and truck detailing.",
  "We offer a variety of cleaning solutions to meet commercial organisations and their requirements, from large organisations and government departments to small business vehicles. We also pride ourselves on the personalised and professional services we provide each client via experts in our field who deliver unmatched customer service.",
  "At <a href=\"/\">Medusa Auto Detailing</a>, we offer competitive fleet rates —saving our clients time and money —while continuing to guarantee the highest quality of service. Our field service vehicles also come fully equipped to better serve where you are located, reducing vehicle downtime and providing further convenience to each valued client. We offer the industry’s best-detailing services in the London, delivered with the most sophisticated technologies, to keep your fleet vehicles mobile, profitable and looking professional.",
];

const HERO_IMAGE = {
  src: "/assets/2020/10/shutterstock_4932052572-scaled.webp",
  alt: "A commercial fleet being cleaned by Medusa Auto Detailing",
  w: 2560,
  h: 1709,
};

const CONTRACT = {
  heading: "Contract Valeting & Detailing for car dealerships, body shops etc.",
  body: "Based on your needs, we can cater to any type of vehicle valeting in terms of contract, duration, and workload. We can work at a location of your convenience.",
  lead: "A to Z Provides Mobile Fleet Detailing Services For:",
  image: "/assets/2020/10/pexels-jae-park-49843141.webp",
};

/** The nine labels the extractor lost, in the source's own order. */
const FLEET = [
  "Heavy Machinery",
  "Trailers",
  "Utility Vehicles",
  "Trucks",
  "Dealership Cars",
  "Shipping containers",
  "Government Vehicles",
  "Buses",
  "and More!",
];

export default function CommercialPage() {
  const page = getPage(SLUG);
  if (!page) notFound();

  const form = getForms(SLUG)[0];

  return (
    <>
      <JsonLd data={pageSchema(page)} />
      <Header />
      <main className="flex-1">
        <Hero page={page} />
        <Brief />
        <Contract />

        <section
          id="fleet-enquiry"
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
          <div className="shell relative grid gap-12 lg:grid-cols-12 lg:gap-16">
            <div className="lg:col-span-5">
              <SectionHead title="Pricing or Questions for Mobile Fleet Detailing & Washing." />
            </div>
            <div className="lg:col-span-7">
              {form && (
                <EnquiryForm
                  slug={SLUG}
                  index={0}
                  submitLabel={form.submitLabel}
                  fields={form.fields}
                />
              )}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

/* ── Hero ─────────────────────────────────────────────────────────────────
   The page's own fleet photograph, framed beside the copy rather than printed
   at 2,560px underneath it. */

function Hero({ page }: { page: NonNullable<ReturnType<typeof getPage>> }) {
  return (
    <section className="cut-bottom relative flex w-full items-center overflow-hidden bg-ink-panel pt-[150px] pb-[calc(var(--cut)+3.5rem)] lg:pt-[200px]">
      <div aria-hidden className="livery absolute inset-0 opacity-70" />
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(70% 62% at 82% 34%, rgba(237,179,38,0.18) 0%, rgba(193,146,49,0.05) 46%, transparent 76%)",
        }}
      />
      <div
        aria-hidden
        className="absolute inset-x-0 bottom-0 h-2/5 bg-[linear-gradient(to_top,rgba(0,0,0,0.85),transparent)]"
      />

      <div className="shell relative z-10 grid items-center gap-12 lg:grid-cols-12 lg:gap-14">
        <div className="lg:col-span-7">
          <Reveal>
            <span className="hero-rule speed-rule" aria-hidden />
          </Reveal>
          <Reveal delay={1}>
            <h1 className="mt-7 max-w-[16ch] text-[clamp(30px,4.7vw,52px)] leading-[1.02] text-white">
              {page.h1}
            </h1>
          </Reveal>

          {/* Only the opening paragraph here. The other two are three and
              four sentences each, and all three stacked made a header you had
              to scroll past — they carry on in `Brief` under the proof row. */}
          <Reveal delay={3}>
            <p
              className="mt-5 max-w-[64ch] text-[16px] leading-[27px] font-normal text-white/80 [&_a]:text-gold [&_a:hover]:underline"
              dangerouslySetInnerHTML={{ __html: INTRO[0] }}
            />
          </Reveal>
        </div>

        <Reveal delay={4} className="lg:col-span-5">
          <div className="relative overflow-hidden rounded-[14px] ring-1 ring-white/[0.08]">
            <Image
              src={HERO_IMAGE.src}
              alt={HERO_IMAGE.alt}
              width={HERO_IMAGE.w}
              height={HERO_IMAGE.h}
              priority
              sizes="(min-width: 1024px) 520px, 100vw"
              className="h-auto w-full"
            />
            <div
              aria-hidden
              className="absolute inset-x-0 bottom-0 h-1/3 bg-[linear-gradient(to_top,rgba(0,0,0,0.6),transparent)]"
            />
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ── The rest of the opening ──────────────────────────────────────────────
   The source's second and third paragraphs, side by side rather than stacked
   under the header. The gold rule marks them as a continuation of the copy
   above rather than a new subject, which is what they are. */

function Brief() {
  return (
    <section className="w-full py-14 lg:py-[88px]">
      <div className="shell">
        <Reveal>
          <span aria-hidden className="speed-rule speed-rule-sm" />
        </Reveal>
        <div className="mt-8 grid gap-8 lg:grid-cols-2 lg:gap-14">
          {INTRO.slice(1).map((html, i) => (
            <Reveal key={i} delay={i + 1}>
              <p
                className="text-[16px] leading-[27px] font-normal text-body [&_a]:text-gold [&_a:hover]:underline"
                dangerouslySetInnerHTML={{ __html: html }}
              />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── Contract work ────────────────────────────────────────────────────────
   The nine fleet types the source ticked, with their labels back. */

function Contract() {
  return (
    <section className="relative w-full overflow-hidden py-16 lg:py-[104px]">
      <Image
        src={CONTRACT.image}
        alt=""
        fill
        sizes="100vw"
        className="object-cover object-center"
      />
      <div
        aria-hidden
        className="absolute inset-0 bg-[linear-gradient(90deg,rgba(0,0,0,0.96)_0%,rgba(43,43,43,0.92)_100%)]"
      />

      <div className="shell relative grid gap-12 lg:grid-cols-12 lg:gap-16">
        <div className="lg:col-span-5">
          <SectionHead title={CONTRACT.heading} />
          <Reveal delay={3}>
            <p className="measure mt-6 text-[16px] leading-[27px] font-normal text-body">
              {CONTRACT.body}
            </p>
          </Reveal>
        </div>

        <div className="lg:col-span-7">
          <Reveal>
            <p className="font-[family-name:var(--font-sub)] text-[17px] leading-tight text-gold uppercase lg:text-[19px]">
              {CONTRACT.lead}
            </p>
          </Reveal>
          <ul className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {FLEET.map((item, i) => (
              <Reveal
                as="li"
                key={item}
                delay={Math.min(i, 5)}
                className="surface flex items-center gap-3 px-5 py-4"
              >
                <Icon
                  name="check"
                  size={18}
                  strokeWidth={2.4}
                  className="shrink-0 text-gold"
                />
                <span className="text-[15px] leading-[22px] font-semibold text-white">
                  {item}
                </span>
              </Reveal>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
