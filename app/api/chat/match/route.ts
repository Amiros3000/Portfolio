import { createHash } from "node:crypto";
import { cosineSimilarity, embed } from "ai";
import { getEmbeddableEntries } from "@/app/components/chatbot/chatbot-knowledge-base";
import rawIndex from "@/app/components/chatbot/chat-embeddings.json";

type ChatIndex = {
  model: string | null;
  sourceHash: string | null;
  dimensions: number;
  entries: Array<{ id: string; vector: number[] }>;
};

// The committed placeholder has model: null and no entries, so the shape has to
// be declared rather than inferred from whichever version of the file is present.
const index = rawIndex as ChatIndex;

/**
 * Semantic fallback for the chatbot.
 *
 * This picks WHICH pre-written answer to return. It never generates prose — the
 * response is an entry id, and the client renders Amir's own vetted text for it.
 * That keeps the "nothing on this site is invented" property intact while still
 * understanding phrasings the keyword matcher was never taught.
 *
 * Every failure path returns { id: null }, which makes the client keep whatever
 * the keyword matcher already decided. Missing index, missing API key, timeout,
 * rate limit, stale index — all degrade to exactly today's behaviour.
 */

// Tuned by eye, not measured — see README note. Below this, we would rather say
// "I don't know" than confidently return the wrong answer.
const MIN_SCORE = Number(process.env.CHAT_MATCH_MIN_SCORE ?? 0.45);
const MAX_MESSAGE_LENGTH = 400;

// Best-effort, per-instance. Fluid Compute reuses instances so this catches
// casual hammering, but it is NOT a distributed limit — Vercel's firewall or
// BotID is the real control if this ever gets abused.
const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 20;
const hits = new Map<string, { count: number; resetAt: number }>();

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = hits.get(ip);

  if (!entry || now > entry.resetAt) {
    hits.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    if (hits.size > 5_000) {
      for (const [key, value] of hits)
        if (now > value.resetAt) hits.delete(key);
    }
    return false;
  }

  entry.count += 1;
  return entry.count > MAX_PER_WINDOW;
}

/**
 * The index is built from the knowledge base. If an answer changed and the
 * script was not re-run, the vectors describe text that no longer exists, so
 * disable semantic matching rather than return a confidently wrong entry.
 */
let indexIsCurrent: boolean | null = null;

function isIndexCurrent(): boolean {
  if (indexIsCurrent === null) {
    const hash = createHash("sha256")
      .update(JSON.stringify(getEmbeddableEntries()))
      .digest("hex")
      .slice(0, 16);

    indexIsCurrent =
      index.entries.length > 0 && !!index.model && hash === index.sourceHash;

    if (!indexIsCurrent && index.entries.length > 0) {
      console.warn(
        `[chat] semantic index is stale (expected ${hash}, found ${index.sourceHash}). ` +
          `Run: npm run chat:embeddings`,
      );
    }
  }

  return indexIsCurrent;
}

const noMatch = () => Response.json({ id: null });

export async function POST(request: Request) {
  if (!isIndexCurrent()) return noMatch();

  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (rateLimited(ip)) return noMatch();

  let message: string;
  try {
    const body = (await request.json()) as { message?: unknown };
    if (typeof body.message !== "string") return noMatch();
    message = body.message.trim().slice(0, MAX_MESSAGE_LENGTH);
  } catch {
    return noMatch();
  }

  if (message.length < 2) return noMatch();

  try {
    const { embedding } = await embed({
      model: index.model!,
      value: message,
      abortSignal: AbortSignal.timeout(5_000),
    });

    let best: { id: string; score: number } | null = null;
    for (const entry of index.entries) {
      const score = cosineSimilarity(embedding, entry.vector);
      if (!best || score > best.score) best = { id: entry.id, score };
    }

    if (!best || best.score < MIN_SCORE) return noMatch();

    return Response.json({ id: best.id, score: Number(best.score.toFixed(3)) });
  } catch {
    // Missing key, gateway error, timeout — the keyword matcher still answered.
    return noMatch();
  }
}
