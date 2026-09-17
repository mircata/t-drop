import Image from "next/image";

/* Figma "JOIN page" Frame 157 (500:170), annotated "new section" 2026-09-16: washing
   instructions, between the size chart and the FAQ. Same dashed cream box and grey
   section label as SizeChart above it — deliberately, they read as a pair.
   Figma gives each column its own icon gap (18/15/23px) purely because the three
   icons are different heights; a fixed icon box with one gap lines the copy up, which
   is what those offsets were compensating for. */
const ITEMS = [
  { src: "/figma/join/wash/temp-30.svg", w: 39.359, h: 29.903, box: "w-[39px] h-[30px]", text: "Пери я на 30°C, обърната наопаки, без силни препарати." },
  { src: "/figma/join/wash/no-dryer.svg", w: 35.049, h: 35.049, box: "w-[35px] h-[35px]", text: "Не използвай сушилня и не избелвай." },
  { src: "/figma/join/wash/iron.svg", w: 38.845, h: 20.022, box: "w-[39px] h-[20px]", text: "Глади на ниска температура, пак от вътрешната страна." },
];

export function WashCare() {
  return (
    <div className="flex flex-col gap-9 rounded-[20px] border-3 border-dashed border-black bg-[#fffdea] px-5 py-10">
      <p className="font-headline text-[18px] uppercase tracking-[1.44px] text-[#686868]">Инструкции за пране</p>

      <div className="grid grid-cols-3 gap-[37px] max-md:grid-cols-1 max-md:gap-10">
        {ITEMS.map((item) => (
          <div key={item.src} className="flex flex-col items-center gap-[18px]">
            <span className="flex h-[35px] items-end justify-center">
              <Image src={item.src} alt="" width={Math.round(item.w)} height={Math.round(item.h)} className={item.box} />
            </span>
            <p className="text-center font-body text-[16px] text-[#212121]">{item.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
