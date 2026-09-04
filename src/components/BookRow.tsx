"use client";

import { saveShelf } from "@/lib/client";
import { useAppState } from "./AppStateProvider";
import { CoverArt } from "./CoverArt";
import { ShelfButton } from "./ShelfButton";
import { StarRating } from "./StarRating";
import type { Recommendation } from "@/lib/types";

/**
 * One result row (283:214): a 70 x 105 cover, then title / byline / rating
 * strip / shelf button in a 244.47px column, with a hairline underneath.
 */
export function BookRow({
  recommendation,
  showReason = false,
}: {
  recommendation: Recommendation;
  showReason?: boolean;
}) {
  const { book } = recommendation;
  const { shelves, setShelf } = useAppState();

  return (
    <li className="flex flex-col gap-[19px] border-b border-hairline pb-[19px] last:border-b-0">
      <div className="flex gap-[20px]">
        <CoverArt book={book} width={70} height={105} />

        <div className="flex w-[244.468px] flex-col gap-[20px]">
          <div className="flex flex-col gap-[8px]">
            <p className="font-serif text-title leading-[19.301px] text-black">{book.title}</p>
            <p className="text-meta leading-[19.301px] text-byline">by {book.author}</p>
            <div className="flex items-center gap-[6px]">
              <StarRating rating={book.rating} />
              <p className="whitespace-nowrap text-meta leading-[19.301px] text-black">
                {book.rating.toFixed(2)} · {book.ratingsCount.toLocaleString("en-US")} ratings ·{" "}
                {book.year}
              </p>
            </div>
            {showReason ? (
              <p className="text-meta leading-[16px] text-byline/70">
                {recommendation.signals
                  .filter((s) => s.kind !== "rating")
                  .slice(0, 2)
                  .map((s) => s.detail)
                  .join(" · ")}
              </p>
            ) : null}
          </div>

          <ShelfButton
            shelf={shelves[book.id] ?? null}
            onChange={(next) => {
              // Update locally first so the button responds immediately, then
              // persist. A failed write is not worth blocking the tap on.
              setShelf(book.id, next);
              void saveShelf(book.id, next).catch(() => undefined);
            }}
          />
        </div>
      </div>
    </li>
  );
}
