"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { AssistantControls } from "@/components/AssistantControls";
import { useAppState } from "@/components/AppStateProvider";
import { PromptComposer } from "@/components/PromptComposer";
import { SAMPLE_QUERY } from "@/lib/designContent";

/**
 * Start (283:77) and Entry (287:471) — the same screen in two states.
 *
 * It opens empty — the Start frame — and clicking the input fills it with the
 * design's own question, which is the Entry frame. That is the prototype's
 * transition between the two, so the app plays it rather than skipping to the
 * filled state.
 *
 * The text fades in and the composer grows 112px to 147px together, both over
 * 300ms. Send always leads to the results screen.
 */
export default function StartScreen() {
  const router = useRouter();
  const { useHistory, setUseHistory } = useAppState();
  const [prompt, setPrompt] = useState("");
  const [fadeIn, setFadeIn] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const populated = useRef(false);

  /**
   * Fill on the first click, once. Refilling every time the field is emptied
   * would make it impossible to type anything of your own, so the beat plays
   * once and the field is ordinary afterwards.
   */
  const populateOnce = () => {
    if (populated.current) return;
    populated.current = true;
    setPrompt(SAMPLE_QUERY);
    setFadeIn(true);
  };

  const submit = () => {
    const trimmed = prompt.trim();
    if (trimmed.length === 0) return;
    router.push(`/chat/?q=${encodeURIComponent(trimmed)}`);
  };

  return (
    <>
      <div className="absolute left-[32px] top-[186px] flex w-[323px] flex-col items-center gap-[32px]">
        <h1 className="text-center font-serif text-headline leading-[1.24] text-black">
          What kind of book
          <br />
          are you looking for?
        </h1>

        <div className="flex w-full flex-col gap-[16px]">
          <PromptComposer
            value={prompt}
            onSubmit={submit}
            onFirstFocus={populateOnce}
            fadeIn={fadeIn}
            onFadeEnd={() => setFadeIn(false)}
            label="Describe the book you are looking for"
            minHeight={prompt.length > 0 ? 147 : 112}
            maxHeight={147}
          />
          <AssistantControls
            useHistory={useHistory}
            onUseHistoryChange={setUseHistory}
            detailsOpen={detailsOpen}
            onDetailsToggle={setDetailsOpen}
            // Top pinned 16px under the row, right edges aligned.
            popoverPlacement="right-0 top-[calc(100%+16px)]"
          />
        </div>
      </div>

    </>
  );
}
