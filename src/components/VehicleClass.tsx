"use client";

import Image from "next/image";
import { createContext, useContext, useMemo, useState } from "react";
import { CAR_SIZES } from "@/lib/site";

/**
 * Vehicle class is a page-level choice, not a per-card one.
 *
 * The old layout put a four-slide carousel inside every package card, so
 * comparing an XL price across ten valeting packages meant thirty clicks
 * before you could read the row. Choosing once and having every price on the
 * page answer to it is both the faster read and the site's clearest vehicle
 * motif.
 */

type Ctx = { index: number; setIndex: (i: number) => void };

const VehicleClassContext = createContext<Ctx | null>(null);

export function VehicleClassProvider({ children }: { children: React.ReactNode }) {
  // Small car first, so the headline price matches the "from £X" the brand
  // advertises everywhere else.
  const [index, setIndex] = useState(0);
  const value = useMemo(() => ({ index, setIndex }), [index]);
  return (
    <VehicleClassContext.Provider value={value}>{children}</VehicleClassContext.Provider>
  );
}

export function useVehicleClass() {
  const ctx = useContext(VehicleClassContext);
  if (!ctx) throw new Error("useVehicleClass must be used inside VehicleClassProvider");
  return ctx;
}

/** The selector itself. `tone` follows the surface it sits on. */
export default function VehicleClassPicker({
  tone = "dark",
  label = "Your vehicle",
}: {
  tone?: "dark" | "gold";
  label?: string;
}) {
  const { index, setIndex } = useVehicleClass();
  const onGold = tone === "gold";

  return (
    <div
      role="group"
      aria-label="Vehicle class"
      className="flex w-full max-w-full flex-col gap-3 sm:inline-flex sm:w-auto"
    >
      <span
        className={`font-[family-name:var(--font-ui)] text-[11px] tracking-[0.22em] uppercase ${
          onGold ? "text-ink/85" : "text-white/70"
        }`}
      >
        {label}
      </span>

      {/*
        The panel is always ink, on gold bands too. Tinting it to match the
        surface left the unselected car icons as gold line art on gold — the
        three inactive classes all but disappeared. A dark panel gives the
        control one appearance everywhere and keeps the icons legible.
      */}
      {/* Grid, not flex-wrap: wrapping four chips on a narrow screen left the
          last one alone on its row and stretched to full width. */}
      <div className="grid grid-cols-2 gap-1 bg-ink p-1 ring-1 ring-white/10 sm:grid-cols-4">
        {CAR_SIZES.map((size, i) => {
          const active = i === index;
          return (
            <button
              key={size.label}
              type="button"
              onClick={() => setIndex(i)}
              aria-pressed={active}
              className={`group relative flex flex-col items-center gap-1 px-3 py-2.5 transition-colors duration-200 sm:min-w-[104px] ${
                active
                  ? "bg-gold text-ink"
                  : "text-white/80 hover:bg-white/[0.08]"
              }`}
            >
              <Image
                src={size.icon}
                alt=""
                width={200}
                height={120}
                // Gold line art reads well on the ink panel; on the active
                // gold chip it is knocked to solid black.
                className={`h-[30px] w-auto object-contain transition-[filter,opacity] duration-200 ${
                  active ? "brightness-0" : "opacity-80 group-hover:opacity-100"
                }`}
              />
              <span className="font-[family-name:var(--font-ui)] text-[11px] font-semibold tracking-[0.06em] whitespace-nowrap uppercase">
                {size.label.replace(" Car", "")}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/**
 * A price that answers to the current vehicle class. Set in the display face
 * so the number reads like a timing board rather than body copy.
 */
export function ClassPrice({
  prices,
  className = "",
  tone = "light",
}: {
  prices: readonly [number, number, number, number];
  className?: string;
  tone?: "light" | "dark";
}) {
  const { index } = useVehicleClass();
  return (
    <span className={`inline-flex items-start leading-none ${className}`}>
      <span
        className={`mt-[0.35em] mr-[0.06em] text-[0.44em] ${
          tone === "dark" ? "text-ink/60" : "text-gold"
        }`}
      >
        £
      </span>
      <span className="tabular-nums">{prices[index]}</span>
    </span>
  );
}
