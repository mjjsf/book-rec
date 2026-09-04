"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { AiDetailsPopover } from "@/components/AiDetailsButton";
import { AppHeader } from "@/components/AppHeader";
import { AssistantControls } from "@/components/AssistantControls";
import { useAppState } from "@/components/AppStateProvider";
import { BottomNav } from "@/components/BottomNav";
import { PhoneFrame } from "@/components/PhoneFrame";
import { PromptComposer } from "@/components/PromptComposer";
import { SAMPLE_QUERY } from "@/lib/designContent";

/**
 * Start (283:77) and Entry (287:471) — the same screen in two states.
 *
 * The composer opens preloaded with the design's own question, which is exactly
 * the Entry frame; clearing the field gives the empty Start frame with its
 * placeholder. Both designed states are reachable without inventing any UI the
 * Figma does not have.
 *
 * The composer grows from 112px to 147px once it holds text, as the two frames
 * show, and Send always leads to the results screen.
 */
export default function StartScreen() {
  const router = useRouter();
  const { useHistory, setUseHistory } = useAppState();
  const [prompt, setPrompt] = useState(SAMPLE_QUERY);
  const [detailsOpen, setDetailsOpen] = useState(false);

  const submit = () => {
    const trimmed = prompt.trim();
    if (trimmed.length === 0) return;
    router.push(`/chat?q=${encodeURIComponent(trimmed)}`);
  };

  return (
    <PhoneFrame>
      <AppHeader />

      <div className="absolute left-[32px] top-[186px] flex w-[323px] flex-col items-center gap-[32px]">
        <h1 className="text-center font-serif text-headline leading-[1.24] text-black">
          What kind of book
          <br />
          are you looking for?
        </h1>

        <div className="flex w-full flex-col gap-[16px]">
          <PromptComposer
            value={prompt}
            onChange={setPrompt}
            onSubmit={submit}
            label="Describe the book you are looking for"
            minHeight={prompt.length > 0 ? 147 : 112}
            maxHeight={147}
          />
          <AssistantControls
            useHistory={useHistory}
            onUseHistoryChange={setUseHistory}
            detailsOpen={detailsOpen}
            onDetailsToggle={setDetailsOpen}
          />
        </div>
      </div>

      <BottomNav />

      {detailsOpen ? <AiDetailsPopover onClose={() => setDetailsOpen(false)} /> : null}
    </PhoneFrame>
  );
}
