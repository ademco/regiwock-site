# Site audit — Phase 1

Audited `main` @ `666173b` (the notebook-sketch version, PR #2) on 2026-09-24.
Method: local production build, Playwright screenshots at 360×640, 390×844 and 844×390 (landscape), 1440×900, and Lighthouse 12 mobile runs.
Lighthouse ran on a local server, so its numbers are only a guide. Re-measure on the live URL in Phase 6.

## Top issues (fix first)

| # | Issue | Severity |
| --- | --- | --- |
| 1 | **Branch previews may not build.** The notebook version is live (Regi checked it on his phone on 2026-09-24), so production deploys work. But the "Workers Builds" check on every PR fails in under a second with no log, which probably means branch preview links aren't being built. The code builds and passes `wrangler deploy --dry-run` from a clean `npm ci`. If the next PR has no preview link, read the build log in the Cloudflare dashboard. | 🟠 Unverified |
| 2 | **Regi dislikes the hero figure** ("looks like a 3rd grader drew it"). It's a code-drawn mannequin. The target is an anime-style notebook drawing (like artlist.io clip 545000). This needs real drawn frames; `npm run frames` is ready for them. | 🔴 Weak (core visual) |
| 3 | **The booking form has never been tested end to end** on the live site (Web3Forms key is set). | 🟠 Unverified |
| 4 | **Mobile readability:** Lighthouse says only 32% of text on the home page is at a legible size. The 11px mono labels are too small. | 🟠 Weak |
| 5 | **Mobile tap targets on `/work`:** 20 links/buttons are under 32px tall (the ↗ card links and footer socials). | 🟠 Weak |

## Section by section

### Home `/`: one screen, no scrolling

| Section | Working | Weak | Broken |
| --- | --- | --- | --- |
| **Top bar** (wordmark + Book me) | Always visible; Book me opens the sheet | The wordmark isn't a link; there's no nav to `/work` up here | — |
| **Scene / hero** (figure falling upward, clouds, notebook paper) | Stop-motion boil, clouds loop cleanly, notebook lines show through, reduced motion is respected, figure stays visible while animating (earlier compositing bug fixed) | **Figure art quality (see #2).** The page is 366 KB of HTML (121 KB gzipped) because every sketch frame is inline SVG. "fig. 1" caption: the arrow points away from the figure on landscape/desktop | — |
| **Pitch + links** (bottom) | Pitch "The glue since 1999." reads well | On 360×640 the pitch sits on top of the figure's feet (72px overlap). Links are 11px text with small tap areas. There's no proof on the page at all (20K listeners, Ye/Digital Nas collabs) | Landscape phones: the page is taller than the screen, so the pitch and links are pushed below the fold on what should be a one-screen page |
| **Sound toggle** | Code ready: only appears when `public/audio/ambient.mp3` exists | No audio file yet (must be a track Regi owns) | — |
| **Book me sheet** | Native `<dialog>`, opens from any `#book` link, `/#book` deep link works, mailto fallback, honeypot | On a 360×640 phone the form is 976px tall and scrolls inside the sheet; the Send button is below the fold. No budget/date guidance | **Never tested live (#3)** |

### `/work`

| Section | Working | Weak | Broken |
| --- | --- | --- | --- |
| **Header** | Sticky, Book me always reachable | No "back"/nav besides the wordmark | — |
| **Work grid + filters** | 9 items, filter chips work, click-to-load embeds, featured cards big | Cards without thumbnails show the title twice (the tile plus the caption under it). Posts 0 / Drops 0 filters lead to empty states. Filter row scrolls sideways on mobile with no hint. Spotify/SoundCloud art only appears if Cloudflare's build can fetch it. Play buttons' accessible name doesn't match the visible "Play" text (Lighthouse `label-content-name-mismatch`) | — |
| **Collabs** (Ye × Digital Nas, AssPizza, Ac7ionMan) | Clips + role lines | Copy is a first draft, not approved | — |
| **About** | 4 short paragraphs | First draft copy; not approved | — |
| **Footer** | All socials + email + Book me | Small tap targets (#5) | — |
| **Background** | — | No notebook paper here, so it doesn't feel like the same site as `/` | — |

### Everything else

| Area | Working | Weak | Broken |
| --- | --- | --- | --- |
| **404** | On-brand "Lost in the clouds." | — | — |
| **SEO / share** | Title, description, canonical, OG/Twitter tags, JSON-LD; share image shows the sketch. Lighthouse SEO 100 | Share image uses the disliked figure. `DOMAIN_CONNECTED=false` until regiwock.com leaves Beacons (expires Feb 2027) | — |
| **Performance** (local Lighthouse, mobile) | `/` 96, `/work` 99. TBT 0 ms, CLS < 0.08 | Render-blocking CSS (~800 ms est.); heavy inline SVG on `/` | — |
| **Accessibility** | `/` 100, `/work` 96; reduced motion respected; dialog is native | Small text, small targets, label/name mismatch on Play buttons | — |
| **Content** | CLI (`new/list/feature/remove/frames`) works | Only 9 items, 3 of them profile links; no posts, drops or reel; placeholder dates | — |
| **Copy** | — | Spread across `config.ts` and components; not in one file; not approved | — |
| **Analytics** | — | None | — |
| **Roadmap vs. current code** | — | Phase 4 lists Hero, Proof bar, Nav + footer; the v2 redesign removed the proof bar, nav and the old hero. Those sections get rebuilt from scratch in their Phase 4 sessions | — |
