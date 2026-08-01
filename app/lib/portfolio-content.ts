import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import {
  getSupabasePortfolioContent,
  isSupabaseConfigured,
  upsertSupabasePortfolioContent,
} from "./supabase-rest";

export type PortfolioProject = {
  title: string;
  stack: string;
  description: string;
  href: string;
  hrefLabel: string;
  secondaryHref?: string;
  secondaryHrefLabel?: string;
  imageUrl?: string;
  images?: string[];
};

export type PortfolioContent = {
  hero: {
    headline: string;
    subheadline: string;
    bio: string;
    resumeUrl: string;
  };
  skills: string[];
  projects: PortfolioProject[];
  contact: {
    directEmail: string;
    githubUrl: string;
    linkedinUrl: string;
  };
};

const CONTENT_FILE = path.join(process.cwd(), "content", "portfolio-content.json");

// Must stay index-aligned with content/portfolio-content.json: normalizePortfolioContent
// falls back field-by-field to the default at the SAME index, so a stale entry here
// silently resurrects removed data (e.g. the retired ktaps.me link).
export const DEFAULT_PORTFOLIO_CONTENT: PortfolioContent = {
  hero: {
    headline:
      "FootPal FC runs on a 27-model Postgres schema, 109 route handlers, and 175 tests.",
    subheadline:
      "It organizes recurring pickup soccer for 25+ players across three crews — RSVPs, team drafting, cost splitting, and player ratings.",
    bio: "I'm a full-stack developer and a Computer Engineering graduate from York University (2025), based in the GTA. I work in TypeScript, Next.js, React, PostgreSQL, and Python, and I've shipped two products to people who aren't me: FootPal FC, which I've been building since June 2026, and KonnectTaps, a digital business card platform I co-founded and built the frontend for. Most of what I care about as an engineer is in the decisions below — what I chose, and what it cost.",
    resumeUrl: "/resume.pdf",
  },
  skills: [
    "JavaScript (ES6+)",
    "TypeScript",
    "Python",
    "Java",
    "SQL",
    "Bash",
    "React",
    "Next.js",
    "Tailwind",
    "PWA (Web Push, installable)",
    "Node.js",
    "FastAPI",
    "PostgreSQL",
    "Prisma",
    "MySQL",
    "Vitest",
    "Sentry",
    "Docker",
    "GitHub Actions",
    "Git/GitHub",
    "Vercel",
    "Linux/Ubuntu",
    "Nginx",
  ],
  projects: [
    {
      // Flagship. Rendered as its own section, not a card — the long-form
      // engineering detail lives in footpal-fc.ts.
      title: "FootPal FC",
      stack: "Next.js 15 / TypeScript / PostgreSQL / Prisma",
      description:
        "Organizes recurring pickup soccer — RSVPs, team drafting, cost splitting, and player ratings — across independent crews. In use by 25+ players in three crews, two of them outside my own friend circle (Montreal and Mississauga). Building since June 2026.",
      href: "https://footpalfc.amiribrahim3000.com",
      hrefLabel: "Live",
    },
    {
      // Wound down May 2026. Amir was frontend; the payment integration was
      // built by the CEO and is deliberately not claimed here.
      title: "KonnectTaps",
      stack: "Next.js / React / JavaScript",
      description:
        "Digital business card platform I co-founded and built the frontend for, working with two other developers. Reached 100+ signups. Wound down in May 2026.",
      href: "https://konnecttaps.com",
      hrefLabel: "Site",
    },
    {
      title: "CSA Capstone — SOSO",
      stack: "System Design",
      description:
        "Satellite telemetry visualization tool built for a Canadian Space Agency capstone project, turning operational scheduling constraints into readable technical workflows.",
      href: "https://master.d31pgqxunb4wwx.amplifyapp.com",
      hrefLabel: "Live Demo",
      secondaryHref: "https://github.com/ENG4000-SOSO",
      secondaryHrefLabel: "GitHub",
    },
  ],
  contact: {
    directEmail: "amir.ibrahim3000@gmail.com",
    githubUrl: "https://github.com/Amiros3000",
    linkedinUrl: "https://linkedin.com/in/amir3000",
  },
};

function cleanString(value: unknown, fallback: string, maxLength = 500): string {
  if (typeof value !== "string") return fallback;
  const cleaned = value.trim().slice(0, maxLength);
  return cleaned.length > 0 ? cleaned : fallback;
}

function cleanOptionalString(
  value: unknown,
  fallback?: string,
  maxLength = 500,
): string | undefined {
  if (typeof value !== "string") return fallback;
  const cleaned = value.trim().slice(0, maxLength);
  return cleaned.length > 0 ? cleaned : fallback;
}

