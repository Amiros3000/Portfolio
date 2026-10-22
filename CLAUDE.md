# Portfolio — CLAUDE.md

## Project Overview

Personal portfolio site for Amir Ibrahim (Computer Engineer, York 2025). Single-page with scroll-based nav, dark/light theme, an AI-style chatbot widget, a dev-only admin panel for live content editing, and an optional Supabase backend.

Live: **amiribrahim3000.com** — Vercel project `amiros3000s-projects/portfolio`

---

## Tech Stack

| Layer | Choice |
|-------|--------|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 |
| Animation | Framer Motion |
| Theme | next-themes (dark/light/system) |
| PDF | @react-pdf/renderer |
| Analytics | @vercel/analytics + @vercel/speed-insights |
| Icons | lucide-react |
| Runtime | Node.js (Vercel Fluid Compute) |

---

## Commands

```bash
npm run dev      # local dev server
npm run build    # production build (also used to verify types/lint)
npm run lint     # ESLint
```

No test suite. Use `npm run build` to catch type errors before pushing.

---

## Project Structure

```
app/
  layout.tsx                  # root layout — Analytics + SpeedInsights live here
  page.tsx                    # server component, fetches content → HomePageClient
  providers.tsx               # ThemeProvider wrapper
  globals.css
  icon.svg / opengraph-image.tsx / twitter-image.tsx

  components/
    site-header.tsx           # nav with scroll-spy section highlighting
    site-footer.tsx
    home-page-client.tsx      # main single-page client component (hero → contact)
    hero.tsx
    skills-carousel.tsx
    project-carousel.tsx
    projects-section.tsx
    currently-learning.tsx
    fade-in-section.tsx
    footer.tsx
    admin-editor.tsx          # dev-only content editor UI
    admin-tabs.tsx
    chatbot/
      chatbot-widget.tsx      # floating chat button + dialog
      chatbot-knowledge-base.ts  # keyword/regex-matched Q&A entries

    resume-builder/
      resume-builder.tsx
      resume-form.tsx
      resume-pdf-document.tsx
      resume-pdf-styles.ts
      resume-preview.tsx

  admin/
    page.tsx                  # login form + editor — notFound() in production
    login/route.ts            # POST → sets session cookie
    logout/route.ts           # clears session cookie
    error.tsx

  api/admin/
    content/route.ts          # GET/POST portfolio content — 404 in production
    resume/route.ts           # resume file upload
    resume-content/route.ts   # resume JSON content

  lib/
    admin-auth.ts             # HMAC-SHA256 session tokens, 12h TTL
    portfolio-content.ts      # read/write content (file → Supabase fallback)
    resume-content.ts
    supabase-rest.ts          # raw fetch-based Supabase client (no SDK)

content/
  portfolio-content.json      # source of truth when Supabase is not configured
  resume-content.json
```

---

## Content System

Content is stored in `content/portfolio-content.json`. The shape is defined by `PortfolioContent` in `app/lib/portfolio-content.ts`.

**Read path**: Supabase (if configured) → `content/portfolio-content.json` → `DEFAULT_PORTFOLIO_CONTENT` hardcoded fallback.

**Write path** (dev admin only): same priority order in reverse — writes to Supabase if env vars are set, otherwise writes to the JSON file.

All content is normalized and sanitized via `normalizePortfolioContent()` before use.

---

## Admin Panel

- Route: `/admin` — **blocked with `notFound()` in production**
- All `/api/admin/*` routes also return 404 in production
- Auth: HMAC-SHA256 signed session cookie (`portfolio_admin_session`), 12h TTL
- Credentials via env vars `PORTFOLIO_ADMIN_EMAIL` + `PORTFOLIO_ADMIN_PASSWORD`; falls back to `admin@portfolio.local` / `portfolio-admin` in dev

---

## Environment Variables

| Variable | Required | Purpose |
|----------|----------|---------|
| `PORTFOLIO_ADMIN_EMAIL` | prod | admin login email |
| `PORTFOLIO_ADMIN_PASSWORD` | prod | admin login password |
| `PORTFOLIO_ADMIN_SECRET` | optional | HMAC signing key (falls back to password) |
| `SUPABASE_URL` | optional | enables Supabase content backend |
| `SUPABASE_SERVICE_ROLE_KEY` | optional | Supabase auth |
| `SUPABASE_PORTFOLIO_TABLE` | optional | defaults to `portfolio_content` |
| `SUPABASE_RESUME_BUCKET` | optional | defaults to `portfolio-assets` |

---

## Vercel Deployment

- Project linked: `amiros3000s-projects/portfolio`
- Domain: `amiribrahim3000.com` (Vercel nameservers, expires Mar 2027)
- No `vercel.json` — using Next.js framework defaults
- Analytics and Speed Insights enabled (components in `app/layout.tsx`)
- Deploy: `vercel --prod` or push to `main`

---

## Key Constraints

- **Admin is dev-only.** Never remove the `process.env.NODE_ENV === "production"` guards.
- **No Supabase SDK** — Supabase is called via raw `fetch` against the REST API to keep the bundle lean.
- **Single page.** The entire portfolio lives at `/`. Nav links are anchor hashes (`/#projects` etc.) with scroll-spy highlighting in `site-header.tsx`.
- **Content shape is validated.** All saves go through `normalizePortfolioContent()` — don't bypass it.
