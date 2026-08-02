/**
 * Builds the chatbot's semantic index.
 *
 *   AI_GATEWAY_API_KEY=... npm run chat:embeddings
 *
 * Embeds every knowledge-base entry once and writes the vectors to
 * app/components/chatbot/chat-embeddings.json, which is committed. Nothing at
 * request time re-embeds the entries — the running app only ever embeds the
 * visitor's message and compares it against this file.
 *
 * Re-run this whenever an entry's question, keywords, or answer changes.
 * The route checks `sourceHash` and refuses to serve a stale index.
 */
import { createHash } from "node:crypto";
import { writeFile } from "node:fs/promises";
import path from "node:path";
import { embedMany } from "ai";
import { getEmbeddableEntries } from "../app/components/chatbot/chatbot-knowledge-base.ts";

const MODEL = "openai/text-embedding-3-small";
const OUT = path.join(process.cwd(), "app/components/chatbot/chat-embeddings.json");

if (!process.env.AI_GATEWAY_API_KEY) {
  console.error(
    "AI_GATEWAY_API_KEY is not set.\n" +
      "Create one at https://vercel.com/[team]/~/ai-gateway/api-keys, then:\n" +
      "  AI_GATEWAY_API_KEY=... npm run chat:embeddings",
  );
  process.exit(1);
}

const entries = getEmbeddableEntries();
const sourceHash = createHash("sha256")
  .update(JSON.stringify(entries))
  .digest("hex")
  .slice(0, 16);

console.log(`Embedding ${entries.length} entries with ${MODEL}...`);

const { embeddings, usage } = await embedMany({
  model: MODEL,
  values: entries.map((e) => e.text),
});

const index = {
  model: MODEL,
  sourceHash,
  dimensions: embeddings[0].length,
  entries: entries.map((entry, i) => ({
    id: entry.id,
    // 5 decimals is well past what cosine similarity can distinguish here and
    // roughly halves the file.
    vector: embeddings[i].map((n) => Number(n.toFixed(5))),
  })),
};

await writeFile(OUT, `${JSON.stringify(index)}\n`, "utf8");

console.log(
  `Wrote ${entries.length} vectors (${index.dimensions}d) to ${path.relative(process.cwd(), OUT)}`,
);
console.log(`sourceHash ${sourceHash} · ${usage?.tokens ?? "?"} tokens`);
