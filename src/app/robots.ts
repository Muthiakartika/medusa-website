import type { MetadataRoute } from "next";
import { SITE } from "@/lib/site";

/**
 * The live robots.txt is mostly WordPress housekeeping (wp-admin, wp-login,
 * license.txt) that has no counterpart here, so this keeps the parts that
 * still mean something: everything crawlable, plus the sitemap pointer.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    // /preview holds design candidates — real routes, but not site content,
    // and each carries its own noindex.
    rules: { userAgent: "*", allow: "/", disallow: "/preview/" },
    sitemap: `${SITE}/sitemap.xml`,
    host: SITE,
  };
}
