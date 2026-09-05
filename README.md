# book-rec

An interactive prototype of the AI book-recommendation feature designed in Figma
([Book-rec-feature](https://www.figma.com/design/8GNQedSx55nFDgrr9CeIe2/Book-rec-feature?node-id=283-77),
v4 board).

**There is no recommendation engine and no model call.** The screens reproduce
the designed flow: the composer opens with the design's own question preloaded,
Send leads to the designed results, and the controls around them genuinely work
— the reading-history switch toggles and persists, "Want to Read" shelves a book
and remembers it, the AI-details popover opens and dismisses, and everything has
hover and keyboard-focus states. What the assistant "says" is copy transcribed
from the Figma file (`src/lib/designContent.ts`), not output. Nothing is ranked,
inferred, or fetched.

## Running it

```bash
npm install
npm run dev      # http://localhost:3000
```

| Script | What it does |
| --- | --- |
| `npm run dev` | Development server |
| `npm run build` | Static export into `out/` |
| `npm run preview` | Serve `out/` the way Pages does, at `/book-rec/` |
| `npm run covers` | Regenerate cover images from `assets/covers-src/` |
| `npm run check:static` | Fail if any server-only code crept in |
| `npm run smoke` | Fetch a deployed build and check it actually works |
| `npm run test` | Vitest suites for the catalog and the designed copy |
| `npm run test:e2e` | Playwright browser checks (needs `npm run build` first) |
| `npm run lint` | ESLint |
| `npm run typecheck` | `tsc --noEmit` |

There is no `npm start`: `next start` refuses to run against `output: "export"`.
Use `npm run build && npm run preview`, which serves the real export under the
real base path — base-path bugs are invisible at the root.

`npm run test:e2e` drives that same export with Playwright and starts the
preview server itself. The suite in `e2e/` guards the things unit tests cannot
see, and each spec exists because that bug once shipped: the device frame
resizing mid-navigation, the composer clipping the last line of the designed
question, a page serving as an empty shell before hydration, the AI-details card
landing outside the frame, and assets losing the base path. It runs on every
pull request and gates the deploy.

`npm run dev` serves the app under the deployed base path, so it is at
**http://localhost:3000/book-rec** rather than the bare root.

## Screens

Each route corresponds to a frame in the Figma file.

| Route | Figma node | Screen |
| --- | --- | --- |
| `/` | `283:77` / `287:471` | **Start / Entry** — the composer, empty and filled |
| `/chat` | `283:203` | **Recommendation** — the designed reply above a sticky refine dock |

`/` covers two frames: it opens with the sample query preloaded, which is the
Entry frame, and clearing the field gives the empty Start frame with its
placeholder.

`/home`, `/my-books`, `/discover` and `/more` are stubs so the nav bar is
navigable; they are outside the design's scope and say so.

The "AI details" popover (`283:398`) and the two-state reading-history switch
(`287:621`) are components rather than routes, and appear on both screens.

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

There is no server, and nothing in the app needs one: there are no API routes,
no server components doing request-time work, and shelf state lives in
`localStorage`. `npm run check:static` enforces that — it fails on a route
handler, `getServerSideProps`, `"use server"`, `next/headers` or a
`dynamic`/`revalidate` export, and says that such code would mean moving off
Pages to a host that runs Node.

Publishing goes through the Actions **Pages artifact** rather than a `gh-pages`
branch or `docs/` on `main`: no build output is committed to the repository, and
the deploy is gated behind lint, typecheck and the tests.

After each deploy, `npm run smoke` fetches the published site and checks it
actually loads — a page, its designed copy, and crucially that a referenced
`/_next/` bundle resolves. "The artifact uploaded" is not the same claim as "the
page works": a wrong `basePath` still serves the HTML while every asset 404s.
The script runs against the local preview by default, so it is also useful
before pushing.

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

## What is real and what is designed

Everything the design shows as a *control* works. Everything it shows as
*content* is transcribed.

The app is presented the way the published Figma prototype is
(`scaling=scale-down&content-scaling=fixed`): the 393×852 frame inside an
iPhone-proportioned device, scaled down as one unit to fit the window and never
enlarged past 1×. On a phone-sized viewport the chrome comes off and the app
uses the whole screen.

**Real behaviour:**

- the composer opens empty and fills with the design's question on the first
  click — the prototype's Start → Entry beat — fading in over ~350ms and growing
  112px → 147px;
- Send is enabled only when the field is non-empty;
- the reading-history switch toggles, and its state persists across navigation
  via `localStorage`;
- "Want to Read" shelves a book, the caret opens the other shelves, and the
  choice persists;
- the AI-details card opens anchored to whatever opened it — 16px below the
  controls row on Start, and bottom-right-aligned to the refine field in the
  dock, which is the only placement that fits inside the frame there — and
  closes on Escape or an outside click;
- every control has a hover state and a `focus-visible` ring for keyboard use;
- the bottom nav navigates.

**Designed content**, all of it in `src/lib/designContent.ts` and pinned by
`src/lib/__tests__/designContent.test.ts`: the sample question (`287:525`), the
assistant's reply (`283:212`), the four result rows and their order (`283:213`),
the composer placeholder (`283:130`), and the AI-details copy (`283:398`).

Because there is no engine, Send always leads to the designed result and the
refine dock re-presents it — the Figma has one result state, and this is it.
`src/lib/catalog.ts` holds only the four books the design draws, with the exact
rating, ratings count and year printed on each row.

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
  lib/              types, catalog, and the copy transcribed from Figma
```
