# regiwock-site

Portfolio + booking site for **Regi (@regiwock)**: creator since 2009, independent artist (~20K monthly Spotify listeners), camera/stream-tech for Ye, Digital Nas, AssPizza (real name Austin Babbitt — list him once, as AssPizza), Ac7ionMan, Blame, and a platform engineer. **Goal of every section: get visitors to "Book me"** (brand deals, stream production, collabs).

## WORKING RULES (read first, every session)

We build the site **section by section** from `ROADMAP.md`. Current state of the site: `AUDIT.md`.

- Each session works on **exactly one ROADMAP item**. Never touch `locked` items unless Regi asks.
- Start every session by **restating the goal**, giving Regi **2–3 approaches**, and **asking questions**. No code until he chooses.
- **Max 3 revision rounds** per item, then we lock it. New ideas go to the **IDEAS** section of `ROADMAP.md`, not into the current work.
- Every change goes on **its own branch with a PR** so Regi can check the Cloudflare preview on his phone.
- When Regi approves, mark the item `locked` in `ROADMAP.md` **in the same PR**.
- **Never tell Regi to edit files by hand.**

## Working with Regi

- Regi previews only through **Cloudflare Pages preview links** — there's no local dev server on his side. Push to a branch → Cloudflare builds a preview.
- **Always make changes yourself. Never tell Regi to edit a file by hand.** If he sends a new link, run `npm run new` for him.
- He works on Windows, macOS and cloud sessions → every script must be cross-platform (plain Node, no bash-only syntax, no `rm -rf`/`cp` in npm scripts).
- Budget is $0: no paid services, no API keys beyond Web3Forms.

## Stack

- Astro 7 (static output) + Tailwind CSS v4 (via `@tailwindcss/vite`, config lives in CSS)
- Deploy: Cloudflare **Workers** static assets (created via dashboard "Create an app" → GitHub). Build `npm run build`, deploy `npx wrangler deploy` using `wrangler.jsonc` (serves `dist/`). Non-main branches run `npx wrangler preview`, which needs the (empty) `"previews": {}` block in `wrangler.jsonc` — don't remove it or preview links break. Production branch = `main`, so changes go live only after merging. Node from `.node-version` (22)
- Fonts self-hosted via `@fontsource/*` (latin subset only): Unbounded 800 (display), Inter Tight (body), JetBrains Mono (labels), Caveat (handwritten notes)
- `roughjs` draws the pencil sketches at build time (`src/lib/sketch.ts`)
- `satori` + `sharp` render `/og.png` and `/apple-touch-icon.png` at build time
- No UI framework; small inline `<script>`s only

## Commands

