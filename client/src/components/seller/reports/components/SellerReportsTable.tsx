import type { FC } from "react";
import type { SellerProductReportItem } from "../types/sellerReports.types";
import { calcTotals, formatCurrencyIls } from "../utils/sellerReports.utils";
import { SellerReportRow } from "./SellerReportRow";

type Props = {
  items: SellerProductReportItem[];
  isLoading: boolean;
  page: number;
  limit: number;
  total: number;
  onPageChange: (page: number) => void;
  from?: string;
  to?: string;
};

export const SellerReportsTable: FC<Props> = ({
  items,
  isLoading,
  page,
  limit,
  total,
  onPageChange,
  from,
  to,
}) => {
  const totals = calcTotals(items);

  if (isLoading) {
    return <div>טוען דוח...</div>;
  }

  if (!items.length) {
    return <div>אין נתונים לטווח התאריכים שנבחר.</div>;
  }

  const totalPages = Math.max(1, Math.ceil(total / limit));

  return (
    <div className="border rounded-lg overflow-hidden bg-white">
      <table className="w-full text-sm">
        <thead className="bg-gray-50">
          <tr>
            <th className="p-2 text-right">מוצר</th>
            <th className="p-2 text-right">מלאי</th>
            <th className="p-2 text-right">נמכר</th>
            <th className="p-2 text-right">סכום</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <SellerReportRow
              key={item.productId}
              item={item}
              from={from}
              to={to}
            />
          ))}
        </tbody>
        <tfoot className="bg-gray-50">
          <tr>
            <td className="p-2 font-semibold">סה"כ</td>
            <td className="p-2" />
            <td className="p-2 font-semibold">{totals.totalSold}</td>
            <td className="p-2 font-semibold">
              {formatCurrencyIls(totals.totalRevenue)}
            </td>
          </tr>
        </tfoot>
      </table>

      <div className="flex justify-between items-center px-3 py-2 border-t text-sm">
        <span>
          עמוד {page} מתוך {totalPages}
        </span>
        <div className="flex gap-2">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => onPageChange(page - 1)}
            className="px-2 py-1 border rounded disabled:opacity-50"
          >
            הקודם
          </button>
          <button
            type="button"
            disabled={page >= totalPages}
            onClick={() => onPageChange(page + 1)}
            className="px-2 py-1 border rounded disabled:opacity-50"
          >
            הבא
          </button>
        </div>
      </div>
    </div>
  );
};
