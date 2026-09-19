"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import Reveal from "@/components/Reveal";
import SectionHead from "@/components/SectionHead";

/**
 * The A–Z index of a set of location pages.
 *
 * Client, 2026-09-17: "Each of these mains will have a navigational widget
 * added at the very bottom of the page, just above the footer. We will use the
 * same navigation widget as on https://seoboost.co.id/services/seo" — against
 * `/car-detailing/`, `/mobile-car-wash/` and `/car-valeting/`, each listing
 * "their corresponding location child pages"; then, the same day, "terapkan ke
 * yg lain juga yg ada lokasi" — everywhere else that has locations. That is
 * `/our-locations/`, whose children are the nineteen borough hubs, and the 195
 * location pages themselves, each of which lists its siblings.
 *
 * The widget is a search box, a row of letter keys and a scrolling list grouped
 * by initial, and this is the same control in this site's own language. Two
 * deliberate differences from the reference: its rows are buttons that scroll
 * an anchor on the same page, where a location here is a page of its own, so
 * these are real links — the index is a page's internal linking to its
 * neighbours as much as it is a control; and the whole list is in the
 * server-rendered HTML, so a crawler and a visitor with no JavaScript get every
 * link. Filtering only hides rows that are already there.
 *
 * It writes no copy. Every name in it is `placeName()` off a slug the site
 * already publishes, so there is nothing here to keep in step with
 * `pages.json` — add a location page to a family and it appears.
 */

const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

/** The key a place files under: its initial, or "#" for a name starting with a digit. */
const initialOf = (name: string) => {
  const c = name.trim().charAt(0).toUpperCase();
  return c >= "A" && c <= "Z" ? c : "#";
};

