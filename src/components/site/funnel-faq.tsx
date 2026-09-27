/**
 * The FAQ on the signup funnel's package step — Figma `525:3824` (mobile) and `525:3658`
 * (desktop).
 *
 * Every answer is **open**. This was an accordion of `<details>` before; neither frame has
 * one, and neither has a +/− marker or a divider. It is ten questions read straight down a
 * 357px column on mobile and across a two-column grid on desktop, so that is what it is.
 *
 * Its content lives on the `Site` global rather than in a page's `faq` block: the funnel
 * steps are hard-coded routes, not Payload pages, and the same list is meant to appear on
 * more than one of them (owner decision 17, docs/new-user-flow.md).
 *
 * The desktop grid fills row by row from the same list the phone reads top to bottom. The
 * frames disagree about two of the pairs — `525:3658` swaps материал with размера, and
 * куриер with абонамента, against `525:3824`'s order — so one of them has to be the list,
 * and the single-column reading is the one that cannot be ambiguous.
 *
 * The frame's row gaps are 65, 88, 111 and 111px, hand-placed around items of differing
 * height; a uniform gap is the only thing that survives copy being edited in /admin, and
 * 65 is the one the designer used where a row was tallest — the clearance they actually
 * wanted between two rows that nearly touch. Reproducing the block's drawn *height* is not
 * a goal here: the desktop frame sets its answers in DotGothic16 and `font-dot` has been
 * Handjet since 2026-09-16, which is far narrower, so the same copy comes out around 40%
 * shorter however the rows are spaced.
 */
export function FunnelFaq({
  heading,
  items,
  className = "",
}: {
  heading: string;
  items: { question: string; answer: string }[];
  className?: string;
}) {
  if (!items.length) return null;

  return (
    <section className={className}>
      {/* 319px on mobile is the frame's box, and it is what breaks the heading onto the two
          lines it is drawn with; desktop gives it the whole line. */}
      <h2 className="w-[319px] max-w-full font-headline text-[18px] uppercase leading-[1.12] tracking-[1.44px] text-[#686868] lg:w-auto">
        {heading}
      </h2>

      <dl className="mt-[36px] grid gap-y-[45px] lg:mt-[56px] lg:grid-cols-2 lg:gap-x-[93px] lg:gap-y-[65px]">
        {items.map((item) => (
          <div key={item.question} className="flex flex-col gap-[25px]">
            <dt className="font-headline text-[16px] uppercase leading-[1.12] tracking-[1.28px] text-black lg:text-[18px] lg:tracking-[1.44px]">
              {item.question}
            </dt>
            <dd className="font-dot text-[18px] leading-[normal] text-t-black lg:text-[16px]">{item.answer}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
