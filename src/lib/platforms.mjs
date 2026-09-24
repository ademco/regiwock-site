// Link → platform detection, shared by the site (src/) and the CLI (scripts/work.mjs).
// Plain JavaScript on purpose so Node can run it directly on Windows, macOS and Linux.
//
// detect(url) returns:
//   platform   one of the keys in PLATFORMS
//   id         the video/track id when there is one
//   embed      iframe src for the click-to-load player ('' = no embed, card links out)
//              Twitch needs the page's hostname as `parent`; the `{parent}` token is
//              filled in by the browser when the player loads.
//   thumbnail  a stable thumbnail URL we can derive without any API call ('' = none)
//   vertical   true for 9:16 content (Shorts, TikTok, Reels)

/** @typedef {{ platform: string, id: string, embed: string, thumbnail: string, vertical: boolean }} Detected */

export const TYPES = ['stream', 'music', 'post', 'drop'];

export const PLATFORMS = {
  youtube: 'YouTube',
  twitch: 'Twitch',
  kick: 'Kick',
  tiktok: 'TikTok',
  instagram: 'Instagram',
  spotify: 'Spotify',
  soundcloud: 'SoundCloud',
  applemusic: 'Apple Music',
  link: 'Link',
};

/** Accepts "1h2m3s", "90s", "90" → seconds. */
function parseTime(t) {
  if (!t) return 0;
  if (/^\d+$/.test(t)) return Number(t);
  const m = /^(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s)?$/.exec(t);
  return m ? Number(m[1] || 0) * 3600 + Number(m[2] || 0) * 60 + Number(m[3] || 0) : 0;
}

/** @returns {Detected} */
function result(platform, extra = {}) {
  return { platform, id: '', embed: '', thumbnail: '', vertical: false, ...extra };
}

/** @param {string} rawUrl @returns {Detected} */
export function detect(rawUrl) {
  let u;
  try {
    u = new URL(String(rawUrl).trim());
  } catch {
    return result('link');
  }
  const host = u.hostname.replace(/^(www|m)\./, '');
  const parts = u.pathname.split('/').filter(Boolean);

  // YouTube: watch?v=, youtu.be/, /live/, /shorts/, /embed/
  if (host === 'youtu.be' || host.endsWith('youtube.com') || host.endsWith('youtube-nocookie.com')) {
    let id = host === 'youtu.be' ? parts[0] : u.searchParams.get('v');
    if (!id && ['live', 'shorts', 'embed', 'v'].includes(parts[0])) id = parts[1];
    if (!id) return result('youtube');
    const start = parseTime(u.searchParams.get('t') || u.searchParams.get('start'));
    return result('youtube', {
      id,
      embed: `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0${start ? `&start=${start}` : ''}`,
      thumbnail: `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
      vertical: parts[0] === 'shorts',
    });
  }

  // Twitch: VODs, clips, channels
  if (host.endsWith('twitch.tv')) {
    if (host === 'clips.twitch.tv' && parts[0]) {
      return result('twitch', { id: parts[0], embed: `https://clips.twitch.tv/embed?clip=${parts[0]}&parent={parent}&autoplay=true` });
    }
    if (parts[1] === 'clip' && parts[2]) {
      return result('twitch', { id: parts[2], embed: `https://clips.twitch.tv/embed?clip=${parts[2]}&parent={parent}&autoplay=true` });
    }
    if (parts[0] === 'videos' && parts[1]) {
      return result('twitch', { id: parts[1], embed: `https://player.twitch.tv/?video=${parts[1]}&parent={parent}&autoplay=true` });
    }
    if (parts[0]) {
      return result('twitch', { id: parts[0], embed: `https://player.twitch.tv/?channel=${parts[0]}&parent={parent}&autoplay=true` });
    }
    return result('twitch');
  }

  // Kick: only the live channel player is embeddable; VODs and clips link out.
  if (host.endsWith('kick.com')) {
    const channel = parts[0] || '';
    const isChannel = parts.length === 1 && !u.searchParams.get('clip');
    return result('kick', { id: channel, embed: isChannel ? `https://player.kick.com/${channel}` : '' });
  }

  // TikTok: /@user/video/<id>. Short links (vm.tiktok.com) are resolved by the CLI first.
  if (host.endsWith('tiktok.com')) {
    const i = parts.indexOf('video');
    const id = i >= 0 ? parts[i + 1] : '';
    return result('tiktok', { id, embed: id ? `https://www.tiktok.com/player/v1/${id}?autoplay=1&rel=0` : '', vertical: true });
  }

  // Instagram: posts, reels
  if (host.endsWith('instagram.com')) {
    const kind = parts[0] === 'reels' ? 'reel' : parts[0];
    if (['p', 'reel', 'tv'].includes(kind) && parts[1]) {
      return result('instagram', { id: parts[1], embed: `https://www.instagram.com/${kind}/${parts[1]}/embed`, vertical: true });
    }
    return result('instagram');
  }

  // Spotify: track / album / artist / playlist / episode / show (optional intl-xx prefix)
  if (host === 'open.spotify.com') {
    const p = parts[0]?.startsWith('intl-') ? parts.slice(1) : parts;
    if (p[0] && p[1]) {
      return result('spotify', { id: p[1], embed: `https://open.spotify.com/embed/${p[0]}/${p[1]}?utm_source=generator&theme=0` });
    }
    return result('spotify');
  }

  // SoundCloud: any track, set or profile
  if (host.endsWith('soundcloud.com') && parts.length) {
    const clean = `https://soundcloud.com/${parts.join('/')}`;
    return result('soundcloud', {
      embed: `https://w.soundcloud.com/player/?url=${encodeURIComponent(clean)}&auto_play=true&visual=true&hide_related=true`,
    });
  }

  // Apple Music: same path on the embed host
  if (host === 'music.apple.com') {
    return result('applemusic', { embed: `https://embed.music.apple.com${u.pathname}${u.search}` });
  }

  return result('link');
}

/** oEmbed endpoints that work without an API key. Used for titles/thumbnails. */
export function oembedUrl(platform, url) {
  const q = encodeURIComponent(url);
  switch (platform) {
    case 'youtube':
      return `https://www.youtube.com/oembed?format=json&url=${q}`;
    case 'spotify':
      return `https://open.spotify.com/oembed?url=${q}`;
    case 'soundcloud':
      return `https://soundcloud.com/oembed?format=json&url=${q}`;
    case 'tiktok':
      return `https://www.tiktok.com/oembed?url=${q}`;
    default:
      return '';
  }
}
