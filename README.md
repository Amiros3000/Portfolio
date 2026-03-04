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
