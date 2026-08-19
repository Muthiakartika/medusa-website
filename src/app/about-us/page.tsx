import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import Icon from "@/components/Icon";
import JsonLd from "@/components/JsonLd";
import PageHero from "@/components/PageHero";
import Reveal from "@/components/Reveal";
import SectionHead from "@/components/SectionHead";
import { getPage } from "@/lib/blocks";
import { pageSchema } from "@/lib/schema";
import { BOOK_URL } from "@/lib/site";

/**
 * About us, laid out rather than rendered.
 *
 * The extracted page is six paragraphs and one photograph. Two of the
 * paragraphs sit on a darkened background image, two more on another copy of
 * the same image, and the longest of them — three subjects welded together
 * with `<br>` — runs beside the photograph in a seven-column cell. Read top to
 * bottom that is roughly nine hundred words of unbroken prose with two section
 * breaks that mark nothing.
 *
 * The words below are that page's, in its order, unedited. What is different
 * is that the prose is broken where its own subject changes, the photograph is
 * given a column to sit in rather than a caption slot, and the page's own
 * closing line finally reads as an ask.
 */

const SLUG = "about-us";

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

const OPENING =
  "Medusa Auto Detailing provides elite mobile car detailing services across all of London, everything you could possibly need to keep your car looking as new as it should be. Thanks to our revolutionary efficient booking system, car care has never been this effective and easy to arrange. In fact, you can relax and enjoy that new car premium finish at home. We work with all valet specific jobs, whether the usual regular inside-out wash and vacuum, to your full car detailing, to capture that brand-new aura again. We absolutely love working with cars, classics, vintage, exotic, commercial fleets and your everyday car – every car deserves to be loved and cared for. After all, your car is often an extension of your home and for many Londoners, they could spend hours in their car on a daily basis. Keeping it in its best shape and condition has never been so important.";

const SPECIALITY = [
  "We specialise in car paint protection, pre-sale mobile car detailing, full interior cleaning, exterior paint correction, convenient mobile car wash services, detailing and even car window tinting. Working on cars is where we feel at home and at our happiest, your car is our speciality and passion. After all, you can put the ‘’best car detailing near me’’ in the rear-view mirror as we are a mobile service, that’s right, we come to you at your home or on-site.",
  "Ever wondered why so many exotic and luxury cars like Ferrari and Lamborghini, just have that extra ‘wow-factor’ when it comes to that lustrous gloss, just like in the movies? Well, Medusa Auto Detailing offers just that, creating that superior shine with our new car paint protection, a newly formulated and ultra-dense car ceramic coating. With a glass-like coating that hardens with time, it creates a fortified barrier, boasting excellent abrasion, scratch, paint fading/oxidation and chemical resistance. We will give your car that luxury feeling from the inside and out. Hard candy gloss, super easy to clean and hardened protection, what more could you want for your car?",
];

/*
  The source welds three subjects into one paragraph with `<br>`: selling or
  trading a car, the interior work, and the exterior work. Split at the same
  two breaks the author typed, so the wording is untouched and each subject is
  readable on its own.
*/
const RESTORE = [
  "If you are thinking about selling or trading your car for the best value, <a href=\"/\">Medusa Auto Detailing</a> is the right company for you.",
  "Get that luxurious comfort and care for your car with our professional interior car detailing. We will treat your unpleasant spots and stains from carpets, seats, mats, and even from the roof lining. Whether you have kids, pets, eat in the car or just regularly drive, a deep upholstery shampoo will remove all the embedded contaminants. Tackle bacteria and germs at its source, most likely from accumulating spilt drinks and food. Don’t let your car become a breeding ground for microorganisms and restore your car to its best possible and safe condition.",
  "Achieve the best quality for your paintwork with our popular exterior mobile car detailing services. We are ready to wash, correct and protect your car, giving it elite aesthetics that will turn heads! Our professionals will apply a high-foam shampoo, hand-dry it, clean your windows, mirrors, tyres, and rims. We will machine buff and polish to minimise the severity and deepness of scratches, and protect it with a protective wax, tire shine, plastic, and rubber dressings. With the complete service, you will not be able to recognise your car with this restoration.",
];

