/**
 * FootPal FC — flagship project detail.
 *
 * Every figure here comes from the code audit dated 2026-07-31. Nothing in this
 * file may be softened into a claim the code does not support. In particular:
 * the service worker is an OFFLINE FALLBACK, never "offline support" and never
 * "works offline" — it caches nothing, by design.
 */

export const FOOTPAL_AUDIT_DATE = "July 31, 2026";

export type SpecFigure = {
  value: string;
  label: string;
};

/**
 * Verified counts, rendered as static text — never animated up from a zero
 * state. The previous stat row derived its number from an animation's starting
 * value and shipped a literal "0+" whenever that animation didn't run.
 */
export const footpalSpec: SpecFigure[] = [
  { value: "27", label: "Postgres models" },
  { value: "109", label: "HTTP handlers across 81 route files" },
  { value: "175", label: "test blocks across 15 suites" },
  { value: "457", label: "commits" },
  { value: "v2.43.0", label: "current release" },
];

/**
 * Hero strip. Deliberately carries only what the headline and subheadline do
 * not already say — the release state, not the counts.
 */
export const footpalRelease: SpecFigure[] = [
  { value: "v2.43.0", label: "current release" },
  { value: "457", label: "commits" },
  { value: "Jun 2026", label: "building since" },
];

export const footpalStack = [
  "Next.js 15",
  "TypeScript",
  "PostgreSQL (Neon)",
  "Prisma",
  "Web Push",
  "Sentry",
  "Vercel",
];

export type Decision = {
  /** Leads with what was built. Never a problem statement or a characterization. */
  title: string;
  body: string;
  /** What the choice cost. The page's argument is that every decision has one. */
  tradeoff: string;
};

export const footpalDecisions: Decision[] = [
  {
    title: "Crew-scoped isolation enforced at every call site",
    body: "Independent crews share one database. Access is gated by explicit guard functions — canAccessGame, canManageGame, getUserCrew — invoked per route.",
    tradeoff:
      "No Postgres RLS and no Prisma middleware. All 109 handlers have to call a guard, and the database will not catch one that forgets.",
  },
  {
    title: "Session auth written from scratch, no auth library",
    body: "The cookie carries the plaintext token; the database stores only the SHA-256 hash. Sessions are per-device. A three-tier resolution path — Session row, then legacy hash column, then legacy plaintext — migrated existing accounts on read, without logging anyone out.",
    tradeoff:
      "Three lookup paths to maintain until the legacy columns are retired.",
  },
  {
    title: "Man-of-the-match awards that fire exactly once",
    body: "The award can be triggered by the final vote or by a fallback cron. Both paths run one conditional update guarded on a null timestamp, and the affected-row count decides which trigger won.",
    tradeoff:
      "Correctness sits in a single UPDATE's WHERE clause and its row count. It leans on the database to serialize rather than on application-level locking.",
  },
  {
    title: "Batched the game page's reads, cutting load from ~3.3s to ~1.1s",
    body: "Collapsed 8 sequential Prisma reads into one parallel fetch and moved stats computation off first paint, then added three indexes after EXPLAIN showed sequential scans.",
    tradeoff:
      "Measured by hand on the heaviest crew game. There is no benchmark harness, so this is a point measurement, not continuous tracking.",
  },
  {
    title: "Kickoff times resolved to UTC without a date library",
    body: "Crew-local kickoff times resolve to UTC instants through Intl.DateTimeFormat.formatToParts, so daylight-saving shifts land on the right instant. package.json contains zero date libraries.",
    tradeoff:
      "DST behaviour has to be tested directly against boundary dates rather than trusted to a library's tzdata.",
  },
  {
    title: "Hand-written service worker serving a branded offline page",
    body: "The service worker is written by hand rather than generated. It serves a branded offline page in place of the browser's error screen. It does not cache pages, API responses, or app JS.",
    tradeoff:
      "Deliberate. Caching rosters and costs would show people stale information, so there is no cached app to fall back on — offline gets a clear page, not a working one.",
  },
  {
    title: "Ratings and cost settlement as pure, unit-tested modules",
    body: "The rating engine is crew-relative: each stat scales against that crew's best player and decays with absence. The settlement module nets per-game cost shares down to a single balance per player pair. Both are pure functions covered by the test suites.",
    tradeoff:
      "Crew-relative ratings do not compare across crews — the same number means different things in different crews.",
  },
  {
    title: "Every Sentry event through one PII-scrubbing chokepoint",
    body: "All error reporting routes through a single scrubbing function before anything leaves the app.",
    tradeoff:
      "One function to audit, and one function every new event type has to go through or it bypasses scrubbing.",
  },
];