| Command | What it does |
| --- | --- |
| `npm run build` | Production build to `dist/` (must pass before pushing) |
| `npm run dev` / `npm run preview` | Local server (for Claude's own checks) |
| `npm run new -- <type> "<title>" "<url>"` | Add a work item. Types: `stream`, `music`, `post`, `drop` (aliases like `song`, `clip`, `merch` work) |
| `npm run new -- <type> "<url>"` | Same, title pulled from the platform via oEmbed |
| `npm run new` | Interactive prompts |
| `npm run list` | List all work items (★ = featured) |
| `npm run feature -- <name>` | Toggle featured (big card) |
| `npm run remove -- <name>` | Delete an item (and its downloaded thumbnail) |
| `npm run frames -- "<folder>"` | Turn photos/scans of hand-drawn frames into transparent ink frames in `public/fall/` (replaces the code-drawn figure) |

Flags for `new`: `--featured`, `--tags "a,b"`, `--date 2024-05-01`, `--thumbnail "<url>"`.
**Always quote URLs** (zsh and PowerShell break on `?` and `&`). The script also reads `npm_config_*` env vars because PowerShell can swallow `--` and hand the flags to npm instead.

## Content system

- **Work grid** = Astro content collection `work` → one Markdown file per item in `src/content/work/` (schema in `src/content.config.ts`):
  `type` (stream|music|post|drop), `title`, `date`, `url`, `embed`, `thumbnail`, `featured`, `tags`. Optional Markdown body = one-line caption under the card.
- Files are named `YYYY-MM-DD-slug.md`. The seed items' dates are placeholders used only for ordering (dates are not shown on the site). Sort = featured first, then newest.
- **Everything else** (pitch, roles, top-3 collabs, about copy, socials, email, audio, Web3Forms key) lives in **`src/config.ts`**.
- Link parsing is shared between the site and the CLI in `src/lib/platforms.mjs` (`detect(url)` → platform, embed src, thumbnail, vertical). Supported: YouTube (watch/youtu.be/live/shorts), Twitch (VOD/clip/channel — `{parent}` token is filled with the hostname at click time), Kick (live channel embeds; VODs/clips link out), TikTok, Instagram (post/reel), Spotify, SoundCloud, Apple Music.
- Thumbnails: YouTube → `i.ytimg.com` (maxres if it exists, else hq). Spotify/SoundCloud → oEmbed `thumbnail_url` (fetched by the CLI; if missing, `src/lib/work.ts` retries at build time on Cloudflare, which has internet). TikTok thumbnail URLs expire, so the CLI downloads them to `public/thumbs/`. Instagram/Twitch/Kick/Apple Music → typographic title tile. Any thumbnail that fails to load falls back to the tile.
- **Cloud sandbox note:** Claude Code on the web can't reach YouTube/Spotify/etc., so `npm run new` there can't verify titles or fetch oEmbed art — always pass a title. YouTube thumbnails still work (derived from the ID).

## Pages (v2 — "sketchbook", Regi asked for much less going on)

- **`/` (`src/pages/index.astro`)** — one screen, no scrolling: wordmark + Book me (top), the `Scene` in the middle, pitch + roles + a few links (bottom). That's it.
- **`Scene.astro`** — Regi drawn in pencil **"falling upward"**: fixed in the middle with a slow stepped bob, pencil clouds scrolling *down* past him at 12fps (two parallax layers; near clouds stay at the edges so they never bury him), rainbow air streaks trailing below, handwritten caption "fig. 1 — regi, falling up".
  - All drawings come from `src/lib/sketch.ts` (rough.js). Each drawing is rendered as 2–3 frames with different seeds; CSS (`.frames-2/.frames-3`) flips between them for the stop-motion boil (inspired by sicko.jp). The figure's pose is adapted from a falling-mannequin reference, flipped to rise; likeness details from his photo: curly dark hair, fitted dark tee with small chest logo, chain, shorts. It's a stylized sketch — if Regi ever gets hand-drawn frames, swap them in.
  - Clouds + his shirt/shorts/head have a paper-colored fill so layers overlap like cut-outs.
  - **Regi doesn't like the code-drawn figure** ("looks like a 3rd grader drew it"). Target: anime-style notebook drawing like artlist.io clip 545000 (black-and-white falling man), notebook lines showing. Code can't reach that quality — the plan is real drawn frames: `npm run frames -- "<folder>"` strips paper + blue/pink notebook lines (red channel, relative to the paper median) and writes `public/fall/fall-NN.webp`; `Scene.astro` then plays those at 8fps (`.drawn-frame`) instead of the SVG figure. Keep frames the same canvas size/framing so they don't jump.
  - The page itself is **ruled notebook paper** (`.notebook::after` overlay: blue lines + red margin, `mix-blend-mode: multiply`, above the drawings so lines show through them). Linework is clean ink (low rough.js roughness, single stroke), graphite shading; rainbow only on Book me.
  - Don't use CSS `mask-image` on the sky — it made Chromium drop the figure layer while animating. Fades are `::before/::after` gradients.
- **Book me** — `BookDialog.astro`, a `<dialog>` sheet included on every page by `Base.astro`. Any link to `#book` / `/#book` opens it; landing on `/#book` opens it too. Web3Forms (`WEB3FORMS_ACCESS_KEY`), mailto fallback if the key is ever a `YOUR_…` placeholder. Honeypot `botcheck`.
- **`/work`** — the content-collection grid (`Work.astro`, filter chips), `Collabs.astro` (top 3 from config), `About.astro`, socials. Linked as "Work ↗" from the main page.
- **Sound** — optional. If `public/audio/ambient.mp3` exists at build time, a "♪ Sound off/on" toggle appears (browsers block autoplay with sound; it fades in on tap). Only use audio Regi has rights to (his own tracks) — no commercial tracks he doesn't own (he asked for Aphex Twin; hosting that file would be infringement).
- **Hero reel** from v1 is gone.

## Look & motion

- One look: **notebook sketch** — ruled paper `#fbfaf6`, graphite ink `#1d1d1b`, animated rainbow gradient (`--accent-fill`) only for Book me buttons and `accent-text`. Tokens in `src/styles/global.css` (`:root`), mapped into Tailwind via `@theme inline` (`bg-bg`, `text-ink`, `text-muted`, `border-line`, `font-display`, `font-hand`…). Utilities: `display`, `label`, `hand`, `accent-text`.
- All motion is stepped (`steps()`), stop-motion style, and respects `prefers-reduced-motion` (frames freeze on frame 1, nothing scrolls).
- Inspirations Regi gave: yeezy.com, supreme.com, apple.com, sicko.jp, free-game.virgilabloh.com — simple, minimal, futuristic. **Keep it stripped down.**

## SEO / sharing

`Base.astro` sets title, description, canonical, Open Graph + Twitter tags, JSON-LD Person. `og:image` is `/og.png` (1200×630, rendered in `src/pages/og.png.ts` — includes frame 1 of the sketch).
`SITE_URL` = `https://regiwock.com`. **regiwock.com is still on Beacons.ai (expires Feb 2027)**, so `DOMAIN_CONNECTED = false` makes share images, canonical and og:url use `DEPLOY_URL` (live site: https://regiwock-site.coklara123.workers.dev). After pointing the domain at Cloudflare Pages, set `DOMAIN_CONNECTED = true`.

## Open items

- Figure art: waiting on hand-drawn / generated frames from Regi (see Scene notes).
- Background music: waiting on Regi — an MP3 he owns (e.g. his own track) for `public/audio/ambient.mp3`.
- No posts or drops yet (those filters show a "Cooking." empty state). Top track "Feelings Gone" is featured; other music cards are profile links.
- Social URLs assume handle `regiwock` everywhere except TikTok (`regiwock_`).

## Before pushing

1. `npm run build` passes.
2. Visual check if layout changed: `npm run preview`, then screenshot `/` and `/work` with Playwright (Chromium is preinstalled in cloud sessions: `require('<global npm root>/playwright')`) at 390px and 1440px. On `/`, take several screenshots a few seconds apart — make sure the figure stays visible while everything animates.