export default function LocationIndex({
  locations,
  /**
   * The list's own title — the service these places are pages for. Left off
   * when the section above is already wearing it, so the card does not say the
   * same thing twice.
   */
  title,
}: {
  locations: { slug: string; name: string }[];
  title?: string;
}) {
  const [query, setQuery] = useState("");
  const boxRef = useRef<HTMLDivElement>(null);
  const groupRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const frame = useRef(0);

  useEffect(() => () => cancelAnimationFrame(frame.current), []);

  const groups = useMemo(() => {
    const q = query.trim().toLowerCase();
    const matched = q
      ? locations.filter((l) => l.name.toLowerCase().includes(q))
      : locations;

    const by = new Map<string, typeof matched>();
    for (const item of matched) {
      const key = initialOf(item.name);
      const bucket = by.get(key);
      if (bucket) bucket.push(item);
      else by.set(key, [item]);
    }
    return [...by.entries()].sort(([a], [b]) => a.localeCompare(b));
  }, [locations, query]);

  const shown = groups.reduce((n, [, items]) => n + items.length, 0);

  /* The letters the list is currently showing a group for. Every other key is
     dead rather than missing: all 26 always stand, so the row never reflows
     under the pointer, and a letter with nothing behind it cannot be pressed.
     Under a search that means the keys dim down to the matches, which is also
     what stops a key from pointing at a group that is no longer rendered. */
  const live = useMemo(() => new Set(groups.map(([letter]) => letter)), [groups]);

  /*
    Scroll the list, not the page.

    `scrollIntoView` is out: it takes the window with it and leaves the widget
    half off screen — measured, the page moved 92px. That leaves the container's
    own scroll, and the container is `relative`, so a group's `offsetTop` is
    already the distance to scroll to.

    The tween is written out rather than left to `behavior: "smooth"` so the
    curve is the system's own `--ease-out-expo` — the same easing every other
    transition on the site uses — instead of the browser's. A visitor who has
    asked for less motion gets the jump with no animation at all.
  */
  const jumpTo = (letter: string) => {
    const box = boxRef.current;
    const group = groupRefs.current[letter];
    if (!box || !group) return;

    const from = box.scrollTop;
    const to = group.offsetTop;
    cancelAnimationFrame(frame.current);
    if (from === to) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      box.scrollTop = to;
      return;
    }

    // The first frame's own timestamp starts the clock, so nothing is read off
    // the clock while rendering.
    let began = 0;
    const step = (now: number) => {
      if (!began) began = now;
      const t = Math.min(1, (now - began) / 420);
      const eased = t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
      box.scrollTop = from + (to - from) * eased;
      if (t < 1) frame.current = requestAnimationFrame(step);
    };
    frame.current = requestAnimationFrame(step);
  };

  return (
    <div>
      <label className="block">
        <span className="sr-only">Search locations</span>
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search locations…"
          /* 16px, not the 15px the rest of the card is set in. Below 16px iOS
             Safari zooms the page when the field takes focus, and it does not
             zoom back out: the reader taps search and the layout jumps to about
             1.07x with the right edge of the page off screen. It is the one
             control on these 199 pages, which is why the client could report
             this as happening on the location pages and the three service hubs
             and nowhere else. No `maximum-scale` in the viewport meta to stop
             it with, either — that would disable pinch-zoom for everyone, which
             is a real accessibility cost to fix a 1px type decision. */
          className="w-full rounded-[12px] bg-white/[0.05] px-4 py-3 text-[16px] font-normal text-white ring-1 ring-white/10 transition-colors outline-none placeholder:text-white/40 focus:bg-white/[0.07] focus:ring-gold"
        />
      </label>

      <div className="mt-5 flex flex-wrap gap-1.5" role="group" aria-label="Jump to a letter">
        {LETTERS.map((letter) => {
          const has = live.has(letter);
          return (
            <button
              key={letter}
              type="button"
              disabled={!has}
              onClick={() => jumpTo(letter)}
              aria-label={`Jump to ${letter}`}
              className={`h-9 w-9 rounded-[9px] text-[13.5px] font-normal transition-all duration-200 ease-[var(--ease-out-expo)] ${
                has
                  ? "bg-white/[0.06] text-white/80 ring-1 ring-white/10 hover:-translate-y-0.5 hover:bg-gold hover:text-ink hover:ring-gold active:translate-y-0"
                  : "cursor-default bg-white/[0.02] text-white/20 ring-1 ring-white/[0.04]"
              }`}
            >
              {letter}
            </button>
          );
        })}
      </div>

      <div className="surface mt-5 p-5">
        {/* Side by side where there is room; on a phone the title runs to two
            lines of capitals and the count is pushed under it rather than
            wrapping into "32 / locations". */}
        <div className="flex flex-col gap-1 border-b border-white/[0.07] pb-4 sm:flex-row sm:items-baseline sm:justify-between sm:gap-4">
          {title && (
            <h3 className="font-[family-name:var(--font-sub)] text-[17px] leading-tight text-white uppercase">
              {title}
            </h3>
          )}
          <p aria-live="polite" className="shrink-0 text-[13px] font-normal text-white/50">
            {shown === locations.length
              ? `${locations.length} locations`
              : `${shown} of ${locations.length}`}
          </p>
        </div>

        <div
          ref={boxRef}
          className="relative mt-4 max-h-[420px] overflow-y-auto overscroll-contain pr-1"
        >
          {groups.map(([letter, items]) => (
            <div
              key={letter}
              ref={(el) => {
                groupRefs.current[letter] = el;
              }}
              className="pb-2"
            >
              <div className="sticky top-0 z-10 bg-ink-panel py-1.5 text-[12px] font-semibold tracking-[0.14em] text-gold">
                {letter}
              </div>
              <ul className="grid gap-1 sm:grid-cols-2">
                {items.map((item) => (
                  <li key={item.slug}>
                    <Link
                      href={`/${item.slug}`}
                      title={item.name}
                      className="block truncate rounded-[9px] px-3 py-2 text-[14.5px] font-normal text-white/80 transition-all duration-200 ease-[var(--ease-out-expo)] hover:translate-x-1 hover:bg-white/[0.06] hover:text-gold"
                    >
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {shown === 0 && (
            <p className="py-6 text-center text-[14.5px] font-normal text-white/50">
              No locations match “{query.trim()}”.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * The index as a section: the page's last band, above the footer.
 *
 * One wrapper rather than five copies of the same grid — the three service
 * hubs, `/our-locations/` and every location page all close on this.
 *
 * `heading` is the source's own, and there is only one when the source wrote
 * one: 163 location pages carry an "Our Other Locations" row whose WordPress
 * shortcode never ran, 18 borough hubs and `/mobile-car-wash/` carry a coverage
 * row that has been folded into the list. Where the source wrote nothing the
 * section wears the list's own title instead — "Mobile Car Detailing
 * Locations" — and the card drops it, because a display-sized "Browse A–Z"
 * beside a card already headed with the service said nothing twice.
 */
export function LocationIndexSection({
  heading,
  title,
  locations,
}: {
  /** The source's own heading for this row, where it has one. */
  heading?: string;
  title: string;
  locations: { slug: string; name: string }[];
}) {
  if (!locations.length) return null;
  const borrowed = !heading;

  return (
    <section className="w-full border-t border-white/[0.07] py-16 lg:py-[104px]">
      <div className="shell grid gap-8 lg:grid-cols-12 lg:gap-14">
        <div className="lg:col-span-5">
          {/*
            The source's coverage headings run to sixty characters of capitals
            — "AREAS WE PROVIDE STANDARD CAR WASH SERVICES IN LONDON:" — and at
            the 50px section-head size that is five lines of shouting down one
            side of the widget. Long ones take the smaller rank, which is the
            treatment `ServicePage` already gave that heading and for the same
            reason. "Service Areas", "Our Other Locations" and the borrowed
            list titles are all well under the line.
          */}
          {(heading ?? title).length > 30 ? (
            <>
              <Reveal>
                <span aria-hidden className="speed-rule speed-rule-sm" />
              </Reveal>
              <Reveal delay={1}>
                <h2 className="mt-5 font-[family-name:var(--font-sub)] text-[20px] leading-tight text-white uppercase lg:text-[23px]">
                  {heading ?? title}
                </h2>
              </Reveal>
            </>
          ) : (
            <SectionHead title={heading ?? title} />
          )}
        </div>
        <div className="lg:col-span-7">
          <Reveal delay={1}>
            <LocationIndex locations={locations} title={borrowed ? undefined : title} />
          </Reveal>
        </div>
      </div>
    </section>
  );
}
