import type { NextConfig } from "next";
import { defaultLocale } from "./src/i18n";

const nextConfig: NextConfig = {
  /*
   * The site is French-first with an English twin, so every page lives under a
   * locale segment and the bare root sends people to the default. A temporary
   * redirect, not permanent: if locale detection is added later (Next 16 does it
   * in `proxy.ts`), browsers must not have cached `/` -> `/fr` forever.
   */
  async redirects() {
    return [
      { source: "/", destination: `/${defaultLocale}`, permanent: false },
      { source: "/menu", destination: `/${defaultLocale}/menu`, permanent: false },
    ];
  },
};

export default nextConfig;
