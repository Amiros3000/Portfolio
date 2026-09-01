# Portfolio Template (Next.js 15 + Tailwind)

A modern engineering portfolio template built with Next.js App Router, Tailwind CSS, and framer-motion.

## Features

- Responsive, mobile-first layout
- Light/Dark mode support
- Glassmorphism UI with configurable accent color
- Animated hero/skills/projects sections
- Contact form integration (Formspree)
- Optional admin panel (`/admin`) for editing portfolio content
- Optional Supabase-backed persistence for production editing

## Stack

- Next.js 15
- React 19
- Tailwind CSS 4
- Framer Motion
- Lucide React icons
- next-themes

## Quick Start

```bash
git clone <your-fork-url>
cd my-portfolio
npm install
cp .env.example .env.local
npm run dev
```

Open `http://localhost:3000`.

## Project Structure

```text
app/
  components/
    home-page-client.tsx   # main portfolio UI
    site-header.tsx        # responsive nav + scroll-spy
    admin-editor.tsx       # admin dashboard UI
  admin/                   # admin login/dashboard routes
  api/admin/               # admin content + resume APIs
  lib/
    portfolio-content.ts   # content schema + read/write logic
    admin-auth.ts          # auth/session helpers
    supabase-rest.ts       # Supabase REST persistence
content/
  portfolio-content.json   # default/local portfolio content
public/
  resume.pdf               # resume file (local fallback)
```

## Keeping FootPal FC's figures true

The site quotes hard numbers about FootPal FC — release, commits, Postgres
models, HTTP handlers, test blocks. These used to be hand-copied into ~20 places
from a dated code audit, and they rotted: between the July 31 audit and Sept 1
the release moved from v2.43.0 to v2.88.6 and the test count went from 175 to
399, while every one of those 20 strings still quoted the old figures.

They are now **counted, never typed**.

```bash
# Clone FootPal next to this repo (or set FOOTPAL_REPO), then:
npm run sync:footpal          # recount and rewrite
npm run sync:footpal:check    # exit 1 if the site is out of date, write nothing
```

`scripts/sync-footpal-metrics.mjs` counts the real repository and writes
`content/footpal-metrics.json`. Everything else interpolates from there —
`app/lib/footpal-metrics.ts` is the single import point for the hero, the OG
image, the resume defaults, and the chatbot's answers. **Never type one of these
numbers into a sentence**; interpolate it, or the drift starts again.

### What runs on its own

| | What it does | When |
|---|---|---|
| `.github/workflows/sync-footpal-metrics.yml` | Recounts and commits the numbers to `main`, which redeploys | Mondays 08:00 UTC, or on demand |
| Monthly Claude pass | Reads FootPal's recent work and opens a **PR** proposing prose updates | Monthly |

The split is deliberate: counts are mechanically verifiable, so they land
unattended. Wording is a judgement call, so it waits for review.

**One-time setup.** The workflow reads the private FootPal-FC repo, which the
default `GITHUB_TOKEN` cannot do. Create a fine-grained PAT with
`Contents: read-only` on `Amiros3000/FootPal-FC` and save it as the
`FOOTPAL_REPO_TOKEN` Actions secret on this repo. Until it exists the job stops
with a clear error rather than failing quietly.

### Figures that cannot be counted

"25+ players", "three crews" describe the world, not the code, so the sync never
invents them. They live under `manual` in `content/footpal-metrics.json` and are
carried forward untouched on every run — update them there when they change.

### Note on the chatbot index

FootPal's counts interpolate into chatbot answers, so the semantic index's
staleness fingerprint (`getIndexFingerprint`) deliberately ignores digits. A
weekly metrics sync must not mark the index stale and silently switch semantic
matching off; a genuine *rewording* still does, which is what the guard is for.

## Customization

### 1) Edit portfolio content

Primary content source:
- `content/portfolio-content.json`

Or edit from admin panel:
- `http://localhost:3000/admin`

### 2) Change theme accent

Update accent color in:
- `tailwind.config.ts`
- `app/globals.css` (`--accent`)

### 3) Update contact form endpoint

In `app/components/home-page-client.tsx`, replace Formspree endpoint:

```ts
https://formspree.io/f/mwvndwea
```

## Environment Variables

Create `.env.local`:

```bash
# Admin auth (recommended)
PORTFOLIO_ADMIN_EMAIL=admin@portfolio.local
PORTFOLIO_ADMIN_PASSWORD=change-this-password
PORTFOLIO_ADMIN_SECRET=change-this-signing-secret

# Supabase (required for persistent admin edits on Vercel)
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Optional overrides
SUPABASE_PORTFOLIO_TABLE=portfolio_content
SUPABASE_PORTFOLIO_CONTENT_ID=main
SUPABASE_RESUME_BUCKET=portfolio-assets
SUPABASE_RESUME_PATH=resume.pdf
```

## Admin Mode (Optional)

If you do not want to use admin editing right now, you can still run/deploy normally.

- Keep content updates in `content/portfolio-content.json`
- Upload/replace `public/resume.pdf`
- Redeploy

Admin routes remain available but are only useful when credentials are configured.

## Supabase Setup (for production persistence)

Required when deploying on Vercel and using admin writes/uploads.

### 1) Create table

```sql
create table if not exists public.portfolio_content (
  id text primary key,
  content jsonb not null,
  updated_at timestamptz not null default now()
);

create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_portfolio_content_updated_at on public.portfolio_content;

create trigger trg_portfolio_content_updated_at
before update on public.portfolio_content
for each row execute function public.set_updated_at();
```

### 2) Create storage bucket

Create a **public** bucket named `portfolio-assets`.

### 3) Add env vars in Vercel

Project Settings -> Environment Variables:

- `PORTFOLIO_ADMIN_EMAIL`
- `PORTFOLIO_ADMIN_PASSWORD`
- `PORTFOLIO_ADMIN_SECRET`
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- optional overrides from `.env.example`

Redeploy after saving env vars.

## Scripts

```bash
npm run dev
npm run lint
npm run build
npm run start
npm run sync:footpal          # recount FootPal FC's figures
npm run sync:footpal:check    # fail if the site's figures are stale
```

## Deploy

Recommended: Vercel.

- Connect repo
- Add environment variables
- Deploy

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make changes
4. Run lint/build
5. Open a pull request

## Reuse Notes

If you reuse this template:
- Replace personal info/content in `content/portfolio-content.json`
- Replace resume in `public/resume.pdf`
- Update social links and contact endpoints

## License

No license file is included yet. Add one before public open-source distribution (MIT is common for templates).
