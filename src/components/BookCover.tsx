import Image from "next/image";
import { COVER_IMAGES } from "@/covers";
import type { Book } from "@/lib/types";
import { CoverArt } from "./CoverArt";

/**
 * A book's cover at the size the design calls for.
 *
 * Real artwork when `src/covers/` has a file for this book (see
 * `npm run covers`), otherwise the generated two-tone art. Most of the catalog
 * has no artwork, so the fallback is the normal path rather than a stopgap.
 *
 * The image comes from a static import, not a literal URL, so Next rewrites it
 * for `basePath` — a hardcoded "/covers/x.webp" would 404 under /book-rec/.
 */
export function BookCover({
  book,
  width,
  height,
  className = "",
}: {
  book: Book;
  width: number;
  height: number;
  className?: string;
}) {
  const artwork = COVER_IMAGES[book.id];

  if (!artwork) {
    return <CoverArt book={book} width={width} height={height} className={className} />;
  }

  return (
    <Image
      src={artwork}
      alt={`${book.title} by ${book.author}`}
      width={width}
      height={height}
      className={`shrink-0 rounded-[2px] object-cover ${className}`}
      style={{ width, height }}
    />
  );
}
