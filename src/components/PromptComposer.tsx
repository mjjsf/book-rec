"use client";

import { useEffect, useRef } from "react";
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
  placeholder = "Describe emotion, genre, subject...",
  label,
  autoFocus = false,
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
}) {
  const textarea = useRef<HTMLTextAreaElement>(null);

  // Grow to fit the text, capped at the design's taller state.
  useEffect(() => {
    const el = textarea.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, maxHeight - 45)}px`;
  }, [value, maxHeight]);

  const canSend = value.trim().length > 0 && !disabled;

  return (
    <div
      className="flex w-full flex-col rounded-composer border border-field-border bg-white pt-[16px] pr-[10px] pb-[8px] pl-[16px] transition-[min-height]"
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
        onKeyDown={(event) => {
          if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault();
            if (canSend) onSubmit();
          }
        }}
        className="w-full flex-1 resize-none border-0 bg-transparent pr-[6px] text-control leading-[1.35] text-black outline-none placeholder:text-placeholder disabled:opacity-60"
        rows={1}
      />
      <div className="flex justify-end">
        <button
          type="button"
          onClick={onSubmit}
          disabled={!canSend}
          aria-label="Send"
          className={`flex size-[20px] items-center justify-center transition-opacity ${
            canSend ? "text-black opacity-100" : "text-placeholder opacity-70"
          }`}
        >
          <SendIcon />
        </button>
      </div>
    </div>
  );
}
