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
    subheadline:
      "VamoKora handles RSVPs, fair team drafts, cost splitting, and player ratings for real crews, every week.",
    bio: "I'm a full-stack developer and a Computer Engineering graduate from York University (2025), based in the GTA. I work in TypeScript, Next.js, React, PostgreSQL, and Python, and I've shipped two products to people who aren't me: VamoKora, which I've been building since June 2026, and KonnectTaps, a digital business card platform I co-founded and built the frontend for. Most of what I care about as an engineer is in the decisions below — what I chose, and what it cost.",
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
      title: "VamoKora",
      stack: "Next.js 16 / TypeScript / PostgreSQL / Prisma",
      description:
        "Pickup-soccer coordination for my own crew — RSVPs, team drafting, cost splitting, and player ratings — running real weekly games since June 2026.",
      href: "https://vamokora.com",
      hrefLabel: "Live",
    },
    {
      // Private repo, no live URL: href stays empty so no link renders.
      title: "FootyTracker",
      stack: "Swift / SwiftUI / HealthKit / watchOS · in development",
      description:
        "An Apple Watch + iPhone app that records my soccer games and shows what Apple Fitness doesn't: playing time without bench and half-time, heart-rate zones, and a GPS heatmap on the actual pitch. I designed and directed it and use it in my own games; the Swift is written with an AI coding assistant. The call: never pause the workout. In a real game I forgot to tap \"sub on\" and lost the rest of the match, so bench time is now stored as time ranges instead of pauses. The cost: Apple Fitness and FootyTracker show different totals, on purpose.",
      href: "",
      hrefLabel: "Private repo",
    },
    {
      title: "CSA Capstone — SOSO",
      stack: "React / REST APIs · Canadian Space Agency capstone",
      description:
        "Built the React dashboard that visualizes satellite telemetry and orbital pass schedules for Canadian Space Agency stakeholders, and wrote the system documentation and design trade-off analysis.",
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
        // 600 (was 380) so longer, verbatim project copy (e.g. VamoKora) isn't truncated.
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
