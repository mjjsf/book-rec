"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { AiDetailsPopover } from "@/components/AiDetailsButton";
import { AppHeader } from "@/components/AppHeader";
import { useAppState } from "@/components/AppStateProvider";
import { BottomNav } from "@/components/BottomNav";
import { PhoneFrame } from "@/components/PhoneFrame";
import { RefineDock } from "@/components/RefineDock";
import { ResultsList } from "@/components/ResultsList";
import { Thinking } from "@/components/Thinking";
import { requestRecommendations } from "@/lib/client";
import type { ChatTurn } from "@/lib/types";

/**
 * The Recommendation screen (283:203): the conversation scrolls behind a
 * fixed 325px refine dock. Each turn is a user bubble (283:210), the
 * rationale (283:212), then the result rows.
 */
export function ChatScreen() {
  const params = useSearchParams();
  const initialPrompt = params.get("q") ?? "";

  const { turns, addTurn, useHistory, setUseHistory } = useAppState();
  const [refinement, setRefinement] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  const scroller = useRef<HTMLDivElement>(null);
  const latestTurn = useRef<HTMLElement>(null);
  // Guards the initial request against React 19 strict-mode double effects.
  const requested = useRef<string | null>(null);

  const ask = useCallback(
    async (prompt: string) => {
      setPending(true);
      setError(null);
      try {
        const result = await requestRecommendations({
          prompt,
          useHistory,
          previousTurns: turns.map((turn) => ({
            prompt: turn.prompt,
            bookIds: turn.recommendations.map((r) => r.book.id),
          })),
        });
        const turn: ChatTurn = {
          id: `${Date.now()}-${result.recommendations.length}`,
          prompt,
          usedHistory: useHistory,
          rationale: result.rationale,
          recommendations: result.recommendations,
        };
        addTurn(turn);
      } catch (caught) {
        setError(
          caught instanceof Error
            ? caught.message
            : "Something went wrong reaching the recommendation service.",
        );
      } finally {
        setPending(false);
      }
    },
    [addTurn, turns, useHistory],
  );

  useEffect(() => {
    if (!initialPrompt || requested.current === initialPrompt || turns.length > 0) return;
    requested.current = initialPrompt;
    void ask(initialPrompt);
  }, [ask, initialPrompt, turns.length]);

  // Bring the newest turn to the top of the viewport, so the question and the
  // rationale are what you land on — scrolling to the bottom would skip both.
  useEffect(() => {
    if (turns.length === 0) return;
    const scrollerEl = scroller.current;
    const turnEl = latestTurn.current;
    if (!scrollerEl || !turnEl) return;
    scrollerEl.scrollTo({
      top: turnEl.offsetTop - 32,
      behavior: turns.length > 1 ? "smooth" : "auto",
    });
  }, [turns.length]);

  const submitRefinement = () => {
    const trimmed = refinement.trim();
    if (trimmed.length === 0 || pending) return;
    setRefinement("");
    void ask(trimmed);
  };

  return (
    <PhoneFrame>
      <AppHeader />

      <div
        ref={scroller}
        className="scroll-area absolute inset-x-0 top-[102px] bottom-[285px] px-[16px] pt-[32px] pb-[24px]"
      >
        <div className="flex flex-col gap-[32px]">
          {turns.map((turn, index) => (
            <article
              key={turn.id}
              ref={index === turns.length - 1 ? latestTurn : undefined}
              className="flex flex-col gap-[32px]"
            >
              {turn.prompt ? (
                <div className="flex justify-end">
                  <div className="max-w-[308px] rounded-bubble bg-bubble-sand p-[16px]">
                    <p className="text-control leading-[1.35] text-black">{turn.prompt}</p>
                  </div>
                </div>
              ) : null}

              <p className="whitespace-pre-wrap text-body leading-[1.32] text-black">
                {turn.rationale}
              </p>

              <ResultsList recommendations={turn.recommendations} />
            </article>
          ))}

          {pending ? <Thinking /> : null}

          {error ? (
            <p role="alert" className="text-body text-[#b91c1c]">
              {error}
            </p>
          ) : null}
        </div>
      </div>

      <RefineDock
        value={refinement}
        onChange={setRefinement}
        onSubmit={submitRefinement}
        pending={pending}
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
