"use client";

import { useEffect, useRef, useState } from "react";
import type { Shelf } from "@/lib/types";
import { CaretIcon } from "./icons";

const LABELS: Record<Shelf, string> = {
  "want-to-read": "Want to Read",
  "currently-reading": "Reading",
  read: "Read",
};

/**
 * The shelf control (283:238): a 120.63 x 27.75 green button whose label is
 * separated from a caret by a hairline. The caret opens the other shelves.
 */
export function ShelfButton({
  shelf,
  onChange,
}: {
  shelf: Shelf | null;
  onChange: (next: Shelf | null) => void;
}) {
  const [open, setOpen] = useState(false);
  const wrapper = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDocumentClick = (event: MouseEvent) => {
      if (!wrapper.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDocumentClick);
    return () => document.removeEventListener("mousedown", onDocumentClick);
  }, [open]);

  const label = shelf ? LABELS[shelf] : "Want to Read";

  return (
    <div ref={wrapper} className="relative">
      <div
        className={`flex h-[27.745px] w-[120.629px] items-center rounded-shelf pl-[6px] pr-[11px] transition-colors ${
          shelf ? "bg-shelf-green hover:bg-[#3d9663]" : "bg-shelf-green/85 hover:bg-shelf-green"
        }`}
      >
        <button
          type="button"
          onClick={() => onChange(shelf ? null : "want-to-read")}
          aria-pressed={shelf !== null}
          className="ring-focus cursor-pointer whitespace-nowrap rounded-[3px] text-left text-meta font-semibold tracking-[-0.1206px] text-white"
        >
          {label}
        </button>
        <span className="ml-auto mr-[9px] h-full w-px bg-white/45" aria-hidden="true" />
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-label="Choose a shelf"
          aria-expanded={open}
          className="ring-focus flex size-[12px] cursor-pointer items-center justify-center rounded-[3px] text-white transition-transform hover:scale-125"
        >
          <CaretIcon />
        </button>
      </div>

      {open ? (
        <ul className="absolute left-0 top-[31px] z-20 w-[150px] overflow-hidden rounded-composer border border-field-border bg-white text-meta shadow-fab">
          {(Object.keys(LABELS) as Shelf[]).map((value) => (
            <li key={value}>
              <button
                type="button"
                onClick={() => {
                  onChange(value);
                  setOpen(false);
                }}
                className={`ring-focus block w-full cursor-pointer px-[10px] py-[7px] text-left transition-colors hover:bg-bubble-sand ${
                  shelf === value ? "font-semibold" : ""
                }`}
              >
                {LABELS[value]}
              </button>
            </li>
          ))}
          {shelf ? (
            <li>
              <button
                type="button"
                onClick={() => {
                  onChange(null);
                  setOpen(false);
                }}
                className="ring-focus block w-full cursor-pointer border-t border-field-border px-[10px] py-[7px] text-left transition-colors hover:bg-bubble-sand"
              >
                Remove from shelf
              </button>
            </li>
          ) : null}
        </ul>
      ) : null}
    </div>
  );
}
