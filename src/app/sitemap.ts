import type { MetadataRoute } from "next";
import { getPage, PAGES } from "@/lib/blocks";
import { hubCards, type HubSpec } from "@/lib/hub";
import { INTERIOR, REPAIRS } from "@/lib/hubs";
import { isLocationSlug } from "@/lib/location-frame";
import { REDIRECTED_SLUGS } from "@/lib/redirects";
import { SITE } from "@/lib/site";

/**
 * One entry per route the site serves, mirroring the two Yoast sitemaps on the
 * live site (page-sitemap.xml + post-sitemap.xml) as a single index.
 *
 * Every URL carries a `lastmod`, and none of them is invented — see
 * `modifiedFor` and `hubModified` below for where each one comes from. A
 * sitemap that dates three quarters of its URLs and shrugs at the rest is one
 * a crawler has no reason to schedule from, and the 49 newest pages on the
 * site were all in the undated quarter.
 */
/** The menu-group hubs, in menu order. */
const HUBS = [REPAIRS, INTERIOR];

export default function sitemap(): MetadataRoute.Sitemap {
  const slugs = [
    ...Object.values(PAGES)
      /* A sitemap that lists a URL which only 301s is asking a crawler to
         spend its budget learning the page moved. */
      .filter((page) => !REDIRECTED_SLUGS.has(page.slug))
      .map((page) => ({ slug: page.slug, modified: modifiedFor(page) })),
    /* The menu-group hubs have no page in `pages.json` — each is built out of
       the pages it links to, so nothing in the mirror represents them and the
       loop above cannot see them. Every other hub on the site is in the
       sitemap; leaving these out would hide two menu heads from crawlers. */
    ...HUBS.map((h) => ({ slug: h.slug, modified: hubModified(h) })),
  ];

  return slugs.map(({ slug, modified }) => ({
    url: SITE + (slug ? `/${slug}` : "/"),
    lastModified: modified,
    changeFrequency: changeFrequency(slug),
    priority: priority(slug),
  }));
}

/**
 * A page's own dateModified where the mirror captured one, and its
 * datePublished where it did not.
 *
 * The 19 pages in the second case are all blog posts, and the fallback is the
 * same one `lib/schema.ts` already makes for their `dateModified` — a post
 * that has never been edited was last modified when it was written.
 */
function modifiedFor(page: { modified?: string; published?: string }) {
  return page.modified ?? page.published;
}

/**
 * A hub's last modification is the newest of the pages it is assembled from.
 *
 * `/repairs` and `/car-interior-cleaning` have no source page: every word on
 * them is read back out of their group's own pages (`lib/hub.ts`). So the day
 * one of those pages changes is the day the hub changes, and there is no other
 * date to claim. ISO dates sort as strings, so `reduce` is enough.
 */
function hubModified(spec: HubSpec) {
  const dates = hubCards(spec)
    .map((card) => modifiedFor(getPage(card.slug) ?? {}))
    .filter((d): d is string => Boolean(d));
  return dates.length ? dates.reduce((a, b) => (a > b ? a : b)) : undefined;
}

const isPost = (slug: string) => /^20\d\d\//.test(slug);

/** Blog posts are archival; service and location pages get re-priced. */
function changeFrequency(slug: string): "monthly" | "yearly" {
  return isPost(slug) ? "yearly" : "monthly";
}

/**
 * Homepage first, then the service pages that carry the commercial intent,
 * then the location long-tail, then the blog.
 */
function priority(slug: string): number {
  if (!slug) return 1;
  if (isPost(slug)) return 0.4;
  if (isLocationSlug(slug)) return 0.6;
  return 0.8;
}
