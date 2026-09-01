/**
 * Recounts FootPal FC's verifiable figures and writes them to
 * content/footpal-metrics.json, then rewrites the numbers embedded in the
 * editable content JSON so the site, the resume, and the chatbot all move
 * together.
 *
 *   FOOTPAL_REPO=/path/to/footpal-fc node scripts/sync-footpal-metrics.mjs
 *   npm run sync:footpal -- --check     # exit 1 if the site is out of date
 *
 * WHY THIS EXISTS: these figures used to be hand-copied into ~20 places from a
 * dated "code audit". Between the July 31 audit and Sept 1 the release had moved
 * 45 minor versions and the test count had more than doubled, and every one of
 * those 20 strings was still quoting the old numbers to recruiters.
 *
 * Nothing here is estimated or inferred. Every figure is a count over the real
 * repository, so anything this writes is defensible in an interview — which is
 * the standing rule for content on this site. If a number cannot be counted
 * (active players, crews) it is NOT handled here; it lives in
 * content/footpal-metrics.json under `manual` and only a human changes it.
 */
import { execFileSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUT = path.join(ROOT, "content", "footpal-metrics.json");
const CHECK_ONLY = process.argv.includes("--check");

const REPO =
  process.env.FOOTPAL_REPO ??
  [path.resolve(ROOT, "../footpal-fc"), path.resolve(ROOT, "../FootPal-FC")].find(
    (p) => existsSync(path.join(p, "prisma", "schema.prisma")),
  );

if (!REPO || !existsSync(path.join(REPO, "prisma", "schema.prisma"))) {
  console.error(
    "Cannot find the FootPal FC checkout.\n" +
      "Clone it next to this repo, or point at it explicitly:\n" +
      "  FOOTPAL_REPO=/path/to/footpal-fc npm run sync:footpal",
  );
  process.exit(1);
}

const git = (...args) =>
  execFileSync("git", ["-C", REPO, ...args], { encoding: "utf8" }).trim();

/** Every file under `dir` whose name matches, node_modules excluded. */
function walk(dir, match, found = []) {
  for (const entry of readdirSafe(dir)) {
    if (entry.name === "node_modules" || entry.name === ".git") continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, match, found);
    else if (match(entry.name)) found.push(full);
  }
  return found;
}

function readdirSafe(dir) {
  try {
    return readdirSync(dir, { withFileTypes: true });
  } catch {
    return [];
  }
}

const countMatches = (files, re) =>
  files.reduce(
    (total, file) => total + (readFileSync(file, "utf8").match(re)?.length ?? 0),
    0,
  );

// ── Counts ───────────────────────────────────────────────────────────────────
// Each rule is stated once, here, so the site's claims and this script's
// methodology can never drift into meaning two different things.

