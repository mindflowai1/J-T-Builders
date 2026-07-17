# J&T Builders: Website

Marketing site for **J&T Builders LLC**, 2nd-generation deck specialists & full-service
home builders in Bethel, CT (Trex, TimberTech & Wolf certified installer).

Live reference (old site being replaced): https://jtbuildersct.com

## Stack

- [Vite](https://vite.dev) + React 19 + TypeScript
- [Tailwind CSS v4](https://tailwindcss.com) (via `@tailwindcss/vite`)
- Self-hosted fonts (`@fontsource`: Oswald + Nunito Sans)
- No animation libraries: scroll effects are IntersectionObserver + CSS

## Development

```bash
npm install
npm run dev      # dev server
npm run build    # typecheck (prebuild) + production build to dist/
npm run lint     # oxlint
npm run preview  # serve the production build locally
```

## Deploy (Vercel)

Vercel auto-detects the Vite preset, no extra configuration needed:

- **Build command:** `npm run build` (runs `tsc -b` via `prebuild`)
- **Output directory:** `dist`
- `vercel.json` adds long-lived cache headers for hashed assets and the hero video.

## Project docs

- [`docs/copy.md`](docs/copy.md): locked page copy (grounded in the old site; don't invent facts)
- [`docs/design-plan.md`](docs/design-plan.md): design system + page architecture
- [`docs/design-notes.md`](docs/design-notes.md): reference-site analysis

## Lead form

`QuoteForm` (used in the hero and the contact section) posts JSON to an n8n webhook:
`https://n8n-n8n-start.kof6cn.easypanel.host/webhook/j-and-t-builders`. Payload: `name`,
`phone`, `address`, `service`, `message`, `botcheck` (honeypot, always `false` from real
submissions), `source` (identifies which form: hero vs. contact).

The matching lead-notification email template lives at
[`docs/email-notification.html`](docs/email-notification.html) (paste into the n8n Email
node's HTML field).

## Pending before launch

- Contact section (`#contact`) copy is final; confirm the n8n webhook is live and wired to
  wherever leads should land (email, CRM, etc.)
- Decide static vs. live Google rating in the social-proof bar
