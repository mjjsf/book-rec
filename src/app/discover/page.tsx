"use client";

import Link from "next/link";
import { useMemo } from "react";
import { BottomNav } from "@/components/BottomNav";
import { CoverArt } from "@/components/CoverArt";
import { PhoneFrame } from "@/components/PhoneFrame";
import { BellIcon, CameraIcon, ChevronRightIcon, SearchIcon } from "@/components/icons";
import { CATALOG, requireBook } from "@/lib/catalog";
import { CURRENTLY_READING_ID } from "@/lib/readingHistory";
import type { Book } from "@/lib/types";

/**
 * Carousel (287:1135) — the Discover feed the assistant is entered from.
 *
 * In Figma this frame is a flattened screenshot with the two recommendation
 * shelves drawn on top, so this is a code-built approximation of that layout:
 * the search bar, a promoted card, then the "Based on your reading history"
 * (287:1127) and "Because you're reading ..." (287:1131) cover shelves, each
 * of which deep-links into the assistant.
 */
function Shelf({
  title,
  books,
  href,
}: {
  title: string;
  books: Book[];
  href: string;
}) {
  return (
    <section className="flex flex-col gap-[12px]">
      <Link href={href} className="flex items-center justify-between pr-[16px]">
        <h2 className="font-serif text-[17px] leading-[1.2] text-black">{title}</h2>
        <ChevronRightIcon className="text-black/60" />
      </Link>
      <ul className="scroll-area flex gap-[16px] overflow-x-auto pb-[4px]">
        {books.map((book) => (
          <li key={book.id} className="shrink-0">
            <Link href={href} aria-label={`${book.title} by ${book.author}`}>
              <CoverArt book={book} width={79} height={119} />
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

export default function DiscoverScreen() {
  const currentlyReading = requireBook(CURRENTLY_READING_ID);

  const historyShelf = useMemo(
    () =>
      ["dungeon-crawler-carl", "project-hail-mary", "annihilation", "stories-of-your-life"].map(
        requireBook,
      ),
    [],
  );

  // Books that share a subject with what the reader is part-way through.
  const relatedShelf = useMemo(() => {
    const subjects = new Set(currentlyReading.subjects);
    return CATALOG.filter(
      (book) =>
        book.id !== currentlyReading.id && book.subjects.some((s) => subjects.has(s)),
    ).slice(0, 5);
  }, [currentlyReading]);

  return (
    <PhoneFrame>
      <div className="absolute inset-x-0 top-0 z-10 flex h-[64px] items-center gap-[12px] border-b border-hairline bg-white px-[16px]">
        <div className="flex flex-1 items-center gap-[8px] rounded-composer border border-field-border px-[10px] py-[7px] text-placeholder">
          <SearchIcon className="size-[16px]" />
          <span className="text-control">Title, author or ISBN</span>
        </div>
        <CameraIcon className="text-black/70" />
        <BellIcon className="text-black/70" />
      </div>

      <div className="scroll-area absolute inset-x-0 top-[64px] bottom-[100px] px-[16px] pt-[16px]">
        <div className="flex flex-col gap-[28px] pb-[24px]">
          <section className="rounded-composer border border-hairline p-[14px]">
            <p className="text-[10px] uppercase tracking-[0.08em] text-placeholder">
              Editors&apos; pick
            </p>
            <h2 className="mt-[6px] font-serif text-[19px] leading-[1.2] text-black">
              New Voices Alert! 51 New &amp; Upcoming Debut Novels
            </h2>
            <p className="mt-[6px] text-meta text-byline/70">335 likes</p>
          </section>

          <Shelf
            title="Based on your reading history"
            books={historyShelf}
            href="/panel"
          />

          <Shelf
            title={`Because you're reading ${currentlyReading.title}`}
            books={relatedShelf}
            href={`/chat?q=${encodeURIComponent(
              `Books like ${currentlyReading.title} by ${currentlyReading.author}`,
            )}`}
          />
        </div>
      </div>

      <BottomNav className="absolute left-[16px] bottom-[16px]" />
    </PhoneFrame>
  );
}
