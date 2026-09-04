import { CATALOG, getBook } from "../catalog";
import { mergeIntents, parseIntent } from "../intent";
import { CURRENTLY_READING_ID, getReadingHistory, monthsSince } from "../readingHistory";
import type {
  Book,
  MatchSignal,
  QueryIntent,
  Recommendation,
  RecommendRequest,
  RecommendResponse,
} from "../types";
import type { Recommender } from "./types";

/* --------------------------------- weights -------------------------------- */

const W = {
  genre: 2.6,
  mood: 1.1,
  subject: 0.9,
  adaptation: 2.2,
  recency: 1.8,
  history: 3.4,
  rating: 1.6,
  popularity: 0.7,
  pace: 0.8,
  length: 0.7,
  formatMismatch: -1.5,
} as const;

/** Overlap of two small sets, normalised by the smaller one. */
function overlap(a: readonly string[], b: readonly string[]): number {
  if (a.length === 0 || b.length === 0) return 0;
  const setB = new Set(b);
  const shared = a.filter((x) => setB.has(x)).length;
  return shared / Math.min(a.length, b.length);
}

/**
 * How much a candidate looks like what the reader has been reading lately.
 *
 * Each finished book contributes overlap in genre / mood / subject, scaled by
 * how recently it was read and how highly the reader rated it. When the prompt
 * scopes a window ("the last five or six months"), older reads drop out.
 */
function historyAffinity(
  candidate: Book,
  intent: QueryIntent,
  now: Date,
): { score: number; nearest?: Book } {
  const window = intent.historyWindowMonths;
  let best = 0;
  let bestBook: Book | undefined;
  let total = 0;

  for (const entry of getReadingHistory(now)) {
    const read = getBook(entry.bookId);
    if (!read) continue;

    const age = monthsSince(entry.finishedOn, now);
    if (window !== undefined && age > window) continue;

    // Half-life of roughly a year, so recent reads dominate even unscoped.
    const recencyWeight = 1 / (1 + age / 12);
    const ratingWeight = (entry.userRating ?? 3.5) / 5;

    const similarity =
      0.5 * overlap(candidate.genres, read.genres) +
      0.25 * overlap(candidate.moods, read.moods) +
      0.35 * overlap(candidate.subjects, read.subjects) +
      (candidate.author === read.author ? 0.3 : 0);

    const contribution = similarity * recencyWeight * ratingWeight;
    total += contribution;
    if (contribution > best) {
      best = contribution;
      bestBook = read;
    }
  }

  // Saturating, so a long history can't simply outvote the prompt.
  return { score: Math.min(1, total), nearest: bestBook };
}

function ratingScore(book: Book): number {
  return Math.max(0, Math.min(1, (book.rating - 3.4) / 1.2));
}

function popularityScore(book: Book): number {
  // log10, mapped so ~1k ratings ≈ 0 and ~10M ≈ 1.
  return Math.max(0, Math.min(1, (Math.log10(book.ratingsCount) - 3) / 4));
}

function recencyScore(book: Book, intent: QueryIntent): number {
  const thisYear = new Date().getFullYear();
  const floor = intent.minYear ?? thisYear - 60;
  if (thisYear <= floor) return 1;
  return Math.max(0, Math.min(1, (book.year - floor) / (thisYear - floor)));
}

/** Hard filters. A book failing any of these is never shown. */
function isEligible(book: Book, intent: QueryIntent, readIds: Set<string>): boolean {
  if (readIds.has(book.id)) return false;
  if (intent.requiresAdaptation) {
    if (!book.adaptation) return false;
    // "movies" excludes a television-only adaptation, and vice versa.
    if (intent.requiresAdaptation !== "screen" && book.adaptation.kind !== intent.requiresAdaptation) {
      return false;
    }
  }
  if (intent.minYear !== undefined && book.year < intent.minYear) return false;
  if (intent.maxYear !== undefined && book.year > intent.maxYear) return false;
  if (intent.genres.length > 0 && !intent.genres.some((g) => book.genres.includes(g))) {
    return false;
  }
  if (intent.excludeMoods.some((m) => book.moods.includes(m))) return false;
  return true;
}

