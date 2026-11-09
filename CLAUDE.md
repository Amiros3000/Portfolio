# Portfolio — CLAUDE.md

## Project Overview

Personal portfolio site for Amir Ibrahim (Computer Engineer, York 2025). Single-page with scroll-based nav, dark/light theme, and a floating "Common questions" panel. Content is edited in files and deployed by pushing; there is no admin panel or database.

Live: **amiribrahim3000.com** — Vercel project `amiros3000s-projects/portfolio`

---

## Tech Stack

| Layer | Choice |
|-------|--------|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 |
| Animation | CSS keyframes (`app/globals.css`) |
| Theme | next-themes (dark/light/system) |
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
    common-questions.tsx      # floating "Questions" button + fixed Q&A panel (replaced the chatbot)
    pitch-motion.tsx          # hero pitch lines, matchday strip, decision cards

  lib/
    portfolio-content.ts      # read + normalize content from the JSON file
    skills.ts                 # the only skills list (Stack section + JSON-LD)
    footpal-fc.ts             # VamoKora decisions, stack, spec figures
    footpal-live.ts           # daily fetch of VamoKora's live counts

content/
  portfolio-content.json      # source of truth for hero, projects, contact
```

---

## Content System

Content is stored in `content/portfolio-content.json`. The shape is defined by `PortfolioContent` in `app/lib/portfolio-content.ts`.

**Read path**: `content/portfolio-content.json` → `DEFAULT_PORTFOLIO_CONTENT` hardcoded fallback. To change content, edit the JSON and push.

All content is normalized and sanitized via `normalizePortfolioContent()` before use.

Skills are **not** part of `PortfolioContent`. They live in `app/lib/skills.ts` and are edited in code only.

---

## Environment Variables

None required. The admin panel, its auth env vars, and the Supabase backend were removed (unused). Don't reintroduce them without a reason.

---

## Vercel Deployment

- Project linked: `amiros3000s-projects/portfolio`
- Domain: `amiribrahim3000.com` (Vercel nameservers, expires Mar 2027)
- No `vercel.json` — using Next.js framework defaults
- Analytics and Speed Insights enabled (components in `app/layout.tsx`)
- Deploy: `vercel --prod` or push to `main`

---

## Key Constraints

- **Single page.** The entire portfolio lives at `/`. Nav links are anchor hashes (`/#projects` etc.) with scroll-spy highlighting in `site-header.tsx`.
- **Content shape is validated.** All reads go through `normalizePortfolioContent()` — don't bypass it.
