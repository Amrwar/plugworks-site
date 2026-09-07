import { describe, expect, it } from "vitest";
import {
  copyrightLine,
  copyrightYear,
  daysInMonth,
  formatIsoDate,
  isIsoDate,
  isLeapYear,
  isoDateParts,
  isoYear,
} from "./dates";

describe("the copyright year", () => {
  it("reads the year from the clock it is given", () => {
    expect(copyrightYear(new Date("2031-06-01T00:00:00Z"))).toBe(2031);
  });

  it("uses UTC, so the last evening of the year does not roll back", () => {
    expect(copyrightYear(new Date("2031-12-31T23:30:00Z"))).toBe(2031);
  });

  it("rolls over on the first instant of the new year", () => {
    expect(copyrightYear(new Date("2032-01-01T00:00:00Z"))).toBe(2032);
  });

  it("defaults to now when no clock is passed", () => {
    expect(copyrightYear()).toBe(new Date().getUTCFullYear());
  });
});

describe("the copyright line", () => {
  it("names the owner and the year", () => {
    expect(copyrightLine("Plugworks", new Date("2030-02-02T00:00:00Z"))).toBe(
      "© 2030 Plugworks. All rights reserved."
    );
  });

  it("starts with the copyright sign", () => {
    expect(copyrightLine("Plugworks").startsWith("©")).toBe(true);
  });
});

describe("reading a plain date", () => {
  it("pulls the three parts out as numbers", () => {
    expect(isoDateParts("2025-02-11")).toEqual({ year: 2025, month: 2, day: 11 });
  });

  it("ignores surrounding whitespace", () => {
    expect(isoDateParts("  2025-02-11  ")).toEqual({ year: 2025, month: 2, day: 11 });
  });

  it("reads the first of a month without dropping a day", () => {
    expect(isoDateParts("2025-01-01")).toEqual({ year: 2025, month: 1, day: 1 });
  });

  it("does not go through Date, so a timezone cannot move the day", () => {
    const original = process.env.TZ;
    try {
      // Anywhere west of Greenwich, `new Date("2025-01-01").getDate()` is 31.
      process.env.TZ = "America/Los_Angeles";
      expect(isoDateParts("2025-01-01")?.day).toBe(1);
      process.env.TZ = "Pacific/Kiritimati";
      expect(isoDateParts("2025-01-01")?.day).toBe(1);
    } finally {
      process.env.TZ = original;
    }
  });

  it("rejects a month that does not exist", () => {
    expect(isoDateParts("2025-13-01")).toBeUndefined();
    expect(isoDateParts("2025-00-01")).toBeUndefined();
  });

  it("rejects a day the month does not have", () => {
    expect(isoDateParts("2025-02-29")).toBeUndefined();
    expect(isoDateParts("2025-04-31")).toBeUndefined();
    expect(isoDateParts("2025-01-00")).toBeUndefined();
  });

  it("accepts the twenty-ninth of February in a leap year", () => {
    expect(isoDateParts("2024-02-29")).toEqual({ year: 2024, month: 2, day: 29 });
  });

  it("rejects anything that is not the plain date shape", () => {
    for (const value of ["", "2025", "2025-2-11", "11-02-2025", "2025/02/11", "yesterday"]) {
      expect(isoDateParts(value)).toBeUndefined();
    }
  });

  it("rejects a datetime, which is not what this field carries", () => {
    expect(isoDateParts("2025-02-11T00:00:00Z")).toBeUndefined();
  });
});

describe("the length of a month", () => {
  it("knows the thirty-day months", () => {
    expect([4, 6, 9, 11].map((month) => daysInMonth(2025, month))).toEqual([30, 30, 30, 30]);
  });

  it("knows the thirty-one-day months", () => {
    expect([1, 3, 5, 7, 8, 10, 12].map((month) => daysInMonth(2025, month))).toEqual([
      31, 31, 31, 31, 31, 31, 31,
    ]);
  });

  it("gives February an extra day in a leap year", () => {
    expect(daysInMonth(2024, 2)).toBe(29);
    expect(daysInMonth(2025, 2)).toBe(28);
  });
});

describe("leap years", () => {
  it("counts every fourth year", () => {
    expect(isLeapYear(2024)).toBe(true);
  });

  it("does not count a century", () => {
    expect(isLeapYear(1900)).toBe(false);
  });

  it("counts a four-hundredth year", () => {
    expect(isLeapYear(2000)).toBe(true);
  });
});

describe("checking a plain date", () => {
  it("accepts a real date", () => {
    expect(isIsoDate("2026-01-27")).toBe(true);
  });

  it("rejects one that only looks like a date", () => {
    expect(isIsoDate("2026-02-31")).toBe(false);
  });
});

describe("writing a plain date out", () => {
  it("writes the day, the month in words and the year", () => {
    expect(formatIsoDate("2025-02-11")).toBe("11 February 2025");
  });

  it("does not pad the day", () => {
    expect(formatIsoDate("2025-05-02")).toBe("2 May 2025");
  });

  it("names December rather than running off the end of the table", () => {
    expect(formatIsoDate("2025-12-31")).toBe("31 December 2025");
  });

  it("names January rather than falling off the front of the table", () => {
    expect(formatIsoDate("2025-01-31")).toBe("31 January 2025");
  });

  it("refuses a date that does not exist instead of printing undefined", () => {
    expect(() => formatIsoDate("2025-13-40")).toThrow(/YYYY-MM-DD/);
  });

  it("refuses an empty value", () => {
    expect(() => formatIsoDate("")).toThrow(/YYYY-MM-DD/);
  });
});

describe("the year of a plain date", () => {
  it("reads the year", () => {
    expect(isoYear("2026-01-27")).toBe(2026);
  });

  it("refuses a value that is not a date", () => {
    expect(() => isoYear("last spring")).toThrow(/YYYY-MM-DD/);
  });
});
