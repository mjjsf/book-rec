"use client";

import { useRouter } from "next/navigation";
import { CloseIcon } from "./icons";

/**
 * The sand header bar (283:82) with the 45px close chip (283:122) pinned at
 * top-[46px] right-[14px]. `variant="bare"` drops the sand fill for the
 * Discover screen, which uses a white bar.
 */
export function AppHeader({
  onClose,
  variant = "sand",
}: {
  onClose?: () => void;
  variant?: "sand" | "bare";
}) {
  const router = useRouter();
  const close = onClose ?? (() => router.push("/discover"));

  return (
    <header
      className={`absolute inset-x-0 top-0 h-[102px] ${
        variant === "sand" ? "bg-header-sand" : "bg-white"
      }`}
    >
      <button
        type="button"
        onClick={close}
        aria-label="Close the assistant"
        className="absolute right-[13px] top-[46px] flex size-[45px] items-center justify-center rounded-chip border border-white bg-chip text-black shadow-chip transition-transform active:scale-95"
      >
        <CloseIcon />
      </button>
    </header>
  );
}
