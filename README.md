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
| `npm run build` / `npm run start` | Production build and server |
| `npm run test` | Vitest suites for the catalog, intent parser and recommender |
| `npm run lint` | ESLint |
| `npm run typecheck` | `tsc --noEmit` |

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

## How the recommendations are produced

`getRecommender()` picks an engine at request time:

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
- **Icons and covers are hand-authored, not exported.** The Figma asset host is
  blocked by this environment's network policy, so the exported PNG/SVG assets
  could not be downloaded. The icons in `src/components/icons/` reproduce the
  designed glyphs at the designed box sizes (20×20 nav, 11×11 close, 20×20
  send, 17×20 shield, 25×25 sparkle), and `CoverArt` generates covers from each
  book's palette at the designed 70×105 and 79×119 boxes. Swapping in the real
  exports is confined to those two files.
- **The bottom bar positions itself.** `BottomNav` carries its own
  `left-16 / top-773` placement so every screen gets an identical 16px gap on
  the left, right and below, and `.phone-frame` uses an `outline` rather than a
  `border` so its content box stays exactly the 393×852 of the Figma frames.
- **One state is not in the design.** A request takes time, so the rationale
  slot shows a pulse while the engine answers (`src/components/Thinking.tsx`).

## Layout

```
src/
  app/          routes, plus api/recommend and api/shelf
  components/   screen-agnostic UI, including icons/
  lib/          types, catalog, reading history, intent parser, recommender/
```
