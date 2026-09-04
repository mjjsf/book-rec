"use client";

import { useEffect, useRef } from "react";
import { AI_DETAILS } from "@/lib/designContent";
import { ShieldInfoIcon } from "./icons";

/**
 * The "AI details" affordance (283:137) and the popover it opens (283:398).
 * The copy is the design's, verbatim.
 */
export function AiDetailsButton({
  open,
  onToggle,
}: {
  open: boolean;
  onToggle: (next: boolean) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onToggle(!open)}
      aria-expanded={open}
      className="ring-focus flex cursor-pointer items-center gap-[6px] rounded-[6px] text-black transition-colors hover:text-green-500"
    >
      <ShieldInfoIcon />
      <span className="text-control leading-none">AI details</span>
    </button>
  );
}

export function AiDetailsPopover({ onClose }: { onClose: () => void }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    ref.current?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="absolute inset-0 z-30 flex items-center justify-center">
      <button
        type="button"
        aria-label="Dismiss"
        onClick={onClose}
        className="absolute inset-0 cursor-default bg-black/25"
      />
      <div
        ref={ref}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label="AI details"
        className="relative w-[319px] rounded-composer border border-field-border bg-white p-[16px] text-control leading-[1.35] shadow-fab outline-none"
      >
        <p className="mb-[14px]">
          <strong className="font-semibold">{AI_DETAILS.historyHeading}</strong>
          <br />
          {AI_DETAILS.historyBody}
        </p>
        <p>
          <strong className="font-semibold">{AI_DETAILS.privacyHeading}</strong>
          <br />
          {AI_DETAILS.privacyBody}
        </p>
      </div>
    </div>
  );
}
