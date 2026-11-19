# Motion video plan — VCLGC register launch film

A self-contained brief. Whoever builds this (another model, or a person in After Effects)
needs only this file, `design-system.md`, and the screenshots in `screenshots/`.

## Purpose and audience

- **Job:** show Liberian graduates of Cyprus universities that the official register exists,
  that every record is checked, and that getting verified is four clear steps.
- **Where it plays:** site launch post (Facebook, WhatsApp status, LinkedIn), the About page,
  and community events. Most views are on phones, muted. Every message must read without
  sound.
- **Feel:** official, calm, proud. A government record office with a heartbeat, not a tech
  startup ad. The site's design rules apply (no all-caps labels, no gradient washes, no
  confetti, no bouncing UI).

## Deliverables

| File | Size | Length | Use |
|---|---|---|---|
| `vclgc-film-16x9.mp4` | 1920×1080, 30 fps, H.264 | 60–70 s | Main film, About page, events |
| `vclgc-film-9x16.mp4` | 1080×1920, 30 fps | 40–45 s | WhatsApp status, Reels, TikTok |
| `vclgc-teaser-1x1.mp4` | 1080×1080, 30 fps | 15 s | Feed post |
| `poster.png` | each ratio | still | Thumbnail: seal stamped on the hero |

Burned-in captions on all cuts. Keep the file under 20 MB for WhatsApp.

## Visual language (from design-system.md, do not invent)

- Colours: Canton Blue `#002868` (primary), deep `#001F52` (backgrounds), Seal Red
  `#BF0A30` (accent: the seal, step labels, one line), Paper `#FFFFFF`, Guilloche `#E9EEF6`,
  Ink `#0E1A33`.
- Type: **Spectral** 600/700 for headlines, **Public Sans** 400–600 for captions. Sentence
  case. Google Fonts.
