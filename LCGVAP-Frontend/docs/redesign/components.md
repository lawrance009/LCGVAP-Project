# UI kit — `src/components/ui`

Import from the barrel: `import { Button, Field, Input } from '../components/ui';`
Live reference (dev only): run `npm run dev` and open `/__kit`.

All components accept `className`, merged with `cn()` (tailwind-merge configured for our
tokens), so a caller's class wins over the component's default for the same property.

## `cn(...classes)`
Joins classes, drops falsy values, resolves Tailwind conflicts. When you add a token to
`@theme` in `index.css`, add its name to the matching group in `cn.js`, or tailwind-merge may
drop it (for example it would read a new `text-*` size as a colour).

## `Container`
| Prop | Default | |
|---|---|---|
| `as` | `'div'` | Element to render (`section`, `main` …) |

1200px max width, 16 / 24 / 32px gutters. Every page section's content sits in one.

## `Button`
| Prop | Default | |
|---|---|---|
| `variant` | `primary` | `primary`, `accent` (flag red: join/verify actions), `secondary`, `ghost`, `danger`, `danger-outline`, `inverse` (on blue) |
| `size` | `md` | `sm` 36px, `md` 44px, `lg` 48px, `icon` 44×44 |
| `to` / `href` | — | Renders a router `Link` / `<a>` instead of `<button>` |
| `type` | `'button'` | Pass `'submit'` explicitly in forms |
| `loading` | `false` | Disables, shows spinner, sets `aria-busy` |
| `leadingIcon` / `trailingIcon` | — | A lucide component, not an element |

Rules: one `primary` per view. Labels say what happens ("Save changes", "Delete graduate"),
never "Submit" or "Click here", and never end in `→`. Icon-only buttons need `aria-label`.

## `Field` + `Input` / `Select` / `Textarea`
```jsx
<Field label="Passport number" hint="Letters and digits only." error={errors.passport} required>
  <Input name="passport" value={form.passport} onChange={onChange} autoComplete="off" />
</Field>
```
| Field prop | |
|---|---|
| `label` | Always visible. Never rely on the placeholder |
| `hint` | Persistent helper text under the control |
| `error` | Message under the control; sets `aria-invalid`, linked by `aria-describedby` |
| `required` / `optional` | Red asterisk / "(optional)" suffix. Mark whichever is rarer on the form |
| `id` | Optional; otherwise generated |

Controls are 44px tall with 16px text (no iOS zoom). They accept every native prop; `ref`
is forwarded. Outside a `Field` they work as plain styled controls (then pass your own
`id` and label).

## `Seal`
| Prop | Default | |
|---|---|---|
| `size` | `md` | `xs` 24, `sm` 40, `md` 64, `lg` 112, `xl` 160. Ring text only at `lg`/`xl` |
| `stamped` | `false` | One-time stamp animation. **Home hero only** |
| `tilted` | `true` | −12° like a hand stamp |
| `decorative` | `false` | Set when visible "Verified" text is next to it |
| `label` | `'Verified graduate'` | Accessible name when not decorative |

Only on verified records. Never as decoration, a logo, or a bullet.

## `StatusTag`
`status`: `verified` (blue, check), `pending` (tint, clock), `rejected` (red, x), `neutral`.
Children override the default label. Map API values to these at the call site.

## `Panel`
`tone`: `paper` (bordered), `tint`, `primary` (once per page at most).
`padding`: `none`, `sm`, `md`, `lg`. No resting shadow. Don't wrap every block in a panel;
use it for genuinely grouped content.

## `PageHeader`
`title`, `description`, `actions`, `breadcrumb`, `as` (default `h1`). No eyebrow label.

## `Skeleton`
Reserve the final size: `<Skeleton className="h-4 w-40" />`. Put `aria-busy="true"` on the
container being loaded. Never show "—" or "0" while data is loading.

## `Avatar`
`src` (already resolved via `getFileUrl`), `name`, `size` (`sm`, `md`, `lg`, `xl`),
`decorative` (default `true`, because the name is usually printed beside it). Falls back to
initials if there is no photo or it fails to load.

## `EmptyState`
`icon`, `title`, `description`, `action`. Says what happened and what to do next.

## `PortraitFallback`
`name`, `className` (give it the photo's size and radius). Deep blue panel with initials in
display type over a short red rule. Use for large portraits with no photo; small ones use
`Avatar`.

## `FileDrop`
`accept`, `file`, `onSelect(file)`, `prompt`, `icon`. A file picker styled as a drop target;
the native input stays in the DOM (keyboard, screen readers, mobile pickers). Inside a
`Field` it takes the id, description and invalid state. Shows the chosen file's name and size.

## Site components (outside the kit)
- `components/PageHero.jsx`: interior-page header (`title`, `lead`, `breadcrumb`,
  `children` slot). Use on every public page except Home.
- `components/MenuIcon.jsx`: long/short/long menu icon that folds into an X.
- `components/SiteFooter.jsx`, `components/Navbar.jsx`: the public shell.
