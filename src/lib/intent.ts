import type { AdaptationKind, Format, Genre, Mood, Pace, QueryIntent } from "./types";

/**
 * Turns a free-text prompt into a structured `QueryIntent`.
 *
 * This is deliberately a transparent keyword reader rather than a black box:
 * the prototype's whole point is that you can see why a recommendation came
 * back, and the parsed intent is surfaced in the API response.
 */

const GENRE_TERMS: Array<[Genre, string[]]> = [
  ["science fiction", ["science fiction", "sci-fi", "scifi", "sf ", "space opera", "speculative"]],
  ["fantasy", ["fantasy", "magic", "dragons", "litrpg", "sword and sorcery", "epic fantasy"]],
  ["literary fiction", ["literary", "literary fiction", "prize-winning", "prizewinning"]],
  ["mystery", ["mystery", "whodunit", "detective", "cozy mystery", "murder"]],
  ["thriller", ["thriller", "suspense", "page-turner", "page turner"]],
  ["horror", ["horror", "scary", "creepy", "haunted", "gothic"]],
  ["romance", ["romance", "romantic", "love story", "rom-com", "romcom"]],
  ["historical fiction", ["historical", "history novel", "period"]],
  ["memoir", ["memoir", "autobiography"]],
  ["nonfiction", ["nonfiction", "non-fiction", "true story", "popular science"]],
  ["essays", ["essays", "essay collection"]],
  ["poetry", ["poetry", "poems", "verse"]],
];

const MOOD_TERMS: Array<[Mood, string[]]> = [
  ["hopeful", ["hopeful", "uplifting", "optimistic", "heartwarming", "feel good", "feel-good"]],
  ["melancholy", ["melancholy", "sad", "wistful", "bittersweet", "grief", "mournful"]],
  ["unsettling", ["unsettling", "eerie", "uncanny", "disturbing", "weird", "strange"]],
  ["funny", ["funny", "humor", "humour", "comic", "hilarious", "witty", "lighthearted"]],
  ["tense", ["tense", "gripping", "thrilling", "edge of my seat", "suspenseful"]],
  ["contemplative", ["contemplative", "thoughtful", "philosophical", "meditative", "quiet", "reflective"]],
  ["romantic", ["romantic", "swoony", "love story"]],
  ["adventurous", ["adventure", "adventurous", "quest", "epic journey"]],
  ["bleak", ["bleak", "dark", "grim", "devastating", "harrowing"]],
  ["cozy", ["cozy", "cosy", "comforting", "gentle", "low stakes", "low-stakes"]],
];

/** Free-text subjects worth matching directly against `Book.subjects`. */
const SUBJECT_TERMS = [
  "space", "aliens", "first contact", "time", "memory", "grief", "friendship",
  "found family", "survival", "apocalypse", "pandemic", "ecology", "wilderness",
  "philosophy", "politics", "empire", "war", "art", "music", "writing",
  "artificial intelligence", "science", "linguistics", "language", "motherhood",
  "marriage", "class", "identity", "gaming", "litrpg", "dungeon", "progression",
  "trees", "plants", "nature", "ghosts", "haunted house", "murder", "revenge",
  "hollywood", "fame", "mars", "moon", "physics", "mathematics", "short stories",
];

/** Phrases that name a specific medium. */
const FILM_TERMS = [
  "movie", "movies", "film", "films", "motion picture", "cinema",
  "big screen", "silver screen",
];
const TV_TERMS = ["tv", "television", "series", "streaming", "miniseries"];
/** Phrases that ask for an adaptation without naming the medium. */
const SCREEN_TERMS = ["adapted", "adaptation", "on screen", "on-screen"];

/**
 * Genre names double as subject words ("science fiction" contains "science").
 * Blanking the phrases already consumed as genres keeps them from being
 * counted twice.
 */
