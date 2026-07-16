# J&T Builders — Design Plan

> The blueprint for the new site. Borrows the *conversion mechanics* that proved themselves
> on the reference site (see `design-notes.md`), but with a modern, premium, fully responsive
> execution that the reference lacks. Copy comes from `copy.md` — locked, don't rewrite there.

---

## 1. Design principles

1. **Premium over loud.** J&T sells 2nd-generation craftsmanship, not cheap volume. Every
   choice (color, spacing, motion) should read "high-end contractor you can trust with a
   $40k deck," not "discount roofer billboard."
2. **Conversion mechanics stay, clutter goes.** Keep: form above the fold, social proof early,
   trust badges, partner spotlight, repeated CTA. Drop: badge soup, stray colors, dense walls
   of boxes.
3. **Photos are the product.** A deck builder's best argument is the work itself. Design around
   large, high-quality project imagery — the UI frames the photos, never competes with them.
4. **Mobile-first, thumb-first.** Most contractor leads come from phones. Every section designed
   for 390px first, then enhanced up. Call/quote actions always within thumb reach.
5. **Modern but timeless.** Subtle motion, big type, generous whitespace. No trendy gimmicks
   that will look dated in 2 years (no glassmorphism overload, no 3D blobs).

---

## 2. Design system

### Colors (Tailwind v4 `@theme` tokens)

