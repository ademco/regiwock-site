import type { APIRoute } from 'astro';
import { h, renderPng, OG } from '../lib/og';

export const GET: APIRoute = () =>
  renderPng(
    h(
      'div',
      { width: '100%', height: '100%', background: OG.bg, alignItems: 'center', justifyContent: 'center' },
      h('div', { fontFamily: 'Anton', fontSize: 120, color: OG.ink, lineHeight: 1 }, 'R'),
      h('div', { position: 'absolute', right: 34, bottom: 38, width: 20, height: 20, background: OG.accent }),
    ),
    180,
    180,
  );
