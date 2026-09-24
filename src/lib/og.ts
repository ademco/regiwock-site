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
  { name: 'Anton', data: font('anton', 'anton-latin-400-normal.woff'), weight: 400 as const, style: 'normal' as const },
  { name: 'Instrument Serif', data: font('instrument-serif', 'instrument-serif-latin-400-italic.woff'), weight: 400 as const, style: 'italic' as const },
  { name: 'Mono', data: font('jetbrains-mono', 'jetbrains-mono-latin-500-normal.woff'), weight: 500 as const, style: 'normal' as const },
];

export async function renderPng(node: Node, width: number, height: number) {
  const svg = await satori(node as never, { width, height, fonts });
  const png = await sharp(Buffer.from(svg)).png().toBuffer();
  return new Response(new Uint8Array(png), { headers: { 'Content-Type': 'image/png' } });
}

export const OG = {
  bg: '#ece7dd',
  ink: '#151412',
  muted: '#6c665c',
  accent: '#ff4f00',
};
