import type { NextConfig } from "next";
import { PHASE_DEVELOPMENT_SERVER } from "next/constants";

const retiredUssdTools = ["paginate", "align", "characters"];

export default function config(phase: string): NextConfig {
  const nextConfig: NextConfig = {
    // Static HTML in out/ for Cloudflare Pages. A static export cannot use redirects() or headers(), so production
    // redirects and headers live in public/_redirects and public/_headers. cacheComponents (and partialPrefetching,
    // which needs it) stays off: it enables Partial Prerendering, which export mode rejects.
    output: "export",
    // The dev server is opened at 127.0.0.1. Next blocks that host unless it is listed.
    allowedDevOrigins: ["127.0.0.1"],
    turbopack: {
      rules: {
        "*.css": {
          loaders: ["@tailwindcss/turbopack"],
          as: "*.css",
        },
      },
    },
  };

  if (phase === PHASE_DEVELOPMENT_SERVER) {
    // Mirrors public/_redirects so old links behave the same under `npm run dev`.
    nextConfig.redirects = async () =>
      retiredUssdTools.map((tool) => ({ source: `/ussd/${tool}`, destination: "/ussd", permanent: true }));
  }

  return nextConfig;
}
