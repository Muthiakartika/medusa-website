"use client";

import { useState } from "react";
import Icon from "@/components/Icon";
import Reveal from "@/components/Reveal";
import SectionHead from "@/components/SectionHead";
import { CONTACT, FAQ } from "@/lib/site";

export default function Faq() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <section className="w-full bg-black py-20 lg:py-28">
      <div className="shell">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-4">
            <div className="lg:sticky lg:top-32">
              <SectionHead title="FAQs" />
              <Reveal delay={3}>
                <p className="measure mt-6 text-[15px] leading-[25px] font-normal text-white/65">
                  Something not covered here? Call{" "}
                  <a
                    href={`tel:${CONTACT.phone}`}
                    className="text-gold transition-colors hover:text-gold-bright"
                  >
                    {CONTACT.phone}
                  </a>{" "}
                  or email{" "}
                  <a
                    href={`mailto:${CONTACT.email}`}
                    className="break-all text-gold transition-colors hover:text-gold-bright"
                  >
                    {CONTACT.email}
                  </a>
                  .
                </p>
              </Reveal>
            </div>
          </div>

          <ul className="flex flex-col gap-3 lg:col-span-8">
            {FAQ.map((item, i) => {
              const isOpen = open === i;
              return (
                <Reveal
                  key={item.q}
                  as="li"
                  delay={Math.min(i, 4)}
                  className={`block overflow-hidden rounded-[12px] transition-colors duration-300 ${
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
                            className="measure mt-2 text-[15px] leading-[25px] font-normal text-white/70"
                          >
                            {p}
                          </p>
                        ))}
                      </div>
                    </div>
                  </div>
                </Reveal>
              );
            })}
          </ul>
        </div>
      </div>
    </section>
  );
}
