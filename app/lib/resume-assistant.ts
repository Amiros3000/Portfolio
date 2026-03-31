import type { ResumeContent } from "./resume-content";

/* ══════════════════════════════════════════
   AI Resume Assistant — zero-cost analysis
   engine using keyword matching. No API calls.
   ══════════════════════════════════════════ */

/* ── Types ── */

export type SkillMatch = {
  requirement: string;
  status: "matched" | "partial" | "missing";
  resumeEvidence?: string;
};

export type BulletSuggestion = {
  expIndex: number;
  bulletIndex: number;
  original: string;
  improved: string;
  reason: string;
};

export type JobAnalysis = {
  jobTitle: string;
  matchScore: number;
  matched: SkillMatch[];
  partial: SkillMatch[];
  missing: SkillMatch[];
  bulletSuggestions: BulletSuggestion[];
  sectionAdvice: string[];
  clarifyingQuestions: string[];
  summaryTip: string;
};

/* ── Tech Skill Dictionary ──
   Canonical name → aliases (all lowercase). */

const TECH_SKILLS: Record<string, string[]> = {
  // Languages
  javascript: ["javascript", "js", "es6", "es6+", "ecmascript"],
  typescript: ["typescript", "ts"],
  python: ["python", "python3"],
  java: ["java"],
  "c++": ["c++", "cpp"],
  "c#": ["c#", "csharp", ".net"],
  go: ["golang", "go lang"],
  rust: ["rust", "rustlang"],
  ruby: ["ruby"],
  php: ["php"],
  swift: ["swift"],
  kotlin: ["kotlin"],
  scala: ["scala"],
  sql: ["sql"],
  bash: ["bash", "shell scripting"],
  html: ["html", "html5"],
  css: ["css", "css3"],

  // Frontend
  react: ["react", "react.js", "reactjs"],
  angular: ["angular", "angularjs"],
  vue: ["vue", "vue.js", "vuejs"],
  svelte: ["svelte", "sveltekit"],
  "next.js": ["next.js", "nextjs"],
  tailwind: ["tailwind", "tailwindcss", "tailwind css"],
  redux: ["redux"],

  // Backend
  "node.js": ["node.js", "nodejs", "node"],
  express: ["express", "express.js", "expressjs"],
  django: ["django"],
  flask: ["flask"],
  "spring boot": ["spring boot", "spring"],
  rails: ["rails", "ruby on rails"],
  fastapi: ["fastapi", "fast api"],

  // Databases
  mysql: ["mysql"],
  postgresql: ["postgresql", "postgres"],
  mongodb: ["mongodb", "mongo"],
  redis: ["redis"],
  dynamodb: ["dynamodb"],
  sqlite: ["sqlite"],

  // DevOps / Infra
  docker: ["docker", "containers", "containerization"],
  kubernetes: ["kubernetes", "k8s"],
  aws: ["aws", "amazon web services"],
  gcp: ["gcp", "google cloud"],
  azure: ["azure", "microsoft azure"],
  terraform: ["terraform"],
  "ci/cd": ["ci/cd", "cicd", "continuous integration", "continuous deployment", "github actions", "jenkins"],
  linux: ["linux", "unix"],
  nginx: ["nginx"],

  // Tools
  git: ["git", "github", "gitlab", "version control"],
  "rest api": ["rest", "restful", "rest api", "restful api"],
  graphql: ["graphql"],
  webpack: ["webpack"],
  vite: ["vite"],
  jest: ["jest"],
  cypress: ["cypress"],
  figma: ["figma"],
  jira: ["jira"],

  // Concepts
  agile: ["agile", "scrum", "kanban"],
  microservices: ["microservices"],
  "system design": ["system design"],
  "data structures": ["data structures", "algorithms"],
  "machine learning": ["machine learning", "ml", "ai"],
  "distributed systems": ["distributed systems"],
  "tcp/ip": ["tcp/ip", "tcp", "networking protocols"],
};

// Reverse lookup: alias → canonical name
const ALIAS_TO_CANONICAL: Record<string, string> = {};
for (const [canonical, aliases] of Object.entries(TECH_SKILLS)) {
  for (const alias of aliases) {
    ALIAS_TO_CANONICAL[alias] = canonical;
  }
  ALIAS_TO_CANONICAL[canonical] = canonical;
}

