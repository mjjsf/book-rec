import type { RecommendRequest, RecommendResponse } from "../types";

/**
 * The seam between the UI and whatever is producing recommendations.
 *
 * `localRecommender` is the bundled deterministic scorer; `claudeRecommender`
 * calls the Anthropic API. Both satisfy this interface, so swapping engines
 * is a one-line change in `index.ts` and nothing above it moves.
 */
export interface Recommender {
  readonly name: "local" | "claude";
  recommend(
    request: RecommendRequest,
    options?: { now?: Date },
  ): Promise<RecommendResponse>;
}
