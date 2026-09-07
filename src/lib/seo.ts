import { SITE } from "@/data/site";
import { truncateOnWord } from "@/lib/text";

/** The page title, kept consistent wherever a title is needed. */
export function pageTitle(section?: string): string {
  if (!section || section.trim() === "") return `${SITE.name} — ${SITE.tagline}`;
  return `${section.trim()} — ${SITE.name}`;
}

/** An absolute URL for a section of the one-page site. */
export function canonicalUrl(sectionId?: string): string {
  const base = SITE.url.replace(/\/+$/, "");
  const id = (sectionId ?? "").trim().replace(/^#/, "");
  return id === "" ? base : `${base}/#${id}`;
}

/**
 * An absolute URL for a page of the site.
 *
 * `canonicalUrl` builds fragments for the sections of the home page; this
 * builds paths for the pages that have their own route, so the two cannot be
 * confused at the call site. An empty path is the home page itself.
 */
export function pageUrl(path?: string): string {
  const base = SITE.url.replace(/\/+$/, "");
  const clean = (path ?? "").trim().replace(/^\/+/, "").replace(/\/+$/, "");
  return clean === "" ? base : `${base}/${clean}`;
}

/**
 * A description trimmed to something a search result will actually show.
 *
 * Cuts on a word boundary and adds an ellipsis, so a result never ends
 * mid-word; a description already short enough is returned untouched. The
 * cutting itself lives in `text.ts`, which is where the listing cards get
 * theirs from too.
 */
export function metaDescription(text: string = SITE.description, limit = 160): string {
  return truncateOnWord(text, limit);
}

/**
 * The OpenGraph fields, built once so the page and any future route agree.
 */
export function openGraph(section?: string) {
  return {
    title: pageTitle(section),
    description: metaDescription(),
    url: canonicalUrl(section),
    siteName: SITE.name,
    type: "website" as const,
  };
}
