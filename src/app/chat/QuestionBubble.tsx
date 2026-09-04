"use client";

import { useSearchParams } from "next/navigation";
import { SAMPLE_QUERY } from "@/lib/designContent";

/**
 * The user's message (283:210).
 *
 * Isolated into its own component for one reason: it is the only thing on this
 * screen that reads the query string, and `useSearchParams` forces everything
 * inside its Suspense boundary to be client-rendered. Wrapping the whole screen
 * shipped an empty page — `BAILOUT_TO_CLIENT_SIDE_RENDERING` with no content in
 * the HTML at all. Keeping the boundary this small means the rest of the screen
 * prerenders, and the fallback below is the design's own question, so the
 * static HTML is already correct before hydration.
 */
export function QuestionBubble() {
  const params = useSearchParams();
  return <Bubble text={params.get("q") ?? SAMPLE_QUERY} />;
}

export function Bubble({ text }: { text: string }) {
  return (
    <div className="flex justify-end">
      <div className="max-w-[308px] rounded-bubble bg-bubble-sand p-[16px]">
        <p className="text-control leading-[17px] text-black">{text}</p>
      </div>
    </div>
  );
}
