/**
 * Turns a title into a URL segment.
 *
 * Accents are folded rather than dropped, so "Café" becomes "cafe" and not
 * "caf"; everything else that is not a letter or a digit becomes a single
 * hyphen, and the ends are trimmed so a slug never starts or finishes with one.
 */
export function slugify(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Words in a piece of prose, counted the way a reader would. */
export function wordCount(text: string): number {
  const trimmed = text.trim();
  return trimmed === "" ? 0 : trimmed.split(/\s+/).length;
}

/**
 * Roughly how long a case study takes to read.
 *
 * Two hundred words a minute, rounded up, and never less than a minute — "0
 * min read" helps nobody.
 */
export function readingMinutes(paragraphs: readonly string[], wordsPerMinute = 200): number {
  const words = paragraphs.reduce((total, paragraph) => total + wordCount(paragraph), 0);
  return Math.max(1, Math.ceil(words / Math.max(1, wordsPerMinute)));
}

/**
 * Cuts text to a length, stopping on a word boundary.
 *
 * Whitespace is collapsed first so the count means what a reader would think
 * it means, text that already fits comes back untouched - no pointless
 * ellipsis - and any punctuation left dangling at the cut is dropped rather
 * than printed against the ellipsis.
 *
 * This was written out twice, once here as `excerpt` and once in `seo.ts` as
 * `metaDescription`, and the two copies had drifted: the description trimmed
 * only a single `.,;:` and left `!`, `?` and runs like `...` sitting in front
 * of the ellipsis. One implementation, one behaviour.
 */
export function truncateOnWord(text: string, limit: number): string {
  const clean = text.trim().replace(/\s+/g, " ");
  if (clean.length <= limit) return clean;
  // A limit of zero or one leaves room for the ellipsis and nothing else;
  // `limit - 1` would otherwise become a negative slice and return almost the
  // whole string.
  const cut = clean.slice(0, Math.max(0, limit - 1));
  const lastSpace = cut.lastIndexOf(" ");
  const kept = lastSpace > 0 ? cut.slice(0, lastSpace) : cut;
  return `${kept.replace(/[.,;:!?]+$/, "")}…`;
}

/** A short excerpt of a summary, for a card or a listing. */
export function excerpt(text: string, limit = 120): string {
  return truncateOnWord(text, limit);
}

/** Joins names the way a sentence would: "a, b and c". */
export function listSentence(items: readonly string[]): string {
  if (items.length === 0) return "";
  if (items.length === 1) return items[0];
  return `${items.slice(0, -1).join(", ")} and ${items[items.length - 1]}`;
}

/** The initials a name is shown by where there is no photograph. */
export function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "";
  const letters = [parts[0], parts[parts.length - 1]].map((part) => part[0] ?? "");
  return Array.from(new Set(parts.length === 1 ? [letters[0]] : letters))
    .join("")
    .toUpperCase()
    .slice(0, 2);
}
