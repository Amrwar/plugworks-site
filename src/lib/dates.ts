/**
 * The year to print in the copyright line.
 *
 * Taken from a clock passed in rather than read inside the component, so the
 * footer can be rendered for any moment and the behaviour can be tested
 * without waiting for a new year.
 */
export function copyrightYear(now: Date = new Date()): number {
  return now.getUTCFullYear();
}

/** The copyright line itself. */
export function copyrightLine(owner: string, now: Date = new Date()): string {
  return `© ${copyrightYear(now)} ${owner}. All rights reserved.`;
}

/** The months, spelled the way the site spells them. */
const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
] as const;

/** A calendar date pulled apart, all three parts as numbers. */
export type DateParts = { year: number; month: number; day: number };

/**
 * Reads a plain `YYYY-MM-DD` date, or returns undefined if it is not one.
 *
 * Deliberately not `new Date(value)`: that parses a bare date string as
 * midnight UTC and then reports it through the local clock, so anywhere west
 * of Greenwich `getDate()` hands back the day before. Nothing here goes near
 * a `Date`, so nothing here can shift by a day depending on where the site is
 * built.
 *
 * The shape is checked and so is the calendar: `2025-02-30` and `2025-13-01`
 * both come back undefined rather than being quietly formatted into nonsense.
 */
export function isoDateParts(value: string): DateParts | undefined {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim());
  if (!match) return undefined;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  if (month < 1 || month > 12) return undefined;
  if (day < 1 || day > daysInMonth(year, month)) return undefined;
  return { year, month, day };
}

/** How many days a month has, leap years included. */
export function daysInMonth(year: number, month: number): number {
  if (month === 2) return isLeapYear(year) ? 29 : 28;
  return [4, 6, 9, 11].includes(month) ? 30 : 31;
}

/** Whether a year is a leap year, by the rule the calendar actually uses. */
export function isLeapYear(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

/** Whether a string is a real `YYYY-MM-DD` calendar date. */
export function isIsoDate(value: string): boolean {
  return isoDateParts(value) !== undefined;
}

/**
 * A date written the way the site shows it, e.g. "11 February 2025".
 *
 * Throws on anything that is not a real date. This is content that ships with
 * the build, so a typo in it should stop the build rather than reach a reader
 * as "40 undefined 2025" — which is what the hand-rolled version in the
 * journal data printed, because it indexed a month table with whatever number
 * the string happened to contain.
 */
export function formatIsoDate(value: string): string {
  const parts = isoDateParts(value);
  if (!parts) throw new Error(`Not a YYYY-MM-DD date: ${JSON.stringify(value)}`);
  return `${parts.day} ${MONTH_NAMES[parts.month - 1]} ${parts.year}`;
}

/** The year of a plain date, as a number. Throws on anything else. */
export function isoYear(value: string): number {
  const parts = isoDateParts(value);
  if (!parts) throw new Error(`Not a YYYY-MM-DD date: ${JSON.stringify(value)}`);
  return parts.year;
}
