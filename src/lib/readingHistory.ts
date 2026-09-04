import type { HistoryEntry } from "./types";

/**
 * A seeded reading history for the prototype's single demo reader.
 *
 * Entries are declared as "months ago" rather than fixed dates so the
 * design's "the last five or six months of my reading history" keeps
 * meaning the same thing however long after this was written the app runs.
 */
interface SeedEntry {
  bookId: string;
  monthsAgo: number;
  userRating?: number;
}

const SEED: SeedEntry[] = [
  /* --- inside a five-to-six month window --- */
  { bookId: "he-who-fights-with-monsters", monthsAgo: 1, userRating: 5 },
  { bookId: "gone-girl", monthsAgo: 2, userRating: 3 },
  { bookId: "cradle-unsouled", monthsAgo: 3, userRating: 4 },
  { bookId: "the-fifth-season", monthsAgo: 4, userRating: 4 },
  { bookId: "piranesi", monthsAgo: 5, userRating: 5 },

  /* --- older, so the six-month window genuinely excludes them --- */
  { bookId: "the-secret-history", monthsAgo: 9, userRating: 4 },
  { bookId: "the-three-body-problem", monthsAgo: 11, userRating: 4 },
  { bookId: "the-martian", monthsAgo: 14, userRating: 5 },
  { bookId: "the-name-of-the-wind", monthsAgo: 17, userRating: 4 },
  { bookId: "dune", monthsAgo: 20, userRating: 5 },
  { bookId: "never-let-me-go", monthsAgo: 26, userRating: 4 },
  { bookId: "sapiens", monthsAgo: 31, userRating: 3 },
];

function isoMonthsAgo(months: number, now: Date): string {
  const d = new Date(now.getTime());
  d.setMonth(d.getMonth() - months);
  return d.toISOString().slice(0, 10);
}

/** The reader's finished books, most recent first. */
export function getReadingHistory(now: Date = new Date()): HistoryEntry[] {
  return SEED.map((entry) => ({
    bookId: entry.bookId,
    finishedOn: isoMonthsAgo(entry.monthsAgo, now),
    userRating: entry.userRating,
  }));
}

/**
 * What the reader is part-way through. The Discover carousel in the design
 * names this book directly ("Because you're reading Notebooks 1942-1951").
 */
export const CURRENTLY_READING_ID = "notebooks-1942-1951";

/** Whole months between `finishedOn` and `now`, floored at 0. */
export function monthsSince(finishedOn: string, now: Date = new Date()): number {
  const then = new Date(`${finishedOn}T00:00:00Z`);
  const months =
    (now.getUTCFullYear() - then.getUTCFullYear()) * 12 +
    (now.getUTCMonth() - then.getUTCMonth());
  return Math.max(0, months);
}
