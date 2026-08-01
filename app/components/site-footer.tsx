import { Github, Linkedin, Mail } from "lucide-react";
import { getPortfolioContent } from "@/app/lib/portfolio-content";

export default async function SiteFooter() {
  const content = await getPortfolioContent();
  const { directEmail, githubUrl, linkedinUrl } = content.contact;

  const links = [
    { href: githubUrl, label: "GitHub", icon: Github },
    { href: linkedinUrl, label: "LinkedIn", icon: Linkedin },
    { href: `mailto:${directEmail}`, label: "Email", icon: Mail },
  ].filter((l) => l.href);

  return (
    <footer className="border-t border-line">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-4 px-5 py-8 sm:flex-row sm:items-center sm:justify-between sm:px-8">
        <p className="font-mono text-[0.7rem] tracking-wide text-muted">
          &copy; {new Date().getFullYear()} Amir Ibrahim — built with Next.js
        </p>

        <nav aria-label="Social links" className="flex items-center gap-4">
          {links.map(({ href, label, icon: Icon }) => (
            <a
              key={label}
              href={href}
              target={href.startsWith("mailto:") ? undefined : "_blank"}
              rel={href.startsWith("mailto:") ? undefined : "noopener noreferrer"}
              aria-label={label}
              className="text-muted transition-colors hover:text-accent-ink"
            >
              <Icon className="h-4 w-4" />
            </a>
          ))}
        </nav>
      </div>
    </footer>
  );
}
