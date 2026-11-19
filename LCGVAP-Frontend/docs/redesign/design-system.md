# Design system — "The Register"

Defined in `src/index.css` with Tailwind v4 `@theme`. `tailwind.config.js` is not used by
Tailwind v4 and has been removed; do not recreate it.

Tokens have three layers:

1. **Primitive** (`canton-*`, `seal-*`, `ledger-*`): raw colours. Use only inside `index.css`
   or when no semantic token fits (document why).
2. **Semantic** (`primary`, `ink`, `muted`, `line`, `tint` …): what components use.
3. **Component**: expressed as kit components in `src/components/ui`, not as CSS variables.

## Colour

Source: the Liberian flag and the VCLGC seal. No gold, no cream, no gradients.

| Primitive | Hex | Note |
|---|---|---|
| `canton-50` | `#F3F6FB` | Page wash for long admin views |
| `canton-100` | `#E9EEF6` | "Guilloche": panels, table headers, row hover |
| `canton-300` | `#A9B8D3` | Disabled borders, dividers on tint |
| `canton-500` | `#3C5A94` | Focus ring, links on tint |
| `canton-700` | `#002868` | **Canton Blue**, brand primary (flag canton) |
| `canton-800` | `#001F52` | Primary hover / pressed |
| `canton-900` | `#0E1A33` | **Register Ink**, body text |
| `seal-50` | `#FCEDEF` | Error field background |
| `seal-600` | `#BF0A30` | **Seal Red**, seal graphic, errors, destructive |
| `seal-700` | `#9C0827` | Destructive hover |
| `ledger-300` | `#D5DBE5` | **Ledger Line**, borders |
| `ledger-400` | `#8A94A8` | Placeholder text (not for content) |
| `ledger-500` | `#56627A` | **Ledger Slate**, secondary text (5.9:1 on white) |

| Semantic token | Maps to | Use |
|---|---|---|
| `paper` | `#FFFFFF` | Page and panel background |
| `tint` | `canton-100` | Quiet panels, table header, hover row |
| `wash` | `canton-50` | Admin page background |
| `ink` | `canton-900` | Body text |
| `muted` | `ledger-500` | Secondary text, captions, meta |
| `faint` | `ledger-400` | Placeholders only |
| `line` | `ledger-300` | All borders and rules |
| `primary` / `primary-hover` | `canton-700` / `canton-800` | Primary buttons, links, active nav |
| `on-primary` | `#FFFFFF` | Text on primary |
| `focus` | `canton-500` | Focus outline |
| `seal` | `seal-600` | The seal graphic |
| `danger` / `danger-hover` / `danger-soft` | `seal-600` / `seal-700` / `seal-50` | Errors and destructive actions |

### Red, white and blue (revised 2026-11-17, second time)

Canton Blue is the base: surfaces, type, links, utility buttons. **Flag red is the second
brand colour** and complements it in fixed places, never as decoration everywhere:

| Red is used for | Token / component |
|---|---|
| Joining and verifying actions: "Get verified", "Start your application", hero Search | `Button variant="accent"` (`bg-accent`) |
| Active navigation marker (desktop underline, mobile left bar) | `after:bg-accent`, `border-accent` |
| Step labels in the verification stepper; the final seal node | `text-accent`, `border-accent` |
| The seal, wherever it appears | `Seal` (`text-seal`) |
| University medallion rings | `stroke: var(--color-accent)` |
| A 3px line on top of the footer | `border-accent` |
| Errors, rejected status, destructive actions (always icon + words) | `danger` tokens |

Not red: body text, headings, links, panels, backgrounds, required asterisks.
Utility actions ("Send message", "Sign in", "Search" in admin) stay blue or neutral.
`accent` and `danger` share the flag red; shape, icon and wording tell them apart.

Status tags: *Verified* = primary blue + check; *Pending* = muted on tint + clock;
*Rejected* = danger + x. There is no green and no amber in the system.

### Surfaces

`deep` (`canton-800`, `#001F52`) is the hero surface: one step darker than `primary` so
white type and the photo carry it. One deep/primary surface per page.

## Typography

| Role | Family | Weights | Token |
|---|---|---|---|
| Display: headlines, names, large numbers | Spectral | 600, 700 | `font-display` |
| Text: UI, body, tables, forms | Public Sans | 400, 500, 600, 700 | `font-sans` (default) |

Loaded from Google Fonts in `index.html` with `display=swap` and `preconnect`.
Data columns use `tabular-nums`. No monospace face.

Scale (font-size / line-height). Utilities are `text-<name>`:

| Token | Size | Line height | Use |
|---|---|---|---|
| `text-caption` | 14px | 20px | Meta, helper text, table secondary |
| `text-body` | 16px | 26px | Body, inputs (never below 16px on inputs) |
| `text-lead` | 18px | 30px | Intro paragraphs |
| `text-title` | 22px | 30px | Panel and section titles |
| `text-heading` | 28px | 36px | Page section headings |
| `text-headline` | 36px | 44px | Page titles |
| `text-display` | 48px | 54px | Hero (mobile uses `text-headline`) |
| `text-display-lg` | 60px | 64px | Hero, desktop only |

Rules: sentence case everywhere. No all-caps labels (the only uppercase text is the ring of
the seal). No eyebrow labels above headings. No single accented word in a headline.
Body measure max `68ch` (`max-w-measure`). Headings use `text-balance`.

## Space and layout

- 4px base. Section rhythm: 48 / 64 / 96px (`py-12`, `py-16`, `py-24`).
- Container: `max-w-page` (1200px) with 16px gutter on mobile, 24px tablet, 32px desktop
  (use `<Container>`).
- Left-aligned by default. Centre alignment only for empty states and the auth card.
- Asymmetric splits: 7/5 on desktop, single column below 1024px.
- Breakpoints: Tailwind defaults (`sm` 640, `md` 768, `lg` 1024, `xl` 1280). Verify at 375 and 1440.

## Radius (hierarchy, not one value)

| Token | Value | Use |
|---|---|---|
| `rounded-doc` | 2px | Inputs, buttons, tables, tags |
| `rounded-panel` | 6px | Panels, photos, dialogs |
| `rounded-full` | — | Seal and avatars only |

## Elevation

Borders (`border-line`) and `tint` separate surfaces. Shadows only for things that float:
`shadow-overlay` (menus, popovers, dialogs, toasts). No shadow on resting panels.

## Motion

- Tokens: `--ease-out-quart` for arrivals, `duration-150` for hover/press, `200` for
  open/close, `400` for the seal stamp.
- Automatic motion is allowed only where it **explains verification**, and only on the
  home page (revised 2026-11-17 at the user's request; the first version was too static):
  1. Hero sequence on load: photo settles (`animate-settle`), the verification record card
     rises (`animate-rise`), four checks tick in (`animate-tick`, staggered), then the seal
     stamps the card (`animate-stamp`). Counts roll up once (`CountUpNumber`).
  2. Process stepper on first view: the track draws and each node fills in order
     (`useInView`, CSS transitions with staggered delays).
- Everything else answers a user action (open, expand, confirm).
- `prefers-reduced-motion: reduce` disables all animation and transitions globally,
  including inline delays, so reduced-motion users see final states at once (`index.css`).
- Never leave false information mid-animation: the count-up lands on the real value by
  timer even if the browser pauses animation frames (background tabs).
- Hero photos slide continuously (enter from the right, leave to the left, 7s) with **no
  visible controls**, by the user's decision. They still pause on hover/focus and never
  move under reduced motion. Note: WCAG 2.2.2 asks for a pause control on moving content;
  this is an accepted trade-off, revisit if accessibility review requires it.
- Universities: on first view each medallion's ring draws in turn as the entries rise.
- No fade-up-on-scroll, no hover lift on cards, no ripples.

## Accessibility floor

- Text contrast ≥ 4.5:1 (all semantic text tokens pass on `paper` and `tint`).
- Global `:focus-visible` outline: 2px `focus`, 2px offset. Never removed.
- Touch targets ≥ 44px on mobile for primary controls; ≥ 24px elsewhere.
- Every input has a visible `<label>`; errors sit under the field and are linked with
  `aria-describedby`.
- Icons beside text are `aria-hidden`; icon-only buttons have `aria-label`.

## Banned patterns (slop list)

ALL-CAPS eyebrow labels · "STEP 01" style numbering on non-sequences · middle-dot meta strings
(`A · B · C`) · `→` appended to links and buttons · monospace data labels · gradient washes ·
identical rounded card grids with soft grey shadows · fade/slide-up on every section ·
hover lift on cards · one highlighted word in a headline · cream background with a clay accent ·
emoji as icons.

Icons: `lucide-react` only, 1.75 stroke, sizes 16 / 20 / 24.

## Third-party UI

- **SweetAlert2**: kept for behaviour; restyled globally in `index.css` (`.swal2-*`) to match
  tokens. Do not pass inline colours (`confirmButtonColor`) in new code.
- **antd** (2 admin files): themed via `ConfigProvider` in `App.jsx`.
- **framer-motion**: allowed only for user-triggered transitions (open/close, step change).
  Entrance animations are removed as pages migrate.
