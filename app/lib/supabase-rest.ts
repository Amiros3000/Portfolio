const DEFAULT_TABLE = "portfolio_content";
const DEFAULT_CONTENT_ID = "main";
const DEFAULT_RESUME_BUCKET = "portfolio-assets";
const DEFAULT_RESUME_PATH = "resume.pdf";

type SupabaseConfig = {
  url: string;
  serviceRoleKey: string;
  table: string;
  contentId: string;
  resumeBucket: string;
  resumePath: string;
};

function cleanBaseUrl(value: string): string {
  return value.endsWith("/") ? value.slice(0, -1) : value;
}

function getSupabaseConfig(): SupabaseConfig | null {
  const rawUrl = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!rawUrl || !serviceRoleKey) return null;

  return {
    url: cleanBaseUrl(rawUrl),
    serviceRoleKey,
    table: process.env.SUPABASE_PORTFOLIO_TABLE ?? DEFAULT_TABLE,
    contentId: process.env.SUPABASE_PORTFOLIO_CONTENT_ID ?? DEFAULT_CONTENT_ID,
    resumeBucket: process.env.SUPABASE_RESUME_BUCKET ?? DEFAULT_RESUME_BUCKET,
    resumePath: process.env.SUPABASE_RESUME_PATH ?? DEFAULT_RESUME_PATH,
  };
}

function createHeaders(config: SupabaseConfig, contentType?: string): Headers {
  const headers = new Headers({
    apikey: config.serviceRoleKey,
    Authorization: `Bearer ${config.serviceRoleKey}`,
  });

  if (contentType) headers.set("Content-Type", contentType);

  return headers;
}

async function readError(response: Response): Promise<string> {
  try {
    const json = (await response.json()) as
      | { error?: string; message?: string }
      | null;

    return json?.message ?? json?.error ?? `Supabase request failed (${response.status})`;
  } catch {
    return `Supabase request failed (${response.status})`;
  }
}

export function isSupabaseConfigured(): boolean {
  return getSupabaseConfig() !== null;
}

export async function getSupabasePortfolioContent(): Promise<unknown | null> {
  const config = getSupabaseConfig();
  if (!config) return null;

  const query = new URLSearchParams({
    id: `eq.${config.contentId}`,
    select: "content",
  });

  const response = await fetch(
    `${config.url}/rest/v1/${config.table}?${query.toString()}`,
    {
      method: "GET",
      headers: createHeaders(config),
      cache: "no-store",
    },
  );

  if (!response.ok) {
    throw new Error(await readError(response));
  }

  const rows = (await response.json()) as Array<{ content?: unknown }>;
  if (!Array.isArray(rows) || rows.length === 0) return null;

  return rows[0]?.content ?? null;
}

export async function upsertSupabasePortfolioContent(
  content: unknown,
): Promise<unknown> {
  const config = getSupabaseConfig();

  if (!config) {
    throw new Error("Supabase is not configured.");
  }

  const response = await fetch(
    `${config.url}/rest/v1/${config.table}?on_conflict=id`,
    {
      method: "POST",
      headers: new Headers({
        ...Object.fromEntries(createHeaders(config, "application/json").entries()),
        Prefer: "resolution=merge-duplicates,return=representation",
      }),
      body: JSON.stringify([
        {
          id: config.contentId,
          content,
        },
      ]),
    },
  );

  if (!response.ok) {
    throw new Error(await readError(response));
  }

  const rows = (await response.json()) as Array<{ content?: unknown }>;
  return rows[0]?.content ?? content;
}

function encodeObjectPath(pathValue: string): string {
  return pathValue
    .split("/")
    .filter(Boolean)
    .map((part) => encodeURIComponent(part))
    .join("/");
}

export async function uploadResumeToSupabase(fileBuffer: Buffer): Promise<string> {
  const config = getSupabaseConfig();

  if (!config) {
    throw new Error("Supabase is not configured.");
  }

  const encodedBucket = encodeURIComponent(config.resumeBucket);
  const encodedPath = encodeObjectPath(config.resumePath);

  const response = await fetch(
    `${config.url}/storage/v1/object/${encodedBucket}/${encodedPath}`,
    {
      method: "POST",
      headers: new Headers({
        ...Object.fromEntries(createHeaders(config, "application/pdf").entries()),
        "x-upsert": "true",
      }),
      body: new Uint8Array(fileBuffer),
    },
  );

  if (!response.ok) {
    throw new Error(await readError(response));
  }

  return `${config.url}/storage/v1/object/public/${config.resumeBucket}/${config.resumePath}`;
}
