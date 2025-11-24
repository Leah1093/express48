import type { OrderStatus } from "../types/sellerOrders.types";

export interface OrderStatusOption {
  value: OrderStatus | "all";
  label: string;
}

export const ORDER_STATUS_OPTIONS: OrderStatusOption[] = [
  { value: "all", label: "כל הסטטוסים" },
  { value: "pending", label: "ממתין לטיפול" },
  { value: "approved", label: "אושרה" },
  { value: "paid", label: "שולם" },
  { value: "completed", label: "הושלמה" },
  { value: "canceled", label: "בוטלה" },
  { value: "returned", label: "הוחזרה" },
];

export const ORDER_STATUS_COLORS: Record<OrderStatus, string> = {
  pending: "bg-amber-100 text-amber-800 border-amber-200",   // ממתין
  approved: "bg-sky-100 text-sky-800 border-sky-200",        // אושרה
  paid: "bg-emerald-100 text-emerald-800 border-emerald-200",// שולם
  completed: "bg-green-100 text-green-800 border-green-200", // הושלמה
  canceled: "bg-red-100 text-red-800 border-red-200",        // בוטלה
  returned: "bg-purple-100 text-purple-800 border-purple-200", // הוחזרה
};

export const NAVY = "#0C2F52";
export const ORANGE = "#ED6A23";
export const BORDER = "#E5E7EB";
export const MUTED_TEXT = "#6B7280";
export const MAIN_TEXT = "#141414";
