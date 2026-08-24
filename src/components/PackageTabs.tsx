"use client";

import { useId, useState } from "react";

/**
 * The tab set the extractor flattened, put back.
 *
 * `blocks-groups.tsx` explains how five panels reach the renderer as one
 * 99-block stack. Rendered flat, `/car-valeting`'s "Our Packages" is 14,908px
 * on a phone — the same 52 features written out five times — where the source
 * spends 4,608px showing one package at a time, and where the paragraph above
 * still says "Click on choice of package below".
 *
 * Every panel is in the DOM; the inactive ones are `hidden`. That is what the
 * source does too (`wpb_ui-tabs-hide`), and it is the difference between a tab
 * set and content loss: search engines still read all five, and so does the
 * page's own content check.
 *
 * The strip is the site's usual picker — the one on `PriceTabs` and the
 * vehicle-class control — so a page that carries three of them reads as one
 * idea rather than three.
 *
 * Panels arrive already rendered. A `renderBlocks` callback would be the
 * tidier shape and a server component cannot hand a function to a client one;
 * server-rendered nodes cross that boundary fine, and the blocks keep the
 * renderer's own context on the way through.
 */
export default function PackageTabs({
  panels,
}: {
  panels: {
    label: string;
    content: React.ReactNode;
    /** Solid fill for this tab's selected state. Plain gold when omitted,
     *  so a tab set with no tier meaning still gets the site's usual chip. */
    accent?: string;
  }[];
}) {
  const [index, setIndex] = useState(0);
  const id = useId();

  return (
    <div className="@container mt-7">
      {/*
        A grid, not `flex-wrap`. Five tabs wrapped three-and-two, and the two
        on the second row grew to half the width each — Triton arrived as a
        gold slab twice the size of Zeus. Equal columns keep all five the same
        chip whatever the width.

        The 2px gold edge is `VehicleClassPicker`'s, for its reason: this strip
        sits on the section's own black rather than inside a panel, and at a
        white hairline the control dissolved into the background and read as
        five loose words.
      */}
      <div
        role="tablist"
        aria-label="Package"
        className="grid grid-cols-5 gap-1 rounded-[12px] bg-ink p-1 ring-2 ring-gold/45"
      >
        {panels.map((panel, i) => {
          const on = i === index;
          return (
            <button
              key={panel.label + i}
              type="button"
              role="tab"
              id={`${id}-tab-${i}`}
              aria-selected={on}
              aria-controls={`${id}-panel-${i}`}
              onClick={() => setIndex(i)}
              style={on ? { backgroundColor: panel.accent ?? "var(--color-gold)" } : undefined}
              className={`flex min-h-[44px] items-center justify-center rounded-[8px] px-1 font-[family-name:var(--font-ui)] text-[10px] font-semibold tracking-[0.02em] whitespace-nowrap uppercase transition-colors duration-200 @min-[420px]:text-[11px] @min-[420px]:tracking-[0.04em] ${
                on ? "text-ink" : "text-white/70 hover:bg-white/[0.08]"
              }`}
            >
              {panel.label}
            </button>
          );
        })}
      </div>

      {panels.map((panel, i) => (
        <div
          key={panel.label + i}
          role="tabpanel"
          id={`${id}-panel-${i}`}
          aria-labelledby={`${id}-tab-${i}`}
          hidden={i !== index}
          /*
            The panel's own first block (a heading, always) zeroes its top
            margin via `first:mt-0` in Blocks.tsx — right for a block sitting
            under a section's own top padding, which is where that rule
            normally lives, but this panel sits under the tab strip instead
            with nothing else providing the gap. `pt-7` matches the `mt-7`
            already above the strip, so the tabs read as centred chrome
            rather than glued to the panel beneath them.
          */
          className="pt-7"
        >
          {panel.content}
        </div>
      ))}
    </div>
  );
}
