"use client";

import { AiDetailsPopover } from "./AiDetailsButton";
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
    <section className="absolute inset-x-0 top-[567px] z-20 flex h-[285px] flex-col items-center border-t border-rule bg-white px-[16px] pt-[22px]">
      <div className="flex w-[361px] flex-col gap-[16px]">
        <p className="h-[18px] text-body font-medium leading-none text-black">
          Refine results:
        </p>
        {/*
          * The card is anchored to the field rather than to the controls row:
          * the row sits at y~734, so a 218px card 16px below it would end at
          * ~988, well past the 852px frame. Rendering it here with
          * right-0 bottom-0 puts its bottom-right corner exactly on the
          * field's, which needs no arithmetic to stay correct.
          */}
        <div className="relative">
          <PromptComposer
            // Nothing to plumb: the field takes no input, so its value is
            // always empty and Send stays disabled by the composer's own
            // `canSend` check. A submit handler here would never fire.
            value=""
            onSubmit={() => {}}
            label="Refine your recommendations"
            minHeight={95}
            maxHeight={95}
          />
          {detailsOpen ? (
            <AiDetailsPopover
              onClose={() => onDetailsToggle(false)}
              className="right-0 bottom-0"
            />
          ) : null}
        </div>
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
