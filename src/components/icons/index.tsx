/**
 * Icons for the book-rec surface.
 *
 * These are hand-authored to match the glyphs and box sizes in the Figma file
 * (283:86 home, 283:92 my-books, 283:101 discover, 283:111 more, 283:123 close,
 * 283:131 send, 283:138 AI-details shield, 283:119 sparkle, 283:242 caret).
 * The exported Figma assets could not be downloaded in this environment — the
 * asset host is blocked by the network policy — so each icon reproduces the
 * designed geometry rather than the exact exported bytes. Sizes below are the
 * designed sizes and should not be changed casually.
 */

interface IconProps {
  className?: string;
}

/** 20 x 20 — bottom nav "Home" (283:86). */
export function HomeIcon({ className }: IconProps) {
  return (
    <svg
      className={className}
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M2.2 8.2 10 2.1l7.8 6.1v9.1a.9.9 0 0 1-.9.9h-4.4v-5.5H7.5v5.5H3.1a.9.9 0 0 1-.9-.9V8.2Z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** 16.02 x 20 — bottom nav "My Books" (283:92), a bookmarked book. */
export function MyBooksIcon({ className }: IconProps) {
  return (
    <svg
      className={className}
      width="17"
      height="20"
      viewBox="0 0 17 20"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M1.2 2.3A1.4 1.4 0 0 1 2.6.9h11.8a1.4 1.4 0 0 1 1.4 1.4v16.8l-4.6-3.1-4.6 3.1V.9"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  );
}

/** 20 x 20 — bottom nav "Discover" (283:101), a compass. */
export function DiscoverIcon({ className }: IconProps) {
  return (
    <svg
      className={className}
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      aria-hidden="true"
    >
      <circle cx="10" cy="10" r="8.6" stroke="currentColor" strokeWidth="1.3" />
      <path
        d="m13.4 6.6-1.9 4.9-4.9 1.9 1.9-4.9 4.9-1.9Z"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** 20 x 20 — bottom nav "Search" (287:857), only present on the Panel screen. */
export function SearchIcon({ className }: IconProps) {
  return (
    <svg
      className={className}
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      aria-hidden="true"
    >
      <circle cx="8.6" cy="8.6" r="6.9" stroke="currentColor" strokeWidth="1.4" />
      <path d="m13.7 13.7 4.6 4.6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

/** 18 x 20 — bottom nav "More" (283:111), three rules 6.04px apart. */
export function MoreIcon({ className }: IconProps) {
  return (
    <svg
      className={className}
      width="18"
      height="20"
      viewBox="0 0 18 20"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M0 3.96h18M0 10h18M0 16.04h18"
        stroke="currentColor"
        strokeWidth="1.04"
        strokeLinecap="square"
      />
    </svg>
  );
}

/** 11 x 11 — the close glyph inside the 45px header chip (283:123). */
export function CloseIcon({ className }: IconProps) {
  return (
    <svg
      className={className}
      width="11"
      height="11"
      viewBox="0 0 11 11"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M.7.7l9.6 9.6M10.3.7.7 10.3"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

/** 20 x 20 — the composer's send button (283:131, "BiSend"). */
export function SendIcon({ className }: IconProps) {
  return (
    <svg
      className={className}
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M2.2 2.5 18 10 2.2 17.5 4.6 10 2.2 2.5Z"
        stroke="currentColor"
        strokeWidth="1.35"
        strokeLinejoin="round"
      />
      <path d="M4.6 10H18" stroke="currentColor" strokeWidth="1.35" strokeLinecap="round" />
    </svg>
  );
}

/** 17 x 20 — the "AI details" shield with an information mark (283:138). */
export function ShieldInfoIcon({ className }: IconProps) {
  return (
    <svg
      className={className}
      width="17"
      height="20"
      viewBox="0 0 17 20"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M8.5.8 15.9 3v7.2c0 4.1-3 7.4-7.4 9-4.4-1.6-7.4-4.9-7.4-9V3L8.5.8Z"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinejoin="round"
      />
      <path d="M8.5 8.4v4.3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
      <circle cx="8.5" cy="6" r="0.95" fill="currentColor" />
    </svg>
  );
}

/** 25.11 x 25.44 — the sparkle in the 63px assistant FAB (283:119). */
export function SparkleIcon({ className }: IconProps) {
  return (
    <svg
      className={className}
      width="26"
      height="26"
      viewBox="0 0 26 26"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M15.4 0c0 5.6 3.9 9.7 10.6 10.6-6.7.9-10.6 5-10.6 10.6C14.5 15 10.5 11 3.9 10.6 10.5 9.7 14.5 5.6 15.4 0Z"
        fill="currentColor"
      />
      <path
        d="M5.2 15.1c.4 2.9 2 4.6 5 5.1-3 .5-4.6 2.2-5 5.2-.4-3-2-4.7-5-5.2 3-.5 4.6-2.2 5-5.1Z"
        fill="currentColor"
      />
    </svg>
  );
}

/** 8.44 x 4.83 — the caret inside the "Want to Read" button (283:242). */
export function CaretIcon({ className }: IconProps) {
  return (
    <svg
      className={className}
      width="9"
      height="5"
      viewBox="0 0 9 5"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M.7.7 4.2 4 7.7.7"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** A single star for the rating strip; the strip is 67.55 x 13.27 (283:222). */
export function StarIcon({ className }: IconProps) {
  return (
    <svg
      className={className}
      width="13"
      height="13"
      viewBox="0 0 13 13"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M6.5.9 8.3 4.5l4 .6-2.9 2.8.7 4-3.6-1.9L2.9 12l.7-4L.7 5.1l4-.6L6.5.9Z" />
    </svg>
  );
}

/** 20 x 20 — the camera in the Discover search bar (287:1133 region). */
export function CameraIcon({ className }: IconProps) {
  return (
    <svg
      className={className}
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      aria-hidden="true"
    >
      <rect x="1" y="4.6" width="18" height="12.8" rx="2.2" stroke="currentColor" strokeWidth="1.3" />
      <circle cx="10" cy="11" r="3.5" stroke="currentColor" strokeWidth="1.3" />
      <path d="M6.6 4.6 7.8 2.3h4.4l1.2 2.3" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
    </svg>
  );
}

/** 20 x 20 — the bell in the Discover header. */
export function BellIcon({ className }: IconProps) {
  return (
    <svg
      className={className}
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M4.2 14.6V8.9a5.8 5.8 0 1 1 11.6 0v5.7l1.5 2H2.7l1.5-2Z"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinejoin="round"
      />
      <path d="M8.1 18.6a2 2 0 0 0 3.8 0" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  );
}

/** Chevron used by the Discover shelf headers. */
export function ChevronRightIcon({ className }: IconProps) {
  return (
    <svg
      className={className}
      width="9"
      height="16"
      viewBox="0 0 9 16"
      fill="none"
      aria-hidden="true"
    >
      <path d="M1.2 1.2 7.8 8l-6.6 6.8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
