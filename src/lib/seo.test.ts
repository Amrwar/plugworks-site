import { describe, expect, it } from "vitest";
import { SITE } from "@/data/site";
import { canonicalUrl, metaDescription, openGraph, pageTitle, pageUrl } from "./seo";
import { excerpt } from "./text";

describe("the page title", () => {
  it("uses the tagline when no section is named", () => {
    expect(pageTitle()).toBe(`${SITE.name} — ${SITE.tagline}`);
  });

  it("falls back to the tagline for a blank section", () => {
    expect(pageTitle("   ")).toBe(pageTitle());
  });

  it("puts the section first when there is one", () => {
    expect(pageTitle("Services")).toBe(`Services — ${SITE.name}`);
  });

  it("trims the section it is given", () => {
    expect(pageTitle("  Services  ")).toBe(pageTitle("Services"));
  });
});

describe("the canonical url", () => {
  it("is the bare site for the page itself", () => {
    expect(canonicalUrl()).toBe(SITE.url.replace(/\/+$/, ""));
  });

  it("adds a fragment for a section", () => {
    expect(canonicalUrl("services")).toBe(`${SITE.url}/#services`);
  });

  it("accepts a section that already carries its hash", () => {
    expect(canonicalUrl("#services")).toBe(canonicalUrl("services"));
  });

  it("never doubles a slash", () => {
    expect(canonicalUrl("services")).not.toContain("//#");
  });
});

describe("the page url", () => {
  it("is the bare site url for the home page", () => {
    expect(pageUrl()).toBe(SITE.url.replace(/\/+$/, ""));
  });

  it("is the bare site url for an empty path", () => {
    expect(pageUrl("")).toBe(pageUrl());
  });

  it("builds a path, not a fragment", () => {
    expect(pageUrl("work")).toBe(`${SITE.url}/work`);
    expect(pageUrl("work")).not.toContain("#");
  });

  it("accepts a path that already carries its leading slash", () => {
    expect(pageUrl("/faq")).toBe(pageUrl("faq"));
  });

  it("drops a trailing slash", () => {
    expect(pageUrl("faq/")).toBe(pageUrl("faq"));
  });

  it("keeps a nested path intact", () => {
    expect(pageUrl("work/nile-tower-launch")).toBe(`${SITE.url}/work/nile-tower-launch`);
  });

  it("never doubles a slash", () => {
    expect(pageUrl("services").replace("https://", "")).not.toContain("//");
  });

  it("ignores surrounding whitespace", () => {
    expect(pageUrl("  about  ")).toBe(pageUrl("about"));
  });
});

describe("the meta description", () => {
  it("uses the studio description by default", () => {
    expect(metaDescription()).toBe(SITE.description.trim());
  });

  it("leaves a short description alone", () => {
    expect(metaDescription("Short enough.", 160)).toBe("Short enough.");
  });

  it("keeps within the limit when it has to cut", () => {
    expect(metaDescription("word ".repeat(80), 60).length).toBeLessThanOrEqual(60);
  });

  it("cuts on a word boundary rather than mid-word", () => {
    const out = metaDescription("alpha bravo charlie delta echo foxtrot", 20);
    expect(out.endsWith("…")).toBe(true);
    expect(out.replace("…", "").trim().split(" ").pop()).not.toBe("charli");
  });

  it("collapses runs of whitespace", () => {
    expect(metaDescription("one    two\n\nthree", 160)).toBe("one two three");
  });

  it("cuts a description exactly the way a card excerpt is cut", () => {
    const text =
      "Plugworks is a creative and production house. Ready? Wait... there is rather more to say than this.";
    for (const limit of [12, 20, 45, 52, 60]) {
      expect(metaDescription(text, limit)).toBe(excerpt(text, limit));
    }
  });

  it("does not print a question mark against the ellipsis", () => {
    expect(metaDescription("Who? Somebody nobody has met", 12)).toBe("Who\u2026");
  });

  it("does not leave a run of dots against the ellipsis", () => {
    expect(metaDescription("Wait... something else entirely", 15)).toBe("Wait\u2026");
  });

  it("does not return nearly the whole description when the limit is zero", () => {
    expect(metaDescription("alpha bravo charlie", 0)).toBe("\u2026");
  });
});

describe("the OpenGraph fields", () => {
  it("agrees with the page title", () => {
    expect(openGraph().title).toBe(pageTitle());
  });

  it("agrees with the canonical url", () => {
    expect(openGraph().url).toBe(canonicalUrl());
  });

  it("agrees with the meta description", () => {
    expect(openGraph().description).toBe(metaDescription());
  });

  it("names the site", () => {
    expect(openGraph().siteName).toBe(SITE.name);
  });

  it("follows a section through to the title and url", () => {
    const og = openGraph("Services");
    expect(og.title).toBe(pageTitle("Services"));
    expect(og.url).toBe(canonicalUrl("Services"));
  });

  it("is always a website", () => {
    expect(openGraph().type).toBe("website");
  });
});
