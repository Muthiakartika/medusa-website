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
  [
    "mobile-car-wash/exterior-wash",
    /* Client, 2026-10-12. The menu entry went the same day; asked whether the
       page should go too, they said "hm not sure, maybe yes since the service
       is same" — of Exterior Plus Wash, which is not the same service: Plus
       adds liquid wax and two dressings, and prices at £49-£65 against this
       page's £35-£42. So the page is held out of the index rather than 301'd
       into one that costs more, until they decide. */
    "awaiting the client's decision on whether it is retired (2026-10-12)",
  ],
]);

export const isNoindex = (slug: string) => NOINDEX.has(slug);
