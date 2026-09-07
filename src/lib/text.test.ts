import { describe, expect, it } from "vitest";
import {
  excerpt,
  initials,
  listSentence,
  readingMinutes,
  slugify,
  truncateOnWord,
  wordCount,
} from "./text";

describe("slugifying a title", () => {
  it("lower-cases and hyphenates", () => {
    expect(slugify("Lighting the Nile Tower")).toBe("lighting-the-nile-tower");
  });

  it("folds accents rather than dropping the letter", () => {
    expect(slugify("Café Culture")).toBe("cafe-culture");
  });

  it("collapses runs of punctuation into one hyphen", () => {
    expect(slugify("Twelve Clinics — One Morning!")).toBe("twelve-clinics-one-morning");
  });

  it("never starts or ends with a hyphen", () => {
    expect(slugify("  --Hello--  ")).toBe("hello");
  });

  it("keeps digits", () => {
    expect(slugify("A350 Cabin")).toBe("a350-cabin");
  });

  it("returns an empty string when there is nothing to keep", () => {
    expect(slugify("!!!")).toBe("");
  });

  it("is stable when applied twice", () => {
    const once = slugify("Kingfisher Rebrand Rollout");
    expect(slugify(once)).toBe(once);
  });
});

describe("counting words", () => {
  it("counts the words in a sentence", () => {
    expect(wordCount("one two three")).toBe(3);
  });

  it("ignores padding", () => {
    expect(wordCount("   one   two   ")).toBe(2);
  });

  it("counts nothing in an empty string", () => {
    expect(wordCount("   ")).toBe(0);
  });

  it("treats newlines as separators", () => {
    expect(wordCount("one\ntwo\nthree")).toBe(3);
  });
});

describe("reading time", () => {
  it("rounds up to the next minute", () => {
    expect(readingMinutes(["word ".repeat(201)], 200)).toBe(2);
  });

  it("never reports less than a minute", () => {
    expect(readingMinutes(["a handful of words"])).toBe(1);
  });

  it("adds the paragraphs together", () => {
    const half = "word ".repeat(100);
    expect(readingMinutes([half, half], 200)).toBe(1);
    expect(readingMinutes([half, half, half], 200)).toBe(2);
  });

  it("copes with an empty story", () => {
    expect(readingMinutes([])).toBe(1);
  });

  it("copes with a nonsense reading speed", () => {
    expect(readingMinutes(["one two three"], 0)).toBeGreaterThanOrEqual(1);
  });
});

describe("truncating on a word boundary", () => {
  it("leaves text that already fits completely alone", () => {
    expect(truncateOnWord("Short enough.", 120)).toBe("Short enough.");
  });

  it("never returns more characters than the limit allows", () => {
    for (const limit of [0, 1, 2, 5, 13, 40]) {
      expect(truncateOnWord("alpha bravo charlie delta echo", limit).length).toBeLessThanOrEqual(
        Math.max(1, limit)
      );
    }
  });

  it("does not return nearly the whole string when the limit is zero", () => {
    expect(truncateOnWord("alpha bravo charlie", 0)).toBe("…");
  });

  it("cuts between words rather than inside one", () => {
    expect(truncateOnWord("alpha bravo charlie", 14)).toBe("alpha bravo…");
  });

  it("falls back to a hard cut when the first word is longer than the limit", () => {
    expect(truncateOnWord("antidisestablishmentarianism now", 10)).toBe("antidises…");
  });

  it("collapses whitespace before measuring", () => {
    expect(truncateOnWord("one    two\n\nthree", 160)).toBe("one two three");
  });

  it("drops a full stop left sitting against the ellipsis", () => {
    expect(truncateOnWord("Ready. Steady. Go for it now", 15)).toBe("Ready…");
  });

  it("drops a question mark left sitting against the ellipsis", () => {
    expect(truncateOnWord("Who? Somebody nobody has met", 12)).toBe("Who…");
  });

  it("drops an exclamation mark left sitting against the ellipsis", () => {
    expect(truncateOnWord("Stop! Somebody nobody has met", 13)).toBe("Stop…");
  });

  it("drops a whole run of punctuation, not just the last character", () => {
    expect(truncateOnWord("Wait... something else entirely", 15)).toBe("Wait…");
  });
});

describe("excerpting", () => {
  it("leaves short text alone", () => {
    expect(excerpt("Short enough.", 120)).toBe("Short enough.");
  });

  it("stops on a word boundary", () => {
    const out = excerpt("alpha bravo charlie delta", 14);
    expect(out.endsWith("…")).toBe(true);
    expect(out).not.toContain("charli…");
  });

  it("stays within the limit", () => {
    expect(excerpt("word ".repeat(80), 40).length).toBeLessThanOrEqual(40);
  });

  it("collapses whitespace first", () => {
    expect(excerpt("one    two", 120)).toBe("one two");
  });

  it("does not leave a dangling comma before the ellipsis", () => {
    expect(excerpt("alpha, bravo charlie", 8)).not.toContain(",…");
  });
});

describe("listing names in a sentence", () => {
  it("returns nothing for an empty list", () => {
    expect(listSentence([])).toBe("");
  });

  it("returns a single name as itself", () => {
    expect(listSentence(["Cairo"])).toBe("Cairo");
  });

  it("joins two names with and", () => {
    expect(listSentence(["Cairo", "Dubai"])).toBe("Cairo and Dubai");
  });

  it("uses commas and a final and for three", () => {
    expect(listSentence(["a", "b", "c"])).toBe("a, b and c");
  });
});

describe("initials", () => {
  it("takes the first and last initial", () => {
    expect(initials("Nadia Farouk")).toBe("NF");
  });

  it("ignores middle names", () => {
    expect(initials("Yara Amal Habib")).toBe("YH");
  });

  it("returns one letter for a single name", () => {
    expect(initials("Prince")).toBe("P");
  });

  it("returns nothing for an empty name", () => {
    expect(initials("   ")).toBe("");
  });

  it("upper-cases what it finds", () => {
    expect(initials("omar zaki")).toBe("OZ");
  });
});
