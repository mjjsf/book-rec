"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  DiscoverIcon,
  HomeIcon,
  MoreIcon,
  MyBooksIcon,
  SearchIcon,
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
  { href: "/search", label: "Search", Icon: SearchIcon },
  { href: "/more", label: "More", Icon: MoreIcon },
] as const;

export function BottomNav({
  items = 4,
  className = "",
}: {
  items?: 4 | 5;
  className?: string;
}) {
  const pathname = usePathname();
  const shown = items === 5 ? ITEMS : ITEMS.filter((i) => i.label !== "Search");

  return (
    <nav className={`flex items-center gap-[10px] ${className}`} aria-label="Primary">
      <div
        className={`flex w-[288px] items-center justify-center rounded-pill border border-nav-pill-border bg-nav-pill px-[24px] py-[14px] shadow-nav ${
          items === 5 ? "gap-[14px]" : "gap-[31px]"
        }`}
      >
        {shown.map(({ href, label, Icon }) => (
          <Link
            key={label}
            href={href}
            aria-current={pathname === href ? "page" : undefined}
            className="flex flex-col items-center justify-center gap-[8px] text-nav-label"
          >
            <Icon />
            <span className="whitespace-nowrap text-nav font-medium leading-none">{label}</span>
          </Link>
        ))}
      </div>

      <Link
        href="/"
        aria-label="Ask the book assistant"
        className="flex size-[63px] shrink-0 items-center justify-center rounded-pill border border-white bg-nav-pill text-nav-label shadow-fab transition-transform active:scale-95"
      >
        <SparkleIcon />
      </Link>
    </nav>
  );
}
