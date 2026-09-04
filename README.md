# book-rec

A working prototype of the AI book-recommendation feature designed in Figma
([Book-rec-feature](https://www.figma.com/design/8GNQedSx55nFDgrr9CeIe2/Book-rec-feature?node-id=283-77),
v4 board). It is a real app rather than a clickable mock: typing a request
produces recommendations from a catalog, the reading-history switch genuinely
changes the ranking, shelving persists, and a refinement narrows the previous
turn instead of starting over.

## Running it

```bash
npm install
npm run dev      # http://localhost:3000
```

| Script | What it does |
| --- | --- |
| `npm run dev` | Development server |
| `npm run build` | Static export into `out/` |
| `npm run covers` | Regenerate cover images from `assets/covers-src/` |
| `npm run test` | Vitest suites for the catalog, intent parser and recommender |
| `npm run lint` | ESLint |
| `npm run typecheck` | `tsc --noEmit` |

`npm run dev` serves the app under the deployed base path, so it is at
**http://localhost:3000/book-rec** rather than the bare root.

## Screens

Each route corresponds to a frame in the Figma file.

| Route | Figma node | Screen |
| --- | --- | --- |
| `/` | `283:77` / `287:471` | **Start / Entry** — the composer, empty and filled |
| `/chat` | `283:203` | **Recommendation** — conversation above a sticky refine dock |
| `/panel` | `287:705` | **Panel** — proactive recommendations, no typed question |

`/home`, `/my-books`, `/discover`, `/search` and `/more` are stubs so the nav
bar is navigable; they are outside the design's scope and say so.

The "AI details" popover (`283:398`) and the two-state reading-history switch
(`287:621`) are components rather than routes, and appear on every screen that
has a composer.

## Deployment

The app is a **static export** served from GitHub Pages at
**https://mjjsf.github.io/book-rec/**. `.github/workflows/deploy.yml` runs lint,
typecheck, tests and the build on every push and pull request, and deploys
`out/` when `main` moves.

Enabling it once, in the repository settings: **Settings → Pages → Source →
GitHub Actions**. The workflow cannot set that itself.

Three pieces of the setup are load-bearing and easy to break:

- **`basePath: "/book-rec"`** in `next.config.ts`, because the site is served
  from a subdirectory. Reference images through a static `import` rather than a
  literal `/foo.png`, or they resolve above the base path and 404.
- **`public/.nojekyll`**, because Pages otherwise runs Jekyll, which deletes
  directories starting with an underscore — including Next's `_next` bundle.
- **`trailingSlash: true`**, so the export emits `chat/index.html`, which Pages
  resolves reliably for `/chat/`.

There is no server, so there are no API routes: the recommender runs in the
browser (`src/lib/client.ts`), and shelf state lives in `localStorage`.

## Cover images

Real cover artwork lives in `src/covers/` as 210×315 WebP — three times the
70×105 box the result rows render. To add or replace one, drop a full-size image
into `assets/covers-src/` named after the book's `id` in `src/lib/catalog.ts`
and run:

```bash
npm run covers
```

`scripts/prepare-covers.mjs` resizes it and regenerates `src/covers/index.ts`.
See `assets/covers-src/README.md` for the filenames. **Any book without artwork
falls back to generated two-tone art** (`src/components/CoverArt.tsx`), which is
the normal state for most of the catalog — `BookCover` picks between the two.

## How the recommendations are produced

On the deployed site the **local engine always answers**: a static host has
nowhere to keep an API key that the browser could not also read, so
`src/lib/client.ts` imports `localRecommender` directly and the Claude code path
never enters the bundle (the workflow asserts this). `getRecommender()` still
exists for running the app behind a real server, where it picks an engine at
request time:

- **`localRecommender`** (default) — a transparent scorer over
  `src/lib/catalog.ts`. `src/lib/intent.ts` reads the prompt into a
  `QueryIntent` (genres, moods, subjects, year bounds, whether it wants a film
  or TV adaptation, a history window, a length or pace preference, a result
  count), then each candidate is scored on genre / mood / subject overlap,
  adaptation, recency, reading-history affinity, rating and popularity. The
  rationale paragraph is assembled from the signals that actually fired, so
  the explanation cannot drift from the ranking.
- **`claudeRecommender`** — used when `ANTHROPIC_API_KEY` is set. It asks
  Claude to pick *from the bundled catalog by id*, so nothing can be invented,
  and falls back to the local engine if the call or the parse fails.

```bash
ANTHROPIC_API_KEY=sk-ant-... npm run dev   # switch to the live engine
```

Reading history lives in `src/lib/readingHistory.ts` as "months ago" offsets,
so a prompt like the design's *"the last five or six months of my reading
history"* keeps meaning the same thing however long from now the app runs.

## Fidelity notes

- **Design tokens.** Every colour, radius, shadow and type size from the v4
  frames is declared once in the Tailwind `@theme` block in
  `src/app/globals.css`, annotated with the node it came from. No component
  hardcodes a hex.
- **Icons are hand-authored, not exported.** The Figma asset host was blocked by
  the network policy where this was built, so the exported SVGs could not be
  downloaded. The icons in `src/components/icons/` reproduce the designed glyphs
  at the designed box sizes (20×20 nav, 11×11 close, 20×20 send, 17×20 shield,
  25×25 sparkle). Swapping in the real exports is confined to that one file.
- **The bottom bar positions itself.** `BottomNav` carries its own
  `left-16 / top-773` placement so every screen gets an identical 16px gap on
  the left, right and below, and `.phone-frame` uses an `outline` rather than a
  `border` so its content box stays exactly the 393×852 of the Figma frames.
- **One state is not in the design.** A request takes time, so the rationale
  slot shows a pulse while the engine answers (`src/components/Thinking.tsx`).

## Layout

```
assets/covers-src/  full-size cover artwork (input to `npm run covers`)
scripts/            prepare-covers.mjs
src/
  app/              routes
  components/       screen-agnostic UI, including icons/
  covers/           generated 210x315 WebP covers + index.ts
  lib/              types, catalog, reading history, intent parser, recommender/
```
