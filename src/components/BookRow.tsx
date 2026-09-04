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
    <li className="flex flex-col gap-[19px] border-b border-hairline pb-[19px] last:border-b-0">
      <div className="flex gap-[20px]">
        <BookCover book={book} width={70} height={105} />

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
