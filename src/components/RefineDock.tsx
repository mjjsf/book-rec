"use client";

import { AssistantControls } from "./AssistantControls";
import { BottomNav } from "./BottomNav";
import { PromptComposer } from "./PromptComposer";

/**
 * The sticky bottom sheet on the Recommendation and Panel screens
 * (283:339 / 287:824): a 325px white panel with a top rule, holding
 * "Refine results:", the composer, the controls row, and the nav.
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
  navItems = 4,
}: {
  value: string;
  onChange: (next: string) => void;
  onSubmit: () => void;
  pending: boolean;
  useHistory: boolean;
  onUseHistoryChange: (next: boolean) => void;
  detailsOpen: boolean;
  onDetailsToggle: (next: boolean) => void;
  navItems?: 4 | 5;
}) {
  return (
    <section className="absolute inset-x-0 bottom-0 z-20 flex h-[325px] flex-col items-center gap-[18px] border-t border-rule bg-white px-[16px] pt-[22px] pb-[16px]">
      <div className="flex w-[361px] flex-col gap-[16px]">
        <p className="text-body font-medium leading-none text-black">Refine results:</p>
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
      <BottomNav items={navItems} />
    </section>
  );
}