- Signature element: the **red verification seal** (ring text "VERIFIED GRADUATE ★ VCLGC
  REGISTER ★", lone star centre). Source: `src/components/ui/Seal.jsx` (SVG, reusable).
- Secondary motifs: the 3px red line (footer/hero underline), the four-step stepper,
  university medallion rings drawing.
- Motion: ease-out-quart `cubic-bezier(0.25, 1, 0.5, 1)`. Things settle, they never bounce.
  The seal "stamps": scale 1.35 → 1, rotate −24° → −12°, 420 ms, with a soft 2-frame
  ink-press (opacity 0.9 → 1). One stamp per scene at most.

## Storyboard (16:9, ~66 s)

| # | Time | Picture | On-screen text | Motion |
|---|---|---|---|---|
| 1 | 0–4 s | Deep blue field. Empty. | — | Red line draws left→right across the lower third (600 ms). The seal drops and stamps in centre. |
| 2 | 4–10 s | Seal shrinks to the top-left logo position. | **Liberian graduates of Cyprus universities, verified one by one.** | Headline reveals line by line (mask wipe up, 120 ms stagger). |
| 3 | 10–18 s | Desktop hero screenshot (`sprint-2/v3-hero-1440.png`) in a thin browser frame, slight 3D tilt settling flat. | "The official VCLGC register" | Frame slides up 40 px and settles. Verification card's four ticks pop in sequence, then the seal stamps the card (matches the live site). |
| 4 | 18–27 s | Directory (`sprint-3/directory-1440.png`). | "Search any graduate by name" | Typed text "Ruth Kollie" appears in the search bar letter by letter; rows below rise in a 40 ms stagger. A cursor clicks the first row. |
| 5 | 27–35 s | Profile certificate (`sprint-3/profile-1440.png`). | "Every record is checked against real degree documents" | Push-in 4 % on the name; the seal stamps top right. |
| 6 | 35–47 s | Stepper on Guilloche background, then the wizard (`sprint-4/register-1440.png`, `register-review-1440.jpg`). | "Get verified in four steps" then each step title: Create an account / Submit your degree / Administrator review / Published on the register | The track draws node by node (as on the site); each node fills blue; node 4 becomes the red seal. Wizard screenshots cross-fade behind. |
| 7 | 47–54 s | Universities medallions (`sprint-2/v3-universities-1440.png`). | "Graduates of NEU, EMU, CIU, RDU and more" | Rings draw around each logo in turn (stroke-dashoffset), left to right. |
| 8 | 54–60 s | Three phones (dashboard, login, directory at 375 px: `sprint-4/*-375.jpg`, `sprint-3/directory-375.jpg`). | "Works on any phone" | Phones slide in from the bottom with 80 ms stagger, centre phone 6 % larger. |
| 9 | 60–66 s | Deep blue, seal centre, red line under. | **Get verified** · lcgvap.netlify.app | Seal stamps a final time; URL fades in; hold 2 s on the end card. |

**9:16 cut (40–45 s):** scenes 1, 2, 3, 4, 6, 9. Screenshots become the 375 px versions
in a phone frame filling ~80 % of the height; text sits above the phone.
**1:1 teaser (15 s):** scenes 1 → 3 (stamp moment) → 9.

## Copy rules

- Plain, factual, sentence case. Short lines (≤ 7 words on 9:16).
- Do not claim numbers the register cannot back (no "thousands of graduates").
- Do not show real graduates' faces or names except with written consent. Use the
  sample graduate "Ruth Kollie" from the dev preview, or blur real rows.
- Use real photos only from `public/home/` or the CMS slides with VCLGC's permission.

## Sound design

The film has full sound: a music bed, a sound effect on every key motion, and an optional
voiceover. It must still work fully muted (captions carry every message).

### Music bed

- Warm, proud, steady: piano + soft strings, with a kora or light hand-drum layer for a
  West African touch. 80–90 BPM so cuts land on the beat (at 30 fps, 85 BPM = one beat
  every ~21 frames).
- Shape: quiet single-instrument intro (scenes 1–2), builds with percussion from scene 3,
  fullest at scenes 6–8, resolves on one held chord under the end card, 1 s fade-out.
- Source: royalty-free with a clear licence: Pixabay Music, YouTube Audio Library,
  Uppbeat (free tier needs credit), or Artlist/Epidemic if the user has a subscription.
  Search terms: "inspiring corporate piano", "african acoustic uplifting", "kora cinematic".
  Record title, author, URL and licence in `video/LICENSES.md`.
- Cut the 9:16 and 1:1 versions from the same track (edit on bar lines, not mid-phrase).

### Sound effects cue sheet (16:9; the other cuts reuse the same cues)

| Scene | Moment | Sound | Level |
|---|---|---|---|
| 1 | Red line draws | Soft rising swell / paper slide, 600 ms | −20 dB |
| 1 | Seal stamps | **Signature stamp**: deep rubber-stamp thud + short paper crunch, tiny low boom tail | −10 dB |
| 2 | Headline lines reveal | Very light page-flick per line | −26 dB |
| 3 | Browser frame settles | Soft whoosh (once only) | −22 dB |
| 3 | Four ticks pop | Four soft clicks, rising pitch (like a checklist) | −20 dB |
| 3 | Seal stamps the card | Signature stamp | −12 dB |
| 4 | "Ruth Kollie" types | Quiet keyboard taps, one per letter | −24 dB |
| 4 | Rows rise | Faint shimmer | −28 dB |
| 4 | Cursor clicks row | Mouse click | −20 dB |
| 5 | Push-in | Low warm swell | −24 dB |
| 5 | Seal stamps | Signature stamp | −12 dB |
| 6 | Each stepper node fills | Soft marimba/bell note, ascending 4-note phrase in the music's key | −18 dB |
| 6 | Node 4 becomes the seal | Signature stamp + bell chord | −10 dB |
| 7 | Each ring draws | Light pen-on-paper stroke | −24 dB |
| 8 | Phones slide in | Three soft taps/whooshes, 80 ms apart | −22 dB |
| 9 | Final stamp | Signature stamp, slightly bigger tail (reverb) | −8 dB |
| 9 | URL fades in | Music's final chord, nothing else | — |

Rules: one signature stamp sound, reused everywhere, so it becomes the brand's sound. No
cartoon pops, no laser whooshes, nothing on cuts that have no motion. Effects sit under the
music except the stamps. Duck the music −4 dB for 300 ms around each stamp.

**Where the effects come from** (pick one, record it in `LICENSES.md`):
- **Generated in code (preferred, no licence issues):** synthesise the stamp (low sine thump
  60→40 Hz, 120 ms + filtered noise burst), clicks (short filtered noise), bells (sine with
  harmonics and decay) with a small Node/`ffmpeg` script into `video/public/sfx/*.wav`.
- **Free libraries:** Pixabay Sound Effects, freesound.org (CC0 only), Mixkit.

### Voiceover (optional, recommended for the 16:9 film)

Calm, clear Liberian English voice, unhurried. Recorded by a community member (best) or a
licensed text-to-speech voice. Script (~110 words, fits 66 s):

> "For every Liberian who studied in Cyprus, there is now one official place to be
> recognised. The VCLGC register. Anyone can search it by name. And every record on it is
> checked against real degree documents, by people, one by one. Getting verified takes four
> steps: create your account, submit your degree, an administrator reviews it, and your
> record is published. It works on any phone. Your degree, verified. Your community,
> together. Get verified at lcgvap.netlify.app."

If voiceover is used: music ducks −8 dB under speech, captions match the spoken words.

### Mix and delivery

- Loudness −14 LUFS integrated (social platforms), true peak −1 dBTP. AAC 192 kbps, 48 kHz.
- Check on phone speakers and earbuds: stamps must be felt, not harsh.

## Recommended build route

**Remotion (React).** The site is React + Tailwind, so the video can reuse the real `Seal`
SVG, the colours and fonts exactly, and every animation is code (precise, re-renderable,
easy to change copy or add a 9:16 cut).

1. Create a separate folder `video/` at the repo root (not inside the app bundle):
   `npx create-video@latest` → blank template, TypeScript or JS.
2. Copy `Seal.jsx` (or its SVG paths) and the colour/font tokens into `video/src/brand/`.
3. Copy needed screenshots into `video/public/`.
4. One composition per ratio (`Film16x9`, `Film9x16`, `Teaser1x1`), one component per scene
   using `<Sequence>`; shared helpers: `Stamp`, `DrawLine`, `TypeOn`, `BrowserFrame`,
   `PhoneFrame`, `Caption`.
5. Render: `npx remotion render Film16x9 out/vclgc-film-16x9.mp4` (and the other two).
6. Review each render frame-by-frame at the stamp moments; check captions on a phone.

**Alternative (no code):** record the live site with OBS at 1440 and 375 (the site's own
animations: hero stamp, ticks, stepper, rings), then cut in CapCut / Premiere and add the
scenes 1, 2 and 9 as title cards in After Effects or Canva. Faster, less precise.

## Acceptance checklist

- [ ] Every frame uses only the palette and the two typefaces above.
- [ ] The seal stamps at most once per scene; motion settles, nothing bounces.
- [ ] Captions readable at 375 px width (min 42 px on 1080 px wide video).
- [ ] No real person shown without consent; no unprovable claims.
- [ ] 16:9, 9:16 and 1:1 rendered; each under 20 MB for the short cuts.
- [ ] Music and every sound effect licensed or generated, recorded in `video/LICENSES.md`.
- [ ] Every cue on the sound cue sheet lands on its frame; stamps duck the music.
- [ ] Mix at −14 LUFS, checked on phone speakers; film still reads fully muted.
