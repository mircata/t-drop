/** Same values/order as the "Статус на доставка" select in src/collections/CategorySelections.ts. */
export const FULFILLMENT_STATUSES = [
  { value: "pending_payment", label: "Чака плащане" },
  { value: "preparing", label: "Подготовка" },
  { value: "on_hold", label: "Изчаква" },
  { value: "delivered", label: "Доставено" },
  { value: "cancelled", label: "Отказано" },
] as const;

export type FulfillmentStatus = (typeof FULFILLMENT_STATUSES)[number]["value"];

export const FULFILLMENT_STATUS_LABELS: Record<string, string> = Object.fromEntries(FULFILLMENT_STATUSES.map((s) => [s.value, s.label]));
