import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

const route = vi.hoisted(() => ({ pathname: "/" }));
vi.mock("next/navigation", () => ({ usePathname: () => route.pathname }));

import Navigation from "./Navigation";
import { NAV_LINKS, PAGE_LINKS } from "@/data/navigation";

/** The header as it renders from a given page. */
function render(pathname: string): string {
  route.pathname = pathname;
  return renderToStaticMarkup(<Navigation />);
}

/** Every `href` in the markup, in document order. */
function hrefs(markup: string): string[] {
  return Array.from(markup.matchAll(/href="([^"]*)"/g)).map((m) => m[1]);
}

describe("the header", () => {
  it("is a named landmark, so it can be skipped past", () => {
    expect(render("/")).toContain('aria-label="Primary"');
  });

  it("takes you home from the logo, with a name a screen reader can read", () => {
    const html = render("/work");
    expect(html).toContain('aria-label="Plugworks, home"');
    expect(hrefs(html)).toContain("/");
  });

  it("always offers a way to start a conversation", () => {
    expect(render("/")).toContain("Talk");
  });
});

describe("from the home page", () => {
  const html = render("/");

  it("lists the sections in front of you", () => {
    for (const link of NAV_LINKS) {
      expect(html).toContain(`href="${link.href}"`);
    }
  });

  it("leaves the section anchors as bare fragments", () => {
    for (const link of NAV_LINKS) {
      expect(hrefs(html)).not.toContain(`/${link.href}`);
    }
  });

  it("marks nothing as the current page, since no page link is showing", () => {
    expect(html).not.toContain('aria-current="page"');
  });
});

describe("from a page of its own", () => {
  const html = render("/work");

  it("swaps the section list for the site's pages", () => {
    for (const link of PAGE_LINKS) {
      expect(html).toContain(`href="${link.href}"`);
    }
  });

  it("carries the section anchors back to the home page", () => {
    expect(hrefs(html)).toContain("/#contact");
  });

  it("never leaves an anchor that points at a section this page does not have", () => {
    expect(hrefs(html)).not.toContain("#contact");
  });

  it("marks the page you are on as current", () => {
    expect(html).toContain('aria-current="page"');
  });

  it("marks exactly one link as current in the desktop list", () => {
    // The mobile menu is closed, so the only list rendered is the desktop one.
    expect(html.match(/aria-current="page"/g)).toHaveLength(1);
  });

  it("marks the link for the page you are actually on", () => {
    const at = html.indexOf('aria-current="page"');
    // next/link writes href after aria-current, so read the whole anchor tag.
    const anchor = html.slice(html.lastIndexOf("<a", at), html.indexOf(">", at) + 1);
    expect(anchor).toContain('href="/work"');
  });

  it("treats a trailing slash as the same page", () => {
    expect(render("/work/")).toContain('aria-current="page"');
  });

  it("marks nothing as current on a page that is not in the menu", () => {
    expect(render("/work/some-case-study")).not.toContain('aria-current="page"');
  });
});

describe("the mobile menu", () => {
  it("starts closed", () => {
    const html = render("/");
    expect(html).toContain('aria-expanded="false"');
    expect(html).not.toContain('id="mobile-menu"');
  });

  it("has a named button that says what it controls", () => {
    const html = render("/");
    expect(html).toContain('aria-label="Toggle menu"');
    expect(html).toContain('aria-controls="mobile-menu"');
  });

  it("uses a real button, so the keyboard reaches it", () => {
    expect(render("/")).toMatch(/<button[^>]*aria-expanded/);
  });
});
