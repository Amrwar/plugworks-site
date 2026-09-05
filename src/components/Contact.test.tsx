import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import Contact from "./Contact";
import { officeLine } from "@/data/locations";
import { SERVICES } from "@/data/services";
import { SITE } from "@/data/site";
import { SOCIAL_LINKS, socialLabel } from "@/data/social";
import { ENQUIRY_FIELDS, serviceChoices } from "@/lib/enquiry";

const html = renderToStaticMarkup(<Contact />);

/** The opening tag of the element carrying `id`, attributes and all. */
function tagWithId(markup: string, id: string): string {
  const at = markup.indexOf(`id="${id}"`);
  return markup.slice(markup.lastIndexOf("<", at), markup.indexOf(">", at) + 1);
}

/** Every `value="..."` on an option, in the order the select offers them. */
function optionValues(markup: string): string[] {
  const select = markup.slice(markup.indexOf("<select"), markup.indexOf("</select>"));
  return Array.from(select.matchAll(/<option value="([^"]*)"/g)).map((m) => m[1]);
}

describe("Contact", () => {
  it("gives the section a heading it is labelled by", () => {
    expect(html).toContain('aria-labelledby="contact-heading"');
    expect(html).toContain('id="contact-heading"');
  });

  it("is reachable by the #contact anchor the navigation points at", () => {
    expect(html).toContain('id="contact"');
  });
});

describe("the studio details", () => {
  it("shows the address from the site data", () => {
    expect(html).toContain(SITE.email);
  });

  it("makes the email address something you can click", () => {
    expect(html).toContain(`href="mailto:${SITE.email}"`);
  });

  it("lists the offices from the locations data", () => {
    expect(html).toContain(officeLine());
  });

  it("links every social profile the studio keeps", () => {
    for (const link of SOCIAL_LINKS) {
      expect(html).toContain(`href="${link.href}"`);
    }
  });

  it("names each profile for a screen reader as well as on the page", () => {
    for (const link of SOCIAL_LINKS) {
      expect(html).toContain(`aria-label="${socialLabel(link)}"`);
    }
  });

  it("leaves no link pointing at nothing", () => {
    expect(html).not.toContain('href="#"');
  });

  it("opens the profiles without handing them the opener", () => {
    const profiles = SOCIAL_LINKS.length;
    expect(html.match(/rel="noreferrer"/g)).toHaveLength(profiles);
  });
});

describe("the enquiry form", () => {
  it("validates on its own terms rather than the browser's", () => {
    // React lowercases this one on the way out; the attribute is what matters.
    expect(html.toLowerCase()).toContain("novalidate");
  });

  it("submits with a real submit button", () => {
    expect(html).toContain('type="submit"');
  });

  it("binds a label to every field", () => {
    for (const field of ENQUIRY_FIELDS) {
      expect(html).toContain(`for="${field}"`);
      expect(html).toContain(`id="${field}"`);
    }
  });

  it("asks the browser to fill the fields it knows", () => {
    // Attribute names are case-insensitive, and React leaves this one camel-cased.
    const lower = html.toLowerCase();
    for (const hint of ["name", "email", "organization"]) {
      expect(lower).toContain(`autocomplete="${hint}"`);
    }
  });

  it("offers exactly the services the validator will accept", () => {
    expect(optionValues(html)).toEqual(serviceChoices());
  });

  it("shows each service under the title it is sold as", () => {
    for (const service of SERVICES) {
      expect(html).toContain(service.title);
    }
  });

  it("gives every field the id the form focuses it by when it is rejected", () => {
    // The submit handler looks the first bad field up by id; if a field ever
    // renders under a different one, focus would go nowhere.
    for (const field of ENQUIRY_FIELDS) {
      expect(tagWithId(html, field)).toMatch(/^<(input|select|textarea)/);
    }
  });

  it("starts with every text field empty", () => {
    for (const field of ["name", "email", "company"]) {
      expect(tagWithId(html, field)).toContain('value=""');
    }
    const textarea = html.slice(html.indexOf("<textarea"));
    expect(textarea.startsWith("<textarea")).toBe(true);
    expect(textarea.indexOf("</textarea>")).toBe(textarea.indexOf(">") + 1);
  });

  it("shows the placeholders as hints rather than as typed-in values", () => {
    expect(tagWithId(html, "name")).toContain('placeholder="John Doe"');
    expect(tagWithId(html, "name")).not.toContain('value="John Doe"');
  });

  it("starts with no field marked invalid", () => {
    expect(html).not.toContain('aria-invalid="true"');
  });

  it("starts with no complaint on the page", () => {
    for (const field of ENQUIRY_FIELDS) {
      expect(html).not.toContain(`id="${field}-error"`);
    }
  });

  it("keeps the confirmation off the page until something is sent", () => {
    expect(html).not.toContain('role="status"');
  });
});
