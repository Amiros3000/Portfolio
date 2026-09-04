/**
 * Regenerates content/footpal-audit.json from a FootPal FC checkout.
 *
 *   npm run audit:footpal -- /path/to/footpal-fc
 *   FOOTPAL_PATH=/path/to/footpal-fc npm run audit:footpal
 *
 * Why this exists: the counts on the portfolio are published under the line
 * "Counts verified by code audit, <date>". That sentence is only true if the
 * numbers were actually derived from the code on that date. Between the first
 * audit (2026-07-31) and the second (2026-09-04) the real figures moved from
 * 109 handlers / 175 tests / 457 commits / v2.43.0 to 119 / 416 / 585 /
 * v2.89.2, and nothing caught it, because the numbers were hand-typed into
 * four separate files.
 *
 * The counting rules below ARE the definition of each published figure. If a
 * rule changes, the number it produces is not comparable to the one before it,
 * so change them deliberately.
 *
 * Requires full git history for the commit count. A --depth=1 clone reports 1;
 * the script refuses to write rather than publish that.
 */
import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync, existsSync, readdirSync, statSync } from "node:fs";
import path from "node:path";

const repo = process.argv[2] ?? process.env.FOOTPAL_PATH;

if (!repo) {
  console.error(
    "Usage: npm run audit:footpal -- /path/to/footpal-fc\n" +
      "   or: FOOTPAL_PATH=/path/to/footpal-fc npm run audit:footpal",
  );
  process.exit(1);
}

if (!existsSync(path.join(repo, ".git"))) {
  console.error(`Not a git checkout: ${repo}`);
  process.exit(1);
}

/** Every file under `dir` whose basename passes `match`. */
function walk(dir, match, found = []) {
  if (!existsSync(dir)) return found;
  for (const entry of readdirSync(dir)) {
    if (entry === "node_modules" || entry === ".git" || entry === ".next") continue;
    const full = path.join(dir, entry);
    if (statSync(full).isDirectory()) walk(full, match, found);
    else if (match(entry)) found.push(full);
  }
  return found;
}

const read = (p) => readFileSync(p, "utf8");
const countMatches = (text, re) => (text.match(re) ?? []).length;

// ── Postgres models ──────────────────────────────────────────────────────────
// A `model X {` declaration in the Prisma schema. Enums and type aliases are
// not models and are not counted.
const schemaPath = path.join(repo, "prisma", "schema.prisma");
const models = countMatches(read(schemaPath), /^model\s+[A-Za-z_]\w*\s*\{/gm);

// ── HTTP handlers ────────────────────────────────────────────────────────────
// An exported function named for an HTTP verb, inside an App Router `route.ts`.
// Next.js only treats these exact names as handlers, so this is the same set
// the framework routes to. `export const GET = ...` would also be valid Next.js
// and is deliberately matched too, even though the repo currently uses none.
const routeFilePaths = walk(
  path.join(repo, "app"),
  (name) => name === "route.ts" || name === "route.tsx",
);
const VERBS = "GET|POST|PUT|PATCH|DELETE|HEAD|OPTIONS";
const handlers = routeFilePaths.reduce((total, file) => {
  const source = read(file);
  return (
    total +
    countMatches(source, new RegExp(`export\\s+(?:async\\s+)?function\\s+(?:${VERBS})\\b`, "g")) +
    countMatches(source, new RegExp(`export\\s+const\\s+(?:${VERBS})\\s*=`, "g"))
  );
}, 0);

// ── Tests ────────────────────────────────────────────────────────────────────
// A "suite" is one test file, matching vitest.config.ts `include:
// ['tests/**/*.test.ts']`. A "test block" is an `it(...)` or `test(...)` in
// statement position, so a call nested inside a string or trailing a line of
// code is not counted. `describe` blocks are containers and are not counted as
// tests.
const testFilePaths = walk(
  path.join(repo, "tests"),
  (name) => name.endsWith(".test.ts") || name.endsWith(".test.tsx"),
);
const TEST_BLOCK = /^[ \t]*(?:it|test)(?:\.(?:only|skip|todo|concurrent|each|fails))?\s*\(/gm;
const testBlocks = testFilePaths.reduce(
  (total, file) => total + countMatches(read(file), TEST_BLOCK),
  0,
);

// ── Release ──────────────────────────────────────────────────────────────────
// The app has no git tags and package.json is still 0.1.0; the version people
// actually see comes from CURRENT_VERSION in lib/changelog.ts.
const changelog = read(path.join(repo, "lib", "changelog.ts"));
const versionMatch = changelog.match(/CURRENT_VERSION\s*=\s*['"]([^'"]+)['"]/);
if (!versionMatch) {
  console.error("Could not find CURRENT_VERSION in lib/changelog.ts.");
  process.exit(1);
}

const commits = Number(
  execFileSync("git", ["-C", repo, "rev-list", "--count", "HEAD"], {
    encoding: "utf8",
  }).trim(),
);

const isShallow =
  execFileSync("git", ["-C", repo, "rev-parse", "--is-shallow-repository"], {
    encoding: "utf8",
  }).trim() === "true";

if (isShallow) {
  console.error(
    `Refusing to write: ${repo} is a shallow clone, so the commit count (${commits}) is wrong.\n` +
      `Run: git -C ${repo} fetch --depth=2000 origin main`,
  );
  process.exit(1);
}

const firstCommitDate = execFileSync(
  "git",
  ["-C", repo, "log", "--reverse", "--format=%ad", "--date=format:%b %Y"],
  { encoding: "utf8", maxBuffer: 32 * 1024 * 1024 },
)
  .split("\n")[0]
  .trim();

const audit = {
  _generated: "scripts/audit-footpal.mjs — do not edit by hand",
  auditDate: new Date().toISOString().slice(0, 10),
  version: versionMatch[1],
  commits,
  buildingSince: firstCommitDate,
  models,
  handlers,
  routeFiles: routeFilePaths.length,
  testBlocks,
  testSuites: testFilePaths.length,
};

const out = path.join(process.cwd(), "content", "footpal-audit.json");
writeFileSync(out, `${JSON.stringify(audit, null, 2)}\n`);

console.log(`Wrote ${path.relative(process.cwd(), out)}:\n`);
for (const [key, value] of Object.entries(audit)) {
  if (key.startsWith("_")) continue;
  console.log(`  ${key.padEnd(16)} ${value}`);
}