| Token | Value | Role |
|-------|-------|------|
| `brand-500` | `#D4880A` | Amber/gold accent — CTAs, highlights, stripe details |
| `brand-400` | `#E89B1C` | Hover/lighter accent |
| `brand-600` | `#B37207` | Pressed/darker accent |
| `ink-950` | `#12100C` | Near-black, warm-tinted — hero bg, footer, dark sections |
| `ink-900` | `#1C1913` | Dark section alt / cards on dark |
| `ink-700` | `#3F3A30` | Body text on light |
| `ink-500` | `#6E675A` | Muted text |
| `cream-50` | `#FBF6ED` | Warm off-white — light section bg (matches old site's hero text color) |
| `white` | `#FFFFFF` | Cards, form fields |

Rationale: keeps J&T's existing amber `#D4880A` identity, replaces PLJ's neon yellow with a
premium gold. Warm near-black instead of pure black. Warm cream instead of sterile white.
**One accent color only** — everything else is neutral. (Semantic green/red only inside form
validation.)

Contrast rule: amber on dark = fine for large text/accents; body text on dark uses cream.
Amber-filled buttons use `ink-950` text (better contrast than white on amber).

### Typography

- **Display / headings:** `Oswald` (600/700) — condensed, uppercase for section titles.
  Already J&T's voice; plays the "sturdy builder" role PLJ's slab serif plays, but modern.
- **Body / UI:** `Nunito Sans` (400/600/700) — friendly, highly legible.
- Scale (fluid with `clamp()`): hero h1 ~ `clamp(2.5rem, 7vw, 4.5rem)`; section h2 ~
  `clamp(1.9rem, 4vw, 3rem)`; body 1rem/1.125rem, relaxed leading.
- Eyebrow pattern: small Nunito Sans, letter-spaced uppercase, amber — above every section h2.

### Spacing, shape, texture

- Section rhythm: `py-20`–`py-28` desktop, `py-14` mobile. Max content width `~1200px`.
- Corners: `rounded-xl`/`rounded-2xl` on cards & images, `rounded-lg` on buttons/inputs.
- **Signature detail:** a short 4px amber rule (`w-12 h-1 bg-brand-500`) under section eyebrows —
  the modern, restrained evolution of PLJ's yellow stripe.
- Dark sections get a subtle wood-grain/blueprint texture at ~3% opacity for warmth (optional).
- Shadows: soft and warm (`shadow-lg` with slight amber tint on hover), never harsh.

### Motion (subtle, performance-safe)

- Scroll-reveal: fade-up 12–16px, ~500ms, staggered in grids (IntersectionObserver, CSS only
  where possible; respect `prefers-reduced-motion`).
- Stat counters animate on first view (24+, 489+, 2nd).
- Cards: gentle lift + image `scale-105` on hover, 300–500ms.
- Hero: slow Ken-Burns zoom on the background photo; rotating service tag word.

---

## 3. Page architecture (single landing page, section by section)

Order tuned from the reference funnel; anchors for nav links.

1. **Sticky header** — transparent over hero → solid `ink-950` blur after scroll. Logo left;
   anchor links center (Services, Why Us, Process, Projects, Reviews); right: phone number +
   amber "Free Quote" button. Mobile: logo + phone icon + hamburger (slide-in menu).
2. **Hero** — full-bleed project photo (best deck shot) under a dark warm gradient
   (heavier at left/bottom). **Split layout on desktop:** left = rotating eyebrow tag, big
   Oswald headline "FROM DEMOLITION / TO PERFECTION", subhead, CTA pair (amber "Get Your Free
   Quote" + ghost "Call (203) 300-6384"); right = **compact quote form card** (name, phone,
   service dropdown, message) on white, floating. Mobile: text stack + CTAs; form collapses to
   the primary button that scrolls to contact (form stays above-the-fold on desktop only).
   Bottom edge: slim **trust strip** (24+ Years · 489+ Projects · OSHA · Licensed & Insured ·
   5-Year Warranty) — quiet icons, one line, scrollable on mobile.
3. **Social proof bar** — immediately after hero: Google ★★★★★ rating + "Live from Google
   Business Profile" + review count, one clean row on cream. (PLJ's strongest move, decluttered.)
4. **Services** — "Deck Specialists & Full-Service Home Builders". 3 large photo cards
   (Decks/Pergolas & Sun Rooms · Railings/Stairs & Exteriors · Remodeling & Additions), image
   top, bullet list, "Get a quote →" link. Desktop 3-col, tablet 2, mobile 1 (or swipe).
5. **Stats band** — dark `ink-950` strip, 3 animated counters: 24+ / 489+ / 2nd Generation.
6. **Partner spotlight** — Trex & TimberTech. Split section: photo left, right = eyebrow
   "Official Partners", copy on composite expertise, partner logos. The premium version of
   PLJ's CertainTeed section — J&T's authority-borrow moment.
7. **Why Choose Us** — "Premium Craftsmanship Built on Trust". 4 tiles: 2nd Generation ·
   OSHA Certified · Licensed & Insured · On-Time Delivery. Icon, title, one line. 4/2/1 cols.
8. **Process** — "Plan It. Build It. Nail It. (Perfect It.)" — numbered horizontal timeline
   (desktop) / vertical steps (mobile), amber connecting line, 4 steps from copy.md.
9. **Projects gallery** — filterable tabs (All · Decks · Pergolas · Railings & Stairs ·
   Remodeling) over a masonry-ish grid of real project photos, lightbox on click. Photos from
   the old site's portfolio. Modernized version of PLJ's before/after wall.
10. **Testimonials** — "What Our Clients Say". 4 Google reviews as cards (2×2 desktop, swipe
    on mobile), stars + quote + name + town. CTA link: "Leave Us a Review on Google".
11. **Final CTA / Contact** — dark section, "START YOUR PROJECT TODAY" big Oswald headline.
    Left: contact info (phone, email, hours, area served) + reassurance line (24h reply,
    no-obligation, 5-year warranty). Right: the full quote form (same component as hero).
12. **Footer** — slim: logo, nav links, phone/email, service area, socials, legal links
    (Privacy/Terms), copyright.
13. **Mobile floating action** — sticky bottom bar on mobile only: [📞 Call] [Get Free Quote],
    appears after scrolling past hero. Thumb-reach conversion, the modern answer to PLJ's
    sticky phone.

---

## 4. Responsiveness contract

- Breakpoints: design at 390px (base), `md` 768, `lg` 1024, `xl` 1280.
- Images: `aspect-ratio` boxes + `object-cover`, lazy-loaded below the fold, explicit
  dimensions (no CLS). Hero image `fetchpriority="high"`.
- Tap targets ≥ 44px; form inputs ≥ 16px font (prevents iOS zoom).
- Test hero, gallery and forms at 390 / 768 / 1440.

## 5. Performance & quality bar

- Lighthouse ≥ 90 all categories. Self-hosted fonts (`@fontsource` Oswald + Nunito Sans),
  `display=swap`, only needed weights (~4 files).
- No heavy animation libs — CSS transitions + IntersectionObserver cover everything above.
  (Framer Motion only if a real need appears.)
- Images optimized (WebP), responsive `srcset` for gallery.
- Semantic HTML (`header/main/section/footer`), one `h1`, alt text on all photos,
  `prefers-reduced-motion` respected, visible focus states (amber ring).

## 6. Build order (when we implement)

1. Design tokens in `index.css` (`@theme`) + fonts + base styles
2. Layout shell: Header + Footer + section scaffold with anchors
3. Hero (+ trust strip) — the make-or-break section
4. Social proof bar → Services → Stats band
5. Partner spotlight → Why Us → Process
6. Gallery (+ lightbox) → Testimonials
7. Contact section + form (validation, submit target TBD) + mobile action bar
8. Motion pass, image optimization, responsive & Lighthouse pass

**Open items:** where the quote form submits to (email service? existing endpoint? TBD with
user) · sourcing the original project photos (scrape old site assets or user provides) ·
Google reviews: static copy from copy.md vs. live API (old site fetched live — decide later).