// Related skill groups for partial matching
const RELATED_SKILLS: Record<string, string[]> = {
  javascript: ["typescript"],
  typescript: ["javascript"],
  react: ["next.js", "vue", "angular"],
  "next.js": ["react"],
  "node.js": ["express"],
  express: ["node.js"],
  mysql: ["postgresql", "sql"],
  postgresql: ["mysql", "sql"],
  sql: ["mysql", "postgresql"],
  docker: ["kubernetes"],
  kubernetes: ["docker"],
  aws: ["gcp", "azure"],
  gcp: ["aws", "azure"],
  azure: ["aws", "gcp"],
  python: ["java"],
  java: ["python", "kotlin"],
  "ci/cd": ["git", "docker"],
  git: ["ci/cd"],
  linux: ["bash"],
  bash: ["linux"],
  angular: ["react", "vue"],
  vue: ["react", "angular"],
  mongodb: ["mysql", "postgresql"],
  redis: ["mongodb"],
  graphql: ["rest api"],
  "rest api": ["graphql"],
};

/* ── Helpers ── */

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function normalize(s: string): string {
  return s.toLowerCase().trim();
}

/** Resolve a string to its canonical skill name. */
function resolveSkill(input: string): string | null {
  const norm = normalize(input);
  if (ALIAS_TO_CANONICAL[norm]) return ALIAS_TO_CANONICAL[norm];

  // Try without parentheticals: "JavaScript (ES6+)" → "javascript"
  const withoutParens = norm.replace(/\s*\([^)]*\)\s*/g, " ").trim();
  if (ALIAS_TO_CANONICAL[withoutParens]) return ALIAS_TO_CANONICAL[withoutParens];

  // Try splitting on / and ,
  for (const part of norm.split(/[/,]+/)) {
    const trimmed = part.trim();
    if (ALIAS_TO_CANONICAL[trimmed]) return ALIAS_TO_CANONICAL[trimmed];
  }

  // Try each word
  for (const word of norm.split(/[\s,/]+/)) {
    if (word.length >= 2 && ALIAS_TO_CANONICAL[word]) return ALIAS_TO_CANONICAL[word];
  }

  return null;
}

/** Build a single searchable string from all resume content. */
function getResumeFullText(resume: ResumeContent): string {
  return [
    resume.summary,
    ...resume.skills,
    ...resume.experience.flatMap((e) => [e.title, e.company, ...e.bullets]),
    ...resume.education.flatMap((e) => [
      e.degree,
      e.institution,
      ...e.relevantCourses,
    ]),
    ...resume.projects.flatMap((p) => [p.title, p.stack, p.description]),
  ]
    .join(" ")
    .toLowerCase();
}

/** Word-boundary–safe regex test for a skill alias in text. */
function skillRegex(alias: string): RegExp {
  const escaped = escapeRegex(alias);
  return new RegExp(
    `(?:^|[\\s,;(./\\-])${escaped}(?=[\\s,;).:/\\-]|$)`,
    "i",
  );
}

/* ── Job Posting Parser ── */

function extractJobTitle(text: string): string {
  const lines = text
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

  for (const line of lines.slice(0, 8)) {
    const m = line.match(
      /^(?:job\s+title|position|role|title)\s*[:–—-]\s*(.+)/i,
    );
    if (m) return m[1].trim();
  }

  // First line if short enough to be a title
  if (lines[0] && lines[0].length < 80 && !lines[0].includes(". ")) {
    return lines[0];
  }
  return "this role";
}

function extractSkillsFromPosting(text: string): string[] {
  const found = new Set<string>();
  const lower = normalize(text);

  for (const [canonical, aliases] of Object.entries(TECH_SKILLS)) {
    for (const alias of [canonical, ...aliases]) {
      if (skillRegex(alias).test(lower)) {
        found.add(canonical);
        break;
      }
    }
  }

  return Array.from(found);
}

function detectExperienceYears(text: string): number | null {
  const m = text.match(
    /(\d+)\+?\s*(?:years?|yrs?)\s+(?:of\s+)?(?:experience|exp)/i,
  );
  return m ? parseInt(m[1], 10) : null;
}

/* ── Skill Matching ── */

