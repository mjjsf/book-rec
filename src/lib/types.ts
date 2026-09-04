/**
 * Types for the book-rec prototype.
 *
 * This is a design prototype, not a recommendation engine: the screens render
 * content transcribed from the Figma file rather than anything computed. So a
 * `Book` carries only what a result row actually draws.
 */

export interface Book {
  id: string;
  title: string;
  author: string;
  /** Average rating out of 5, exactly as the design displays it (e.g. 4.46). */
  rating: number;
  ratingsCount: number;
  year: number;
  /** Two-tone palette for the generated cover art fallback. */
  cover: { from: string; to: string; ink: string };
}

/** A shelf in the Goodreads sense. `null` means the book is not shelved. */
export type Shelf = "want-to-read" | "currently-reading" | "read";
