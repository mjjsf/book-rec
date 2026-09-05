"use client";

import { usePathname, useRouter } from "next/navigation";
import { CloseIcon } from "./icons";

/**
 * The sand header bar (283:82) with the 45px close chip (283:122) pinned at
 * top-[46px] right-[13px].
 *
 * The chip closes back to the first screen. On the first screen there is
 * nowhere to close to, so it stays drawn — the Figma Start frame does show it —
 * but goes inert rather than pretending to be actionable.
 *
 * Targets carry a trailing slash to match `trailingSlash: true`; an unslashed
 * push can miss the static export's route manifest and land on the blank 404.
 */
export function AppHeader({ onClose }: { onClose?: () => void }) {
  const router = useRouter();
  const pathname = usePathname();

  const onFirstScreen = pathname === "/" || pathname === "";
  const inert = onFirstScreen && !onClose;
  const close = onClose ?? (() => router.push("/"));

  return (
    <header className="absolute inset-x-0 top-0 h-[102px] bg-header-sand">
      <button
        type="button"
        onClick={inert ? undefined : close}
        aria-label="Close the assistant"
        aria-disabled={inert || undefined}
        className={`ring-focus absolute right-[13px] top-[46px] flex size-[45px] items-center justify-center rounded-chip border border-white bg-chip text-black shadow-chip transition ${
          inert ? "cursor-default" : "hover:bg-nav-pill hover:shadow-fab active:scale-95"
        }`}
      >
        <CloseIcon />
      </button>
    </header>
  );
}
