"use client";

import { useState } from "react";
import Icon from "@/components/Icon";

/** The inner-page accordion. Same card treatment as the homepage FAQ. */
export default function FaqAccordion({
  items,
}: {
  items: { q: string; a: string[] }[];
}) {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <ul className="mt-7 flex flex-col gap-3">
      {items.map((item, i) => {
        const isOpen = open === i;
        return (
          <li
            key={item.q + i}
            className={`overflow-hidden rounded-[12px] transition-colors duration-300 ${
              isOpen
                ? "bg-white/[0.06] ring-1 ring-gold/30"
                : "bg-white/[0.03] ring-1 ring-white/[0.07]"
            }`}
          >
            <h3>
              <button
                type="button"
                onClick={() => setOpen(isOpen ? null : i)}
                aria-expanded={isOpen}
                className="flex w-full items-start justify-between gap-6 p-5 text-left text-[16px] leading-[25px] font-semibold text-white transition-colors hover:text-gold lg:text-[17px]"
              >
                <span>{item.q}</span>
                <span
                  className={`mt-1 shrink-0 text-gold transition-transform duration-300 ${
                    isOpen ? "rotate-45" : ""
                  }`}
                >
                  <Icon name="plus" size={18} strokeWidth={2} />
                </span>
              </button>
            </h3>

            <div
              className={`grid transition-[grid-template-rows] duration-300 ease-out ${
                isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
              }`}
            >
              <div className="overflow-hidden">
                <div className="px-5 pb-5">
                  {item.a.map((p, j) => (
                    <p
                      key={j}
                      className="measure mt-2 text-[15px] leading-[25px] font-normal text-white/70 [&_a]:text-gold [&_a:hover]:underline"
                      dangerouslySetInnerHTML={{ __html: p }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
