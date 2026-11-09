/**
 * The one skills list. The Stack section renders it grouped; the JSON-LD
 * `knowsAbout` reads it flattened.
 *
 * There used to be a second, flat list in PortfolioContent (editable in a
 * since-removed admin panel). The two drifted apart — Swift was in one and not the other —
 * so the flat one was removed. Edit skills here, in code, and only here.
 *
 * Rule: list only what you would take questions on in an interview. Swift is
 * deliberately absent: FootyTracker's Swift is AI-assisted, as its copy says.
 */
export type SkillCategory = { label: string; skills: string[] };

export const SKILL_CATEGORIES: SkillCategory[] = [
  {
    label: "Languages",
    skills: ["JavaScript (ES6+)", "TypeScript", "Python", "Java", "SQL", "Bash"],
  },
  {
    label: "Frontend",
    skills: [
      "React",
      "Next.js (App Router/RSC)",
      "Tailwind",
      "PWA (Web Push, installable)",
    ],
  },
  {
    // Express removed — backend work is Next.js API routes and FastAPI.
    label: "Backend",
    skills: ["Node.js", "FastAPI", "PostgreSQL", "Prisma", "MySQL"],
  },
  {
    label: "Testing & observability",
    skills: ["Vitest", "Sentry"],
  },
  {
    label: "Infrastructure",
    skills: ["Docker", "GitHub Actions", "Git/GitHub", "Vercel", "Linux/Ubuntu", "Nginx"],
  },
];

export const ALL_SKILLS: string[] = SKILL_CATEGORIES.flatMap((c) => c.skills);
