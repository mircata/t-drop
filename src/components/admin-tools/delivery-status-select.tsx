"use client";

import { useState, useTransition } from "react";
import { updateFulfillmentStatus } from "@/lib/actions/deliveries";

type Option = { value: string; label: string };

const COLORS: Record<string, string> = {
  pending_payment: "bg-[#fff3cd] text-[#7a5c00]",
  preparing: "bg-[#e2e3ff] text-[#3730a3]",
  on_hold: "bg-[#ffe5cc] text-[#8a4b00]",
  delivered: "bg-[#d4f4dd] text-[#1a7431]",
  cancelled: "bg-[#fbd5d5] text-[#8a1f1f]",
};

export function DeliveryStatusSelect({ id, status, options }: { id: number; status: string; options: readonly Option[] }) {
  const [value, setValue] = useState(status);
  const [pending, startTransition] = useTransition();

  return (
    <select
      value={value}
      disabled={pending}
      onChange={(e) => {
        const next = e.target.value;
        setValue(next);
        startTransition(async () => {
          const res = await updateFulfillmentStatus(id, next);
          if (!res.ok) setValue(status);
        });
      }}
      className={`rounded-full border-0 px-3 py-1 font-headline text-[12px] uppercase tracking-[0.4px] outline-none disabled:opacity-50 ${COLORS[value] ?? "bg-[#eee] text-[#333]"}`}
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>{o.label}</option>
      ))}
    </select>
  );
}
