import type { ReactNode } from "react";

import { SOCIAL_LINKS, socialLabel } from "@/data/social";

type SocialLinksProps = {
  /** The mark for each profile, keyed by its id. */
  icons: Record<string, ReactNode>;
  className?: string;
};

/**
 * The row of profile links in the footer.
 *
 * Each anchor takes its destination and its accessible name from the data,
 * so an icon-only link is never left unnamed.
 */
export default function SocialLinks({ icons, className = "" }: SocialLinksProps) {
  return (
    <ul className={`flex items-center gap-4 ${className}`}>
      {SOCIAL_LINKS.map((link) => (
        <li key={link.id}>
          <a
            href={link.href}
            target="_blank"
            rel="noreferrer"
            aria-label={socialLabel(link)}
            className="w-10 h-10 rounded-full bg-plug-gray/50 flex items-center justify-center text-plug-light/50 hover:text-plug-electric hover:bg-plug-gray transition-all duration-300"
          >
            {icons[link.id]}
          </a>
        </li>
      ))}
    </ul>
  );
}
