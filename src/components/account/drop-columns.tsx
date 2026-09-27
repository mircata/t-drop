import Image from "next/image";
import Link from "next/link";
import { SHIRT_PLACEHOLDER, SlotDetails, type CartSlot } from "@/components/site/signup-cart";

/** One column: a shirt of the package, or — past the package — the upgrade offer for it. */
export type DropColumn = { kind: "shirt"; shirt: CartSlot } | { kind: "upgrade"; slot: number; planName: string };

/**
 * The shirts under the /account dashboard and inside its picker card — Figma "ДРОП page
 * states V2" (`549:924` / `549:1472`). Four equal columns, 20px apart, each a 47px number
 * bar over a picture:
 *
 * - **picked** — its design and details, with "РЕДАКТИРАЙ" to its picker;
 * - **active** — the shirt shown above (the dashboard) or being picked (the picker): a red
 *   bar with a neon number and a red wash over the picture;
 * - **not picked** — the number without a bar over the grey T-shirt placeholder, which opens
 *   that shirt's picker;
 * - **upgrade** (the dashboard only, for the slots past the package) — "+ ЪПГРЕЙДНИ
 *   АБОНАМЕНТА СИ НА <ПАКЕТ>", annotated *"clicking here leads to 'account page - plan
 *   upgrade 1/2' frame"*.
 *
 * A picked column's picture selects it (`selectHref`); the shirt the page shows is chosen
 * in the URL, so the back button and a reload agree with it. On the phone the columns go
 * two by two.
 */
export function DropColumns({
  columns,
  activeSlot,
  locked,
  selectHref,
}: {
  columns: DropColumn[];
  activeSlot: number;
  locked: boolean;
  /** Where a picked shirt's picture leads, with the slot number appended. */
  selectHref: string;
}) {
  return (
    <ul className="grid grid-cols-4 items-start gap-[20px] max-lg:grid-cols-2 max-lg:gap-x-[15px] max-lg:gap-y-[25px]">
      {columns.map((c) => (c.kind === "upgrade" ? <UpgradeColumn key={c.slot} column={c} /> : <ShirtColumn key={c.shirt.slot} shirt={c.shirt} active={c.shirt.slot === activeSlot} locked={locked} selectHref={selectHref} />))}
    </ul>
  );
}

function Bar({ slot, look }: { slot: number; look: "active" | "picked" | "none" }) {
  const cls = look === "active" ? "bg-t-red text-t-neon" : look === "picked" ? "bg-[#686868] text-white" : "text-[#4e4e4e]";
  return (
    <span className={`flex h-[47px] w-full items-center justify-center rounded-[23px] font-headline text-[24px] uppercase leading-[1.12] tracking-[1.92px] max-lg:h-[32px] max-lg:text-[18px] ${cls}`}>
      <span className="sr-only">Тениска </span>
      {slot}
    </span>
  );
}

const tile = "relative block aspect-[277.68/297.36] w-full overflow-hidden rounded-[12.49px]";

function ShirtColumn({ shirt, active, locked, selectHref }: { shirt: CartSlot; active: boolean; locked: boolean; selectHref: string }) {
  const picked = Boolean(shirt.categoryName);
  const chooseHref = `/account?choose=${shirt.slot}#drop`;

  return (
    <li className="flex flex-col gap-[10px]">
      <Bar slot={shirt.slot} look={active ? "active" : picked ? "picked" : "none"} />
      {picked ? (
        <Link href={`${selectHref}${shirt.slot}`} aria-current={active ? "true" : undefined} aria-label={`Тениска ${shirt.slot}: ${shirt.categoryName}`} className={tile}>
          {shirt.image ? <Image src={shirt.image} alt="" fill sizes="(min-width: 1024px) 305px, 50vw" className="object-cover" /> : <span className="absolute inset-0 bg-[#f5f5f5]" />}
          {active ? <span className="absolute inset-0 bg-t-red/30" /> : null}
        </Link>
      ) : locked ? (
        <span className={tile}>
          <Image src={SHIRT_PLACEHOLDER} alt="" fill className="object-cover" />
        </span>
      ) : (
        <Link href={chooseHref} aria-label={`Избери дизайн за тениска ${shirt.slot}`} className={tile}>
          <Image src={SHIRT_PLACEHOLDER} alt="" fill className="object-cover" />
          {active ? <span className="absolute inset-0 bg-t-red/30" /> : null}
        </Link>
      )}
      {picked ? (
        <div className="flex flex-col gap-[10px]">
          <SlotDetails slot={shirt} />
          {!locked ? (
            /* Annotated *"this leads to the design select page"*, like the other edit links. */
            <Link href={chooseHref} className="flex w-fit items-center gap-[12px]">
              <Image src="/figma/signup/design/pencil.svg" alt="" width={21} height={21} className="h-[20.75px] w-[21.36px]" />
              <span className="font-headline text-[12px] uppercase leading-[1.12] tracking-[0.96px] text-black">
                Редактирай<span className="sr-only"> тениска {shirt.slot}</span>
              </span>
            </Link>
          ) : null}
        </div>
      ) : null}
    </li>
  );
}

function UpgradeColumn({ column }: { column: Extract<DropColumn, { kind: "upgrade" }> }) {
  return (
    <li className="flex flex-col gap-[10px]">
      <Bar slot={column.slot} look="none" />
      <Link
        href="/account?upgrade=1"
        scroll={false}
        className={`${tile} flex flex-col items-center justify-center gap-[33px] bg-[#f5f5f5] px-2 text-center max-lg:gap-[12px]`}
      >
        <Image src="/figma/account/upgrade-plus.svg" alt="" width={67} height={67} className="size-[67.38px] max-lg:size-[40px]" />
        <span className="font-body text-[24px] uppercase leading-[normal] text-[#212121] max-lg:text-[14px]">Ъпгрейдни абонамента си на</span>
        <span className="font-headline text-[42.825px] uppercase leading-[1.12] text-t-red max-lg:text-[20px]">{column.planName}</span>
      </Link>
    </li>
  );
}
