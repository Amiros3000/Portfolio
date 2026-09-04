import type { MetadataRoute } from "next";
import { SITE_ORIGIN } from "./lib/site";

/**
 * One public page. `/admin` and everything under `/api` are 404 in production,
 * so they are deliberately absent.
 *
 * No `lastModified`: it would have to come from the build clock, which changes
 * on every deploy whether or not the content did. An inaccurate freshness
 * signal is worse than none.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: SITE_ORIGIN,
      changeFrequency: "monthly",
      priority: 1,
    },
  ];
}
