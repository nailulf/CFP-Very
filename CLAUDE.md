# CFP Very — Claude Design & Frontend Guide

## Role

You are the **designer and frontend developer** for this project. Every UI change — new screens, components, layout tweaks, or visual fixes — must follow the design system defined in `design website.pen`. Never invent styles, colors, or spacing from scratch. Always consult the design file first.

---

## Project Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **Design file**: `design website.pen` (Pencil MCP — encrypted, read via MCP tools only)

---

## Design File: Source of Truth

**`design website.pen` is the single source of truth for all visual decisions.**

### How to use the design file

Before implementing any UI work:

1. Open the file: `mcp__pencil__open_document` with path `design website.pen`
2. Get current state: `mcp__pencil__get_editor_state`
3. Get variables/tokens: `mcp__pencil__get_variables`
4. Read relevant frames: `mcp__pencil__batch_get` on the relevant screen node IDs
5. Screenshot for reference: `mcp__pencil__get_screenshot` on the frame

**Never** read `.pen` files with `Read`, `Grep`, or `Bash` — they are encrypted.

### Screens in the design file

| Node ID | Screen |
|---------|--------|
| `Q3Z65` | Main landing page (Option B — Teal/Blue) |
| `ICbdI` | Checkout — Book a Date |
| `4rk7V` | Checkout — Payment |
| `PpzHi` | Checkout — Confirmation |
| `baG1y` | Component: Checkout Header (reusable) |
| `klbxe` | Financial Health Check — Form/Wizard page |
| `O1rpD6` | Financial Health Check — Results/Verdict page |
| `pbCZ9` | Design System (colors, type scale, components, spacing) |

---

## Design System

### Colors

**Core palette** (from design system node `pbCZ9`):

| Token | Hex | Usage |
|-------|-----|-------|
| `navy` | `#153A56` | Dark sections (How It Works, Footer) |
| `primary` | `#205781` | Primary actions, nav, active states |
| `teal` | `#4F9DA6` | Accents, gradients, icons |
| `amber` | `#f79d35` | CTAs, highlights, energy accents |
| `page-bg` | `#F0F7FA` | Page/screen background |
| `light-blue` | `#E0EBF5` | Light surfaces, hover states, card borders |
| `dark` | `#1A1918` | Body text, headings |
| `muted` | `#666666` | Secondary text |
| White | `#FFFFFF` | Card backgrounds, surfaces |

**Extended palette** (used in components, not in core swatches):

| Token | Hex | Usage |
|-------|-----|-------|
| `mint` | `#8AD6C1` | Section badges (light variant), subtle highlights |
| `subtle` | `#9C9B99` | Placeholder, tertiary text |
| `navy-card` | `#1A3A50` | Cards inside dark sections |

**Status colors**:

| State | Background | Text/Accent |
|-------|-----------|-------------|
| Success | `#E8F5EE` | `#1B7A3F` |
| Warning | `#FFF8E1` | `#D97706` |
| Error | `#FFF0EB` | `#8C1C00` |
| Info | `#DFDFE6` | `#000066` |

**Primary gradient**: `#205781` → `#4F9DA6`, direction: 180° (top → bottom)

### Typography

**Fonts**: **Outfit** (headings, body, UI) · **JetBrains Mono** (code, labels, mono data)

| Role | Size | Weight | Notes |
|------|------|--------|-------|
| Display / Hero | 44–56px | 800 | letter-spacing: -1.2, line-height: 1.1 |
| H1 | 40px | 800 | letter-spacing: -1.0, line-height: 1.15 |
| H2 | 32px | 800 | letter-spacing: -0.8 |
| H3 | 24px | 800 | |
| H4 | 22px | 800 | |
| Large / Card heading | 18px | 600 | |
| Base / Body | 15–16px | 500 | |
| Small | 13px | 400 | |
| Overline / Label | 11px | 700 | letter-spacing: 1.5, UPPERCASE |
| Logo | 20px | 700 | letter-spacing: -0.5 |
| Nav links | 14px | 500 | |

Use **JetBrains Mono** for: section overline labels (e.g. "WARNA", "TIPOGRAFI"), code snippets, monospaced data.

### Spacing & Layout

- **Max content width**: 1440px
- **Section horizontal padding**: 80px
- **Section vertical padding**: 80–100px
- **Card padding**: 28px
- **Gap between cards**: 24–32px
- **Gap between sections**: 48px

### Border Radius

| Use | Value |
|-----|-------|
| Cards | 16px |
| Pill buttons | 999px |
| Progress steps (active) | 999px |
| Images | 24px |

### Shadows

- **Card shadow**: `box-shadow: 0 2px 8px rgba(0,0,0,0.04)`
- **Modal/overlay shadow**: `0 2px 12px rgba(0,0,0,0.04)`

---

## Component Patterns

### Navigation

- Full-width, `padding: 16px 80px`
- Logo (Outfit 700) on the left, nav links center-right, CTA button far right
- CTA button: pill shape, primary gradient or solid `#205781`

### Buttons

