"use client";

import { useEffect } from "react";
import { track } from "@/lib/track-client";

/** Records one page view per mount. Rendered once per public page. */
export function PageView({ type = "page_view" }: { type?: string }) {
  useEffect(() => {
    track(type);
  }, [type]);
  return null;
}
