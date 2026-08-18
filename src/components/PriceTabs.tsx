"use client";

import { useId, useState } from "react";

/**
 * The vehicle-class price ladder, as a picker.
 *
 * Four cards side by side is the right shape for a full-width row and the
 * wrong one for a narrow column, where the package cards on the location and
 * valeting pages carry a ladder each. Here it is a row of tabs and a single
 * line of answer, so the price sits beside the service instead of four screens
 * below it.
 *
 * It does not share the homepage picker's context: a page can carry several
 * ladders — /valeting has five — and each one prices a different package.
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
      {/*
        Text-only tabs on one row. The icons and the stacked layout this used
        to carry made the control four hundred pixels tall inside a package
        card that is a third of a column wide — the price ended up below the
        fold of its own card. Class names lose their "Car" suffix so four of
        them fit across without wrapping.
      */}
      <div
        role="tablist"
        aria-label="Vehicle class"
        /*
          Four across when the row can give each tab 52px, two-by-two when it
          cannot — flex-wrap works that out from the space it actually has,
          which a container query kept getting wrong by a few pixels. Inside
          the package cards on the location pages the row is about 190px, and
          four across there clipped "MEDIUM".
        */
        className="flex flex-wrap gap-1 rounded-[10px] bg-ink p-1"
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
              className={`min-w-[52px] flex-1 basis-[calc(25%-3px)] rounded-[7px] px-1 py-2 font-[family-name:var(--font-ui)] text-[10.5px] font-semibold tracking-[0.03em] whitespace-nowrap uppercase transition-colors duration-200 ${
                on ? "bg-gold text-ink" : "text-white/70 hover:bg-white/[0.08]"
              }`}
            >
              {it.label.replace(/\s*car\s*$/i, "") || it.label}
            </button>
          );
        })}
      </div>

      {/* The answer on one line: the class you picked, and what it costs. */}
      <div
        role="tabpanel"
        id={`${id}-panel`}
        aria-labelledby={`${id}-tab-${index}`}
        className="flex items-baseline justify-between gap-3 pt-4 pb-1"
      >
        <p className="min-w-0">
          <span className="block font-[family-name:var(--font-sub)] text-[14px] tracking-[0.04em] text-ink uppercase">
            {active.label}
          </span>
          {active.note && (
            <span
              className="mt-1 block text-[12px] leading-[17px] font-normal text-ink/75"
              dangerouslySetInnerHTML={{ __html: active.note }}
            />
          )}
        </p>
        <p className="shrink-0 font-[family-name:var(--font-display)] text-[28px] leading-none text-ink">
          {active.price}
        </p>
      </div>
    </div>
  );
}
