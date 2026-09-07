import { describe, expect, it } from "vitest";

import {
  JOURNAL,
  journalByAuthor,
  journalByTag,
  journalEntry,
  journalTags,
  moreReading,
  orderedJournal,
  publishedLabel,
  publishedYear,
} from "./journal";
import { TEAM } from "./team";
import { isIsoDate } from "@/lib/dates";

describe("JOURNAL", () => {
  it("gives every note a unique slug", () => {
    const slugs = JOURNAL.map((entry) => entry.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it("uses url-safe slugs", () => {
    for (const entry of JOURNAL) {
      expect(entry.slug).toMatch(/^[a-z][a-z0-9-]*$/);
    }
  });

  it("dates every note as a plain calendar day", () => {
    for (const entry of JOURNAL) {
      expect(entry.published).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    }
  });

  it("dates every note as a day the calendar actually has", () => {
    // The shape check above passes for "2025-02-31" too, which is how a typo
    // in a date gets as far as the page.
    for (const entry of JOURNAL) {
      expect(isIsoDate(entry.published)).toBe(true);
    }
  });

  it("credits every note to somebody on the team", () => {
    const ids = TEAM.map((member) => member.id);
    for (const entry of JOURNAL) {
      expect(ids).toContain(entry.authorId);
    }
  });

  it("writes a standfirst that reads as a sentence", () => {
    for (const entry of JOURNAL) {
      expect(entry.standfirst.trim().length).toBeGreaterThan(60);
      expect(entry.standfirst.trim().endsWith(".")).toBe(true);
    }
  });

  it("gives every note a body of at least three paragraphs", () => {
    for (const entry of JOURNAL) {
      expect(entry.body.length).toBeGreaterThanOrEqual(3);
    }
  });

  it("tags every note, but never with more than three", () => {
    for (const entry of JOURNAL) {
      expect(entry.tags.length).toBeGreaterThan(0);
      expect(entry.tags.length).toBeLessThanOrEqual(3);
    }
  });

  it("keeps tags lower case, so two spellings cannot split a tag", () => {
    for (const entry of JOURNAL) {
      for (const tag of entry.tags) {
        expect(tag).toBe(tag.toLowerCase());
      }
    }
  });

  it("never repeats a tag within one note", () => {
    for (const entry of JOURNAL) {
      expect(new Set(entry.tags).size).toBe(entry.tags.length);
    }
  });
});

describe("orderedJournal", () => {
  it("puts the newest note first", () => {
    const dates = orderedJournal().map((entry) => entry.published);
    expect(dates).toEqual([...dates].sort().reverse());
  });

  it("breaks a same-day tie on the title", () => {
    const sameDay = [
      { ...JOURNAL[0], slug: "zed", title: "Zed", published: "2025-01-01" },
      { ...JOURNAL[0], slug: "alpha", title: "Alpha", published: "2025-01-01" },
    ];
    expect(orderedJournal(sameDay).map((entry) => entry.slug)).toEqual(["alpha", "zed"]);
  });

  it("leaves the source list alone", () => {
    const before = JOURNAL.map((entry) => entry.slug);
    orderedJournal();
    expect(JOURNAL.map((entry) => entry.slug)).toEqual(before);
  });

  it("returns every note", () => {
    expect(orderedJournal()).toHaveLength(JOURNAL.length);
  });
});

describe("journalEntry", () => {
  it("finds a note by slug", () => {
    expect(journalEntry(JOURNAL[0].slug)?.title).toBe(JOURNAL[0].title);
  });

  it("returns undefined for a slug nobody published", () => {
    expect(journalEntry("not-a-note")).toBeUndefined();
  });
});

describe("journalByTag", () => {
  it("returns only notes carrying that tag", () => {
    for (const tag of journalTags()) {
      for (const entry of journalByTag(tag)) {
        expect(entry.tags).toContain(tag);
      }
    }
  });

  it("keeps the newest first", () => {
    const dates = journalByTag("process").map((entry) => entry.published);
    expect(dates).toEqual([...dates].sort().reverse());
  });

  it("returns nothing for a tag nobody used", () => {
    expect(journalByTag("skywriting")).toEqual([]);
  });
});

describe("journalTags", () => {
  it("lists each tag once, alphabetically", () => {
    const tags = journalTags();
    expect(tags).toEqual(Array.from(new Set(tags)).sort());
  });

  it("covers every tag on every note", () => {
    for (const entry of JOURNAL) {
      for (const tag of entry.tags) {
        expect(journalTags()).toContain(tag);
      }
    }
  });

  it("names only tags that really have a note", () => {
    for (const tag of journalTags()) {
      expect(journalByTag(tag).length).toBeGreaterThan(0);
    }
  });
});

describe("journalByAuthor", () => {
  it("returns only that author's notes", () => {
    const author = JOURNAL[0].authorId;
    for (const entry of journalByAuthor(author)) {
      expect(entry.authorId).toBe(author);
    }
  });

  it("returns nothing for somebody who has not written", () => {
    expect(journalByAuthor("nobody")).toEqual([]);
  });
});

describe("moreReading", () => {
  it("never suggests the note being read", () => {
    for (const entry of JOURNAL) {
      expect(moreReading(entry.slug).map((other) => other.slug)).not.toContain(entry.slug);
    }
  });

  it("suggests the newest notes first", () => {
    const dates = moreReading(JOURNAL[0].slug, 3).map((entry) => entry.published);
    expect(dates).toEqual([...dates].sort().reverse());
  });

  it("honours the limit it is given", () => {
    expect(moreReading(JOURNAL[0].slug, 1)).toHaveLength(1);
  });

  it("returns nothing when the limit is zero", () => {
    expect(moreReading(JOURNAL[0].slug, 0)).toEqual([]);
  });

  it("never returns more notes than there are", () => {
    expect(moreReading(JOURNAL[0].slug, 99)).toHaveLength(JOURNAL.length - 1);
  });

  it("returns everything when the slug is not one of ours", () => {
    expect(moreReading("no-such-note", 99)).toHaveLength(JOURNAL.length);
  });
});

describe("publishedYear", () => {
  it("reads the year off the date", () => {
    expect(publishedYear({ ...JOURNAL[0], published: "2025-02-11" })).toBe(2025);
  });

  it("returns a number for every note", () => {
    for (const entry of JOURNAL) {
      expect(Number.isInteger(publishedYear(entry))).toBe(true);
    }
  });

  it("refuses a date it cannot read rather than returning NaN", () => {
    expect(() => publishedYear({ ...JOURNAL[0], published: "soon" })).toThrow();
  });
});

describe("publishedLabel", () => {
  it("writes the date the way it is read aloud", () => {
    expect(publishedLabel({ ...JOURNAL[0], published: "2025-02-11" })).toBe("11 February 2025");
  });

  it("drops the leading zero from the day", () => {
    expect(publishedLabel({ ...JOURNAL[0], published: "2025-05-02" })).toBe("2 May 2025");
  });

  it("names the last month of the year correctly", () => {
    expect(publishedLabel({ ...JOURNAL[0], published: "2024-12-31" })).toBe("31 December 2024");
  });

  it("produces a label for every note", () => {
    for (const entry of JOURNAL) {
      expect(publishedLabel(entry)).not.toContain("undefined");
    }
  });

  it("refuses a date the calendar does not have rather than labelling it", () => {
    expect(() => publishedLabel({ ...JOURNAL[0], published: "2025-02-31" })).toThrow();
  });

  it("refuses a month outside the year rather than printing undefined", () => {
    expect(() => publishedLabel({ ...JOURNAL[0], published: "2025-13-01" })).toThrow();
  });
});