function withoutGenrePhrases(text: string, matched: string[]): string {
  let out = text;
  for (const phrase of matched) out = out.split(phrase).join(" ");
  return out;
}

function parseAdaptation(text: string): AdaptationKind | "screen" | false {
  const wantsFilm = includesAny(text, FILM_TERMS);
  const wantsTv = includesAny(text, TV_TERMS);
  const wantsScreen = includesAny(text, SCREEN_TERMS);

  // Only treat a medium word as an adaptation request when it is actually
  // about adapting — "made into", "adapted", "turned into".
  const asksForAdaptation =
    wantsScreen ||
    includesAny(text, ["made into", "turned into", "became a", "there are movies", "have been made"]);

  if (!asksForAdaptation) return false;
  if (wantsFilm && !wantsTv) return "film";
  if (wantsTv && !wantsFilm) return "tv";
  return "screen";
}

const NEGATIONS = ["no ", "not ", "nothing ", "without ", "avoid ", "less ", "skip "];

function includesAny(haystack: string, needles: string[]): boolean {
  return needles.some((n) => haystack.includes(n));
}

/** True when `term` appears in `text` immediately after a negating word. */
function isNegated(text: string, term: string): boolean {
  const at = text.indexOf(term);
  if (at < 0) return false;
  const before = text.slice(Math.max(0, at - 24), at);
  return NEGATIONS.some((neg) => before.includes(neg));
}

/**
 * "the last five or six months", "past 3 months", "this year".
 * Returns the window in months, or undefined when the prompt doesn't scope one.
 */
function parseHistoryWindow(text: string): number | undefined {
  const words: Record<string, number> = {
    one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7,
    eight: 8, nine: 9, ten: 10, twelve: 12,
  };

  // "five or six months" / "5-6 months" — take the larger bound.
  const range = text.match(
    /(\d+|one|two|three|four|five|six|seven|eight|nine|ten|twelve)\s*(?:or|to|-|–)\s*(\d+|one|two|three|four|five|six|seven|eight|nine|ten|twelve)\s*months/,
  );
  if (range?.[1] && range[2]) {
    const a = Number(range[1]) || words[range[1]] || 0;
    const b = Number(range[2]) || words[range[2]] || 0;
    return Math.max(a, b) || undefined;
  }

  const single = text.match(
    /(\d+|one|two|three|four|five|six|seven|eight|nine|ten|twelve)\s*months/,
  );
  if (single?.[1]) return Number(single[1]) || words[single[1]] || undefined;

  if (text.includes("this year") || text.includes("past year") || text.includes("last year")) {
    return 12;
  }
  return undefined;
}

/** "a few options", "5 books", "a couple". Defaults to the design's four rows. */
function parseCount(text: string): number {
  const explicit = text.match(/(\d+)\s*(?:options|books|titles|recommendations|picks)/);
  if (explicit?.[1]) return Math.min(8, Math.max(1, Number(explicit[1])));
  if (text.includes("a couple")) return 2;
  if (text.includes("just one") || text.includes("a single")) return 1;
  return 4;
}

function parseYearBounds(text: string): { minYear?: number; maxYear?: number } {
  const thisYear = new Date().getFullYear();

  const after = text.match(/(?:after|since|newer than|published in)\s*(\d{4})/);
  const before = text.match(/(?:before|older than|prior to)\s*(\d{4})/);

  let minYear = after?.[1] ? Number(after[1]) : undefined;
  let maxYear = before?.[1] ? Number(before[1]) : undefined;

  // "contemporary", "recent", "nothing too old" are soft-ish floors: they set a
  // cutoff, and the scorer additionally rewards more recent years above it.
  if (
    includesAny(text, ["contemporary", "recent", "modern", "nothing too old", "not too old", "new releases"])
  ) {
    minYear = Math.max(minYear ?? 0, thisYear - 21);
  }
  if (includesAny(text, ["classic", "older", "vintage"]) && !text.includes("nothing too old")) {
    maxYear = Math.min(maxYear ?? thisYear, 1990);
  }
  return { minYear, maxYear };
}

