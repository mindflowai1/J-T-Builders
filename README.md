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

The quote form is the official Jobber work-request embed, shown in a modal
(`src/components/QuoteModal.tsx`). Leads land directly in the client's Jobber account —
no API call, no OAuth, no credentials to keep alive on our side. Fields and colors are
managed in Jobber (form builder, form id `4882418`, and Client Hub branding), not in this
codebase.

The snippet only supports one embed instance per page, and the form only renders correctly
through the official snippet, since the form page depends on the snippet's resizer. So a
single embed lives inside one modal that every "Get Your Free Quote" CTA opens (header,
mobile menu, mobile action bar, hero card, contact card) via the `useQuoteModal` hook in
`src/lib/useQuoteModal.ts`.

The embed mounts on the **first** open, so the iframe measures itself while visible, and
then stays mounted. Closing hides the modal with `invisible` rather than `display:none`,
which preserves the iframe's measured height so reopening is instant and correctly sized.

`api/jobber/*` is the previous approach — a custom form posting to a serverless endpoint
that created the client and request over Jobber's GraphQL API. It was abandoned because
the OAuth credentials are fragile: regenerating the app's client secret in the Developer
Center silently revokes every refresh token, and leads then fail with a 500 that nobody
sees. The files are kept for reference but nothing on the site calls them.
[`docs/email-notification.html`](docs/email-notification.html) is a legacy n8n email
template, kept for reference only.

## Blog (Supabase + static pages)

Posts live in Supabase; the public blog is **static HTML generated at build time**, so
every page carries its own title, description, canonical, Open Graph and JSON-LD without
JavaScript (crawlers and WhatsApp/Facebook previews read them as-is), and the blog keeps
serving even if Supabase is down.

**Build pipeline** (`npm run build`, same on Vercel):

1. `scripts/fetch-posts.mjs` reads published posts with the anon key into `.blog-cache/`
   and the newest three into `src/generated/latest-posts.json` (bundled into the home
   page's "From the Blog"). A failure here fails the build, so Vercel keeps the last good
   deploy instead of publishing an empty blog.
2. `vite build` (home, `/admin/`, and the blog's client islands) and
   `vite build --ssr src/blog/render.tsx`.
3. `scripts/build-blog.mjs` writes `dist/blog/**/index.html`, `sitemap.xml`,
   `robots.txt` and `blog/rss.xml`. Post bodies are sanitized here. Analytics are copied
   from `index.html` between the `tracking:*` markers, so edit them only there.

Blog pages are not hydrated as a whole: only the header and the quote modal/mobile bar
become interactive (`src/blog/client.tsx`). Quote buttons open the single Jobber modal
through a window event (`src/lib/useQuoteModal.ts`), since Jobber allows one embed per page.

**Admin** at `/admin/` (noindex): Supabase email/password login, hash routes, rich text
editor, live preview using the same `PostArticle` component as the public page, Google
snippet preview. Saving a published post calls `api/blog/publish.ts`, which verifies the
caller is an admin and triggers the Vercel Deploy Hook; the change is live in ~2 minutes.

**Security** is in the database (`supabase/migrations/`), not the UI: RLS lets anyone
read published posts, and only users listed in `public.admins` write posts or upload to
the `blog-images` bucket. The slug of a post that was ever published is locked by a
trigger, so indexed links never break.

| Command | What it does |
|---|---|
| `npm run db:push` | Applies `supabase/migrations/*` (uses `SUPABASE_DB_URL`, no account token) |
| `npm run admin:create -- name@example.com` | Creates an admin login (password printed once, saved to `.admin-credentials.local`) |

Environment: see `.env.example`. Vercel needs `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`
and `VERCEL_DEPLOY_HOOK_URL`; `SUPABASE_DB_URL` stays local.

## Meta tracking (Pixel + Conversions API)

Two channels fire the same event, de-duplicated by a shared `eventId`:

1. **Browser Pixel** — snippet in `index.html` (pixel id is public by design).
2. **Conversions API** — `api/meta-event.ts`, a Vercel serverless function. The access
   token is read from the environment and **never reaches the browser**.

### Funnel

| Event | Fires when | Reliability |
|-------|-----------|-------------|
| `PageView` | any page load | exact |
| `ViewContent` | a quote CTA opens the modal | exact |
| `InitiateCheckout` | visitor clicks into the form iframe | exact |
| `Lead` | form appears to be submitted | **heuristic**, see below |
| `Contact` | mobile call button tapped | exact |

Optimize ad delivery for `Lead`; use `InitiateCheckout` as a backup audience.

### Tracking through the Jobber iframe

The form is cross-origin, so its DOM is unreadable. Two signals are still available,
both derived from Jobber's own embed snippet (`QuoteModal.tsx`):

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
