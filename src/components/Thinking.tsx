/**
 * Not in the Figma: the design has no in-between state, but a real request
 * takes time, so the rationale slot shows a pulse while the engine answers.
 */
export function Thinking() {
  return (
    <p className="flex items-center gap-[6px] text-body text-byline/60" role="status">
      <span>Looking through the catalog</span>
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="thinking-dot inline-block size-[5px] rounded-full bg-current"
          style={{ animationDelay: `${i * 0.15}s` }}
        />
      ))}
    </p>
  );
}
