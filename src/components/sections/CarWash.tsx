import Image from "next/image";
import Icon from "@/components/Icon";
import Reveal from "@/components/Reveal";
import SectionHead from "@/components/SectionHead";
import { BOOK_URL, CARWASH, CARWASH_INTRO } from "@/lib/site";

/**
 * Seven washes in a flat four-column grid left an orphaned last row and gave
 * every tier identical weight. They now run across a six-column field in three
 * differently-paced rows — 3 up, then 2 wide, then 2 wide — which keeps the
 * Bronze → Platinum ladder in source order while varying density down the
 * scroll.
 */
const SPAN = [2, 2, 2, 3, 3, 3, 3];

export default function CarWash() {
  return (
    <section className="w-full bg-black py-16 lg:py-[104px]">
      <div className="shell">
        <SectionHead title={CARWASH_INTRO.heading} lede={CARWASH_INTRO.body} />

        <div className="mt-16 grid gap-5 sm:grid-cols-2 lg:grid-cols-6">
          {CARWASH.map((w, i) => {
            const span = SPAN[i] ?? 2;
            const wide = span === 3;
            return (
              <Reveal
                key={w.title}
                as="article"
                delay={i % 3}
                className={`group flex flex-col bg-ink-panel ring-1 ring-white/10 transition-colors duration-300 hover:ring-gold/40 ${
                  wide ? "lg:col-span-3" : "lg:col-span-2"
                }`}
              >
                <div
                  className={`relative w-full overflow-hidden ${
                    wide ? "aspect-16/9" : "aspect-4/3"
                  }`}
                >
                  <Image
                    src={w.image}
                    alt={w.title}
                    fill
                    sizes={
                      wide
                        ? "(min-width: 1024px) 50vw, (min-width: 640px) 50vw, 100vw"
                        : "(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                    }
                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.06]"
                  />
                  <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(0,0,0,0.9)_0%,rgba(0,0,0,0.15)_55%,transparent_100%)]" />

                  <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 p-5">
                    <div className="min-w-0">
                      <h3 className="font-[family-name:var(--font-sub)] text-[21px] leading-tight text-white uppercase">
                        {w.title}
                      </h3>
                      <p className="mt-1 inline-flex items-center gap-1.5 text-[13px] font-normal text-white/70">
                        <Icon name="clock" size={14} className="text-gold" />
                        {w.time.replace(/[()]/g, "")}
                      </p>
                    </div>
                    <p className="shrink-0 font-[family-name:var(--font-display)] text-[24px] leading-none text-gold">
                      {w.price}
                    </p>
                  </div>
                </div>

                <div className="flex flex-1 flex-col p-5">
                  <ul
                    className={`flex-1 gap-x-5 gap-y-1.5 ${
                      wide ? "grid sm:grid-cols-2" : "flex flex-col"
                    }`}
                  >
                    {w.features.map((f) => (
                      <li
                        key={f}
                        className="flex gap-2 text-[13.5px] leading-[21px] font-normal text-white/80"
                      >
                        <Icon
                          name="check"
                          size={14}
                          strokeWidth={2.4}
                          className="mt-[3px] shrink-0 text-gold"
                        />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="mt-6 flex flex-wrap gap-2">
                    <a href={BOOK_URL} className="btn btn-gold px-5 py-2.5 text-[12px]">
                      Book Now
                    </a>
                    <a
                      href={w.href}
                      className="link-inline"
                    >
                      Read more
                      <Icon name="arrow" size={15} />
                    </a>
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
