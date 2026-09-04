"use client";

import { useEffect, useRef } from "react";
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
      className="flex items-center gap-[6px] text-black"
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
          <strong className="font-semibold">“Use my reading history” option</strong>
          <br />
          Activating this option will make your reading history, and any related ratings
          and reviews, available to the AI chatbot for consideration when making
          recommendations.
        </p>
        <p>
          <strong className="font-semibold">Privacy</strong>
          <br />
          This AI chatbot does not save or use any personally identifying information,
          and is designed only for book recommendation.
        </p>
      </div>
    </div>
  );
}