function findEvidence(skill: string, resume: ResumeContent): string {
  // Direct skill listing
  const directSkill = resume.skills.find((s) => {
    const canonical = resolveSkill(s);
    return canonical === skill || normalize(s) === skill;
  });
  if (directSkill) return `Skills: "${directSkill}"`;

  // Experience bullets
  for (const exp of resume.experience) {
    for (const bullet of exp.bullets) {
      const aliases = TECH_SKILLS[skill] ?? [skill];
      if (aliases.some((a) => skillRegex(a).test(bullet))) {
        return `${exp.title} at ${exp.company}`;
      }
    }
  }

  // Projects
  for (const proj of resume.projects) {
    const projText = `${proj.stack} ${proj.description}`;
    const aliases = TECH_SKILLS[skill] ?? [skill];
    if (aliases.some((a) => skillRegex(a).test(projText))) {
      return `Project: ${proj.title}`;
    }
  }

  // Courses
  for (const edu of resume.education) {
    for (const course of edu.relevantCourses) {
      if (normalize(course).includes(skill)) return `Course: ${course}`;
    }
  }

  return "Found in resume";
}

function matchSkills(
  jobSkills: string[],
  resume: ResumeContent,
): { matched: SkillMatch[]; partial: SkillMatch[]; missing: SkillMatch[] } {
  const resumeText = getResumeFullText(resume);

  // Build set of canonical skills present in resume
  const resumeCanonical = new Set<string>();

  // From skills array
  for (const skill of resume.skills) {
    const canonical = resolveSkill(skill);
    if (canonical) resumeCanonical.add(canonical);
  }

  // From full resume text (experience, projects, courses, etc.)
  for (const [canonical, aliases] of Object.entries(TECH_SKILLS)) {
    for (const alias of [canonical, ...aliases]) {
      if (skillRegex(alias).test(resumeText)) {
        resumeCanonical.add(canonical);
        break;
      }
    }
  }

  const matched: SkillMatch[] = [];
  const partial: SkillMatch[] = [];
  const missing: SkillMatch[] = [];

  for (const jobSkill of jobSkills) {
    if (resumeCanonical.has(jobSkill)) {
      matched.push({
        requirement: jobSkill,
        status: "matched",
        resumeEvidence: findEvidence(jobSkill, resume),
      });
      continue;
    }

    // Partial: related skills
    const related = RELATED_SKILLS[jobSkill] ?? [];
    const relatedMatch = related.find((r) => resumeCanonical.has(r));
    if (relatedMatch) {
      partial.push({
        requirement: jobSkill,
        status: "partial",
        resumeEvidence: `Related: you have ${relatedMatch}`,
      });
      continue;
    }

    missing.push({ requirement: jobSkill, status: "missing" });
  }

  return { matched, partial, missing };
}

/* ── Bullet Suggestions ── */

const WEAK_VERB_PATTERNS: {
  pattern: RegExp;
  replacements: string[];
  reason: string;
}[] = [
  {
    pattern: /^worked (on|with)\s/i,
    replacements: ["Developed", "Built", "Engineered"],
    reason: "Replace 'worked on' with a specific action verb",
  },
  {
    pattern: /^helped\s/i,
    replacements: ["Enabled", "Supported", "Facilitated"],
    reason: "Replace 'helped' with a stronger verb",
  },
  {
    pattern: /^(?:was |were )?responsible for\s/i,
    replacements: ["Led", "Managed", "Oversaw"],
    reason: "Lead with action, not responsibility",
  },
  {
    pattern: /^(?:did|made)\s/i,
    replacements: ["Delivered", "Created", "Executed"],
    reason: "Use a more impactful action verb",
  },
  {
    pattern: /^involved in\s/i,
    replacements: ["Drove", "Contributed to", "Spearheaded"],
    reason: "Show active involvement",
  },
  {
    pattern: /^assisted\s/i,
    replacements: ["Supported", "Partnered on", "Collaborated on"],
    reason: "Use an empowering verb",
  },
  {
    pattern: /^handled\s/i,
    replacements: ["Managed", "Resolved", "Coordinated"],
    reason: "Be more specific about what you did",
  },
  {
    pattern: /^used\s/i,
    replacements: ["Leveraged", "Applied", "Utilized"],
    reason: "Use a more professional verb",
  },
  {
    pattern: /^tried to\s/i,
    replacements: ["Pursued", "Implemented", "Initiated"],
    reason: "Remove hedging language",
  },
  {
    pattern: /^got\s/i,
    replacements: ["Achieved", "Earned", "Secured"],
    reason: "Use a results-oriented verb",
  },
];

