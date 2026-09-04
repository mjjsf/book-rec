"use client";

import { AssistantControls } from "./AssistantControls";
import { PromptComposer } from "./PromptComposer";

/**
 * The sticky bottom sheet on the Recommendation and Panel screens
 * (283:339 / 287:824): a white panel with a top rule holding "Refine results:",
 * the composer and the controls row.
 *
 * Anchored to its top edge, not the frame's bottom. In Figma the sheet starts
 * at y=568 and its 325px height runs past the 852px frame, so the frame clips
 * it; anchoring to the bottom instead would slide the whole sheet up by the
 * difference. `BottomNav` is a sibling rather than a child for the same
 * reason — inside this column its position would depend on how tall the
 * composer happens to be.
 */
export function RefineDock({
  value,
  onChange,
  onSubmit,
  pending,
  useHistory,
  onUseHistoryChange,
  detailsOpen,
  onDetailsToggle,
}: {
  value: string;
  onChange: (next: string) => void;
  onSubmit: () => void;
  pending: boolean;
  useHistory: boolean;
  onUseHistoryChange: (next: boolean) => void;
  detailsOpen: boolean;
  onDetailsToggle: (next: boolean) => void;
}) {
  return (
    <section className="absolute inset-x-0 top-[567px] z-20 flex h-[285px] flex-col items-center border-t border-rule bg-white px-[16px] pt-[22px]">
      <div className="flex w-[361px] flex-col gap-[16px]">
        <p className="h-[18px] text-body font-medium leading-none text-black">
          Refine results:
        </p>
        <PromptComposer
          value={value}
          onChange={onChange}
          onSubmit={onSubmit}
          disabled={pending}
          label="Refine your recommendations"
          minHeight={95}
          maxHeight={95}
        />
        <AssistantControls
          useHistory={useHistory}
          onUseHistoryChange={onUseHistoryChange}
          detailsOpen={detailsOpen}
          onDetailsToggle={onDetailsToggle}
        />
      </div>
    </section>
  );
}
