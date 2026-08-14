"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Settles content into place as it scrolls in. Deliberately quiet — the one
 * authored motion moment on this site is the hero, and everything else is
 * support that should not compete with it.
 *
 * Renders visible by default. The hidden start state is applied only after
 * mount, and only when `html.js` is set, so no-JS visitors and crawlers get
 * the finished page with no hidden content.
 */
export default function Reveal({
  children,
  as: Tag = "div",
  delay = 0,
  className = "",
}: {
  children: React.ReactNode;
  as?: "div" | "li" | "article" | "section" | "span";
  /** Stagger step, in units of 70ms. */
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLElement>(null);
  const [shown, setShown] = useState(true);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced || !("IntersectionObserver" in window)) return;

    // Already on screen at mount: leave it alone rather than flashing it out
    // and back in. Only content still below the fold animates.
    if (el.getBoundingClientRect().top < window.innerHeight) return;

    setShown(false);

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setShown(true);
            io.disconnect();
          }
        }
      },
      { rootMargin: "0px 0px -12% 0px" },
    );

    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <Tag
      // @ts-expect-error — one ref type across the small set of allowed tags
      ref={ref}
      data-shown={shown}
      style={{ "--i": delay } as React.CSSProperties}
      className={`reveal ${className}`}
    >
      {children}
    </Tag>
  );
}
