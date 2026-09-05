#!/usr/bin/env node
/**
 * Fetches a deployed build and checks it actually works.
 *
 *   npm run smoke                          # against npm run preview
 *   npm run smoke https://host/book-rec/   # against a real deployment
 *
 * CI runs this after deploy-pages, because "the artifact uploaded" is not the
 * same claim as "the page loads". Two assertions earn their keep.
 *
 * The asset fetch: a wrong basePath still serves the HTML at the right URL
 * while every /_next/ file 404s, which looks green everywhere else.
 *
 * And the build commit. Everything else here passes just as happily on a build
 * from an hour ago, so a green run used to mean "a working site is up" rather
 * than "the site you just built is up" — which is the question someone actually
 * asks after a deploy. With EXPECTED_COMMIT set (CI passes the SHA it is
 * running for), a stale publish fails. Without it, the commit is reported, so
 * running this by hand answers "what is live right now?".
 *
 * Node builtins only, so the CI job needs no install.
 */

const base = normalise(
  process.argv[2] ?? process.env.SMOKE_URL ?? "http://localhost:3000/book-rec/",
);

const RETRYABLE_ATTEMPTS = 6;
const RETRY_BASE_MS = 2000;

function normalise(url) {
  return url.endsWith("/") ? url : `${url}/`;
}

function fail(message) {
  console.error(`FAIL  ${message}`);
  process.exitCode = 1;
  throw new Error(message);
}

function pass(message) {
  console.log(`ok    ${message}`);
}

/**
 * Connection errors always retry: right after a deploy the host may not answer
 * yet. A 404 only retries on the very first request, where it means Pages has
 * not propagated. Once the site has served a page, a 404 on anything else is a
 * real failure — retrying it would just burn half a minute of CI to reach the
 * same conclusion.
 */
async function getWithRetry(url, { retryOn404 = false } = {}) {
  let lastReason = "";
  for (let attempt = 1; attempt <= RETRYABLE_ATTEMPTS; attempt += 1) {
    try {
      const response = await fetch(url, { redirect: "follow" });
      if (retryOn404 && response.status === 404 && attempt < RETRYABLE_ATTEMPTS) {
        lastReason = "404";
      } else {
        return response;
      }
    } catch (error) {
      lastReason = error instanceof Error ? error.message : String(error);
      if (attempt === RETRYABLE_ATTEMPTS) break;
    }
    const wait = RETRY_BASE_MS * attempt;
    console.log(`      ${url} not ready (${lastReason}); retrying in ${wait}ms`);
    await new Promise((resolve) => setTimeout(resolve, wait));
  }
  fail(`could not fetch ${url} after ${RETRYABLE_ATTEMPTS} attempts: ${lastReason}`);
}

async function main() {
  console.log(`Smoke-testing ${base}\n`);
  const basePath = new URL(base).pathname;

  /* 1. the page responds */
  const home = await getWithRetry(base, { retryOn404: true });
  if (home.status !== 200) fail(`${base} returned ${home.status}, expected 200`);
  pass(`${base} returned 200`);

  const html = await home.text();

  /* 2. which build is this? */
  const stamped = html.match(/<meta name="build-commit" content="([^"]*)"/)?.[1];
  if (!stamped) {
    fail("no build-commit meta tag — this build cannot say which commit it came from");
  }
  const expected = process.env.EXPECTED_COMMIT;
  if (expected && stamped !== expected) {
    fail(
      `the deployed build is ${stamped}, but this run built ${expected}. ` +
        "The publish did not replace what is being served.",
    );
  }
  pass(expected ? `serving the commit this run built (${stamped})` : `serving commit ${stamped}`);

  /* 3-4. it is the app, in its designed empty state */
  if (!html.includes("What kind of book")) {
    fail("the Start headline is missing — the page responded but did not render the app");
  }
  pass("the Start headline rendered");

  if (!html.includes("Describe emotion, genre, subject")) {
    fail("the composer placeholder is missing — the empty Start state did not ship");
  }
  pass("the composer opens in its empty Start state");

  /* 4. every asset reference carries the base path */
  const references = [...html.matchAll(/["'](\/[^"']*?\/_next\/[^"']+)["']/g)].map((m) => m[1]);
  const rootRelative = [...html.matchAll(/["'](\/_next\/[^"']+)["']/g)].map((m) => m[1]);
  if (references.length === 0 && rootRelative.length === 0) {
    fail("no /_next/ references found in the HTML at all");
  }
  const stray = rootRelative.filter((ref) => !ref.startsWith(basePath));
  if (basePath !== "/" && stray.length > 0) {
    fail(`${stray.length} asset reference(s) miss the base path ${basePath}, e.g. ${stray[0]}`);
  }
  pass(`asset references carry the base path (${references.length + rootRelative.length} found)`);

  /* 5. and one of them actually resolves — the real basePath canary */
  const asset = [...references, ...rootRelative].find((ref) => ref.endsWith(".js"));
  if (!asset) fail("no JavaScript asset referenced, so the bundle cannot be checked");
  const assetUrl = new URL(asset, base).href;
  const assetResponse = await getWithRetry(assetUrl);
  if (assetResponse.status !== 200) {
    fail(
      `asset ${assetUrl} returned ${assetResponse.status}. The HTML serves but its bundle does not — ` +
        "this is what a wrong basePath looks like.",
    );
  }
  pass(`a referenced bundle resolves (${asset})`);

  /* 6. the second route, which is what trailingSlash is for */
  const chatUrl = `${base}chat/`;
  const chat = await getWithRetry(chatUrl);
  if (chat.status !== 200) fail(`${chatUrl} returned ${chat.status}, expected 200`);
  const chatHtml = await chat.text();
  if (!chatHtml.includes("adapted into the movie Arrival")) {
    fail(`${chatUrl} responded but is missing the designed rationale`);
  }
  pass(`${chatUrl} returned 200 with the designed rationale`);

  console.log("\nAll smoke checks passed.");
}

try {
  await main();
} catch {
  console.error("\nSmoke test failed.");
  process.exit(1);
}
