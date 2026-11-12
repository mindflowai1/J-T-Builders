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

## Lead capture (own form → Jobber API)

The quote form is the site's own (`src/components/QuoteForm.tsx`), in three steps (service,
project, contact). It sits in the hero (`#quote-form`) and in the contact section; every
"Get Your Free Quote" CTA scrolls to the hero one via `src/lib/openQuote.ts` (from blog
pages, a link to `/#quote-form`). It posts to `api/jobber/create-request.ts`, which creates the
client (or reuses an existing one), the request, and a note with the description over
Jobber's GraphQL API (version pinned in the file).

Credentials: `JOBBER_CLIENT_ID`, `JOBBER_CLIENT_SECRET`, `JOBBER_REFRESH_TOKEN` on Vercel.
Refresh token rotation is **off** on the Developer Center app, so the refresh token stays
valid until the app is disconnected or its client secret is regenerated. After either:

1. Put the current client secret in `JOBBER_CLIENT_SECRET` and redeploy.
2. Open `/api/jobber/connect`, authorize, copy the refresh token into
   `JOBBER_REFRESH_TOKEN`, redeploy.
3. Open `/api/jobber/create-request` (GET): `{"ok":true,"account":...}` means leads will go
   through. It creates nothing.

If a submit fails, the form says so and shows the phone number; the cause is in the
Vercel function logs (`create-request`).

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

Blog pages are not hydrated as a whole: only the header and the mobile bar
become interactive (`src/blog/client.tsx`). Quote buttons link to the home page's form
(`/#quote-form`).

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
| `ViewContent` | a quote CTA is clicked (scrolls to the form) | exact |
| `InitiateCheckout` | visitor focuses a form field | exact |
| `Lead` | server confirms the request was created in Jobber | exact |
| `Contact` | any `tel:` link clicked (also fires Google Ads `ads_conversion_phone_call_lead`) | exact |

Optimize ad delivery for `Lead`; use `InitiateCheckout` as a backup audience.

### Lead tracking

`Lead` (Pixel + Conversions API, with the email/phone for match quality), the Google Ads
conversion and GA4's `generate_lead` fire only after `create-request` answers OK, so each
one is a request that really reached Jobber.

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
