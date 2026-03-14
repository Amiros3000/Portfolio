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
    <footer className="border-t border-accent/10 bg-surface/40 backdrop-blur-sm">
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-4 px-6 py-8 sm:flex-row sm:justify-between lg:px-8">
        {/* Copyright */}
        <p className="text-sm text-muted">
          &copy; {new Date().getFullYear()} Amir Ibrahim
        </p>

        {/* Social links */}
        <nav aria-label="Social links" className="flex items-center gap-4">
          {links.map(({ href, label, icon: Icon }) => (
            <a
              key={label}
              href={href}
              target={href.startsWith("mailto:") ? undefined : "_blank"}
              rel={href.startsWith("mailto:") ? undefined : "noopener noreferrer"}
              aria-label={label}
              className="rounded-full p-2 text-muted transition hover:bg-accent/10 hover:text-foreground"
            >
              <Icon className="h-4 w-4" />
            </a>
          ))}
        </nav>

        {/* Built with */}
        <p className="text-xs text-muted/60">
          Built with Next.js
        </p>
      </div>
    </footer>
  );
}
