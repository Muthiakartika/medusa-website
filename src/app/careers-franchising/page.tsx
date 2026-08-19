import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import EnquiryForm from "@/components/EnquiryForm";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import Icon, { type IconName } from "@/components/Icon";
import JsonLd from "@/components/JsonLd";
import Reveal from "@/components/Reveal";
import SectionHead from "@/components/SectionHead";
import { getForms, getPage } from "@/lib/blocks";
import { pageSchema } from "@/lib/schema";

/**
 * Careers & franchising, laid out rather than rendered.
 *
 * The source page is a photograph with a headline over it, three bare
 * label-and-line pairs, and then the same enquiry form twice — once under
 * "Apply for a Car Detailing Career" and again under "Franchise Opportunity",
 * on a flat gold slab, with a line between them reading "You can use the same
 * form as above."
 *
 * Every word below is that page's, in its order, including that line. What is
 * different is that the two offers are now told apart: the job application and
 * the franchise pitch each get their own band, and the three promises in the
 * header read as cards rather than as three headings with an orphan line each.
 *
 * Both forms are kept. They post to the same server action, which re-reads its
 * schema from `pages.json` by index, so the indexes here have to stay 0 and 1.
 */

const SLUG = "careers-franchising";

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

const HERO_IMAGE = "/assets/2020/11/20201116_141740.webp";

/** The source's three columns, verbatim. */
const PROMISES = [
  { icon: "spark", title: "Training", body: "No Experience Required" },
  { icon: "gauge", title: "Income", body: "Attractive pay<br> No cap on earnings" },
  { icon: "clock", title: "Flexibility", body: "Your Hours<br> Your Schedule" },
] as const;

const APPLY = {
  heading: "APPLY FOR A CAR DETAILING CAREER",
  body: [
    "Kickstart your business by becoming a qualified franchise partner.<br> All equipment provided and full training given. Work your own schedule and grow your business at your own pace.",
    "Medusa is a disruptive on-demand car and fleet washing company.<br> We travel to our clients across London &amp; Hertfordshire to wash their cars and fleets of vehicles.<br> ​<br> With over 300 daily website visits and 100’s of bookings a week we are looking for motivated individuals looking to grow a proven business and represent the future leading brand in mobile car valeting.",
    "To find out more please submit your details using the enquiry form.",
  ],
};

const FRANCHISE = {
  heading: "Franchise Opportunity",
  body: [
    "​<br> Car Shower is a disruptive on-demand car and fleet washing company.<br> We travel to our clients across London &amp; Hertfordshire to wash their cars and fleets of vehicles.<br> ​<br> With over 500 daily website visits and 100’s of bookings a week we are looking for motivated individuals looking to grow a proven business and represent the future leading brand in mobile car washing.",
    "To find out more please submit your details and cv using the enquiry form.<br> ​<br> Should your previous experience match our requirements someone from our team will get in contact to discuss the opportunity in more detail.",
    "You can use the same form as above.",
  ],
};

const PROSE =
  "text-[16px] leading-[27px] font-normal [&_a]:text-gold [&_a:hover]:underline";

export default function CareersPage() {
  const page = getPage(SLUG);
  if (!page) notFound();

  const forms = getForms(SLUG);

  return (
    <>
      <JsonLd data={pageSchema(page)} />
      <Header />
      <main className="flex-1">
        <Hero page={page} />

        {/* Application — the job. */}
        <section className="w-full py-16 lg:py-[104px]">
          <div className="shell grid gap-12 lg:grid-cols-12 lg:gap-16">
            <div className="lg:col-span-5">
              <SectionHead title={APPLY.heading} />
              {APPLY.body.map((html, i) => (
                <Reveal key={i} delay={3 + i}>
                  <p
                    className={`measure mt-5 text-body ${PROSE}`}
                    dangerouslySetInnerHTML={{ __html: html }}
                  />
                </Reveal>
              ))}
            </div>
            <div className="lg:col-span-7">
              {forms[0] && (
                <EnquiryForm
                  slug={SLUG}
                  index={0}
                  submitLabel={forms[0].submitLabel}
                  fields={forms[0].fields}
                />
              )}
            </div>
          </div>
        </section>

        {/* Franchise — the business. The page's one gold band, as on the
            source, but with the copy in ink so it can actually be read. */}
        <section className="bg-gold-wash w-full py-16 lg:py-[104px]">
          <div className="shell grid gap-12 lg:grid-cols-12 lg:gap-16">
            <div className="lg:col-span-5">
              <SectionHead title={FRANCHISE.heading} tone="gold" />
              {FRANCHISE.body.map((html, i) => (
                <Reveal key={i} delay={3 + i}>
                  <p
                    className={`measure mt-5 text-ink/85 ${PROSE} [&_a]:text-ink [&_a]:underline`}
                    dangerouslySetInnerHTML={{ __html: html }}
                  />
                </Reveal>
              ))}
            </div>
            <div className="lg:col-span-7">
              {forms[1] && (
                <EnquiryForm
                  slug={SLUG}
                  index={1}
                  submitLabel={forms[1].submitLabel}
                  fields={forms[1].fields}
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
   The source's own photograph, under the same left-to-right scrim every hero
   on the site uses, with the three promises as cards in the wedge. */

function Hero({ page }: { page: NonNullable<ReturnType<typeof getPage>> }) {
  return (
    <section className="cut-bottom relative flex w-full items-center overflow-hidden pt-[150px] pb-[calc(var(--cut)+3.5rem)] lg:min-h-[720px] lg:pt-[200px]">
      <Image
        src={HERO_IMAGE}
        alt=""
        fill
        priority
        sizes="100vw"
        className="object-cover object-center"
      />
      <div
        aria-hidden
        className="absolute inset-0 bg-[linear-gradient(78deg,rgba(0,0,0,0.94)_0%,rgba(0,0,0,0.80)_48%,rgba(0,0,0,0.58)_100%)]"
      />

      <div className="shell relative z-10">
        <Reveal>
          <span className="hero-rule speed-rule" aria-hidden />
        </Reveal>

        <Reveal delay={1}>
          <h1 className="mt-7 max-w-[17ch] text-[clamp(30px,4.9vw,54px)] leading-[1.02] text-white">
            {page.h1}
          </h1>
        </Reveal>

        <Reveal delay={2}>
          <p className="mt-6 max-w-[40ch] font-[family-name:var(--font-sub)] text-[18px] leading-[1.3] text-gold uppercase lg:text-[21px]">
            Car Detailers Needed Now in London Earn up to £20 ph
          </p>
        </Reveal>

        <ul className="mt-11 grid max-w-[880px] gap-4 sm:grid-cols-3">
          {PROMISES.map((p, i) => (
            <Reveal as="li" key={p.title} delay={3 + i} className="surface p-6 backdrop-blur-sm">
              <span className="flex h-[44px] w-[44px] items-center justify-center rounded-full bg-gold/12 ring-1 ring-gold/35">
                <Icon name={p.icon as IconName} size={20} className="text-gold" />
              </span>
              <h2 className="mt-5 font-[family-name:var(--font-sub)] text-[19px] leading-tight text-white uppercase">
                {p.title}
              </h2>
              <p
                className="mt-2 text-[15px] leading-[24px] font-normal text-body"
                dangerouslySetInnerHTML={{ __html: p.body }}
              />
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}
