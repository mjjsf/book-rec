import { describe, expect, it } from "vitest";
import { CATALOG, getBook, requireBook } from "@/lib/catalog";

/** The four books the Figma "Recommendation" frame (283:203) shows, verbatim. */
const FIGMA_ROWS = [
  { id: "dungeon-crawler-carl", title: "Dungeon Crawler Carl", author: "Matt Dinniman", rating: 4.46, ratingsCount: 384129, year: 2020 },
  { id: "project-hail-mary", title: "Project Hail Mary", author: "Andy Weir", rating: 4.51, ratingsCount: 5434343, year: 2021 },
  { id: "annihilation", title: "Annihilation", author: "Jeff VanderMeer", rating: 3.8, ratingsCount: 318585, year: 2014 },
  { id: "stories-of-your-life", title: "Stories of Your Life and Others", author: "Ted Chiang", rating: 4.25, ratingsCount: 129149, year: 2010 },
];

describe("catalog", () => {
  it("has no duplicate ids", () => {
    const ids = CATALOG.map((b) => b.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("gives every book the fields the ranking reads", () => {
    for (const book of CATALOG) {
      expect(book.title.length, book.id).toBeGreaterThan(0);
      expect(book.author.length, book.id).toBeGreaterThan(0);
      expect(book.rating, book.id).toBeGreaterThan(0);
      expect(book.rating, book.id).toBeLessThanOrEqual(5);
      expect(book.ratingsCount, book.id).toBeGreaterThan(0);
      expect(book.year, book.id).toBeGreaterThan(1800);
      expect(book.genres.length, book.id).toBeGreaterThan(0);
      expect(book.moods.length, book.id).toBeGreaterThan(0);
      expect(book.subjects.length, book.id).toBeGreaterThan(0);
      expect(book.cover.from, book.id).toMatch(/^#[0-9a-f]{6}$/i);
    }
  });

  it("only records an adaptation note alongside a kind", () => {
    for (const book of CATALOG) {
      if (!book.adaptation) continue;
      expect(["film", "tv"], book.id).toContain(book.adaptation.kind);
      expect(book.adaptation.note.length, book.id).toBeGreaterThan(0);
    }
  });

  it("carries the Figma rows with their displayed metadata", () => {
    for (const row of FIGMA_ROWS) {
      const book = requireBook(row.id);
      expect(book.title).toBe(row.title);
      expect(book.author).toBe(row.author);
      expect(book.rating).toBe(row.rating);
      expect(book.ratingsCount).toBe(row.ratingsCount);
      expect(book.year).toBe(row.year);
    }
  });

  it("returns undefined rather than throwing for an unknown id", () => {
    expect(getBook("no-such-book")).toBeUndefined();
    expect(() => requireBook("no-such-book")).toThrow();
  });
});