function analyzeBullets(
  resume: ResumeContent,
  jobSkills: string[],
): BulletSuggestion[] {
  const suggestions: BulletSuggestion[] = [];

  for (let ei = 0; ei < resume.experience.length; ei++) {
    const exp = resume.experience[ei];
    for (let bi = 0; bi < exp.bullets.length; bi++) {
      const bullet = exp.bullets[bi];
      if (bullet.length < 10) continue;

      // Weak verb replacement
      let foundWeakVerb = false;
      for (const { pattern, replacements, reason } of WEAK_VERB_PATTERNS) {
        if (pattern.test(bullet)) {
          const rest = bullet.replace(pattern, "");
          const improved = `${replacements[0]} ${rest.charAt(0).toLowerCase()}${rest.slice(1)}`;
          suggestions.push({
            expIndex: ei,
            bulletIndex: bi,
            original: bullet,
            improved,
            reason,
          });
          foundWeakVerb = true;
          break;
        }
      }

      // Quantification suggestion (only if no weak verb found)
      if (!foundWeakVerb && !/\d/.test(bullet)) {
        suggestions.push({
          expIndex: ei,
          bulletIndex: bi,
          original: bullet,
          improved: bullet,
          reason:
            "Consider adding metrics (team size, user count, percentage improvement) to quantify impact",
        });
      }
    }
  }

  // Keyword incorporation tips: find matched job skills that aren't
  // mentioned in any experience bullet
  const matchedSkillsInBullets = new Set<string>();
  const allBulletText = resume.experience
    .flatMap((e) => e.bullets)
    .join(" ")
    .toLowerCase();

  for (const skill of jobSkills) {
    const aliases = TECH_SKILLS[skill] ?? [skill];
    if (aliases.some((a) => skillRegex(a).test(allBulletText))) {
      matchedSkillsInBullets.add(skill);
    }
  }

  // Find matched skills from the resume that aren't in any bullet
  const resumeCanonical = new Set<string>();
  for (const s of resume.skills) {
    const c = resolveSkill(s);
    if (c) resumeCanonical.add(c);
  }

  const missingFromBullets = jobSkills.filter(
    (s) => resumeCanonical.has(s) && !matchedSkillsInBullets.has(s),
  );

  if (missingFromBullets.length > 0 && resume.experience.length > 0) {
    const skillList = missingFromBullets.slice(0, 3).join(", ");
    // Add as a general tip for the most relevant experience entry
    suggestions.push({
      expIndex: 0,
      bulletIndex: -1, // -1 signals a general tip, not a specific bullet
      original: "",
      improved: "",
      reason: `Your skills list includes ${skillList}, but they're not mentioned in your experience bullets. Consider weaving these keywords into relevant bullets for better ATS matching.`,
    });
  }

  return suggestions;
}

/* ── Section Advice ── */

