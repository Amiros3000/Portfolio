import HomePageClient from "./components/home-page-client";
import { getPortfolioContent } from "./lib/portfolio-content";
import { SITE_ORIGIN } from "./lib/site";

export default async function Home() {
  const content = await getPortfolioContent();

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
