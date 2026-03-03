import HomePageClient from "./components/home-page-client";
import { getPortfolioContent } from "./lib/portfolio-content";

export default async function Home() {
  const content = await getPortfolioContent();

  const personJsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: "Amir Ibrahim",
    jobTitle: "Computer Engineer",
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
      <HomePageClient content={content} />
    </>
  );
}
