import { BookRow } from "./BookRow";
import type { Book } from "@/lib/types";

/** The 361px-wide stack of result rows (283:213). */
export function ResultsList({ books }: { books: Book[] }) {
  return (
    <ul className="flex w-full flex-col gap-[21px]">
      {books.map((book) => (
        <BookRow key={book.id} book={book} />
      ))}
    </ul>
  );
}
