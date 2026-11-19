# Sprint plan

Each sprint migrates a fixed set of files completely. A file is either legacy or migrated —
never half-done at the end of a sprint.

## Definition of done (every sprint)

1. `npm run build` passes.
2. `npx eslint .` shows **no new problems** compared with the baseline below, and touched
   files do not get worse.
3. Every page in scope is screenshotted at **1440px** and **375px** and reviewed against
   `design-system.md` and the web interface guidelines (`/web-design-guidelines`).
4. Logic diff check: `git diff` of each touched page shows only markup/className/copy
   changes and kit imports. Any `api.*` call, state, effect or handler change is a defect.
5. No legacy colour classes (`slate-`, `gray-`, `indigo-`, raw hex) remain in migrated files.
6. The sprint log entry below is written: what changed, screenshots reviewed, issues found,
   follow-ups.

**Lint baseline (before sprint 1):** 20 problems (18 errors, 2 warnings), all pre-existing
(unused `motion` imports, a hook ordering error in `AdminDepartments.jsx`, a fast-refresh
export in `AuthContext.jsx`, missing hook deps). Fixing these is out of scope unless a
sprint touches the file anyway.

---

## Sprint 0 — plan and documentation ✅

- Design plan approved by the user (concept "The Register").
- `docs/redesign/` created: README, design system, sprint plan.

## Sprint 1 — foundation

**Scope:** `index.html`, `src/index.css`, `src/App.css` (deleted), `src/App.jsx`,
`tailwind.config.js` (deleted), `src/components/ui/*`, dev-only kit preview page.

**Tasks**
1. Tokens in `@theme`: colour primitives + semantics, fonts, type scale, radius, shadow,
   motion, container widths.
2. Fonts: Spectral + Public Sans via Google Fonts with preconnect.
3. Base layer: body colours, font smoothing, global `:focus-visible`, reduced motion,
   selection colour, smooth scroll only without reduced motion.
4. Delete `App.css` (none of its classes are used; it centres all text, caps `#root` at
   1280px, and puts an `overflow: hidden` ripple on every button and link).
5. Delete `tailwind.config.js` (ignored by Tailwind v4; nothing references its tokens).
6. Theme SweetAlert2 globally and antd via `ConfigProvider`.
7. UI kit: `cn`, `Container`, `Button`, `Field` + `Input` / `Select` / `Textarea`, `Seal`,
   `StatusTag`, `Panel`, `PageHeader`, `Skeleton`, `Avatar`, `EmptyState`.
8. Dev-only route `/__kit` rendering every kit component in every state (not in production).
9. Favicon: the VCLGC seal instead of the Vite logo.

**Acceptance criteria**
- Kit page renders all components at 1440 and 375 with no horizontal scroll.
- Existing pages still render and work (they keep legacy classes until their sprint); the only
  expected visible change is left-aligned text and full-width layouts now that `#root` is no
  longer centred and capped.

## Sprint 2 — public shell and Home

**Scope:** `Navbar.jsx`, `PublicLayout.jsx` (+ new `SiteFooter`), `SiteHeaderBanner.jsx`,
`Home.jsx` → `src/pages/home/*` sections (Hero, Process, FeaturedGraduates, Universities, FAQ,
Contact), `FeaturedUniversitiesSection.jsx`, `AnimatedGlobe.jsx` (likely retired).

**Acceptance criteria**
- Hero never shows an empty block: static fallback photo while slides load; counts show a
  skeleton, never "—".
- Hero search submits to `/directory?search=…` (uses the existing directory query param;
  verify before wiring).
- Seal stamp is the only automatic animation on the page.
- Mobile nav: accessible disclosure (button with `aria-expanded`, focus kept inside, Esc closes).
- `Home.jsx` under 200 lines; sections each in their own file.

### Sprint 2 spec (written before build)

**Shell**
```
┌──────────────────────────────────────────────────────────────────────┐
│ (logo) VCLGC                Home Directory About News Leadership     │
│        Verified alumni register                 Sign in [Get verified]│
├────────────────────────────────────── 1px line ──────────────────────┤
```
- 64px sticky white bar, 1px `line` bottom border, no blur, no shadow.
- Active link: 2px `primary` bar under the label + `aria-current="page"`. No spring animation.
- Signed-in graduate: "My portal", "Profile" join the links; right side shows "Sign out".
- Below 1024px: menu button (`aria-expanded`, `aria-controls`). Panel lists links and
  actions; Esc and route change close it; focus moves into the panel and back to the button.