function generateSectionAdvice(
  matched: SkillMatch[],
  missing: SkillMatch[],
  resume: ResumeContent,
  jobTitle: string,
): string[] {
  const advice: string[] = [];

  // Check if projects show more technical relevance than experience
  const projectSkillCount = (() => {
    let count = 0;
    for (const proj of resume.projects) {
      const projText = normalize(`${proj.stack} ${proj.description}`);
      for (const m of matched) {
        if (projText.includes(m.requirement)) {
          count++;
          break;
        }
      }
    }
    return count;
  })();

  if (projectSkillCount >= 2 && resume.projects.length >= 2) {
    advice.push(
      "Consider moving Projects above Experience \u2014 your project work demonstrates strong technical relevance for this role.",
    );
  }

  // Skills section prominence
  if (matched.length >= 4) {
    advice.push(
      "Your skills are a strong match. Keep the Skills section prominent \u2014 place it right after your Summary.",
    );
  }

  // Summary gap-filling
  if (missing.length > 0 && missing.length <= 3) {
    const names = missing.map((m) => m.requirement).join(", ");
    advice.push(
      `Your summary could mention awareness of ${names} if you have any exposure, even from personal projects or coursework.`,
    );
  }

  // Experience ordering: check if a non-first experience is more relevant
  if (resume.experience.length > 1) {
    const expScores = resume.experience.map((exp) => {
      const text = normalize(
        [exp.title, exp.company, ...exp.bullets].join(" "),
      );
      return matched.filter((m) => text.includes(m.requirement)).length;
    });

    const maxIdx = expScores.indexOf(Math.max(...expScores));
    if (maxIdx > 0 && expScores[maxIdx] > expScores[0]) {
      const betterExp = resume.experience[maxIdx];
      advice.push(
        `Consider leading Experience with "${betterExp.title} at ${betterExp.company}" \u2014 it has the most relevant skills for ${jobTitle}.`,
      );
    }
  }

  // Education relevance
  const hasRelevantCourses = resume.education.some(
    (e) => e.relevantCourses.length > 0,
  );
  if (hasRelevantCourses && matched.length < 3) {
    advice.push(
      "Your relevant coursework helps fill skill gaps. Keep Education visible and highlight courses related to this role.",
    );
  }

  // Experience years note
  if (advice.length === 0) {
    advice.push(
      "Your resume sections are well-ordered for this role. Focus on tailoring bullet points to emphasize the most relevant achievements.",
    );
  }

  return advice;
}

/* ── Clarifying Questions ── */

function generateClarifyingQuestions(
  missing: SkillMatch[],
  resume: ResumeContent,
): string[] {
  const questions: string[] = [];
  const resumeText = getResumeFullText(resume);

  for (const skill of missing) {
    const related = RELATED_SKILLS[skill.requirement] ?? [];
    const hasRelated = related.some((r) => resumeText.includes(r));

    if (hasRelated) {
      questions.push(
        `Have you used ${skill.requirement} in any capacity? You have related skills that could transfer.`,
      );
    } else {
      questions.push(
        `Do you have experience with ${skill.requirement}? Even coursework or personal exploration counts \u2014 add it to your skills.`,
      );
    }
  }

  return questions.slice(0, 5);
}

/* ── Summary Tip ── */

function generateSummaryTip(
  matchScore: number,
  jobTitle: string,
  matched: SkillMatch[],
  missing: SkillMatch[],
  jobText: string,
): string {
  const yearsReq = detectExperienceYears(jobText);
  const yearsNote = yearsReq
    ? ` This role asks for ${yearsReq}+ years of experience \u2014 emphasize the depth and impact of your work.`
    : "";

  if (matchScore >= 80) {
    return `Strong match for ${jobTitle}! Focus on tailoring your bullet points to highlight the most relevant achievements.${yearsNote}`;
  }
  if (matchScore >= 60) {
    return `Good match for ${jobTitle}. You have the core skills \u2014 address the gaps by highlighting transferable experience and any exposure to the missing technologies.${yearsNote}`;
  }
  if (matchScore >= 40) {
    return `Moderate match for ${jobTitle}. Lead with your strongest matching skills and frame your experience to show adaptability and quick learning ability.${yearsNote}`;
  }
  return `This role requires skills outside your current profile. Emphasize your ability to learn quickly and any tangential experience.${yearsNote}`;
}

/* ── Main Export ── */

export function analyzeJobPosting(
  jobText: string,
  resume: ResumeContent,
): JobAnalysis {
  const jobTitle = extractJobTitle(jobText);
  const jobSkills = extractSkillsFromPosting(jobText);
  const { matched, partial, missing } = matchSkills(jobSkills, resume);
  const bulletSuggestions = analyzeBullets(resume, jobSkills);
  const sectionAdvice = generateSectionAdvice(
    matched,
    missing,
    resume,
    jobTitle,
  );
  const clarifyingQuestions = generateClarifyingQuestions(missing, resume);

  const total = matched.length + partial.length + missing.length;
  const matchScore =
    total > 0
      ? Math.round(((matched.length + partial.length * 0.5) / total) * 100)
      : 0;

  const summaryTip = generateSummaryTip(
    matchScore,
    jobTitle,
    matched,
    missing,
    jobText,
  );

  return {
    jobTitle,
    matchScore,
    matched,
    partial,
    missing,
    bulletSuggestions,
    sectionAdvice,
    clarifyingQuestions,
    summaryTip,
  };
}
