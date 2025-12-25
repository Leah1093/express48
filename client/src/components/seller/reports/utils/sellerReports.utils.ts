import type {
  SellerProductReportItem,
  SellerProductReportQuery,
} from "../types/sellerReports.types";

export function formatCurrencyIls(value: number): string {
  if (!Number.isFinite(value)) return "₪0";
  return `₪${value.toLocaleString("he-IL", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;
}

// חישוב סיכומים כלליים (רק בצד לקוח לצורך הצגה)
export function calcTotals(items: SellerProductReportItem[]) {
  return items.reduce(
    (acc, item) => {
      acc.totalSold += item.soldQuantity;
      acc.totalRevenue += item.totalRevenue;
      return acc;
    },
    { totalSold: 0, totalRevenue: 0 }
  );
}

// בניית אובייקט query נקי ל־RTK Query
export function buildReportQueryParams(
  base: SellerProductReportQuery
): Record<string, string> {
  const params = new URLSearchParams();

  if (base.from) params.set("from", base.from);
  if (base.to) params.set("to", base.to);
  if (base.page != null) params.set("page", String(base.page));
  if (base.limit != null) params.set("limit", String(base.limit));

  return Object.fromEntries(params.entries());
}
