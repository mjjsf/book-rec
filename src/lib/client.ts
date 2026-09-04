import { localRecommender } from "./recommender/localRecommender";
import type { RecommendResponse } from "./types";

/**
 * The screens' entry point into the engine.
 *
 * This used to POST to /api/recommend. The site is now a static export for
 * GitHub Pages, which has no server to POST to, so the scorer runs in the
 * browser instead. The signature is unchanged, so the screens did not move.
 *
 * `claudeRecommender` is deliberately not reachable from here: it needs an API
 * key, and a static site has nowhere to keep one that the browser cannot read.
 * Running the live engine means running this behind a real server — see
 * src/lib/recommender/index.ts.
 */
export async function requestRecommendations(input: {
  prompt: string;
  useHistory: boolean;
  previousTurns: Array<{ prompt: string; bookIds: string[] }>;
}): Promise<RecommendResponse> {
  return localRecommender.recommend(input);
}
