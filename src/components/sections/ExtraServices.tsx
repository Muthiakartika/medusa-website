import Image from "next/image";
import Icon from "@/components/Icon";
import Reveal from "@/components/Reveal";
import SectionHead from "@/components/SectionHead";
import { BOOK_URL, EXTRA_SERVICES } from "@/lib/site";

/**
 * Add-ons, image-led: the photograph fills the tile and the copy sits over it
 * rather than under it, so the row carries the work rather than describing it.
 */
export default function ExtraServices() {
  return (
    <section className="w-full bg-black py-16 lg:py-[104px]">
      <div className="shell">
        <SectionHead title="Add To Any Service" />

        <ul className="mt-12 grid gap-5 sm:grid-cols-2">
          {EXTRA_SERVICES.map((s, i) => (
            <Reveal
              as="li"
              key={s.title}
              delay={i % 2}
              className="surface group relative isolate min-h-[300px] overflow-hidden"
            >
              <Image
                src={s.image}
                alt=""
                fill
                sizes="(min-width: 640px) 50vw, 100vw"
                className="-z-10 object-cover transition-transform duration-700 ease-out group-hover:scale-[1.06]"
              />
              <div
                aria-hidden
                className="absolute inset-0 -z-10 bg-[linear-gradient(to_top,rgba(0,0,0,0.94)_18%,rgba(0,0,0,0.55)_58%,rgba(0,0,0,0.25)_100%)]"
              />
              <div className="flex h-full flex-col justify-end p-7">
                <h3 className="font-[family-name:var(--font-sub)] text-[22px] leading-tight text-gold">
                  {s.title}
                </h3>
                <p className="mt-2.5 text-[14px] leading-[22px] font-normal text-white/80">
                  {s.body}
                </p>
                <div className="mt-5 flex flex-wrap items-center gap-4">
                  <a href={BOOK_URL} className="btn btn-gold rounded-full px-5 py-2.5 text-[12px]">
                    Book Now
                  </a>
                  <a href={s.href} className="link-inline">
                    Read more
                    <Icon name="arrow" size={15} />
                  </a>
                </div>
              </div>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}
