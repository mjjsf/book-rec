"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AiDetailsPopover } from "@/components/AiDetailsButton";
import { AppHeader } from "@/components/AppHeader";
import { useAppState } from "@/components/AppStateProvider";
import { BottomNav } from "@/components/BottomNav";
import { PhoneFrame } from "@/components/PhoneFrame";
import { RefineDock } from "@/components/RefineDock";
import { ResultsList } from "@/components/ResultsList";
import { Thinking } from "@/components/Thinking";
import { requestRecommendations } from "@/lib/client";
import type { Recommendation } from "@/lib/types";

/**
 * Panel (287:705) — the proactive variant. There is no typed question, so the
 * screen asks on mount with an empty prompt and history on, and leads with
 * "Based on your reading history, Goodreads AI recommends" (287:750) instead
 * of a user bubble. Its nav carries five items (287:836).
 */
export default function PanelScreen() {
  const { useHistory, setUseHistory } = useAppState();
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [refinement, setRefinement] = useState("");
  const [pending, setPending] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const loaded = useRef(false);

  const load = useCallback(
    async (prompt: string, priorIds: string[]) => {
      setPending(true);
      setError(null);
      try {
        const result = await requestRecommendations({
          prompt,
          useHistory: true,
          previousTurns: priorIds.length > 0 ? [{ prompt: "", bookIds: priorIds }] : [],
        });
        setRecommendations(result.recommendations);
      } catch (caught) {
        setError(
          caught instanceof Error ? caught.message : "Could not load recommendations.",
        );
      } finally {
        setPending(false);
      }
    },
    [],
  );

  useEffect(() => {
    if (loaded.current) return;
    loaded.current = true;
    void load("", []);
  }, [load]);

  const submitRefinement = () => {
    const trimmed = refinement.trim();
    if (trimmed.length === 0 || pending) return;
    setRefinement("");
    void load(trimmed, recommendations.map((r) => r.book.id));
  };

  return (
    <PhoneFrame>
      <AppHeader />

      <div className="absolute left-[38px] top-[143px] w-[323px]">
        <h1 className="text-center font-serif text-[21px] leading-[1.26] text-black">
          Based on your reading history, Goodreads AI recommends
        </h1>
      </div>

      <div className="scroll-area absolute inset-x-0 top-[229px] bottom-[285px] px-[19px]">
        {pending ? (
          <Thinking />
        ) : error ? (
          <p role="alert" className="text-body text-[#b91c1c]">
            {error}
          </p>
        ) : (
          <ResultsList recommendations={recommendations} />
        )}
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

      <BottomNav items={5} />

      {detailsOpen ? <AiDetailsPopover onClose={() => setDetailsOpen(false)} /> : null}
    </PhoneFrame>
  );
}
