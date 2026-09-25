import "server-only";

import { footpalLiveFallback, type FootpalLive } from "./footpal-fc";

/**
 * Reads FootPal FC's commit count, latest release, and source counts from
 * GitHub. The source counts are stats.json on the repo's `stats` branch, which
 * FootPal's own CI (.github/workflows/stats.yml) publishes on every push.
 *
 * The repo is private, so this needs GITHUB_TOKEN: a fine-grained token scoped
 * to that one repo with Contents: Read-only. It runs on the server only; the
 * token never reaches the browser. Results are cached for a day, and any
 * failure (no token, expired token, GitHub down) falls back per field to the
 * audited values instead of breaking the page.
 */

const REPO = "Amiros3000/footpal-fc";
const ONE_DAY = 60 * 60 * 24;

function githubFetch(path: string, token: string, format?: "raw") {
  return fetch(`https://api.github.com/repos/${REPO}${path}`, {
    headers: {
      Accept:
        format === "raw"
          ? "application/vnd.github.raw+json"
          : "application/vnd.github+json",
      Authorization: `Bearer ${token}`,
      "X-GitHub-Api-Version": "2022-11-28",
    },
    next: { revalidate: ONE_DAY },
    signal: AbortSignal.timeout(5000),
  });
}

async function fetchRelease(token: string): Promise<string | null> {
  const res = await githubFetch("/releases/latest", token);
  if (!res.ok) return null;
  const body = (await res.json()) as { tag_name?: unknown };
  return typeof body.tag_name === "string" && body.tag_name ? body.tag_name : null;
}

/**
 * GitHub has no commit-count field. Asking for one commit per page makes the
 * page number of the rel="last" link equal to the total commit count on the
 * default branch.
 */
async function fetchCommitCount(token: string): Promise<string | null> {
  const res = await githubFetch("/commits?per_page=1", token);
  if (!res.ok) return null;
  const last = res.headers.get("link")?.match(/[?&]page=(\d+)>;\s*rel="last"/);
  if (last) return last[1];
  // No pagination means zero or one commit; not worth showing either.
  return null;
}

type SourceCounts = Pick<
  FootpalLive,
  "models" | "routeFiles" | "handlers" | "testFiles" | "testBlocks"
>;

const COUNT_KEYS = [
  "models",
  "routeFiles",
  "handlers",
  "testFiles",
  "testBlocks",
] as const;

const formatCount = new Intl.NumberFormat("en-US");

/**
 * All-or-nothing: if any figure is missing or not a positive integer, none are
 * used, so a partial or broken stats.json can never mix with the fallbacks.
 */
async function fetchSourceCounts(token: string): Promise<SourceCounts | null> {
  const res = await githubFetch("/contents/stats.json?ref=stats", token, "raw");
  if (!res.ok) return null;
  const body = (await res.json()) as Record<string, unknown>;
  const counts = {} as SourceCounts;
  for (const key of COUNT_KEYS) {
    const value = body[key];
    if (typeof value !== "number" || !Number.isInteger(value) || value <= 0) {
      return null;
    }
    counts[key] = formatCount.format(value);
  }
  return counts;
}

export async function getFootpalLive(): Promise<FootpalLive> {
  const token = process.env.GITHUB_TOKEN;
  if (!token) return footpalLiveFallback;

  const [release, commits, counts] = await Promise.all([
    fetchRelease(token).catch(() => null),
    fetchCommitCount(token).catch(() => null),
    fetchSourceCounts(token).catch(() => null),
  ]);

  return {
    ...footpalLiveFallback,
    ...counts,
    release: release ?? footpalLiveFallback.release,
    commits: commits ?? footpalLiveFallback.commits,
  };
}
