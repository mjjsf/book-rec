"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  DiscoverIcon,
  HomeIcon,
  MoreIcon,
  MyBooksIcon,
  SparkleIcon,
} from "./icons";

/**
 * The floating nav pill (283:84) plus the 63px assistant FAB (283:116).
 *
 * The Figma has two variants: four items on Start/Entry/Recommendation and
 * five on Panel (287:836), which adds Search.
 */
const ITEMS = [
  { href: "/home", label: "Home", Icon: HomeIcon },
  { href: "/my-books", label: "My Books", Icon: MyBooksIcon },
  { href: "/discover", label: "Discover", Icon: DiscoverIcon },
  { href: "/more", label: "More", Icon: MoreIcon },
] as const;

/**
 * The bar positions itself. Every screen wants it at the same place — 16px from
 * the left, right and bottom of the 393x852 frame (Figma 283:83, 340:522,
 * 287:835) — and the bar is 361px wide (288 pill + 10 gap + 63 FAB) and 63px
 * tall, so left-16 gives right-16 and top-773 gives bottom-16. Keeping the
 * placement here rather than at each call site is what stops the screens
 * drifting apart from one another.
 */
export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="absolute left-[16px] top-[773px] z-30 flex items-center gap-[10px]"
      aria-label="Primary"
    >
      <div
        // Height is pinned rather than derived from padding: the Figma pill is
        // exactly 63px (283:84), the same as the FAB, and letting the 1px
        // border and the label's line-height push it to 68 is what threw the
        // bar's bottom gap out of line with its left and right ones.
        className="flex h-[63px] w-[288px] items-center justify-center gap-[31px] rounded-pill border border-nav-pill-border bg-nav-pill px-[24px] shadow-nav"
      >
        {ITEMS.map(({ href, label, Icon }) => (
          <Link
            key={label}
            href={href}
            aria-current={pathname === href ? "page" : undefined}
            className="ring-focus flex flex-col items-center justify-center gap-[8px] rounded-[8px] px-[4px] py-[2px] text-nav-label transition-colors hover:text-green-500 aria-[current=page]:text-green-500"
          >
            <Icon />
            <span className="whitespace-nowrap text-nav font-medium leading-none">{label}</span>
          </Link>
        ))}
      </div>

      <Link
        href="/"
        aria-label="Ask the book assistant"
        className="ring-focus flex size-[63px] shrink-0 items-center justify-center rounded-pill border border-white bg-nav-pill text-nav-label shadow-fab transition hover:bg-chip hover:text-green-500 active:scale-95"
      >
        <SparkleIcon />
      </Link>
    </nav>
  );
}
