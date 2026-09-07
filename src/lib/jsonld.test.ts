import { describe, expect, it } from "vitest";
import { JOURNAL } from "@/data/journal";
import { LOCATIONS } from "@/data/locations";
import { SERVICES } from "@/data/services";
import { SITE } from "@/data/site";
import { serviceDetail } from "@/data/service-details";
import { TEAM, teamMember } from "@/data/team";
import { CASE_STUDIES } from "@/data/work";
import {
  breadcrumbJsonLd,
  caseStudyJsonLd,
  journalJsonLd,
  jsonLdString,
  organizationJsonLd,
  organizationJsonLdString,
  serviceJsonLd,
} from "./jsonld";

describe("the organization markup", () => {
  const doc = organizationJsonLd();

  it("declares the schema.org context", () => {
    expect(doc["@context"]).toBe("https://schema.org");
  });

  it("is an Organization", () => {
    expect(doc["@type"]).toBe("Organization");
  });

  it("carries the studio name, url and address", () => {
    expect(doc.name).toBe(SITE.name);
    expect(doc.url).toBe(SITE.url);
    expect(doc.email).toBe(SITE.email);
  });

  it("lists one postal address per office", () => {
    expect(doc.address).toHaveLength(LOCATIONS.length);
  });

  it("takes each city and country from the locations data", () => {
    expect(doc.address.map((a) => a.addressLocality)).toEqual(LOCATIONS.map((l) => l.city));
    expect(doc.address.map((a) => a.addressCountry)).toEqual(LOCATIONS.map((l) => l.country));
  });

  it("offers one entry per service", () => {
    expect(doc.makesOffer).toHaveLength(SERVICES.length);
  });

  it("names each offered service from the services data", () => {
    expect(doc.makesOffer.map((o) => o.itemOffered.name)).toEqual(SERVICES.map((s) => s.title));
  });

  it("serialises to JSON a script tag can carry", () => {
    expect(() => JSON.parse(organizationJsonLdString())).not.toThrow();
  });

  it("round-trips without losing anything", () => {
    expect(JSON.parse(organizationJsonLdString())).toEqual(doc);
  });
});

describe("the breadcrumb document", () => {
  const steps = [
    { label: "Home", path: "" },
    { label: "Work", path: "work" },
    { label: "Nile Tower" },
  ];

  it("declares itself a breadcrumb list", () => {
    expect(breadcrumbJsonLd(steps)["@type"]).toBe("BreadcrumbList");
  });

  it("carries one item per step", () => {
    expect(breadcrumbJsonLd(steps).itemListElement).toHaveLength(steps.length);
  });

  it("numbers the steps from one", () => {
    const positions = breadcrumbJsonLd(steps).itemListElement.map((item) => item.position);
    expect(positions).toEqual([1, 2, 3]);
  });

  it("names every step", () => {
    const names = breadcrumbJsonLd(steps).itemListElement.map((item) => item.name);
    expect(names).toEqual(["Home", "Work", "Nile Tower"]);
  });

  it("gives an absolute url to every step that has a path", () => {
    const items = breadcrumbJsonLd(steps).itemListElement;
    expect(items[1]).toHaveProperty("item", `${SITE.url}/work`);
  });

  it("leaves the current page without a url", () => {
    const last = breadcrumbJsonLd(steps).itemListElement[2];
    expect(last).not.toHaveProperty("item");
  });

  it("copes with an empty trail", () => {
    expect(breadcrumbJsonLd([]).itemListElement).toEqual([]);
  });
});

describe("the service document", () => {
  const service = SERVICES[0];

  it("declares itself a service", () => {
    expect(serviceJsonLd(service)["@type"]).toBe("Service");
  });

  it("names the service and points at its page", () => {
    expect(serviceJsonLd(service).name).toBe(service.title);
    expect(serviceJsonLd(service).url).toBe(`${SITE.url}/services/${service.id}`);
  });

  it("credits the studio as the provider", () => {
    expect(serviceJsonLd(service).provider.name).toBe(SITE.name);
  });

  it("quotes the starting price in dollars", () => {
    const offers = serviceJsonLd(service).offers;
    expect(offers?.priceCurrency).toBe("USD");
    expect(offers?.price).toBe(serviceDetail(service.id)?.fromUsd);
  });

  it("builds a document for every service the site shows", () => {
    for (const entry of SERVICES) {
      expect(serviceJsonLd(entry).url).toContain(entry.id);
    }
  });
});

