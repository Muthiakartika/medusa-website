/**
 * Pages that still answer 200 but ask not to be indexed.
 *
 * The middle setting between keeping a page and 301-ing it away, for a page
 * whose future the client has not settled. The page stays reachable — anyone
 * with the link, or an internal link, still gets it — and it leaves the
 * sitemap and, in time, the index.
 *
 * **It is not the same as not being crawled.** A crawler has to fetch the page
 * to read the `noindex`, so `robots.txt` must keep allowing it; disallowing it
 * would leave an already-indexed URL in the results with no way to learn it
 * should go. Whatever ranking the page holds is given up, which is the cost of
 * using this rather than leaving it alone.
 *
 * Each entry says who asked and why. Delete the entry to put a page back.
 */
export const NOINDEX = new Map<string, string>([
  /* Empty, and kept so. `mobile-car-wash/exterior-wash` sat here from
     2026-10-12 until the repo owner retired the page later the same day: a
     301 supersedes a `noindex`, because a redirected URL is never served and
     so never gets to carry the header. See `lib/redirects.ts`. */
]);

export const isNoindex = (slug: string) => NOINDEX.has(slug);
