# Portfolio — Amir Ibrahim

Single-page engineering portfolio. Next.js 15 App Router, React 19, Tailwind CSS 4.

Live: <https://portfolio.amiribrahim3000.com>

## What this is

One public route (`/`) built from JSON content, plus a dev-only admin panel for
editing that content and generating a resume PDF. The page argues a specific
thing: every engineering decision has a cost, so each entry in the Flagship
section states what was built and what the choice gave up.

Every number on the page is verified against the source repo it describes. The
FootPal FC counts carry their audit date (`app/lib/footpal-fc.ts`); do not
change a count without re-auditing, and do not soften a claim the code does not
support.

## Stack

- Next.js 15 (App Router, RSC) / React 19
- Tailwind CSS 4, themed entirely through CSS custom properties
- `next-themes` for light/dark
- `lucide-react` icons
- `@react-pdf/renderer` for resume PDF generation (admin only)
- `ai` SDK for the chatbot's optional semantic matching
- Vercel Analytics + Speed Insights

There is no animation library. The hero load sequence is the CSS `.rise`
keyframe in `app/globals.css`, deliberately written so content is visible at
rest and the animation only hides it *while running* — a stalled animation can
never blank the page.

## Quick start

```bash
npm install
npm run dev
```

Open <http://localhost:3000>. No environment variables are needed to run or
build; every optional integration degrades to a working default.

## Project structure

```text
app/
  page.tsx                    # server component: content + JSON-LD
  layout.tsx                  # fonts, metadata, theme provider, chrome
  sitemap.ts / robots.ts      # crawl surface
  opengraph-image.tsx         # generated OG card (twitter-image re-exports it)
  components/
    home-page-client.tsx      # the entire public page
    site-header.tsx           # nav + scroll-spy
    site-footer.tsx
    chatbot/                  # widget, knowledge base, embedding index
    resume-builder/           # admin-only resume editor + PDF document
  admin/                      # dev-only login + dashboard
  api/
    admin/                    # dev-only content + resume endpoints
    chat/match/               # semantic fallback for the chatbot
  lib/
    site.ts                   # canonical origin, single source
    portfolio-content.ts      # public content schema + read/write
    resume-content.ts         # resume schema + read/write
    footpal-fc.ts             # flagship counts, stack, decisions
    admin-auth.ts
    supabase-rest.ts
content/
  portfolio-content.json      # hero, projects, skills, contact
  resume-content.json         # resume builder source
```

## Content

Most copy lives in `content/portfolio-content.json` and
`app/lib/footpal-fc.ts`. The Experience, Education, and Stack sections are
still hardcoded arrays at the top of `app/components/home-page-client.tsx`.

> **Known issue.** The same facts are currently duplicated across
> `content/portfolio-content.json`, `content/resume-content.json`,
> `app/lib/footpal-fc.ts`, the hardcoded arrays in `home-page-client.tsx`,
> the retyped headline and counts in `app/opengraph-image.tsx`, and
> `app/components/chatbot/chatbot-knowledge-base.ts`. Change a fact in one
> place and the others drift. Consolidating these is outstanding work.

### Canonical URL

`app/lib/site.ts` holds the origin used by `metadataBase`, the canonical tag,
`og:url`, the JSON-LD, the sitemap, and robots.txt. Override with
`NEXT_PUBLIC_SITE_URL` if the domain changes.

## Chatbot

`app/components/chatbot/chatbot-knowledge-base.ts` holds ~28 hand-written
entries. Matching runs keyword and regex first; `/api/chat/match` then offers a
semantic second opinion.

The semantic route **selects** an entry id, it never generates prose — the
client always renders the vetted answer text. Every failure path returns
`{ id: null }` and the keyword match stands.

Building the index requires a Vercel AI Gateway key:

```bash
AI_GATEWAY_API_KEY=... npm run chat:embeddings
```

The route hashes the knowledge base and compares it to the index's
`sourceHash`, refusing to serve a stale index rather than return a confidently
wrong answer.

> **Currently inactive.** The committed `chat-embeddings.json` is the empty
> placeholder (`"model": null`, no entries), so semantic matching is off in
> production and only keyword matching runs. Run the script above and commit
> the result to enable it.

## Admin panel

`/admin` calls `notFound()` when `NODE_ENV === "production"`, and every route
under `/api/admin` does the same. It is a local editing tool, not a deployed
CMS. Editing content in production means changing the JSON and redeploying.

For local use:

```bash
# .env.local
PORTFOLIO_ADMIN_EMAIL=admin@portfolio.local
PORTFOLIO_ADMIN_PASSWORD=change-this-password
PORTFOLIO_ADMIN_SECRET=change-this-signing-secret
```

Auth refuses to grant a session when these are unset rather than falling back
to a default login.

### Supabase (optional)

`app/lib/supabase-rest.ts` can persist admin writes to Postgres and upload the
resume to Storage instead of writing the local filesystem. Because admin routes
are dev-only, this currently only matters if those routes are ever re-enabled
in production.

```bash
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
# optional overrides
SUPABASE_PORTFOLIO_TABLE=portfolio_content
SUPABASE_PORTFOLIO_CONTENT_ID=main
SUPABASE_RESUME_BUCKET=portfolio-assets
SUPABASE_RESUME_PATH=resume.pdf
```

```sql
create table if not exists public.portfolio_content (
  id text primary key,
  content jsonb not null,
  updated_at timestamptz not null default now()
);
```

Storage bucket: `portfolio-assets`, public.

## Design system

Colors are defined **once**, as CSS custom properties in `app/globals.css`, and
exposed to Tailwind through `@theme inline`. `tailwind.config.ts` sets only
`darkMode: "class"` — a hardcoded color there shadows the token and silently
breaks theming.

Palette: bone paper, warm ink, one deep oxblood accent. The accent is a marker,
a rule, a link, and one filled button. It is never a fill behind content.

Type: Archivo (display/UI), Newsreader (body prose), IBM Plex Mono (metadata,
counts, versions, tradeoff lines).

## Scripts

```bash
npm run dev
npm run build
npm run start
npm run lint
npm run chat:embeddings   # requires AI_GATEWAY_API_KEY
```

## Deploy

Vercel. Set `NEXT_PUBLIC_SITE_URL` to the canonical domain; nothing else is
required.
