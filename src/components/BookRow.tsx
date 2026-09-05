"use client";

import { useAppState } from "./AppStateProvider";
import { BookCover } from "./BookCover";
import { ShelfButton } from "./ShelfButton";
import { StarRating } from "./StarRating";
import type { Book } from "@/lib/types";

/**
 * One result row (283:214): a 70 x 105 cover, then title / byline / rating
 * strip / shelf button in a 244.47px column, with a hairline underneath.
 */
export function BookRow({ book }: { book: Book }) {
  const { shelves, setShelf } = useAppState();

  return (
    <li className="border-b border-hairline pb-[var(--row-split)] last:border-b-0">
      {/*
        * The cover is positioned rather than laid out, and the box is pinned to
        * its 105px height. Condensing the descriptor lines left the text column
        * at 96.61px, so a laid-out cover would have set the row's height while
        * the box ended 8.39px short of the cover's bottom edge — which is why
        * the hairline's distance from the cover above it was never a number
        * anyone wrote down. With the two edges coincident, centring the hairline
        * is just `pb == the list's gap` (see ResultsList).
        *
        * The 90px inset is the cover's 70px plus its 20px gap, so the column
        * lands exactly where the flex row put it.
        */}
      <div className="relative min-h-[105px] pl-[90px]">
        <BookCover book={book} width={70} height={105} className="absolute left-0 top-0" />

        <div className="flex w-[244.468px] flex-col gap-[20px]">
          {/*
            * 8px measured baseline-of-the-line-above to cap-height-of-the-line
            * below. The trim classes pull each box onto those typographic
            * edges (see globals.css), so this gap is that measure directly.
            */}
          <div
            className="flex flex-col gap-[8px]"
            style={{ "--trim-lh": "19.301px" } as React.CSSProperties}
          >
            <p className="trim-serif trim-bottom font-serif text-title leading-[19.301px] text-black">
              {book.title}
            </p>
            <p className="trim-sans trim-both text-meta leading-[19.301px] text-byline">
              by {book.author}
            </p>
            <div className="trim-sans flex items-center gap-[6px]">
              {/*
                * The 13.269px star strip is taller than the trimmed text, whose
                * height is now its cap height (12.063 x 0.73438 = 8.859px).
                * Pulling 2.205px off each side leaves the strip optically
                * centred without letting it set the row's height.
                */}
              <span className="my-[-2.205px] flex shrink-0">
                <StarRating rating={book.rating} />
              </span>
              <p
                className="trim-both whitespace-nowrap text-meta leading-[19.301px] text-black"
              >
                {book.rating.toFixed(2)} · {book.ratingsCount.toLocaleString("en-US")} ratings ·{" "}
                {book.year}
              </p>
            </div>
          </div>

          <ShelfButton
            shelf={shelves[book.id] ?? null}
            onChange={(next) => setShelf(book.id, next)}
          />
        </div>
      </div>
    </li>
  );
}
