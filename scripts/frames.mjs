#!/usr/bin/env node
// Turn photos/scans of hand-drawn frames into transparent "ink only" frames for the main page.
//
//   npm run frames -- "<folder with drawings>"
//
// Takes every image in the folder (sorted by name), strips the paper and notebook lines so only
// the pencil/ink is left (the site draws its own notebook lines), and writes public/fall/fall-01.webp …
// The main page switches from the code-drawn figure to these frames automatically (8 fps).
// Pure Node + sharp, so it works the same on Windows and macOS.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = path.join(ROOT, 'public', 'fall');
const INK = [29, 29, 27]; // matches --ink

const src = process.argv[2];
if (!src || !fs.existsSync(src)) {
  console.error('✖ Give me the folder with your drawings: npm run frames -- "C:\\path\\to\\drawings"');
  process.exit(1);
}
const files = fs
  .readdirSync(src)
  .filter((f) => /\.(png|jpe?g|webp|heic|avif|tiff?)$/i.test(f))
  .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
if (!files.length) {
  console.error('✖ No images found in that folder.');
  process.exit(1);
}

fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(OUT, { recursive: true });

for (const [i, file] of files.entries()) {
  // Red channel only: blue ruled lines and the pink margin are light in red, pencil is dark
  // in every channel, so this drops notebook lines. Then stretch paper → white, ink → black.
  const { data, info } = await sharp(path.join(src, file))
    .rotate() // respect phone photo orientation
    .resize({ height: 1200, withoutEnlargement: true })
    .extractChannel('red')
    .raw()
    .toBuffer({ resolveWithObject: true });

  // Paper brightness = median pixel (most of the page is paper), so lighting doesn't matter
  const hist = new Array(256).fill(0);
  for (const v of data) hist[v]++;
  let paper = 255;
  for (let v = 0, seen = 0; v < 256; v++) if ((seen += hist[v]) >= data.length / 2) { paper = v; break; }

  // Brightness relative to the paper → alpha: only clearly darker marks (pencil/ink) stay
  const rgba = Buffer.alloc(info.width * info.height * 4);
  for (let p = 0; p < info.width * info.height; p++) {
    const lum = Math.min(255, (data[p] / Math.max(paper, 1)) * 255);
    const a = Math.max(0, Math.min(255, Math.round(((200 - lum) / 140) * 255)));
    rgba[p * 4] = INK[0];
    rgba[p * 4 + 1] = INK[1];
    rgba[p * 4 + 2] = INK[2];
    rgba[p * 4 + 3] = a;
  }

  const name = `fall-${String(i + 1).padStart(2, '0')}.webp`;
  await sharp(rgba, { raw: { width: info.width, height: info.height, channels: 4 } })
    .webp({ quality: 90, alphaQuality: 90 })
    .toFile(path.join(OUT, name));
  console.log(`✔ ${file} → public/fall/${name}`);
}
console.log(`\n${files.length} frames ready. The main page now plays them instead of the code-drawn figure.`);
