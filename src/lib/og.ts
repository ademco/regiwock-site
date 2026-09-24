// Build-time PNG rendering (Open Graph card + touch icon) with satori → sharp.
import fs from 'node:fs';
import path from 'node:path';
import satori from 'satori';
import sharp from 'sharp';

type Child = Node | string | number | false | null | undefined;
interface Node {
  type: string;
  props: Record<string, unknown> & { children?: Child | Child[] };
}

/** Tiny hyperscript so we don't need JSX/React for satori. */
export function h(type: string, style: Record<string, unknown>, ...children: Child[]): Node {
  return { type, props: { style: { display: 'flex', ...style }, children } };
}

const font = (pkg: string, file: string) =>
  fs.readFileSync(path.join(process.cwd(), 'node_modules', '@fontsource', pkg, 'files', file));

const fonts = [
  { name: 'Unbounded', data: font('unbounded', 'unbounded-latin-800-normal.woff'), weight: 800 as const, style: 'normal' as const },
  { name: 'Caveat', data: font('caveat', 'caveat-latin-500-normal.woff'), weight: 500 as const, style: 'normal' as const },
  { name: 'Mono', data: font('jetbrains-mono', 'jetbrains-mono-latin-500-normal.woff'), weight: 500 as const, style: 'normal' as const },
];

export async function renderPng(node: Node, width: number, height: number) {
  const svg = await satori(node as never, { width, height, fonts });
  const png = await sharp(Buffer.from(svg)).png().toBuffer();
  return new Response(new Uint8Array(png), { headers: { 'Content-Type': 'image/png' } });
}

export const OG = {
  bg: '#f6f5f0',
  ink: '#1d1d1b',
  muted: '#6d6b66',
  accent: 'linear-gradient(90deg, #ff2e63, #ff9f1c, #ffe600, #25e07a, #2ea8ff, #8a2eff)',
};
