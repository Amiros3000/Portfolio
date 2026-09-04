import HomePageClient from "./components/home-page-client";
import { getPortfolioContent } from "./lib/portfolio-content";
import { fillAuditPlaceholders } from "./lib/footpal-fc";
import { SITE_ORIGIN } from "./lib/site";

export default async function Home() {
  const stored = await getPortfolioContent();

  // Copy that quotes a count keeps it as a `{placeholder}` in storage and is
  // filled here, at the render site. See fillAuditPlaceholders.
  const content = {
    ...stored,
    hero: {
      ...stored.hero,
      headline: fillAuditPlaceholders(stored.hero.headline),
      subheadline: fillAuditPlaceholders(stored.hero.subheadline),
      bio: fillAuditPlaceholders(stored.hero.bio),
    },
    projects: stored.projects.map((project) => ({
      ...project,
      description: fillAuditPlaceholders(project.description),
    })),
  };

  // `url` and `alumniOf` have to be crawler-resolvable: a relative "/" is not a
  // URL to anything outside this page, and a bare institution name is a string
  // where consumers expect an entity.
  const personJsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: "Amir Ibrahim",
    jobTitle: "Full-Stack Software Developer",
    alumniOf: {
      "@type": "CollegeOrUniversity",
      name: "York University",
      url: "https://www.yorku.ca",
    },
    email: `mailto:${content.contact.directEmail}`,
    url: SITE_ORIGIN,
    sameAs: [content.contact.githubUrl, content.contact.linkedinUrl],
    knowsAbout: content.skills,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }}
      />
      <HomePageClient content={content} />
    </>
  );
}