- Skip link "Skip to main content" as the first focusable element.
- `SiteHeaderBanner` retired: its only fact (review takes 2–5 business days) moves into the
  process section. Flag-stripe gradients removed everywhere.
- Footer on `ink`: logo + full name + one sentence; columns "Explore", "For graduates",
  "Contact" (mailto link). Sentence-case headings.

**Home** (`src/pages/home/*`, `Home.jsx` keeps data fetching and state only)
```
Hero (paper)
┌───────────────────────────────────────┬──────────────────────────┐
│ Liberian graduates of Cyprus          │ ┌──────────────────────┐ │
│ universities, verified one by one.    │ │  slide photo 4:5     │ │
│                                       │ │                      │ │
│ The official register of the VCLGC…   │ │(SEAL)                │ │
│ Search by graduate name               │ └──────────────────────┘ │
│ [______________________] [Search]     │ caption: slide title     │
│ Graduated in Cyprus? Get verified     │ ‹  ❚❚  ›   2 of 3        │
│ 1,240 verified   9 universities  34 departments                  │
└───────────────────────────────────────┴──────────────────────────┘
How verification works (tint)   1 ─── 2 ─── 3 ─── 4   (ordered list)
Featured graduates (paper)      photo | certificate-style details + seal, ‹ ❚❚ › controls
Universities on the register    ruled list of logo + name, no cards
Questions before you apply      accordion, id="verification-guidelines" kept
CTA (primary panel, once)       "Get verified" inverse button
Contact (paper)                 details list | form built from Field/Input/Textarea
```
- The headline is fixed copy; admin slides keep their role as the photo + caption.
  Fallback slides are used until the CMS returns any.
- Hero photo always has an image (fallback slide 1), so no empty navy block. Counts show
  skeletons while loading and the row hides if the stats request fails. Never "—".
- Seal stamps once onto the photo corner: the page's only automatic animation.
- Hero and featured graduates auto-advance (7s / 6s, unchanged) with a visible pause button,
  pause on hover/focus, and no auto-advance under reduced motion. Crossfade only.
- The fabricated "100% reviewed" stat card is dropped; real counts only.
- All whileInView entrance animations removed. FAQ open/close is the only animated
  interaction (it answers a click).
- Swal calls in Home drop inline `confirmButtonColor` (theme handles it).

**Enabling change (logged exception to "visual only")**: `Directory.jsx` initialises its
search box from `?search=` so the hero search can hand off. Additive; no API change.

## Sprint 3 — register pages

**Scope:** `Directory.jsx` (split into filters, results list, row), `ProfileDetail.jsx`,
`Profile.jsx` (public profile, if routed), `News.jsx`, `NewsDetail.jsx`, `Leadership.jsx`,
`About.jsx`, profile subcomponents used publicly.

**Acceptance criteria**
- Directory is a register list (rows) at ≥1024px and stacked entries below; filters keep
  their current query behaviour; loading uses row skeletons; empty state offers to clear filters.
- Profile reads as a certificate: name in display type, credentials as a `<dl>`, seal only when
  verified.
- Article pages hold a 68ch measure.

## Sprint 4 — auth, registration and member area

**Scope:** `Login.jsx`, `Register.jsx` (multi-step wizard), `StudentDashboard.jsx`,
`ProfilePage.jsx`, `components/profile/*`, `DateOfBirthField.jsx`, `VeteranAssistantChat.jsx`,
`ProtectedRoute` loading state, 404 page.

**Acceptance criteria**
- Register wizard: Identity → Academic record → Documents → Review, real step indicator with
  `aria-current="step"`, back always available, per-field errors under fields, error summary
  on failed submit, file inputs show chosen file and size limits.
- Dashboard shows verification status with `StatusTag` and the seal once verified.
- Assistant chat: keyboard operable, `aria-live` for replies, Esc closes, focus returns to
  the launcher.

## Sprint 5 — admin

**Scope:** `AdminLayout.jsx`, `AdminSidebar.jsx`, `Dashboard.jsx`, `AdminLogin.jsx`,
`AdminRegister.jsx`, all `src/pages/admin/*` (11 files). `AdminVerifiedGraduates.jsx` is split
into list, filters, detail drawer and review actions.

