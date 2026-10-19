import type { NextConfig } from "next";
import { REDIRECTS } from "./src/lib/redirects";
import { SITE } from "./src/lib/site";

const nextConfig: NextConfig = {
  /*
    No `trailingSlash`, so Next's default stands: /mobile-car-wash/bronze-wash/
    redirects to /mobile-car-wash/bronze-wash, and the short form is what every
    canonical, every sitemap entry and every internal link on the site says.

    Client, 2026-09-19: "I think URLs without a trailing dash is better".

    The redirect table below answers **301**. It answered 308 until 2026-10-06
    — `permanent: true`, which is what that flag means in Next — and search
    engines treat the two the same, but the client's brief for the alloy wheel
    move said it twice: "Use ONE server-side permanent 301", and "Check old
    URL returns: 301 not 302". A 308 reads as neither to anyone checking with a
    header tool, so `statusCode: 301` is set rather than the flag. Every page
    here is a GET, which is the one case where the two codes cannot differ.

    The trailing-slash normalisation above is still a **308**: it is Next's
    own and no config reaches it.

    Two things follow from dropping the slash, both handled rather than
    inherited:

    - **The redirect table is written without slashes** (`lib/redirects.ts`).
      Next resolves the trailing-slash normalisation before it consults that
      table, so `/valeting/` arrives at it as `/valeting`; a rule still wearing
      the workbook's slash would never match anything.
    - **A legacy WordPress URL now takes two hops.** `/valeting/` 308s to
      `/valeting` and then 301s to `/car-valeting`. That is the cost of the
      switch and it is paid by inbound links only: nothing this site renders
      points at a slashed URL any more, so no internal link and no sitemap
      entry chains. Removing the extra hop would mean `skipTrailingSlashRedirect`
      and a proxy to do the normalising by hand, which puts a function in front
      of 305 static pages to save a crawler one redirect it already follows.
  */

  /*
    `next dev` behind an ngrok tunnel, for showing work in progress on a phone
    or to a reviewer. Next 16 refuses dev assets (`/_next/static`, `/_next/hmr`)
    to any origin but the one it was started on, so through the tunnel the HTML
    arrived and its CSS and JavaScript did not — an unstyled page (2026-10-06).
    Dev only: a production build ignores this.

    Careful with what a tunnel exposes: `.env.local` holds live SendGrid keys,
    so a form submitted through it emails the client for real.
  */
  allowedDevOrigins: ["*.ngrok-free.app"],

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
      /*
        Every page names its canonical in a header as well as in the HTML.

        medusaautodetailing.site, .pro and .info re-serve this site live
        through Cloudflare Workers, swapping our hostname for theirs in every
        body they relay — the <link rel="canonical"> included, so each copy
        claims to be the original. They relay response headers as they find
        them, so this one still points a crawler that reads the copy back at
        the page it was copied from (PROJECT.md §14).

        Set here rather than in a `proxy.ts`. A proxy would be a function in
        front of 305 static pages, run only to compute what the matched path
        already says. On the real site the header and the HTML agree, because
        both are SITE plus the path.
      */
      {
        source: "/:path((?!_next/|api/|assets/|sitemap\\.xml|robots\\.txt).*)",
        headers: [{ key: "Link", value: `<${SITE}/:path>; rel="canonical"` }],
      },

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
      statusCode: 301 as const,
    }));
  },
};

export default nextConfig;
