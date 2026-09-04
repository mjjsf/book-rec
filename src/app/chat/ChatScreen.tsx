"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { AiDetailsPopover } from "@/components/AiDetailsButton";
import { AppHeader } from "@/components/AppHeader";
import { useAppState } from "@/components/AppStateProvider";
import { BottomNav } from "@/components/BottomNav";
import { PhoneFrame } from "@/components/PhoneFrame";
import { RefineDock } from "@/components/RefineDock";
import { ResultsList } from "@/components/ResultsList";
import { RATIONALE, SAMPLE_QUERY, getResultBooks } from "@/lib/designContent";

/**
 * Recommendation (283:203).
 *
 * Presentational by design: the bubble echoes whatever was asked, and the reply
 * below it is the design's own copy and its four books. Nothing ranks anything,
 * so refining re-presents the same designed result rather than pretending to
 * narrow it — the Figma has one result state and this is it.
 */
export function ChatScreen() {
  const params = useSearchParams();
  const question = params.get("q") ?? SAMPLE_QUERY;

  const { useHistory, setUseHistory } = useAppState();
  const [refinement, setRefinement] = useState("");
  const [detailsOpen, setDetailsOpen] = useState(false);

  const books = getResultBooks();

  return (
    <PhoneFrame>
      <AppHeader />

      <div className="scroll-area absolute inset-x-0 top-[102px] bottom-[285px] px-[16px] pt-[32px] pb-[24px]">
        <div className="flex flex-col gap-[32px]">
          <div className="flex justify-end">
            <div className="max-w-[308px] rounded-bubble bg-bubble-sand p-[16px]">
              <p className="text-control leading-[1.35] text-black">{question}</p>
            </div>
          </div>

          <p className="whitespace-pre-line text-body leading-[1.32] text-black">
            {RATIONALE}
          </p>

          <ResultsList books={books} />
        </div>
      </div>

      <RefineDock
        value={refinement}
        onChange={setRefinement}
        onSubmit={() => setRefinement("")}
        useHistory={useHistory}
        onUseHistoryChange={setUseHistory}
        detailsOpen={detailsOpen}
        onDetailsToggle={setDetailsOpen}
      />

      <BottomNav />

      {detailsOpen ? <AiDetailsPopover onClose={() => setDetailsOpen(false)} /> : null}
    </PhoneFrame>
  );
}
