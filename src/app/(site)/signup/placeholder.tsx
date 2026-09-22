/**
 * Stand-in for a funnel step's controls while the shell is being built.
 *
 * Item 2 of the plan in docs/new-user-flow.md is the shell — routes, the guard that stops
 * people skipping ahead, the phase counter and the two-column layout. Item 3 fills these in
 * screen by screen. Every one of these is replaced by then; none of them is reachable in
 * the meantime, because nothing creates a signup draft until the landing hero's email form
 * lands with item 3.
 *
 * Drawn as a dashed panel to match the design's own dashed containers, so a half-built
 * funnel looks unfinished rather than broken.
 */
export function StepPlaceholder({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-[180px] w-full items-center justify-center rounded-[12px] border-2 border-dashed border-[#686868] p-6 text-center">
      <p className="font-dot text-[16px] uppercase tracking-[0.2em] text-[#686868]">{children}</p>
    </div>
  );
}
