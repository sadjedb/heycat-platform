import type { NextConfig } from "next";
import { defaultLocale } from "./src/i18n";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      /*
       * Uploads go through a Server Action, and Next caps action request
       * bodies at 1MB by default — so every photograph off a phone was
       * rejected by the framework before `saveUpload` ever saw it, with a bare
       * 500 instead of the admin's own message. The app's limit is 8 MB, so
       * this sits above it with room for multipart overhead: anything the café
       * can plausibly upload now reaches our own check and gets a sentence
       * explaining itself.
       */
      bodySizeLimit: "12mb",
    },
  },

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
