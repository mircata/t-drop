"use client";

import { useState } from "react";
import Image from "next/image";

export type OrderRow = {
  id: number;
  date: string;
  status: string;
  categoryName: string | null;
  categoryImage: string | null;
};

const th = "font-headline text-[18px] uppercase text-black";
const td = "font-dot text-[16px] text-[#212121]";

function ViewIcon() {
  return (
    <svg viewBox="0 0 11.377 11.377" fill="none" className="size-[9.377px] shrink-0" aria-hidden="true">
      <path
        d="M4.12578 1.62513H3.00054C2.30033 1.62513 1.94996 1.62513 1.68252 1.7614C1.44727 1.88127 1.25614 2.07239 1.13627 2.30765C1 2.57509 1 2.92546 1 3.62567V8.37666C1 9.07687 1 9.42679 1.13627 9.69424C1.25614 9.92949 1.44727 10.121 1.68252 10.2408C1.9497 10.377 2.29965 10.377 2.99849 10.377H7.75334C8.45218 10.377 8.80162 10.377 9.06881 10.2408C9.30406 10.121 9.49582 9.92931 9.61569 9.69405C9.75183 9.42687 9.75183 9.07731 9.75183 8.37847V7.2513M7.25131 1H10.377V4.12565M10.377 1L6.00105 5.37591"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function OrderHistoryTable({ rows }: { rows: OrderRow[] }) {
  const [open, setOpen] = useState<OrderRow | null>(null);

  return (
    <>
      <div className="mt-[30px] overflow-x-auto rounded-[20px] border-3 border-dashed border-black px-10 py-5 max-md:px-5">
        <div className="grid min-w-[700px] grid-cols-[auto_auto_auto_auto_auto] items-center gap-x-10 gap-y-5">
          <span className={th}>Покупка</span>
          <span className={th}>Дата</span>
          <span className={th}>Статут</span>
          <span className={th}>Категория</span>
          <span />
          {rows.map((row) => (
            <Row key={row.id} row={row} onView={() => setOpen(row)} />
          ))}
        </div>
      </div>

      {open && (
        <div className="fixed inset-0 z-[600] flex items-center justify-center bg-[rgba(204,14,69,0.54)] p-5" onClick={() => setOpen(null)}>
          <div className="flex w-full max-w-[611px] flex-col gap-[40px] rounded-[29px] bg-white px-9 py-[45px]" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between">
              <div>
                <p className="font-headline text-[18px] uppercase tracking-[1.44px] text-[#686868]">Преглед на покупка</p>
                <p className="font-dot text-[16px] text-[#212121]">Номер: {open.id}</p>
              </div>
              <button type="button" onClick={() => setOpen(null)} aria-label="Затвори" className="text-t-black">
                <svg viewBox="0 0 18 18" fill="none" className="size-[18px]" aria-hidden="true">
                  <path d="M1 1L17 17M17 1L1 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </button>
            </div>
            <div className="flex items-start gap-[47px]">
              <div className="relative h-[235px] w-[209px] shrink-0 overflow-hidden rounded-[20px] bg-t-grey">
                {open.categoryImage && <Image src={open.categoryImage} alt={open.categoryName ?? ""} fill sizes="209px" className="object-cover" />}
              </div>
              <div className="flex h-[235px] flex-1 flex-col justify-between">
                <div>
                  <p className="font-headline text-[18px] uppercase text-black">Категория</p>
                  <p className="font-dot text-[16px] text-[#212121]">{open.categoryName ?? "—"}</p>
                </div>
                <div>
                  <p className="font-headline text-[18px] uppercase text-black">Дата</p>
                  <p className="font-dot text-[16px] text-[#212121]">{open.date}</p>
                </div>
                <div>
                  <p className="font-headline text-[18px] uppercase text-black">Статут</p>
                  <p className="font-dot text-[16px] text-[#212121]">{open.status}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function Row({ row, onView }: { row: OrderRow; onView: () => void }) {
  return (
    <>
      <span className={td}>№{row.id}</span>
      <span className={td}>{row.date}</span>
      <span className={td}>{row.status}</span>
      <span className={td}>{row.categoryName ?? "—"}</span>
      <button
        type="button"
        onClick={onView}
        className="inline-flex h-[24px] w-[168px] items-center justify-center gap-[10px] rounded-[14px] bg-[#d9d9d9] font-headline text-[12px] uppercase tracking-[0.96px] text-[#686868] hover:bg-t-red hover:text-t-neon"
      >
        <ViewIcon />
        Преглед
      </button>
    </>
  );
}
