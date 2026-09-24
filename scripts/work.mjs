#!/usr/bin/env node
// Content CLI for the Work grid. Pure Node (no shell tricks) so it runs the same on
// Windows, macOS and Linux.
//
//   npm run new -- <type> "<title>" "<url>" [--featured] [--tags a,b] [--date 2024-05-01]
//   npm run new -- <type> "<url>"            (title pulled from the platform when possible)
//   npm run new                              (asks you step by step)
//   npm run list
//   npm run feature -- <name>                (toggles featured on/off)
//   npm run remove -- <name>
//
// Always wrap URLs in quotes: zsh (macOS) and PowerShell choke on ? and & otherwise.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import readline from 'node:readline/promises';
import { detect, oembedUrl, TYPES, PLATFORMS } from '../src/lib/platforms.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const WORK_DIR = path.join(ROOT, 'src', 'content', 'work');
const THUMB_DIR = path.join(ROOT, 'public', 'thumbs');

const TYPE_ALIASES = {
  stream: 'stream', streams: 'stream', live: 'stream', vod: 'stream',
  music: 'music', song: 'music', track: 'music', album: 'music', single: 'music',
  post: 'post', posts: 'post', video: 'post', clip: 'post', short: 'post', reel: 'post', tiktok: 'post',
  drop: 'drop', drops: 'drop', clothing: 'drop', merch: 'drop', fit: 'drop',
};

const c = {
  ok: (s) => `\x1b[32m${s}\x1b[0m`,
  dim: (s) => `\x1b[2m${s}\x1b[0m`,
  err: (s) => `\x1b[31m${s}\x1b[0m`,
  bold: (s) => `\x1b[1m${s}\x1b[0m`,
};

function fail(msg) {
  console.error(c.err(`✖ ${msg}`));
  process.exit(1);
}

// ---------- arg parsing ----------
// npm on some shells (PowerShell) swallows the `--` separator, which makes npm eat our
// --flags and expose them as npm_config_<flag> env vars instead. Read both.
function parseArgs(argv) {
  const positional = [];
  const flags = {};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith('--')) {
      const [key, inline] = a.slice(2).split(/=(.*)/s);
      if (inline !== undefined) flags[key] = inline;
      else if (argv[i + 1] && !argv[i + 1].startsWith('--') && key !== 'featured') flags[key] = argv[++i];
      else flags[key] = true;
    } else {
      positional.push(a);
    }
  }
  for (const key of ['featured', 'tags', 'date', 'thumbnail']) {
    const env = process.env[`npm_config_${key}`];
    if (flags[key] === undefined && env !== undefined && env !== '') flags[key] = env === 'true' ? true : env;
  }
  return { positional, flags };
}

// ---------- helpers ----------
const slugify = (s) =>
  s
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/×/g, 'x')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60) || 'item';

const today = () => new Date().toISOString().slice(0, 10);
const yamlStr = (s) => JSON.stringify(String(s)); // JSON strings are valid YAML

async function fetchWithTimeout(url, opts = {}, ms = 5000) {
  try {
    return await fetch(url, { ...opts, redirect: 'follow', signal: AbortSignal.timeout(ms) });
  } catch {
    return null;
  }
}

async function oembed(platform, url) {
  const endpoint = oembedUrl(platform, url);
  if (!endpoint) return null;
  const res = await fetchWithTimeout(endpoint);
  if (!res?.ok) return null;
  try {
    return await res.json();
  } catch {
    return null;
  }
}

async function downloadThumb(src, slug) {
  const res = await fetchWithTimeout(src, {}, 10000);
  if (!res?.ok) return '';
  const type = res.headers.get('content-type') || '';
  const ext = type.includes('png') ? 'png' : type.includes('webp') ? 'webp' : 'jpg';
  fs.mkdirSync(THUMB_DIR, { recursive: true });
  const file = `${slug}.${ext}`;
  fs.writeFileSync(path.join(THUMB_DIR, file), Buffer.from(await res.arrayBuffer()));
  return `/thumbs/${file}`;
}

function readItems() {
  if (!fs.existsSync(WORK_DIR)) return [];
  return fs
    .readdirSync(WORK_DIR)
    .filter((f) => f.endsWith('.md'))
    .sort()
    .map((file) => {
      const text = fs.readFileSync(path.join(WORK_DIR, file), 'utf8');
      const get = (k) => {
        const m = new RegExp(`^${k}:\\s*(.*)$`, 'm').exec(text);
        if (!m) return '';
        try {
          return JSON.parse(m[1]);
        } catch {
          return m[1].trim();
        }
      };
      return { file, text, type: get('type'), title: get('title'), featured: get('featured') === true, thumbnail: get('thumbnail') };
    });
}

function findOne(query) {
  if (!query) fail('Tell me which item, e.g. `npm run remove -- blame`. Run `npm run list` to see them all.');
  const q = slugify(query);
  const items = readItems();
  const exact = items.filter((i) => i.file.replace(/\.md$/, '') === query || i.file === query);
  const matches = exact.length ? exact : items.filter((i) => i.file.includes(q) || slugify(i.title).includes(q));
  if (!matches.length) fail(`Nothing matches "${query}". Run \`npm run list\` to see every item.`);
  if (matches.length > 1) {
    console.log(`"${query}" matches ${matches.length} items — be more specific:`);
    for (const m of matches) console.log(`  ${m.file.replace(/\.md$/, '')}`);
    process.exit(1);
  }
  return matches[0];
}

