"use client";

import { Suspense, useState } from "react";
import { useAppState } from "@/components/AppStateProvider";
import { RefineDock } from "@/components/RefineDock";
import { ResultsList } from "@/components/ResultsList";
import { RATIONALE, SAMPLE_QUERY, getResultBooks } from "@/lib/designContent";
import { Bubble, QuestionBubble } from "./QuestionBubble";

/**
 * Recommendation (283:203).
 *
 * Presentational by design: the bubble echoes whatever was asked, and the reply
 * below it is the design's own copy and its four books. Nothing ranks anything,
 * so refining re-presents the same designed result rather than pretending to
 * narrow it — the Figma has one result state and this is it.
 */
export function ChatScreen() {
  const { useHistory, setUseHistory } = useAppState();
  const [detailsOpen, setDetailsOpen] = useState(false);

  const books = getResultBooks();

  return (
    <>
      <div className="scroll-area absolute inset-x-0 top-[102px] bottom-[285px] px-[16px] pt-[32px] pb-[24px]">
        <div className="flex flex-col gap-[32px]">
          {/*
            * Only the bubble reads ?q=, so only the bubble sits behind a
            * Suspense boundary. The fallback is the designed question, so the
            * prerendered HTML is already right.
            */}
          <Suspense fallback={<Bubble text={SAMPLE_QUERY} />}>
            <QuestionBubble />
          </Suspense>

          <p className="whitespace-pre-line text-body leading-[1.32] text-black">
            {RATIONALE}
          </p>

          <ResultsList books={books} />
        </div>
      </div>

      <RefineDock
        useHistory={useHistory}
        onUseHistoryChange={setUseHistory}
        detailsOpen={detailsOpen}
        onDetailsToggle={setDetailsOpen}
      />

    </>
  );
}
