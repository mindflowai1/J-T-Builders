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

## Lead capture (all Jobber, no middleware)

The quote form is the official Jobber work-request embed (`src/components/JobberForm.tsx`);
leads land directly in the client's Jobber account. Fields and colors are managed in Jobber
(form builder, form id `4882418`, and Client Hub branding), not in this codebase.

The snippet only supports one embed instance per page (and the form only renders correctly
through the official snippet, since the form page depends on the snippet's resizer). The
single embed lives in the hero card (`#quote-form`) on every breakpoint, inside our own
scroll container (the embed auto-sizes to the full form height). Every "Get Your Free
Quote" CTA (header, mobile action bar, contact card) anchors to `#quote-form`; the contact
card also links to the standalone form as a backup.
[`docs/email-notification.html`](docs/email-notification.html) is a legacy n8n email
template, kept for reference only.

## Meta tracking (Pixel + Conversions API)

Two channels fire the same event, de-duplicated by a shared `eventId`:

1. **Browser Pixel** — snippet in `index.html` (pixel id is public by design).
2. **Conversions API** — `api/meta-event.ts`, a Vercel serverless function. The access
   token is read from the environment and **never reaches the browser**.

### Funnel

| Event | Fires when | Reliability |
|-------|-----------|-------------|
| `PageView` | any page load | exact |
| `ViewContent` | a quote CTA is clicked | exact |
| `InitiateCheckout` | visitor clicks into the form iframe | exact |
| `Lead` | form appears to be submitted | **heuristic**, see below |
| `Contact` | mobile call button tapped | exact |

Optimize ad delivery for `Lead`; use `InitiateCheckout` as a backup audience.

### Tracking through the Jobber iframe

The form is cross-origin, so its DOM is unreadable. Two signals are still available,
both derived from Jobber's own embed snippet (`JobberForm.tsx`):

1. **Form start (exact).** Clicking into the iframe moves focus out of the page, so
   `window.blur` + `document.activeElement` being our iframe means the visitor started
   filling it in.
2. **Submit (heuristic).** Jobber's iframe `postMessage`s its content height to the
   parent (that's how the snippet auto-resizes it). After a successful submit the form
   is replaced by a short confirmation screen, so the height collapses. We treat
   "was tall, went short, after engagement" as a submit, firing once per page.

To make `Lead` exact, wire a **Jobber webhook** (`REQUEST_CREATE`) to a serverless
endpoint that calls `api/meta-event.ts` server-side. That also lets you pass the real
email/phone, which materially improves Meta's match quality. Requires a Jobber Developer
app with webhook scopes on the client's account.

**Environment variables** (Vercel > Settings > Environment Variables, all environments):

| Name | Value | Notes |
|------|-------|-------|
| `META_PIXEL_ID` | `871472179206738` | Public |
| `META_CAPI_TOKEN` | `EAA...` | **Secret.** Events Manager > dataset > Settings |
| `META_TEST_EVENT_CODE` | `TEST12345` | Optional, only while testing. Delete after |

Never prefix these with `VITE_`: Vite inlines `VITE_*` variables into the public bundle.
See `.env.example`; real `.env` files are gitignored.

## Pending before launch

- Owners section: swap portrait placeholders in `WhyChooseUs.tsx` for real photos, names,
  and titles (waiting on client)
- Review the Jobber form's field list in Jobber's form builder (name, phone, address,
  service, project details) so it matches what the site promises
- Decide static vs. live Google rating in the social-proof bar
