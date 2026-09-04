import { CATALOG, getBook } from "../catalog";
import { mergeIntents, parseIntent } from "../intent";
import { CURRENTLY_READING_ID, getReadingHistory, monthsSince } from "../readingHistory";
import type { Recommendation, RecommendRequest, RecommendResponse } from "../types";
import { localRecommender } from "./localRecommender";
import type { Recommender } from "./types";

/**
 * The live engine. It asks Claude to pick from the bundled catalog rather than
 * from open memory, so every recommendation resolves to a real catalog entry
 * with a real rating and cover, and nothing can be invented.
 *
 * If the key is missing or the call fails, this falls back to
 * `localRecommender` — the prototype should never show a dead screen.
 */

const API_URL = "https://api.anthropic.com/v1/messages";
const MODEL = "claude-sonnet-5";

interface ClaudePick {
  id: string;
  reason: string;
}

interface ClaudeResult {
  rationale: string;
  picks: ClaudePick[];
}

function catalogDigest(): string {
  return CATALOG.map((b) =>
    [
      b.id,
      `"${b.title}" by ${b.author}`,
      `${b.year}`,
      `${b.rating}/5 from ${b.ratingsCount} ratings`,
      b.format,
      `${b.pages}pp`,
      `genres: ${b.genres.join("/")}`,
      `moods: ${b.moods.join("/")}`,
      `subjects: ${b.subjects.join("/")}`,
      b.adaptation ? `adaptation(${b.adaptation.kind}): ${b.adaptation.note}` : "no adaptation",
    ].join(" | "),
  ).join("\n");
}

function historyDigest(now: Date): string {
  const lines = getReadingHistory(now).map((entry) => {
    const book = getBook(entry.bookId);
    if (!book) return null;
    return `${book.title} by ${book.author} — finished ${monthsSince(entry.finishedOn, now)} months ago${
      entry.userRating ? `, rated ${entry.userRating}/5` : ""
    }`;
  });
  const current = getBook(CURRENTLY_READING_ID);
  if (current) lines.push(`${current.title} by ${current.author} — currently reading`);
  return lines.filter(Boolean).join("\n");
}

function buildPrompt(request: RecommendRequest, now: Date): string {
  const priors = request.previousTurns
    .map(
      (t, i) =>
        `Turn ${i + 1} — reader asked: ${t.prompt || "(proactive recommendations)"}\nYou returned: ${t.bookIds
          .map((id) => getBook(id)?.title ?? id)
          .join(", ")}`,
    )
    .join("\n\n");

  return [
    "You are the book recommendation assistant inside a reading app.",
    "",
    "Pick books ONLY from this catalog. Never invent a title or an id.",
    "",
    "CATALOG",
    catalogDigest(),
    "",
    request.useHistory
      ? `READING HISTORY (the reader has opted in to this)\n${historyDigest(now)}\n\nNever recommend a book the reader has already read or is currently reading.`
      : "READING HISTORY: the reader has switched this off. Do not use or refer to their history.",
    "",
    priors ? `EARLIER IN THIS CONVERSATION\n${priors}\n\nTreat the new request as a refinement of the above, and prefer titles you have not already shown.` : "",
    "",
    `REQUEST: ${request.prompt.trim() || "Recommend books based on my recent reading."}`,
    "",
    "Reply with JSON only, no prose around it:",
    '{"rationale": "two or three sentences explaining the set as a whole", "picks": [{"id": "catalog-id", "reason": "one clause on why this one"}]}',
    "Return at most 4 picks, best first.",
  ]
    .filter((line) => line !== "")
    .join("\n");
}

function parseClaudeJson(text: string): ClaudeResult | null {
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start < 0 || end <= start) return null;
  try {
    const parsed: unknown = JSON.parse(text.slice(start, end + 1));
    if (
      typeof parsed === "object" &&
      parsed !== null &&
      "picks" in parsed &&
      Array.isArray((parsed as ClaudeResult).picks)
    ) {
      return parsed as ClaudeResult;
    }
  } catch {
    return null;
  }
  return null;
}

export const claudeRecommender: Recommender = {
  name: "claude",

  async recommend(request: RecommendRequest, options): Promise<RecommendResponse> {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) return localRecommender.recommend(request, options);

    const now = options?.now ?? new Date();

    let intent = parseIntent(request.prompt || "Recommend books based on my recent reading.");
    const previous = request.previousTurns.at(-1);
    if (previous?.prompt) intent = mergeIntents(parseIntent(previous.prompt), intent);

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model: MODEL,
          max_tokens: 1024,
          messages: [{ role: "user", content: buildPrompt(request, now) }],
        }),
      });

      if (!response.ok) throw new Error(`Anthropic API returned ${response.status}`);

      const body: unknown = await response.json();
      const blocks =
        typeof body === "object" && body !== null && "content" in body
          ? (body as { content: Array<{ type: string; text?: string }> }).content
          : [];
      const text = blocks
        .filter((b) => b.type === "text" && typeof b.text === "string")
        .map((b) => b.text)
        .join("");

      const result = parseClaudeJson(text);
      if (!result) throw new Error("Could not parse a JSON result from the model reply");

      const recommendations: Recommendation[] = result.picks
        .map((pick): Recommendation | null => {
          const book = getBook(pick.id);
          if (!book) return null;
          return {
            book,
            score: 0,
            signals: [{ kind: "subject", detail: pick.reason, weight: 1 }],
          };
        })
        .filter((r): r is Recommendation => r !== null)
        .slice(0, intent.count);

      if (recommendations.length === 0) {
        throw new Error("Model returned no ids that resolve against the catalog");
      }

      return {
        intent,
        rationale: result.rationale,
        recommendations,
        engine: "claude",
      };
    } catch (error) {
      console.warn("[claudeRecommender] falling back to the local engine:", error);
      return localRecommender.recommend(request, options);
    }
  },
};
