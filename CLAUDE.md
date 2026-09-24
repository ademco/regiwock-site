# regiwock-site

Portfolio + booking site for **Regi (@regiwock)**: creator since 2009, independent artist (~20K monthly Spotify listeners), camera/stream-tech for Ye, Digital Nas, AssPizza (real name Austin Babbitt — list him once, as AssPizza), Ac7ionMan, Blame, and a platform engineer. **Goal of every section: get visitors to "Book me"** (brand deals, stream production, collabs).

## Working with Regi

- Regi previews only through **Cloudflare Pages preview links** — there's no local dev server on his side. Push to a branch → Cloudflare builds a preview.
- **Always make changes yourself. Never tell Regi to edit a file by hand.** If he sends a new link, run `npm run new` for him.
- He works on Windows, macOS and cloud sessions → every script must be cross-platform (plain Node, no bash-only syntax, no `rm -rf`/`cp` in npm scripts).
- Budget is $0: no paid services, no API keys beyond Web3Forms.

## Stack

- Astro 7 (static output) + Tailwind CSS v4 (via `@tailwindcss/vite`, config lives in CSS)
- Deploy: Cloudflare Pages — build `npm run build`, output `dist`, Node from `.node-version` (22)
- Fonts self-hosted via `@fontsource/*` (latin subset only)
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

Flags for `new`: `--featured`, `--tags "a,b"`, `--date 2024-05-01`, `--thumbnail "<url>"`.
**Always quote URLs** (zsh and PowerShell break on `?` and `&`). The script also reads `npm_config_*` env vars because PowerShell can swallow `--` and hand the flags to npm instead.

## Content system

- **Work grid** = Astro content collection `work` → one Markdown file per item in `src/content/work/` (schema in `src/content.config.ts`):
  `type` (stream|music|post|drop), `title`, `date`, `url`, `embed`, `thumbnail`, `featured`, `tags`. Optional Markdown body = one-line caption under the card.
- Files are named `YYYY-MM-DD-slug.md`. The seed items' dates are placeholders used only for ordering (dates are not shown on the site). Sort = featured first, then newest.
- **Everything else** (pitch, stats, top-3 collabs, services, about copy, socials, email, vibes, Web3Forms key) lives in **`src/config.ts`**.
- Link parsing is shared between the site and the CLI in `src/lib/platforms.mjs` (`detect(url)` → platform, embed src, thumbnail, vertical). Supported: YouTube (watch/youtu.be/live/shorts), Twitch (VOD/clip/channel — `{parent}` token is filled with the hostname at click time), Kick (live channel embeds; VODs/clips link out), TikTok, Instagram (post/reel), Spotify, SoundCloud, Apple Music.
- Thumbnails: YouTube → `i.ytimg.com` (maxres if it exists, else hq). Spotify/SoundCloud → oEmbed `thumbnail_url` (fetched by the CLI; if missing, `src/lib/work.ts` retries at build time on Cloudflare, which has internet). TikTok thumbnail URLs expire, so the CLI downloads them to `public/thumbs/`. Instagram/Twitch/Kick/Apple Music → typographic title tile. Any thumbnail that fails to load falls back to the tile.
- **Cloud sandbox note:** Claude Code on the web can't reach YouTube/Spotify/etc., so `npm run new` there can't verify titles or fetch oEmbed art — always pass a title. YouTube thumbnails still work (derived from the ID).

## Page structure (`src/pages/index.astro`)

Nav (sticky, vibe switch + Book me) → `Hero` → `ProofBar` → `Work` (filter chips All/Streams/Music/Posts/Drops) → `Collabs` (top 3 from config) → `Services` ("Book me for", each links to the form with the inquiry type preselected via `data-inquiry`) → `About` → `BookForm` → `Footer`.
Section labels are numbered `[03]`…`[07]`.

- **Hero reel:** if **both** `public/reel.mp4` and `public/reel-poster.jpg` exist at build time, the hero becomes a muted looping background video automatically. Otherwise the type-driven placeholder (accent blobs + grid) shows. Keep the reel small (≤ ~8 MB, 1080p H.264, 10–20 s).
- **Embeds** are click-to-load facades (`Media.astro` + handler in `Base.astro`) — no third-party iframes until tapped.
- **Booking form:** Web3Forms (`WEB3FORMS_ACCESS_KEY` in `src/config.ts`). The key is set. If it's ever reset to the `YOUR_…` placeholder, submitting opens a prefilled email to `regiwock@gmail.com` instead. Honeypot field: `botcheck`.

## Look & motion

- **Vibes** = same layout and motifs, different skin. Visitor cycles them with the nav button (saved in `localStorage`, applied pre-paint in `Base.astro`, circular View Transition wipe). Default: `cream`.
  | vibe | colors | display font | body |
  | --- | --- | --- | --- |
  | cream | cream / black / orange `#ff4f00` | Instrument Serif italic | Inter Tight |
  | concrete | grey / black / red `#e10600` | Anton | Inter Tight |
  | night | black / white / lime `#c6ff00` | JetBrains Mono 800 | Space Grotesk |
  | prism | off-white / black / animated rainbow | Unbounded 800 | Inter Tight |
  All tokens are CSS variables in `src/styles/global.css` (`[data-vibe="…"]`), mapped into Tailwind with `@theme inline` (`bg-bg`, `text-ink`, `text-muted`, `border-line`, `text-accent`, `font-display`…). Never hardcode colors in components; use tokens. The Book me section uses `.inverse` (swapped tokens; don't name it `.invert` — that's a Tailwind filter utility).
- `--wm-size` per vibe sizes the giant wordmark to ~91vw: it's `91 ÷ (wordmark width per em)`. Re-measure if the wordmark or a display font changes.
- Motifs shared across vibes: camera **viewfinder** corners (`.vf`), REC dot + running timecode, mono bracketed labels (`label` utility), stop-motion **boil** on the wordmark (SVG `#boil` filter in `Base.astro`, inspired by sicko.jp), stepped film grain, collab marquee, stepped hover jitter on arrows.
- Motion respects `prefers-reduced-motion`. Scroll reveals (`data-reveal`) only hide content when JS is on (`.js` class).
- Inspirations Regi gave: yeezy.com, supreme.com, apple.com, sicko.jp, free-game.virgilabloh.com — simple, minimal, futuristic, powerful transitions, helpful info.

## SEO / sharing

`Base.astro` sets title, description, canonical, Open Graph + Twitter tags, JSON-LD Person. `og:image` is `/og.png` (1200×630, rendered in `src/pages/og.png.ts`).
`SITE_URL` = `https://regiwock.com`. **regiwock.com is still on Beacons.ai (expires Feb 2027)**, so `DOMAIN_CONNECTED = false` makes share images use Cloudflare's `CF_PAGES_URL`. After pointing the domain at Cloudflare Pages, set `DOMAIN_CONNECTED = true`.

## Open items

- No reel exists (optional; the type-driven hero is the design unless Regi makes one).
- Top track is in the grid with a placeholder title ("Most-played track") — rename when Regi gives the song name.
- No posts or drops yet (those filters show a "Cooking." empty state). Music cards are profile links; swap in favourite tracks when Regi sends them.
- Social URLs assume handle `regiwock` everywhere except TikTok (`regiwock_`).

## Before pushing

1. `npm run build` passes.
2. Visual check if layout changed: `npm run preview`, then screenshot with Playwright (Chromium is preinstalled in cloud sessions: `require('<global npm root>/playwright')`) at 390px and 1440px in all four vibes. Check for horizontal overflow.