**Acceptance criteria**
- Shared admin `DataTable` pattern (sticky header, tabular numbers, row hover tint, empty and
  loading states) used by every list page.
- Destructive actions use `danger` buttons and SweetAlert confirm with explicit verbs.
- Sidebar collapses to a drawer below 1024px.

## Sprint 6 — hardening

- Full `/web-design-guidelines` pass over every route at 375 / 768 / 1440.
- Keyboard-only walkthrough of register, login, directory, admin review.
- Remove the default Tailwind palette (`--color-*: initial`) so legacy colour classes can no
  longer be used; fix anything that breaks.
- Remove framer-motion entrance animations left anywhere; drop unused dependencies.
- Bundle-size check before and after; route-level `lazy()` splitting (main chunk is
  1.57 MB at Sprint 1).

---

# Sprint log

## Sprint 0 — 2026-11-17
Design plan approved. Docs created. No code changes.

## Sprint 1 — 2026-11-17 ✅ (awaiting user review)

**Changed**
- `src/index.css`: full token set in `@theme` (primitive + semantic colours, Spectral /
  Public Sans, 8-step type scale, `max-w-page` / `max-w-measure`, `rounded-doc` /
  `rounded-panel`, `shadow-overlay`, `animate-stamp`). Base layer: body colours, global
  `:focus-visible`, reduced-motion kill switch, smooth scroll only without reduced motion,
  `touch-action: manipulation`. SweetAlert2 theme (unlayered, see comment in file).
- `index.html`: Google Fonts with preconnect and `display=swap`, seal favicon
  (`public/vclgc-logo.jpeg`), `theme-color`.
- Deleted `src/App.css` and `tailwind.config.js` (none of their classes or tokens were used).
- `src/App.jsx`: antd `ConfigProvider` mapped to the tokens.
- `src/routes/AppRoutes.jsx`: dev-only `/__kit` route (lazy; verified absent from the
  production bundle).
- New `src/components/ui/*`: `cn`, `Container`, `Button`, `Field`, `Input`, `Select`,
  `Textarea`, `Seal`, `StatusTag`, `Panel`, `PageHeader`, `Skeleton`, `Avatar`, `EmptyState`.
- New dependency: `tailwind-merge@^3.7.0` (stable since 2026-09-12), configured in `cn.js`.
- `/.claude/launch.json` (repo root): `frontend` dev server config for previews.

**Verified**
- `npm run build` passes. Kit code is not in `dist`.
- Lint: 20 problems, identical to the baseline; all new files are clean.
- `/__kit` screenshotted at 1440 (headless Chrome) and checked at 375 in the browser pane:
  no horizontal overflow, fonts loaded (Public Sans 400–700, Spectral 600).
- Home still renders after `App.css` removal; `#root` is now full width and left-aligned.

**Issues found and fixed during review**
- Seal ring text collided with the inner border and was unreadable at 64px. Re-spaced the
  ring (text radius 42, inner ring 36) and limited ring text to `lg` / `xl`.
- `stamp` keyframes doubled the −12° tilt (Tailwind v4 `rotate-*` uses the `rotate`
  property, the keyframes used `transform`). Keyframes are now relative.
- SweetAlert theme inside `@layer components` lost to SweetAlert's unlayered CSS. Moved
  out of the layer.
- `as: Tag` destructuring tripped `no-unused-vars` (no JSX plugin). Assigned in the body.

**Known, deliberately deferred**
- SweetAlert calls still pass inline `confirmButtonColor` (indigo / red) in 16 files.
  Inline colour wins over the theme, so destructive confirms stay red. Each page's sprint
  replaces them with the theme default or `customClass: { confirmButton: 'is-danger' }`.
- Legacy pages still use `slate` / `gray` / `indigo` classes until their sprint.
- Main JS chunk is 1.57 MB (pre-existing). Route-level code splitting is a Sprint 6 item.
- Headless Chrome enforces a minimum window width, so true 375px checks run in the browser
  pane (`resize_window` 375×812) rather than `--window-size=375`.

## Sprint 2 — 2026-11-17 ✅ (awaiting user review)

