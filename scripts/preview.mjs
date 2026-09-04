#!/usr/bin/env node
/**
 * Serves the static export the way GitHub Pages does.
 *
 *   npm run build && npm run preview   ->  http://localhost:3000/book-rec/
 *
 * `next start` cannot do this: it refuses to run against `output: "export"`.
 * A plain static server is not enough either, because the site lives under a
 * base path in production and base-path bugs are invisible at the root — so
 * this mounts out/ at /book-rec/ exactly as Pages does.
 */
import { createReadStream, existsSync, statSync } from "node:fs";
import http from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUT = path.join(ROOT, "out");
const BASE_PATH = "/book-rec";
const PORT = Number(process.env.PORT ?? 3000);

const TYPES = new Map(
  Object.entries({
    ".html": "text/html; charset=utf-8",
    ".js": "text/javascript; charset=utf-8",
    ".css": "text/css; charset=utf-8",
    ".json": "application/json; charset=utf-8",
    ".svg": "image/svg+xml",
    ".webp": "image/webp",
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".ico": "image/x-icon",
    ".woff": "font/woff",
    ".woff2": "font/woff2",
    ".txt": "text/plain; charset=utf-8",
  }),
);

if (!existsSync(OUT)) {
  console.error("No out/ directory. Run `npm run build` first.");
  process.exit(1);
}

/**
 * Maps a request path to a file inside out/, or null if it escapes the
 * directory or has no base-path prefix.
 */
function resolveFile(urlPath) {
  if (urlPath !== BASE_PATH && !urlPath.startsWith(`${BASE_PATH}/`)) return null;

  const relative = decodeURIComponent(urlPath.slice(BASE_PATH.length)) || "/";
  // normalize collapses "..", then the prefix check rejects anything that
  // still points outside out/.
  const candidate = path.normalize(path.join(OUT, relative));
  if (candidate !== OUT && !candidate.startsWith(OUT + path.sep)) return null;

  if (existsSync(candidate) && statSync(candidate).isDirectory()) {
    const index = path.join(candidate, "index.html");
    return existsSync(index) ? index : null;
  }
  if (existsSync(candidate)) return candidate;

  // trailingSlash: true means /chat/ is a directory, but tolerate /chat too.
  const asHtml = `${candidate}.html`;
  if (existsSync(asHtml)) return asHtml;

  return null;
}

function send(response, status, file) {
  response.writeHead(status, {
    "content-type": TYPES.get(path.extname(file)) ?? "application/octet-stream",
    "cache-control": "no-store",
  });
  createReadStream(file).pipe(response);
}

const server = http.createServer((request, response) => {
  const urlPath = new URL(request.url ?? "/", `http://localhost:${PORT}`).pathname;

  // Pages serves nothing at the domain root for a project site; make the
  // local preview point at the app instead of 404ing.
  if (urlPath === "/" || urlPath === "") {
    response.writeHead(302, { location: `${BASE_PATH}/` });
    response.end();
    return;
  }

  const file = resolveFile(urlPath);
  if (file) {
    send(response, 200, file);
    return;
  }

  const notFound = path.join(OUT, "404.html");
  if (existsSync(notFound)) {
    send(response, 404, notFound);
    return;
  }
  response.writeHead(404, { "content-type": "text/plain" });
  response.end("Not found");
});

server.listen(PORT, () => {
  console.log(`Serving out/ as GitHub Pages does: http://localhost:${PORT}${BASE_PATH}/`);
});
