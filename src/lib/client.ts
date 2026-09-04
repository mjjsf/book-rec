import type { RecommendResponse, Shelf } from "./types";

/** Thin wrappers around the API routes, so screens don't hand-roll fetches. */

export async function requestRecommendations(input: {
  prompt: string;
  useHistory: boolean;
  previousTurns: Array<{ prompt: string; bookIds: string[] }>;
}): Promise<RecommendResponse> {
  const response = await fetch("/api/recommend", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!response.ok) {
    throw new Error(`The recommendation service returned ${response.status}.`);
  }
  return (await response.json()) as RecommendResponse;
}

export async function saveShelf(bookId: string, shelf: Shelf | null): Promise<void> {
  await fetch("/api/shelf", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ bookId, shelf }),
  });
}
