"use client";

import { useEffect, useState } from "react";
import Icon from "@/components/Icon";
import { Sections } from "@/components/Blocks";
import { group } from "@/components/blocks-groups";
import type { Page } from "@/lib/blocks";
import { BOOK_URL, CONTACT } from "@/lib/site";

/**
 * Two alternative treatments for a service page, for comparison against the
 * shipped one. Both take the same extracted content and the same components —
 * only the page-level scaffolding differs.
 *
 *   conversion — the page as a sales sheet: the cheapest price and the booking
 *                action follow you down the scroll instead of living in one
 *                band you have to find again.
 *   editorial  — the page as a magazine feature: a sticky contents rail, and
 *                gold on every other section rather than only where there is a
 *                commercial moment.
 */

/** Lowest price on the page, read from the price table the renderer builds. */
function fromPrice(page: Page): string | null {
  const prices: number[] = [];
  const walk = (blocks: Parameters<typeof group>[0]) => {
    for (const g of group(blocks)) {
      if (g.kind === "priceGrid") {
        for (const it of g.items) {
          const n = Number(it.price.replace(/[^\d.]/g, ""));
          if (n) prices.push(n);
        }
      } else if (g.kind === "addonCards") {
        for (const c of g.cards) walk(c.rest);
      } else if (g.kind === "block" && g.block.type === "columns") {
        g.block.cols.forEach(walk);
      }
    }
  };
  page.sections.forEach((s) => walk(s.blocks));
  return prices.length ? `£${Math.min(...prices)}` : null;
}

/** The page's own section headings, for the contents rail. */
function anchors(page: Page) {
  const out: string[] = [];
  const walk = (blocks: Page["sections"][number]["blocks"]) => {
    for (const b of blocks) {
      if (b.type === "heading" && b.level === 2 && !/^\s*£/.test(b.text)) out.push(b.text);
      if (b.type === "columns") b.cols.forEach(walk);
    }
  };
  page.sections.forEach((s) => walk(s.blocks));
  return [...new Set(out)];
}

const slugify = (s: string) =>
  s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 40);

export default function ServicePreview({
  page,
  variant,
}: {
  page: Page;
  variant: "conversion" | "editorial";
}) {
  const price = fromPrice(page);

  return variant === "conversion" ? (
    <Conversion page={page} price={price} />
  ) : (
    <Editorial page={page} price={price} />
  );
}

/* ── A · Conversion ───────────────────────────────────────────────────────
   Everything a visitor needs to book stays on screen. The bar appears once
   the header hero has scrolled past, so it never competes with the h1. */

function Conversion({ page, price }: { page: Page; price: string | null }) {
  const [stuck, setStuck] = useState(false);

  useEffect(() => {
    const onScroll = () => setStuck(window.scrollY > 620);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <Sections sections={page.sections} slug={page.slug} />

      <div
        className={`fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-ink/95 backdrop-blur transition-transform duration-300 ${
          stuck ? "translate-y-0" : "translate-y-full"
        }`}
      >
        <div className="shell-article flex items-center justify-between gap-4 py-3.5">
          <div className="min-w-0">
            <p className="truncate font-[family-name:var(--font-sub)] text-[15px] text-white uppercase sm:text-[17px]">
              {page.h1}
            </p>
            {price && (
              <p className="text-[13px] font-normal text-white/60">
                From{" "}
                <span className="font-[family-name:var(--font-display)] text-[15px] text-gold">
                  {price}
                </span>
              </p>
            )}
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <a
              href={`tel:${CONTACT.phone}`}
              aria-label={`Call ${CONTACT.phone}`}
              className="hidden h-11 w-11 items-center justify-center rounded-full text-white/75 ring-1 ring-white/15 transition-colors hover:text-gold sm:flex"
            >
              <Icon name="phone" size={18} />
            </a>
            <a href={BOOK_URL} className="btn btn-gold rounded-full px-6">
              Book Now
              <Icon name="arrow" size={17} className="ml-2" />
            </a>
          </div>
        </div>
      </div>
    </>
  );
}

/* ── B · Editorial ────────────────────────────────────────────────────────
   A contents rail under the header, and a louder gold rhythm. Long service
   pages become navigable rather than a single scroll. */

function Editorial({ page, price }: { page: Page; price: string | null }) {
  const items = anchors(page);
  const [active, setActive] = useState<string | null>(null);

  useEffect(() => {
    const heads = [...document.querySelectorAll("main h2")].filter(
      (h) => !/^\s*£/.test(h.textContent ?? ""),
    );
    heads.forEach((h) => {
      if (!h.id) h.id = slugify(h.textContent ?? "");
    });
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setActive(e.target.id);
      },
      { rootMargin: "-140px 0px -70% 0px" },
    );
    heads.forEach((h) => io.observe(h));
    return () => io.disconnect();
  }, []);

  return (
    <>
      {/* Contents rail — sits below the fixed header. */}
      <div className="sticky top-[90px] z-30 border-y border-white/10 bg-ink/92 backdrop-blur">
        <div className="shell-article flex items-center gap-5 overflow-x-auto py-3">
          <span className="shrink-0 font-[family-name:var(--font-ui)] text-[11px] tracking-[0.16em] text-white/60 uppercase">
            On this page
          </span>
          <nav className="flex items-center gap-1">
            {items.map((t) => {
              const id = slugify(t);
              return (
                <a
                  key={id}
                  href={`#${id}`}
                  className={`shrink-0 rounded-full px-3.5 py-2 text-[13px] whitespace-nowrap transition-colors ${
                    active === id
                      ? "bg-gold text-ink"
                      : "text-white/70 hover:bg-white/[0.07] hover:text-white"
                  }`}
                >
                  {t.replace(/:$/, "").slice(0, 34)}
                </a>
              );
            })}
          </nav>
          {price && (
            <a
              href={BOOK_URL}
              className="btn btn-gold ml-auto hidden shrink-0 rounded-full px-5 py-2 text-[12px] lg:inline-flex"
            >
              Book from {price}
            </a>
          )}
        </div>
      </div>

      <Sections sections={page.sections} slug={page.slug} bands="alternate" />
    </>
  );
}
