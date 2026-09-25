// Everything about Regi that isn't a work item lives here.
// Work items (the grid) live in src/content/work/ and are managed with `npm run new`.

/** Web3Forms access key. Get a free one at https://web3forms.com (it's safe to be public). */
export const WEB3FORMS_ACCESS_KEY = 'a3fde8b3-5c2d-4e1d-b84e-af1c86f41384';

/** Canonical URL of the live site. */
export const SITE_URL = 'https://regiwock.com';

/**
 * Flip to true once regiwock.com points at Cloudflare Pages (it's on Beacons until then).
 * While false, share images use the Cloudflare deployment URL so DM previews still work.
 */
export const DOMAIN_CONNECTED = false;

/** Live Cloudflare URL (e.g. https://regiwock-site.<name>.workers.dev), used for share images until the domain is connected. */
export const DEPLOY_URL = 'https://regiwock-site.coklara123.workers.dev';

export const EMAIL = 'regiwock@gmail.com';

export const PROFILE = {
  name: 'Regi',
  handle: 'regiwock',
  wordmark: 'Regiwock',
  pitch: 'The glue since 1999.',
  roles: ['Artist', 'Creator', 'Stream production'],
  description:
    'Regi (@regiwock): independent artist, creator since 2009, and the camera + stream tech behind live sessions with Ye, Digital Nas, AssPizza and more. Book brand deals, stream production and collabs.',
};

/**
 * Numbers shown as camera readouts on the viewfinder (/styleguide for now).
 * Followers aren't here: src/lib/followers.ts pulls them from each platform at build time and
 * adds them up. It also reads live monthly listeners from Spotify; this number is the fallback.
 */
export const STATS = {
  /** Regi started YouTube in April 2009 (born July 1999 — that's the 1999 in the pitch). */
  creatingSince: 'Apr 2009',
  monthlyListeners: '20K',
};

/** Shown in the proof bar marquee. */
export const COLLAB_NAMES = ['Ye', 'Digital Nas', 'AssPizza', 'Ac7ionMan', 'Blame'];

/** Top 3 collabs, each with a clip and what Regi did. */
export const COLLABS = [
  {
    name: 'Ye × Digital Nas',
    url: 'https://www.youtube.com/watch?v=dACQJ2dgZHI',
    roles: ['Camera', 'Tech setup', 'Stream consulting'],
    line: 'Ran camera and built the whole behind-the-scenes setup, handled live tech support, and worked with Digital Nas on the stream’s format and what he needed on his end.',
  },
  {
    name: 'AssPizza',
    url: 'https://www.youtube.com/live/0U6PonEWW3A',
    roles: ['Streamsnipe', 'IRL collab'],
    line: 'Streamsniped AssPizza, then pulled up to his warehouse — and ended up live on one of the only streams he’s ever run on his YouTube channel.',
  },
  {
    name: 'Ac7ionMan',
    url: 'https://www.youtube.com/watch?v=wjawZEo-5OQ',
    roles: ['Camera', 'Co-stream'],
    line: 'Camera operator and collab streamer, live alongside Ac7ionMan.',
  },
];

/**
 * Background sound for the main page. Drop an MP3 at public/audio/ambient.mp3 and a
 * "sound" toggle appears (browsers only allow audio after a tap). Must be a track Regi
 * has the rights to — his own music is ideal.
 */
export const AUDIO = { file: 'audio/ambient.mp3', title: '' };

export const INQUIRY_TYPES = ['Brand deal', 'Stream production', 'Collab', 'Other'];

export const BUDGETS = ['Under $500', '$500 – $1K', '$1K – $5K', '$5K – $10K', '$10K+', 'Not sure yet'];

export const ABOUT = [
  'I’m Regi — born in 1999 and making YouTube videos by 2009, at nine years old. I never stopped.',
  'Today I’m an independent artist with around 20K monthly listeners on Spotify, a creator, and a platform engineer by trade — which is why I’m usually the one behind the camera and the tech when streams with Ye, Digital Nas, AssPizza, Ac7ionMan and Blame go live.',
  'I care about working hard, making people laugh, and making entertainment that looks cool while doing it.',
  'Most of all I like putting smart, creative people from different worlds in the same room and giving everyone a voice. That’s the glue.',
];

export const SOCIALS = [
  { name: 'YouTube', url: 'https://www.youtube.com/@regiwock' },
  { name: 'Twitch', url: 'https://www.twitch.tv/regiwock' },
  { name: 'Kick', url: 'https://kick.com/regiwock' },
  { name: 'TikTok', url: 'https://www.tiktok.com/@regiwock_' },
  { name: 'Instagram', url: 'https://www.instagram.com/regiwock' },
  { name: 'X', url: 'https://x.com/regiwock' },
  { name: 'Spotify', url: 'https://open.spotify.com/artist/4xk6CzvWfwr95lyOPGZPlu' },
  { name: 'SoundCloud', url: 'https://soundcloud.com/regiwock' },
  { name: 'Apple Music', url: 'https://music.apple.com/us/artist/regiwock/1673912296' },
];

