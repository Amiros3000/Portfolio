/**
 * The site's canonical origin, in one place.
 *
 * Everything that needs an absolute URL reads from here: `metadataBase`, the
 * canonical tag, `og:url`, the JSON-LD `Person.url`, the sitemap, and robots.txt.
 * Without a value Next.js falls back to VERCEL_PROJECT_PRODUCTION_URL, which
 * resolves social images to the *.vercel.app origin rather than the custom
 * domain, and leaves the canonical tag off entirely.
 *
 * Override with NEXT_PUBLIC_SITE_URL if the canonical domain ever changes.
 */
const FALLBACK_ORIGIN = "https://portfolio.amiribrahim3000.com";

function normalizeOrigin(value: string): string {
  const withProtocol = /^https?:\/\//.test(value) ? value : `https://${value}`;
  return withProtocol.replace(/\/+$/, "");
}

export const SITE_ORIGIN = normalizeOrigin(
  process.env.NEXT_PUBLIC_SITE_URL?.trim() || FALLBACK_ORIGIN,
);

export const SITE_URL = new URL(SITE_ORIGIN);

/** Origin without the scheme — for display in copy, never for an href. */
export const SITE_DOMAIN = SITE_URL.host;
