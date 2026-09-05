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
 * Decorative. The Figma flow covers two screens, so the bar is drawn exactly as
 * designed but goes nowhere: no links, no hover colour, no focus ring, and
 * nothing in the tab order — a control that does nothing should not advertise
 * itself to a keyboard or a screen reader.
 *
 * It positions itself: 16px from the left, right and bottom of the 393x852
 * frame (283:83, 340:522). The bar is 361px wide (288 pill + 10 gap + 63 FAB)
 * and 63px tall, so left-16 gives right-16 and top-773 gives bottom-16. Keeping
 * the placement here rather than at each call site is what stops the screens
 * drifting apart.
 */
const ITEMS = [
  { label: "Home", Icon: HomeIcon },
  { label: "My Books", Icon: MyBooksIcon },
  { label: "Discover", Icon: DiscoverIcon },
  { label: "More", Icon: MoreIcon },
] as const;

export function BottomNav() {
  return (
    <div
      className="absolute left-[16px] top-[773px] z-30 flex cursor-default items-center gap-[10px]"
      data-testid="bottom-nav"
      aria-hidden="true"
    >
      <div
        // Height is pinned rather than derived from padding: the Figma pill is
        // exactly 63px (283:84), the same as the FAB, and letting the 1px
        // border and the label's line-height push it to 68 is what threw the
        // bar's bottom gap out of line with its left and right ones.
        className="flex h-[63px] w-[288px] items-center justify-center gap-[31px] rounded-pill border border-nav-pill-border bg-nav-pill px-[24px] shadow-nav"
      >
        {ITEMS.map(({ label, Icon }) => (
          <span
            key={label}
            className="flex flex-col items-center justify-center gap-[8px] px-[4px] py-[2px] text-nav-label"
          >
            <Icon />
            <span className="whitespace-nowrap text-nav font-medium leading-none">{label}</span>
          </span>
        ))}
      </div>

      <span className="flex size-[63px] shrink-0 items-center justify-center rounded-pill border border-white bg-nav-pill text-nav-label shadow-fab">
        <SparkleIcon />
      </span>
    </div>
  );
}
