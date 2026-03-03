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

export const DEFAULT_PORTFOLIO_CONTENT: PortfolioContent = {
  hero: {
    headline: "Amir Ibrahim | Computer Engineer",
    subheadline: "Building scalable systems. Language-agnostic. Fast learner.",
    bio: "I am a Computer Engineering graduate from York University (2025). While my core experience spans Java, Python, and Node.js infrastructure, my engineering foundation allows me to rapidly adapt to new languages and frameworks. I build robust tools to solve complex problems, regardless of the tech stack.",
    resumeUrl: "/resume.pdf",
  },
  skills: [
    "Java",
    "Python",
    "Node.js",
    "React.js",
    "MySQL",
    "Docker",
    "Linux",
    "Bash",
    "SQL",
    "RESTful APIs",
    "Distributed Systems",
  ],
  projects: [
    {
      title: "KonnectTaps",
      stack: "Next.js / Python / MySQL",
      description:
        "Architected a backend overhaul stabilizing infrastructure for 100+ active users. Improved data integrity and eliminated legacy technical debt.",
      href: "https://github.com/Amiros3000",
      hrefLabel: "View GitHub",
    },
    {
      title: "CSA Capstone - SOSO",
      stack: "System Design",
      description:
        "Built a satellite telemetry visualization tool for a space operations team. Translated complex operational constraints into technical logic to prevent scheduling conflicts.",
      href: "https://github.com/ENG4000-SOSO",
      hrefLabel: "View Team Repository",
    },
    {
      title: "MIX Registration System",
      stack: "High-Availability",
      description:
        "Engineered an event platform capable of handling 400+ concurrent requests with zero downtime during peak traffic spikes.",
      href: "https://github.com/Amiros3000",
      hrefLabel: "View GitHub",
    },
    {
      title: "Desktop Automation Suite",
      stack: "Python",
      description:
        "Developed custom automation scripts to batch process file systems and parse downloaded data, reducing manual administrative workflow time by 40%.",
      href: "https://github.com/Amiros3000",
      hrefLabel: "View GitHub",
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
        description: cleanString(record.description, fallback.description, 380),
        href: cleanString(record.href, fallback.href, 200),
        hrefLabel: cleanString(record.hrefLabel, fallback.hrefLabel, 40),
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
