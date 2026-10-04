"use client";

import { useEffect, useRef } from "react";

/*
 * Scroll reveal.
 *
 * The CSS does the work; this only flips an attribute once the element has been
 * seen. Content is visible by default and the reveal styles are wrapped in
 * `prefers-reduced-motion: no-preference`, so with motion reduced — or with
 * JavaScript off — nothing is hidden and nothing moves.
 */
export function Reveal({
  children,
  delay = 0,
  className = "",
  as: Tag = "div",
}: {
  children: React.ReactNode;
  /** Stagger, in ms. Keep under ~240 so a group still reads as one gesture. */
  delay?: number;
  className?: string;
  as?: "div" | "section" | "li" | "figure" | "article" | "header";
}) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      el.setAttribute("data-reveal", "shown");
      return;
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          entry.target.setAttribute("data-reveal", "shown");
          io.disconnect();
        }
      },
      { rootMargin: "0px 0px -12% 0px", threshold: 0.08 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <Tag
      // @ts-expect-error — one ref type across the allowed tag union
      ref={ref}
      data-reveal=""
      className={className}
      style={delay ? ({ "--reveal-delay": `${delay}ms` } as React.CSSProperties) : undefined}
    >
      {children}
    </Tag>
  );
}
