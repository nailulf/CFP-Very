# Homepage Redesign — Design Spec

**Date:** 2026-09-19
**Route:** `/` (`src/app/page.tsx`)
**Approved mockup:** https://claude.ai/code/artifact/2bfa070d-449a-44a9-87cf-70d7009a40a8

---

## 1. Goal

Replace the current homepage with the approved mockup layout, while every
CTA, link and interactive element continues to reach the same working
destinations it reaches today. No functional regression is acceptable:
the booking flow, the free health-check tool, the corporate page, the
digital-product purchase links and the ID/EN switcher must all behave
exactly as they do now.

**Non-goals.** No changes to `/konsultasi`, `/korporat`,
`/financial-health-check`, the booking flow, the admin area, or any API
route. No new pages. No third language.

---

## 2. Section map

| # | New section | Replaces | Band |
|---|---|---|---|
| 1 | Hero — photo right, masked | inline hero in `page.tsx` | cream → page |
| 2 | Client strip (Pinhome, Bank Indonesia) | *new* | page |
| 3 | Problem — 6 tinted cards | *new* | white |
| 4 | Services — 3 cards | `<Services />` | page |
| 5 | Corporate — 2 offerings | *new* | navy |
| 6 | Testimonials — tabbed, 3 cards | inline Social Proof | page |
| 7 | Digital Products — 5-card carousel | part of `<Services />` | white |
| 8 | Final CTA | inline final CTA | navy gradient |

**Dropped from the current page:** How It Works (3 steps), the stats row
(`+++` / `Rp 5M+` / `4.9⭐`), and the hero trust line.

---

## 3. CTA and route map

This is the core of the "seamless" requirement. Every interactive element
in the mockup currently points at `#`. Real targets:

| Element | Destination | Notes |
|---|---|---|
| Nav "Mulai Konsultasi" | `https://wa.me/6281806484635` | **unchanged** — current nav CTA behaviour |
| Hero "Mulai Konsultasi" | `/konsultasi` | landing page, not the booking form |
| Hero "Lihat Layanan" | `#services` | anchor must stay `services`, see §4 |
| Problem block CTA | `#services` | |
| Service card 1 — Financial Health Check | `/financial-health-check` | free tool, real route |
| Service card 2 — Personal Financial Planning | `/konsultasi` | |
| Service card 3 — Couple & Family Planning | `/konsultasi` | |
| Services block CTA | `/konsultasi/booking` | the actual booking flow |
| Corporate "Minta proposal" | `/korporat` | |
| Testimonials "Lihat semua" | *remove* until a testimonials page exists |
| Product card buttons | `product.downloadUrl` | from `src/data/digitalProducts.ts` |
| Products block CTA | opens `<DigitalProductsModal />` | reuse existing modal |
| Final CTA primary | `/konsultasi/booking` | |
| Final CTA secondary | `/financial-health-check` | |

External links (`wa.me`, `clicky.id`) keep
`target="_blank" rel="noopener noreferrer"`.

---

## 4. Broken anchors — must be fixed in the same change

`Navbar.tsx` and `Footer.tsx` are shared chrome rendered on every page,
and both link to homepage anchors that the redesign deletes. Currently in
`translations.ts`:

| Anchor | Referenced by | Status after redesign |
|---|---|---|
| `#services` | footer ×3 (both langs), hero | **survives** — keep `id="services"` on the new Services section (do *not* rename to `layanan`) |
| `#about` | navbar "Testimoni", footer "Tentang" + "Testimoni" | section deleted |
| `#how-it-works` | navbar "Cara Kerja", footer "Cara Kerja" | section deleted |

Resolution:

- **`#about` → `/#testimoni`.** The new testimonials section carries
  `id="testimoni"`. The navbar and footer "Testimoni" links repoint there.
- **Footer "Tentang"** — no About section exists any more and there is no
  `/tentang` route. Decision needed (§11).
