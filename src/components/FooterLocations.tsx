import Link from "next/link";
import { locationStrips } from "@/lib/location-frame";

/**
 * Every location page the site has, scrolling across the foot of every page.
 *
 * Client, 2026-09-18: "all the new location pages can be in a scroll in the
 * footer, like each being a location word then clicking into the location
 * page… like our seo boost one, but a bit better with claude help."
 *
 * The reference is a single drag-to-scroll strip of six country names. This is
 * the same idea at 195 places, and the differences are what "a bit better" had
 * to mean at that size:
 *
 * - **Four strips, one per family** (`locationStrips()`). A place here is up to
 *   four pages — Barnet is a borough hub, a car wash and a detailing page — so
 *   one long strip would carry the same word three times going three different
 *   places. The label at the head of each strip is what tells them apart.
 * - **They scroll on their own**, alternating direction, and **stop on hover or
 *   focus** so a name can actually be clicked. The reference only drags.
 * - **Each strip runs at the same speed** whatever its length: the duration is
 *   set from the number of names, not fixed, so the 32 detailing places do not
 *   race past while the 74 valeting ones crawl.
 * - **A touch screen gets no animation at all**, just a swipe-to-scroll strip —
 *   the reference's own behaviour. There is no hover there to pause with, and a
 *   name that keeps moving is a name that cannot be tapped. Anyone who has
 *   asked for less motion gets the same.
 *
 * The strip writes nothing. Every word is `placeName()` off a slug the site
 * already publishes, so a new location page joins the footer by existing.
 */
export default function FooterLocations() {
  const strips = locationStrips();
  if (!strips.length) return null;

  return (
    <section
      aria-labelledby="footer-locations"
      className="border-b border-white/[0.07] py-10 lg:py-12"
    >
      {/* The site's own label for this, off the navigation — rule 8.1, no
          new words. */}
      <div className="shell">
        <span className="speed-rule speed-rule-sm" aria-hidden />
        <h2
          id="footer-locations"
          className="mt-3 text-[17px] tracking-[0.04em] text-white uppercase"
        >
          Our Locations
        </h2>
      </div>

      <div className="shell mt-7 flex flex-col gap-3">
        {strips.map((strip, i) => (
          <Strip key={strip.label} {...strip} reverse={i % 2 === 1} />
        ))}
      </div>
    </section>
  );
}

function Strip({
  label,
  items,
  reverse,
}: {
  label: string;
  items: { slug: string; name: string }[];
  reverse: boolean;
}) {
  /* One name every 2.6 seconds, so every strip reads at the same pace however
     many it carries. The track holds the list twice, hence the doubling. */
  const duration = `${Math.round(items.length * 2.6 * 2)}s`;

  return (
    /* The label sits beside the strip where there is room and above it where
       there is not. It is never dropped: the same place name appears in up to
       three strips going to three different pages, so the label is what says
       which. */
    <div className="flex flex-col gap-1.5 sm:flex-row sm:items-center sm:gap-4">
      <span className="shrink-0 pl-1 text-[12px] font-semibold tracking-[0.14em] text-gold uppercase sm:w-[104px] sm:pl-0">
        {label}
      </span>

      <div className="marquee min-w-0 flex-1">
        <div
          className="marquee-track"
          data-reverse={reverse}
          style={{ "--marquee-duration": duration } as React.CSSProperties}
        >
          <Row items={items} label={label} />
          {/* The seam-free half of the loop: the same names, hidden from
              assistive technology and from the tab order so each page is
              announced and reachable exactly once. */}
          <Row items={items} label={label} clone />
        </div>
      </div>
    </div>
  );
}

function Row({
  items,
  label,
  clone = false,
}: {
  items: { slug: string; name: string }[];
  label: string;
  clone?: boolean;
}) {
  return (
    <ul
      className="flex shrink-0 items-center gap-2 pr-2"
      aria-hidden={clone || undefined}
    >
      {items.map((item) => (
        <li key={item.slug}>
          <Link
            href={`/${item.slug}/`}
            tabIndex={clone ? -1 : undefined}
            className="loc-chip"
          >
            <span className="sr-only">{label}: </span>
            {item.name}
          </Link>
        </li>
      ))}
    </ul>
  );
}
