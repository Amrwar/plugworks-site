import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

const route = vi.hoisted(() => ({ pathname: "/" }));
vi.mock("next/navigation", () => ({ usePathname: () => route.pathname }));

import Footer from "./Footer";
import { NAV_LINKS, PAGE_LINKS } from "@/data/navigation";
import { STATIC_ROUTES } from "@/data/routes";
import { SERVICES } from "@/data/services";
import { SITE } from "@/data/site";
import { SOCIAL_LINKS, socialLabel } from "@/data/social";
import { copyrightLine } from "@/lib/dates";

/** The footer as it renders from a given page. */
function render(pathname: string): string {
  route.pathname = pathname;
  return renderToStaticMarkup(<Footer />);
}

/** Every `href` in the markup, in document order. */
function hrefs(markup: string): string[] {
  return Array.from(markup.matchAll(/href="([^"]*)"/g)).map((m) => m[1]);
}

describe("the footer", () => {
  const html = render("/");

  it("names its link list, so it is not a second unlabelled nav", () => {
    expect(html).toContain('aria-label="Footer"');
  });

  it("takes you home from the logo", () => {
    expect(html).toContain('aria-label="Plugworks, home"');
    expect(hrefs(html)).toContain("/");
  });

  it("signs off with the studio name and the year", () => {
    expect(html).toContain(copyrightLine(SITE.name));
  });
});

/**
 * The footer is the site's index of last resort: whatever the header is
 * showing, everything the site serves has to be reachable from down here.
 */
describe("what the footer reaches", () => {
  const html = render("/");
  const links = hrefs(html);

  it("links every page that has a route of its own", () => {
    for (const link of PAGE_LINKS) {
      expect(links).toContain(link.href);
    }
  });

  it("links every section of the home page", () => {
    for (const link of NAV_LINKS) {
      expect(links).toContain(link.href);
    }
  });

  it("links every fixed page the site declares, not just the ones in the menu", () => {
    for (const page of STATIC_ROUTES) {
      expect(links).toContain(page.path === "" ? "/" : `/${page.path}`);
    }
  });

  it("links every service to its own page", () => {
    for (const service of SERVICES) {
      expect(links).toContain(`/services/${service.id}`);
    }
  });

  it("names every service under the title it is sold as", () => {
    for (const service of SERVICES) {
      expect(html).toContain(service.title);
    }
  });

  it("never lists the same destination twice", () => {
    const listed = links.filter((href) => href.startsWith("/services/"));
    expect(new Set(listed).size).toBe(listed.length);
  });
});

describe("the social row", () => {
  const html = render("/");

  it("links every profile the studio keeps", () => {
    for (const link of SOCIAL_LINKS) {
      expect(html).toContain(`href="${link.href}"`);
    }
  });

  it("names each icon-only link for a screen reader", () => {
    for (const link of SOCIAL_LINKS) {
      expect(html).toContain(`aria-label="${socialLabel(link)}"`);
    }
  });

  it("leaves no profile pointing at nothing", () => {
    expect(hrefs(html)).not.toContain("#");
  });
});

describe("from a page that is not the home page", () => {
  const html = render("/journal");
  const links = hrefs(html);

  it("carries the section anchors back to the home page", () => {
    for (const link of NAV_LINKS) {
      expect(links).toContain(`/${link.href}`);
    }
  });

  it("leaves no anchor pointing at a section this page does not have", () => {
    for (const link of NAV_LINKS) {
      expect(links).not.toContain(link.href);
    }
  });

  it("still reaches every page it reaches from home", () => {
    for (const link of PAGE_LINKS) {
      expect(links).toContain(link.href);
    }
  });
});
