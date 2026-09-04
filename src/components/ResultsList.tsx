import { BookRow } from "./BookRow";
import type { Recommendation } from "@/lib/types";

/** The 361px-wide stack of result rows (283:213). */
export function ResultsList({
  recommendations,
  showReasons = false,
}: {
  recommendations: Recommendation[];
  showReasons?: boolean;
}) {
  return (
    <ul className="flex w-full flex-col gap-[21px]">
      {recommendations.map((recommendation) => (
        <BookRow
          key={recommendation.book.id}
          recommendation={recommendation}
          showReason={showReasons}
        />
      ))}
    </ul>
  );
}
