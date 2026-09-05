import { describe, expect, it } from "vitest";
import { LOCATIONS, officeAddress, officeCountries, officeLine } from "./locations";

describe("where the studio works from", () => {
  it("names both offices", () => {
    expect(LOCATIONS.map((l) => l.city)).toEqual(["Cairo", "Dubai"]);
  });

  it("pairs each city with its country", () => {
    expect(LOCATIONS.map((l) => l.country)).toEqual(["Egypt", "UAE"]);
  });

  it("never lists the same city twice", () => {
    const cities = LOCATIONS.map((l) => l.city);
    expect(new Set(cities).size).toBe(cities.length);
  });

  it("gives each office a description", () => {
    for (const location of LOCATIONS) {
      expect(location.description.trim().length).toBeGreaterThan(30);
    }
  });

  it("carries a flag for each", () => {
    for (const location of LOCATIONS) {
      expect(location.flag.trim()).not.toBe("");
    }
  });

  it("tints each with a brand token", () => {
    for (const location of LOCATIONS) {
      expect(location.accent.startsWith("plug-")).toBe(true);
    }
  });
});

describe("officeAddress", () => {
  it("reads city first, then country", () => {
    expect(officeAddress(LOCATIONS[0])).toBe("Cairo, Egypt");
  });

  it("writes an address for every office", () => {
    for (const location of LOCATIONS) {
      expect(officeAddress(location)).toContain(location.city);
      expect(officeAddress(location)).toContain(location.country);
    }
  });
});

describe("officeLine", () => {
  it("puts both offices on one line", () => {
    expect(officeLine()).toBe("Cairo, Egypt • Dubai, UAE");
  });

  it("names every office it was given", () => {
    for (const location of LOCATIONS) {
      expect(officeLine()).toContain(officeAddress(location));
    }
  });

  it("separates them with a bullet by default", () => {
    expect(officeLine().split(" • ")).toHaveLength(LOCATIONS.length);
  });

  it("takes whatever separator the caller needs", () => {
    expect(officeLine(" and ")).toBe("Cairo, Egypt and Dubai, UAE");
  });

  it("leaves no separator dangling at either end", () => {
    expect(officeLine().trim()).toBe(officeLine());
    expect(officeLine()).not.toMatch(/•\s*$/);
  });
});

describe("officeCountries", () => {
  it("lists the countries in the order the offices are given", () => {
    expect(officeCountries()).toEqual(["Egypt", "UAE"]);
  });

  it("names a country once even if two offices share it", () => {
    expect(new Set(officeCountries()).size).toBe(officeCountries().length);
  });
});
