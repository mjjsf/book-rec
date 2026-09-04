import { claudeRecommender } from "./claudeRecommender";
import { localRecommender } from "./localRecommender";
import type { Recommender } from "./types";

/**
 * Use the live model when a key is configured, otherwise the bundled scorer.
 * `claudeRecommender` also falls back on its own if a call fails, so the
 * prototype runs the same either way.
 */
export function getRecommender(): Recommender {
  return process.env.ANTHROPIC_API_KEY ? claudeRecommender : localRecommender;
}

export { claudeRecommender, localRecommender };
export type { Recommender };
