"use client";

import { AiDetailsButton } from "./AiDetailsButton";
import { HistorySwitch } from "./HistorySwitch";

/**
 * The row under every composer (283:132 / 283:345): the reading-history
 * switch on the left, "AI details" on the right.
 */
export function AssistantControls({
  useHistory,
  onUseHistoryChange,
  detailsOpen,
  onDetailsToggle,
}: {
  useHistory: boolean;
  onUseHistoryChange: (next: boolean) => void;
  detailsOpen: boolean;
  onDetailsToggle: (next: boolean) => void;
}) {
  return (
    <div className="flex w-full items-center justify-between">
      <HistorySwitch checked={useHistory} onChange={onUseHistoryChange} />
      <AiDetailsButton open={detailsOpen} onToggle={onDetailsToggle} />
    </div>
  );
}
