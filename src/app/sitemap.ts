import type { MetadataRoute } from "next";
import { PAGES } from "@/lib/blocks";
import { SITE } from "@/lib/site";

/**
 * One entry per route the site serves, mirroring the two Yoast sitemaps on the
 * live site (page-sitemap.xml + post-sitemap.xml) as a single index.
 *
 * `lastModified` comes from each source page's dateModified, captured by
 * scripts/extract-content.mjs. Pages the source never dated are emitted
 * without a lastmod rather than with a fabricated one.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  return Object.values(PAGES).map((page) => ({
    url: SITE + (page.slug ? `/${page.slug}` : "/"),
    lastModified: page.modified,
    changeFrequency: changeFrequency(page.slug),
    priority: priority(page.slug),
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
  if (/^mobile-car-(valeting|wash|detailing)-in-/.test(slug)) return 0.6;
  if (slug.startsWith("our-locations/")) return 0.6;
  return 0.8;
}