```tsx
// Primary — gradient pill
className="bg-gradient-to-b from-primary to-teal text-white rounded-full px-6 py-3 font-semibold"

// Secondary — outlined
className="border border-primary text-primary rounded-full px-6 py-3 font-semibold"
```

### Cards

```tsx
className="bg-white rounded-2xl border border-[#E0EBF5] shadow-[0_2px_8px_rgba(0,0,0,0.04)] p-7"
```

### Dark Section (How It Works, Footer)

```tsx
// Background
className="bg-navy" // #153A56

// Text on dark
className="text-white"
```

### Checkout Header (Step Indicator)

- 3-step: Book a Date → Payment → Confirmation
- Active step: pill badge with `#205781` fill, white text, weight 600
- Completed steps: teal `#4F9DA6`, weight 500
- Inactive steps: muted gray

---

## Development Workflow

### When adding a new screen or section

1. Open `design website.pen` and screenshot the target frame
2. Read the node tree with `batch_get` (depth 2–3)
3. Extract colors, typography, spacing, and layout from the node data
4. Implement using Tailwind classes that match the design tokens above
5. Match font sizes, weights, letter-spacing, and line-height exactly
6. Verify visually — run dev server and compare to the design screenshot

### When updating an existing component

1. Always check the design file before changing any visual property
2. Do not deviate from the design unless the user explicitly asks
3. Keep components consistent with other existing screens

### File structure conventions

```
src/
  app/             # Next.js pages (App Router)
  components/
    layout/        # Navbar, Footer, SiteChrome
    sections/      # Page sections (Hero, HowItWorks, etc.)
    ui/            # Reusable primitives (Button, Badge, Modal, etc.)
  data/            # Static data
  lib/             # Utilities, API helpers
  types/           # Shared TypeScript types
```

- New **page sections** → `src/components/sections/`
- New **reusable UI primitives** → `src/components/ui/`
- New **pages** → `src/app/`

---

## Design Rules (Non-Negotiable)

1. **Always reference `design website.pen`** before writing any UI code
2. **Never hardcode colors** that aren't in the design system above
3. **Never invent new font sizes or weights** not listed in the typography table
4. **Maintain the Checkout flow** (Book a Date → Payment → Confirmation) as a 3-step progressive sequence
5. **Page background is always `#F0F7FA`** — never white or gray variants
6. **Cards are always white** (`#FFFFFF`) with `#E0EBF5` border
7. **Gradients** go from `#205781` to `#4F9DA6` at 180° — no other gradient combinations
8. **Primary fonts are Outfit + JetBrains Mono only** — do not introduce other typefaces
9. **Amber `#f79d35`** is the accent/CTA color — replaces the old gold `#D4A64A`
10. **Status colors** must use the defined palette (success/warning/error/info) — no ad-hoc reds or greens

---

## Financial Health Check Feature

**Route**: `/cek-kesehatan-keuangan` · **Spec**: `Financial Health Check Spec.docx`

### Design nodes
| Node ID | Screen |
|---------|--------|
| `klbxe` | Form / Wizard page |
| `O1rpD6` | Results / Verdict page |

### Architecture
- All calculations are **client-side** (`src/app/cek-kesehatan-keuangan/lib/calculations.ts`)
- Types live in `src/app/cek-kesehatan-keuangan/lib/types.ts`
- No login or backend required — anonymous tool
- Single client component (`HealthCheckForm.tsx`) manages all 7 steps + results via React state

### Form design rules
- **2-column field grids** use `sm:items-start gap-5` so labels are always top-aligned. Use a single flat grid per step — CSS auto-placement puts odd last fields at half-width naturally:
  ```tsx
  const G2 = 'grid grid-cols-1 sm:grid-cols-2 sm:items-start gap-5';
  ```
- **Hint slot is ALWAYS rendered** in every input primitive (`CurrencyInput`, `SelectInput`, `NumberInput`). Use `min-h-[14px]` so the slot occupies the same space whether or not hint text is present. **Never** conditionally render the hint `<p>` — doing so causes sibling columns to misalign when one field has a hint and the other doesn't:
  ```tsx
  // CORRECT — always rendered, invisible when no hint
  <p className={`text-[11px] leading-none min-h-[14px] ${hint ? 'text-[#9BAFC0]' : 'invisible'}`}>{hint}</p>

  // WRONG — conditional render breaks alignment
  {hint && <p className="text-[11px] text-[#9BAFC0]">{hint}</p>}
  ```
- Input styling: `h-[48px]` · `bg-[#F5F8FC]` · `border-[#CBDCEA]` · `rounded-[10px]` · amber focus ring
- Label: `text-[13px] font-semibold text-[#3A5A70]`
- Hint: `text-[11px] text-[#9BAFC0]`
- CTA button: amber `#D97706` rounded-full with amber glow shadow

### Results design rules
- Score hero: dark navy gradient (`#153A56 → #1E5070`), amber score number (80–112px), horizontal progress bar
- Ratio cards: horizontal split — content area (flex-1) + colored value panel (108px wide, 120px tall)
- Status colors for ratio cards use `STATUS_THEME` map (green/yellow/red) — never invent new colors
- 6 ratios displayed in 2 rows × 3 columns (`sm:grid-cols-3`)
