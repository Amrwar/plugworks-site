import { formatIsoDate, isoYear } from "@/lib/dates";

/** One note from the studio floor. */
export type JournalEntry = {
  /** Stable key, and the last part of the note's url. */
  slug: string;
  title: string;
  /** One sentence, used on the index and in the page description. */
  standfirst: string;
  /** The date it went up, as YYYY-MM-DD. */
  published: string;
  /** Who wrote it; matches an id in `team.ts`. */
  authorId: string;
  /** What it is about, lower case, no more than three. */
  tags: readonly string[];
  /** The note itself, one paragraph per entry. */
  body: readonly string[];
};

/**
 * The notes, newest last in the file and newest first on the page.
 *
 * Dates are plain `YYYY-MM-DD` strings rather than `Date` objects so that
 * nothing here depends on the timezone the site happens to be built in, and
 * so two notes published on the same day sort the same way every time.
 */
export const JOURNAL: readonly JournalEntry[] = [
  {
    slug: "briefs-that-describe-solutions",
    title: "Most briefs describe a solution",
    standfirst:
      "The brief that arrives is usually somebody's third idea, written up as a requirement. The useful conversation is about the first one.",
    published: "2025-02-11",
    authorId: "layla-mansour",
    tags: ["strategy", "process"],
    body: [
      "A brief lands asking for a launch film. Two questions in, it turns out the problem is that the sales team cannot explain the product in a meeting, and a film is what somebody thought would fix that.",
      "Sometimes a film really is the answer. Often it is a two-page explainer and a rehearsal. The only way to tell is to ask what has to be different afterwards, and to keep asking until the answer is something you could measure.",
      "This is why the first step of every project we run ends with a written problem statement rather than a moodboard. If we cannot get that signed, everything after it is decoration.",
    ],
  },
  {
    slug: "shooting-in-august",
    title: "What August does to a schedule",
    standfirst:
      "Heat is a production constraint, not a weather forecast. Here is how we plan around it in the Gulf.",
    published: "2025-05-02",
    authorId: "hana-said",
    tags: ["production"],
    body: [
      "Between June and September, an outdoor day here is not a twelve-hour day. It is two four-hour blocks with a hole in the middle, and any schedule that pretends otherwise buys itself a reshoot.",
      "So we build the day around the hole: interiors and pickups in the afternoon, the exteriors at either end, and a crew rota that assumes people will be slower than they are in March. Nobody is being precious. Concentration drops, and mistakes on a set cost more than an extra half day.",
      "The cost of planning for this is about eight per cent on the schedule. The cost of not planning for it is the whole shoot.",
    ],
  },
  {
    slug: "the-last-weekend",
    title: "Build for the last weekend",
    standfirst:
      "An installation is judged on the day it opens and used on the day it closes. Only one of those is a design problem.",
    published: "2025-09-19",
    authorId: "karim-lotfy",
    tags: ["digital", "production"],
    body: [
      "Opening night has the client, the crew and three technicians standing behind a curtain. Week eleven has a cleaner, a tired member of venue staff, and a screen nobody has power-cycled in a fortnight.",
      "So we test on the worst hardware we can find, leave the runbook printed on site rather than in an inbox, and make every interactive piece recover on its own after a power cut. None of that shows up in the render.",
      "The measure we care about is not how it looked at the launch. It is whether the piece was still running on the last weekend without anybody from the studio being in the building.",
    ],
  },
  {
    slug: "saying-no-to-scope",
    title: "The variation order you never send",
    standfirst:
      "Every exclusion we print on a service page is one argument we have already had, in advance, in writing.",
    published: "2026-01-27",
    authorId: "omar-farid",
    tags: ["money", "process"],
    body: [
      "The unhappy version of a project is the one where the scope quietly grows and the invoice grows behind it. By the time anybody says so out loud, there is a relationship to repair as well as a number to agree.",
      "The cheap fix is to write the exclusions down where the client reads them before signing, not in an annexe. Media buying is not in the film. Talent residuals are not in the film. Neither is a second edit for a market nobody mentioned.",
      "Clients almost never object to an exclusion in week one. They object to discovering it in week nine, and they are right to.",
    ],
  },
];

/** Every note, newest first, ties broken by title. */
export function orderedJournal(entries: readonly JournalEntry[] = JOURNAL): JournalEntry[] {
  return [...entries].sort((a, b) => {
    if (a.published !== b.published) return a.published < b.published ? 1 : -1;
    return a.title.localeCompare(b.title);
  });
}

/** One note, by its slug. */
export function journalEntry(slug: string): JournalEntry | undefined {
  return JOURNAL.find((entry) => entry.slug === slug);
}

/** The notes filed under a tag, newest first. */
export function journalByTag(tag: string): JournalEntry[] {
  return orderedJournal().filter((entry) => entry.tags.includes(tag));
}

/** Every tag used at least once, alphabetically. */
export function journalTags(): string[] {
  return Array.from(new Set(JOURNAL.flatMap((entry) => entry.tags))).sort();
}

/** The notes by one author, newest first. */
export function journalByAuthor(authorId: string): JournalEntry[] {
  return orderedJournal().filter((entry) => entry.authorId === authorId);
}

/** The most recent notes, newest first, without the one being read. */
export function moreReading(slug: string, limit = 2): JournalEntry[] {
  return orderedJournal()
    .filter((entry) => entry.slug !== slug)
    .slice(0, Math.max(0, limit));
}

/** The year a note was published, as a number. */
export function publishedYear(entry: JournalEntry): number {
  return isoYear(entry.published);
}

/**
 * The date written the way it is shown, e.g. "11 February 2025".
 *
 * The month table and the string-splitting that used to live here are now in
 * `lib/dates.ts`, where the parsing is checked: a `published` value that is
 * not a real calendar date stops the build instead of printing a month of
 * "undefined" into a `time` element.
 */
export function publishedLabel(entry: JournalEntry): string {
  return formatIsoDate(entry.published);
}
