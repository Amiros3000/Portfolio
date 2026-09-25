import HomePageClient from "./components/home-page-client";
import { getFootpalLive } from "./lib/footpal-live";
import { getPortfolioContent } from "./lib/portfolio-content";

// FootPal FC figures come from GitHub; rebuild the page with fresh ones daily.
export const revalidate = 86400;

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
      <HomePageClient content={content} footpalLive={footpalLive} />
    </>
  );
}