**Changed**
- Shell: `Navbar.jsx` rewritten (64px white bar, `NavLink` active bar + `aria-current`,
  "Sign in" / "Get verified", mobile disclosure with focus-in, Esc-to-close, focus return).
  New `SiteFooter.jsx` on `ink`. `PublicLayout.jsx`: skip link, `<main id="main">`.
- Retired: `SiteHeaderBanner.jsx`, `AnimatedGlobe.jsx`, `FeaturedUniversitiesSection.jsx`
  (moved to `pages/home/UniversitiesSection.jsx`, fetch unchanged). Flag-stripe gradients gone.
- `Home.jsx` 1,258 → 118 lines. Sections in `src/pages/home/`: `HeroSection`,
  `ProcessSection`, `FeaturedGraduatesSection`, `UniversitiesSection`, `GuidelinesSection`,
  `VerifyCallout`, `ContactSection`, `RotationControls`, `homeContent.js`.
- New hooks: `usePrefersReducedMotion`, `useAutoAdvance` (pause control, pause on
  hover/focus, no rotation under reduced motion).
- Kit: `Seal` gains `backed`; tokens gain `animate-swap`; `html` gets `scroll-padding-top`.
- Hero fallback photos are local, pre-sized copies in `public/home/` (≈120 KB each, cut from
  the 5–6k px originals in `public/`). The old Unsplash fallback URL was broken.
- Enabling change: `Directory.jsx` reads `?search=` into its initial state (4 lines).
- `/__kit` now renders `FeaturedGraduatesSection` with fixture data, because the local
  database has no featured graduates.

**Verified**
- Logic diff: the same five API calls (`/slides/public`, `/graduates-showcase/featured`,
  `/faq/published`, `/users/stats/public`, `POST /faq/submit`) plus the unchanged
  `/universities/featured`. Contact validation and submit flow unchanged; Swal copy rewritten
  and inline colours removed.
- Build passes; lint 20 problems = baseline; new files clean.
- Screenshots: 1440 headless with the local backend running (live slide, counts 3 / 5 / 10,
  four universities); 375 in the browser pane, every section; featured graduates via `/__kit`.
  Saved in `docs/redesign/screenshots/sprint-2/`.
- Mobile menu: opens with focus on "Home", Esc closes, focus returns to the button,
  `aria-expanded` toggles. No horizontal overflow at 375.
- `ui-ux-pro-max` checks run for carousel rotation, focus visibility and sticky-header focus.
  No database entry for accordions; the FAQ follows the WAI disclosure pattern
  (heading > button, `aria-controls`, `inert` when closed).

**Issues found in review and fixed**
- Empty hero photo: the fallback pointed at a dead Unsplash image. Now local files.
- `getFileUrl` prefixes `/` paths with the API host, which broke local fallbacks. Fallback
  slides now bypass it.
- "2–5 business days" split across lines. Word joiners + no-break space.
- Footer email broke mid-word in a narrow column. Columns rebalanced (4/2/2/4).
- Search placeholder truncated at 375. Shortened.
- Process steps too tall on phones. Numeral beside the title below 640px.
- Featured graduate without a photo: initials vanished into the tint. Avatar on paper.
- Featured seal at 64px read as a target. Now `lg` with the ring text, hidden on phones.
- Featured photo had no error fallback. Falls back to initials.

**Known, deferred**
- `VeteranAssistantChat` launcher overlaps content at the bottom right on phones (Sprint 4).
- CMS slide titles are Title Case ("Credentials Reviewed With Care"); that is admin content.
- The browser pane sometimes returns a stale frame; DOM state was checked with scripts
  whenever a screenshot disagreed.
- Running the backend locally applied its own startup schema patches and backfill to the
  local database and connected to the Upstash Redis in `.env` (normal startup behaviour).

### Sprint 2 revision — hero and stepper (user feedback, 2026-11-17)

**Feedback:** the hero "is still not giving" and has no animation; the registration steps
should look like real steps.

**Changed**
- Hero moved onto Canton Blue (the page's one blue surface; the closing callout became a
  tint panel). The photo bleeds to the right edge from lg up. A "Verification record" card
  sits on the photo and plays the load sequence: card rises, four checks tick in (Identity
  matches passport, Degree certificate reviewed, University and year confirmed, Approved
  for the public register), then the seal stamps it. Counts roll up from 0.
- Search became a single white bar with the button inside. The photo caption and slide
  controls moved to a dark bar on the photo's top edge.
