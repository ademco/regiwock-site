import type { APIRoute } from 'astro';
import { h, renderPng, OG } from '../lib/og';
import { PROFILE, COLLAB_NAMES } from '../config';

const corner = (pos: Record<string, number>, sides: string[]) =>
  h('div', {
    position: 'absolute',
    width: 44,
    height: 44,
    ...pos,
    ...Object.fromEntries(sides.map((s) => [`border${s}`, `4px solid ${OG.ink}`])),
  });

// The mono font subset has no → glyph, so draw it
const arrow: Parameters<typeof h>[2] = {
  type: 'svg',
  props: {
    width: 30,
    height: 20,
    viewBox: '0 0 30 20',
    children: { type: 'path', props: { d: 'M0 10h26M18 2l8 8-8 8', stroke: OG.ink, 'stroke-width': 3, fill: 'none' } },
  },
};

const label = (text: string, extra: Record<string, unknown> = {}) =>
  h('div', { fontFamily: 'Mono', fontSize: 22, letterSpacing: 2, textTransform: 'uppercase', color: OG.muted, ...extra }, text);

export const GET: APIRoute = () =>
  renderPng(
    h(
      'div',
      { width: '100%', height: '100%', background: OG.bg, color: OG.ink, position: 'relative', flexDirection: 'column', padding: '64px 72px' },
      corner({ top: 28, left: 28 }, ['Top', 'Left']),
      corner({ top: 28, right: 28 }, ['Top', 'Right']),
      corner({ bottom: 28, left: 28 }, ['Bottom', 'Left']),
      corner({ bottom: 28, right: 28 }, ['Bottom', 'Right']),
      h(
        'div',
        { justifyContent: 'space-between', width: '100%' },
        h('div', { alignItems: 'center', gap: 12 }, h('div', { width: 16, height: 16, borderRadius: 16, background: '#ff2a2a' }), label('Rec', { color: OG.ink })),
        label(PROFILE.roles.join('  /  ')),
      ),
      h(
        'div',
        { flexDirection: 'column', flexGrow: 1, justifyContent: 'center' },
        h('div', { fontFamily: 'Anton', fontSize: 250, lineHeight: 0.9, letterSpacing: -2, textTransform: 'uppercase' }, PROFILE.wordmark),
        h(
          'div',
          { fontFamily: 'Instrument Serif', fontStyle: 'italic', fontSize: 76, marginTop: 8, color: OG.ink },
          PROFILE.pitch,
        ),
      ),
      h(
        'div',
        { justifyContent: 'space-between', alignItems: 'flex-end', width: '100%' },
        label(`w/ ${COLLAB_NAMES.slice(0, 4).join(' · ')}`),
        h(
          'div',
          { background: OG.accent, color: OG.ink, fontFamily: 'Mono', fontSize: 28, letterSpacing: 2, padding: '18px 28px', textTransform: 'uppercase', alignItems: 'center', gap: 16 },
          'Book me',
          arrow,
        ),
      ),
    ),
    1200,
    630,
  );
