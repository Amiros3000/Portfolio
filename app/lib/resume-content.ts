import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

/* ── Types ── */

export type ResumePersonalInfo = {
  fullName: string;
  email: string;
  phone: string;
  location: string;
  linkedinUrl: string;
  githubUrl: string;
  websiteUrl: string;
};

export type ResumeExperienceEntry = {
  title: string;
  company: string;
  location: string;
  startDate: string;
  endDate: string;
  bullets: string[];
};

export type ResumeEducationEntry = {
  degree: string;
  institution: string;
  location: string;
  graduationDate: string;
  gpa: string;
  relevantCourses: string[];
};

export type ResumeProjectEntry = {
  title: string;
  stack: string;
  description: string;
  url: string;
};

export type ResumeContent = {
  personalInfo: ResumePersonalInfo;
  summary: string;
  experience: ResumeExperienceEntry[];
  education: ResumeEducationEntry[];
  skills: string[];
  projects: ResumeProjectEntry[];
};

/* ── Defaults ── */

export const DEFAULT_RESUME_CONTENT: ResumeContent = {
  "personalInfo": {
    "fullName": "Amir Ibrahim",
    "email": "amir.ibrahim3000@gmail.com",
    "phone": "",
    "location": "Mississauga, ON",
    "linkedinUrl": "https://linkedin.com/in/amir3000",
    "githubUrl": "https://github.com/Amiros3000",
    "websiteUrl": "https://amiribrahim3000.com"
  },
  "summary": "Frontend-leaning full-stack engineer and Computer Engineering graduate (York, 2025) with React + TypeScript strength. Currently running VamoKora, a live app used weekly by a real, growing soccer crew — owning everything from a multi-tenant PostgreSQL schema (30+ models) to the React/TypeScript frontend, with 2,200+ automated tests guarding every release. Strong programming fundamentals across Node.js, Python (FastAPI), and SQL; daily user of AI coding assistants.",
  "experience": [
    {
      "title": "Founder & Developer",
      "company": "VamoKora",
      "location": "vamokora.com",
      "startDate": "Jun 2026",
      "endDate": "Present",
      "bullets": [
        "Visual design & UX: designed the full interface — layout, visual styling, and interaction flows including a matchday narrative covering scheduling, team draws, and post-match voting — and implemented it as a responsive, installable PWA, iterating weekly on feedback from real players.",
        "End-to-end ownership: designed a multi-tenant PostgreSQL schema (30+ models) with application-layer access guards; built the REST API layer and the full React/TypeScript frontend.",
        "Performance: cut the heaviest page's load from ~3.3s to ~1.1s by batching 8 sequential database reads into one parallel fetch and adding indexes after EXPLAIN showed sequential scans (measured by hand).",
        "Reliability: 2,200+ automated tests across 180+ test files; custom PII-scrubbing Sentry hook; features shipped weekly to a real, growing soccer crew."
      ]
    },
    {
      "title": "Co-Founder & Frontend Developer",
      "company": "KonnectTaps",
      "location": "Remote",
      "startDate": "Jan 2024",
      "endDate": "May 2026",
      "bullets": [
        "Ownership: built the frontend from the ground up in React and Next.js with two other developers on scope and product direction.",
        "Navigation safeguard: built a custom navigation guard by patching the History API to intercept anchor clicks and popstate/beforeunload events, replacing native browser prompts with an in-app warning."
      ]
    },
    {
      "title": "Assistant Deli Manager (Promoted from Clerk)",
      "company": "Marché Adonis",
      "location": "Mississauga, ON",
      "startDate": "Nov 2017",
      "endDate": "Present",
      "bullets": [
        "Promoted from Clerk to Assistant Deli Manager in June 2025; run daily operations and scheduling for a 13-person team and act as escalation contact on high-volume shifts. Worked here throughout a full-time engineering degree."
      ]
    }
  ],
  "education": [
    {
      "degree": "B.Eng. Computer Engineering",
      "institution": "York University — Lassonde School of Engineering",
      "location": "Toronto, ON",
      "graduationDate": "Jun 2025",
      "gpa": "",
      "relevantCourses": [
        "OOP (Java)",
        "Data Structures & Algorithms",
        "Operating Systems",
        "Communication Networks",
        "Software Engineering Principles"
      ]
    },
    {
      "degree": "Electromechanical Engineering Technician (Completed Year 1)",
      "institution": "Humber College",
      "location": "Toronto, ON",
      "graduationDate": "2023",
      "gpa": "",
      "relevantCourses": [
        "Introduction to Control Circuits",
        "Robotics",
        "Mechatronics",
        "Industrial Pneumatics",
        "Statics",
        "Engineering Graphics",
        "Engineering Materials",
        "Workshop Practices"
      ]
    }
  ],
  "skills": [
    "TypeScript",
    "JavaScript (ES6+)",
    "Python",
    "SQL",
    "Swift",
    "React",
    "Next.js (App Router, RSC)",
    "Tailwind CSS",
    "HTML5/CSS3",
    "Node.js",
    "REST API design",
    "PostgreSQL",
    "Prisma ORM",
    "Custom session auth",
    "Git/GitHub",
    "GitHub Actions (CI/CD)",
    "Vercel",
    "Docker",
    "Sentry",
    "Vitest",
    "AI coding assistants (Claude Code)"
  ],
  "projects": [
    {
      "title": "FootyTracker",
      "stack": "Swift / SwiftUI / HealthKit / WatchConnectivity / TestFlight (internal)",
      "description": "Apple Watch + iPhone app for amateur soccer players: true time on pitch (bench and half-time removed), heart-rate zones, work rate, GPS heatmap on a drawn pitch. Redesigned after a missed \"sub on\" tap lost half a game toward a no-pause Watch design with automatic break detection. Build uploaded to TestFlight (external testing not started yet); 100+ unit tests; built with Claude Code, reviewing and testing all generated code.",
      "url": ""
    },
    {
      "title": "SOSO — Satellite Operations Services Optimizer (Capstone)",
      "stack": "React / REST APIs · Canadian Space Agency",
      "description": "Built the React dashboard visualizing satellite telemetry and orbital pass schedules for CSA stakeholders; authored system documentation and design trade-off analysis.",
      "url": ""
    }
  ]
};

