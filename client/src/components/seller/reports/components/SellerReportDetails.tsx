import type { FC } from "react";
import { useGetSellerProductReportDetailsQuery } from "../../../../redux/services/sellerReportsApi";
import { formatCurrencyIls } from "../utils/sellerReports.utils";
import type { SellerProductReportDetailsItem } from "../types/sellerReports.types";

type Props = {
  productId: string;
  from?: string;
  to?: string;
};

export const SellerReportDetails: FC<Props> = ({ productId, from, to }) => {
  const { data, isLoading, isError } = useGetSellerProductReportDetailsQuery({
    productId,
    from: from || undefined,
    to: to || undefined,
  });

  if (isLoading) {
    return <div className="p-3 text-sm">טוען פירוט...</div>;
  }

  if (isError || !data) {
    return (
      <div className="p-3 text-sm text-red-600">
        לא ניתן לטעון את פירוט המוצר.
      </div>
    );
  }

  if (!data.items.length) {
    return (
      <div className="p-3 text-sm text-gray-600">
        אין עסקאות עבור מוצר זה בטווח התאריכים.
      </div>
    );
  }

  return (
    <div className="p-3 text-sm">
      <div className="font-semibold mb-2">פירוט עסקאות</div>
      <table className="w-full text-xs">
        <thead>
          <tr className="border-b">
            <th className="p-1 text-right">תאריך</th>
            <th className="p-1 text-right">מס' הזמנה</th>
            <th className="p-1 text-right">כמות</th>
            <th className="p-1 text-right">מחיר ליחידה</th>
            <th className="p-1 text-right">סך הכל</th>
          </tr>
        </thead>
        <tbody>
          {data.items.map((row: SellerProductReportDetailsItem) => (
            <tr key={row.orderId} className="border-b last:border-0">
              <td className="p-1">
                {new Date(row.date).toLocaleDateString("he-IL")}
              </td>
              <td className="p-1">{row.orderId}</td>
              <td className="p-1">{row.quantity}</td>
              <td className="p-1">{formatCurrencyIls(row.unitPrice)}</td>
              <td className="p-1">{formatCurrencyIls(row.total)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
