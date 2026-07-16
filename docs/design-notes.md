# Design Notes — Reference analysis (PLJ Carpentry)

> Reference studied for inspiration ONLY (not to copy): https://pljcarpentry.us/
> A high-converting Cape Cod/MA exterior-carpentry contractor site (WordPress + Elementor).
> Goal: identify what drives conversion + which aesthetic cues to adapt for J&T Builders,
> while keeping J&T's own identity.

---

## PLJ design system (extracted from the live CSS)

**Colors**
- Primary (brand): `#FFE200` bright yellow · warm variants `#F9D801`, `#F9B601` (amber)
- Secondary: `#202020` near-black · Text: `#2F2F2F` · Grays `#707070`, `#B8B8B8`
- Base: mostly white `#ffffff`
- Net effect: **yellow + near-black on white** = bold, rugged, blue-collar-trustworthy.

**Typography**
- Headings: **Arvo** (chunky slab serif) — rugged, sturdy, "construction" feel
- Body: **Poppins** (clean geometric sans)
- Secondary/accent: Roboto Slab / Roboto
- Pattern: heavy slab-serif headline + clean sans body = strong contrast, easy to scan.

**Layout language**
- Yellow accent stripe as a recurring divider/section marker
- Multi-column icon grids for services
- Sticky nav with the phone number always visible
- Generous badges (certifications, manufacturer partners)

---

## What's actually driving conversions (the mechanics worth borrowing)

1. **Lead form IN the hero**, not just a button — "Get a Free Quote in 3 Easy Steps"
   (location → service dropdown → name/email/phone). The offer is captured above the fold.
2. **Social proof immediately after hero** — 5/5, "4.95/5 based on 100+ reviews",
   Nextdoor Fave badge. Trust before scrolling.
3. **Trust-badge row** — Bonded & Insured, OSHA-trained, Background-checked, General Liability,
   manufacturer certs. Reduces "will they do it right?" anxiety.
4. **Manufacturer-partner spotlight** — a dedicated "Roofing Experts" section with CertainTeed
   5-star / Shingle Master badges. Borrows the brand's authority.
5. **Portfolio with before/after + filter tabs** (All / Siding / Roofing / Decking / Trim...).
   Visual proof, self-segmented by what the visitor cares about.
6. **Founder/company story** — humanizes ("started with one van, now six trucks & 30 staff").
7. **Form repeated at the bottom** — "Ready to start an amazing project?" Second capture point.
8. **Phone number persistent** in nav + footer; SMS-friendly.

Section order (top→bottom): Sticky nav → Hero + form → Social proof → Services grid →
Trust signals → Specialty spotlight → Detailed service cards → Portfolio (filterable) →
About/Team → Contact → Second CTA form → Footer (hours, socials).

---

## How to adapt for J&T (keep J&T identity, borrow the structure)

J&T already has an equivalent asset for almost every PLJ conversion lever — so we adapt the
*mechanics*, not the look:

| PLJ lever | J&T equivalent (already true — see docs/copy.md) |
|-----------|--------------------------------------------------|
| Hero lead form | Hero form → "Get Your Free Quote", reply within 24h |
| Social proof (100+ reviews) | Google reviews + 489+ projects + 24+ years + 4 testimonials |
| Trust badges | OSHA Certified · Licensed & Insured · 5-Year Warranty |
| Manufacturer spotlight (CertainTeed) | **Trex & TimberTech** partner spotlight |
| Founder story | **2nd-generation family** story ("you can feel it in the work") |
| Portfolio + filters | Decks / Pergolas / Railings / Remodeling galleries |
| Persistent phone | (203) 300-6384 in sticky nav + footer |

**Aesthetic direction (adapt, don't copy):**
- J&T's existing palette is already in the same family: amber/gold `#D4880A` + dark + white.
  Keep amber/gold as the accent instead of PLJ's neon yellow — reads more premium, still bold.
- J&T's existing font stack (**Oswald** condensed headlines + Nunito Sans/Raleway body) plays the
  same role as PLJ's slab-serif + sans, but feels a touch more modern/premium. Keep it.
- Borrow the **accent-stripe divider** idea and the **badge-row** density, in J&T's amber/dark.

**Where to be BETTER than PLJ (not just match):**
- Cleaner, less cluttered sections (PLJ is badge-heavy/busy) — more whitespace, premium feel.
- One strong, cohesive palette rather than PLJ's many stray colors.
- Lead with the 2nd-generation story as the *differentiator* (PLJ leans on volume; J&T can lean
  on craftsmanship + family legacy + the specific Trex/TimberTech specialty).

**Open decisions for design phase:** how bold vs. premium to go on the accent yellow; whether the
hero uses a full-bleed project photo vs. a form-forward split layout; how many portfolio
categories to expose as filters.