function parsePace(text: string): Pace | undefined {
  if (includesAny(text, ["fast-paced", "fast paced", "quick read", "propulsive", "page-turner"])) {
    return "fast";
  }
  if (includesAny(text, ["slow burn", "slow-burn", "leisurely", "takes its time", "meandering"])) {
    return "slow";
  }
  return undefined;
}

function parseMaxPages(text: string): number | undefined {
  const explicit = text.match(/under\s*(\d{2,4})\s*pages/);
  if (explicit?.[1]) return Number(explicit[1]);
  if (includesAny(text, ["short", "shorter", "quick read", "not too long", "nothing long"])) {
    return 320;
  }
  return undefined;
}

function parseFormat(text: string): Format | undefined {
  if (includesAny(text, ["short stories", "story collection", "collection of stories"])) {
    return "collection";
  }
  if (includesAny(text, ["novel", "novels"])) return "novel";
  if (includesAny(text, ["nonfiction", "non-fiction", "memoir", "essays"])) return "nonfiction";
  return undefined;
}

export function parseIntent(raw: string): QueryIntent {
  const text = ` ${raw.toLowerCase().replace(/\s+/g, " ").trim()} `;

  const genres: Genre[] = [];
  const moods: Mood[] = [];
  const excludeMoods: Mood[] = [];

  for (const [genre, terms] of GENRE_TERMS) {
    if (terms.some((t) => text.includes(t)) && !genres.includes(genre)) genres.push(genre);
  }

  for (const [mood, terms] of MOOD_TERMS) {
    const hit = terms.find((t) => text.includes(t));
    if (!hit) continue;
    if (isNegated(text, hit)) {
      if (!excludeMoods.includes(mood)) excludeMoods.push(mood);
    } else if (!moods.includes(mood)) {
      moods.push(mood);
    }
  }

  const matchedGenrePhrases = GENRE_TERMS.flatMap(([, terms]) =>
    terms.filter((t) => text.includes(t)),
  );
  const subjectText = withoutGenrePhrases(text, matchedGenrePhrases);
  const subjects = SUBJECT_TERMS.filter(
    (s) => subjectText.includes(s) && !isNegated(subjectText, s),
  );

  const { minYear, maxYear } = parseYearBounds(text);

  return {
    raw,
    genres,
    moods,
    subjects,
    minYear,
    maxYear,
    requiresAdaptation: parseAdaptation(text),
    historyWindowMonths: parseHistoryWindow(text),
    pace: parsePace(text),
    maxPages: parseMaxPages(text),
    format: parseFormat(text),
    count: parseCount(text),
    excludeMoods,
  };
}

/**
 * Folds a refinement into the intent of the turn before it, so "shorter, less
 * violent" narrows the previous request instead of starting over.
 */
export function mergeIntents(previous: QueryIntent, next: QueryIntent): QueryIntent {
  const union = <T>(a: T[], b: T[]): T[] => Array.from(new Set([...a, ...b]));
  const dropped = new Set<Mood>(next.excludeMoods);

  return {
    raw: next.raw,
    genres: next.genres.length > 0 ? next.genres : previous.genres,
    moods: union(previous.moods, next.moods).filter((m) => !dropped.has(m)),
    subjects: union(previous.subjects, next.subjects),
    minYear: next.minYear ?? previous.minYear,
    maxYear: next.maxYear ?? previous.maxYear,
    requiresAdaptation: next.requiresAdaptation || previous.requiresAdaptation,
    historyWindowMonths: next.historyWindowMonths ?? previous.historyWindowMonths,
    pace: next.pace ?? previous.pace,
    maxPages: next.maxPages ?? previous.maxPages,
    format: next.format ?? previous.format,
    count: next.count,
    excludeMoods: union(previous.excludeMoods, next.excludeMoods),
  };
}
