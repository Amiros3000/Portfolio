/**
 * Career profile: experience, education, stack, and what Amir is looking for.
 *
 * This is the ONE source for these four lists. They lived as hardcoded arrays
 * inside home-page-client.tsx, where nothing connected them to
 * content/portfolio-content.json's flat `skills` array (which feeds JSON-LD
 * `knowsAbout`) or to content/resume-content.json. Three copies, no link.
 *
 * `allSkills` below is derived from `skillCategories`, so the rendered stack
 * and the structured-data list can no longer disagree.
 */

export const experience = [
  {
    title: "Co-Founder & Frontend Developer",
    company: "KonnectTaps",
    location: "Remote",
    period: "Jan 2024 – May 2026",
    bullets: [
      // Role context only. The engineering detail is the Team work section
      // above; repeating it here would say the same thing twice.
      "Built the frontend for a digital business card platform in React and Next.js — the card editor and designer users composed and styled their cards in.",
      "Worked alongside two other developers on scope and product direction.",
      "The platform reached 100+ signups. It wound down in May 2026.",
    ],
  },
  // Deliberately one entry with one bullet, matching how the resume subordinates
  // this under "Additional Experience". It is seven years of accountability, not
  // engineering work, and it should not carry the weight of an engineering role.
  {
    title: "Assistant Deli Manager",
    company: "Marché Adonis",
    location: "Mississauga, ON",
    period: "Nov 2017 – Present",
    bullets: [
      "Promoted from Deli Clerk in June 2025, at the seven-year mark, to run daily operations and scheduling for a 13-person team while completing a full-time engineering degree.",
    ],
  },
];

// The Humber Electromechanical Technician year was cut here, matching the
// resume. It is a non-CS credential on a page arguing full-stack software, and
// listing it (plus Ladder Logic and IT/OT under Stack) spent the reader's
// attention arguing against the rest of the page.
export const education = [
  {
    degree: "B.Eng. Computer Engineering",
    institution: "York University — Lassonde School of Engineering",
    period: "Graduated Jun 2025",
    courses:
      "Object-Oriented Programming (Java), Data Structures & Algorithms, Operating Systems, Communication Networks, Software Engineering Principles",
  },
];

// Kept in step with the resume's skills block. Where the two group things
// differently that is presentation, but nothing may appear in one and not the
// other — a recruiter reads both.
export const skillCategories = [
  {
    label: "Languages",
    skills: [
      "TypeScript",
      "JavaScript (ES6+)",
      "Python",
      "Java",
      "SQL",
      "Bash",
    ],
  },
  {
    label: "Frontend",
    skills: [
      "React",
      "Next.js (App Router/RSC)",
      "Tailwind",
      "HTML5/CSS3",
      "PWA (Web Push, installable)",
    ],
  },
  {
    // Express removed — backend work is Next.js API routes and FastAPI.
    label: "Backend",
    skills: [
      "Node.js",
      "FastAPI",
      "REST API design",
      "PostgreSQL",
      "Prisma",
      "MySQL",
      "SQLite/SQLCipher",
      "Custom session auth",
    ],
  },
  {
    label: "Testing & observability",
    skills: ["Vitest", "Sentry"],
  },
  {
    label: "Infrastructure",
    skills: [
      "Docker",
      "GitHub Actions (CI/CD)",
      "Git/GitHub",
      "Vercel",
      "VPS deployment",
      "Linux/Ubuntu",
      "Nginx",
      "SSL/TLS",
    ],
  },
  {
    label: "Concepts",
    skills: [
      "Multi-tenant architecture",
      "System design",
      "Concurrency & idempotency",
      "Agile",
    ],
  },
];

export const lookingFor = [
  {
    key: "Roles",
    value: "Software Developer, Full-Stack Developer, Frontend Engineer",
  },
  { key: "Location", value: "Remote or hybrid — GTA, Ontario" },
  { key: "Availability", value: "Immediately" },
];

/**
 * Flattened `skillCategories`, in category order. Consumed by
 * DEFAULT_PORTFOLIO_CONTENT.skills, which is what JSON-LD `knowsAbout`
 * publishes. Derived rather than retyped: the two lists disagreed before.
 */
export const allSkills: string[] = skillCategories.flatMap(
  (category) => category.skills,
);
