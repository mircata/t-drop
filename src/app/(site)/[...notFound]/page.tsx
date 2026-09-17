import type { Metadata } from "next";
import { notFound } from "next/navigation";

/* This app has four root layouts ((site), (account), (admin-tools), (payload)) and no
   shared app/layout.tsx, so an unmatched URL belongs to no group and Next.js falls back
   to its own bare 404 — no header, footer or brand fonts. Routing those URLs through a
   catch-all inside (site) puts them in this group's layout, so (site)/not-found.tsx
   renders with the real chrome and still answers 404. Lowest routing priority, so it
   only ever runs when nothing else matched. */
/* not-found.tsx cannot set the tab title — Next.js resolves metadata from the matched
   segment, which is this one. */
export const metadata: Metadata = { title: "Страницата не е намерена – T-Drop Monthly T-Shirts" };

export default function CatchAll() {
  notFound();
}
