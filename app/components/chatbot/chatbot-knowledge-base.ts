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

const knowledgeBase: KnowledgeEntry[] = [
  {
    id: "greeting",
    keywords: ["hi", "hello", "hey", "sup", "yo", "greetings"],
    patterns: [/^(hi|hello|hey|howdy|greetings|sup|yo)$/i, /what('s| is) up/i],
    question: "Say hello",
    answer:
      "Hey! I\u2019m Amir\u2019s portfolio assistant. I can tell you about his background, skills, projects, or why he\u2019d be a great addition to your team. What would you like to know?",
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
      "Amir Ibrahim is a Computer Engineering graduate from York University (2025). He\u2019s passionate about building products end-to-end \u2014 from the UI down to the infrastructure. He co-founded KonnectTaps (a digital networking platform with 100+ users), managed a 13-person team at March\u00e9 Adonis for 7+ years, and taught himself full-stack development by shipping a real product. He\u2019s an independent, self-driven builder who figures things out fast.",
    followUps: ["experience", "skills", "fit"],
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
      "Languages: Java, Python, SQL, Bash, JavaScript (ES6+). Backend & Web: Node.js, Express, React, RESTful APIs. Infrastructure: Docker, Linux/Unix, MySQL, Git/GitHub. Concepts: Distributed Systems, System Design, TCP/IP, HTTP/DNS. He\u2019s especially passionate about full-stack product development and building clean UIs.",
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
      "Key projects: (1) KonnectTaps \u2014 a digital networking platform he co-founded with 100+ users. He taught himself the entire stack from scratch and built it into a real product. (2) SOSO Capstone \u2014 a satellite telemetry visualization tool for the Canadian Space Agency. (3) MIX Registration System \u2014 handled 400+ concurrent requests with zero downtime. (4) MacTidy \u2014 a native macOS system manager built with Swift and SwiftUI, featuring 11 tools for file organization, storage analysis, and system optimization. Check the Projects section for live demos!",
    followUps: ["konnecttaps", "mactidy", "experience"],
  },
  {
    id: "konnecttaps",
    keywords: ["konnecttaps", "konnect", "ktaps"],
    patterns: [/konnect\s?taps/i, /ktaps/i, /co-?found/i, /networking (platform|app|tool)/i],
    question: "Tell me about KonnectTaps",
    answer:
      "KonnectTaps is a digital networking and contact-sharing platform Amir co-founded in January 2024. Here\u2019s what makes it impressive: it was his first real project. He had no prior engineering experience at that scale \u2014 he taught himself Node.js, MySQL, system design, and deployment while building a live product that now serves 100+ active users. He makes all engineering decisions end-to-end: architecture, data modeling, and production ops. Visit konnecttaps.com or the app at ktaps.me.",
    followUps: ["projects", "strengths", "skills"],
  },
  {
    id: "mactidy",
    keywords: ["mactidy", "mac tidy", "desktop", "organizer", "swift", "swiftui", "macos", "native"],
    patterns: [
      /mac\s?tidy/i,
      /desktop (organizer|manager|app)/i,
      /swift\s?ui/i,
      /native (mac|macos|app)/i,
      /system (manager|optimizer|utility)/i,
    ],
    question: "Tell me about MacTidy",
    answer:
      "MacTidy is a native macOS system manager Amir built with Swift and SwiftUI. It\u2019s a full-featured desktop utility with 11 tools: file organizer, storage analyzer with charts, large file finder, duplicate detector, cache cleaner, system info dashboard, startup manager, app uninstaller, memory monitor, battery health, and network speed test. It demonstrates his ability to pick up a completely new technology (Swift/SwiftUI) and deliver a polished, production-quality native Mac app.",
    followUps: ["projects", "skills", "self-taught"],
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
    question: "What\u2019s his experience?",
    answer:
      "Two key threads: (1) Co-Founder & Frontend Engineer at KonnectTaps (Jan 2024 \u2013 Present) \u2014 co-founded a digital networking platform, built the frontend, and contributes across the full stack. Taught himself everything while building. (2) 7+ years at March\u00e9 Adonis (Nov 2017 \u2013 Present) \u2014 started as a Clerk, earned a promotion to Assistant Manager after graduating, now leading a 13-person team. He balanced both while completing his Computer Engineering degree full-time.",
    followUps: ["education", "fit"],
  },
  {
    id: "education",
    keywords: ["education", "degree", "university", "school", "york", "lassonde", "graduated", "courses"],
    patterns: [
      /where did (he|you|amir) (study|go to school|graduate)/i,
      /education/i,
      /(degree|university|college)/i,
      /what did (he|amir) study/i,
    ],
    question: "Where did he study?",
    answer:
      "B.Eng. in Computer Engineering from York University\u2019s Lassonde School of Engineering, graduated June 2025. Coursework includes: OOP (Java), Data Structures & Algorithms, Operating Systems, Communication Networks, and Software Engineering Principles.",
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
      "Yes! Amir is available immediately. He\u2019s looking for Software Developer, Junior Engineer, or Full-Stack Developer roles. Open to remote or hybrid positions in the GTA, Ontario area. What kind of role are you hiring for? I can tell you more about how he\u2019d fit.",
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
      "Software Developer, Junior Engineer, and Full-Stack Developer positions. He\u2019s passionate about building products end-to-end \u2014 from the frontend UI to the backend infrastructure. He thrives in environments where he can take ownership and ship. He\u2019s open to both startup and structured environments.",
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
      "Email: amir.ibrahim3000@gmail.com \u2022 GitHub: github.com/Amiros3000 \u2022 LinkedIn: linkedin.com/in/amir3000. You can also use the contact form in the Contact section above!",
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
      "Based in the GTA (Greater Toronto Area), Ontario, Canada. Open to remote or hybrid work arrangements.",
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
      "Currently exploring AWS (cloud infrastructure), TypeScript, Next.js, Kubernetes, and CI/CD pipelines. He\u2019s the kind of person who learns by doing \u2014 he taught himself the entire stack behind KonnectTaps while building it. He picks things up fast because he\u2019s not afraid to dive in.",
    followUps: ["skills", "projects"],
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
      "Great question! To give you the best answer \u2014 what kind of role or team is this for? For example: startup, product team, agency, enterprise, etc.",
    contextResponses: {
      startup:
        "Amir is a natural startup fit. He co-founded KonnectTaps and built the entire product from scratch \u2014 from system design to deployment \u2014 with no prior experience at that scale. He\u2019s used to wearing every hat, making fast decisions, and shipping with limited resources. He\u2019s independent, self-driven, and learns on the fly. That\u2019s exactly the kind of person early-stage teams need.",
      product:
        "Amir is product-minded at his core. He didn\u2019t just build KonnectTaps as a side project \u2014 he co-founded it and ships features to 100+ real users. He thinks about the full user experience, from the UI to the backend reliability. He\u2019s passionate about building things people actually use. He\u2019d slot right into a product team that values ownership.",
      agency:
        "Amir can ramp up on new stacks fast \u2014 he taught himself Node.js, MySQL, React, and system design while building a live product. He\u2019s used to context-switching (he balanced a full engineering degree with co-founding a company and managing a team). He picks things up quickly and ships reliably.",
      enterprise:
        "Amir brings a systems-thinking mindset from his Computer Engineering degree \u2014 networking, distributed systems, and software architecture. He also has 7+ years of operational discipline from managing teams at March\u00e9 Adonis. He understands process, accountability, and delivering consistently under pressure.",
      _default:
        "Amir brings a rare combination: a Computer Engineering degree, 7+ years of professional accountability, and hands-on experience shipping a live product (KonnectTaps, 100+ users). He taught himself the full stack by building \u2014 not tutorials. He\u2019s independent, self-driven, and learns whatever he needs to get the job done. He\u2019s not just a new grad; he\u2019s someone who\u2019s been delivering results for years.",
    },
    followUps: ["strengths", "experience", "projects"],
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
      "His key strengths: (1) Self-taught builder \u2014 he learned the entire stack by shipping a real product, not watching tutorials. (2) Ownership mindset \u2014 he co-founded KonnectTaps and handles every engineering decision. (3) Reliability under pressure \u2014 7+ years of managing high-volume operations. (4) Speed of learning \u2014 he went from zero product experience to a live platform with 100+ users. (5) Product thinking \u2014 he cares about what users actually experience, not just the code.",
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
      "Being transparent: Amir graduated in 2025 and doesn\u2019t have years of industry software engineering experience yet. He\u2019s also honest that a lot of his coding has been AI-assisted. But here\u2019s the thing \u2014 that\u2019s the reality of modern engineering, and he understands the code he ships. He offset the experience gap significantly by co-founding and shipping a real product, managing large teams, and actively upskilling into AWS, TypeScript, and Kubernetes. He\u2019s the kind of developer who fills gaps fast because he\u2019s done it his whole career.",
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
      "Amir is independent and self-driven \u2014 give him a problem and he\u2019ll figure it out. But he also knows how to lead: he manages a 13-person team at March\u00e9 Adonis, handling scheduling, escalations, and cross-functional coordination daily. At KonnectTaps he drives engineering decisions while coordinating with his co-founder. He\u2019s open to both startup energy and structured environments with mentorship. The common thread: he takes ownership.",
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
      "Yes \u2014 Amir already operates like a startup founder. At KonnectTaps he handles system design, data modeling, deployment, and production operations by himself. He taught himself the full stack on the job because that\u2019s what the product needed. He\u2019s comfortable wearing every hat, making fast decisions, and shipping with limited resources. That\u2019s exactly the mindset startups need.",
    followUps: ["konnecttaps", "fit", "strengths"],
  },
  {
    id: "resume",
    keywords: ["resume", "cv"],
    patterns: [/resume/i, /\bcv\b/i, /download.*(resume|cv)/i],
    question: "Can I see his resume?",
    answer:
      "Yes! Click the \u201cView Resume\u201d button in the hero section at the top of the page, or scroll up to find it next to the \u201cContact Me\u201d button.",
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
    question: "What\u2019s he passionate about?",
    answer:
      "Amir loves building products end-to-end \u2014 taking something from an idea to a deployed, working application. He\u2019s especially drawn to frontend/UI work and making things look and feel great for users, but he\u2019s comfortable across the full stack. What excites him most is seeing something he built being used by real people \u2014 that\u2019s why he co-founded KonnectTaps instead of just doing class projects.",
    followUps: ["projects", "skills", "konnecttaps"],
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
      "Amir is a learn-by-doing person. He didn\u2019t follow a bootcamp or tutorial path \u2014 he co-founded KonnectTaps as his first real project and taught himself the entire stack (Node.js, MySQL, React, system design, deployment) while building a live product. He went from basic coding knowledge to running a production platform with 100+ users. That ability to learn on the fly is core to who he is as an engineer.",
    followUps: ["konnecttaps", "currently-learning", "strengths"],
  },
];

const fallbackEntry: KnowledgeEntry = {
  id: "fallback",
  keywords: [],
  patterns: [],
  question: "",
  answer:
    "Hmm, I\u2019m not sure about that one. But I\u2019d love to help! I can tell you about Amir\u2019s background, skills, projects, experience, availability, why he\u2019d be a great hire, or his strengths and growth areas. What interests you?",
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
    ["background", "skills", "projects", "fit", "contact"].includes(e.id),
  );
}