function scoreBook(
  book: Book,
  intent: QueryIntent,
  readIds: Set<string>,
  now: Date,
): Recommendation {
  const signals: MatchSignal[] = [];
  let score = 0;

  const add = (kind: MatchSignal["kind"], detail: string, weight: number) => {
    if (weight <= 0) return;
    score += weight;
    signals.push({ kind, detail, weight });
  };

  const genreHit = intent.genres.filter((g) => book.genres.includes(g));
  if (genreHit.length > 0) {
    add("genre", genreHit.join(" and "), W.genre * (genreHit.length / intent.genres.length));
  }

  const moodHit = intent.moods.filter((m) => book.moods.includes(m));
  if (moodHit.length > 0) {
    add("mood", moodHit.join(", "), W.mood * (moodHit.length / intent.moods.length));
  }

  const subjectHit = intent.subjects.filter((s) => book.subjects.includes(s));
  if (subjectHit.length > 0) {
    add("subject", subjectHit.join(", "), W.subject * (subjectHit.length / intent.subjects.length));
  }

  if (intent.requiresAdaptation && book.adaptation) {
    add("adaptation", book.adaptation.note, W.adaptation);
  }

  if (intent.minYear !== undefined) {
    add("recency", `published ${book.year}`, W.recency * recencyScore(book, intent));
  }

  const affinity = historyAffinity(book, intent, now);
  if (affinity.score > 0 && affinity.nearest) {
    add(
      "history",
      `close to ${affinity.nearest.title}, which you finished recently`,
      W.history * affinity.score,
    );
  }

  add("rating", `rated ${book.rating.toFixed(2)}`, W.rating * ratingScore(book));
  add(
    "rating",
    `${book.ratingsCount.toLocaleString("en-US")} ratings`,
    W.popularity * popularityScore(book),
  );

  if (intent.pace && book.pace === intent.pace) {
    add("pace", `${book.pace}-paced`, W.pace);
  }
  if (intent.maxPages !== undefined && book.pages <= intent.maxPages) {
    add("length", `${book.pages} pages`, W.length);
  }

  // A format mismatch demotes rather than excludes — the design's own rationale
  // keeps a short-story collection in a list of requested novels and calls it out.
  if (intent.format && book.format !== intent.format) {
    score += W.formatMismatch;
    signals.push({
      kind: "genre",
      detail: `a ${book.format}, not a ${intent.format}`,
      weight: W.formatMismatch,
    });
  }

  void readIds;
  return { book, score, signals };
}

/* -------------------------------- rationale ------------------------------- */

function sentenceList(parts: string[]): string {
  if (parts.length <= 1) return parts[0] ?? "";
  if (parts.length === 2) return `${parts[0]} and ${parts[1]}`;
  return `${parts.slice(0, -1).join(", ")}, and ${parts[parts.length - 1]}`;
}

/**
 * Builds the paragraph shown above the results from the signals that actually
 * fired, so the explanation can never drift from the ranking.
 */
