// Follower counts from Regi's platforms, fetched at build time. Cloudflare's build machines have
// internet (the cloud sandbox doesn't, so there every count is null and the readout shows "--").
// No API keys: public profile pages and free no-key endpoints. Each platform has a list of sources
// tried in order; the first that yields a number wins. Instagram, TikTok and Kick block data-center
// requests, so they fall back to Jina Reader (r.jina.ai, free, no key), which loads the page in a
// real browser. A platform where every source fails is left out of the total. Counts refresh on
// every deploy; /followers.json shows which source answered for each platform.
import { SOCIALS, STATS } from '../config';

export type Counts = Record<string, number | null>;

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36';
const HEADERS = { 'user-agent': UA, 'accept-language': 'en-US,en;q=0.9', cookie: 'CONSENT=YES+1' };

async function get(url: string, headers: Record<string, string> = {}, ms = 6000): Promise<string> {
  const r = await fetch(url, { headers: { ...HEADERS, ...headers }, signal: AbortSignal.timeout(ms) });
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  return r.text();
}

/** The page as a real browser sees it (rendered HTML), via Jina Reader. */
const reader = (url: string) => get(`https://r.jina.ai/${url}`, { 'x-return-format': 'html', 'x-timeout': '15' }, 20000);

/** "1.23K" → 1230, "12,345" → 12345, "2.1M" → 2100000. */
export function parseCount(s: string | undefined | null): number | null {
  const m = String(s ?? '').replace(/,/g, '').match(/([\d.]+)\s*([KMB])?/i);
  if (!m) return null;
  const n = Number(m[1]) * ({ K: 1e3, M: 1e6, B: 1e9 }[(m[2] ?? '').toUpperCase() as 'K'] ?? 1);
  return Number.isFinite(n) ? Math.round(n) : null;
}

/** 12345 → "12K", 1230 → "1.2K", 950 → "950". */
export function formatCount(n: number): string {
  if (n >= 1e6) return `${+(n / 1e6).toFixed(1)}M`;
  if (n >= 1e4) return `${Math.round(n / 1e3)}K`;
  if (n >= 1e3) return `${+(n / 1e3).toFixed(1)}K`;
  return String(n);
}

const handleOf = (name: string) => {
  const url = SOCIALS.find((s) => s.name === name)?.url ?? '';
  return url ? new URL(url).pathname.split('/').filter(Boolean).pop()!.replace(/^@/, '') : '';
};

/** First pattern that matches, as a count. */
const pick = (text: string, ...patterns: RegExp[]) => {
  for (const re of patterns) {
    const n = parseCount(text.match(re)?.[1]);
    if (n !== null) return n;
  }
  return null;
};

