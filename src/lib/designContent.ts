import { requireBook } from "./catalog";
import type { Book } from "./types";

/**
 * Copy transcribed from the Figma file, verbatim.
 *
 * Nothing here is generated. The prototype reproduces the designed screens, so
 * these strings are the content — changing them changes what the prototype
 * claims the design says, which is why they are pinned by a test.
 *
 * File 8GNQedSx55nFDgrr9CeIe2, v4 board.
 */

/** The composer's empty-state placeholder (283:130). */
export const COMPOSER_PLACEHOLDER = "Describe emotion, genre, subject...";

/** The reader's question, as the Entry frame shows it filled in (287:525). */
export const SAMPLE_QUERY =
  "Can I see a few options of science fiction novels have been made into movies, also taking into account the last five or six months of my reading history? Also preference for more contemporary novels nothing too old.";

/** The assistant's reply above the results (283:212), including its blank line. */
export const RATIONALE = `Dungeon Crawler Carl is slated for movie adaptation, and is highly rated with readers similar to your history.

The other selections have been made into self-titled major motion pictures, with the exception of a short story from the collection Stories of Your Life and Others having been adapted into the movie Arrival.`;

/** The result rows, in the order the design lists them (283:213). */
export const RESULT_BOOK_IDS = [
  "dungeon-crawler-carl",
  "project-hail-mary",
  "annihilation",
  "stories-of-your-life",
] as const;

/** The designed results, resolved against the catalog. */
export function getResultBooks(): Book[] {
  return RESULT_BOOK_IDS.map(requireBook);
}

/** The "AI details" popover (283:398). */
export const AI_DETAILS = {
  historyHeading: "“Use my reading history” option",
  historyBody:
    "Activating this option will make your reading history, and any related ratings and reviews, available to the AI chatbot for consideration when making recommendations.",
  privacyHeading: "Privacy",
  privacyBody:
    "This AI chatbot does not save or use any personally identifying information, and is designed only for book recommendation.",
} as const;
