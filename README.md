# Portfolio (Next.js 15)

This project is a portfolio site with:
- Next.js App Router + Tailwind CSS
- Light/Dark glassmorphism UI with Bloody Red accent (`#880808`)
- Admin panel at `/admin` to edit hero/skills/projects/contact content
- Resume upload from admin

## Local development

```bash
npm install
cp .env.example .env.local
npm run dev
```

## Admin login

Set these in `.env.local` (and in Vercel for production):

```bash
PORTFOLIO_ADMIN_EMAIL=admin@portfolio.local
PORTFOLIO_ADMIN_PASSWORD=change-this-password
PORTFOLIO_ADMIN_SECRET=change-this-signing-secret
```

Then open `/admin` and sign in.

## Supabase setup (required for persistent edits on Vercel)

Runtime file writes are not persistent on Vercel, so admin content and resume are stored in Supabase when these env vars are present:

```bash
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
SUPABASE_PORTFOLIO_TABLE=portfolio_content
SUPABASE_PORTFOLIO_CONTENT_ID=main
SUPABASE_RESUME_BUCKET=portfolio-assets
SUPABASE_RESUME_PATH=resume.pdf
```

### 1) Create table

Run this SQL in Supabase SQL editor:

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

In Supabase Storage, create a bucket named `portfolio-assets` and set it to **Public**.

### 3) Add env vars in Vercel

Project Settings -> Environment Variables:
- `PORTFOLIO_ADMIN_EMAIL`
- `PORTFOLIO_ADMIN_PASSWORD`
- `PORTFOLIO_ADMIN_SECRET`
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- optional: `SUPABASE_PORTFOLIO_TABLE`, `SUPABASE_PORTFOLIO_CONTENT_ID`, `SUPABASE_RESUME_BUCKET`, `SUPABASE_RESUME_PATH`

Redeploy after adding env vars.

## How persistence works

- If Supabase env vars are set: homepage/admin read and write via Supabase.
- If Supabase env vars are missing: app falls back to local file storage (`content/portfolio-content.json`, `public/resume.pdf`).

