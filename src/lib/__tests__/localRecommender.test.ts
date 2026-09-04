import { describe, expect, it } from "vitest";
import { localRecommender } from "@/lib/recommender/localRecommender";
import { getReadingHistory } from "@/lib/readingHistory";

const FIGMA_PROMPT =
  "Can I see a few options of science fiction novels have been made into movies, also taking into account the last five or six months of my reading history? Also preference for more contemporary novels nothing too old.";

/** Fixed clock, so the "months ago" seed history is the same on every run. */
const NOW = new Date("2026-09-04T00:00:00Z");

const ask = (
  prompt: string,
  useHistory = true,
  previousTurns: Array<{ prompt: string; bookIds: string[] }> = [],
) => localRecommender.recommend({ prompt, useHistory, previousTurns }, { now: NOW });

describe("localRecommender", () => {
  it("reproduces the Figma Recommendation screen for the design's own prompt", async () => {
    const result = await ask(FIGMA_PROMPT);

    expect(result.recommendations.map((r) => r.book.title)).toEqual([
      "Dungeon Crawler Carl",
      "Project Hail Mary",
      "Annihilation",
      "Stories of Your Life and Others",
    ]);
  });

  it("writes a rationale out of the signals that actually fired", async () => {
    const result = await ask(FIGMA_PROMPT);

    // The lead book leads because of its adaptation and the reading history.
    expect(result.rationale).toContain("Dungeon Crawler Carl");
    expect(result.rationale).toContain("slated for movie adaptation");
    expect(result.rationale).toContain("readers similar to your history");
    // The short-story collection is named as the exception, as in the design.
    expect(result.rationale).toContain("Stories of Your Life and Others");
    expect(result.rationale).toContain("Arrival");
  });

  it("changes the ranking when reading history is switched off", async () => {
    const on = await ask(FIGMA_PROMPT, true);
    const off = await ask(FIGMA_PROMPT, false);

    expect(on.recommendations[0]?.book.title).toBe("Dungeon Crawler Carl");
    expect(off.recommendations[0]?.book.title).toBe("Project Hail Mary");
    expect(off.recommendations.every((r) => r.signals.every((s) => s.kind !== "history"))).toBe(true);
    expect(off.rationale).toContain("switched off");
  });

  it("never recommends a book the reader has already read", async () => {
    const readIds = new Set(getReadingHistory(NOW).map((h) => h.bookId));
    const result = await ask("recommend me anything at all");

    for (const rec of result.recommendations) {
      expect(readIds.has(rec.book.id), rec.book.title).toBe(false);
    }
  });

  it("honours a movies request by excluding television-only adaptations", async () => {
    const result = await ask("science fiction novels made into movies");
    for (const rec of result.recommendations) {
      expect(rec.book.adaptation?.kind, rec.book.title).toBe("film");
    }
  });

  it("narrows on a refinement rather than restarting", async () => {
    const first = await ask(FIGMA_PROMPT);
    const firstIds = first.recommendations.map((r) => r.book.id);

    const refined = await ask("something shorter", true, [
      { prompt: FIGMA_PROMPT, bookIds: firstIds },
    ]);

    // The earlier constraints still apply...
    expect(refined.intent.genres).toEqual(["science fiction"]);
    expect(refined.intent.requiresAdaptation).toBe("film");
    // ...and the new one is added.
    expect(refined.intent.maxPages).toBe(320);
    // Books already shown are deprioritised when there are alternatives.
    expect(refined.recommendations.length).toBeGreaterThan(0);
  });

  it("returns fewer results rather than padding when the filters are tight", async () => {
    const result = await ask("poetry made into movies published after 2020");
    expect(result.recommendations.length).toBe(0);
    expect(result.rationale).toContain("couldn't find");
  });

  it("answers the proactive Panel request with an empty prompt", async () => {
    const result = await ask("");
    expect(result.recommendations.length).toBe(4);
    expect(result.rationale.length).toBeGreaterThan(0);
  });

  it("respects a requested count", async () => {
    const result = await ask("show me 2 books about space");
    expect(result.recommendations.length).toBe(2);
  });
});
