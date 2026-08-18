"use client";

import Image from "next/image";
import { useId, useState } from "react";

/**
 * The vehicle-class price ladder, as a picker.
 *
 * Four classes side by side is the right shape for a full-width row, and the
 * wrong one for a narrow column: stacked, the tiers ran down the page as four
 * unseparated blocks of gold with nothing to say where one ended and the next
 * began. Rather than draw dividers between them, the narrow case becomes what
 * it should have been — pick your car, read your price.
 *
 * This mirrors the homepage's `VehicleClassPicker`, deliberately: same ink
 * strip, same gold active chip, same knocked-back icons. It does not share its
 * context, because a page can carry several ladders — /valeting has five — and
 * each one prices a different package.
 */

export type Tier = {
  icon?: { src: string; w?: number; h?: number };
  label: string;
  note?: string;
  price: string;
};

export default function PriceTabs({ items }: { items: Tier[] }) {
  const [index, setIndex] = useState(0);
  const id = useId();
  const active = items[index] ?? items[0];

  return (
    <div className="p-3">
      {/* Grid, not flex-wrap: four chips on a narrow strip leave the last one
          alone on its row and stretched to full width. */}
      <div
        role="tablist"
        aria-label="Vehicle class"
        className="grid grid-cols-2 gap-1 bg-ink p-1 @min-[420px]:grid-cols-4"
      >
        {items.map((it, i) => {
          const on = i === index;
          return (
            <button
              key={it.label + i}
              type="button"
              role="tab"
              id={`${id}-tab-${i}`}
              aria-selected={on}
              aria-controls={`${id}-panel`}
              onClick={() => setIndex(i)}
              className={`group flex flex-col items-center gap-1 px-2 py-2.5 transition-colors duration-200 ${
                on ? "bg-gold text-ink" : "text-white/80 hover:bg-white/[0.08]"
              }`}
            >
              {it.icon && (
                <Image
                  src={it.icon.src}
                  alt=""
                  width={it.icon.w ?? 339}
                  height={it.icon.h ?? 339}
                  className={`h-[28px] w-auto object-contain transition-[filter,opacity] duration-200 ${
                    on ? "brightness-0" : "opacity-80 group-hover:opacity-100"
                  }`}
                />
              )}
              <span className="font-[family-name:var(--font-ui)] text-[11px] font-semibold tracking-[0.06em] whitespace-nowrap uppercase">
                {it.label.replace(/\s*car\s*$/i, "") || it.label}
              </span>
            </button>
          );
        })}
      </div>

      <div
        role="tabpanel"
        id={`${id}-panel`}
        aria-labelledby={`${id}-tab-${index}`}
        className="pt-5 pb-2 text-center"
      >
        <p className="font-[family-name:var(--font-sub)] text-[15px] tracking-[0.04em] text-ink uppercase">
          {active.label}
        </p>
        {active.note && (
          <p
            className="mx-auto mt-1.5 max-w-[36ch] text-[12.5px] leading-[19px] font-normal text-ink/85"
            dangerouslySetInnerHTML={{ __html: active.note }}
          />
        )}
        <p className="mt-3 font-[family-name:var(--font-display)] text-[34px] leading-none text-ink">
          {active.price}
        </p>
      </div>
    </div>
  );
}
