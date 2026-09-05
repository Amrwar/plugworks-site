import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import ComingSoonBanner from "./ComingSoonBanner";
import { marqueeItems, marqueeRepeats } from "@/lib/marquee";

const html = renderToStaticMarkup(<ComingSoonBanner />);

describe("ComingSoonBanner", () => {
  it("shows on first render, before anyone has dismissed it", () => {
    expect(html).not.toBe("");
  });

  it("says what it is there to say", () => {
    expect(html).toContain("Website Launching Soon");
    expect(html).toContain("Get ready for something electric");
    expect(html).toContain("Coming Soon");
  });

  it("repeats the phrase enough times to fill a wide screen", () => {
    expect(html.match(/Website Launching Soon/g)?.length).toBeGreaterThanOrEqual(4);
  });

  it("renders the phrase the marquee builds rather than a second copy of it", () => {
    // The map used to throw its item away and hardcode the words underneath,
    // so the phrase could be changed in one place and not the other.
    const phrases = marqueeItems("Website Launching Soon", 4);
    expect(html.match(/Website Launching Soon/g)?.length).toBe(phrases.length);
  });

  it("can be dismissed with a named button", () => {
    expect(html).toContain('aria-label="Close banner"');
  });

  it("hides the decorative marks from a screen reader", () => {
    const marks = html.match(/<svg/g)?.length ?? 0;
    expect(marks).toBeGreaterThan(0);
    expect(html.match(/<svg aria-hidden="true"/g)).toHaveLength(marks);
  });
});

describe("the marquee it is built on", () => {
  it("asks for at least two copies however wide the phrase is", () => {
    expect(marqueeRepeats(100, 1000)).toBeGreaterThanOrEqual(2);
  });
});
