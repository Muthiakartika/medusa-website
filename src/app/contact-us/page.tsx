import type { Metadata } from "next";
import { notFound } from "next/navigation";
import EnquiryForm from "@/components/EnquiryForm";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import Icon, { type IconName } from "@/components/Icon";
import JsonLd from "@/components/JsonLd";
import PageHero from "@/components/PageHero";
import Reveal from "@/components/Reveal";
import SectionHead from "@/components/SectionHead";
import { getForms, getPage, heroImageFor } from "@/lib/blocks";
import { pageSchema } from "@/lib/schema";
import { BOOK_URL, CONTACT } from "@/lib/site";

/**
 * Contact, laid out rather than rendered.
 *
 * The extracted page is one two-column row: an h1, an h2, a paragraph, and
 * then the four things a visitor actually came for — phone, email, opening
 * hours and the after-hours note — run together inside two paragraphs, with
 * neither the number nor the address made clickable. The form sat in the
 * right-hand cell with no heading of its own.
 *
 * The copy below is the page's own, unchanged. What changes is that each fact
 * gets its own card and its own link, so a phone dials and an address opens a
 * mail client.
 */

const SLUG = "contact-us";

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

/**
 * The page's own contact block, split into the facts it runs together.
 *
 * The source prints these as two headings and three paragraphs — "Contact
 * Information" over "Phone: … Email: …", and "Our Timings" over "Open 7 Days a
 * week 07:00 -22:00" plus the after-hours line. Same words, same headings, one
 * card each, and the phone and the address are links now.
 *
 * The fourth card is the registered address off `BUSINESS` — the same fact the
 * LocalBusiness JSON-LD already publishes on every page of this site.
 */
const DETAILS = [
  {
    icon: "phone",
    label: "Phone",
    value: CONTACT.phone,
    href: `tel:${CONTACT.phone}`,
  },
  {
    icon: "mail",
    label: "Email",
    value: CONTACT.email,
    href: `mailto:${CONTACT.email}`,
  },
  {
    icon: "clock",
    label: "Our Timings",
    value: "Open 7 Days a week 07:00 -22:00",
    note: "After hours appointments by special request",
  },
] as const;

export default function ContactPage() {
  const page = getPage(SLUG);
  if (!page) notFound();

  // The page carries one Contact Form 7 form; the server action re-reads its
  // schema from `pages.json` by this index, so it has to come from there.
  const form = getForms(SLUG)[0];

  return (
    <>
      <JsonLd data={pageSchema(page)} />
      <Header />
      <main className="flex-1">
        <PageHero
          title={page.h1}
          image={heroImageFor(page)}
          lede="GET IN TOUCH"
          introHtml={[
            "Please contact us with any questions or comments using the contact form. We look forward to hearing from you. Alternatively you can call or email us using the details below. Thank you!",
          ]}
        />

        {/*
          The source puts the contact details and the form side by side in one
          row, and that is what this is: three details in the left column,
          under the heading the page gave them, and the form in the right.
        */}
        <section className="w-full py-16 lg:py-[104px]">
          <div className="shell grid gap-12 lg:grid-cols-12 lg:gap-16">
            <div className="lg:col-span-5">
              <Reveal>
                <h2 className="font-[family-name:var(--font-sub)] text-[20px] leading-tight text-white uppercase lg:text-[23px]">
                  Contact Information
                </h2>
              </Reveal>

              <ul className="mt-7 flex flex-col gap-4">
                {DETAILS.map((d, i) => (
                  <Reveal
                    as="li"
                    key={d.value}
                    delay={i}
                    className="surface flex items-start gap-4 p-5"
                  >
                    <span className="flex h-[44px] w-[44px] shrink-0 items-center justify-center rounded-full bg-gold/12 ring-1 ring-gold/35">
                      <Icon name={d.icon as IconName} size={20} className="text-gold" />
                    </span>
                    <span className="min-w-0">
                      <span className="block font-[family-name:var(--font-ui)] text-[11px] tracking-[0.16em] text-white/50 uppercase">
                        {d.label}
                      </span>
                      {"href" in d && d.href ? (
                        <a
                          href={d.href}
                          className="mt-1.5 block text-[16px] leading-[24px] font-semibold break-words text-white transition-colors hover:text-gold"
                        >
                          {d.value}
                        </a>
                      ) : (
                        <span className="mt-1.5 block text-[16px] leading-[24px] font-semibold text-white">
                          {d.value}
                        </span>
                      )}
                      {"note" in d && d.note && (
                        <span className="mt-1.5 block text-[13.5px] leading-[21px] font-normal text-white/55">
                          {d.note}
                        </span>
                      )}
                    </span>
                  </Reveal>
                ))}
              </ul>
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

        {/* The source page's own closing row, kept whole. */}
        <section className="cut-top relative w-full overflow-hidden bg-ink-panel pt-[calc(var(--cut)+3.5rem)] pb-16 lg:pb-[104px]">
          <div
            aria-hidden
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(80% 100% at 50% 0%, rgba(193,146,49,0.16) 0%, transparent 62%)",
            }}
          />
          <div className="shell relative flex flex-col items-center text-center">
            <SectionHead
              title="LONDON’S FINEST DETAILING & VALETING BROUGHT TO YOUR DOORSTEP."
              align="center"
            />
            <Reveal delay={1}>
              <div className="mt-9">
                <a href={BOOK_URL} className="btn btn-gold rounded-full text-[15px]">
                  Book Now
                  <Icon name="arrow" size={18} className="ml-2.5" />
                </a>
              </div>
            </Reveal>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
