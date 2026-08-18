import Image from "next/image";
import Icon from "@/components/Icon";
import Reveal from "@/components/Reveal";
import SectionHead from "@/components/SectionHead";
import { BOOK_URL, WHY } from "@/lib/site";

/**
 * The first gold band, laid out as a bento.
 *
 * Gold carries the brand here; the tiles sitting on it are ink, which gives
 * the row depth and lets their copy stay white instead of fighting the gold.
 * The pitch and the product shot lead, and the five reasons follow with the
 * lead one double-width so the group has a reading order rather than five
 * equal claims.
 */
export default function WhyChoose() {
  const [lead, ...rest] = WHY.items;

  return (
    <section className="bg-gold-wash w-full py-16 lg:py-[104px]">
      <div className="shell">
        <div className="grid gap-5 lg:grid-cols-12">
          <Reveal className="flex flex-col justify-center lg:col-span-7">
            <SectionHead title={WHY.heading} lede={WHY.intro} tone="gold" />
            <a href={BOOK_URL} className="btn btn-dark mt-9 w-fit rounded-full">
              Book Now
              <Icon name="arrow" size={18} className="ml-2.5" />
            </a>
          </Reveal>

          <Reveal delay={1} className="surface-on-gold relative overflow-hidden lg:col-span-5">
            <div
              aria-hidden
              className="absolute inset-0"
              style={{
                background:
                  "radial-gradient(120% 90% at 50% 100%, rgba(193,146,49,0.34) 0%, rgba(193,146,49,0.09) 44%, transparent 72%)",
              }}
            />
            <Image
              src={WHY.phone}
              alt="Booking a mobile car valet on a phone"
              width={420}
              height={840}
              className="relative mx-auto h-auto w-[230px] max-w-full pt-10 lg:w-[270px]"
            />
          </Reveal>
        </div>

        <ul className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-6">
          <Reveal as="li" className="surface-on-gold p-7 sm:col-span-2">
            <Image
              src={lead.icon}
              alt=""
              width={64}
              height={64}
              className="h-[46px] w-[46px] object-contain"
            />
            <h3 className="mt-5 text-[20px] leading-snug font-semibold text-white">
              {lead.title}
            </h3>
            <p className="mt-2.5 text-[15px] leading-[24px] font-normal text-white/70">
              {lead.body}
            </p>
          </Reveal>

          {rest.map((item, i) => (
            <Reveal key={item.title} as="li" delay={i + 1} className="surface-on-gold p-6">
              <Image
                src={item.icon}
                alt=""
                width={64}
                height={64}
                className="h-[34px] w-[34px] object-contain opacity-90"
              />
              <h3 className="mt-4 text-[16px] leading-snug font-semibold text-white">
                {item.title}
              </h3>
              <p className="mt-2 text-[14px] leading-[22px] font-normal text-white/65">
                {item.body}
              </p>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}
