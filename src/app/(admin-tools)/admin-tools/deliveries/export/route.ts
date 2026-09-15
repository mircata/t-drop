import { NextResponse } from "next/server";
import { getAdminUser } from "@/lib/admin-auth";
import { getPayloadClient } from "@/lib/payload";
import { FULFILLMENT_STATUS_LABELS } from "@/lib/delivery-status";

/** One cell, quoted if it contains a comma, quote or newline. */
function cell(value: string): string {
  return /[",\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
}

/** GET /admin-tools/deliveries/export?month=YYYY-MM — CSV for the factory. Admin-only. */
export async function GET(request: Request) {
  const admin = await getAdminUser();
  if (!admin) return new NextResponse("Unauthorized", { status: 401 });

  const month = new URL(request.url).searchParams.get("month") ?? "";
  const payload = await getPayloadClient();
  const picks = await payload.find({
    collection: "category-selections",
    where: month ? { month: { equals: month } } : {},
    sort: "customer",
    depth: 2,
    limit: 2000,
  });

  const header = ["Клиент", "Телефон", "Получател", "Пощенски код", "Спедитор", "Адрес / офис", "Категория", "Размер", "Пол", "Статус", "Месец"];
  const rows = picks.docs.map((p) => {
    const customer = typeof p.customer === "object" ? p.customer : null;
    const category = typeof p.category === "object" ? p.category : null;
    const shipping = customer?.shipping ?? {};
    return [
      customer?.name ?? "",
      customer?.phone ?? "",
      shipping.recipientName ?? "",
      shipping.postcode ?? "",
      shipping.carrier ?? "",
      shipping.addressOrOffice ?? "",
      category?.name ?? "",
      p.size?.toUpperCase() ?? "",
      p.gender === "male" ? "Мъж" : p.gender === "female" ? "Жена" : "",
      FULFILLMENT_STATUS_LABELS[p.fulfillmentStatus ?? ""] ?? "",
      p.month,
    ];
  });

  // Leading BOM so Excel opens the Cyrillic text as UTF-8 instead of mojibake.
  const csv = "﻿" + [header, ...rows].map((r) => r.map(cell).join(",")).join("\r\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="dostavki-${month || "all"}.csv"`,
    },
  });
}
