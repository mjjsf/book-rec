"use client";

import { AiDetailsButton, AiDetailsPopover } from "./AiDetailsButton";
import { HistorySwitch } from "./HistorySwitch";

/**
 * The row under every composer (283:132 / 283:345): the reading-history
 * switch on the left, "AI details" on the right.
 *
 * It is also the anchor for the AI-details card when `popoverPlacement` is
 * given — on the Start screen the card hangs 16px below this row, right-aligned
 * to it. The Refine dock anchors the card to its field instead and leaves this
 * undefined.
 */
export function AssistantControls({
  useHistory,
  onUseHistoryChange,
  detailsOpen,
  onDetailsToggle,
  popoverPlacement,
}: {
  useHistory: boolean;
  onUseHistoryChange: (next: boolean) => void;
  detailsOpen: boolean;
  onDetailsToggle: (next: boolean) => void;
  popoverPlacement?: string;
}) {
  return (
    <div className="relative flex w-full items-center justify-between">
      <HistorySwitch checked={useHistory} onChange={onUseHistoryChange} />
      <AiDetailsButton open={detailsOpen} onToggle={onDetailsToggle} />

      {detailsOpen && popoverPlacement ? (
        <AiDetailsPopover
          onClose={() => onDetailsToggle(false)}
          className={popoverPlacement}
        />
      ) : null}
    </div>
  );
}
