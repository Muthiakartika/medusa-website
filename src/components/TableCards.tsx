"use client";

import { useId, useState } from "react";
import Icon from "@/components/Icon";
import { isTick, shortLabel, type TableModel } from "@/lib/table-model";

/**
 * A comparison table, read one package at a time.
 *
 * `components/Blocks.tsx` renders the real `<table>` wherever the container is
 * wide enough for it and this wherever it is not. The two are the same
 * content: every feature row, in source order, with its group dividers and its
 * trailing price ladder. What changes is that the reader picks a column
 * instead of scrolling to it, and a feature's explanation opens on demand
 * instead of setting the row four hundred pixels tall.
 *
 * The tab strip is the picker from `components/PriceTabs.tsx` — the same
 * control the vehicle-class ladders use — so a page that carries both reads as
 * one idea rather than two.
 */
export default function TableCards({ model }: { model: TableModel }) {
  const [index, setIndex] = useState(0);
  const id = useId();

  const many = model.valueCount > 1;
  const col = Math.min(index, model.valueCount - 1);
  const title = model.headers[0]?.[col];
  const subtitle = model.headers[1]?.[col];
  const notes = model.rows.filter((r) => r.kind === "note");

  return (
    <div className="px-4 py-4">
      {many && (
        <div
          role="tablist"
          aria-label="Package"
          className="flex flex-wrap gap-1 rounded-[10px] bg-ink p-1"
        >
          {model.headers[0]?.map((full, i) => {
            const on = i === col;
            return (
              <button
                key={full + i}
                type="button"
                role="tab"
                id={`${id}-tab-${i}`}
                aria-selected={on}
                aria-controls={`${id}-panel`}
                onClick={() => setIndex(i)}
                className={`flex min-h-[44px] min-w-[64px] flex-1 basis-[calc(33.333%-3px)] items-center justify-center rounded-[7px] px-2 font-[family-name:var(--font-ui)] text-[11px] font-semibold tracking-[0.03em] whitespace-nowrap uppercase transition-colors duration-200 ${
                  on ? "bg-gold text-ink" : "text-white/70 hover:bg-white/[0.08]"
                }`}
              >
                {shortLabel(full)}
              </button>
            );
          })}
        </div>
      )}

      <div
        role={many ? "tabpanel" : undefined}
        id={many ? `${id}-panel` : undefined}
        aria-labelledby={many ? `${id}-tab-${col}` : undefined}
      >
        {/*
          The heading the source wrote, in full. The tab above it is an
          abbreviation for the sake of the chip row; this is the name.
        */}
        {title && (
          <div className={many ? "pt-5 pb-1" : "pb-1"}>
            <p className="font-[family-name:var(--font-sub)] text-[17px] leading-tight tracking-[0.02em] text-gold uppercase">
              {title}
            </p>
            {subtitle && (
              <p className="mt-1 font-[family-name:var(--font-ui)] text-[11.5px] tracking-[0.14em] text-white/55 uppercase">
                {subtitle}
              </p>
            )}
          </div>
        )}

        <ul className="mt-4">
          {model.rows.map((row, i) => {
            if (row.kind === "note") return null;

            if (row.kind === "group") {
              return (
                <li
                  key={i}
                  className="mt-6 border-b border-gold/30 pb-2 first:mt-0 font-[family-name:var(--font-sub)] text-[13px] tracking-[0.16em] text-gold/85 uppercase"
                >
                  {row.label}
                </li>
              );
            }

            const value = row.values[col] ?? "";
            const included = isTick(value);

            return (
              <li key={i} className="border-b border-white/[0.06]">
                <Row label={row.label} desc={row.desc} included={included} />
              </li>
            );
          })}
        </ul>

        {notes.map((note, i) => (
          <p
            key={i}
            className="mt-5 text-[13.5px] leading-[21px] font-normal text-white/55"
          >
            {note.values[col]}
          </p>
        ))}
      </div>
    </div>
  );
}

/**
 * One feature. The verdict is an icon rather than the source's `✔`/`-`
 * characters so it sits on the site's own stroke weight, and the explanation
 * is a disclosure: fifty-six rows of prose is what made this table fifty
 * screens tall.
 */
function Row({
  label,
  desc,
  included,
}: {
  label: string;
  desc?: string;
  included: boolean;
}) {
  const mark = (
    <span className="mt-px shrink-0" aria-hidden>
      <Icon
        name={included ? "check" : "minus"}
        size={16}
        className={included ? "text-gold" : "text-white/25"}
      />
    </span>
  );

  const name = (
    <span
      className={`min-w-0 flex-1 text-[14.5px] leading-[21px] ${
        included ? "font-medium text-white" : "font-normal text-white/50"
      }`}
    >
      {label}
    </span>
  );

  // A feature with nothing to explain must not look like it opens.
  if (!desc) {
    return (
      <p className="flex items-start gap-3 py-3.5">
        {mark}
        {name}
        <span className="sr-only">{included ? "Included" : "Not included"}</span>
      </p>
    );
  }

  return (
    <details>
      <summary className="flex cursor-pointer list-none items-start gap-3 py-3.5 [&::-webkit-details-marker]:hidden">
        {mark}
        {name}
        <span className="sr-only">{included ? "Included" : "Not included"}</span>
        <span className="disclosure-mark mt-0.5 shrink-0 text-white/35">
          <span data-when="closed">
            <Icon name="plus" size={15} />
          </span>
          <span data-when="open">
            <Icon name="minus" size={15} />
          </span>
        </span>
      </summary>
      <p className="disclosure pr-7 pb-4 pl-7 text-[13.5px] leading-[21px] font-normal text-body/80">
        {desc}
      </p>
    </details>
  );
}
