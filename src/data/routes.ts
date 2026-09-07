import { JOURNAL, orderedJournal, type JournalEntry } from "./journal";
import { CASE_STUDIES, orderedWork, type CaseStudy } from "./work";
import { SERVICES } from "./services";

/** One page the site serves, as the sitemap and the footer both see it. */
export type SiteRoute = {
  /** Path relative to the site root, without a leading slash. "" is home. */
  path: string;
  /** The label the footer and the breadcrumbs use. */
  label: string;
  /** How often the content behind it actually changes. */
  changeFrequency: "weekly" | "monthly" | "yearly";
  /** Sitemap priority, home being the only 1. */
  priority: number;
};

/**
 * The fixed pages, in navigation order.
 *
 * Generated pages — the case studies and the service pages — are appended by
 * `allRoutes`, so adding a case study adds a sitemap entry without anybody
 * remembering to edit two files.
 */
export const STATIC_ROUTES: readonly SiteRoute[] = [
  { path: "", label: "Home", changeFrequency: "monthly", priority: 1 },
  { path: "work", label: "Work", changeFrequency: "monthly", priority: 0.9 },
  { path: "services", label: "Services", changeFrequency: "monthly", priority: 0.8 },
  { path: "process", label: "Process", changeFrequency: "yearly", priority: 0.7 },
  { path: "about", label: "Studio", changeFrequency: "yearly", priority: 0.7 },
  { path: "journal", label: "Journal", changeFrequency: "weekly", priority: 0.6 },
  { path: "faq", label: "Questions", changeFrequency: "monthly", priority: 0.6 },
] as const;

/**
 * One route per case study, in the order the work index shows them.
 *
 * The order comes from `orderedWork` rather than being sorted again here.
 * This file used to sort by year and title alone, which quietly dropped the
 * featured-first rule the index applies: the moment a featured study is not
 * also the newest, the footer and the sitemap would have listed the work in a
 * different order from the page they link to, for no reason a reader could see.
 */
export function workRoutes(studies: readonly CaseStudy[] = CASE_STUDIES): SiteRoute[] {
  return orderedWork(studies).map((study) => ({
    path: `work/${study.slug}`,
    label: study.title,
    changeFrequency: "yearly" as const,
    priority: 0.5,
  }));
}

/** One route per service, in the order the services grid shows them. */
export function serviceRoutes(): SiteRoute[] {
  return SERVICES.map((service) => ({
    path: `services/${service.id}`,
    label: service.title,
    changeFrequency: "yearly" as const,
    priority: 0.5,
  }));
}

/**
 * One route per journal note, in the order the journal index shows them.
 *
 * Same reasoning as `workRoutes`: the copy of the sort that lived here had no
 * tie-break, so two notes published on the same day came out in whatever order
 * they happen to sit in the file while the index sorted them by title.
 */
export function journalRoutes(entries: readonly JournalEntry[] = JOURNAL): SiteRoute[] {
  return orderedJournal(entries).map((entry) => ({
    path: `journal/${entry.slug}`,
    label: entry.title,
    changeFrequency: "yearly" as const,
    priority: 0.4,
  }));
}

/** Every page the site serves, fixed pages first. */
export function allRoutes(): SiteRoute[] {
  return [...STATIC_ROUTES, ...serviceRoutes(), ...workRoutes(), ...journalRoutes()];
}

/** The path with its leading slash, which is what an `href` wants. */
export function href(route: SiteRoute): string {
  return route.path === "" ? "/" : `/${route.path}`;
}

/** Whether a path is one the site actually serves. */
export function isKnownRoute(path: string): boolean {
  const normalised = path.replace(/^\/+/, "").replace(/\/+$/, "");
  return allRoutes().some((route) => route.path === normalised);
}