// Patterns per platform, shared by the direct request and the Jina Reader fallback.
const IG = [/"edge_followed_by":\{"count":(\d+)/, /([\d.,]+[KMB]?) Followers/i, /([\d.,]+[KMB]?)\s*<\/span>\s*(?:<[^>]+>\s*)*followers/i];
const TT = [/"followerCount":(\d+)/, /data-e2e="followers-count"[^>]*>([\d.,]+[KMB]?)</, /([\d.,]+[KMB]?)\s*(?:<[^>]+>\s*)*Followers/i];
const KICK = [/"followers_?[cC]ount":\s*(\d+)/, /([\d.,]+[KMB]?)\s*(?:<[^>]+>\s*)*followers/i];

// Sources per platform, tried in order: [name, reader].
const sources: Record<string, [string, () => Promise<number | null>][]> = {
  // Channel page shows e.g. "1.2K subscribers".
  YouTube: [['page', async () => pick(await get(`https://www.youtube.com/@${handleOf('YouTube')}`), /([\d.,]+[KMB]?) subscribers/)]],
  // decapi.me: free Twitch helper, answers with a plain number.
  Twitch: [
    ['decapi', async () => {
      const t = (await get(`https://decapi.me/twitch/followcount/${handleOf('Twitch')}`)).trim();
      return /^\d+$/.test(t) ? Number(t) : null;
    }],
  ],
  Kick: [
    ['api', async () => pick(await get(`https://kick.com/api/v2/channels/${handleOf('Kick')}`, { accept: 'application/json' }), ...KICK)],
    ['reader api', async () => pick(await reader(`https://kick.com/api/v2/channels/${handleOf('Kick')}`), ...KICK)],
    ['reader page', async () => pick(await reader(`https://kick.com/${handleOf('Kick')}`), ...KICK)],
  ],
  TikTok: [
    ['page', async () => pick(await get(`https://www.tiktok.com/@${handleOf('TikTok')}`), ...TT)],
    ['reader page', async () => pick(await reader(`https://www.tiktok.com/@${handleOf('TikTok')}`), ...TT)],
  ],
  Instagram: [
    ['api', async () => pick(await get(`https://www.instagram.com/api/v1/users/web_profile_info/?username=${handleOf('Instagram')}`, { 'x-ig-app-id': '936619743392459' }), ...IG)],
    ['page', async () => pick(await get(`https://www.instagram.com/${handleOf('Instagram')}/`), ...IG)],
    ['reader page', async () => pick(await reader(`https://www.instagram.com/${handleOf('Instagram')}/`), ...IG)],
  ],
  // FxTwitter's free public API.
  X: [['fxtwitter', async () => pick(await get(`https://api.fxtwitter.com/${handleOf('X')}`), /"followers":(\d+)/)]],
  // Profile page hydration data has "followers_count":123.
  SoundCloud: [['page', async () => pick(await get(`https://soundcloud.com/${handleOf('SoundCloud')}`), /"followers_count":(\d+)/)]],
};

export type FollowerReport = {
  counts: Counts;
  total: number | null;
  listeners: string;
  /** Per platform: which source answered, or why each one failed. */
  log: Record<string, string>;
  checkedAt: string;
};

async function resolve(list: [string, () => Promise<number | null>][]): Promise<[number | null, string]> {
  const failed: string[] = [];
  for (const [name, read] of list) {
    try {
      const n = await read();
      if (typeof n === 'number' && n >= 0) return [n, `ok via ${name}`];
      failed.push(`${name}: no number on the page`);
    } catch (e) {
      failed.push(`${name}: ${e instanceof Error ? e.message : e}`);
    }
  }
  return [null, failed.join('; ')];
}

let cached: Promise<FollowerReport> | null = null;

/** Per-platform counts, their total (null when nothing answered) and live Spotify monthly listeners. */
export function getFollowers() {
  cached ??= (async () => {
    const results = await Promise.all(Object.entries(sources).map(async ([name, list]) => [name, ...(await resolve(list))] as const));
    const counts: Counts = Object.fromEntries(results.map(([k, n]) => [k, n]));
    const log = Object.fromEntries(results.map(([k, , note]) => [k, note]));
    const got = results.map(([, n]) => n).filter((n): n is number => n !== null);
    // Spotify's artist page says "Artist · 20.3K monthly listeners."; keep the config number if it can't be read.
    let listeners = STATS.monthlyListeners;
    try {
      const url = SOCIALS.find((s) => s.name === 'Spotify')!.url;
      const n = pick(await get(url), /([\d.,]+[KM]?) monthly listeners/i);
      if (n) listeners = formatCount(n);
      log.Spotify = n ? 'ok via page' : 'page: no number on the page';
    } catch (e) {
      log.Spotify = `page: ${e instanceof Error ? e.message : e}`;
    }
    console.log(`[followers] ${results.map(([k, n]) => `${k}=${n ?? '–'}`).join(' ')}; monthly listeners ${listeners}`);
    for (const [k, note] of Object.entries(log)) console.log(`[followers]   ${k}: ${note}`);
    return { counts, total: got.length ? got.reduce((a, b) => a + b, 0) : null, listeners, log, checkedAt: new Date().toISOString() };
  })();
  return cached;
}
