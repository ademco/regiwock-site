import type { APIRoute } from 'astro';
import { h, renderPng, OG } from '../lib/og';
import { figureSVG, cloudTileSVG } from '../lib/sketch';
import { PROFILE } from '../config';

// Only the first frame of each drawing (static image)
const firstFrame = (svg: string) => svg.replace(/<g class="f f[23]">.*?<\/g>(?=<g class="f|$)/gs, '');
const svgImg = (viewBox: string, body: string, w: number, hgt: number) => ({
  type: 'img',
  props: {
    src: `data:image/svg+xml;base64,${Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}" width="${w}" height="${hgt}">${body}</svg>`).toString('base64')}`,
    width: w,
    height: hgt,
  },
});

const arrow = {
  type: 'svg',
  props: {
    width: 30,
    height: 20,
    viewBox: '0 0 30 20',
    children: { type: 'path', props: { d: 'M0 10h26M18 2l8 8-8 8', stroke: OG.ink, 'stroke-width': 3, fill: 'none' } },
  },
};

export const GET: APIRoute = () =>
  renderPng(
    h(
      'div',
      { width: '100%', height: '100%', background: OG.bg, color: OG.ink, position: 'relative' },
      h('div', { position: 'absolute', left: 0, top: 0 }, svgImg('0 0 1000 525', firstFrame(cloudTileSVG(11, 9, 0.7)), 1200, 630) as never),
      h(
        'div',
        { position: 'absolute', right: 150, top: 10 },
        svgImg('-40 -30 500 640', `<g transform="rotate(-14 210 290)">${firstFrame(figureSVG(1))}</g>`, 480, 614) as never,
      ),
      h(
        'div',
        { position: 'absolute', left: 64, bottom: 64, flexDirection: 'column', gap: 18 },
        h('div', { fontFamily: 'Unbounded', fontSize: 92, letterSpacing: -5, lineHeight: 1 }, PROFILE.wordmark.toUpperCase()),
        h('div', { fontFamily: 'Caveat', fontSize: 50, color: OG.muted }, `${PROFILE.pitch.toLowerCase()}`),
        h(
          'div',
          { alignItems: 'center', gap: 14, alignSelf: 'flex-start', marginTop: 6, backgroundImage: OG.accent, padding: '16px 26px', fontFamily: 'Mono', fontSize: 26, letterSpacing: 2, textTransform: 'uppercase' },
          'Book me',
          arrow as never,
        ),
      ),
    ),
    1200,
    630,
  );
