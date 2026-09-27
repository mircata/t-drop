import Image from "next/image";

/* Figma "Таблица с размери" (482:3971, 2026-09-16): each card is a white pill with
   a dashed shirt outline (baked into its own SVG per size/gender) and two measurement
   labels overlaid on it. The outline SVGs don't carry the cm text themselves — Figma
   positions it separately per card — so these percentages (measured off the design)
   place the width label over the horizontal line and the length label over the
   vertical one. They're shared across all four sizes of a gender since the outline's
   own line positions barely move between S and XL, only the label text does. */
type Row = { size: string; widthCm: string; lengthCm: string; outline: string };

const MEN: Row[] = [
  { size: "S", widthCm: "46cm", lengthCm: "68cm", outline: "/figma/join/size-chart/men-s.svg" },
  { size: "M", widthCm: "48,5cm", lengthCm: "70,5cm", outline: "/figma/join/size-chart/men-m.svg" },
  { size: "L", widthCm: "53,5cm", lengthCm: "73cm", outline: "/figma/join/size-chart/men-l.svg" },
  { size: "XL", widthCm: "59cm", lengthCm: "75,5cm", outline: "/figma/join/size-chart/men-xl.svg" },
];
const WOMEN: Row[] = [
  { size: "S", widthCm: "44cm", lengthCm: "64,5cm", outline: "/figma/join/size-chart/women-s.svg" },
  { size: "M", widthCm: "46,5cm", lengthCm: "65,5cm", outline: "/figma/join/size-chart/women-m.svg" },
  { size: "L", widthCm: "49cm", lengthCm: "66,5cm", outline: "/figma/join/size-chart/women-l.svg" },
  { size: "XL", widthCm: "51,5cm", lengthCm: "67,5cm", outline: "/figma/join/size-chart/women-xl.svg" },
];

function SizeCard({ row, gender, outline, widthPos, lengthPos }: {
  row: Row;
  gender: string;
  /** The outline's box — width, aspect, and its gap to the size letter. */
  outline: string;
  widthPos: { left: string; top: string };
  lengthPos: { left: string; top: string };
}) {
  return (
    <div className="flex w-full flex-col items-center rounded-[17px] border-2 border-t-red bg-white pb-[15px] pt-[29px] lg:h-[298.8px] lg:rounded-[16.73px] lg:border-[1.8px] lg:pb-[20px]">
      <div className={`relative ${outline}`}>
        <Image src={row.outline} alt="" fill className="object-contain" />
        <span
          className="absolute -translate-x-1/2 -translate-y-1/2 whitespace-nowrap font-dot text-[10px] text-[#212121]"
          style={widthPos}
        >
          {row.widthCm}
        </span>
        <span
          className="absolute -translate-x-1/2 -translate-y-1/2 rotate-90 whitespace-nowrap font-dot text-[10px] text-[#212121]"
          style={lengthPos}
        >
          {row.lengthCm}
        </span>
      </div>
      <p className="mt-[15px] font-headline text-[30px] uppercase text-t-red lg:mt-0 lg:text-[43px] lg:leading-[1.12]">{row.size}</p>
      <p className="mt-[15px] font-headline text-[17px] uppercase text-black lg:mt-0 lg:text-[25.1px] lg:leading-[1.12]">{gender}</p>
    </div>
  );
}

/**
 * `id` is the anchor "Виж размерите" jumps to. A page that renders the chart twice (the
 * signup design step: once inline on desktop, once inside the mobile disclosure) passes
 * `null` on the second copy so the id stays unique.
 */
export function SizeChart({ id = "size-chart" }: { id?: string | null }) {
  return (
    <div id={id ?? undefined} className="flex scroll-mt-32 flex-col gap-9 rounded-[20px] border-3 border-dashed border-black bg-[#fffdea] px-5 py-10">
      <p className="font-headline text-[18px] uppercase tracking-[1.44px] text-[#686868]">Таблица с размери</p>

      {/* Figma `525:5558`: 256×299 cards 59px apart, 70px between the two rows. The outlines
          are 162px (men) and 132px (women) wide, not one shared width — the women's shirt is
          narrower and taller, and drawing it at the men's width is what made the chart 47px
          taller than the frame. */}
      <div className="flex flex-col gap-9 lg:gap-[70px]">
        <div className="grid grid-cols-4 gap-5 max-md:grid-cols-2 lg:grid-cols-[repeat(4,255.77px)] lg:gap-[59.07px]">
          {MEN.map((row) => (
            <SizeCard key={`men-${row.size}`} row={row} gender="мъже" outline="w-[63%] aspect-[161.65/162.08] lg:mb-[11px]" widthPos={{ left: "36%", top: "29%" }} lengthPos={{ left: "57%", top: "71%" }} />
          ))}
        </div>
        <div className="grid grid-cols-4 gap-5 max-md:grid-cols-2 lg:grid-cols-[repeat(4,255.77px)] lg:gap-[59.07px]">
          {WOMEN.map((row) => (
            <SizeCard key={`women-${row.size}`} row={row} gender="жени" outline="w-[51.5%] aspect-[131.77/163.74] lg:mb-[10px]" widthPos={{ left: "31%", top: "23%" }} lengthPos={{ left: "58%", top: "72%" }} />
          ))}
        </div>
      </div>

      <p className="font-dot text-[16px] text-[#212121]">
        - Широчината се измерва 1см надолу от дупките за ръкавите<br />
        - Дължината се измерва от най-високата част на раменете до най-долния ръб на дрехата
      </p>
    </div>
  );
}
