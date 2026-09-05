import { BookRow } from "./BookRow";
import type { Book } from "@/lib/types";

/** The 361px-wide stack of result rows (283:213). */
export function ResultsList({ books }: { books: Book[] }) {
  return (
    <ul
      /*
       * --row-split is the space on each side of the hairline between two
       * books: this gap below it, and each row's padding-bottom above it (see
       * BookRow). They are the same value because that is what centres the
       * rule between the covers it divides.
       *
       * 15.805 = (32.61 - 1) / 2, where 32.61px is the space the covers
       * already had between them and 1px is the rule itself. So the rule moves
       * down 5.195px and nothing else on the screen moves.
       */
      style={{ "--row-split": "15.805px" } as React.CSSProperties}
      className="flex w-full flex-col gap-[var(--row-split)]"
    >
      {books.map((book) => (
        <BookRow key={book.id} book={book} />
      ))}
    </ul>
  );
}