/* ── Helpers ── */

const CONTENT_FILE = path.join(process.cwd(), "content", "resume-content.json");

function cleanStr(value: unknown, fallback: string, max = 500): string {
  if (typeof value !== "string") return fallback;
  const c = value.trim().slice(0, max);
  return c.length > 0 ? c : fallback;
}

function cleanStrArray(value: unknown, fallback: string[]): string[] {
  if (!Array.isArray(value)) return fallback;
  const c = value
    .map((i) => (typeof i === "string" ? i.trim() : ""))
    .filter(Boolean)
    .slice(0, 30);
  return c.length > 0 ? c : fallback;
}

function normalizeExperience(
  input: unknown,
  fallback: ResumeExperienceEntry[],
): ResumeExperienceEntry[] {
  if (!Array.isArray(input)) return fallback;

  const entries = input
    .map((entry, i) => {
      const fb = fallback[i] ?? fallback[0];
      if (typeof entry !== "object" || entry === null) return fb;
      const r = entry as Record<string, unknown>;
      return {
        title: cleanStr(r.title, fb?.title ?? "", 100),
        company: cleanStr(r.company, fb?.company ?? "", 100),
        location: cleanStr(r.location, fb?.location ?? "", 100),
        startDate: cleanStr(r.startDate, fb?.startDate ?? "", 20),
        endDate: cleanStr(r.endDate, fb?.endDate ?? "", 20),
        bullets: cleanStrArray(r.bullets, fb?.bullets ?? []),
      };
    })
    .slice(0, 10);

  return entries.length > 0 ? entries : fallback;
}