const BOOKING = [
  "Book our mobile car wash service and forget about the long lines at the local car wash and wasting your time. Book Medusa Auto Detailing online in just 60 seconds and we will come to you, at your home on-site, when the time is right for you. Our prestige services are professional and reliable, and our mobile car wash is truly the best car wash service you can get thanks to our highly vetted enthusiasts.",
  "Everything starts with our packages as we will have the perfect one just for you, do what’s best for your car.",
];

const PHOTO = {
  src: "/assets/2020/10/alex-suprun-QfrjInUQ5K0-unsplash1.webp",
  alt: "A car being detailed by Medusa Auto Detailing",
  w: 1800,
  h: 1200,
};

const BACKDROP = "/assets/2020/10/pexels-jae-park-49843141.webp";

const PROSE =
  "text-[16px] leading-[28px] font-normal [&_a]:text-gold [&_a:hover]:underline";

export default function AboutPage() {
  const page = getPage(SLUG);
  if (!page) notFound();

  return (
    <>
      <JsonLd data={pageSchema(page)} />
      <Header />
      <main className="flex-1">
        <PageHero title={page.h1} introHtml={[OPENING]} />

        {/* What we specialise in — the source's second row, on its own photo. */}
        <section className="relative w-full overflow-hidden py-16 lg:py-[104px]">
          <Image src={BACKDROP} alt="" fill sizes="100vw" className="object-cover" />
          <div aria-hidden className="absolute inset-0 bg-black/[0.86]" />
          <div className="shell relative">
            <Reveal>
              <span aria-hidden className="speed-rule block" />
            </Reveal>
            <div className="mt-8">
              {SPECIALITY.map((html, i) => (
                <Reveal key={i} delay={i + 1}>
                  <p
                    className={`mt-6 max-w-[70ch] text-body first:mt-0 ${PROSE}`}
                    dangerouslySetInnerHTML={{ __html: html }}
                  />
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* Inside and out — the page's one photograph, given a column. */}
        <section className="w-full py-16 lg:py-[104px]">
          <div className="shell grid gap-12 lg:grid-cols-12 lg:gap-16">
            <Reveal className="lg:col-span-5">
              <div className="lg:sticky lg:top-[130px]">
                <div className="overflow-hidden rounded-[14px] ring-1 ring-white/[0.08]">
                  <Image
                    src={PHOTO.src}
                    alt={PHOTO.alt}
                    width={PHOTO.w}
                    height={PHOTO.h}
                    sizes="(min-width: 1024px) 480px, 100vw"
                    className="h-auto w-full"
                  />
                </div>
              </div>
            </Reveal>

            <div className="lg:col-span-7">
              {RESTORE.map((html, i) => (
                <Reveal key={i} delay={i + 3}>
                  <p
                    className={`mt-6 max-w-[70ch] text-body first:mt-0 ${PROSE}`}
                    dangerouslySetInnerHTML={{ __html: html }}
                  />
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* Booking — the source's fourth row. */}
        <section className="relative w-full overflow-hidden py-16 lg:py-[104px]">
          <Image src={BACKDROP} alt="" fill sizes="100vw" className="object-cover" />
          <div aria-hidden className="absolute inset-0 bg-black/[0.88]" />
          <div className="shell relative grid gap-10 lg:grid-cols-2 lg:gap-16">
            {BOOKING.map((html, i) => (
              <Reveal key={i} delay={i}>
                <p
                  className={`text-body ${PROSE}`}
                  dangerouslySetInnerHTML={{ __html: html }}
                />
              </Reveal>
            ))}
          </div>
        </section>

        {/* The page's own closing line, as the ask it always was. */}
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
              title="Mobile Auto Detailing & Valeting brought to your doorstep!"
              align="center"
            />
            <Reveal delay={1} className="w-full sm:w-auto">
              <div className="mt-9 flex flex-col items-stretch gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-center">
                <a href={BOOK_URL} className="btn btn-gold w-full rounded-full text-[15px] sm:w-auto">
                  Book Now
                  <Icon name="arrow" size={18} className="ml-2.5" />
                </a>
                <Link href="/car-valeting/" className="btn btn-outline w-full rounded-full sm:w-auto">
                  See our packages
                </Link>
              </div>
            </Reveal>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