describe("the case study document", () => {
  const study = CASE_STUDIES[0];

  it("declares itself a creative work", () => {
    expect(caseStudyJsonLd(study)["@type"]).toBe("CreativeWork");
  });

  it("names the study and points at its page", () => {
    expect(caseStudyJsonLd(study).name).toBe(study.title);
    expect(caseStudyJsonLd(study).url).toBe(`${SITE.url}/work/${study.slug}`);
  });

  it("records the year as a string, the way a date wants to be read", () => {
    expect(caseStudyJsonLd(study).dateCreated).toBe(String(study.year));
  });

  it("records where it was made", () => {
    expect(caseStudyJsonLd(study).locationCreated.name).toBe(study.city);
  });

  it("builds a document for every study on the site", () => {
    for (const entry of CASE_STUDIES) {
      expect(caseStudyJsonLd(entry).url).toContain(entry.slug);
    }
  });
});

describe("jsonLdString", () => {
  it("produces parseable json", () => {
    const parsed = JSON.parse(jsonLdString(breadcrumbJsonLd([{ label: "Home", path: "" }])));
    expect(parsed["@type"]).toBe("BreadcrumbList");
  });

  it("emits a single line, so it can sit in a script tag", () => {
    expect(jsonLdString(serviceJsonLd(SERVICES[0]))).not.toContain("\n");
  });
});

describe("the journal note markup", () => {
  const entry = JOURNAL[0];
  const doc = journalJsonLd(entry);

  it("declares the schema.org context", () => {
    expect(doc["@context"]).toBe("https://schema.org");
  });

  it("is a BlogPosting rather than a generic creative work", () => {
    expect(doc["@type"]).toBe("BlogPosting");
  });

  it("uses the note title as the headline", () => {
    expect(doc.headline).toBe(entry.title);
  });

  it("describes the note with its own standfirst", () => {
    expect(doc.description).toBe(entry.standfirst);
  });

  it("points at the page the note is actually served from", () => {
    expect(doc.url).toBe(`${SITE.url}/journal/${entry.slug}`);
  });

  it("publishes the date exactly as the time element carries it", () => {
    expect(doc.datePublished).toBe(entry.published);
    expect(doc.datePublished).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it("credits the person the byline credits", () => {
    const author = teamMember(entry.authorId);
    expect(doc.author).toEqual({
      "@type": "Person",
      name: author?.name,
      jobTitle: author?.role,
    });
  });

  it("falls back to the studio when the note credits nobody on the team", () => {
    const orphan = journalJsonLd({ ...entry, authorId: "nobody-here" });
    expect(orphan.author).toEqual({
      "@type": "Organization",
      name: SITE.name,
      url: SITE.url,
    });
  });

  it("names the studio as the publisher", () => {
    expect(doc.publisher).toEqual({ "@type": "Organization", name: SITE.name, url: SITE.url });
  });

  it("carries the tags the page files the note under", () => {
    expect(doc.keywords).toEqual([...entry.tags]);
  });

  it("counts the words in the body rather than guessing", () => {
    expect(doc.wordCount).toBe(
      entry.body.reduce((total, paragraph) => total + paragraph.trim().split(/\s+/).length, 0)
    );
  });

  it("states the reading time in the duration format the vocabulary wants", () => {
    expect(doc.timeRequired).toMatch(/^PT\d+M$/);
  });

  it("refuses a note whose date is not a real one", () => {
    expect(() => journalJsonLd({ ...entry, published: "2025-02-31" })).toThrow(/usable date/);
  });

  it("builds a document for every note the site serves", () => {
    for (const note of JOURNAL) {
      const built = journalJsonLd(note);
      expect(built.headline).toBe(note.title);
      expect(JSON.parse(jsonLdString(built))).toEqual(built);
    }
  });

  it("only ever credits somebody the studio data knows about", () => {
    for (const note of JOURNAL) {
      const built = journalJsonLd(note);
      if (built.author["@type"] === "Person") {
        expect(TEAM.map((member) => member.name)).toContain(built.author.name);
      }
    }
  });
});
