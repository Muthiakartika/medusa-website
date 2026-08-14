"use client";

import { useState } from "react";
import IncludedDialog from "@/components/IncludedDialog";
import Reveal from "@/components/Reveal";
import SectionHead from "@/components/SectionHead";
import VehicleClassPicker, { ClassPrice } from "@/components/VehicleClass";
import {
  BOOK_URL,
  INCLUDED,
  VALETING,
  VALETING_INTRO,
  type Included,
  type Package,
} from "@/lib/site";

/**
 * Ten packages used to render as ten identical centred cards, each carrying
 * its own four-slide price carousel. Now the named ladder leads at full size
 * and the single-purpose valets sit under it as a board, with one page-level
 * vehicle-class control driving every price at once.
 */
export default function Valeting() {
  const [modal, setModal] = useState<Included | null>(null);

  const featured = VALETING.filter((p) => p.featured);
  const specialist = VALETING.filter((p) => !p.featured);
  const open = (p: Package) => setModal(INCLUDED[p.included]);

  return (
    <section id="services" className="relative w-full bg-black py-20 lg:py-28">
      <div className="shell">
        <div className="flex flex-col gap-10 lg:flex-row lg:items-end lg:justify-between">
          <SectionHead
            title={VALETING_INTRO.heading}
            lede={VALETING_INTRO.body}
            className="lg:max-w-[62%]"
          />
          <Reveal delay={3} className="lg:pb-2">
            <VehicleClassPicker label="Prices below are for" />
          </Reveal>
        </div>

        {/* The named ladder */}
        <div className="mt-16 grid gap-6 md:grid-cols-3">
          {featured.map((p, i) => (
            <Reveal key={p.title} as="article" delay={i}>
              <FeaturedCard pkg={p} onOpen={() => open(p)} />
            </Reveal>
          ))}
        </div>

        {/* Everything else, as a board */}
        <h3 className="mt-20 font-[family-name:var(--font-sub)] text-[15px] tracking-[0.2em] text-white/50 uppercase">
          Single-purpose valets
        </h3>

        <ul className="mt-6 border-t border-white/12">
          {specialist.map((p, i) => (
            <Reveal
              key={p.title}
              as="li"
              delay={i}
              className="group block border-b border-white/12"
            >
              <BoardRow pkg={p} onOpen={() => open(p)} />
            </Reveal>
          ))}
        </ul>
      </div>

      {modal && <IncludedDialog data={modal} onClose={() => setModal(null)} />}
    </section>
  );
}

function FeaturedCard({ pkg, onOpen }: { pkg: Package; onOpen: () => void }) {
  const hero = Boolean(pkg.badge);

  return (
    <div
      className={`relative flex h-full flex-col p-7 transition-[background-color,box-shadow] duration-300 lg:p-8 ${
        hero
          ? "bg-[#131313] ring-1 ring-gold/45 hover:bg-[#171717]"
          : "bg-ink-panel ring-1 ring-white/10 hover:bg-[#131313]"
      }`}
    >
      {/* Livery stripe capping the panel */}
      <span
        aria-hidden
        className={`absolute inset-x-0 top-0 h-[5px] ${hero ? "bg-gold" : "bg-white/25"}`}
        style={{ clipPath: "polygon(0 0, 100% 0, calc(100% - 26px) 100%, 0 100%)" }}
      />

      {pkg.badge && (
        <span className="mb-5 inline-flex w-fit bg-gold px-3 py-1.5 font-[family-name:var(--font-ui)] text-[11px] font-semibold tracking-[0.14em] text-ink uppercase">
          {pkg.badge}
        </span>
      )}

      <h3
        className={`font-[family-name:var(--font-sub)] text-[24px] leading-tight text-white uppercase ${
          pkg.badge ? "" : "mt-5"
        }`}
      >
        {pkg.title}
      </h3>
      <p className="mt-2 text-[15px] font-normal text-gold">{pkg.subtitle}</p>

      <p className="mt-7 font-[family-name:var(--font-display)] text-[54px] leading-none text-white">
        <ClassPrice prices={pkg.prices} />
      </p>

      <div className="mt-auto flex flex-wrap gap-2 pt-8">
        <a href={BOOK_URL} className="btn btn-gold flex-1 justify-center text-[12px]">
          Book Now
        </a>
        <button
          type="button"
          onClick={onOpen}
          className="btn btn-outline flex-1 justify-center text-[12px]"
        >
          What&rsquo;s Included
        </button>
      </div>
    </div>
  );
}

function BoardRow({ pkg, onOpen }: { pkg: Package; onOpen: () => void }) {
  return (
    <div className="flex flex-col gap-4 py-5 transition-colors duration-200 group-hover:bg-white/[0.03] sm:flex-row sm:items-center sm:gap-6">
      <div className="min-w-0 flex-1">
        <h4 className="text-[19px] leading-tight text-white uppercase">{pkg.title}</h4>
        <p className="mt-1.5 text-[14px] font-normal text-white/60">{pkg.subtitle}</p>
      </div>

      <p className="font-[family-name:var(--font-display)] text-[30px] leading-none text-gold sm:w-[130px] sm:text-right">
        <ClassPrice prices={pkg.prices} />
      </p>

      <div className="flex shrink-0 flex-wrap gap-2">
        <a href={BOOK_URL} className="btn btn-gold px-5 py-2.5 text-[12px]">
          Book
        </a>
        <button
          type="button"
          onClick={onOpen}
          className="btn btn-outline px-5 py-2.5 text-[12px]"
        >
          Included
        </button>
      </div>
    </div>
  );
}
