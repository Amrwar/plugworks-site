import { describe, expect, it } from "vitest";

import {
  STATIC_ROUTES,
  allRoutes,
  href,
  isKnownRoute,
  journalRoutes,
  serviceRoutes,
  workRoutes,
} from "./routes";
import { JOURNAL, orderedJournal, type JournalEntry } from "./journal";
import { CASE_STUDIES, orderedWork, type CaseStudy } from "./work";
import { SERVICES } from "./services";

/** A case study with only the fields the route builder actually reads set. */
function study(fields: Partial<CaseStudy> & Pick<CaseStudy, "slug">): CaseStudy {
  return {
    title: fields.slug,
    client: "A client",
    serviceId: SERVICES[0].id,
    city: "Cairo",
    year: 2025,
    summary: "A summary.",
    story: ["A paragraph."],
    results: [],
    credits: [],
    featured: false,
    ...fields,
  };
}

/** The same, for a journal note. */
function note(fields: Partial<JournalEntry> & Pick<JournalEntry, "slug">): JournalEntry {
  return {
    title: fields.slug,
    standfirst: "A standfirst.",
    published: "2025-01-01",
    authorId: "someone",
    tags: [],
    body: ["A paragraph."],
    ...fields,
  };
}

describe("STATIC_ROUTES", () => {
  it("starts at the home page", () => {
    expect(STATIC_ROUTES[0].path).toBe("");
  });

  it("gives the home page the only priority of one", () => {
    const tops = STATIC_ROUTES.filter((route) => route.priority === 1);
    expect(tops).toHaveLength(1);
    expect(tops[0].path).toBe("");
  });

  it("keeps every priority inside the range a sitemap allows", () => {
    for (const route of STATIC_ROUTES) {
      expect(route.priority).toBeGreaterThan(0);
      expect(route.priority).toBeLessThanOrEqual(1);
    }
  });

  it("never writes a leading slash into a path", () => {
    for (const route of STATIC_ROUTES) {
      expect(route.path.startsWith("/")).toBe(false);
    }
  });

  it("labels every page", () => {
    for (const route of STATIC_ROUTES) {
      expect(route.label.trim().length).toBeGreaterThan(0);
    }
  });
});

describe("workRoutes", () => {
  it("produces one route per case study", () => {
    expect(workRoutes()).toHaveLength(CASE_STUDIES.length);
  });

  it("lists the work in the order the work index does", () => {
    expect(workRoutes().map((route) => route.path)).toEqual(
      orderedWork().map((entry) => `work/${entry.slug}`)
    );
  });

  it("keeps featured work first even when it is not the newest", () => {
    const paths = workRoutes([
      study({ slug: "newest", year: 2030 }),
      study({ slug: "featured-but-older", year: 2019, featured: true }),
    ]).map((route) => route.path);
    expect(paths).toEqual(["work/featured-but-older", "work/newest"]);
  });

  it("puts the newer of two unfeatured studies first", () => {
    const paths = workRoutes([
      study({ slug: "older", year: 2019 }),
      study({ slug: "newer", year: 2030 }),
    ]).map((route) => route.path);
    expect(paths).toEqual(["work/newer", "work/older"]);
  });

  it("breaks a same-year tie on the title rather than on file order", () => {
    const paths = workRoutes([
      study({ slug: "zulu", title: "Zulu", year: 2025 }),
      study({ slug: "alpha", title: "Alpha", year: 2025 }),
    ]).map((route) => route.path);
    expect(paths).toEqual(["work/alpha", "work/zulu"]);
  });

  it("files each study under the work path", () => {
    for (const route of workRoutes()) {
      expect(route.path.startsWith("work/")).toBe(true);
    }
  });

  it("uses the study title as the label", () => {
    const labels = workRoutes().map((route) => route.label);
    for (const study of CASE_STUDIES) {
      expect(labels).toContain(study.title);
    }
  });
});

describe("serviceRoutes", () => {
  it("produces one route per service", () => {
    expect(serviceRoutes()).toHaveLength(SERVICES.length);
  });

  it("keeps the order of the services grid", () => {
    expect(serviceRoutes().map((route) => route.label)).toEqual(
      SERVICES.map((service) => service.title)
    );
  });

  it("files each service under the services path", () => {
    for (const route of serviceRoutes()) {
      expect(route.path.startsWith("services/")).toBe(true);
    }
  });
});

describe("allRoutes", () => {
  it("covers the fixed pages and every generated set", () => {
    expect(allRoutes()).toHaveLength(
      STATIC_ROUTES.length + SERVICES.length + CASE_STUDIES.length + JOURNAL.length
    );
  });

  it("never repeats a path", () => {
    const paths = allRoutes().map((route) => route.path);
    expect(new Set(paths).size).toBe(paths.length);
  });

  it("puts the fixed pages before the generated ones", () => {
    expect(allRoutes().slice(0, STATIC_ROUTES.length)).toEqual([...STATIC_ROUTES]);
  });
});

describe("href", () => {
  it("turns the home path into a single slash", () => {
    expect(href({ path: "", label: "Home", changeFrequency: "monthly", priority: 1 })).toBe("/");
  });

  it("puts a leading slash on every other path", () => {
    expect(href({ path: "faq", label: "Q", changeFrequency: "monthly", priority: 0.5 })).toBe(
      "/faq"
    );
  });

  it("never produces a double slash", () => {
    for (const route of allRoutes()) {
      expect(href(route)).not.toContain("//");
    }
  });
});

describe("isKnownRoute", () => {
  it("recognises a fixed page", () => {
    expect(isKnownRoute("/faq")).toBe(true);
  });

  it("recognises the home page", () => {
    expect(isKnownRoute("/")).toBe(true);
  });

  it("recognises a generated case study page", () => {
    expect(isKnownRoute(`/work/${CASE_STUDIES[0].slug}`)).toBe(true);
  });

  it("ignores a trailing slash", () => {
    expect(isKnownRoute("/process/")).toBe(true);
  });

  it("rejects a page the site does not serve", () => {
    expect(isKnownRoute("/careers")).toBe(false);
  });
});

describe("journalRoutes", () => {
  it("produces one route per note", () => {
    expect(journalRoutes()).toHaveLength(JOURNAL.length);
  });

  it("lists the notes in the order the journal index does", () => {
    expect(journalRoutes().map((route) => route.path)).toEqual(
      orderedJournal().map((entry) => `journal/${entry.slug}`)
    );
  });

  it("puts the newest note first", () => {
    const dates = journalRoutes().map(
      (route) => JOURNAL.find((entry) => `journal/${entry.slug}` === route.path)?.published ?? ""
    );
    expect(dates).toEqual([...dates].sort().reverse());
  });

  it("breaks a same-day tie on the title rather than on file order", () => {
    const paths = journalRoutes([
      note({ slug: "zulu", title: "Zulu", published: "2025-06-01" }),
      note({ slug: "alpha", title: "Alpha", published: "2025-06-01" }),
    ]).map((route) => route.path);
    expect(paths).toEqual(["journal/alpha", "journal/zulu"]);
  });

  it("files every note under the journal path", () => {
    for (const route of journalRoutes()) {
      expect(route.path.startsWith("journal/")).toBe(true);
    }
  });

  it("uses the note title as the label", () => {
    const labels = journalRoutes().map((route) => route.label);
    for (const entry of JOURNAL) {
      expect(labels).toContain(entry.title);
    }
  });

  it("is reachable through isKnownRoute", () => {
    for (const route of journalRoutes()) {
      expect(isKnownRoute(`/${route.path}`)).toBe(true);
    }
  });
});
