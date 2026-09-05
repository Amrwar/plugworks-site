/** One decorative dot on a background, in the coordinate space it was asked for. */
export type Dot = {
  cx: number;
  cy: number;
  /** Radius. */
  r: number;
  /** Seconds to wait before this dot joins the pulse, so they do not blink as one. */
  delay: number;
};

/** How a field of dots should be laid out. */
export type ScatterOptions = {
  count?: number;
  width?: number;
  height?: number;
  /** Change this to get a different-looking field with the same character. */
  seed?: number;
  minRadius?: number;
  maxRadius?: number;
  maxDelay?: number;
};

const DEFAULTS = {
  count: 50,
  width: 1440,
  height: 600,
  seed: 1,
  minRadius: 1,
  maxRadius: 3,
  maxDelay: 2,
};

/**
 * A small seeded generator (mulberry32).
 *
 * Not for anything that needs to be unguessable — this only has to give the
 * same sequence twice, which `Math.random` cannot promise.
 */
function seeded(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Two decimals is as much precision as an SVG coordinate needs here. */
function round(value: number): number {
  return Math.round(value * 100) / 100;
}

/**
 * A fixed field of scattered dots.
 *
 * The locations section drew its map dots by calling `Math.random()` inside
 * the render. That is wrong twice over: the server and the browser pick
 * different numbers, so React reports a hydration mismatch on the page, and
 * every later render — the reveal alone causes one — teleports all fifty dots
 * to fresh positions while the reader is looking at them.
 *
 * Seeding the sequence makes the scatter a fixed property of the design: the
 * same dots on the server, in the browser, and on every render after.
 */
export function scatterDots(options: ScatterOptions = {}): Dot[] {
  const { count, width, height, seed, minRadius, maxRadius, maxDelay } = {
    ...DEFAULTS,
    ...options,
  };
  const total = Math.max(0, Math.floor(count));
  const spread = Math.max(0, maxRadius - minRadius);
  const random = seeded(seed);

  return Array.from({ length: total }, () => ({
    cx: round(random() * width),
    cy: round(random() * height),
    r: round(minRadius + random() * spread),
    delay: round(random() * Math.max(0, maxDelay)),
  }));
}
