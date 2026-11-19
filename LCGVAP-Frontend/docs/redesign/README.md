# Frontend redesign — "The Register"

The VCLGC portal is the official register of Liberian graduates of Cyprus (TRNC) universities.
This folder is the single source of truth for the redesign. Read it before touching UI code.

| Document | What it holds |
|---|---|
| [design-system.md](design-system.md) | Tokens (colour, type, space, radius, motion), usage rules, banned patterns |
| [components.md](components.md) | The `src/components/ui` kit: every component, its props and when to use it |
| [sprints.md](sprints.md) | Sprint plan, scope, acceptance criteria, definition of done, and the sprint log |

## Ground rules

1. **Visual and UX only.** API calls, auth, routing, validation and data shapes do not change.
   If a page needs a logic change to look right, it is logged as a follow-up, not done inline.
2. **One sprint at a time.** A sprint is closed only when its definition of done is met
   and logged in `sprints.md`. No page is half-migrated across sprints.
3. **Tokens, not raw values.** New or migrated code uses the token utilities from
   `src/index.css` (`bg-primary`, `text-ink`, `border-line` …). Raw hex, `slate-*`, `gray-*`
   and `indigo-*` classes are legacy and are removed page by page.
4. **Kit first.** If a pattern appears on two pages it belongs in `src/components/ui`.
5. **Build on the working tree.** The uncommitted AI assistant work and earlier edits are kept;
   nothing is reverted.

## Status

| Sprint | Scope | Status |
|---|---|---|
| 0 | Plan and documentation | Done |
| 1 | Foundation: tokens, fonts, base styles, UI kit | Done |
| 2 | Public shell and Home | Done |
| 3 | Directory, profiles, News, Leadership, About | Done |
| 4 | Auth, registration wizard, member area, assistant chat | Done, awaiting review |
| 5 | Admin shell and admin pages | Planned |
| 6 | Hardening: accessibility, legacy cleanup, token enforcement | Planned |
