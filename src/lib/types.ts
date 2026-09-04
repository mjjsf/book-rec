/** Domain types for the AI book-recommendation prototype. */

export type Genre =
  | "science fiction"
  | "fantasy"
  | "literary fiction"
  | "mystery"
  | "thriller"
  | "horror"
  | "romance"
  | "historical fiction"
  | "memoir"
  | "nonfiction"
  | "essays"
  | "poetry";

export type Mood =
  | "hopeful"
  | "melancholy"
  | "unsettling"
  | "funny"
  | "tense"
  | "contemplative"
  | "romantic"
  | "adventurous"
  | "bleak"
  | "cozy";

export type Pace = "slow" | "medium" | "fast";

/**
 * Matters because the design's own rationale singles out the short-story
 * collection as "the exception" among four requested novels.
 */
export type Format = "novel" | "collection" | "nonfiction";

/**
 * "made into movies" and "adapted for TV" are different requests, and the
 * design's rationale is specifically about "major motion pictures".
 */
export type AdaptationKind = "film" | "tv";

export interface Book {
  id: string;
  title: string;
  author: string;
  /** Average rating out of 5, as displayed in the design (e.g. 4.46). */
  rating: number;
  ratingsCount: number;
  year: number;
  pages: number;
  format: Format;
  genres: Genre[];
  moods: Mood[];
  subjects: string[];
  pace: Pace;
  /** Present when the book has a screen adaptation. */
  adaptation?: { kind: AdaptationKind; note: string };
  /** Two-tone palette for the generated cover art. */
  cover: { from: string; to: string; ink: string };
}

/** A shelf in the Goodreads sense. `null` means the book is not shelved. */
export type Shelf = "want-to-read" | "currently-reading" | "read";

export interface HistoryEntry {
  bookId: string;
  /** ISO date the reader finished the book. */
  finishedOn: string;
  /** The reader's own rating out of 5, if they rated it. */
  userRating?: number;
}

/** Structured reading of a free-text prompt. */
export interface QueryIntent {
  raw: string;
  genres: Genre[];
  moods: Mood[];
  subjects: string[];
  /** Only recommend books published in or after this year. */
  minYear?: number;
  /** Only recommend books published in or before this year. */
  maxYear?: number;
  /**
   * What kind of adaptation the prompt asked for: "film" when it says movies,
   * "screen" when it is agnostic, false when it doesn't ask at all.
   */
  requiresAdaptation: AdaptationKind | "screen" | false;
  /** Restrict history influence to the last N months. */
  historyWindowMonths?: number;
  /** Preferred pace, when the prompt implies one. */
  pace?: Pace;
  /** The prompt asked for a specific format, e.g. "novels". */
  format?: Format;
  /** Upper bound on page count, when the prompt asks for something short. */
  maxPages?: number;
  /** How many books to return. */
  count: number;
  /** Terms the reader asked to avoid. */
  excludeMoods: Mood[];
}

/** Why a single book was chosen — surfaced in the rationale and in tests. */
export interface MatchSignal {
  kind:
    | "genre"
    | "mood"
    | "subject"
    | "adaptation"
    | "recency"
    | "history"
    | "rating"
    | "pace"
    | "length";
  detail: string;
  weight: number;
}

export interface Recommendation {
  book: Book;
  score: number;
  signals: MatchSignal[];
}

export interface ChatTurn {
  id: string;
  /** The reader's message. Empty for the proactive Panel screen. */
  prompt: string;
  /** Whether reading history was enabled for this turn. */
  usedHistory: boolean;
  rationale: string;
  recommendations: Recommendation[];
}

/**
 * A previous turn, reduced to what the engine actually needs: what was asked
 * and which books came back. Full book records don't need to round-trip.
 */
export interface PriorTurn {
  prompt: string;
  bookIds: string[];
}

export interface RecommendRequest {
  prompt: string;
  useHistory: boolean;
  /** Prior turns, so a refinement narrows rather than restarts. */
  previousTurns: PriorTurn[];
}

export interface RecommendResponse {
  intent: QueryIntent;
  rationale: string;
  recommendations: Recommendation[];
  /** Which engine answered: the bundled scorer or the Claude API. */
  engine: "local" | "claude";
}
