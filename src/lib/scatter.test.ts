import { describe, expect, it } from "vitest";
import { scatterDots } from "./scatter";

describe("scatterDots", () => {
  it("draws fifty dots unless told otherwise", () => {
    expect(scatterDots()).toHaveLength(50);
  });

  it("draws as many as it is asked for", () => {
    expect(scatterDots({ count: 7 })).toHaveLength(7);
  });

  it("gives the same field every time it is called", () => {
    expect(scatterDots()).toEqual(scatterDots());
  });

  it("gives the same field for the same seed", () => {
    expect(scatterDots({ seed: 42 })).toEqual(scatterDots({ seed: 42 }));
  });

  it("gives a different field for a different seed", () => {
    expect(scatterDots({ seed: 1 })).not.toEqual(scatterDots({ seed: 2 }));
  });

  it("keeps every dot inside the box", () => {
    const width = 300;
    const height = 120;
    for (const dot of scatterDots({ count: 200, width, height })) {
      expect(dot.cx).toBeGreaterThanOrEqual(0);
      expect(dot.cx).toBeLessThanOrEqual(width);
      expect(dot.cy).toBeGreaterThanOrEqual(0);
      expect(dot.cy).toBeLessThanOrEqual(height);
    }
  });

  it("keeps every radius between the two it was given", () => {
    for (const dot of scatterDots({ count: 200, minRadius: 2, maxRadius: 5 })) {
      expect(dot.r).toBeGreaterThanOrEqual(2);
      expect(dot.r).toBeLessThanOrEqual(5);
    }
  });

  it("staggers the pulse without ever waiting longer than it may", () => {
    for (const dot of scatterDots({ count: 200, maxDelay: 3 })) {
      expect(dot.delay).toBeGreaterThanOrEqual(0);
      expect(dot.delay).toBeLessThanOrEqual(3);
    }
  });

  it("does actually stagger them, rather than starting them together", () => {
    const delays = scatterDots({ count: 30 }).map((dot) => dot.delay);
    expect(new Set(delays).size).toBeGreaterThan(1);
  });

  it("scatters rather than stacking every dot in one place", () => {
    const dots = scatterDots({ count: 30 });
    const places = new Set(dots.map((dot) => `${dot.cx},${dot.cy}`));
    expect(places.size).toBeGreaterThan(25);
  });

  it("spreads across the whole box, not just one corner", () => {
    const dots = scatterDots({ count: 200, width: 1000, height: 1000 });
    expect(Math.min(...dots.map((d) => d.cx))).toBeLessThan(200);
    expect(Math.max(...dots.map((d) => d.cx))).toBeGreaterThan(800);
    expect(Math.min(...dots.map((d) => d.cy))).toBeLessThan(200);
    expect(Math.max(...dots.map((d) => d.cy))).toBeGreaterThan(800);
  });

  it("rounds coordinates so the markup stays short", () => {
    for (const dot of scatterDots({ count: 20 })) {
      expect(dot.cx).toBe(Math.round(dot.cx * 100) / 100);
      expect(dot.cy).toBe(Math.round(dot.cy * 100) / 100);
    }
  });

  it("draws nothing when asked for nothing", () => {
    expect(scatterDots({ count: 0 })).toEqual([]);
  });

  it("draws nothing rather than throwing on a negative count", () => {
    expect(scatterDots({ count: -5 })).toEqual([]);
  });

  it("ignores the fraction of a fractional count", () => {
    expect(scatterDots({ count: 4.9 })).toHaveLength(4);
  });

  it("gives every dot the same radius when both bounds agree", () => {
    const radii = scatterDots({ count: 10, minRadius: 2, maxRadius: 2 }).map((d) => d.r);
    expect(new Set(radii)).toEqual(new Set([2]));
  });

  it("starts every dot at once when no delay is allowed", () => {
    const delays = scatterDots({ count: 10, maxDelay: 0 }).map((d) => d.delay);
    expect(new Set(delays)).toEqual(new Set([0]));
  });

  it("keeps each dot's own numbers together as one dot", () => {
    const [first] = scatterDots({ count: 1 });
    expect(Object.keys(first).sort()).toEqual(["cx", "cy", "delay", "r"]);
  });
});