function cleanStringArray(value: unknown, fallback: string[]): string[] {
  if (!Array.isArray(value)) return fallback;

  const cleaned = value
    .map((item) => (typeof item === "string" ? item.trim() : ""))
    .filter(Boolean)
    .slice(0, 24);

  return cleaned.length > 0 ? cleaned : fallback;
}

export function normalizePortfolioContent(input: unknown): PortfolioContent {
  const value =
    typeof input === "object" && input !== null
      ? (input as Record<string, unknown>)
      : {};

  const hero =
    typeof value.hero === "object" && value.hero !== null
      ? (value.hero as Record<string, unknown>)
      : {};

  const contact =
    typeof value.contact === "object" && value.contact !== null
      ? (value.contact as Record<string, unknown>)
      : {};

  const projectsInput = Array.isArray(value.projects) ? value.projects : [];

  const projects = projectsInput
    .map((project, index) => {
      const fallback = DEFAULT_PORTFOLIO_CONTENT.projects[index] ??
        DEFAULT_PORTFOLIO_CONTENT.projects[0];

      if (typeof project !== "object" || project === null) return fallback;

      const record = project as Record<string, unknown>;

      return {
        title: cleanString(record.title, fallback.title, 80),
        stack: cleanString(record.stack, fallback.stack, 90),
        // 600 (was 380) so longer, verbatim project copy (e.g. FootPal) isn't truncated.
        description: cleanString(record.description, fallback.description, 600),
        href: cleanString(record.href, fallback.href, 200),
        hrefLabel: cleanString(record.hrefLabel, fallback.hrefLabel, 40),
        secondaryHref: cleanOptionalString(
          record.secondaryHref,
          fallback.secondaryHref,
          200,
        ),
        secondaryHrefLabel: cleanOptionalString(
          record.secondaryHrefLabel,
          fallback.secondaryHrefLabel,
          40,
        ),
        imageUrl: cleanOptionalString(
          record.imageUrl,
          fallback.imageUrl,
          300,
        ),
        images: Array.isArray(record.images)
          ? (record.images as unknown[])
              .filter((u): u is string => typeof u === "string" && u.length > 0)
              .slice(0, 6)
          : fallback.images,
      };
    })
    .slice(0, 12);

  return {
    hero: {
      headline: cleanString(hero.headline, DEFAULT_PORTFOLIO_CONTENT.hero.headline, 120),
      subheadline: cleanString(
        hero.subheadline,
        DEFAULT_PORTFOLIO_CONTENT.hero.subheadline,
        180,
      ),
      bio: cleanString(hero.bio, DEFAULT_PORTFOLIO_CONTENT.hero.bio, 1200),
      resumeUrl: cleanString(hero.resumeUrl, DEFAULT_PORTFOLIO_CONTENT.hero.resumeUrl, 260),
    },
    skills: cleanStringArray(value.skills, DEFAULT_PORTFOLIO_CONTENT.skills),
    projects: projects.length > 0 ? projects : DEFAULT_PORTFOLIO_CONTENT.projects,
    contact: {
      directEmail: cleanString(
        contact.directEmail,
        DEFAULT_PORTFOLIO_CONTENT.contact.directEmail,
        120,
      ),
      githubUrl: cleanString(
        contact.githubUrl,
        DEFAULT_PORTFOLIO_CONTENT.contact.githubUrl,
        220,
      ),
      linkedinUrl: cleanString(
        contact.linkedinUrl,
        DEFAULT_PORTFOLIO_CONTENT.contact.linkedinUrl,
        220,
      ),
    },
  };
}

export async function getPortfolioContent(): Promise<PortfolioContent> {
  if (isSupabaseConfigured()) {
    try {
      const supabaseContent = await getSupabasePortfolioContent();

      if (supabaseContent) {
        return normalizePortfolioContent(supabaseContent);
      }
    } catch {
      // Fall back to file/default content when Supabase is unavailable.
    }
  }

  try {
    const raw = await readFile(CONTENT_FILE, "utf8");
    return normalizePortfolioContent(JSON.parse(raw));
  } catch {
    return DEFAULT_PORTFOLIO_CONTENT;
  }
}

export async function savePortfolioContent(input: unknown): Promise<PortfolioContent> {
  const content = normalizePortfolioContent(input);

  if (isSupabaseConfigured()) {
    const saved = await upsertSupabasePortfolioContent(content);
    return normalizePortfolioContent(saved);
  }

  await mkdir(path.dirname(CONTENT_FILE), { recursive: true });
  await writeFile(CONTENT_FILE, `${JSON.stringify(content, null, 2)}\n`, "utf8");

  return content;
}

export async function updatePortfolioResumeUrl(
  resumeUrl: string,
): Promise<PortfolioContent> {
  const current = await getPortfolioContent();

  return savePortfolioContent({
    ...current,
    hero: {
      ...current.hero,
      resumeUrl,
    },
  });
}
