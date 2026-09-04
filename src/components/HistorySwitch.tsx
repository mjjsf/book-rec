"use client";

/**
 * "Use my reading history" (287:603) — a 34 x 20 track with a 20px knob,
 * green/500 when on. The design ships two variants (Default = on,
 * Variant2 = off) and this component is both of them.
 */
export function HistorySwitch({
  checked,
  onChange,
  id,
}: {
  checked: boolean;
  onChange: (next: boolean) => void;
  id?: string;
}) {
  return (
    <button
      type="button"
      id={id}
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="ring-focus group flex cursor-pointer items-center gap-[8px] rounded-[6px] text-left"
    >
      <span
        className={`relative block h-[20px] w-[34px] shrink-0 rounded-full transition-colors ${
          checked
            ? "bg-green-500 group-hover:bg-[#2f8c58]"
            : "bg-[#cbd5d1] group-hover:bg-[#b4c1bd]"
        }`}
      >
        <span
          className={`absolute top-[2px] block size-[16px] rounded-full bg-white shadow-sm transition-[left] duration-150 ${
            checked ? "left-[16px]" : "left-[2px]"
          }`}
        />
      </span>
      <span className="text-control leading-none text-black">Use my reading history</span>
    </button>
  );
}
