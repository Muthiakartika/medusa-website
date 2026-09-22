import type { NextConfig } from "next";
import { REDIRECTS } from "./src/lib/redirects";

const nextConfig: NextConfig = {
  /*
    No `trailingSlash`, so Next's default stands: /mobile-car-wash/bronze-wash/
    redirects to /mobile-car-wash/bronze-wash, and the short form is what every
    canonical, every sitemap entry and every internal link on the site says.

    Client, 2026-09-19: "I think URLs without a trailing dash is better".

    Everything here is a **308**, not a 301 — both the normalisation above and
    `permanent: true` below, which is what that flag has always meant in Next.
    308 is the method-preserving permanent redirect and search engines treat it
    exactly as they do a 301, so the rest of this repo calls them 301s; this is
    the one file where the actual code is decided, so it says the number.

    Two things follow from dropping the slash, both handled rather than
    inherited:

    - **The redirect table is written without slashes** (`lib/redirects.ts`).
      Next resolves the trailing-slash normalisation before it consults that
      table, so `/valeting/` arrives at it as `/valeting`; a rule still wearing
      the workbook's slash would never match anything.
    - **A legacy WordPress URL now takes two hops.** `/valeting/` 308s to
      `/valeting` and then 308s to `/car-valeting`. That is the cost of the
      switch and it is paid by inbound links only: nothing this site renders
      points at a slashed URL any more, so no internal link and no sitemap
      entry chains. Removing the extra hop would mean `skipTrailingSlashRedirect`
      and a proxy to do the normalising by hand, which puts a function in front
      of 305 static pages to save a crawler one redirect it already follows.
  */

  /*
    Next's image optimiser is off, and this is a billing decision rather than a
    technical one.

    Vercel's Image Optimization quota ran out, so every /_next/image request
    answered `402 OPTIMIZED_IMAGE_REQUEST_PAYMENT_REQUIRED` - 99 bytes of plain
    text where a photograph should be. Because every `next/image` on the site
    routes through it, that emptied all 525 images on all 254 pages at once,
    while the files themselves kept serving fine from /assets.

    Unoptimised, `next/image` emits a plain <img> pointing at the file on disk.
    What that costs is per-viewport resizing, not format: the assets are
    mirrored from WordPress and are already .webp at a median of 54 KB, so a
    phone now fetches the desktop-sized file. /mobile-car-wash is the heaviest
    case at 21 images totalling 0.97 MB.

    Delete this block the moment the plan is upgraded or the quota resets;
    nothing else has to change.
  */
  // images: {
  //   unoptimized: true,
  // },

  /*
    Everything under /assets is a file mirrored from the WordPress uploads
    directory: a dated path, written once by `npm run content` and then left
    alone. Vercel serves `public/` with `max-age=0, must-revalidate` by
    default, so all 37 images on the homepage were revalidated on every
    repeat visit - Pingdom grades that "Add Expires headers: D".

    A month of freshness with a year of stale-while-revalidate: a replaced
    file still reaches a returning visitor, it just does so on the next
    request rather than blocking this one.
  */
  /*
    The enquiry forms are server actions, and one of them — the caravan page's
    — takes a photograph. Next caps a server action's request body at 1 MB by
    default, which no phone photograph is under, so that field has never
    worked: the whole submission failed before the action was reached, with
    the name, the address and the message in it.

    4 MB rather than more, because Vercel's own function request limit is
    4.5 MB and a limit set above it would fail one layer further out, where
    this file cannot say anything about it. The multipart encoding adds its
    own 10-20 KB of boundaries on top of the file, hence the gap.

    `lib/mail.ts` carries the matching attachment budget.
  */
  experimental: {
    serverActions: {
      bodySizeLimit: "4mb",
    },
  },

  async headers() {
    return [
      {
        source: "/assets/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=2592000, stale-while-revalidate=31536000",
          },
        ],
      },

      /*
        The two crawl surfaces. Both are prerendered, and both left the build
        with `max-age=0, must-revalidate`, which is Vercel's default for a
        static file and which tells every cache between here and the crawler
        to ask again every time. Nothing about a 275-URL sitemap needs to be
        that fresh: it can only change when a deployment changes it, and a
        deployment purges the CDN anyway (§7).

        `max-age=0` still, so a browser revalidates; `s-maxage` is the part the
        CDN reads.
      */
      {
        source: "/sitemap.xml",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=0, s-maxage=3600, stale-while-revalidate=86400",
          },
        ],
      },
      {
        source: "/robots.txt",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=0, s-maxage=3600, stale-while-revalidate=86400",
          },
        ],
      },

      /*
        Nothing under /api may be cached anywhere, by anyone.

        /api/revalidate is the flush itself, and a cached 200 would mean the
        second flush of a day silently never happened. /api/build is how CI
        decides the new deployment is live, so an answer one build out of date
        makes it purge the cache it is trying to fill. Both are one request a
        deploy; there is nothing to gain and a whole failure mode to lose.
      */
      {
        source: "/api/:path*",
        headers: [
          { key: "Cache-Control", value: "no-store, max-age=0" },
          /* Cloudflare's own cache rules bypass /api too, but a zone is
             edited by hand and this is not - see PROJECT.md §7. */
          { key: "CDN-Cache-Control", value: "no-store" },
        ],
      },
    ];
  },

  async redirects() {
    return REDIRECTS.map(([source, destination]) => ({
      source,
      destination,
      permanent: true,
    }));
  },
};

export default nextConfig;