- **`#how-it-works` → `/konsultasi`.** That page already contains
  `BagaimanaKamiMembantu` ("how we help"), which is the closest real
  equivalent. Alternatively drop the link.

All edits land in `translations.ts` (both `id` and `en` blocks — the
anchors are duplicated per language).

---

## 5. Component architecture

New files under `src/components/sections/home/`:

```
HomeHero.tsx           hero + credential float
ClientStrip.tsx        logo row
ProblemCards.tsx       6 tinted cards
HomeServices.tsx       3 service cards
CorporateTeaser.tsx    navy band, 2 offerings
Testimonials.tsx       tabbed, client component (useState)
ProductCarousel.tsx    client component (scroll + snap)
HomeFinalCTA.tsx       closing band
```

`page.tsx` becomes a thin composition of these. It can stop being
`'use client'` — only Testimonials and ProductCarousel need client
interactivity; the rest can be server components fed by the language
context. Since `useLang()` is a client hook, the simplest correct
approach is to keep each section a client component, matching the
existing convention in `Services.tsx`.

**Dead code discovered.** `Hero.tsx`, `HowItWorks.tsx`, `SocialProof.tsx`,
`FinalCTA.tsx`, `BlogPreview.tsx` and `ContactPanel.tsx` have **zero
imports** — `page.tsx` renders its own inline copies. They should be
deleted as part of this change rather than left to rot.
`ServiceInfoCard.tsx`, `DigitalProductsCard.tsx` and `Services.tsx` are
live and will be superseded; `DigitalProductsModal.tsx` is **kept and
reused**.

---

## 6. Digital products — data, not hardcoded markup

The mockup hardcodes five product cards. The app already has
`src/data/digitalProducts.ts` with exactly those five products, including
`price`, `originalPrice`, `isFree`, `category`, `fileType` and a real
`downloadUrl`.

`ProductCarousel` maps over `digitalProducts`. The card renders:

- `dp-meta` ← `` `${category} · ${fileType}` ``
- title ← `title`
- body ← `description` (currently long for some products; truncate with
  `line-clamp-3` or add a short `blurb` field)
- price ← `isFree ? "Gratis" : price` with `originalPrice` struck through
- button ← "Unduh" when free, otherwise "Lihat", href `downloadUrl`

Prices in the data are `"IDR 25000"`; the mockup shows `Rp 25.000`. Add a
formatter rather than restating prices in the component.

The spreadsheet preview graphic stays a CSS placeholder until real
screenshots exist.

---

## 7. Internationalisation

Per CLAUDE.md every user-facing string needs `id` and `en` entries, ID
written first, consumed via `useLang()` + `translations`. The mockup is
Indonesian-only, so **English copy must be written for every new string**
— roughly 60 strings across the eight sections.

New `translations.ts` shape under each language:

```ts
home: {
  hero:        { kicker, headline, lede, ctaPrimary, ctaSecondary },
  clients:     { label },
  problem:     { title, lede, items: [{ state, consequence }], close, cta },
  services:    { title, lede, items: [{ quote, name, desc, cta }], cta },
  corporate:   { overline, title, lede, items: [{ label, name, desc }], cta, ctaNote },
  testimonials:{ title, lede, tabs, items: [...], cta },
  products:    { title, lede, cta, free, download, view },
  finalCTA:    { headline, lede, ctaPrimary, ctaSecondary, assurances },
}
```

The old `hero`, `howItWorks`, `socialProof`, `finalCTA` keys are removed
once nothing references them. `navbar`, `footer`, `konsultasi` and
`korporat` keys stay untouched apart from the anchor fixes in §4.

---

## 8. Typography and palette

**Fonts.** `layout.tsx` currently loads only `Outfit`. JetBrains Mono is
named in CLAUDE.md but never actually loaded. Replace with:

```ts
import { Plus_Jakarta_Sans, Source_Serif_4, IBM_Plex_Mono } from "next/font/google";
```

