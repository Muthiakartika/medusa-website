"use client";

import { useId, useState } from "react";
import Image from "next/image";
import { BOOK_URL, CAR_SIZES } from "@/lib/site";
import type { PriceLadder } from "@/lib/table-model";

/**
 * The comparison table's price row, as a price row.
 *
 * The source ends its matrix with a per-package carousel of vehicle-class
 * cards and a BOOK NOW button; `lib/table-model.ts` explains how that reaches
 * us as one flattened string. Rendered as that string it is unreadable
 * (`…Toyota yaris£70Medium Car…`) and the call to action does not click.
 *
 * One picker drives all five packages, which is the same choice
 * `components/VehicleClass.tsx` makes and for the same reason: vehicle class
 * is a fact about the reader, not about the package, so asking five times
 * turns a comparison into thirty taps. Picking once puts all five prices for
 * *your* car on one screen, directly under the features they buy.
 *
 * The tab strip is `components/PriceTabs.tsx`'s, so the page's several price
 * ladders read as one control rather than several.
 */
export default function TablePrices({
  packages,
}: {
  packages: { name: string; ladder: PriceLadder }[];
}) {
  const [index, setIndex] = useState(0);
  const id = useId();

  // Every package prices the same four classes, so the strip follows the
  // first one and the rest answer to it. A package that stops short of the
  // chosen class falls back to its last rung rather than printing nothing.
  const classes = packages[0]?.ladder.rungs ?? [];
  const size = CAR_SIZES[index];

  return (
    <div className="p-3">
      <div
        role="tablist"
        aria-label="Vehicle class"
        className="flex flex-wrap gap-1 rounded-[10px] bg-ink p-1"
      >
        {classes.map((rung, i) => {
          const on = i === index;
          return (
            <button
              key={rung.label + i}
              type="button"
              role="tab"
              id={`${id}-tab-${i}`}
              aria-selected={on}
              aria-controls={`${id}-panel`}
              onClick={() => setIndex(i)}
              className={`flex min-w-[52px] flex-1 basis-[calc(25%-3px)] items-center justify-center gap-1.5 rounded-[7px] px-1 py-2 font-[family-name:var(--font-ui)] text-[10.5px] font-semibold tracking-[0.03em] whitespace-nowrap uppercase transition-colors duration-200 ${
                on ? "bg-gold text-ink" : "text-white/70 hover:bg-white/[0.08]"
              }`}
            >
              {CAR_SIZES[i] && (
                <Image
                  src={CAR_SIZES[i].icon}
                  alt=""
                  width={200}
                  height={120}
                  className={`h-[15px] w-auto object-contain ${
                    on ? "brightness-0" : "opacity-70"
                  }`}
                />
              )}
              {rung.label.replace(/\s*car\s*$/i, "") || rung.label}
            </button>
          );
        })}
      </div>

      {/* The examples belong to the class, not to the package, so they are
          printed once rather than five times. */}
      {classes[index]?.note && (
        <p className="px-1 pt-2.5 text-[12px] leading-[17px] font-normal text-white/50">
          {classes[index].note}
        </p>
      )}

      <ul
        role="tabpanel"
        id={`${id}-panel`}
        aria-labelledby={`${id}-tab-${index}`}
        className="mt-2"
      >
        {packages.map(({ name, ladder }, i) => {
          const rung = ladder.rungs[index] ?? ladder.rungs[ladder.rungs.length - 1];
          return (
            <li
              key={name + i}
              className="flex items-start gap-3 border-t border-white/[0.07] px-1 py-3"
            >
              <p className="min-w-0 flex-1">
                <span className="block font-[family-name:var(--font-sub)] text-[13px] tracking-[0.12em] text-gold uppercase">
                  {name}
                </span>
                {ladder.duration && (
                  <span className="mt-0.5 block text-[11.5px] leading-[16px] font-normal text-white/45">
                    {ladder.duration}
                  </span>
                )}
              </p>

              {/* Price over button, right-aligned: side by side the five
                  buttons ran the full width and the footer became a stack of
                  gold slabs taller than the features they price. */}
              <div className="flex shrink-0 flex-col items-end gap-1.5">
                <p className="font-[family-name:var(--font-display)] text-[20px] leading-none text-white">
                  {rung?.price}
                </p>
                {ladder.cta && (
                  <a
                    href={BOOK_URL}
                    className="btn btn-gold px-3 py-1.5 text-[10.5px] leading-[14px] tracking-[0.06em]"
                  >
                    {ladder.cta}
                    <span className="sr-only">
                      {" "}
                      — {name}, {size?.label ?? rung?.label}
                    </span>
                  </a>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
