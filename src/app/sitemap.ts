import type { MetadataRoute } from "next";
import { PAGES } from "@/lib/blocks";
import { INTERIOR, REPAIRS } from "@/lib/hubs";
import { isLocationSlug } from "@/lib/location-frame";
import { REDIRECTED_SLUGS } from "@/lib/redirects";
import { SITE } from "@/lib/site";

/**
 * One entry per route the site serves, mirroring the two Yoast sitemaps on the
 * live site (page-sitemap.xml + post-sitemap.xml) as a single index.
 *
 * `lastModified` comes from each source page's dateModified, captured by
 * scripts/extract-content.mjs. Pages the source never dated are emitted
 * without a lastmod rather than with a fabricated one.
 */
/** The menu-group hubs, in menu order. */
const HUBS = [REPAIRS, INTERIOR];

export default function sitemap(): MetadataRoute.Sitemap {
  const slugs = [
    ...Object.values(PAGES)
      /* A sitemap that lists a URL which only 301s is asking a crawler to
         spend its budget learning the page moved. */
      .filter((page) => !REDIRECTED_SLUGS.has(page.slug))
      .map((page) => ({ slug: page.slug, modified: page.modified })),
    /* The menu-group hubs have no page in `pages.json` — each is built out of
       the pages it links to, so nothing in the mirror represents them and the
       loop above cannot see them. Every other hub on the site is in the
       sitemap; leaving these out would hide two menu heads from crawlers. */
    ...HUBS.map((h) => ({ slug: h.slug, modified: undefined })),
  ];

  return slugs.map(({ slug, modified }) => ({
    url: SITE + (slug ? `/${slug}/` : "/"),
    lastModified: modified,
    changeFrequency: changeFrequency(slug),
    priority: priority(slug),
  }));
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
