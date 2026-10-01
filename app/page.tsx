import { existsSync } from "node:fs";
import path from "node:path";
import HomePageClient from "./components/home-page-client";
import { getFootpalLive } from "./lib/footpal-live";
import { getPortfolioContent } from "./lib/portfolio-content";

// FootPal FC figures come from GitHub; rebuild the page with fresh ones daily.
export const revalidate = 86400;

/**
 * The resume link only renders when it resolves. A relative resumeUrl must
 * exist under public/ at build time (e.g. public/resume.pdf committed to the
 * repo or uploaded via /admin); an absolute URL is trusted as-is. This keeps a
 * stale resumeUrl from ever shipping a link to a 404.
 */
function resolveResumeHref(resumeUrl: string): string | null {
  if (!resumeUrl) return null;
  if (!resumeUrl.startsWith("/")) return resumeUrl;
  return existsSync(path.join(process.cwd(), "public", resumeUrl))
    ? resumeUrl
    : null;
}

export default async function Home() {
  const [content, footpalLive] = await Promise.all([
    getPortfolioContent(),
    getFootpalLive(),
  ]);

  const personJsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: "Amir Ibrahim",
    jobTitle: "Full-Stack Software Developer",
    alumniOf: "York University",
    email: `mailto:${content.contact.directEmail}`,
    url: "/",
    sameAs: [content.contact.githubUrl, content.contact.linkedinUrl],
    knowsAbout: content.skills,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }}
      />
      <HomePageClient
        content={content}
        footpalLive={footpalLive}
        resumeHref={resolveResumeHref(content.hero.resumeUrl)}
      />
    </>
  );
}
