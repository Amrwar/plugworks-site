import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import Locations from "./Locations";
import { LOCATIONS, officeAddress } from "@/data/locations";

const html = renderToStaticMarkup(<Locations />);

describe("Locations", () => {
  it("gives the section a heading it is labelled by", () => {
    expect(html).toContain('aria-labelledby="locations-heading"');
    expect(html).toContain('id="locations-heading"');
  });

  it("is reachable by the #locations anchor the navigation points at", () => {
    expect(html).toContain('id="locations"');
  });

  it("shows a card for every office", () => {
    for (const location of LOCATIONS) {
      expect(html).toContain(location.city);
      expect(html).toContain(location.country);
      expect(html).toContain(location.description);
    }
  });

  it("names both offices, so neither card is dropped", () => {
    for (const location of LOCATIONS) {
      expect(html).toContain(officeAddress(location).split(", ")[0]);
    }
  });
});

describe("the map behind the section", () => {
  it("draws the whole field of dots", () => {
    expect(html.match(/<circle/g)?.length).toBeGreaterThanOrEqual(50);
  });

  /**
   * The dots used to come from `Math.random()` in the render, so the server
   * and the browser drew different maps and React reported a hydration
   * mismatch. Two renders have to agree.
   */
  it("draws the same map every time it renders", () => {
    expect(renderToStaticMarkup(<Locations />)).toBe(html);
  });

  it("hides the decoration from a screen reader", () => {
    const svg = html.slice(html.indexOf("<svg"), html.indexOf(">", html.indexOf("<svg")));
    expect(svg).toContain('aria-hidden="true"');
  });
});
