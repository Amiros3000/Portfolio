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
  personalInfo: {
    fullName: "Amir Ibrahim",
    email: "amir.ibrahim3000@gmail.com",
    phone: "",
    location: "Mississauga, ON",
    linkedinUrl: "https://linkedin.com/in/amir3000",
    githubUrl: "https://github.com/Amiros3000",
    websiteUrl: "",
  },
  summary:
    "Computer Engineering graduate from York University with 7+ years of professional experience managing operations and co-founding a live product. Builds software end-to-end — from frontend UI to backend infrastructure. Full-stack engineer who ships production systems.",
  experience: [
    {
      title: "Co-Founder & Lead Engineer",
      company: "KonnectTaps",
      location: "Remote",
      startDate: "Jan 2024",
      endDate: "Present",
      bullets: [
        "Co-founded a live SaaS platform serving 100+ active users — architected and own the full production stack from frontend to infrastructure.",
        "Built and own the frontend experience in React/Next.js, turning product ideas into polished features.",
        "Contribute across the stack including Node.js and MySQL, driving product decisions end-to-end.",
      ],
    },
    {
      title: "Assistant Manager, Operations",
      company: "Marché Adonis",
      location: "Mississauga, ON",
      startDate: "Jun 2025",
      endDate: "Present",
      bullets: [
        "Promoted from Clerk after 7 years — leading daily operations and scheduling for a 13-person team.",
        "Serve as primary escalation contact, resolving real-time issues under high-volume conditions.",
      ],
    },
    {
      title: "Clerk",
      company: "Marché Adonis",
      location: "Mississauga, ON",
      startDate: "Nov 2017",
      endDate: "Jun 2025",
      bullets: [
        "Managed inventory, customer service, and floor operations while completing a full-time engineering degree.",
        "Built strong fundamentals in accountability, time management, and execution under pressure.",
      ],
    },
  ],
  education: [
    {
      degree: "B.Eng. Computer Engineering",
      institution: "York University — Lassonde School of Engineering",
      location: "Toronto, ON",
      graduationDate: "Jun 2025",
      gpa: "",
      relevantCourses: [
        "OOP (Java)",
        "Data Structures & Algorithms",
        "Operating Systems",
        "Communication Networks",
        "Software Engineering Principles",
      ],
    },
    {
      degree: "Electromechanical Engineering Technician (Completed Year 1)",
      institution: "Humber College",
      location: "Toronto, ON",
      graduationDate: "2023",
      gpa: "",
      relevantCourses: [
        "Introduction to Control Circuits",
        "Robotics",
        "Mechatronics",
        "Industrial Pneumatics",
        "Statics",
        "Engineering Graphics",
        "Engineering Materials",
        "Workshop Practices",
      ],
    },
  ],
  skills: [
    "Java",
    "Python",
    "JavaScript (ES6+)",
    "SQL",
    "Bash",
    "Node.js",
    "Express",
    "React.js",
    "Next.js",
    "RESTful APIs",
    "Docker",
    "Linux/Unix",
    "MySQL",
    "Git/GitHub",
  ],
  projects: [
    {
      title: "KonnectTaps",
      stack: "Next.js / React / MySQL",
      description:
        "Digital networking platform with 100+ users. Built frontend, contribute across full stack.",
      url: "https://ktaps.me",
    },
    {
      title: "CSA Capstone — SOSO",
      stack: "System Design",
      description:
        "Satellite telemetry visualization tool for the Canadian Space Agency.",
      url: "",
    },
  ],
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