- Steps are now a stepper: 56px nodes with icons (UserPlus, FileUp, ShieldCheck, seal),
  "Step 1–4" labels, a track that draws on first view, nodes filling in order. Horizontal
  at lg+, vertical with connectors below. Ends with "Start your application".
- New: `useInView`, `CountUpNumber`, `animate-rise` / `animate-tick` / `animate-settle`,
  `RotationControls tone="dark"`, `Seal style` prop.

**Bugs found while reviewing and fixed**
- The verification card overlapped the Search button at 1440. The card now sits fully on
  the photo.
- The caption bar collided with the assistant launcher (bottom right). Moved to the top.
- Counts stayed at 0 in a background tab (animation frames paused), which is false
  information. A timer now lands on the real value.
- The reduced-motion rule didn't cancel inline transition delays. It does now.
- The seal was clipped at the right edge on phones. Repositioned below `sm`.
- The card subtitle left an orphan word. Reworded and widened.

**Verified**
- Build passes; lint 20 = baseline; new files clean.
- Hero at 1440 and 1024 (headless, live data), 375 (browser pane). Stepper final state
  checked in the browser via computed styles (nodes 1–3 `rgb(0, 40, 104)`, node 4 seal
  border, track scale 1) and screenshotted at 1440 and 375.
- Headless Chrome's virtual clock stalls CSS transitions, so mid-sequence frames from it
  are not reliable. The browser pane was used for final states.

### Sprint 2 revision 2 — user feedback, 2026-11-17

**Feedback:** brand text only "VCLGC"; hero blue slightly darker; remove the dark
caption/pause bar and let photos slide on their own; redesign the featured universities
with animation; mobile menu icon long/short/long; less red, blue leads.

**Changed**
- Navbar: "Verified alumni register" removed. New `MenuIcon` (long/short/long bars,
  folds into an X on open, animates `translate`/`rotate`/`scale`). Menu button is ghost.
- Hero on new `deep` token (`#001F52`). Caption bar and rotation controls removed. Photos
  slide with `animate-slide-in` / `animate-slide-out` keyframes; `useAutoAdvance` now
  tracks `previous` so the outgoing photo leaves left.
- Universities redesigned as "Where our graduates studied": medallions (logo in a ring
  echoing the seal), acronym in display type, full name, website link, hairline dividers.
  Rings draw (`stroke-dashoffset`) and entries rise in sequence on first view.
- Red reduced: seal is blue in the stepper and on featured graduates; required asterisks
  muted. Red remains on the hero stamp and on errors only. Docs updated ("The red rule").

**Bugs found while reviewing and fixed**
- First slide approach (class transitions) sent the photo back in from the **left** on the
  wrap from last to first. Verified by reading classes over 14s; replaced with keyframes,
  re-verified (`slide-in` on the incoming photo at every change).
- Universities showed a big "4 featured universities" right below the hero's
  "5 universities". Contradictory; removed.
- Menu icon transition listed `transform`, which Tailwind v4 rotate/translate don't use.
  Fixed to the individual properties; X geometry verified (both bars centred, ±45°).

**Verified**
- Build passes; lint 20 = baseline.
- 1440 headless (final states) with live data; 375 in the browser pane: hero, menu closed
  and open, universities. Screenshots `v3-*` in `screenshots/sprint-2/`.

### Sprint 2 revision 3 — user feedback, 2026-11-17

