/** One office, as shown on the locations section. */
export type Location = {
  country: string;
  city: string;
  description: string;
  /** Flag emoji standing in for a photograph. */
  flag: string;
  /** Tailwind colour token the card is tinted with. */
  accent: string;
};

/** Where Plugworks works from. */
export const LOCATIONS: readonly Location[] = [
  {
    country: "Egypt",
    city: "Cairo",
    description:
      "Our creative hub in the heart of the Middle East, where ancient inspiration meets modern innovation.",
    flag: "🇪🇬",
    accent: "plug-spark",
  },
  {
    country: "UAE",
    city: "Dubai",
    description:
      "Our production powerhouse in the city of the future, connecting brands to global audiences.",
    flag: "🇦🇪",
    accent: "plug-electric",
  },
] as const;

/** One office written the way an address reads: "Cairo, Egypt". */
export function officeAddress(location: Location): string {
  return `${location.city}, ${location.country}`;
}

/**
 * Every office on a single line.
 *
 * The contact panel had "Cairo, Egypt • Dubai, UAE" typed into its markup, so
 * opening a third office meant remembering to edit a string that lives
 * nowhere near this data. Reading it from the list means it cannot be
 * forgotten, and the separator stays the caller's choice.
 */
export function officeLine(separator = " • "): string {
  return LOCATIONS.map(officeAddress).join(separator);
}

/** The countries the studio works from, in order and without repeats. */
export function officeCountries(): string[] {
  return Array.from(new Set(LOCATIONS.map((location) => location.country)));
}
