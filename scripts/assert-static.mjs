#!/usr/bin/env node
/**
 * Fails when the app grows something a static export cannot carry.
 *
 *   npm run check:static
 *
 * GitHub Pages serves files; there is no server to run a request handler. The
 * build would fail on some of these anyway, but with a message that explains
 * the mechanism rather than the choice — the point here is to say plainly that
 * adding one of these means moving off Pages.
 */
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SRC = path.join(ROOT, "src");

/** Source patterns that only work with a server behind them. */
const FORBIDDEN = [
  { pattern: /\bgetServerSideProps\b/, what: "getServerSideProps" },
  { pattern: /\bgetStaticProps\b/, what: "getStaticProps" },
  { pattern: /\bgetInitialProps\b/, what: "getInitialProps" },
  { pattern: /["']use server["']/, what: 'a "use server" directive' },
  { pattern: /from\s+["']next\/headers["']/, what: "next/headers" },
  { pattern: /export\s+const\s+(dynamic|revalidate)\b/, what: "a dynamic/revalidate export" },
  { pattern: /\bANTHROPIC_API_KEY\b/, what: "an API key reference" },
];

async function* walk(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) yield* walk(full);
    else if (/\.(ts|tsx|js|jsx|mjs)$/.test(entry.name)) yield full;
  }
}

const problems = [];

for await (const file of walk(SRC)) {
  const relative = path.relative(ROOT, file);

  // Route handlers are the big one: `output: "export"` rejects them outright.
  if (/^route\.(ts|tsx|js|jsx)$/.test(path.basename(file))) {
    problems.push(`${relative}: a route handler (API route)`);
  }

  const contents = await readFile(file, "utf8");
  for (const { pattern, what } of FORBIDDEN) {
    if (pattern.test(contents)) problems.push(`${relative}: ${what}`);
  }
}

if (problems.length > 0) {
  console.error("This app is published to GitHub Pages as a static export, but found:\n");
  for (const problem of problems) console.error(`  - ${problem}`);
  console.error(
    [
      "",
      "Each of these needs a server at request time, which GitHub Pages does not have.",
      "Either remove it, or move the deployment to a host that runs Node (Vercel,",
      "Netlify, a container) and drop `output: \"export\"` from next.config.ts.",
      "",
    ].join("\n"),
  );
  process.exit(1);
}

console.log("Static export is safe: no server-only code found in src/.");
