import { describe, expect, it } from "vitest";
import {
  AI_DETAILS,
  COMPOSER_PLACEHOLDER,
  RATIONALE,
  RESULT_BOOK_IDS,
  SAMPLE_QUERY,
  getResultBooks,
} from "@/lib/designContent";

/**
 * The prototype's whole job is to reproduce the designed screens, so the copy
 * is the product. These assertions pin it to the Figma text — a careless edit
 * to a string is the one regression left that matters.
 */
describe("design content", () => {
  it("keeps the composer placeholder from 283:130", () => {
    expect(COMPOSER_PLACEHOLDER).toBe("Describe emotion, genre, subject...");
  });

  it("keeps the reader's question from 287:525 verbatim", () => {
    expect(SAMPLE_QUERY).toBe(
      "Can I see a few options of science fiction novels have been made into movies, also taking into account the last five or six months of my reading history? Also preference for more contemporary novels nothing too old.",
    );
  });

  it("keeps the reply from 283:212, including its paragraph break", () => {
    expect(RATIONALE).toContain(
      "Dungeon Crawler Carl is slated for movie adaptation, and is highly rated with readers similar to your history.",
    );
    expect(RATIONALE).toContain(
      "The other selections have been made into self-titled major motion pictures, with the exception of a short story from the collection Stories of Your Life and Others having been adapted into the movie Arrival.",
    );
    expect(RATIONALE.split("\n\n")).toHaveLength(2);
  });

  it("lists the four results in the designed order", () => {
    expect(getResultBooks().map((b) => b.title)).toEqual([
      "Dungeon Crawler Carl",
      "Project Hail Mary",
      "Annihilation",
      "Stories of Your Life and Others",
    ]);
  });

  it("resolves every result id against the catalog", () => {
    expect(getResultBooks()).toHaveLength(RESULT_BOOK_IDS.length);
  });

  it("keeps the AI-details copy from 283:398", () => {
    expect(AI_DETAILS.historyBody).toContain(
      "available to the AI chatbot for consideration when making recommendations",
    );
    expect(AI_DETAILS.privacyBody).toContain(
      "does not save or use any personally identifying information",
    );
  });
});
