# Roadmap

We build the site **section by section**, one item per session (see WORKING RULES in `CLAUDE.md`).
Status: `todo` · `in progress` · `locked` (approved by Regi; don't touch unless he asks).

---

## Phase 1: Audit

### 1.1 Site audit
- **Goal:** know exactly what the site has today, what works, what's weak and what's broken (especially on mobile) before building anything new.
- **Done when:** `AUDIT.md` lists every section with working / weak / broken notes, plus Lighthouse mobile numbers and the top issues, and Regi approves it.
- **Status:** locked

---

## Phase 2: Brand foundation

### 2.1 Style guide: 3 directions
- **Goal:** Regi picks the look by comparing options side by side instead of reacting to finished pages.
- **Done when:** a `/styleguide` page shows 3 distinct directions side by side, each with color palette, type scale (display + body + label), buttons (primary/secondary, hover), and a sample card. It must work on a phone. Regi picks one (or a mix).
- **Status:** locked (Regi approved round 3 on 2026-09-24: the **camera screen**, a one-screen DSLR live view, sample on `/styleguide`)
- **Round 1 → Regi:** picked Broadcast, but no meaningless spinning timers: every number must be real. The whole site should feel like a camera's preview screen ("camera man" theme), with a highlight reel playing as the footage, muted with tap for sound. Drop the drawing motif ("overplayed and too hard").
- **Round 2:** whole-site viewfinder frame (REC, time-of-day timecode from the visitor's clock, 30P, page name, date, live screen size, framing corners, center mark). Home sample shows a stream still as footage (reel comes in 5.3). Fake timecodes removed from the card.
- **Round 2 → Regi:** "No." Wants it to feel like fishtank.live with **no scrolling**. Desktop should feel like you're on a DSLR's screen, and mobile the same. Picked the pure DSLR screen, edge to edge, with live muted YouTube as the footage. Readouts must mean something and be tappable where useful ("how many follows I have instead of ISO").
- **Round 3:** the whole window is the camera's live view and nothing scrolls. REC = Book me. Readouts: creating since 2009 (→ About), 20K monthly listeners (→ Spotify), followers (placeholder, → Socials), the visitor's real time and date. The exposure scale picks which stream is on screen (one tick per YouTube item). PLAY [clip count] opens DSLR-style playback of all work (◀ ▶, swipe). MENU opens About / Collabs / Socials / Specs (colors, type, buttons). The Book me sheet reskins from the tokens alone.

### 2.2 Design tokens
- **Goal:** the chosen direction becomes the single source of truth for color, type, spacing, radius and motion.
- **Done when:** tokens live in one place (CSS variables mapped into Tailwind), `/styleguide` shows the final tokens, no hardcoded colors or fonts remain in components, and the build passes.
- **Status:** locked (Regi approved round 3 on 2026-09-25: lightweight Canon camera screen, real follower total; sample on `/styleguide`). Wiring the tokens into `global.css` and the live pages happens with the Phase 4 rebuild.
- **Kickoff → Regi:** round 3 of 2.1 "feels a little too polished/AI". Wants it old school and rugged, like you're actually on a camera's preview screen and flipping through it, with the SD card / gallery holding past streams and content. Said to pick the most seamless path, so the look fix happens here (the final tokens) instead of reopening 2.1. Started YouTube April 2009, born July 1999 (the 1999 in the pitch).
- **Round 1:** `/styleguide` becomes a real camera LCD. Bitmap type everywhere (VT323 for readouts and body, Silkscreen for the headline), on-screen text with a hard black outline, RGB pixel grid + grain + corner falloff over everything, rubber gray camera buttons, AF box that hunts and locks green once the stream is really playing, the visitor's real battery (where the browser shares it), INFO button flips to a clean view. MENU is a Canon-style menu (colored tabs, amber select bar, help box that shows the collab one-liners). ▶ SD [09] is SD-card playback: file numbers `100-0003`, names like `MVI_0003.MOV` / `SND_0001.WAV`, ◀ ▶ / swipe, SET to put a stream on screen or open it, ⊞ for a 3×3 index of thumbnails. All colors and fonts are tokens in one `:root` block; the Specs tab reads them back. Doto/Geist are gone. Wiring the tokens into `global.css` and the rest of the site happens once Regi approves the look.
- **Round 1 → Regi:** sent the reference: a Canon EOS live view (Av, [6575]99, 29:59, battery, mic OFF, left/right icon columns, thirds + diagonal grid, F3.5 / -3..0..+3 scale / ISO 12800 with orange dial marks) and Canon's menu (colored category tabs, numbered pages, gold cursor, SET OK sub-screens). "This is more like what I want."
- **Round 2:** `/styleguide` follows that reference. Canon-style condensed type (Barlow Semi Condensed) in white with a soft shadow, floating straight on the footage (no bars, no pixel effects), thirds + diagonal grid, 3:2 live view pillarboxed on wide screens. Top: ● REC + BOOK ME chip, [09] files on the card (→ playback), the visitor's time, battery, mic OFF/ON = sound. Left column: role chips (like RAW). Right column: MENU, ▶, DISP (clean view). Bottom: readouts with ISO-style boxed labels, the stream picker as Canon's exposure scale with orange dial marks. `SET Book me` with the gold cursor. MENU is Canon's: colored tabs, numbered pages of 6 rows (Socials has 2 pages), gold cursor, About/Collabs/Buttons open SET OK sub-screens, Date/Time is the visitor's. Playback + index kept, restyled.
- **Round 2 → Regi:** (1) no "enhanced" text: it should feel like a lightweight camera screen with plain, functional white text you can tap; (2) thirds grid only, and sound becomes a larger round **mic mute** button with a mic silhouette; (3) pull the real follower numbers from his platforms and show the total.
- **Round 3 (last):** all text is light (Barlow Semi Condensed 400/500, no bold, no filled chips, no boxed buttons, softer shadow, smaller headline); taps are plain white text that turns gold. Thirds grid only. Round mic-mute button (slashed = muted) under DISP. Followers readout = the sum of YouTube, Twitch, Kick, TikTok, Instagram, X and SoundCloud, pulled at build time by `src/lib/followers.ts` with no API keys (public pages + free endpoints: decapi.me for Twitch, FxTwitter for X); Socials menu shows each platform's count, and monthly listeners are read live from Spotify too. A platform that doesn't answer is left out of the total; if none answer, the readout shows `--` (never a made-up number). Counts refresh on every deploy.

---

## Phase 3: Words

### 3.1 One content file
- **Goal:** every piece of site copy lives in one file so words can change without touching layout.
- **Done when:** all copy (pitch, section titles, buttons, about, collab lines, form labels, meta description) is read from `src/content/site.json` (or similar) and nothing user-facing is hardcoded in components.
- **Status:** todo

### 3.2 Copy draft + approval
- **Goal:** words that sound like Regi: a direct, confident creator voice with no buzzwords.
- **Done when:** a full draft is in the content file, Regi has approved or rewritten every line, and the approved copy is live on the preview.
- **Status:** todo

---

## Phase 4: Sections (one per session)

### 4.1 Hero
- **Goal:** in 3 seconds a visitor knows who Regi is and how to book him.
- **Done when:** name, pitch, primary "Book me" and the chosen visual (the camera preview with footage in it, see 2.1) look right at 360px, 390px, landscape and desktop; nothing overlaps; reduced motion is handled.
- **Status:** todo

### 4.2 Book me form
- **Goal:** booking takes under a minute on a phone and every inquiry reaches Regi.
- **Done when:** fields are final (name, email, inquiry type, budget, date, message), it's usable one-handed on 360×640, validation and success/error states work, and a real test submission arrives at regiwock@gmail.com from the live site.
- **Status:** todo

### 4.3 Proof bar
- **Goal:** instant credibility: 20K monthly listeners, creating since 2009, collab names.
- **Done when:** the proof is visible without scrolling far, reads at a glance on mobile, and the numbers are current and accurate.
- **Status:** todo

### 4.4 Work (SD card + Music)
- **Goal:** show the range (streams, music, posts, drops) fast and cleanly, the camera way.
- **Done when:** ▶ playback (the SD card) holds only stream VODs that play on the site, with real thumbnails and good behavior at 360px; music has its own MENU → Music tab where every row links out to its platform; nothing empty is shown; 44px tap targets. (Was a filter-chip grid; changed when the site became the camera screen.)
- **Status:** in progress
- **Kickoff → Regi:** doesn't like music mixed in with the videos. Flipping through the card should only be VODs he's linked; music goes under a Music tab in the menu (picked option 1). Tracks redirect to their own site (no player on the site). VODs will mostly be YouTube, since Twitch/Kick VODs expire.
- **Round 1:** the card = stream items with a YouTube link (all 5 today, including the two Blame Kick streams, which are YouTube uploads), all `MVI_####.MOV` files; [05] on the live view. MENU gets a magenta **Music** tab: tracks first (Feelings Gone → Spotify ↗), then "Listen on" Spotify (with live monthly listeners), SoundCloud and Apple Music. Profile links ("Regiwock on Spotify" etc.) stop counting as work. Playback shows the VOD thumbnail full width. Posts and drops get a home once there are any.

### 4.5 Collabs
- **Goal:** show the top 3 collabs and exactly what Regi did on each.
- **Done when:** each has a playable clip, a role label and an approved one-line description, and the section looks right on mobile.
- **Status:** todo

### 4.6 About
- **Goal:** 3–4 sentences that make brands and creators want to work with Regi.
- **Done when:** the copy is approved, there's an optional photo/drawing, and it reads well on mobile.
- **Status:** todo

### 4.7 Nav + footer
- **Goal:** Book me is always one tap away, and every social is easy to find.
- **Done when:** a sticky nav with Book me, a footer with all socials + email, 44px targets, and the same on every page.
- **Status:** todo

---

## Phase 5: Content

### 5.1 Curate the best 12
- **Goal:** only Regi's strongest work is on the site.
- **Done when:** 12 pieces are picked by Regi, added with `npm run new`, with correct titles, real dates and 2–3 featured.
- **Status:** todo

### 5.2 Thumbnails
- **Goal:** every card looks intentional.
- **Done when:** every card has a real image (platform thumbnail or a custom one in `public/thumbs/`), with no broken or placeholder tiles.
- **Status:** todo

### 5.3 Reel
- **Goal:** a short, silent-friendly highlight loop that sells the energy.
- **Done when:** a 10–20s reel (≤ 8 MB, H.264) and its poster play as the footage inside the hero's camera preview (muted, tap for sound) and it loads fast on mobile.
- **Status:** todo

---

## Phase 6: Polish + QA

### 6.1 Motion
- **Goal:** motion that feels intentional, never janky.
- **Done when:** transitions are consistent and nothing drops frames on a mid-range phone.
- **Status:** todo

### 6.2 Performance
- **Goal:** fast on phones.
- **Done when:** PageSpeed Insights mobile scores 90+ on every page, measured on the live URL.
- **Status:** todo

### 6.3 Accessibility
- **Goal:** everyone can use it.
- **Done when:** Lighthouse accessibility is 100; the site works by keyboard, has visible focus, legible text sizes and 44px targets, and respects reduced motion.
- **Status:** todo

### 6.4 OG / meta
- **Goal:** links look great in DMs and search.
- **Done when:** the share image matches the final look, titles and descriptions are approved, and previews are checked in iMessage, Instagram DM, X and Discord.
- **Status:** todo

### 6.5 Analytics
- **Goal:** know where visitors come from and whether they book.
- **Done when:** free, privacy-friendly analytics (e.g. Cloudflare Web Analytics) is on, and Book me clicks and form submits are countable.
- **Status:** todo

### 6.6 Form test
- **Goal:** zero lost inquiries.
- **Done when:** test submissions from iPhone Safari, Android Chrome and desktop all arrive, and spam protection is confirmed.
- **Status:** todo

---

## Phase 7: New pages

### 7.1 Collab case studies
- **Goal:** deeper proof for stream-production clients.
- **Done when:** one page per major collab: what was needed, what Regi did (setup, camera, tech), the result, and clips.
- **Status:** todo

### 7.2 Media kit
- **Goal:** everything a brand needs in one link.
- **Done when:** a `/media-kit` page (plus a PDF download) with audience numbers, platforms, past work, rates/packages or "contact for rates", and Book me.
- **Status:** todo

### 7.3 Drops
- **Goal:** a home for clothing drops.
- **Done when:** a `/drops` page with drop cards, dates, images and a buy/notify link, fed from the content system.
- **Status:** todo

---

## IDEAS (parked, not in scope until promoted to a roadmap item)

- Background sound on the home page with one of Regi's own tracks (Feelings Gone), toggle already built.
- ~~Hand-drawn frames of Regi "falling upward"~~: dropped 2026-09-24 (Regi: "overplayed and too hard"). The drawing code (`Scene.astro`, `sketch.ts`, `npm run frames`) stays until 4.1 replaces the hero.
- Move regiwock.com from Beacons to Cloudflare (before Feb 2027), then set `DOMAIN_CONNECTED = true`.
- Look switcher ("vibes"), removed in v2; could return as a hidden easter egg.
- Live indicator ("Regi is live now") when streaming on Twitch/Kick/YouTube.
- Refresh follower counts daily without a code push (a free scheduled trigger that re-runs the Cloudflare build). Today they update on every deploy.
- Pick start times for each stream clip on the camera screen, so the footage skips stream intros.
