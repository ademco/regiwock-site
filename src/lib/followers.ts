// Follower counts from Regi's platforms, fetched at build time. Cloudflare's build machines have
// internet (the cloud sandbox doesn't, so there every count is null and the readout shows "--").
// No API keys: public profile pages and free no-key endpoints. A source that fails is skipped,
// and the total only adds up the platforms that answered. Counts refresh on every deploy.
import { SOCIALS, STATS } from '../config';

export type Counts = Record<string, number | null>;

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36';
const HEADERS = { 'user-agent': UA, 'accept-language': 'en-US,en;q=0.9', cookie: 'CONSENT=YES+1' };

async function get(url: string, headers: Record<string, string> = {}): Promise<string> {
  const r = await fetch(url, { headers: { ...HEADERS, ...headers }, signal: AbortSignal.timeout(6000) });
  if (!r.ok) throw new Error(`${r.status}`);
  return r.text();
}

/** "1.23K" → 1230, "12,345" → 12345, "2.1M" → 2100000. */
export function parseCount(s: string | undefined | null): number | null {
  const m = String(s ?? '').replace(/,/g, '').match(/([\d.]+)\s*([KMB])?/i);
  if (!m) return null;
  const n = Number(m[1]) * ({ K: 1e3, M: 1e6, B: 1e9 }[(m[2] ?? '').toUpperCase() as 'K'] ?? 1);
  return Number.isFinite(n) ? Math.round(n) : null;
}

/** 12345 → "12.3K", 950 → "950". */
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

// One reader per platform. Each returns a follower count or throws.
const readers: Record<string, () => Promise<number | null>> = {
  // Channel page shows e.g. "1.2K subscribers".
  YouTube: async () => parseCount((await get(`https://www.youtube.com/@${handleOf('YouTube')}`)).match(/([\d.,]+[KMB]?) subscribers/)?.[1]),
  // decapi.me: free Twitch helper, answers with a plain number.
  Twitch: async () => {
    const t = (await get(`https://decapi.me/twitch/followcount/${handleOf('Twitch')}`)).trim();
    return /^\d+$/.test(t) ? Number(t) : null;
  },
  // Kick's public channel JSON.
  Kick: async () => {
    const j = JSON.parse(await get(`https://kick.com/api/v2/channels/${handleOf('Kick')}`, { accept: 'application/json' }));
    return j.followers_count ?? j.followersCount ?? null;
  },
  // Profile page embeds "followerCount":1234.
  TikTok: async () => parseCount((await get(`https://www.tiktok.com/@${handleOf('TikTok')}`)).match(/"followerCount":(\d+)/)?.[1]),
  // Instagram's web profile endpoint, then the page's meta description ("1,234 Followers, …").
  Instagram: async () => {
    const user = handleOf('Instagram');
    try {
      const j = JSON.parse(await get(`https://i.instagram.com/api/v1/users/web_profile_info/?username=${user}`, { 'x-ig-app-id': '936619743392459' }));
      const n = j?.data?.user?.edge_followed_by?.count;
      if (typeof n === 'number') return n;
    } catch {}
    return parseCount((await get(`https://www.instagram.com/${user}/`)).match(/([\d.,]+[KMB]?) Followers/i)?.[1]);
  },
  // FxTwitter's free public API.
  X: async () => {
    const j = JSON.parse(await get(`https://api.fxtwitter.com/${handleOf('X')}`));
    return typeof j?.user?.followers === 'number' ? j.user.followers : null;
  },
  // Profile page hydration data has "followers_count":123.
  SoundCloud: async () => parseCount((await get(`https://soundcloud.com/${handleOf('SoundCloud')}`)).match(/"followers_count":(\d+)/)?.[1]),
};

let cached: Promise<{ counts: Counts; total: number | null; listeners: string }> | null = null;

/** Per-platform counts, their total (null when nothing answered) and live Spotify monthly listeners. */
export function getFollowers() {
  cached ??= (async () => {
    const entries = await Promise.all(
      Object.entries(readers).map(async ([name, read]) => {
        try {
          const n = await read();
          return [name, typeof n === 'number' && n >= 0 ? n : null] as const;
        } catch {
          return [name, null] as const;
        }
      }),
    );
    const counts: Counts = Object.fromEntries(entries);
    const got = entries.filter(([, n]) => n !== null).map(([, n]) => n as number);
    // Spotify's artist page says "Artist · 20.3K monthly listeners."; keep the config number if it can't be read.
    let listeners = STATS.monthlyListeners;
    try {
      const url = SOCIALS.find((s) => s.name === 'Spotify')!.url;
      const m = (await get(url)).match(/([\d.,]+[KM]?) monthly listeners/i);
      const n = parseCount(m?.[1]);
      if (n) listeners = formatCount(n);
    } catch {}
    const summary = got.length ? `${got.length}/${entries.length} platforms` : 'none reachable';
    console.log(`[followers] ${entries.map(([k, v]) => `${k}=${v ?? '–'}`).join(' ')} (${summary}); monthly listeners ${listeners}`);
    return { counts, total: got.length ? got.reduce((a, b) => a + b, 0) : null, listeners };
  })();
  return cached;
}
