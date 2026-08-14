"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import Icon from "@/components/Icon";
import Reveal from "@/components/Reveal";
import SectionHead from "@/components/SectionHead";
import { REVIEW_BADGES, TESTIMONIALS } from "@/lib/site";

/**
 * The second gold band. Type is ink — white on this gold measures 2.83:1 —
 * and the review sources sit on it as dark tiles.
 *
 * The quote box follows the height of whichever review is showing. The reviews
 * run from six lines to eleven on a phone, so a fixed height either clipped the
 * longest one into the controls below or left a stretch of empty gold under the
 * short ones.
 */
export default function Testimonials() {
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  const stack = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState<number>();

  useEffect(() => {
    if (paused) return;
    const id = setInterval(() => setI((p) => (p + 1) % TESTIMONIALS.length), 7000);
    return () => clearInterval(id);
  }, [paused]);

  useEffect(() => {
    const wrap = stack.current;
    if (!wrap) return;
    const measure = () => {
      const active = wrap.children[i] as HTMLElement | undefined;
      if (active) setHeight(active.offsetHeight);
    };
    measure();
    // Re-measure on viewport changes and on late webfont swap, both of which
    // reflow the quote to a different number of lines.
    const ro = new ResizeObserver(measure);
    for (const child of wrap.children) ro.observe(child);
    return () => ro.disconnect();
  }, [i]);

  return (
    <section
      className="bg-gold-wash w-full py-20 lg:py-28"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
    >
      <div className="shell">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-7">
            <SectionHead title="What Our Clients Say" tone="gold" />

            <div
              ref={stack}
              // `items-start` keeps each quote at its own content height —
              // stretched children would report the container's height back on
              // measure and the box could never resize.
              className="mt-8 grid items-start overflow-hidden transition-[height] duration-500 ease-[var(--ease-out-expo)]"
              style={height ? { height } : undefined}
            >
              {TESTIMONIALS.map((t, idx) => (
                <blockquote
                  key={idx}
                  aria-hidden={idx !== i}
                  className={`col-start-1 row-start-1 transition-[opacity,transform] duration-500 ${
                    idx === i
                      ? "translate-y-0 opacity-100"
                      : "pointer-events-none translate-y-3 opacity-0"
                  }`}
                >
                  <p className="font-[family-name:var(--font-heading)] text-[17px] leading-[28px] font-medium text-ink sm:text-[19px] sm:leading-[31px] lg:text-[22px] lg:leading-[35px]">
                    “{t}”
                  </p>
                </blockquote>
              ))}
            </div>

            <div className="mt-7 flex items-center gap-2">
              {TESTIMONIALS.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setI(idx)}
                  aria-label={`Show review ${idx + 1} of ${TESTIMONIALS.length}`}
                  aria-current={idx === i}
                  className="group flex min-h-[40px] items-center"
                >
                  <span
                    className={`block h-[5px] rounded-full transition-all duration-300 ${
                      idx === i ? "w-11 bg-ink" : "w-6 bg-ink/30 group-hover:bg-ink/60"
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          <ul className="flex flex-col gap-3 lg:col-span-5 lg:pt-4">
            {REVIEW_BADGES.map((b, idx) => (
              <Reveal
                key={idx}
                as="li"
                delay={idx}
                className="surface-on-gold flex items-center gap-4 p-4"
              >
                <Image
                  src={b.icon}
                  alt=""
                  width={100}
                  height={100}
                  className="h-[38px] w-[38px] shrink-0 object-contain"
                />
                <p className="flex-1 font-[family-name:var(--font-sub)] text-[18px] text-white">
                  {b.label}
                </p>
                <span className="flex gap-[3px]" aria-hidden>
                  {Array.from({ length: 5 }).map((_, s) => (
                    <Icon key={s} name="star" size={14} variant="solid" className="text-gold" />
                  ))}
                </span>
              </Reveal>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
