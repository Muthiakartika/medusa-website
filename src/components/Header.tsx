"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { BOOK_URL, CONTACT, NAV, type NavItem } from "@/lib/site";

/** Salient's `data-format=centered-menu` header: transparent over the hero,
 *  solid #1f1f1f once scrolled, 130px tall shrinking to 90px. */
export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  /* Mobile: a list rather than a single label, because the drawer now goes
     three deep and a column has to stay open while its child expands. */
  const [expanded, setExpanded] = useState<string[]>([]);
  /* Desktop: which top-level item currently has a panel down — the Services
     mega-menu or one of the small drop-downs. Both solidify the bar, so a
     panel never opens against a transparent header over the hero. */
  const [mega, setMega] = useState<string | null>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* Lock the page behind the drawer.

     The lock goes on <html>, not <body>: globals.css deliberately keeps the
     scroll container on the root element so that window.scrollY still reports
     the page position for the header's scrolled state. Setting body's overflow
     — the usual reflex — therefore locks nothing at all.

     overflow-y alone, so the root keeps the `overflow-x: clip` that contains
     horizontal bleed without turning into a scroll container and killing every
     `position: sticky` on the page. */
  useEffect(() => {
    if (!open) return;
    const root = document.documentElement;
    const previous = root.style.overflowY;
    root.style.overflowY = "hidden";
    return () => {
      root.style.overflowY = previous;
    };
  }, [open]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setMega(null);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const megaItem = NAV.find((i) => i.mega && i.label === mega);

  return (
    <header
      /* The panel lives inside the header, so leaving the header is the one
         event that closes it — no timers, and the gap between the trigger and
         the panel is inside the hover target rather than a dead zone. */
      onMouseLeave={() => setMega(null)}
      className={`fixed inset-x-0 top-0 z-50 transition-[background-color,height,box-shadow] duration-300 ${
        scrolled || mega
          ? "bg-[#1f1f1f] shadow-[0_2px_20px_rgba(0,0,0,0.6)]"
          : "bg-transparent"
      }`}
    >
      <div
        // Same container as the section shell, so the logo lines up with the
        // left edge of every heading below it — as on the live site.
        className={`mx-auto flex max-w-[2000px] items-center justify-between gap-6 px-[6%] transition-[height] duration-300 lg:px-[90px] ${
          scrolled ? "h-[90px]" : "h-[110px] xl:h-[130px]"
        }`}
      >
        {/* Logo */}
        <Link href="/" className="relative z-10 shrink-0" aria-label="Medusa Auto Detailing — home">
          <Image
            src="/assets/2021/12/4-e1639638656209.webp"
            alt="Mobile Car Detailing &amp; Valeting"
            width={618}
            height={400}
            priority
            className={`w-auto transition-[height] duration-300 ${
              scrolled ? "h-[40px]" : "h-[50px]"
            }`}
          />
        </Link>

        {/* Desktop nav */}
        {/* Stretched to the full height of the bar so that a drop-down anchored
            to `top-full` opens flush with the bottom of the header, exactly
            where the mega-menu opens — and so the space between a label and its
            panel belongs to the item rather than being a gap that drops the
            hover. */}
        <nav className="hidden self-stretch xl:block">
          <ul className="flex h-full items-stretch gap-x-4 2xl:gap-x-7">
            {NAV.map((item) =>
              item.mega ? (
                <MegaTrigger
                  key={item.label}
                  item={item}
                  open={mega === item.label}
                  onOpen={() => setMega(item.label)}
                />
              ) : (
                <DesktopItem
                  key={item.label}
                  item={item}
                  onHover={() => setMega(item.children ? item.label : null)}
                />
              ),
            )}
            <li className="flex items-center">
              {/* `whitespace-nowrap` to match every other nav link — without
                  it this is the one item that can break mid-label, and "BOOK
                  NOW" split across two lines pushed the row out of alignment. */}
              <a
                href={BOOK_URL}
                onMouseEnter={() => setMega(null)}
                className="font-[family-name:var(--font-nav)] text-[14px] whitespace-nowrap text-white uppercase transition-colors hover:text-gold"
              >
                Book Now
              </a>
            </li>
            <li className="flex items-center">
              <a
                href={CONTACT.facebook}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="-m-2.5 flex p-2.5 text-white transition-colors hover:text-gold"
              >
                <FacebookIcon />
              </a>
            </li>
          </ul>
        </nav>

        {/* Mobile toggle */}
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          className="relative z-10 flex h-10 w-10 flex-col items-center justify-center gap-[6px] xl:hidden"
        >
          <span
            className={`block h-[2px] w-[26px] bg-white transition-transform duration-300 ${
              open ? "translate-y-[8px] rotate-45" : ""
            }`}
          />
          <span
            className={`block h-[2px] w-[26px] bg-white transition-opacity duration-200 ${
              open ? "opacity-0" : ""
            }`}
          />
          <span
            className={`block h-[2px] w-[26px] bg-white transition-transform duration-300 ${
              open ? "-translate-y-[8px] -rotate-45" : ""
            }`}
          />
        </button>
      </div>

      {/* Desktop mega-menu — the six service columns, full bleed under the bar */}
      <div
        className={`absolute inset-x-0 top-full hidden border-t border-white/10 bg-[#0d0d0d] shadow-[0_20px_40px_rgba(0,0,0,0.6)] transition-[opacity,transform] duration-200 xl:block ${
          megaItem
            ? "visible translate-y-0 opacity-100"
            : "invisible -translate-y-2 opacity-0"
        }`}
      >
        {megaItem && (
          <div className="mx-auto grid max-w-[2000px] grid-cols-6 grid-rows-[auto_auto] gap-x-8 px-[6%] py-11 lg:px-[90px]">
            {megaItem.children?.map((column) => (
              <MegaColumn key={column.label} column={column} />
            ))}
          </div>
        )}
      </div>

      {/* Mobile drawer */}
      <div
        /* `overscroll-contain` so that reaching the end of the drawer does not
           hand the gesture on to the page underneath — the root lock already
           stops that everywhere except iOS Safari, which needs both. */
        className={`overflow-y-auto overscroll-contain bg-[#0d0d0d] transition-[max-height] duration-500 xl:hidden ${
          open ? "max-h-[calc(100vh-90px)]" : "max-h-0"
        }`}
      >
        <ul className="px-6 pb-10">
          {NAV.map((item) => (
            <MobileItem
              key={item.label}
              item={item}
              path={item.label}
              depth={0}
              expanded={expanded}
              setExpanded={setExpanded}
              close={() => setOpen(false)}
            />
          ))}
          <li className="pt-6">
            <a
              href={BOOK_URL}
              className="btn btn-gold w-full font-[family-name:var(--font-nav)]"
            >
              Book Now
            </a>
          </li>
          <li className="flex gap-4 pt-6">
            <a
              href={CONTACT.facebook}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Facebook"
              className="-m-3 flex p-3 text-white transition-colors hover:text-gold"
            >
              <FacebookIcon />
            </a>
            <a
              href={CONTACT.instagram}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              className="-m-3 flex p-3 text-white transition-colors hover:text-gold"
            >
              <InstagramIcon />
            </a>
          </li>
        </ul>
      </div>
    </header>
  );
}

