import { getCollection, type CollectionEntry } from 'astro:content';
import { detect, oembedUrl, PLATFORMS } from './platforms.mjs';

export type WorkType = CollectionEntry<'work'>['data']['type'];

export interface Media {
  url: string;
  platform: string;
  platformLabel: string;
  embed: string;
  thumbnail: string;
  vertical: boolean;
}

// Items created in a sandbox without internet have no Spotify/SoundCloud artwork yet.
// Cloudflare's build machines do have internet, so try once there (silently skip on failure).
const cache = new Map<string, Promise<string>>();
function fetchThumb(platform: string, url: string): Promise<string> {
  const endpoint = oembedUrl(platform, url);
  if (!endpoint || !['spotify', 'soundcloud'].includes(platform)) return Promise.resolve('');
  if (!cache.has(endpoint)) {
    cache.set(
      endpoint,
      fetch(endpoint, { signal: AbortSignal.timeout(4000) })
        .then((r) => (r.ok ? r.json() : null))
        .then((j) => (typeof j?.thumbnail_url === 'string' ? j.thumbnail_url : ''))
        .catch(() => ''),
    );
  }
  return cache.get(endpoint)!;
}

export async function resolveMedia(url: string, embed = '', thumbnail = ''): Promise<Media> {
  const d = detect(url);
  return {
    url,
    platform: d.platform,
    platformLabel: PLATFORMS[d.platform as keyof typeof PLATFORMS] ?? 'Link',
    embed: embed || d.embed,
    thumbnail: thumbnail || d.thumbnail || (await fetchThumb(d.platform, url)),
    vertical: d.vertical,
  };
}

export async function getWork() {
  const entries = await getCollection('work');
  const items = await Promise.all(
    entries.map(async (e) => ({
      id: e.id,
      ...e.data,
      note: e.body?.trim() ?? '',
      media: await resolveMedia(e.data.url, e.data.embed, e.data.thumbnail),
    })),
  );
  // Featured first, then newest
  return items.sort((a, b) => Number(b.featured) - Number(a.featured) || b.date.getTime() - a.date.getTime());
}
