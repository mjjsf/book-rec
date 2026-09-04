import type { NextConfig } from "next";

/**
 * Built as a fully static site so it can be served from GitHub Pages at
 * https://mjjsf.github.io/book-rec/ — there is no Node server in front of it.
 *
 * Consequences worth knowing before changing anything here:
 *  - `output: "export"` rejects route handlers, so the recommendation engine
 *    runs in the browser (see src/lib/client.ts). Nothing server-only can be
 *    added back without dropping the static build.
 *  - `basePath` prefixes every route and asset. Reference images through a
 *    static `import` (src/covers/index.ts) rather than a literal "/foo.png",
 *    which would resolve above the base path and 404.
 *  - `trailingSlash` makes the export emit chat/index.html instead of
 *    chat.html, which is what Pages resolves reliably for /chat/.
 *  - Pages has no image optimiser, so next/image must be unoptimized.
 */
const nextConfig: NextConfig = {
  reactStrictMode: true,
  output: "export",
  basePath: "/book-rec",
  trailingSlash: true,
  images: { unoptimized: true },
};

export default nextConfig;
