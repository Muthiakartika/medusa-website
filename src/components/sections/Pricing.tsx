"use client";

import { useMemo, useState } from "react";
import Icon from "@/components/Icon";
import IncludedDialog from "@/components/IncludedDialog";
import Reveal from "@/components/Reveal";
import SectionHead from "@/components/SectionHead";
import VehicleClassPicker, { ClassPrice, useVehicleClass } from "@/components/VehicleClass";
import { BY_KIND, KIND_LABEL, type Service, type ServiceKind } from "@/lib/services";
import { BOOK_URL, type Included } from "@/lib/site";

/**
 * Every priced service — 7 washes, 10 valets, 5 detailing levels — in one
 * section, switched by type and repriced by vehicle class.
 *
 * This replaced three separate full-height rows. Rows rather than cards is what
 * makes it fit: a card carries one service in roughly 340px of phone, a row in
 * about 138px, which took the pricing area from 10,643px to 2,095px on a 375px
 * screen without hiding anything a tab wasn't already hiding.
 *
 * The bar under each row encodes its price as length, scaled per tab so the
 * detailing ladder isn't flattened by its own £1,200 top end.
 */
const TABS: ServiceKind[] = ["wash", "valeting", "detailing"];

export default function Pricing() {
  const [tab, setTab] = useState<ServiceKind>("valeting");
  const [dialog, setDialog] = useState<Included | null>(null);

  // Scale each tab's bars against its own most expensive service, so the
  // ladder stays readable instead of being flattened by the £1,200 detail.
  const ceiling = useMemo(
    () => Math.max(...BY_KIND[tab].map((s) => s.from)),
    [tab],
  );

  return (
    <section id="services" className="w-full bg-black py-16 lg:py-[104px]">
      <div className="shell">
        <div className="flex flex-col gap-10 lg:flex-row lg:items-end lg:justify-between">
          <SectionHead
            title="Services & Prices"
            lede="Every wash, valet and detail we offer. Pick a service type, set your vehicle size, and the whole list reprices."
            className="lg:max-w-[58%]"
          />
          <Reveal delay={3} className="lg:pb-2">
            <VehicleClassPicker label="Prices shown for" />
          </Reveal>
        </div>

        <Reveal delay={2}>
          <div
            role="tablist"
            aria-label="Service type"
            /* Same 2px gold edge the vehicle-class picker carries, so the two
               controls in this row read as a matching pair. */
            className="mt-14 grid grid-cols-3 gap-1 overflow-hidden rounded-[12px] bg-ink p-1 ring-2 ring-gold/45 sm:inline-grid sm:auto-cols-max sm:grid-flow-col"
          >
            {TABS.map((k) => {
              const active = k === tab;
              return (
                <button
                  key={k}
                  role="tab"
                  id={`tab-${k}`}
                  aria-selected={active}
                  aria-controls={`panel-${k}`}
                  onClick={() => setTab(k)}
                  className={`flex items-center justify-center gap-2 rounded-[8px] px-4 py-3.5 font-[family-name:var(--font-sub)] text-[13px] tracking-[0.06em] uppercase transition-colors duration-200 sm:px-8 sm:text-[14px] ${
                    active ? "bg-gold text-ink" : "text-white/80 hover:bg-white/[0.08]"
                  }`}
                >
                  {KIND_LABEL[k]}
                  <span
                    className={`text-[12px] tabular-nums ${active ? "text-ink/75" : "text-white/65"}`}
                  >
                    {BY_KIND[k].length}
                  </span>
                </button>
              );
            })}
          </div>
        </Reveal>

        {TABS.map((k) => (
          <div
            key={k}
            role="tabpanel"
            id={`panel-${k}`}
            aria-labelledby={`tab-${k}`}
            hidden={k !== tab}
          >
            <ul className="mt-8 border-t border-white/12">
              {BY_KIND[k].map((s, i) => (
                <Reveal
                  key={s.title}
                  as="li"
                  delay={Math.min(i, 5)}
                  className="group block border-b border-white/12"
                >
                  <Row
                    service={s}
                    ceiling={ceiling}
                    onIncluded={() => setDialog(s.included!)}
                  />
                </Reveal>
              ))}
            </ul>
          </div>
        ))}

        {tab === "wash" && (
          <p className="mt-6 text-[13px] font-normal text-white/55">
            Wash tiers are quoted as a range because the price depends on the
            condition of the vehicle.
          </p>
        )}
      </div>

      {dialog && <IncludedDialog data={dialog} onClose={() => setDialog(null)} />}
    </section>
  );
}

function Row({
  service,
  ceiling,
  onIncluded,
}: {
  service: Service;
  ceiling: number;
  onIncluded: () => void;
}) {
  const { index } = useVehicleClass();
  const shown = service.prices ? service.prices[index] : service.from;
  const width = Math.max(4, Math.round((shown / ceiling) * 100));

  return (
    <div className="relative">
      <span
        aria-hidden
        className="absolute bottom-0 left-0 h-[2px] bg-gold/45 transition-[width] duration-500 ease-[var(--ease-out-expo)]"
        style={{ width: `${width}%` }}
      />

      <div className="flex flex-col gap-3 py-4 transition-colors duration-200 group-hover:bg-white/[0.03] sm:flex-row sm:items-center sm:gap-6 sm:py-5">
        <div className="min-w-0 flex-1">
          <h3 className="text-[18px] leading-tight text-white uppercase">
            {service.title}
            {service.badge && (
              <span className="ml-2 bg-gold px-2 py-0.5 align-middle font-[family-name:var(--font-ui)] text-[10px] font-semibold tracking-[0.12em] text-ink">
                {service.badge}
              </span>
            )}
          </h3>
          <p className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[13.5px] font-normal text-white/60">
            <span>{service.subtitle}</span>
            {service.duration && (
              <span className="inline-flex items-center gap-1.5">
                <Icon name="clock" size={13} className="text-gold" />
                {service.duration}
              </span>
            )}
          </p>
        </div>

        <div className="flex items-center justify-between gap-4 sm:justify-end sm:gap-6">
          <p className="font-[family-name:var(--font-display)] text-[26px] leading-none whitespace-nowrap text-gold sm:w-[130px] sm:text-right">
            {service.prices ? (
              <ClassPrice prices={service.prices} />
            ) : (
              <span className="text-[19px]">{service.priceLabel}</span>
            )}
          </p>

          {/* Two columns, not two content-width buttons: "Book" beside
              "Included" is 68px beside 95px, and a pair that sits on one line
              should look like a pair. */}
          <div className="grid shrink-0 grid-cols-2 gap-2">
            <a href={BOOK_URL} className="btn btn-gold px-4 py-2.5 text-[12px]">
              Book
            </a>
            {service.included ? (
              <button
                type="button"
                onClick={onIncluded}
                className="btn btn-outline px-4 py-2.5 text-[12px]"
              >
                Included
              </button>
            ) : (
              <a href={service.href} className="btn btn-outline px-4 py-2.5 text-[12px]">
                Details
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
