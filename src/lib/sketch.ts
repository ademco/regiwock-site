// Build-time pencil sketches (rough.js → SVG paths).
// Every drawing is rendered several times with different random seeds; the page flips
// between those frames ~8×/sec, which gives the hand-drawn stop-motion "boil".
import rough from 'roughjs';

type Pt = [number, number];
type Opts = Record<string, unknown>;
type Shape = (g: ReturnType<typeof rough.generator>, o: Opts) => unknown;

const g = rough.generator();
const r1 = (s: string) => s.replace(/-?\d+\.\d+/g, (n) => (+n).toFixed(1)); // trim path size

export const INK = '#1d1d1b';
const SOFT = '#9c9a94';
const PAPER = '#f6f5f0';
export const PRISM = ['#ff2e63', '#ff9f1c', '#e8c700', '#25c26e', '#2ea8ff', '#8a2eff'];

/** Seeded PRNG so every build draws the same picture. */
function rng(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Render shapes to <path> markup for one frame. */
function frame(shapes: [Shape, Opts?][], seed: number, base: Opts) {
  let out = '';
  shapes.forEach(([shape, o = {}], i) => {
    const opts = { seed: seed * 97 + i + 1, ...base, ...o };
    const drawable = shape(g, opts) as Parameters<typeof g.toPaths>[0];
    for (const p of g.toPaths(drawable)) {
      const fill = p.fill && p.fill !== 'none' ? p.fill : 'none';
      out += `<path d="${r1(p.d)}" stroke="${p.stroke}" stroke-width="${p.strokeWidth}" fill="${fill}" stroke-linecap="round"/>`;
    }
  });
  return out;
}

/** Wrap N seeded frames in <g class="f fN"> groups (CSS flips between them). */
function frames(shapes: [Shape, Opts?][], count: number, base: Opts) {
  let out = '';
  for (let f = 0; f < count; f++) out += `<g class="f f${f + 1}">${frame(shapes, f + 1, base)}</g>`;
  return out;
}

// ---------- primitives ----------
const line = (a: Pt, b: Pt, o: Opts = {}): [Shape, Opts] => [(gg, x) => gg.line(a[0], a[1], b[0], b[1], x), o];
const curve = (pts: Pt[], o: Opts = {}): [Shape, Opts] => [(gg, x) => gg.curve(pts, x), o];
const poly = (pts: Pt[], o: Opts = {}): [Shape, Opts] => [(gg, x) => gg.polygon(pts, x), o];
const circle = (c: Pt, d: number, o: Opts = {}): [Shape, Opts] => [(gg, x) => gg.circle(c[0], c[1], d, x), o];

function ellipsePts([cx, cy]: Pt, rx: number, ry: number, rotDeg = 0, n = 14): Pt[] {
  const r = (rotDeg * Math.PI) / 180;
  const pts: Pt[] = [];
  for (let i = 0; i <= n; i++) {
    const t = (i / n) * Math.PI * 2;
    const x = Math.cos(t) * rx;
    const y = Math.sin(t) * ry;
    pts.push([cx + x * Math.cos(r) - y * Math.sin(r), cy + x * Math.sin(r) + y * Math.cos(r)]);
  }
  return pts;
}
const oval = (c: Pt, rx: number, ry: number, rot = 0, o: Opts = {}) => curve(ellipsePts(c, rx, ry, rot), o);

/** Two side lines of a tapered limb segment A→B (mannequin-style). */
function limb(a: Pt, b: Pt, ra: number, rb: number, o: Opts = {}): [Shape, Opts][] {
  const dx = b[0] - a[0];
  const dy = b[1] - a[1];
  const len = Math.hypot(dx, dy);
  const nx = -dy / len;
  const ny = dx / len;
  return [
    line([a[0] + nx * ra, a[1] + ny * ra], [b[0] + nx * rb, b[1] + ny * rb], o),
    line([a[0] - nx * ra, a[1] - ny * ra], [b[0] - nx * rb, b[1] - ny * rb], o),
  ];
}

// ---------- the figure: Regi, falling upward ----------
// Pose adapted from a falling mannequin study, flipped so he rises: back leading,
// head tipped toward the sky, one arm reaching up, the other and both legs trailing.
// Details from his photo: curly dark hair, fitted tee with a small chest logo, chain, shorts.
export function figureSVG(frameCount = 3) {
  const H: Pt = [150, 100]; // head
  const LS: Pt = [146, 152], RS: Pt = [212, 124]; // shoulders
  const LE: Pt = [100, 226], LW: Pt = [58, 286]; // left arm (trailing, loose)
  const RE: Pt = [282, 150], RW: Pt = [336, 100]; // right arm (reaching up)
  const LH: Pt = [232, 312], LK: Pt = [206, 414], LA: Pt = [174, 494]; // left leg (dangling)
  const RH: Pt = [276, 290], RK: Pt = [338, 370], RA: Pt = [374, 452]; // right leg (kicked back)

  const soft = { stroke: SOFT, strokeWidth: 0.8, roughness: 1.6 };
  const shapes: [Shape, Opts?][] = [
    // construction / gesture lines (light pencil)
    curve([[118, 70], [170, 135], [252, 300], [206, 414], [174, 494]], soft),
    curve([[58, 286], [100, 226], [146, 152], [212, 124], [282, 150], [336, 100]], soft),
    line(RH, RK, soft),
    line(RK, RA, soft),

    // head + neck + ear
    oval(H, 29, 35, -28, { fill: PAPER, fillStyle: 'solid' }),
    line([160, 132], [168, 144]),
    line([178, 126], [192, 128]),
    curve([[124, 100], [119, 110], [126, 120]], { strokeWidth: 1.1 }),
    // face, eyes closed, calm
    curve([[140, 96], [146, 99], [152, 97]], { strokeWidth: 1.1 }),
    curve([[160, 90], [166, 92], [171, 89]], { strokeWidth: 1.1 }),
    curve([[139, 90], [146, 88], [152, 90]], { strokeWidth: 0.9 }),
    curve([[160, 83], [166, 82], [172, 84]], { strokeWidth: 0.9 }),
    curve([[160, 99], [166, 108], [160, 112]], { strokeWidth: 1.1 }),
    curve([[152, 120], [159, 122], [166, 118]], { strokeWidth: 1.1 }),

    // tee: body + short sleeves
    poly(
      [
        [160, 140], [142, 150], [112, 182], [146, 198], [162, 190], [222, 298],
        [284, 268], [228, 158], [246, 153], [257, 120], [214, 116], [196, 124], [180, 138],
      ],
      { strokeWidth: 1.6, fill: PAPER, fillStyle: 'solid' },
    ),
    circle([206, 176], 7, { strokeWidth: 1 }), // small chest logo
    curve([[176, 206], [196, 214], [214, 206]], soft), // folds
    curve([[214, 262], [236, 260], [256, 248]], soft),
    // chain
    curve([[162, 146], [174, 158], [190, 148], [197, 130]], { strokeWidth: 0.9, stroke: '#77746c' }),

    // shorts
    poly(
      [
        [218, 292], [206, 330], [200, 364], [246, 372], [262, 350],
        [288, 350], [326, 322], [300, 284], [286, 264],
      ],
      { strokeWidth: 1.6, fill: PAPER, fillStyle: 'solid' },
    ),
    line([262, 350], [256, 312], soft),

    // arms
    ...limb([132, 190], LE, 11, 9),
    oval(LE, 9, 10),
    ...limb(LE, LW, 9, 6),
    curve([[54, 282], [42, 294], [38, 310], [48, 312], [60, 300], [64, 290]]), // relaxed hand
    line([46, 300], [38, 306], { strokeWidth: 0.8 }),
    ...limb([251, 137], RE, 11, 9),
    oval(RE, 9, 10),
    ...limb(RE, RW, 9, 6),
    curve([[332, 96], [340, 80], [352, 74], [360, 80], [352, 94], [342, 104]]), // open hand
    line([350, 78], [362, 66], { strokeWidth: 0.9 }),
    line([354, 84], [368, 76], { strokeWidth: 0.9 }),

    // legs
    ...limb([223, 368], LK, 17, 13),
    oval(LK, 13, 14),
    ...limb(LK, LA, 12, 8),
    ...limb([306, 336], RK, 17, 13),
    oval(RK, 13, 14),
    ...limb(RK, RA, 12, 8),
    // sneakers
    oval([166, 512], 11, 23, 28, { strokeWidth: 1.5 }),
    oval([386, 468], 11, 22, -34, { strokeWidth: 1.5 }),
  ];

  // curly hair: a scribble of loops around the crown and back of the head
  const rand = rng(7);
  for (let i = 0; i < 34; i++) {
    const t = Math.PI * (0.75 + rand() * 1.0); // crown + back of the tilted head
    const rr = 22 + rand() * 18;
    const c: Pt = [H[0] + Math.cos(t) * rr * 0.95, H[1] + Math.sin(t) * rr];
    shapes.push(circle(c, 9 + rand() * 9, { strokeWidth: 1.1, roughness: 1.8 }));
  }

  return frames(shapes, frameCount, { stroke: INK, strokeWidth: 1.4, roughness: 1.1, bowing: 1.2 });
}

// ---------- clouds ----------
/** Puffy cloud outline: bumpy top, flatter bottom. */
function cloudPts(cx: number, cy: number, w: number, h: number, rand: () => number): Pt[] {
  const bumps = 3 + Math.floor(rand() * 3);
  const phase = rand() * Math.PI;
  const pts: Pt[] = [];
  const n = 48;
  for (let i = 0; i <= n; i++) {
    const t = (i / n) * Math.PI * 2;
    const top = Math.sin(t) < 0;
    const puff = top ? 1 + 0.28 * Math.abs(Math.sin(bumps * t + phase)) : 1;
    pts.push([cx + Math.cos(t) * (w / 2) * puff, cy + Math.sin(t) * (h / 2) * puff * (top ? 1 : 0.45)]);
  }
  return pts;
}

/** One tile of clouds (drawn in a 1000×1000 box). Colored-pencil hatching = the prism accent. */
export function cloudTileSVG(seed: number, count: number, scale: number, edgesOnly = false, frameCount = 2) {
  const rand = rng(seed);
  const shapes: [Shape, Opts?][] = [];
  for (let i = 0; i < count; i++) {
    const w = (140 + rand() * 180) * scale;
    const h = w * 0.42;
    // near clouds stay out to the sides so they never bury him
    const cx = edgesOnly ? (i % 2 ? 40 + rand() * 180 : 780 + rand() * 180) : 60 + rand() * 880;
    const cy = 80 + ((i + rand() * 0.6) / count) * 860;
    // paper-colored fill so clouds overlap (and pass in front of him) like cut-outs
    shapes.push(curve(cloudPts(cx, cy, w, h, rand), { fill: PAPER, fillStyle: 'solid' }));
    // a few shading strokes under the cloud in one prism color
    const color = PRISM[Math.floor(rand() * PRISM.length)];
    const n = 3 + Math.floor(rand() * 3);
    for (let k = 0; k < n; k++) {
      const x0 = cx - w * 0.3 + (k / n) * w * 0.6;
      shapes.push(line([x0, cy + h * 0.14], [x0 + 16 * scale, cy - 6 * scale], { stroke: color, strokeWidth: 1.2, roughness: 1.4 }));
    }
  }
  return frames(shapes, frameCount, { stroke: INK, strokeWidth: 1.3, roughness: 1.3, bowing: 1.5 });
}

/** Air streaks under the figure (he's moving up, so they trail down). */
export function streaksSVG(frameCount = 3) {
  const shapes: [Shape, Opts?][] = [
    line([170, 30], [170, 90], { stroke: PRISM[4] }),
    line([200, 60], [200, 130]),
    line([232, 20], [232, 70], { stroke: PRISM[0] }),
    line([262, 70], [262, 120]),
    line([140, 80], [140, 115], { stroke: PRISM[2] }),
  ];
  return frames(shapes, frameCount, { stroke: INK, strokeWidth: 1.2, roughness: 1.2 });
}

/** Little hand-drawn arrow for the sketchbook caption. */
export function arrowSVG(frameCount = 3) {
  const shapes: [Shape, Opts?][] = [
    curve([[10, 50], [40, 30], [80, 26], [110, 12]]),
    line([110, 12], [96, 8]),
    line([110, 12], [100, 24]),
  ];
  return frames(shapes, frameCount, { stroke: INK, strokeWidth: 1.3, roughness: 1 });
}
