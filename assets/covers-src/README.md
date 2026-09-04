# Cover artwork sources

Drop full-size cover images here, then run:

```bash
npm run covers
```

`scripts/prepare-covers.mjs` resizes each one to a 210×315 WebP in `src/covers/`
and regenerates `src/covers/index.ts`. Both outputs are committed, so the build
never needs this folder — it exists so the originals stay around and the
derived files can be regenerated.

## Filenames

Name each file after the book's `id` in `src/lib/catalog.ts`. Recognised
extensions: `.jpg`, `.jpeg`, `.png`, `.webp`, `.avif`, `.tiff`.

| File | Book |
| --- | --- |
| `dungeon-crawler-carl.jpg` | *Dungeon Crawler Carl* — Matt Dinniman |
| `project-hail-mary.jpg` | *Project Hail Mary* — Andy Weir |
| `annihilation.jpg` | *Annihilation* — Jeff VanderMeer |
| `stories-of-your-life.jpg` | *Stories of Your Life and Others* — Ted Chiang |

Anything missing is skipped with a note, and that book keeps the generated
two-tone art from `src/components/CoverArt.tsx`. Adding artwork for another book
means adding its id to `BOOK_IDS` in the script.

Source images should be at least 210×315 and roughly 2:3; the resize crops to
fill, so a very different aspect ratio will lose its edges.
