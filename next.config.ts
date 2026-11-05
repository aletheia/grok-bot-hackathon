import type { NextConfig } from "next";
import path from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = path.dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  output: "standalone",
  trailingSlash: false,
  async rewrites() {
    return [
      { source: "/vote", destination: "/vote.html" },
      { source: "/vote/", destination: "/vote.html" },
    ];
  },
  // Vote routes apply Drizzle migrations at runtime (Vercel has no Docker boot migrate).
  outputFileTracingIncludes: {
    "/api/vote": ["./drizzle/**/*"],
    "/api/vote/projects": ["./drizzle/**/*"],
  },
  turbopack: {
    root: projectRoot,
    resolveAlias: {
      tailwindcss: path.join(projectRoot, "node_modules/tailwindcss"),
    },
  },
};

export default nextConfig;
