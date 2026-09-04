import type { MetadataRoute } from "next";
import { SITE_ORIGIN } from "./lib/site";

/**
 * `/admin` and `/api` are 404 in production already, but keeping them out of
 * the crawl budget costs nothing and stops the paths appearing in logs from
 * bots that index first and read status codes second.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/api/"],
    },
    sitemap: `${SITE_ORIGIN}/sitemap.xml`,
  };
}
