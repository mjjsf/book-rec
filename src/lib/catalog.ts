import type { Book } from "./types";

/**
 * The four books the Figma "Recommendation" frame (283:203) shows, with the
 * exact rating, ratings count and year printed on each row.
 *
 * There is no wider catalog because nothing chooses between books — the design
 * shows these four, in this order, and so does the prototype.
 */
export const CATALOG: Book[] = [
  {
    id: "dungeon-crawler-carl",
    title: "Dungeon Crawler Carl",
    author: "Matt Dinniman",
    rating: 4.46,
    ratingsCount: 384129,
    year: 2020,
    cover: { from: "#f4c430", to: "#c2410c", ink: "#1b1b1b" },
  },
  {
    id: "project-hail-mary",
    title: "Project Hail Mary",
    author: "Andy Weir",
    rating: 4.51,
    ratingsCount: 5434343,
    year: 2021,
    cover: { from: "#0b1d3a", to: "#1e4f8f", ink: "#f5f5f5" },
  },
  {
    id: "annihilation",
    title: "Annihilation",
    author: "Jeff VanderMeer",
    rating: 3.8,
    ratingsCount: 318585,
    year: 2014,
    cover: { from: "#0f3d2e", to: "#123f24", ink: "#c9f2c7" },
  },
  {
    id: "stories-of-your-life",
    title: "Stories of Your Life and Others",
    author: "Ted Chiang",
    rating: 4.25,
    ratingsCount: 129149,
    year: 2010,
    cover: { from: "#1c1c28", to: "#4b3f72", ink: "#ecebf5" },
  },
];

const BY_ID = new Map(CATALOG.map((book) => [book.id, book]));

export function getBook(id: string): Book | undefined {
  return BY_ID.get(id);
}

/** Throws when an id is unknown — used where a missing book is a bug, not input. */
export function requireBook(id: string): Book {
  const book = BY_ID.get(id);
  if (!book) throw new Error(`Unknown book id: ${id}`);
  return book;
}
