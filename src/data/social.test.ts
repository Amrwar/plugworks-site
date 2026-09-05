import { describe, expect, it } from "vitest";
import { SITE } from "./site";
import { SOCIAL_LINKS, socialLabel, socialLink } from "./social";

describe("the social profiles", () => {
  it("lists four of them", () => {
    expect(SOCIAL_LINKS).toHaveLength(4);
  });

  it("names every network the way a person would", () => {
    expect(SOCIAL_LINKS.map((l) => l.name)).toEqual([
      "Instagram",
      "LinkedIn",
      "Behance",
      "X",
    ]);
  });

  it("points every link at an absolute https url", () => {
    for (const link of SOCIAL_LINKS) {
      expect(link.href.startsWith("https://")).toBe(true);
    }
  });

  it("never repeats a destination", () => {
    const hrefs = SOCIAL_LINKS.map((l) => l.href);
    expect(new Set(hrefs).size).toBe(hrefs.length);
  });

  it("gives each a unique id", () => {
    const ids = SOCIAL_LINKS.map((l) => l.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

describe("socialLabel", () => {
  it("gives every icon-only link an accessible name", () => {
    for (const link of SOCIAL_LINKS) {
      expect(socialLabel(link).trim().length).toBeGreaterThan(3);
    }
  });

  it("names the studio in each label", () => {
    for (const link of SOCIAL_LINKS) {
      expect(socialLabel(link)).toContain(SITE.name);
    }
  });

  it("names the network in each label", () => {
    for (const link of SOCIAL_LINKS) {
      expect(socialLabel(link)).toContain(link.name);
    }
  });

  it("reads as a sentence rather than a slug", () => {
    expect(socialLabel(SOCIAL_LINKS[0])).toBe(`${SITE.name} on Instagram`);
  });

  it("tells the four links apart", () => {
    const labels = SOCIAL_LINKS.map(socialLabel);
    expect(new Set(labels).size).toBe(labels.length);
  });
});

describe("socialLink", () => {
  it("finds a profile by its id", () => {
    expect(socialLink("linkedin")?.name).toBe("LinkedIn");
  });

  it("returns nothing for a network the studio is not on", () => {
    expect(socialLink("myspace")).toBeUndefined();
  });

  it("finds every id the data declares", () => {
    for (const link of SOCIAL_LINKS) {
      expect(socialLink(link.id)).toBe(link);
    }
  });
});