function buildRationale(
  picks: Recommendation[],
  intent: QueryIntent,
  useHistory: boolean,
): string {
  if (picks.length === 0) {
    return "I couldn't find anything in the catalog that fits all of that. Try loosening one part of the request — the year range or the screen-adaptation requirement are usually the tightest.";
  }

  const lead = picks[0];
  if (!lead) return "";

  const sentences: string[] = [];

  /* First sentence: why the top pick leads. */
  const leadReasons: string[] = [];
  const leadAdaptation = lead.signals.find((s) => s.kind === "adaptation");
  if (leadAdaptation) leadReasons.push(leadAdaptation.detail);
  if (useHistory && lead.signals.some((s) => s.kind === "history")) {
    leadReasons.push("is highly rated with readers similar to your history");
  }
  if (leadReasons.length === 0) {
    const r = lead.signals.find((s) => s.kind === "rating");
    if (r) leadReasons.push(`is ${r.detail}`);
  }
  sentences.push(`${lead.book.title} ${sentenceList(leadReasons)}.`);

  /* Second sentence: how the rest hang together. */
  const rest = picks.slice(1);
  if (rest.length > 0 && intent.requiresAdaptation) {
    const selfTitled = rest.filter((r) =>
      r.signals.some((s) => s.kind === "adaptation" && s.detail.includes("self-titled")),
    );
    const exceptions = rest.filter((r) => !selfTitled.includes(r));

    if (selfTitled.length > 0) {
      let sentence =
        selfTitled.length === rest.length
          ? "The other selections have been made into self-titled major motion pictures"
          : `${sentenceList(selfTitled.map((r) => r.book.title))} ${selfTitled.length === 1 ? "has" : "have"} been adapted under their own titles`;

      if (exceptions.length > 0) {
        const notes = exceptions.map((r) => {
          const note = r.signals.find((s) => s.kind === "adaptation")?.detail;
          return note ? `${r.book.title}, which ${note}` : r.book.title;
        });
        sentence += `, with the exception of ${sentenceList(notes)}`;
      }
      sentences.push(`${sentence}.`);
    }
  } else if (rest.length > 0) {
    const themes = Array.from(
      new Set(rest.flatMap((r) => r.signals.filter((s) => s.kind === "subject").map((s) => s.detail))),
    ).slice(0, 3);
    if (themes.length > 0) {
      sentences.push(`The rest pick up on ${sentenceList(themes)}.`);
    } else {
      sentences.push(
        `${sentenceList(rest.map((r) => r.book.title))} round out the list on rating and fit.`,
      );
    }
  }

  /*
   * The design's rationale is two sentences, so the only thing worth a third
   * is the disclosure that history was not used — that changes what the
   * reader should make of the list.
   */
  if (!useHistory) {
    sentences.push(
      "Your reading history is switched off, so this is ranked on the request alone.",
    );
  }

  return sentences.join(" ");
}

/* --------------------------------- engine --------------------------------- */

/** The prompt used for the proactive Panel screen, which has no typed query. */
const PROACTIVE_PROMPT = "Recommend books based on my recent reading history.";

export const localRecommender: Recommender = {
  name: "local",

  async recommend(request: RecommendRequest, options): Promise<RecommendResponse> {
    const now = options?.now ?? new Date();
    const text = request.prompt.trim() === "" ? PROACTIVE_PROMPT : request.prompt;

    let intent = parseIntent(text);
    const previous = request.previousTurns.at(-1);
    if (previous) {
      intent = mergeIntents(parseIntent(previous.prompt || PROACTIVE_PROMPT), intent);
    }

    // Books already read, plus anything already recommended this conversation,
    // so a refinement brings back something new.
    const readIds = new Set<string>([
      CURRENTLY_READING_ID,
      ...getReadingHistory(now).map((h) => h.bookId),
    ]);
    const alreadyShown = new Set(request.previousTurns.flatMap((t) => t.bookIds));

    const effectiveIntent: QueryIntent = request.useHistory
      ? intent
      : { ...intent, historyWindowMonths: undefined };

    let pool = CATALOG.filter((book) => isEligible(book, effectiveIntent, readIds));

    // Prefer unseen titles, but fall back rather than returning an empty list.
    const unseen = pool.filter((book) => !alreadyShown.has(book.id));
    if (unseen.length >= effectiveIntent.count) pool = unseen;

    const scored = pool
      .map((book) => {
        const rec = scoreBook(book, effectiveIntent, readIds, now);
        if (!request.useHistory) {
          const historyWeight = rec.signals
            .filter((s) => s.kind === "history")
            .reduce((sum, s) => sum + s.weight, 0);
          return {
            book: rec.book,
            score: rec.score - historyWeight,
            signals: rec.signals.filter((s) => s.kind !== "history"),
          };
        }
        return rec;
      })
      .sort((a, b) => b.score - a.score || a.book.title.localeCompare(b.book.title));

    const picks = scored.slice(0, effectiveIntent.count);

    return {
      intent: effectiveIntent,
      rationale: buildRationale(picks, effectiveIntent, request.useHistory),
      recommendations: picks,
      engine: "local",
    };
  },
};
