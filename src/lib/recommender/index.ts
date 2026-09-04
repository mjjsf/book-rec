import { localRecommender } from "./localRecommender";
import type { Recommender } from "./types";

/**
 * Picks an engine for a **server** deployment: the live Claude engine when a
 * key is configured, otherwise the bundled scorer.
 *
 * The GitHub Pages build never calls this. It is a static export with no
 * server, so `src/lib/client.ts` imports `localRecommender` directly — reading
 * `process.env.ANTHROPIC_API_KEY` from a browser bundle would either be
 * meaningless or, worse, ship the key to every visitor.
 *
 * Import this (not `client.ts`) from a route handler or server component if you
 * host the app somewhere that can hold a secret.
 */
export async function getRecommender(): Promise<Recommender> {
  if (!process.env.ANTHROPIC_API_KEY) return localRecommender;
  // Imported lazily so the Claude code path never enters a client bundle.
  const { claudeRecommender } = await import("./claudeRecommender");
  return claudeRecommender;
}

export { localRecommender };
export type { Recommender };