// ---------- commands ----------
async function cmdNew(positional, flags) {
  let [type, title, url] = positional;
  // Allow `new music <url>` (no title)
  if (title && /^https?:\/\//i.test(title) && !url) [title, url] = ['', title];

  if ((!type || !url) && process.stdin.isTTY) {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    if (!type) type = (await rl.question(`Type (${TYPES.join(' / ')}): `)).trim();
    if (!url) url = (await rl.question('Link: ')).trim();
    if (!title) title = (await rl.question('Title (leave blank to pull it from the link): ')).trim();
    if (flags.featured === undefined) flags.featured = /^y/i.test((await rl.question('Featured (big card)? y/N: ')).trim());
    rl.close();
  }

  const normType = TYPE_ALIASES[String(type || '').toLowerCase()];
  if (!normType) fail(`Type must be one of: ${TYPES.join(', ')} (got "${type ?? ''}")`);
  if (!url || !/^https?:\/\//i.test(url)) fail('Give me a full link starting with https://  — wrap it in "quotes".');

  // Resolve short links (vm.tiktok.com, youtu.be is fine as-is, spotify.link, on.soundcloud.com)
  if (/^(https?:\/\/)(vm\.tiktok\.com|vt\.tiktok\.com|spotify\.link|on\.soundcloud\.com)\//i.test(url)) {
    const res = await fetchWithTimeout(url, { method: 'GET' });
    if (res?.url) url = res.url.split('?')[0];
  }

  const info = detect(url);
  const meta = await oembed(info.platform, url);

  if (!title) title = meta?.title || '';
  if (!title) fail('Couldn’t pull a title from that link — add one: npm run new -- music "My Title" "<url>"');

  const date = typeof flags.date === 'string' ? flags.date : today();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) fail('--date must look like 2024-05-01');

  let slug = `${date}-${slugify(title)}`;
  fs.mkdirSync(WORK_DIR, { recursive: true });
  for (let n = 2; fs.existsSync(path.join(WORK_DIR, `${slug}.md`)); n++) slug = `${date}-${slugify(title)}-${n}`;

  // Thumbnail: explicit flag > best YouTube still > platform oEmbed (downloaded when the URL expires)
  let thumbnail = typeof flags.thumbnail === 'string' ? flags.thumbnail : info.thumbnail;
  if (!flags.thumbnail && info.platform === 'youtube' && info.id) {
    const max = `https://i.ytimg.com/vi/${info.id}/maxresdefault.jpg`;
    const res = await fetchWithTimeout(max, { method: 'HEAD' });
    if (res?.ok) thumbnail = max;
  }
  if (!thumbnail && meta?.thumbnail_url) {
    // TikTok thumbnail URLs are signed and expire, so keep a local copy.
    thumbnail = info.platform === 'tiktok' ? await downloadThumb(meta.thumbnail_url, slug) : meta.thumbnail_url;
  }

  const tags = typeof flags.tags === 'string' ? flags.tags.split(',').map((t) => t.trim()).filter(Boolean) : [];

  const body = [
    '---',
    `type: ${normType}`,
    `title: ${yamlStr(title)}`,
    `date: ${date}`,
    `url: ${yamlStr(url)}`,
    `embed: ${yamlStr(info.embed)}`,
    `thumbnail: ${yamlStr(thumbnail)}`,
    `featured: ${flags.featured === true || flags.featured === 'true'}`,
    `tags: ${JSON.stringify(tags)}`,
    '---',
    '',
  ].join('\n');

  const file = path.join(WORK_DIR, `${slug}.md`);
  fs.writeFileSync(file, body);

  console.log(c.ok(`✔ Added ${normType}: ${c.bold(title)}`));
  console.log(c.dim(`  ${path.relative(ROOT, file)}`));
  console.log(c.dim(`  platform: ${PLATFORMS[info.platform]}${info.embed ? ' · plays on the page' : ' · opens in a new tab'}`));
  console.log(c.dim(`  thumbnail: ${thumbnail || 'none — shows a styled title card'}`));
}

function cmdList() {
  const items = readItems();
  if (!items.length) return console.log('No work items yet. Add one with: npm run new -- music "Title" "<url>"');
  for (const i of items) {
    const star = i.featured ? c.ok('★') : ' ';
    console.log(`${star} ${i.type.padEnd(6)} ${i.title}  ${c.dim(i.file.replace(/\.md$/, ''))}`);
  }
  console.log(c.dim(`\n${items.length} items · ★ = featured`));
}

function cmdFeature(query) {
  const item = findOne(query);
  const next = !item.featured;
  const text = item.text.replace(/^featured:.*$/m, `featured: ${next}`);
  fs.writeFileSync(path.join(WORK_DIR, item.file), text);
  console.log(c.ok(`✔ ${item.title} is ${next ? 'now featured ★' : 'no longer featured'}`));
}

function cmdRemove(query) {
  const item = findOne(query);
  fs.unlinkSync(path.join(WORK_DIR, item.file));
  if (item.thumbnail?.startsWith('/thumbs/')) {
    const local = path.join(ROOT, 'public', ...item.thumbnail.split('/').filter(Boolean));
    if (fs.existsSync(local)) fs.unlinkSync(local);
  }
  console.log(c.ok(`✔ Removed ${item.title}`));
}

// ---------- main ----------
const [command, ...rest] = process.argv.slice(2);
const { positional, flags } = parseArgs(rest);

switch (command) {
  case 'new':
    await cmdNew(positional, flags);
    break;
  case 'list':
    cmdList();
    break;
  case 'feature':
    cmdFeature(positional.join(' '));
    break;
  case 'remove':
    cmdRemove(positional.join(' '));
    break;
  default:
    fail(`Unknown command "${command}". Use new, list, feature or remove.`);
}
