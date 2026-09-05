# Toolbar icon sources

Drop replacement SVGs for the bottom bar here, then ask for them to be inlined
into `src/components/icons/index.tsx`.

Unlike `assets/covers-src/`, there is no build step: icons are inlined as React
components rather than imported as files, because that is what lets them take
their colour from `currentColor` and stay in step with `--color-nav-label`. The
sources live here for provenance and so a future swap starts from the artwork
rather than from path data.

## Filenames

| File | Component | Rendered size |
| --- | --- | --- |
| `home.svg` | `HomeIcon` | 20 × 20 |
| `my-books.svg` | `MyBooksIcon` | 17 × 20 |
| `discover.svg` | `DiscoverIcon` | 20 × 20 |
| `more.svg` | `MoreIcon` | 18 × 20 |
| `sparkle.svg` | `SparkleIcon` | 26 × 26, inside the 63px FAB |

`SearchIcon` is in the same file but belongs to the Panel screen, not the
toolbar, so it is not listed here.

## What the artwork needs

- **Any canvas size.** The `viewBox` is what matters, not the file's own `width`
  and `height`. Each icon is rendered at the designed *height* above, with its
  width taken from the incoming aspect ratio, so nothing is squashed to fit.
- **Single colour.** Hardcoded `fill`/`stroke` values are replaced with
  `currentColor` so the glyph tracks the nav label. Multi-colour artwork keeps
  its own fills, but then stops following the design token.
- **No embedded rasters.** A `<image>` element inside the SVG defeats the point;
  outline or filled paths only.
