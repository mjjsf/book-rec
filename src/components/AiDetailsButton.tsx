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
      // The popover's outside-click handler skips anything inside this
      // attribute. Without it the card closed on mousedown and this button's
      // click reopened it in the same gesture, so it looked stuck open.
      data-ai-details-trigger=""
      onClick={() => onToggle(!open)}
      aria-expanded={open}
      className="ring-focus flex cursor-pointer items-center gap-[6px] rounded-[6px] text-black"
    >
      <ShieldInfoIcon />
      <span className="text-control leading-none">AI details</span>
    </button>
  );
}

/**
 * The AI-details card (283:398).
 *
 * It does not choose where it sits: the caller passes a `className` and renders
 * it inside whatever it should be anchored to, so placement is a fact of the
 * markup rather than an offset to keep in sync.
 *
 * There is no scrim. The overlay frame renders as a shadowed white card with no
 * dimming, and a scrim here would be a trap anyway — the device wrapper carries
 * a CSS transform, which makes it the containing block for `position: fixed`,
 * so a "full-viewport" overlay would silently scope to the frame. Dismissal is
 * a document listener instead, the same pattern ShelfButton uses.
 */
export function AiDetailsPopover({
  onClose,
  className = "",
}: {
  onClose: () => void;
  className?: string;
}) {
  const card = useRef<HTMLDivElement>(null);

  useEffect(() => {
    card.current?.focus();

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    const onPointerDown = (event: MouseEvent) => {
      const target = event.target as Element | null;
      // Leave the trigger alone so its own click can toggle the card closed.
      if (target?.closest?.("[data-ai-details-trigger]")) return;
      if (!card.current?.contains(target as Node)) onClose();
    };

    document.addEventListener("keydown", onKey);
    // Deferred a tick so the click that opened the card does not close it.
    const id = window.setTimeout(
      () => document.addEventListener("mousedown", onPointerDown),
      0,
    );

    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onPointerDown);
      window.clearTimeout(id);
    };
  }, [onClose]);

  return (
    <div
      ref={card}
      tabIndex={-1}
      role="dialog"
      aria-modal="false"
      aria-label="AI details"
      className={`animate-fade-in absolute z-40 w-[319px] rounded-composer border border-field-border bg-white p-[16px] text-control leading-[1.35] shadow-fab outline-none ${className}`}
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
  );
}
