"use client";

import { track } from "@/lib/track-client";

/**
 * A link that records why it was clicked.
 *
 * The beacon is fire-and-forget: navigation is never delayed or blocked by it,
 * and a failed request is simply ignored.
 */
export function TrackedLink({
  href,
  event,
  slug,
  external,
  className,
  children,
}: {
  href: string;
  event?: string;
  slug?: string;
  external?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      className={className}
      {...(external ? { target: "_blank", rel: "noreferrer" } : {})}
      onClick={() => {
        if (event) track(event, { slug });
      }}
    >
      {children}
    </a>
  );
}
