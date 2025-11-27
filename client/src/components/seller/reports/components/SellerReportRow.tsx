import type { FC, MouseEvent } from "react";
import { useState } from "react";
import type { SellerProductReportItem } from "../types/sellerReports.types";
import { formatCurrencyIls } from "../utils/sellerReports.utils";
import { SellerReportDetails } from "./SellerReportDetails";

type Props = {
  item: SellerProductReportItem;
  from?: string;
  to?: string;
};

export const SellerReportRow: FC<Props> = ({ item, from, to }) => {
  const [open, setOpen] = useState(false);

  const toggle = (e: MouseEvent<HTMLTableRowElement>) => {
    if ((e.target as HTMLElement).closest("a,button")) return;
    setOpen((prev) => !prev);
  };

  return (
    <>
      <tr className="cursor-pointer hover:bg-gray-50" onClick={toggle}>
        <td className="p-2">
          <div className="flex items-center gap-2">
            {item.imageUrl ? (
              <img
                src={item.imageUrl}
                alt={item.title}
                className="w-10 h-10 rounded object-cover"
              />
            ) : null}
            <div className="flex flex-col">
              <span className="font-medium">{item.title}</span>
              <span className="text-xs text-gray-500">SKU: {item.sku}</span>
            </div>
          </div>
        </td>
        <td className="p-2">{item.currentStock}</td>
        <td className="p-2">{item.soldQuantity}</td>
        <td className="p-2">{formatCurrencyIls(item.totalRevenue)}</td>
      </tr>

      {open && (
        <tr>
          <td colSpan={4} className="p-0 bg-gray-50">
            <SellerReportDetails
              productId={item.productId}
              from={from}
              to={to}
            />
          </td>
        </tr>
      )}
    </>
  );
};