const schema = readFileSync(path.join(REPO, "prisma", "schema.prisma"), "utf8");
const models = schema.match(/^model\s+\w+\s*\{/gm)?.length ?? 0;

const routeFileList = walk(path.join(REPO, "app"), (n) => n === "route.ts");
const routeFiles = routeFileList.length;
// Next.js App Router: one exported HTTP verb per handler.
const handlers = countMatches(
  routeFileList,
  /^export\s+(?:async\s+)?(?:function|const)\s+(?:GET|POST|PUT|PATCH|DELETE|HEAD|OPTIONS)\b/gm,
);

const testFileList = walk(REPO, (n) => /\.test\.(ts|tsx)$/.test(n));
const testSuites = testFileList.length;
const testBlocks = countMatches(testFileList, /^\s*(?:it|test)(?:\.\w+)?\s*\(/gm);

// CURRENT_VERSION is FootPal's own release marker; the repo carries no git tags.
const changelog = readFileSync(path.join(REPO, "lib", "changelog.ts"), "utf8");
const version = changelog.match(/CURRENT_VERSION\s*=\s*['"]([^'"]+)['"]/)?.[1];

if (!version) {
  console.error("Could not read CURRENT_VERSION from FootPal's lib/changelog.ts.");
  process.exit(1);
}

if (git("rev-parse", "--is-shallow-repository") === "true") {
  console.error(
    "The FootPal checkout is shallow, so the commit count would be wrong.\n" +
      "Fetch more history first:  git -C <repo> fetch --depth=100000 origin main",
  );
  process.exit(1);
}

const commits = Number(git("rev-list", "--count", "HEAD"));
const firstCommit = git("log", "--reverse", "--format=%as").split("\n")[0];
const lastCommit = git("log", "-1", "--format=%as");

const previous = existsSync(OUT) ? JSON.parse(readFileSync(OUT, "utf8")) : {};

const metrics = {
  // Read by app/lib/footpal-metrics.ts. Generated — edit the `manual` block only.
  generatedAt: new Date().toISOString().slice(0, 10),
  source: {
    repo: "Amiros3000/FootPal-FC",
    branch: git("rev-parse", "--abbrev-ref", "HEAD"),
    commit: git("rev-parse", "--short", "HEAD"),
  },
  version,
  commits,
  models,
  handlers,
  routeFiles,
  testBlocks,
  testSuites,
  firstCommit,
  lastCommit,
  buildingSince: new Date(`${firstCommit}T00:00:00Z`).toLocaleDateString("en-CA", {
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }),
  // NOT counted from the repo — these are facts about the world that only Amir
  // knows. The sync never touches them; it carries them forward untouched.
  manual: previous.manual ?? {
    activePlayers: "25+",
    crews: "three",
  },
};

// ── The editable content JSON ────────────────────────────────────────────────
// content/*.json is what the running site actually serves and what the admin
// panel rewrites, so it cannot hold template literals the way the .ts sources
// do. Substitute the figures in place instead: each pattern is anchored to the
// words around the number, so it updates the claim without touching the prose,
// and re-running on already-current text is a no-op.

const substitutions = [
  [/\b\d+(?=-model Postgres schema)/g, metrics.models],
  [/\b\d+(?= Postgres models)/g, metrics.models],
  [/\b\d+(?= route handlers)/g, metrics.handlers],
  [/\b\d+(?= HTTP handlers)/g, metrics.handlers],
  [/(?<=HTTP handlers across )\d+(?= route files)/g, metrics.routeFiles],
  [/\b\d+(?= tests\b)/g, metrics.testBlocks],
  [/\b\d+(?= test blocks)/g, metrics.testBlocks],
  [/(?<=test blocks across )\d+(?= suites)/g, metrics.testSuites],
  [/\b\d+(?= commits)/g, metrics.commits],
  [/v\d+\.\d+\.\d+/g, `v${metrics.version}`],
  // The audit date the copy cites; now the day the numbers were actually counted.
  [
    /(?<=As of the )[A-Z][a-z]+ \d{1,2}, \d{4}(?= code audit)/g,
    new Date(`${metrics.generatedAt}T00:00:00Z`).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
      timeZone: "UTC",
    }),
  ],
];

const targets = ["content/portfolio-content.json", "content/resume-content.json"];
const changed = [];

for (const relative of targets) {
  const file = path.join(ROOT, relative);
  if (!existsSync(file)) continue;

  const before = readFileSync(file, "utf8");
  const after = substitutions.reduce(
    (text, [pattern, value]) => text.replace(pattern, String(value)),
    before,
  );

  if (after !== before) {
    changed.push(relative);
    if (!CHECK_ONLY) writeFileSync(file, after, "utf8");
  }
}

const serialized = `${JSON.stringify(metrics, null, 2)}\n`;
const metricsChanged =
  !existsSync(OUT) ||
  // generatedAt alone must not count as a change, or every run commits.
  JSON.stringify({ ...previous, generatedAt: null }) !==
    JSON.stringify({ ...metrics, generatedAt: null });

if (metricsChanged) changed.unshift("content/footpal-metrics.json");
if (!CHECK_ONLY && metricsChanged) writeFileSync(OUT, serialized, "utf8");

// ── Report ───────────────────────────────────────────────────────────────────

const summary = [
  ["release", `v${metrics.version}`],
  ["commits", metrics.commits],
  ["Postgres models", metrics.models],
  ["HTTP handlers", `${metrics.handlers} across ${metrics.routeFiles} route files`],
  ["test blocks", `${metrics.testBlocks} across ${metrics.testSuites} suites`],
];

console.log(`FootPal FC @ ${metrics.source.commit} (${metrics.source.branch})`);
for (const [label, value] of summary) {
  console.log(`  ${label.padEnd(16)} ${value}`);
}

if (changed.length === 0) {
  console.log("\nPortfolio is already current. Nothing to write.");
  process.exit(0);
}

if (CHECK_ONLY) {
  console.error(`\nOut of date. Would rewrite:\n${changed.map((f) => `  ${f}`).join("\n")}`);
  process.exit(1);
}

console.log(`\nUpdated:\n${changed.map((f) => `  ${f}`).join("\n")}`);
