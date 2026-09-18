import type { MetadataRoute } from "next";
import { SITE } from "@/lib/site";

/**
 * The live robots.txt is mostly WordPress housekeeping (wp-admin, wp-login,
 * license.txt) that has no counterpart here, so this keeps the parts that
 * still mean something: everything crawlable, plus the sitemap pointer.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        // /preview holds design candidates — real routes, but not site
        // content, and each carries its own noindex.
        "/preview/",
        // The operational endpoints. Neither answers a GET with anything a
        // crawler can index, and the cache flush in particular has no reason
        // to appear in a crawl at all.
        "/api/",
      ],
    },
    sitemap: `${SITE}/sitemap.xml`,
    host: SITE,
  };
}