**Feedback:** centre the desktop menu links; use red (it's in the flag) to complement blue.

**Changed**
- Navbar is a 1fr / auto / 1fr grid on desktop, so the links sit at the true centre
  (measured: link group centre = document centre).
- New `accent` tokens (flag red) and `Button variant="accent"`. Red applied per the table in
  design-system.md: join/verify buttons, hero Search, active nav marker, step labels, final
  stepper node, seal (red again everywhere), university rings, footer top line.

**Verified:** build/lint unchanged; 1440 render `v4-home-1440.png`.

---

## Sprint 3 — register pages (started 2026-11-17)

### Sprint 3 spec (written before build)

**Shared:** `components/PageHero.jsx`, the interior-page header. Deep blue band, 3px red line
along the bottom (same line as the footer), display-type h1, lead, optional slot (search
or actions). Replaces the dark photo-wash headers with uppercase eyebrows and flag stripes
on Directory, News, Leadership and About.

**Directory** (`pages/directory/*`; `Directory.jsx` keeps all state, effects and handlers)
```
PageHero  Search the register            [ name ________________ ][Search]  ← suggestions
Toolbar   12 verified graduates (aria-live)   University ▾  Department ▾  Reset
Chips     Name: Ruth ×   EMU ×                                  Clear all
Register  Graduate              University        Department      Degrees
(lg)      (o) Ruth Kollie ✪    Eastern Med. U.   Business Admin  Master's   ›
Mobile    stacked entries, same data
Pager     ‹ Previous   Page 2 of 5   Next ›
```
- The custom University/Department listboxes (buttons with `role="option"`, no arrow-key
  support) become native `<select>` via the kit `Select`. Same values, same handlers.
- Result rows rise in a short stagger each time results arrive (answers the search).
- Row = one link target (stretched link on the name) to `/directory/:id`; seal `xs`
  beside the name; Premium tag when applicable.

**Public profile** (`ProfileDetail.jsx`): certificate layout. Breadcrumb, photo, name in
display type, verified tag + premium tag, the seal stamps onto the record on load (this is
the record being verified, the same meaning as the hero), `<dl>` for university, department,
member since; bio; verified credentials (`DegreeCard`); badges. Skeleton while loading;
"Record not found" empty state with a way back.

**Shared profile components** (also used by `ProfilePage`, Sprint 4): `PremiumTag` (lone
red star on deep blue, no emoji/amber), `DegreeCard` (tokens, `StatusTag`, no emoji),
`BadgeList` (tint tiles; server-provided badge icons kept as data).

**News**: PageHero; filter buttons with `aria-pressed` and counts; lead story as a
7/5 split; remaining stories in a ruled 3-column list; celebration items tagged with a cake
icon; fallback visual on deep blue when no image. **NewsDetail**: readable article column
(68ch), date and type, display h1, subtitle, image via `getFileUrl`, `.article-body`
typography for CMS HTML.

**Leadership**: PageHero; real tabs (`role="tablist"`, arrow keys) for Current committee /
Past leaders; chair as a split feature; committee members as portrait grid with service
years; past leaders as a ruled list. Remove the invented "Governance focus: Service" stat
and the nested `<main>`.

**About**: PageHero with "Get verified" / "Search the register"; definition statement;
mission and vision as large set statements; what VCLGC protects as three ruled columns;
the animated stepper reused from Home; objectives as a checked list (not numbered: not a
sequence); closing callout reused from Home.

**Defect fixes allowed in this sprint (visual defects):** NewsDetail image uses
`getFileUrl` like the list; article HTML gets real typography (the `prose` plugin was never
installed). **Logged, not fixed:** NewsDetail renders CMS HTML with
`dangerouslySetInnerHTML` and no sanitising (security follow-up); `pages/Profile.jsx` is not
routed (dead code).

### Sprint 3 log — 2026-11-17 ✅ (awaiting user review)

**Changed**
- New `components/PageHero.jsx` (deep blue band, red bottom line, staggered rise of title,
  lead and slot) used by Directory, News, Leadership, About.
- **Directory** 988 → 370 lines. Rendering split into `pages/directory/DirectorySearch`,
  `DirectoryFilters`, `GraduateList` (+ skeleton). The state/effects/handlers block is
  byte-identical to before (checked by script). Custom listboxes replaced with native
  selects; suggestions are an honest button list (the old `role="combobox"` had no arrow
  keys). Removable filter chips, "Clear all", pager as `<nav>`, results count `aria-live`.
  Register rows with column headings at lg, compact two-column entries on phones, seal on
  each avatar's corner, rows rise in a short stagger when results arrive.
- **ProfileDetail**: certificate layout; seal stamps on load (header on sm+, on the photo
  corner on phones); `<dl>` for university/department/member since; skeleton and "Record
  not found" states. Page clips horizontal overflow so the stamp never flashes a scrollbar.
- Shared profile components restyled: `PremiumTag` (lone red star on deep blue; no emoji or
  amber), `DegreeCard` (tokens, `StatusTag`, icons instead of emoji), `BadgeList`.
- **News**: lead story 7/5 split, ruled grid of stories, segmented filter with
  `aria-pressed` and counts, image fallback on deep blue. **NewsDetail**: reading column,
  `.article-body` typography, image via `getFileUrl` (defect fix).
- **Leadership**: WAI tabs with arrow/Home/End keys, chair feature, committee portraits,
  past leaders as ruled rows; invented "Governance focus" stat and nested `<main>` removed.
  Views in `pages/leadership/LeaderViews.jsx` so `/__kit` can render them with fixtures.
- **About**: definition + seal, mission/vision statements, three protections with rules that
  draw on view, the home stepper and callout reused, objectives as a checked list.
- Kit: `PortraitFallback` (initials on deep blue over a red rule) for missing large photos,
  used by leaders, featured graduates and profiles.
- `ProcessSection` now honours reduced motion directly (finished state without waiting for
  the scroll observer).

**Verified**
- Build passes; lint 20 = baseline; every new file clean.
- API calls identical on all six pages (script comparison against the pre-sprint copies).
- 1440 renders with live data for Directory, profile, News, article, Leadership (empty
  state: the database has no leaders), About; leader views via `/__kit` fixtures.
- 375 in the browser pane: Directory (filters toggle verified via DOM), profile; no
  horizontal overflow at rest or during the stamp animation.

**Issues found in review and fixed**
- Long names pushed the row seal onto its own line. Seal moved onto the avatar corner.
- Row dividers ran 12px past the header rule. Hover padding trick removed.
- An eyebrow label ("Verified graduate record") crept onto the profile. Removed.
- Seal was hidden on phones on the profile. Added on the photo corner.
- Stamp animation briefly widened the phone layout to 385px. Clipped.
- Missing leader/graduate photos showed empty tint blocks. `PortraitFallback`.
- Stepper waited for the observer even under reduced motion. Fixed.

**Logged, not fixed (follow-ups)**
- Security: `NewsDetail` renders CMS HTML with `dangerouslySetInnerHTML` unsanitised.
  Recommend DOMPurify (or sanitising server-side).
- `pages/Profile.jsx` is not routed anywhere (dead code; 2 of the baseline lint errors).
- Leadership could not be checked with real data (none in the local database).

### Responsive pass (after Sprint 3) — 2026-11-17

**Method.** An audit script runs in the browser on all 7 public routes at 375, 768, 1024,
1280 and 1440. It reports document overflow, elements past the viewport edge (ignoring
clipped ancestors), clipped text, and tap targets under 24px (under 40px for controls on
phones). Then 768 and 1024 screenshots reviewed by eye. The script is kept for later sprints.

**Found → fixed**
- Standalone text links 20px tall (Visit website, Back to the register, All news, footer
  links, contact email). Now 40px hit areas (`py-2.5 -my-2.5`), layout unchanged.
- Directory "Filters" button 36px on phones. Now 44px.
- Universities at 768 left one medallion orphaned in a 3-column grid. Now a centred flex row:
  2 per row on phones, 4 from 768, all in one ruled row from 1024.
- Stepper stayed vertical until 1024, very long on tablets. Horizontal from 768.
- "Check an application" broke onto two lines at 1024. `whitespace-nowrap`.
- Footer/contact email broke mid-domain ("gmail.c / om"). Breaks only after the "@".

**Result:** audit clean (no findings) on every route at all five widths. No horizontal
overflow anywhere at rest or during animations.

**Rule added for every later sprint:** run the audit at 375 / 768 / 1024 / 1280 / 1440 and
fix to zero findings before the sprint closes.

---

## Sprint 4 — auth, registration and member area (started 2026-11-17)

### Sprint 4 spec (written before build)

**Kit additions:** `FileDrop` (file picker styled as a drop target; shows name and size,
error state, uses `Field` context), used by registration, add-degree and profile photo.

**Login** (OTP, two steps; `requestOtp` / `verifyOtp` calls unchanged)
```
lg:  deep blue panel (seal, "Sign in to your record", 3 facts) | form panel
     Step 1 of 2  Email address [______________]  [Send sign-in code]
     Step 2 of 2  6-digit code  [ 0 0 0 0 0 0 ]  (autocomplete one-time-code)
phone: form only, facts below
```

**Register → 4-step wizard** (`pages/register/*`; `Register.jsx` keeps all state, effects,
`validateForm` and `handleSubmit` unchanged)
```
Stepper  ①Identity ─ ②Academic record ─ ③Documents ─ ④Review   (phone: "Step 2 of 4" + bar)
Panel    fields for the step, inline errors
Footer   [Back]                                [Continue] / [Submit for verification]
```
- Per-step check before Continue (required, email format, year range); errors under fields.
- Review lists everything entered with "Change" links back to each step.
- On submit, if `validateForm` finds a problem, jump to the step that holds it.
- Focus moves to the step heading on every step change.

**DateOfBirthField (defect fix):** day / month / year selects on all screen sizes, keeping
partial choices in local state. Today the phone selects reset after each pick (the partial
date is reported as empty) and the hidden desktop date input is `required`, which blocks
submission on phones.

**StudentDashboard:** greeting + status (seal when verified); verification progress as the
stepper (done / current / to do); counts as a ruled row; rejected credentials as a danger
panel with reasons; credentials list with `StatusTag`; quick links.

**ProfilePage + ProfileHeader + AddDegreeForm:** tokens, kit fields, `FileDrop`; Add
degree shows an error when no degree type is chosen (today it fails silently).

**VeteranAssistantChat:** restyle only (send/stream/fallback logic unchanged); deep blue
header, `role="log"` + `aria-live` on messages, focus returns to the launcher on close,
"VCLGC" naming, no hover lift. Footer gets bottom padding on phones so the launcher never
covers the last line.

**404:** a real not-found page inside the public layout.

### Sprint 4 log — 2026-11-17 ✅ (awaiting user review)

**Changed**
- **Login**: split layout (context panel on deep blue with a faint seal, form panel);
  "Step 1 of 2" + bar; `autocomplete="one-time-code"` and numeric keypad for the code;
  focus moves to the heading on step change. `requestOtp` / `verifyOtp` calls unchanged.
- **Register → 4-step wizard**: `pages/register/` (`wizardSteps`, `WizardStepper`,
  `WizardFields`). Per-step checks with clear messages, review step with "Change" per
  section, stepper (vertical with completed-step links on desktop, "Step n of 4" + bar on
  phones), focus to the step heading. State, data loading, `validateForm` and
  `handleSubmit` unchanged (script diff: only the success message wording/inline colour).
- **DateOfBirthField** (defect fix): day/month/year selects everywhere with local partial
  state. Verified in the browser: month stays selected after the first pick.
- **StudentDashboard**: greeting + status (seal when verified), progress stepper (done /
  next / to do), counts row, "needs attention" danger panel with reasons, degrees list with
  status tags, shortcuts.
- **ProfilePage / ProfileHeader / AddDegreeForm**: kit fields, `FileDrop`, seal on avatar
  when verified; Add degree now says "Choose the type of degree." instead of failing
  silently. Pre-existing unused `authUser` removed.
- **VeteranAssistantChat**: restyle only (send/stream/fallback byte-identical): deep blue
  header with red line, `role="log"` + `aria-live`, focus returns to the launcher on close,
  "VCLGC" naming, chips for starter questions, no hover lift.
- **404** page inside the public layout. Footer bottom padding on phones clears the launcher.
- Kit: `FileDrop`. Dev only: `/__member?page=dashboard|profile&state=verified|pending`
  renders the member pages with sample data (mocked API, only active on that path).

**Verified**
- Build passes. Lint 18 (was 20: two pre-existing errors in touched files fixed).
- Dev previews confirmed absent from the production bundle.
- Wizard walked end to end in the browser with live universities/departments: empty-step
  errors, bad-email error, date persistence, file required, review contents. **Not
  submitted** (would create a real application).
- Chat: opens with focus in the input, `aria-live="polite"` log, Esc closes and focus
  returns to the launcher.
- Responsive audit: Login, Register, dashboard (both states), profile, 404 at 375 / 768 /
  1024 / 1280 / 1440: zero findings after fixes.

**Issues found in review and fixed**
- "Skip first render" guards were defeated by React StrictMode's double effect run: the
  wizard scrolled to the form and focused it on load. Now compares with the previous step.
- Verified-dashboard seal poked past the edge during the stamp at 375. Clipped.
- Chat placeholder wrapped and clipped on phones. Shortened.
- A red "unread" dot I added to the chat launcher implied notifications that do not exist.
  Removed.
- Bio divider on the profile header stopped short of the panel. Full width now.

**Not verified**
- Real sign-in and the dashboard/profile with a real account (OTP goes to a real inbox).
  Reviewed through the `/__member` preview instead.
