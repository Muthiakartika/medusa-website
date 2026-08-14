import Image from "next/image";
import Icon from "@/components/Icon";
import Reveal from "@/components/Reveal";
import SectionHead from "@/components/SectionHead";
import { APP, BOOK_URL, CONTACT } from "@/lib/site";

/**
 * The app pitch on a raised panel, then the booking strip.
 *
 * The strip keeps its slanted full-bleed treatment — it is the page's one
 * light surface and the sharpest contrast on the scroll, which is exactly what
 * a booking prompt should be.
 */
export default function AppSection() {
  return (
    <>
      <section className="w-full bg-black py-20 lg:py-28">
        <div className="shell">
          <div className="surface grid items-center gap-10 overflow-hidden p-8 lg:grid-cols-12 lg:p-14">
            <Reveal className="relative lg:col-span-5">
              <div
                aria-hidden
                className="absolute inset-0"
                style={{
                  background:
                    "radial-gradient(85% 70% at 50% 50%, rgba(193,146,49,0.26) 0%, transparent 68%)",
                }}
              />
              <Image
                src={APP.phone}
                alt="Medusa Auto Detailing mobile app"
                width={560}
                height={620}
                className="relative mx-auto h-auto w-full max-w-[340px]"
              />
            </Reveal>

            <div className="lg:col-span-7">
              <SectionHead title={APP.heading} />

              <ul className="mt-9 flex flex-wrap gap-3">
                {APP.features.map((f, i) => (
                  <Reveal
                    as="li"
                    key={f.title}
                    delay={i}
                    className="flex items-center gap-3 rounded-full bg-white/[0.05] py-2.5 pr-5 pl-2.5 ring-1 ring-white/10"
                  >
                    <Image
                      src={f.icon}
                      alt=""
                      width={80}
                      height={80}
                      className="h-[32px] w-[32px] shrink-0 object-contain"
                    />
                    <span className="text-[14px] font-semibold text-white">{f.title}</span>
                    <span className="text-[13px] font-normal text-gold">{f.sub}</span>
                  </Reveal>
                ))}
              </ul>

              <Reveal delay={3} className="mt-9 flex flex-wrap items-center gap-4">
                <a
                  href={CONTACT.appStore}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition-opacity hover:opacity-80"
                >
                  <Image
                    src={APP.badges.apple}
                    alt="Download on the App Store"
                    width={240}
                    height={80}
                    className="h-[46px] w-auto"
                  />
                </a>
                <a
                  href={CONTACT.playStore}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition-opacity hover:opacity-80"
                >
                  <Image
                    src={APP.badges.play}
                    alt="Get it on Google Play"
                    width={240}
                    height={80}
                    className="h-[46px] w-auto"
                  />
                </a>
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      {/* Booking strip — full-bleed, cut on the slant. */}
      <section className="cut-both relative w-full bg-white py-[calc(var(--cut)+1.5rem)]">
        <div className="shell flex flex-col items-center justify-center gap-5 sm:flex-row sm:justify-between">
          <p className="text-center text-[19px] leading-tight font-bold text-ink sm:text-left lg:text-[22px]">
            {APP.strip}
          </p>
          <a href={BOOK_URL} className="btn btn-gold shrink-0 rounded-full">
            Book Now
            <Icon name="arrow" size={18} className="ml-2.5" />
          </a>
        </div>
      </section>
    </>
  );
}
