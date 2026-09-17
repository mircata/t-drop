import Image from "next/image";

/* Figma "JOIN page" Frame 51 (500:387), annotated "new section" 2026-09-16: a single
   row of four icon + copy pairs, sitting between the gender/size block and the design
   picker. Same four claims as the home page's UspsBlock but a different layout and
   its own small icons, so it does not share that component. Icon boxes keep each
   SVG's own Figma dimensions; the second one is rotated the way the design has it.
   The first copy box is 284px rather than Figma's 267px: the browser needs the extra
   17px to break that sentence after two lines the way Figma does, and Frame 51 is a
   36px-tall single row only if every item stays at two lines. */
const ITEMS = [
  { src: "/figma/join/usp/print.svg", w: 30.101, h: 25.48, box: "w-[30px] h-[26px]", text: "Използваме доказана технология за отпечатването за дълготрайни щампи.", textWidth: "w-[284px]" },
  { src: "/figma/join/usp/cotton.svg", w: 39.436, h: 26.022, box: "w-[39px] h-[26px] rotate-[6.91deg]", text: "Всичките ни тениски са от 100% памук.", textWidth: "w-[262px]" },
  { src: "/figma/join/usp/artists.svg", w: 31.46, h: 31.46, box: "w-[31px] h-[31px]", text: "Всеки месец наемаме артисти, които рисуват дизайните.", textWidth: "w-[241px]" },
  { src: "/figma/join/usp/bg.svg", w: 40.321, h: 31.137, box: "w-[40px] h-[31px]", text: "Цялото производство е позиционирано в България.", textWidth: "w-[256px]" },
];

export function JoinUsps() {
  return (
    <div className="flex w-full flex-row items-center justify-between gap-[15px] max-lg:flex-wrap max-lg:justify-start max-lg:gap-x-10 max-lg:gap-y-[25px]">
      {ITEMS.map((item) => (
        <div key={item.src} className="flex flex-row items-center gap-[15px] max-lg:w-[45%] max-md:w-full">
          <Image src={item.src} alt="" width={Math.round(item.w)} height={Math.round(item.h)} className={`${item.box} shrink-0`} />
          <p className={`font-body text-[16px] leading-[1.125] tracking-[1.44px] text-[#212121] ${item.textWidth} max-lg:w-auto`}>{item.text}</p>
        </div>
      ))}
    </div>
  );
}
