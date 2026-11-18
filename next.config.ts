import type { NextConfig } from "next";
import referenceRedirects from "./data/reference-redirects.json";

const nextConfig: NextConfig = {
  redirects() {
    return referenceRedirects.redirects;
  },
  /* config options here */
  experimental: {
    agentFeedback: true,
  },
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