function normalizeEducation(
  input: unknown,
  fallback: ResumeEducationEntry[],
): ResumeEducationEntry[] {
  if (!Array.isArray(input)) return fallback;

  const entries = input
    .map((entry, i) => {
      const fb = fallback[i] ?? fallback[0];
      if (typeof entry !== "object" || entry === null) return fb;
      const r = entry as Record<string, unknown>;
      return {
        degree: cleanStr(r.degree, fb?.degree ?? "", 150),
        institution: cleanStr(r.institution, fb?.institution ?? "", 150),
        location: cleanStr(r.location, fb?.location ?? "", 100),
        graduationDate: cleanStr(r.graduationDate, fb?.graduationDate ?? "", 20),
        gpa: cleanStr(r.gpa, fb?.gpa ?? "", 10),
        relevantCourses: cleanStrArray(r.relevantCourses, fb?.relevantCourses ?? []),
      };
    })
    .slice(0, 5);

  return entries.length > 0 ? entries : fallback;
}

function normalizeProjects(
  input: unknown,
  fallback: ResumeProjectEntry[],
): ResumeProjectEntry[] {
  if (!Array.isArray(input)) return fallback;

  const entries = input
    .map((entry, i) => {
      const fb = fallback[i] ?? fallback[0];
      if (typeof entry !== "object" || entry === null) return fb;
      const r = entry as Record<string, unknown>;
      return {
        title: cleanStr(r.title, fb?.title ?? "", 100),
        stack: cleanStr(r.stack, fb?.stack ?? "", 100),
        description: cleanStr(r.description, fb?.description ?? "", 300),
        url: cleanStr(r.url, fb?.url ?? "", 200),
      };
    })
    .slice(0, 8);

  return entries.length > 0 ? entries : fallback;
}

/* ── Normalize ── */

export function normalizeResumeContent(input: unknown): ResumeContent {
  const v =
    typeof input === "object" && input !== null
      ? (input as Record<string, unknown>)
      : {};

  const pi =
    typeof v.personalInfo === "object" && v.personalInfo !== null
      ? (v.personalInfo as Record<string, unknown>)
      : {};

  const d = DEFAULT_RESUME_CONTENT;

  return {
    personalInfo: {
      fullName: cleanStr(pi.fullName, d.personalInfo.fullName, 100),
      email: cleanStr(pi.email, d.personalInfo.email, 120),
      phone: cleanStr(pi.phone, d.personalInfo.phone, 30),
      location: cleanStr(pi.location, d.personalInfo.location, 100),
      linkedinUrl: cleanStr(pi.linkedinUrl, d.personalInfo.linkedinUrl, 220),
      githubUrl: cleanStr(pi.githubUrl, d.personalInfo.githubUrl, 220),
      websiteUrl: cleanStr(pi.websiteUrl, d.personalInfo.websiteUrl, 220),
    },
    summary: cleanStr(v.summary, d.summary, 600),
    experience: normalizeExperience(v.experience, d.experience),
    education: normalizeEducation(v.education, d.education),
    skills: cleanStrArray(v.skills, d.skills),
    projects: normalizeProjects(v.projects, d.projects),
  };
}

/* ── Read / Write ── */

export async function getResumeContent(): Promise<ResumeContent> {
  try {
    const raw = await readFile(CONTENT_FILE, "utf8");
    return normalizeResumeContent(JSON.parse(raw));
  } catch {
    return DEFAULT_RESUME_CONTENT;
  }
}

export async function saveResumeContent(input: unknown): Promise<ResumeContent> {
  const content = normalizeResumeContent(input);
  await mkdir(path.dirname(CONTENT_FILE), { recursive: true });
  await writeFile(CONTENT_FILE, `${JSON.stringify(content, null, 2)}\n`, "utf8");
  return content;
}
