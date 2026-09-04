import type { Book } from "@/lib/types";

/**
 * Generated cover art.
 *
 * The Figma covers are bitmap fills whose exported URLs are unreachable from
 * this environment (the asset host is blocked by the network policy), so each
 * cover is drawn from the book's own two-tone palette at the designed box
 * sizes: 70 x 105 in the result rows (283:216) and 79 x 119 in the Discover
 * carousel (287:1009).
 */
export function CoverArt({
  book,
  width,
  height,
  className = "",
}: {
  book: Book;
  width: number;
  height: number;
  className?: string;
}) {
  const gradientId = `cover-${book.id}`;
  const words = book.title.split(" ").filter(Boolean);
  // Keep the stack readable at 70px wide: at most four lines.
  const lines: string[] = [];
  for (const word of words) {
    const last = lines[lines.length - 1];
    if (last && `${last} ${word}`.length <= 10 && lines.length >= 1) {
      lines[lines.length - 1] = `${last} ${word}`;
    } else {
      lines.push(word);
    }
  }
  const shown = lines.slice(0, 4);

  return (
    <svg
      className={className}
      width={width}
      height={height}
      viewBox="0 0 70 105"
      role="img"
      aria-label={`${book.title} by ${book.author}`}
      style={{ display: "block", flexShrink: 0 }}
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={book.cover.from} />
          <stop offset="100%" stopColor={book.cover.to} />
        </linearGradient>
      </defs>
      <rect width="70" height="105" rx="2" fill={`url(#${gradientId})`} />
      <rect x="0" y="0" width="3.5" height="105" fill="rgba(0,0,0,0.22)" />
      <g fill={book.cover.ink} fontFamily="Georgia, serif" fontSize="8.5">
        {shown.map((line, index) => (
          <text key={line + String(index)} x="9" y={26 + index * 11}>
            {line}
          </text>
        ))}
      </g>
      <text
        x="9"
        y="94"
        fill={book.cover.ink}
        fontFamily="Georgia, serif"
        fontSize="5.4"
        opacity="0.85"
      >
        {book.author.length > 18 ? `${book.author.slice(0, 17)}…` : book.author}
      </text>
    </svg>
  );
}
