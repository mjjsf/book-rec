import { StarIcon } from "./icons";

/**
 * The 67.55 x 13.27 star strip (283:222). The design fills it with a clipped
 * coloured rectangle over the outlines, so a 4.46 shows as four-and-a-half
 * stars rather than snapping — reproduced here with an overflow clip.
 */
export function StarRating({ rating }: { rating: number }) {
  const fraction = Math.max(0, Math.min(1, rating / 5));

  return (
    <span
      className="relative inline-block h-[13.27px] w-[67.55px] shrink-0"
      role="img"
      aria-label={`${rating.toFixed(2)} out of 5 stars`}
    >
      <span className="absolute inset-0 flex items-center gap-[0.5px] text-[#d8d8d8]">
        {[0, 1, 2, 3, 4].map((i) => (
          <StarIcon key={i} />
        ))}
      </span>
      <span
        className="absolute inset-y-0 left-0 overflow-hidden"
        style={{ width: `${fraction * 100}%` }}
      >
        <span className="flex h-full w-[67.55px] items-center gap-[0.5px] text-star">
          {[0, 1, 2, 3, 4].map((i) => (
            <StarIcon key={i} />
          ))}
        </span>
      </span>
    </span>
  );
}
