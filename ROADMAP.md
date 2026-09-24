# Roadmap

We build the site **section by section**, one item per session (see WORKING RULES in `CLAUDE.md`).
Status: `todo` · `in progress` · `locked` (approved by Regi; don't touch unless he asks).

---

## Phase 1: Audit

### 1.1 Site audit
- **Goal:** know exactly what the site has today, what works, what's weak and what's broken (especially on mobile) before building anything new.
- **Done when:** `AUDIT.md` lists every section with working / weak / broken notes, plus Lighthouse mobile numbers and the top issues, and Regi approves it.
- **Status:** in progress

---

## Phase 2: Brand foundation

### 2.1 Style guide: 3 directions
- **Goal:** Regi picks the look by comparing options side by side instead of reacting to finished pages.
- **Done when:** a `/styleguide` page shows 3 distinct directions side by side, each with color palette, type scale (display + body + label), buttons (primary/secondary, hover), and a sample card. It must work on a phone. Regi picks one (or a mix).
- **Status:** todo

### 2.2 Design tokens
- **Goal:** the chosen direction becomes the single source of truth for color, type, spacing, radius and motion.
- **Done when:** tokens live in one place (CSS variables mapped into Tailwind), `/styleguide` shows the final tokens, no hardcoded colors or fonts remain in components, and the build passes.
- **Status:** todo

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
- **Done when:** name, pitch, primary "Book me" and the chosen visual (e.g. the falling-up drawing with real drawn frames) look right at 360px, 390px, landscape and desktop; nothing overlaps; reduced motion is handled.
- **Status:** todo

### 4.2 Book me form
- **Goal:** booking takes under a minute on a phone and every inquiry reaches Regi.
- **Done when:** fields are final (name, email, inquiry type, budget, date, message), it's usable one-handed on 360×640, validation and success/error states work, and a real test submission arrives at regiwock@gmail.com from the live site.
- **Status:** todo

### 4.3 Proof bar
- **Goal:** instant credibility: 20K monthly listeners, creating since 2009, collab names.
- **Done when:** the proof is visible without scrolling far, reads at a glance on mobile, and the numbers are current and accurate.
- **Status:** todo

### 4.4 Work grid
- **Goal:** show the range (streams, music, posts, drops) fast and cleanly.
- **Done when:** the grid has tagged cards, working filter chips (All / Streams / Music / Posts / Drops), no empty filters shown, real thumbnails, click-to-load embeds, 44px tap targets, and good behavior at 360px.
- **Status:** todo

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
- **Done when:** a 10–20s reel (≤ 8 MB, H.264) and its poster are in the hero (or wherever Phase 4 decides) and it loads fast on mobile.
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
- Hand-drawn / generated anime-style frames of Regi "falling upward" (`npm run frames` pipeline exists).
- Move regiwock.com from Beacons to Cloudflare (before Feb 2027), then set `DOMAIN_CONNECTED = true`.
- Look switcher ("vibes"), removed in v2; could return as a hidden easter egg.
- Live indicator ("Regi is live now") when streaming on Twitch/Kick/YouTube.
