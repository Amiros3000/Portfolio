export type KnowledgeEntry = {
  id: string;
  keywords: string[];
  patterns: RegExp[];
  question: string;
  answer: string;
  followUps?: string[];
  /** If set, the bot asks this counter-question first before answering. */
  counterQuestion?: string;
  /** Map of keyword-based context from user's counter-answer to a tailored response. */
  contextResponses?: Record<string, string>;
};

/*
  Every claim here has to match the site copy and be defensible in an interview.
  Standing corrections, do not reintroduce:
   - KonnectTaps: Amir was FRONTEND. Three developers, not two. Payments were
     Stripe and were built by the CEO — never attribute them to Amir. 100+
     SIGNUPS (not active users). Wound down May 2026. ktaps.me is retired.
   - FootPal FC: renamed from "FootPal". 25+ active users across three crews.
     Its service worker is an OFFLINE FALLBACK — never "offline support".
   - Marché Adonis title is Assistant Deli Manager.
   - No Express anywhere; backend is Next.js API routes and FastAPI.
*/
const knowledgeBase: KnowledgeEntry[] = [
  {
    id: "greeting",
    keywords: ["hi", "hello", "hey", "sup", "yo", "greetings"],
    patterns: [/^(hi|hello|hey|howdy|greetings|sup|yo)$/i, /what('s| is) up/i],
    question: "Say hello",
    answer:
      "Hey! I’m Amir’s portfolio assistant. I can tell you about his background, skills, projects, or how he’d fit your team. What would you like to know?",
    followUps: ["background", "fit", "skills", "projects"],
  },
  {
    id: "background",
    keywords: ["background", "about", "who", "introduce", "bio", "summary", "overview"],
    patterns: [
      /who (is|are) (amir|he|you)/i,
      /tell me about (amir|him|yourself)/i,
      /what do you know/i,
      /about amir/i,
      /give me .*(summary|overview|background)/i,
    ],
    question: "Who is Amir?",
    answer:
      "Amir Ibrahim is a full-stack software developer and Computer Engineering graduate from York University (2025), based in the GTA. He works in TypeScript, Next.js, React, PostgreSQL, and Python. His main project is FootPal FC, which he’s been building since June 2026 — a 27-model Postgres schema, 109 HTTP handlers, and 175 test blocks, now used by 25+ players across three crews. Before that he co-founded KonnectTaps, where he built the frontend. He’s also worked at Marché Adonis since 2017, now as Assistant Deli Manager.",
    followUps: ["footpal", "experience", "skills"],
  },
  {
    id: "skills",
    keywords: ["skills", "stack", "languages", "tools", "technologies", "programming"],
    patterns: [
      /what (languages|skills|tech|technologies)/i,
      /what can (he|amir) (do|code|build|use)/i,
      /tech stack/i,
      /what does (he|amir) (know|code in|work with|use)/i,
      /technical skills/i,
    ],
    question: "What are his skills?",
    answer:
      "Languages: JavaScript (ES6+), TypeScript, Python, Java, SQL, Bash. Frontend: React, Next.js (App Router/RSC), Tailwind, PWA (Web Push, installable). Backend: Node.js, FastAPI, PostgreSQL, Prisma, MySQL — his backend work is Next.js API routes and FastAPI. Testing and observability: Vitest, Sentry. Infrastructure: Docker, GitHub Actions, Git/GitHub, Vercel, Linux/Ubuntu, Nginx. He’s also familiar with Ladder Logic and IT/OT networking from his engineering studies, though software is his focus.",
    followUps: ["projects", "currently-learning"],
  },
  {
    id: "projects",
    keywords: ["projects", "built", "portfolio", "shipped", "products"],
    patterns: [
      /what (has he|have you|did he) (built|made|shipped|worked on|create)/i,
      /projects/i,
      /show me.*(work|projects)/i,
      /what (has|did) (he|amir) (build|make|ship)/i,
    ],
    question: "What has he built?",
    answer:
      "Three things worth knowing about: (1) FootPal FC — his flagship, a pickup-soccer logistics app he’s been building since June 2026, now at v2.43.0 across 457 commits. (2) KonnectTaps — a digital business card platform he co-founded and built the frontend for; it reached 100+ signups and wound down in May 2026. (3) SOSO — a satellite telemetry visualization tool built for a Canadian Space Agency capstone. The Flagship section of the site goes into the actual engineering decisions behind FootPal FC.",
    followUps: ["footpal", "konnecttaps", "experience"],
  },
  {
    id: "konnecttaps",
    keywords: ["konnecttaps", "konnect", "ktaps"],
    patterns: [/konnect\s?taps/i, /ktaps/i, /co-?found/i, /networking (platform|app|tool)/i],
    question: "Tell me about KonnectTaps",
    answer:
      "KonnectTaps was a digital business card platform Amir co-founded in January 2024. He built the frontend in React and Next.js, working alongside two other developers, and contributed to scope and product direction. He did not build the payment integration — that was Stripe, and the CEO built it. The platform reached 100+ signups and wound down in May 2026. The site is konnecttaps.com.",
    followUps: ["footpal", "projects", "strengths"],
  },
  {
    id: "footpal",
    keywords: ["footpal", "soccer", "scheduling", "pwa", "football", "crew"],
    patterns: [/foot\s?pal/i, /soccer/i, /scheduling (app|pwa|tool)/i],
    question: "Tell me about FootPal FC",
    answer:
      "FootPal FC organizes recurring pickup soccer — RSVPs, team drafting, cost splitting, and player ratings — across independent crews. It’s used by 25+ players in three crews, two of them outside Amir’s own friend circle (Montreal and Mississauga). Built on Next.js 15, TypeScript, PostgreSQL (Neon), Prisma, Web Push, Sentry, and Vercel. As of the July 31, 2026 code audit: 27 Postgres models, 109 HTTP handlers across 81 route files, 175 test blocks across 15 suites, 457 commits, v2.43.0. Live at footpalfc.amiribrahim3000.com.",
    followUps: ["footpal-engineering", "projects", "skills"],
  },
  {
    id: "footpal-engineering",
    keywords: ["auth", "multi-tenancy", "tenancy", "architecture", "engineering", "database", "schema", "performance", "idempotency"],
    patterns: [
      /how (does|did) .*(footpal|it) work/i,
      /(technical|engineering) (detail|decision|depth)/i,
      /(multi.?tenan|idempoten|service worker|session auth)/i,
      /architecture/i,
    ],
    question: "What's technically interesting about FootPal FC?",
    answer:
      "A few decisions: crew-scoped data isolation is enforced by explicit application-layer guards called per route — no Postgres RLS, no Prisma middleware. Session auth is written from scratch with no auth library: the cookie carries the plaintext token and the database stores only the SHA-256 hash, with a three-tier resolution path that migrated existing accounts on read without logging anyone out. Man-of-the-match awards fire exactly once whether triggered by the final vote or a fallback cron. Game-page load went from ~3.3s to ~1.1s by batching 8 sequential Prisma reads into one parallel fetch and adding three indexes after EXPLAIN showed sequential scans — measured by hand, not by a benchmark harness. Kickoff times resolve to UTC through Intl.DateTimeFormat.formatToParts, with zero date libraries in package.json. The hand-written service worker serves a branded offline page and deliberately caches nothing — stale rosters and costs would be worse than a clear offline page.",
    followUps: ["footpal", "skills", "fit"],
  },
  {
    id: "experience",
    keywords: ["experience", "career", "employment", "adonis", "marche", "worked"],
    patterns: [
      /work (history|experience)/i,
      /where (has he|have you|did he|does he) work/i,
      /experience/i,
      /career history/i,
      /previous (jobs|roles|positions)/i,
    ],
    question: "What’s his experience?",
    answer:
      "Two threads: (1) Co-Founder at KonnectTaps (Jan 2024 – May 2026) — built the frontend in React/Next.js alongside two other developers; the platform reached 100+ signups before winding down. (2) Marché Adonis (Nov 2017 – Present) — started as a Clerk, promoted to Assistant Deli Manager in June 2025 after seven years, now running daily operations and scheduling for a 13-person team. He balanced both while completing his Computer Engineering degree full-time.",
    followUps: ["education", "fit"],
  },
  {
    id: "education",
    keywords: ["education", "degree", "university", "school", "york", "lassonde", "humber", "graduated", "courses"],
    patterns: [
      /where did (he|you|amir) (study|go to school|graduate)/i,
      /education/i,
      /(degree|university|college)/i,
      /what did (he|amir) study/i,
      /humber/i,
    ],
    question: "Where did he study?",
    answer:
      "Two programs: (1) B.Eng. in Computer Engineering from York University’s Lassonde School of Engineering, graduated June 2025. Coursework: OOP (Java), Data Structures & Algorithms, Operating Systems, Communication Networks, and Software Engineering Principles. (2) Electromechanical Engineering Technician at Humber College (2022–2023, completed Year 1). Coursework: Control Circuits, Robotics, Mechatronics, Industrial Pneumatics, Statics, Engineering Graphics, and Engineering Materials.",
    followUps: ["skills", "experience"],
  },
  {
    id: "availability",
    keywords: ["available", "availability", "hiring"],
    patterns: [
      /is (he|amir) available/i,
      /can (he|amir) start/i,
      /when.*(available|start)/i,
      /^(are you|is he) (available|open|looking)/i,
    ],
    question: "Is he available?",
    answer:
      "Yes — Amir is available immediately. He’s looking for Software Developer, Full-Stack Developer, or Frontend Engineer roles, remote or hybrid in the GTA, Ontario. What kind of role are you hiring for? I can tell you more about how he’d fit.",
    followUps: ["fit", "roles", "contact"],
  },
  {
    id: "roles",
    keywords: ["roles", "position", "seeking", "targeting"],
    patterns: [
      /what (roles|positions|jobs) (is he|does he)/i,
      /what is (he|amir) looking for/i,
      /type of (role|job|work|position)/i,
      /what kind of (role|job|work|position)/i,
    ],
    question: "What roles is he targeting?",
    answer:
      "Software Developer, Full-Stack Developer, and Frontend Engineer positions. He builds products end-to-end, from the frontend UI to the backend and deployment, in TypeScript, Next.js, React, and PostgreSQL. Open to remote or hybrid in the GTA.",
    followUps: ["availability", "contact", "fit"],
  },
  {
    id: "contact",
    keywords: ["contact", "email", "reach", "github", "linkedin"],
    patterns: [
      /how (can I|do I|to) (contact|reach|connect|email)/i,
      /email (address|him|amir)/i,
      /get in touch/i,
      /reach (out|him|amir)/i,
    ],
    question: "How to contact him?",
    answer:
      "Email: amir.ibrahim3000@gmail.com • GitHub: github.com/Amiros3000 • LinkedIn: linkedin.com/in/amir3000. There’s also a contact form in the Contact section.",
    followUps: ["availability"],
  },
  {
    id: "location",
    keywords: ["location", "based", "city", "gta", "ontario", "toronto"],
    patterns: [
      /where (is he|are you|does he) (based|located|live)/i,
      /location/i,
      /(remote|hybrid|onsite|on-site|in.?person)/i,
    ],
    question: "Where is he located?",
    answer:
      "Based in the GTA (Greater Toronto Area), Ontario, Canada. Open to remote or hybrid work.",
    followUps: ["availability", "contact"],
  },
  {
    id: "currently-learning",
    keywords: ["learning", "studying", "exploring", "improving", "upskilling"],
    patterns: [
      /what (is he|are you|is amir) (learning|studying|exploring)/i,
      /currently (learning|studying|exploring)/i,
      /what.*next/i,
    ],
    question: "What is he learning?",
    answer:
      "Currently AWS and Kubernetes. TypeScript, Next.js, and CI/CD aren’t exploratory anymore — he ships production apps with them. He learns by building: the session auth, the multi-tenancy guards, and the DST handling in FootPal FC were all written from scratch rather than pulled from a library.",
    followUps: ["skills", "footpal-engineering"],
  },
  {
    id: "fit",
    keywords: ["fit", "suitable", "good", "right", "match", "candidate"],
    patterns: [
      /would (he|amir) (fit|be good|be right|be suitable|work well)/i,
      /(good|right|suitable) (fit|candidate|match)/i,
      /why.*(hire|choose|pick|consider) (him|amir)/i,
      /should (we|i) (hire|consider|interview) (him|amir)/i,
      /why (him|amir)/i,
    ],
    question: "Why hire Amir?",
    answer: "",
    counterQuestion:
      "Good question — what kind of role or team is this for? For example: startup, product team, agency, or enterprise.",
    contextResponses: {
      startup:
        "Amir works like an early-stage engineer. He’s been building FootPal FC since June 2026 — 457 commits, 109 route handlers, 175 test blocks — deciding the schema, the auth, and the release cadence himself. He also co-founded KonnectTaps and built its frontend with two other developers. He’s used to owning scope and shipping without a lot of structure around him.",
      product:
        "Amir builds for real use, not for a portfolio. FootPal FC came out of a problem in his own life and is now used by 25+ players in three crews, two of which he isn’t part of. He makes explicit product calls and can tell you what each one cost — for example, the service worker deliberately caches nothing, because showing someone a stale roster or cost split is worse than showing a clear offline page.",
      agency:
        "Amir ramps up fast and context-switches well — he balanced a full engineering degree with co-founding a company and working at Marché Adonis. He works across the stack in TypeScript, Next.js, PostgreSQL, and Python, and he tests what he ships (175 test blocks across 15 suites in FootPal FC).",
      enterprise:
        "Amir brings a Computer Engineering degree plus seven-plus years of operational discipline at Marché Adonis, where he now runs daily operations for a 13-person team. On the engineering side he’s deliberate about correctness: per-route access guards for tenant isolation, exactly-once award processing under concurrent triggers, and a single PII-scrubbing chokepoint for all error reporting.",
      controls:
        "Amir has a crossover background: a Computer Engineering degree from York plus electromechanical engineering studies at Humber covering control circuits, robotics, mechatronics, and industrial pneumatics. He understands IT/OT networking and ladder logic alongside modern web development, though software is where he works day to day.",
      systems:
        "Amir’s Computer Engineering degree covers networking, operating systems, and distributed systems, and his Humber studies add control circuits and industrial automation. In practice that shows up as systems thinking in his software: crew-scoped isolation enforced at every call site, idempotent award processing that leans on the database to serialize, and DST-correct time handling with no date library.",
      _default:
        "Amir combines a Computer Engineering degree, seven-plus years of professional accountability at Marché Adonis, and a substantial codebase he can talk through in depth. FootPal FC is 27 Postgres models, 109 HTTP handlers, and 175 test blocks, and he can explain why the session auth stores only a SHA-256 hash, why there’s no date library, and why the service worker caches nothing. He’s a 2025 grad, but he’s not short on things to defend in an interview.",
    },
    followUps: ["strengths", "footpal-engineering", "projects"],
  },
  {
    id: "strengths",
    keywords: ["strengths", "strong", "best", "excels", "advantages"],
    patterns: [
      /what (are|is) (his|amir.?s) (strengths?|best|strongest)/i,
      /what (does he|is he) (good|great|best) at/i,
      /where does (he|amir) excel/i,
      /strongest/i,
    ],
    question: "What are his strengths?",
    answer:
      "(1) Depth on one real codebase — FootPal FC is 457 commits deep and he can explain the reasoning behind the schema, the auth, and the caching policy. (2) Frontend craft — that was his role at KonnectTaps and it’s where he’s strongest. (3) Correctness over convenience — he writes things from scratch when a library would hide a behaviour he needs to control, like DST handling and session tokens. (4) Operational reliability — seven-plus years running high-volume shifts at Marché Adonis. (5) He tests: 175 test blocks across 15 suites.",
    followUps: ["fit", "skills", "weaknesses"],
  },
  {
    id: "weaknesses",
    keywords: ["weaknesses", "weakness", "lack", "lacking", "gaps", "improve", "shortcomings", "concerns"],
    patterns: [
      /what (does he|is he) (lack|lacking|missing|weak|bad)/i,
      /(weakness|weaknesses|shortcoming|concern|gap)/i,
      /where (can|does|should) (he|amir) improve/i,
      /any (concerns|downsides|red flags)/i,
      /what.*lack/i,
      /what.*weak/i,
    ],
    question: "Any areas for growth?",
    answer:
      "Straight answer: Amir graduated in 2025 and hasn’t worked on a large engineering team yet — most of his code has been written solo or in a group of three. He’s also open about using AI coding tools, and about where his own measurements stop: the FootPal FC performance numbers were taken by hand on one page, not from a benchmark harness. What he does have is a real codebase he can defend line by line, and a habit of naming the tradeoff rather than hiding it.",
    followUps: ["currently-learning", "fit", "strengths"],
  },
  {
    id: "team-fit",
    keywords: ["team", "culture", "collaborate", "communication", "values"],
    patterns: [
      /team (fit|player|culture)/i,
      /work.*(team|others|collaborat)/i,
      /how does (he|amir) (collaborate|communicate|work with)/i,
      /culture fit/i,
    ],
    question: "Is he a team player?",
    answer:
      "He’s independent by default but he’s led people: he runs scheduling, escalations, and daily operations for a 13-person team at Marché Adonis. At KonnectTaps he worked with two other developers on a shared codebase and on product direction. He’s open to both startup pace and structured environments with mentorship — the latter is where he’d grow fastest right now.",
    followUps: ["fit", "experience", "strengths"],
  },
  {
    id: "startup",
    keywords: ["startup", "startups", "scrappy", "early stage"],
    patterns: [
      /startup/i,
      /early.?stage/i,
      /small (team|company)/i,
      /scrappy/i,
    ],
    question: "Good for startups?",
    answer:
      "Yes. He co-founded KonnectTaps and built its frontend, and he’s been running FootPal FC end-to-end since June 2026 — schema, auth, routes, tests, releases. He’s comfortable deciding scope, shipping without much process, and living with the consequences of his own tradeoffs.",
    followUps: ["konnecttaps", "footpal", "fit"],
  },
  {
    id: "resume",
    keywords: ["resume", "cv"],
    patterns: [/resume/i, /\bcv\b/i, /download.*(resume|cv)/i],
    question: "Can I see his resume?",
    answer:
      "Amir tailors his resume per opportunity, so there isn’t a generic one posted here. This site covers his background, stack, projects, and experience. For a resume matched to your role, use the contact form or email amir.ibrahim3000@gmail.com.",
    followUps: ["contact", "background"],
  },
  {
    id: "passion",
    keywords: ["passion", "passionate", "enjoy", "loves", "excited", "interest", "interests", "motivated"],
    patterns: [
      /what (is he|does he|is amir) (passionate|excited|interested) about/i,
      /what (drives|motivates) (him|amir)/i,
      /what does (he|amir) (love|enjoy|like) (doing|about|to)/i,
    ],
    question: "What’s he passionate about?",
    answer:
      "Building things people actually use, and being able to explain why each part works the way it does. FootPal FC started as a problem in his own life and is now run by three crews, two of which he isn’t part of. He’s especially drawn to frontend and UI work, but he’s built the schema, the auth, and the background jobs behind it too.",
    followUps: ["footpal", "footpal-engineering", "skills"],
  },
  {
    id: "self-taught",
    keywords: ["self-taught", "autodidact", "learn", "taught"],
    patterns: [
      /how did (he|amir) learn/i,
      /self.?taught/i,
      /teach himself/i,
      /how.*learn/i,
    ],
    question: "How did he learn?",
    answer:
      "By building and shipping. He co-founded KonnectTaps as his first real product and built its frontend in React and Next.js. Since then he’s written FootPal FC’s session auth, tenancy guards, rating engine, and time handling from scratch rather than reaching for libraries — partly because that’s how he learns what a library would have been doing for him.",
    followUps: ["footpal-engineering", "currently-learning", "strengths"],
  },
];

const fallbackEntry: KnowledgeEntry = {
  id: "fallback",
  keywords: [],
  patterns: [],
  question: "",
  answer:
    "I’m not sure about that one. I can tell you about Amir’s background, stack, projects, the engineering behind FootPal FC, his experience, availability, or his strengths and growth areas. What would help?",
  followUps: ["background", "fit", "skills", "contact"],
};

const STOP_WORDS = new Set([
  "a", "an", "the", "is", "are", "was", "were", "be", "been", "being",
  "have", "has", "had", "do", "does", "did", "will", "would", "could",
  "should", "may", "might", "shall", "can", "need", "dare", "ought",
  "to", "of", "in", "for", "on", "with", "at", "by", "from", "as",
  "into", "through", "during", "before", "after", "above", "below",
  "between", "out", "off", "over", "under", "again", "further", "then",
  "once", "here", "there", "when", "where", "why", "how", "all", "each",
  "every", "both", "few", "more", "most", "other", "some", "such", "no",
  "nor", "not", "only", "own", "same", "so", "than", "too", "very",
  "just", "because", "but", "and", "or", "if", "while", "about", "up",
  "it", "its", "he", "his", "him", "she", "her", "we", "us", "they",
  "them", "what", "which", "who", "whom", "this", "that", "these",
  "those", "am", "i", "my", "me", "you", "your", "amir", "amirs",
]);

function normalizeInput(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function tokenize(input: string): string[] {
  return normalizeInput(input).split(" ").filter(Boolean);
}

export function findBestMatch(userInput: string): KnowledgeEntry {
  const normalized = normalizeInput(userInput);
  const tokens = tokenize(userInput);
  const meaningfulTokens = tokens.filter((t) => !STOP_WORDS.has(t));

  if (tokens.length === 0) return fallbackEntry;

  let bestEntry: KnowledgeEntry = fallbackEntry;
  let bestScore = 0;

  for (const entry of knowledgeBase) {
    let score = 0;

    for (const pattern of entry.patterns) {
      if (pattern.test(normalized)) {
        score += 10;
        break;
      }
    }

    for (const keyword of entry.keywords) {
      const kw = keyword.toLowerCase();
      if (meaningfulTokens.includes(kw)) {
        score += 5;
      } else if (kw.includes(" ") && normalized.includes(kw)) {
        score += 4;
      } else if (
        meaningfulTokens.some(
          (t) => t.length >= 4 && (t.startsWith(kw) || kw.startsWith(t)),
        )
      ) {
        score += 2;
      }
    }

    if (score > bestScore) {
      bestScore = score;
      bestEntry = entry;
    }
  }

  return bestScore >= 5 ? bestEntry : fallbackEntry;
}

/**
 * When the bot asked a counter-question and the user responds,
 * this resolves the tailored answer based on keywords in their reply.
 */
export function resolveCounterAnswer(
  entry: KnowledgeEntry,
  userReply: string,
): string {
  const responses = entry.contextResponses;
  if (!responses) return entry.answer;

  const normalized = userReply.toLowerCase();

  // Check each context key against the user's reply
  for (const [key, response] of Object.entries(responses)) {
    if (key === "_default") continue;
    if (normalized.includes(key)) return response;
  }

  return responses._default ?? entry.answer;
}

export function getEntryById(id: string): KnowledgeEntry | undefined {
  return (
    knowledgeBase.find((e) => e.id === id) ??
    (id === "fallback" ? fallbackEntry : undefined)
  );
}

export function getSuggestedQuestions(): KnowledgeEntry[] {
  return knowledgeBase.filter((e) =>
    ["background", "footpal", "skills", "fit", "contact"].includes(e.id),
  );
}
