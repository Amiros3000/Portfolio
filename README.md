# Portfolio

Amir Ibrahim's portfolio, live at [amiribrahim3000.com](https://amiribrahim3000.com). Next.js 15 (App Router), TypeScript, Tailwind CSS 4, deployed on Vercel.

## Run it

```bash
npm install
npm run dev
```

Open `http://localhost:3000`. Check types and lint before pushing with `npm run build`.

## Where things live

| To change | Edit |
|-----------|------|
| Hero line, projects, contact links | `content/portfolio-content.json` |
| Skills (Stack section, SEO) | `app/lib/skills.ts` |
| VamoKora decisions and stack | `app/lib/footpal-fc.ts` |
| Experience, education, page layout | `app/components/home-page-client.tsx` |
| Résumé | replace `public/resume.pdf` |

Edit, commit, push. Pushing to `main` deploys.

The contact form posts to Formspree (endpoint in `home-page-client.tsx`). No environment variables are required.
