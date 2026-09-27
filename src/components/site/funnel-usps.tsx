import Image from "next/image";

/**
 * The four claims on the signup funnel's package step — Figma `525:3798` (mobile) and
 * `525:3718` (desktop). Same four icons and the same copy as `/join`'s row, so it reuses
 * those assets, but neither the layout nor the wrapper is shared:
 *
 * - **mobile** puts them in a dashed-outline card on cream, stacked, icons in a 40px box so
 *   all four lines start at the same x;
 * - **desktop** drops the card entirely and lays them out two by two in a 694px block that
 *   sits beside the heading, each icon at its own size.
 *
 * One set of nodes, two arrangements — the caller positions the block, this decides how it
 * reads at each width.
 *
 * The first copy box is 284px rather than the frames' 267px for the reason recorded against
 * `/join`: the browser needs the extra width to break that sentence after two lines, and
 * every item is a 36px two-line row in both frames. Only desktop can give it that. The
 * phone card is 370px wide and leaves the copy 266px once the dashed inset, the 40px icon
 * box and the gap are taken out, so that one claim runs to three lines and the card comes
 * out 18px taller than drawn. The frame does not solve this either — its own 267px box is
 * 6px wider than the 359px card it sits inside — and buying the width back by squeezing the
 * 21.5px inset was tried and still fell 8px short, so the inset is left as drawn.
 */
const ITEMS = [
  {
    src: "/figma/join/usp/print.svg",
    w: 30,
    h: 25,
    box: "h-[25px] w-[30px]",
    text: "Използваме доказана технология за отпечатването за дълготрайни щампи.",
    width: "lg:w-[284px]",
  },
  {
    src: "/figma/join/usp/cotton.svg",
    w: 39,
    h: 26,
    box: "h-[26px] w-[39px] rotate-[6.91deg]",
    text: "Всичките ни тениски са от 100% памук.",
    width: "lg:w-[262px]",
  },
  {
    src: "/figma/join/usp/artists.svg",
    w: 31,
    h: 31,
    box: "h-[31px] w-[31px]",
    text: "Всеки месец наемаме артисти, които рисуват дизайните.",
    width: "lg:w-[241px]",
  },
  {
    src: "/figma/join/usp/bg.svg",
    w: 40,
    h: 31,
    box: "h-[31px] w-[40px]",
    text: "Цялото производство е позиционирано в България.",
    width: "lg:w-[256px]",
  },
];

export function FunnelUsps({ className = "" }: { className?: string }) {
  return (
    <ul
      className={`flex flex-col gap-[36px] rounded-[20px] border-3 border-dashed border-black bg-[#fffdea] p-[21.5px] lg:flex-row lg:flex-wrap lg:justify-between lg:gap-x-0 lg:gap-y-[38px] lg:rounded-none lg:border-0 lg:bg-transparent lg:p-0 ${className}`}
    >
      {ITEMS.map((item) => (
        <li key={item.src} className="flex flex-row items-center gap-[15px]">
          <span className="flex w-[40px] shrink-0 items-center lg:w-auto">
            <Image src={item.src} alt="" width={item.w} height={item.h} className={`${item.box} shrink-0`} />
          </span>
          <p className={`font-body text-[16px] leading-[normal] tracking-[1.44px] text-t-black ${item.width}`}>
            {item.text}
          </p>
        </li>
      ))}
    </ul>
  );
}
