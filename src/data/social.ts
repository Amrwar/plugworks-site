import { SITE } from "./site";

/** One social profile. */
export type SocialLink = {
  /** Stable key and icon selector. */
  id: string;
  /** The network as a person names it, e.g. "Instagram". */
  name: string;
  href: string;
};

/**
 * Where to find the studio elsewhere.
 *
 * The footer rendered four icon-only anchors pointing at `#`, which gave a
 * screen reader nothing to announce. Naming them here means the markup can
 * carry a real label for each.
 */
export const SOCIAL_LINKS: readonly SocialLink[] = [
  { id: "instagram", name: "Instagram", href: "https://instagram.com/plugworks" },
  { id: "linkedin", name: "LinkedIn", href: "https://linkedin.com/company/plugworks" },
  { id: "behance", name: "Behance", href: "https://behance.net/plugworks" },
  { id: "x", name: "X", href: "https://x.com/plugworks" },
] as const;

/**
 * The accessible name for a link that shows an icon and no text.
 *
 * Each entry used to carry its own "Plugworks on Instagram" string, so the
 * studio name was written out four more times and could drift from `SITE`.
 * Building the label from the network name keeps the two in step.
 */
export function socialLabel(link: SocialLink): string {
  return `${SITE.name} on ${link.name}`;
}

/** One profile by id, or undefined when nothing is registered under it. */
export function socialLink(id: string): SocialLink | undefined {
  return SOCIAL_LINKS.find((link) => link.id === id);
}