exposed as `--font-sans`, `--font-serif`, `--font-mono`, wired through
`globals.css`.

**Palette.** Add the card tints as CSS custom properties in `globals.css`:

```
--tint-blue #E9F1F8   --tint-blue-2  #D7E5F0
--tint-teal #E4EFEC   --tint-teal-2  #CFE3DD
--tint-slate #E2E9F0  --tint-slate-2 #CFDCE9
--cream #FBF6EE       --peach #F7E7D4
```

**CLAUDE.md must be updated in the same commit.** The redesign
deliberately departs from three of its current rules:

- Rule 5 — page background is always `#F0F7FA`: the hero, nav and footer
  now use cream `#FBF6EE`.
- Rule 8 — Outfit + JetBrains Mono only: now Plus Jakarta Sans + Source
  Serif 4 + IBM Plex Mono.
- The typography table (sizes/weights) no longer matches.

Leaving CLAUDE.md stale would make the next session fight this design.

---

## 9. Content blockers

These must be resolved before production, not before implementation —
build against clearly-marked placeholders, swap later.

1. **Testimonials are placeholder text.** Three "Slot 1/2/3" cards with
   dummy copy. The current site has three real testimonials in
   `socialProof.testimonials` which can be reused, though their voice
   ("padahal mereka nggak saya suap") clashes with the new register.
2. **Client logos.** Pinhome and Bank Indonesia are text placeholders.
   Real SVGs needed, plus confirmation the brands may be displayed.
3. **Bank Indonesia is listed under "Dipercaya oleh".** The site
   elsewhere describes Very as *Ex-Bank Indonesia* — a former employer,
   not a client. The neutral label avoids an inaccurate claim; revisit if
   it was in fact a client engagement.

---

## 10. Build sequence

1. **Foundation** — fonts in `layout.tsx`, tints in `globals.css`, update
   CLAUDE.md. Verify existing pages still render.
2. **Translations** — add the `home` block with full ID + EN copy; fix the
   three broken anchors in both language blocks.
3. **Sections** — build the eight components bottom-up, each wired to its
   real CTA from §3. Test each in isolation on the page as it is added.
4. **Compose** — rewrite `page.tsx`; delete the six dead section files.
5. **Verify** — §11 checklist.
6. **Design file** — update `design website.pen` node `Q3Z65` to match, per
   the CLAUDE.md workflow.

Steps 1–2 are prerequisites for 3. Step 4 must not land before 3 is
complete, or the homepage is broken on `main`.

---

## 11. Verification checklist

- [ ] Every CTA in §3 navigates to its stated destination
- [ ] Nav CTA still opens WhatsApp in a new tab
- [ ] Footer and navbar anchor links all resolve (no dead `#` targets)
- [ ] ID ⇄ EN switch changes every string on the page; no hardcoded text
- [ ] Language choice still persists to `localStorage` key `cfp-lang`
- [ ] Product buttons open the correct `clicky.id` URL per product
- [ ] Digital products modal still opens and lists all 5 products
- [ ] Carousel: arrows, drag, keyboard; disabled at both ends
- [ ] Responsive at 1440 / 1024 / 768 / 375
- [ ] `npm run build` clean; no unused-import or TS errors
- [ ] Lighthouse: hero image `priority`, no CLS from the masked photo

---

## 12. Open decisions

1. **Footer "Tentang"** — drop the link, or create a `/tentang` page? The
   About section (Very's statement + credentials) was removed from the
   homepage and now exists nowhere.
2. **Cream vs `#F0F7FA`** — keep the warm base, or revert to the mandated
   page background and confine warmth to the glow behind the photo?
3. **Testimonials** — reuse the three existing ones rewritten in the new
   voice, or hold for fresh ones?
4. **Hero photo edge** — `hero.png` has a baked-in peach backdrop, so it
   renders as a soft-edged rectangle. A background-removed cut-out would
   fix it properly.