/* ── Desktop ──────────────────────────────────────────────────────────── */

const TOP_LINK =
  "relative block whitespace-nowrap py-[10px] font-[family-name:var(--font-nav)] text-[14px] uppercase text-white transition-colors hover:text-gold";

/** Salient's animated_underline hover effect. */
function Underline({ on }: { on?: boolean }) {
  return (
    <span
      className={`absolute inset-x-0 -bottom-[2px] h-[2px] origin-left bg-gold transition-transform duration-300 ${
        on ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
      }`}
    />
  );
}

/** "Services" — a label, not a destination, so it is a button. */
function MegaTrigger({
  item,
  open,
  onOpen,
}: {
  item: NavItem;
  open: boolean;
  onOpen: () => void;
}) {
  return (
    <li className="group flex items-center">
      <button
        type="button"
        aria-expanded={open}
        onMouseEnter={onOpen}
        onFocus={onOpen}
        onClick={onOpen}
        className={`${TOP_LINK} ${open ? "text-gold" : ""}`}
      >
        {item.label}
        <Underline on={open} />
      </button>
    </li>
  );
}

function MegaColumn({ column }: { column: NavItem }) {
  const head = (
    <span className="font-[family-name:var(--font-nav)] text-[13px] tracking-[0.08em] text-gold uppercase">
      {column.label}
    </span>
  );

  return (
    /* Two subgrid rows - head, then list - so every column starts its list on
       the same line once a head as long as "Repairs & Restoration" wraps to
       two. The row only grows when one of them actually wraps. */
    <div className="row-span-2 grid grid-rows-subgrid">
      {/* A column head with no page behind it stays a heading rather than
          becoming a link to a 404. */}
      <div>
        {column.href ? (
          <Link href={column.href} className="group/head inline-block pb-1">
            {head}
            <span className="mt-[3px] block h-[1px] origin-left scale-x-0 bg-gold transition-transform duration-300 group-hover/head:scale-x-100" />
          </Link>
        ) : (
          <span className="inline-block pb-1">{head}</span>
        )}
      </div>

      <ul className="mt-4 space-y-[10px]">
        {column.children?.map((child) => (
          <li key={child.label}>
            <MegaLink item={child} />
            {child.children && (
              <ul className="mt-[10px] ml-2 space-y-[10px] border-l border-white/10 pl-3">
                {child.children.map((sub) => (
                  <li key={sub.label}>
                    <MegaLink item={sub} sub />
                  </li>
                ))}
              </ul>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

function MegaLink({ item, sub }: { item: NavItem; sub?: boolean }) {
  const size = sub ? "text-[13px] text-[#8f8f8f]" : "text-[14px] text-[#bdbdbd]";
  if (!item.href) {
    return <span className={`block leading-snug ${size} opacity-60`}>{item.label}</span>;
  }
  return (
    <Link
      href={item.href}
      className={`block leading-snug transition-colors hover:text-gold ${size}`}
    >
      {item.label}
    </Link>
  );
}

/** Everything that is not the mega-menu: a plain link, or a small drop-down. */
function DesktopItem({ item, onHover }: { item: NavItem; onHover: () => void }) {
  return (
    <li className="group relative flex items-center" onMouseEnter={onHover}>
      <a href={item.href} className={TOP_LINK}>
        {item.label}
        <Underline />
      </a>

      {item.children && (
        /* The same surface, offset and motion as the mega-menu panel, so the
           two kinds of drop-down read as one component at two widths. */
        <ul className="invisible absolute top-full left-1/2 z-50 w-[280px] -translate-x-1/2 -translate-y-2 space-y-[10px] border-t border-white/10 bg-[#0d0d0d] px-7 py-8 opacity-0 shadow-[0_20px_40px_rgba(0,0,0,0.6)] transition-[opacity,transform] duration-200 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100">
          {item.children.map((c) => (
            <li key={c.label}>
              <MegaLink item={c} />
            </li>
          ))}
        </ul>
      )}
    </li>
  );
}

/* ── Mobile ───────────────────────────────────────────────────────────── */

/** One drawer row and, if it has any, its children — recursive, so the same
 *  component serves all three levels the new structure needs. */
function MobileItem({
  item,
  path,
  depth,
  expanded,
  setExpanded,
  close,
}: {
  item: NavItem;
  path: string;
  depth: number;
  expanded: string[];
  setExpanded: (fn: (prev: string[]) => string[]) => void;
  close: () => void;
}) {
  const isOpen = expanded.includes(path);
  const toggle = () =>
    setExpanded((prev) =>
      prev.includes(path) ? prev.filter((p) => p !== path) : [...prev, path],
    );

  /* The nav face carries the structure — top-level items and column heads —
     and the body face carries the service names, matching the mega-menu.
     Audiowide is wide enough that the longer names ("Sickness & Biohazard
     Cleaning") wrap to two lines in a six-column grid, so the split is a
     legibility call as much as a stylistic one. */
  const label =
    depth === 0
      ? "py-4 font-[family-name:var(--font-nav)] text-[14px] uppercase text-white"
      : depth === 1
        ? "py-3 font-[family-name:var(--font-nav)] text-[13px] uppercase text-gold"
        : depth === 2
          ? "py-3 text-[14px] text-[#bdbdbd]"
          : "py-3 text-[13px] text-[#8f8f8f]";

  return (
    <li className={depth === 0 ? "border-b border-white/10" : ""}>
      <div className="flex items-center justify-between" style={{ paddingLeft: depth * 14 }}>
        {item.href ? (
          <a
            href={item.href}
            onClick={() => !item.children && close()}
            className={`flex-1 ${label}`}
          >
            {item.label}
          </a>
        ) : (
          <button
            type="button"
            onClick={item.children ? toggle : undefined}
            className={`flex-1 text-left ${label} ${item.children ? "" : "opacity-60"}`}
          >
            {item.label}
          </button>
        )}
        {item.children && (
          <button
            type="button"
            aria-label={`Toggle ${item.label} submenu`}
            aria-expanded={isOpen}
            onClick={toggle}
            className="p-4 text-gold"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 14 14"
              fill="none"
              className={`transition-transform duration-300 ${isOpen ? "rotate-45" : ""}`}
            >
              <path d="M7 1v12M1 7h12" stroke="currentColor" strokeWidth="2" />
            </svg>
          </button>
        )}
      </div>

      {item.children && (
        /* `grid-rows` rather than a max-height guess: the Services branch is
           forty rows deep and no fixed ceiling fits every branch. */
        <div
          className={`grid transition-[grid-template-rows] duration-500 ${
            isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
          }`}
        >
          <ul className="overflow-hidden">
            {item.children.map((child) => (
              <MobileItem
                key={child.label}
                item={child}
                path={`${path}/${child.label}`}
                depth={depth + 1}
                expanded={expanded}
                setExpanded={setExpanded}
                close={close}
              />
            ))}
          </ul>
        </div>
      )}
    </li>
  );
}

function FacebookIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M22 12.06C22 6.5 17.52 2 12 2S2 6.5 2 12.06c0 5.02 3.66 9.18 8.44 9.94v-7.03H7.9v-2.91h2.54V9.85c0-2.52 1.49-3.91 3.77-3.91 1.09 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.78-1.63 1.57v1.89h2.78l-.45 2.91h-2.33V22c4.78-.76 8.44-4.92 8.44-9.94Z" />
    </svg>
  );
}

function InstagramIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 2.16c3.2 0 3.58.01 4.85.07 1.17.05 1.8.25 2.23.41.56.22.96.48 1.38.9.42.42.68.82.9 1.38.16.42.36 1.06.41 2.23.06 1.27.07 1.65.07 4.85s-.01 3.58-.07 4.85c-.05 1.17-.25 1.8-.41 2.23-.22.56-.48.96-.9 1.38-.42.42-.82.68-1.38.9-.42.16-1.06.36-2.23.41-1.27.06-1.65.07-4.85.07s-3.58-.01-4.85-.07c-1.17-.05-1.8-.25-2.23-.41-.56-.22-.96-.48-1.38-.9-.42-.42-.68-.82-.9-1.38-.16-.42-.36-1.06-.41-2.23C2.17 15.58 2.16 15.2 2.16 12s.01-3.58.07-4.85c.05-1.17.25-1.8.41-2.23.22-.56.48-.96.9-1.38.42-.42.82-.68 1.38-.9.42-.16 1.06-.36 2.23-.41C8.42 2.17 8.8 2.16 12 2.16Zm0 5.68a4.16 4.16 0 1 0 0 8.32 4.16 4.16 0 0 0 0-8.32Zm0 6.86a2.7 2.7 0 1 1 0-5.4 2.7 2.7 0 0 1 0 5.4Zm5.3-7.02a.97.97 0 1 1-1.94 0 .97.97 0 0 1 1.94 0Z" />
    </svg>
  );
}
