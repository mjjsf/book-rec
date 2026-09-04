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

/**
 * Start (283:77) and Entry (287:471) are the same screen in two states: the
 * composer sits at 112px empty and grows to 147px once there is text, and the
 * headline stays centred above it. Submitting hands off to /chat.
 */
export default function StartScreen() {
  const router = useRouter();
  const { useHistory, setUseHistory, resetTurns } = useAppState();
  const [prompt, setPrompt] = useState("");
  const [detailsOpen, setDetailsOpen] = useState(false);

  const submit = () => {
    const trimmed = prompt.trim();
    if (trimmed.length === 0) return;
    resetTurns();
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

      <BottomNav className="absolute left-[16px] top-[773px]" />

      {detailsOpen ? <AiDetailsPopover onClose={() => setDetailsOpen(false)} /> : null}
    </PhoneFrame>
  );
}
