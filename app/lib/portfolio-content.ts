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

export const DEFAULT_PORTFOLIO_CONTENT: PortfolioContent = {
  hero: {
    headline: "Amir Ibrahim | Full-Stack Software Developer",
    subheadline:
      "I build and ship full-stack web apps end-to-end — from polished UI to reliable backend.",
    bio: "Computer Engineering grad from York University (2025) building full-stack web apps end-to-end. I co-founded a live SaaS product and ship in TypeScript, Next.js, React, and Node.js — owning everything from UI and UX to the backend, database, and deployment. I care about product outcomes, clean code, and shipping software people actually use.",
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
    "Node.js",
    "Express",
    "FastAPI",
    "PostgreSQL",
    "Prisma",
    "MySQL",
    "PWA",
    "Docker",
    "Git/GitHub",
    "CI/CD (GitHub Actions)",
    "Vercel",
    "Linux/Ubuntu",
    "Nginx",
  ],
  projects: [
    {
      title: "KonnectTaps",
      stack: "Next.js / Python / MySQL",
      // Wound down: past tense, honest "over 100 users" metric, no "enterprise clients".
      description:
        "Co-founded and built a full-stack digital business card platform — Next.js frontend, Python backend, MySQL, Shopify Billing API. Owned the product and full stack end-to-end and grew it to over 100 users before the team moved on.",
      href: "https://konnecttaps.com",
      hrefLabel: "Main Site",
      secondaryHref: "https://ktaps.me",
      secondaryHrefLabel: "Open App",
    },
    {
      // FootPal — verbatim copy provided by owner; no GitHub link (repo is private).
      title: "FootPal — Soccer Scheduling PWA",
      stack: "Next.js / TypeScript / PostgreSQL / PWA",
      description:
        "A mobile-first PWA that fixes a real problem from my own life — a friend group that could never lock down a game time. Built solo in about a month (June 2026) by directing AI coding tools, owning product vision, UX, scope, and prioritization across scheduling with availability voting, RSVPs, automatic team generation, a cost-splitting ledger, group chat, and player ratings. Now in weekly use by ~24 people who joined on their own.",
      href: "https://footpal.vercel.app",
      hrefLabel: "Live",
    },
    {
      title: "CSA Capstone - SOSO",
      stack: "System Design",
      description:
        "Built a satellite telemetry visualization tool that converted complex operational constraints into clear technical workflows. This improved scheduling visibility and reduced planning conflicts.",
      href: "https://master.d31pgqxunb4wwx.amplifyapp.com",
      hrefLabel: "Live Demo",
      secondaryHref: "https://github.com/ENG4000-SOSO",
      secondaryHrefLabel: "GitHub",
    },
    {
      title: "MIX Registration System",
      stack: "High-Availability",
      // "Built and shipped" (not "engineered") per honesty guardrail; 400+ metric kept.
      description:
        "Built and shipped a registration platform that handled 400+ concurrent requests during peak windows with zero downtime. The codebase is private, and the platform runs during the annual registration period.",
      href: "",
      hrefLabel: "",
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
