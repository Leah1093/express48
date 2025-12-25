export const DEFAULT_REPORT_LIMIT = 20;

export const REPORT_QUICK_RANGES = [
  { id: "7d", label: "7 ימים אחרונים" },
  { id: "30d", label: "30 ימים אחרונים" },
  { id: "90d", label: "90 ימים אחרונים" },
  { id: "all", label: "כל הזמנים" },
] as const;

export type ReportQuickRangeId = (typeof REPORT_QUICK_RANGES)[number]["id"];

export const REPORT_TABLE_COLUMNS = [
  { id: "product", label: "מוצר" },
  { id: "stock", label: "מלאי" },
  { id: "sold", label: "נמכר" },
  { id: "revenue", label: "סכום" },
] as const;
