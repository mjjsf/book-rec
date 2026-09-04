import { describe, expect, it } from "vitest";
import { mergeIntents, parseIntent } from "@/lib/intent";

/** The prompt shown in the Figma "Entry" frame (287:525), verbatim. */
const FIGMA_PROMPT =
  "Can I see a few options of science fiction novels have been made into movies, also taking into account the last five or six months of my reading history? Also preference for more contemporary novels nothing too old.";

describe("parseIntent", () => {
  it("reads every constraint out of the design's sample prompt", () => {
    const intent = parseIntent(FIGMA_PROMPT);

    expect(intent.genres).toEqual(["science fiction"]);
    expect(intent.requiresAdaptation).toBe("film");
    expect(intent.historyWindowMonths).toBe(6);
    expect(intent.format).toBe("novel");
    expect(intent.count).toBe(4);
    expect(intent.minYear).toBeDefined();
    expect(intent.minYear!).toBeGreaterThan(1999);
  });

  it("does not read 'science' as a subject when it came from 'science fiction'", () => {
    expect(parseIntent(FIGMA_PROMPT).subjects).not.toContain("science");
    // ...but a prompt that really is about science still picks it up.
    expect(parseIntent("something about science and space").subjects).toContain("science");
  });

  it("distinguishes a request for movies from one for television", () => {
    expect(parseIntent("fantasy novels made into movies").requiresAdaptation).toBe("film");
    expect(parseIntent("books adapted into a television series").requiresAdaptation).toBe("tv");
    expect(parseIntent("anything with an adaptation").requiresAdaptation).toBe("screen");
    expect(parseIntent("a funny book about space").requiresAdaptation).toBe(false);
  });

  it("does not treat a bare medium word as an adaptation request", () => {
    // "movie" appears, but nothing asks for an adaptation.
    expect(parseIntent("a book better than the movie theatre").requiresAdaptation).toBe(false);
  });

  it("reads moods, and negated moods as exclusions", () => {
    const intent = parseIntent("something hopeful, nothing bleak");
    expect(intent.moods).toContain("hopeful");
    expect(intent.excludeMoods).toContain("bleak");
    expect(intent.moods).not.toContain("bleak");
  });

  it("reads a requested result count", () => {
    expect(parseIntent("show me 6 books").count).toBe(6);
    expect(parseIntent("a couple of mysteries").count).toBe(2);
    expect(parseIntent("recommend something").count).toBe(4);
  });

  it("reads a history window in words or digits", () => {
    expect(parseIntent("the last five or six months").historyWindowMonths).toBe(6);
    expect(parseIntent("past 3 months").historyWindowMonths).toBe(3);
    expect(parseIntent("this year").historyWindowMonths).toBe(12);
    expect(parseIntent("anything good").historyWindowMonths).toBeUndefined();
  });

  it("reads a length preference", () => {
    expect(parseIntent("something short").maxPages).toBe(320);
    expect(parseIntent("under 250 pages").maxPages).toBe(250);
    expect(parseIntent("an epic").maxPages).toBeUndefined();
  });
});

describe("mergeIntents", () => {
  it("keeps the earlier constraints a refinement does not restate", () => {
    const first = parseIntent(FIGMA_PROMPT);
    const refinement = parseIntent("something shorter");
    const merged = mergeIntents(first, refinement);

    expect(merged.genres).toEqual(["science fiction"]);
    expect(merged.requiresAdaptation).toBe("film");
    expect(merged.historyWindowMonths).toBe(6);
    expect(merged.maxPages).toBe(320);
    expect(merged.raw).toBe("something shorter");
  });

  it("lets a refinement override a genre and drop a mood", () => {
    const first = parseIntent("funny fantasy novels");
    const merged = mergeIntents(first, parseIntent("actually horror, nothing funny"));

    expect(merged.genres).toEqual(["horror"]);
    expect(merged.moods).not.toContain("funny");
    expect(merged.excludeMoods).toContain("funny");
  });
});
