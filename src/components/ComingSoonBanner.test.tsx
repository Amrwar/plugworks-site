import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import ComingSoonBanner from "./ComingSoonBanner";
import { marqueeItems, marqueeRepeats } from "@/lib/marquee";

const html = renderToStaticMarkup(<ComingSoonBanner />);

/** The scrolling run, which is decoration and hidden from assistive tech. */
const run = html.slice(html.indexOf('<div aria-hidden="true"'), html.indexOf("<button"));

/** Everything the banner offers that is not the scrolling run. */
const spoken = html.replace(run, "");

/** How many times a phrase appears in some markup. */
function count(markup: string, phrase: string): number {
  return markup.split(phrase).length - 1;
}

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
    expect(count(run, "Website Launching Soon")).toBeGreaterThanOrEqual(4);
  });

  it("renders the phrase the marquee builds rather than a second copy of it", () => {
    // The map used to throw its item away and hardcode the words underneath,
    // so the phrase could be changed in one place and not the other.
    const phrases = marqueeItems("Website Launching Soon", 4);
    expect(count(run, "Website Launching Soon")).toBe(phrases.length);
  });

  it("can be dismissed with a named button", () => {
    expect(html).toContain('aria-label="Close banner"');
  });

  it("leaves the close button out of the hidden run, so it stays reachable", () => {
    expect(run).not.toContain("Close banner");
  });

  it("hides the decorative marks from a screen reader", () => {
    const marks = html.match(/<svg/g)?.length ?? 0;
    expect(marks).toBeGreaterThan(0);
    expect(html.match(/<svg aria-hidden="true"/g)).toHaveLength(marks);
  });
});

describe("what a screen reader hears", () => {
  it("hides the scrolling run, which is the same sentence four times over", () => {
    expect(run).toContain('aria-hidden="true"');
  });

  it("says the message once instead of once per copy", () => {
    expect(count(spoken, "Website Launching Soon")).toBe(1);
    expect(count(spoken, "Get ready for something electric")).toBe(1);
  });

  it("says it in words rather than leaving it to the scrolling text", () => {
    expect(spoken).toContain("Website Launching Soon. Get ready for something electric.");
  });

  it("keeps the spoken copy off the screen", () => {
    const at = spoken.indexOf("Website Launching Soon");
    expect(spoken.lastIndexOf("sr-only", at)).toBeGreaterThan(-1);
  });
});

describe("the marquee it is built on", () => {
  it("asks for at least two copies however wide the phrase is", () => {
    expect(marqueeRepeats(100, 1000)).toBeGreaterThanOrEqual(2);
  });
});
