# J&T Builders — Website

Marketing site for **J&T Builders LLC** — 2nd-generation deck specialists & full-service
home builders in Bethel, CT (Trex & TimberTech partners).

Live reference (old site being replaced): https://jtbuildersct.com

## Stack

- [Vite](https://vite.dev) + React 19 + TypeScript
- [Tailwind CSS v4](https://tailwindcss.com) (via `@tailwindcss/vite`)
- Self-hosted fonts (`@fontsource`: Oswald + Nunito Sans)
- No animation libraries — scroll effects are IntersectionObserver + CSS

## Development

```bash
npm install
npm run dev      # dev server
npm run build    # typecheck (prebuild) + production build → dist/
npm run lint     # oxlint
npm run preview  # serve the production build locally
```

## Deploy (Vercel)

Vercel auto-detects the Vite preset — no extra configuration needed:

- **Build command:** `npm run build` (runs `tsc -b` via `prebuild`)
- **Output directory:** `dist`
- `vercel.json` adds long-lived cache headers for hashed assets and the hero video.

## Project docs

- [`docs/copy.md`](docs/copy.md) — locked page copy (grounded in the old site; don't invent facts)
- [`docs/design-plan.md`](docs/design-plan.md) — design system + page architecture
- [`docs/design-notes.md`](docs/design-notes.md) — reference-site analysis

## Pending before launch

- Wire the quote form to a real destination (currently shows success state only — see `src/components/QuoteForm.tsx`)
- Contact section (`#contact`) is still a placeholder
- Decide static vs. live Google rating in the social-proof bar
