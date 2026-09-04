"use client";

import { useEffect, useRef } from "react";
import { COMPOSER_PLACEHOLDER } from "@/lib/designContent";
import { SendIcon } from "./icons";

/**
 * The prompt box (283:129 / 287:524 / 283:342).
 *
 * The Figma shows the same control at two heights: 112px empty on Start and
 * 147px once filled on Entry, and 95px in the refine dock. It grows with the
 * text between `minHeight` and `maxHeight` rather than jumping.
 */
export function PromptComposer({
  value,
  onChange,
  onSubmit,
  disabled = false,
  minHeight = 112,
  maxHeight = 147,
  placeholder = COMPOSER_PLACEHOLDER,
  label,
  autoFocus = false,
  onFirstFocus,
  fadeIn = false,
}: {
  value: string;
  onChange: (next: string) => void;
  onSubmit: () => void;
  disabled?: boolean;
  minHeight?: number;
  maxHeight?: number;
  placeholder?: string;
  label: string;
  autoFocus?: boolean;
  /**
   * Called the first time the field is focused. The Start screen uses this to
   * play the prototype's fill-on-click beat; the copy lives with the caller so
   * this component keeps no designed text of its own.
   */
  onFirstFocus?: () => void;
  /** Fade the text in, for the moment it is filled programmatically. */
  fadeIn?: boolean;
}) {
  const textarea = useRef<HTMLTextAreaElement>(null);
  const focusedOnce = useRef(false);

  // Grow to fit the text, capped at the design's taller state.
  useEffect(() => {
    const el = textarea.current;
    if (!el) return;
    el.style.height = "auto";
    // 44 = the composer's chrome: 16px top padding + 8px bottom + the 20px
    // send row. The designed question is exactly six 17px lines (102px), which
    // fits the 147px box only because the 1px rule is drawn as an inset shadow
    // rather than a border.
    el.style.height = `${Math.min(el.scrollHeight, maxHeight - 44)}px`;
  }, [value, maxHeight]);

  const canSend = value.trim().length > 0 && !disabled;

  return (
    <div
      /*
       * The 1px rule is an inset shadow, not a border. Preflight makes
       * everything border-box, so a border would take 2px out of the designed
       * 147px box and clip the last line of the six-line question — the same
       * trap .phone-frame hit. Figma's stroke does not consume layout either.
       */
      className="flex w-full flex-col rounded-composer bg-white shadow-[inset_0_0_0_1px_var(--color-field-border)] pt-[16px] pr-[10px] pb-[8px] pl-[16px] transition-[min-height]"
      style={{ minHeight }}
    >
      <textarea
        ref={textarea}
        value={value}
        autoFocus={autoFocus}
        disabled={disabled}
        aria-label={label}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        onFocus={() => {
          if (focusedOnce.current) return;
          focusedOnce.current = true;
          onFirstFocus?.();
        }}
        onKeyDown={(event) => {
          if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault();
            if (canSend) onSubmit();
          }
        }}
        className={`w-full flex-1 resize-none border-0 bg-transparent pr-[6px] text-control leading-[17px] text-black outline-none placeholder:text-placeholder disabled:opacity-60 ${
          fadeIn ? "animate-fade-in" : ""
        }`}
        rows={1}
      />
      <div className="flex justify-end">
        <button
          type="button"
          onClick={onSubmit}
          disabled={!canSend}
          aria-label="Send"
          className={`ring-focus flex size-[20px] items-center justify-center transition ${
            canSend
              ? "cursor-pointer text-black opacity-100 hover:text-green-500 active:scale-90"
              : "cursor-not-allowed text-placeholder opacity-70"
          }`}
        >
          <SendIcon />
        </button>
      </div>
    </div>
  );
}
