import { useState } from "react";
import type { FC } from "react";
import type { SellerOrder, OrderStatus } from "../types/sellerOrders.types";
import { SellerOrderStatusBadge } from "./SellerOrderStatusBadge";
import {
  formatOrderDate,
  formatPriceIls,
  getOrderAddressLine,
} from "../utils/sellerOrders.utils";
import {
  MUTED_TEXT,
  ORDER_STATUS_OPTIONS,
} from "../constants/sellerOrders.constants";
import { FiChevronRight, FiChevronLeft } from "react-icons/fi";

interface Props {
  orders: SellerOrder[];
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
  onChangeStatus: (orderId: string, status: OrderStatus) => void;
  isUpdatingStatus: boolean;
}

const SellerOrdersTable: FC<Props> = ({
  orders,
  isLoading,
  isError,
  onRetry,
  onChangeStatus,
  isUpdatingStatus,
}) => {
  if (isLoading) {
    return (
      <div className="w-full py-10 text-center text-sm text-slate-600">
        טוען הזמנות...
      </div>
    );
  }

  if (isError) {
    return (
      <div className="w-full py-8 text-center text-sm text-red-700">
        שגיאה בטעינת ההזמנות.
        <button
          type="button"
          onClick={onRetry}
          className="mr-2 underline text-red-700"
        >
          נסי שוב
        </button>
      </div>
    );
  }

  if (!orders.length) {
    return (
      <div className="w-full py-10 text-center text-sm text-slate-600">
        אין עדיין הזמנות למוכר זה.
      </div>
    );
  }

  return (
    <div className="space-y-4" dir="rtl">
      {/* מובייל / טאבלט - כרטיסים */}
      <div className="space-y-3 lg:hidden">
        {orders.map((order) => (
          <MobileOrderCard
            key={order.id}
            order={order}
            onChangeStatus={onChangeStatus}
            isUpdatingStatus={isUpdatingStatus}
          />
        ))}
      </div>

      {/* דסקטופ - טבלה */}
<div className="hidden lg:block w-full max-w-full overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
  <table className="w-full table-fixed text-right text-sm">
          <thead className="bg-slate-50">
            <tr className="text-xs font-medium text-slate-500 border-b border-slate-200">
              <th className="px-4 py-3 whitespace-nowrap">מספר הזמנה</th>
              <th className="px-4 py-3 whitespace-nowrap">תאריך</th>
              <th className="px-4 py-3 whitespace-nowrap">לקוח</th>
              <th className="px-4 py-3 whitespace-nowrap">כתובת</th>
              <th className="px-4 py-3 whitespace-nowrap">מוצרים</th>
              <th className="px-4 py-3 whitespace-nowrap">תמונה</th>
              <th className="px-4 py-3 whitespace-nowrap text-left">
                סכום
              </th>
              <th className="px-4 py-3 whitespace-nowrap">סטטוס</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {orders.map((order) => (
              <DesktopOrderRow
                key={order.id}
                order={order}
                onChangeStatus={onChangeStatus}
                isUpdatingStatus={isUpdatingStatus}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SellerOrdersTable;

type RowProps = {
  order: SellerOrder;
  onChangeStatus: (orderId: string, status: OrderStatus) => void;
  isUpdatingStatus: boolean;
};


const DesktopOrderRow: FC<RowProps> = ({
  order,
  onChangeStatus,
  isUpdatingStatus,
}) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [expanded, setExpanded] = useState(false);

  const items = order.items || [];
  const itemCount = items.length;
  const safeIndex =
    itemCount === 0 ? 0 : Math.min(activeIndex, itemCount - 1);
  const activeItem = itemCount > 0 ? items[safeIndex] : undefined;

  const customerName =
    order.buyerName || order.buyerEmail || "לקוח ללא שם";

  const amount = order.discountedAmount ?? order.totalAmount ?? 0;

  const addressLine = getOrderAddressLine(order);
  const notes = order.shippingAddress?.notes;

  const handlePrev = () => {
    if (itemCount <= 1) return;
    setActiveIndex((prev) => (prev === 0 ? itemCount - 1 : prev - 1));
  };

  const handleNext = () => {
    if (itemCount <= 1) return;
    setActiveIndex((prev) =>
      prev === itemCount - 1 ? 0 : prev + 1
    );
  };

  const statusOptions = ORDER_STATUS_OPTIONS.filter(
    (opt) => opt.value !== "all"
  );

  return (
    <>
      <tr
        className="hover:bg-slate-50/70 transition-colors cursor-pointer"
        onClick={() => setExpanded((prev) => !prev)}
        aria-expanded={expanded}
      >
        {/* מספר הזמנה */}
        <td className="px-4 py-3 align-top ">
          <div className="flex flex-col items-start gap-1">
            <span className="font-medium text-slate-900 break-all">
              {order.orderId}
            </span>
            <span
              className="text-[11px]"
              style={{ color: MUTED_TEXT }}
            >
              מזהה פנימי: {order.id.slice(-8)}
            </span>
          </div>
        </td>

        {/* תאריך */}
        <td className="px-4 py-3 align-top ">
          <span className="text-slate-800 text-sm">
            {formatOrderDate(order.orderDate)}
          </span>
        </td>

        {/* לקוח */}
        <td className="px-4 py-3 align-top max-w-[220px] whitespace-normal break-words">
          <div className="flex flex-col items-start gap-1">
            <span className="text-sm text-slate-900">
              {customerName}
            </span>
            {order.buyerPhone && (
              <span
                className="text-[11px]"
                style={{ color: MUTED_TEXT }}
              >
                {order.buyerPhone}
              </span>
            )}
          </div>
        </td>

        {/* כתובת */}
        <td className="px-4 py-3 align-top max-w-[220px] whitespace-normal break-words">
          <div className="flex flex-col items-start gap-1">
            <span className="text-sm text-slate-800">
              {addressLine || "-"}
            </span>
            {notes && (
              <span className="text-[11px] text-slate-500">
                {notes}
              </span>
            )}
          </div>
        </td>

        {/* מוצרים – כל המוצרים שורה אחרי שורה */}
        <td className="px-4 py-3 align-top max-w-[260px]">
          <div className="flex flex-col items-start gap-1 max-h-24 overflow-y-auto pr-1">
            {itemCount === 0 && (
              <span className="text-sm text-slate-400">-</span>
            )}

            {items.map((it, idx) => (
              <span
                key={it.productId + idx}
                className="text-sm text-slate-900 w-full truncate"
                title={it.productTitle}
              >
                {it.productTitle || `מוצר ${idx + 1}`}
              </span>
            ))}

            {itemCount > 1 && (
              <span
                className="text-[11px]"
                style={{ color: MUTED_TEXT }}
              >
                {itemCount} פריטים בהזמנה
              </span>
            )}
          </div>
        </td>

        {/* תמונה – חיצים משני הצדדים, מונה מתחת */}
        <td className="px-4 py-3 align-top whitespace-nowrap">
          <div className="flex flex-col items-center gap-1">
            <div className="flex items-center gap-1">
              {itemCount > 1 && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePrev();
                  }}
                  className="flex h-6 w-6 items-center justify-center rounded-full border border-slate-200 bg-white hover:bg-slate-100 text-slate-500"
                >
                  <FiChevronRight className="w-4 h-4" />
                </button>
              )}

              <div className="w-14 h-14 rounded-lg border border-slate-200 overflow-hidden bg-slate-50 flex items-center justify-center">
                {activeItem?.thumbnailUrl ? (
                  <img
                    src={activeItem.thumbnailUrl}
                    alt={activeItem.productTitle}
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <span className="text-[10px] text-slate-400 text-center px-1">
                    אין תמונה
                  </span>
                )}
              </div>

              {itemCount > 1 && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleNext();
                  }}
                  className="flex h-6 w-6 items-center justify-center rounded-full border border-slate-200 bg-white hover:bg-slate-100 text-slate-500"
                >
                  <FiChevronLeft className="w-4 h-4" />
                </button>
              )}
            </div>

            {itemCount > 1 && (
              <div className="text-[11px] text-slate-600">
                {safeIndex + 1} / {itemCount}
              </div>
            )}
          </div>
        </td>

        {/* סכום */}
        <td className="px-4 py-3 align-top text-left whitespace-nowrap">
          <span className="text-sm font-semibold text-slate-900">
            {formatPriceIls(amount)}
          </span>
        </td>

        {/* סטטוס */}
        <td className="px-4 py-3 align-top text-left whitespace-nowrap">
          <div className="flex flex-col items-start gap-1">
            <SellerOrderStatusBadge status={order.status} />
            <select
              value={order.status}
              disabled={isUpdatingStatus}
              onClick={(e) => e.stopPropagation()}
              onChange={(e) => {
                e.stopPropagation();
                onChangeStatus(order.id, e.target.value as OrderStatus);
              }}
              className="mt-1 rounded-md border border-slate-300 bg-white px-2 py-1 text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-orange-400"
            >
              {statusOptions.map((opt) => (
                <option
                  key={opt.value}
                  value={opt.value as OrderStatus}
                >
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </td>
      </tr>

      {/* פירוט מלא בלחיצה – כמו שהיה */}
      {expanded && (
        <tr className="bg-slate-50/60">
          <td colSpan={8} className="px-4 py-3 text-xs text-slate-700">
            <div className="flex flex-col gap-3">
              <div className="space-y-1">
                <div className="font-semibold">פרטי ההזמנה:</div>
                <div>מספר הזמנה: {order.orderId}</div>
                <div>תאריך: {formatOrderDate(order.orderDate)}</div>
                <div>סטטוס: {order.status}</div>
                <div>כתובת: {addressLine || "-"}</div>
              </div>

              <div>
                <span className="font-semibold">מוצרים בהזמנה:</span>
                <ul className="mt-1 list-disc pr-5 space-y-1">
                  {items.map((it, idx) => {
                    const hasSku = !!it.sku;
                    const hasVariation = !!it.variationName;
                    const unit = it.unitPrice ?? 0;
                    const line = it.lineTotal ?? unit * it.quantity;

                    return (
                      <li key={it.productId + idx}>
                        <div className="flex flex-col gap-0.5">
                          <span className="font-medium">
                            {it.productTitle}
                          </span>

                          {(hasSku || hasVariation) && (
                            <span className="text-slate-500">
                              {hasVariation &&
                                `וריאציה: ${it.variationName}`}
                              {hasVariation && hasSku && " | "}
                              {hasSku && `מק״ט: ${it.sku}`}
                            </span>
                          )}

                          <span className="text-slate-500">
                            כמות: {it.quantity} | מחיר ליחידה:{" "}
                            {formatPriceIls(unit)} | סה״כ שורה:{" "}
                            {formatPriceIls(line)}
                          </span>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
};

/* ===========================
   כרטיס מובייל
   =========================== */

const MobileOrderCard: FC<RowProps> = ({
  order,
  onChangeStatus,
  isUpdatingStatus,
}) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [expanded, setExpanded] = useState(false);

  const items = order.items || [];
  const itemCount = items.length;
  const safeIndex =
    itemCount === 0 ? 0 : Math.min(activeIndex, itemCount - 1);
  const activeItem = itemCount > 0 ? items[safeIndex] : undefined;

  const customerName =
    order.buyerName || order.buyerEmail || "לקוח ללא שם";

  const amount = order.discountedAmount ?? order.totalAmount ?? 0;

  const addressLine = getOrderAddressLine(order);
  const notes = order.shippingAddress?.notes;

  const handlePrev = () => {
    if (itemCount <= 1) return;
    setActiveIndex((prev) => (prev === 0 ? itemCount - 1 : prev - 1));
  };

  const handleNext = () => {
    if (itemCount <= 1) return;
    setActiveIndex((prev) =>
      prev === itemCount - 1 ? 0 : prev + 1
    );
  };

  const itemsSummary =
    itemCount === 0 ? "-" : activeItem?.productTitle ?? "";

  const statusOptions = ORDER_STATUS_OPTIONS.filter(
    (opt) => opt.value !== "all"
  );

  return (
    <article
      className="rounded-2xl border border-slate-200 bg-white shadow-sm px-4 py-3 space-y-3"
      onClick={() => setExpanded((prev) => !prev)}
    >
      {/* שורה עליונה */}
      <header className="flex items-start justify-between gap-2">
        <div className="flex flex-col gap-1">
          <span className="text-xs text-slate-500">
            מספר הזמנה
          </span>
          <span className="text-sm font-semibold text-slate-900">
            {order.orderId}
          </span>
          <span
            className="text-[11px]"
            style={{ color: MUTED_TEXT }}
          >
            מזהה פנימי: {order.id.slice(-8)}
          </span>
        </div>
        <div className="flex flex-col items-end gap-1">
          <SellerOrderStatusBadge status={order.status} />
          <span className="text-[11px] text-slate-500">
            {formatOrderDate(order.orderDate)}
          </span>
        </div>
      </header>

      {/* סטטוס - select קטן מתחת לבאדג */}
      <div className="flex justify-between items-center gap-2">
        <span className="text-xs text-slate-500">
          שינוי סטטוס:
        </span>
        <select
          value={order.status}
          disabled={isUpdatingStatus}
          onClick={(e) => e.stopPropagation()}
          onChange={(e) => {
            e.stopPropagation();
            onChangeStatus(order.id, e.target.value as OrderStatus);
          }}
          className="rounded-md border border-slate-300 bg-white px-2 py-1 text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-orange-400"
        >
          {statusOptions.map((opt) => (
            <option
              key={opt.value}
              value={opt.value as OrderStatus}
            >
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {/* תמונה + מוצר */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          {itemCount > 1 && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handlePrev();
              }}
              className="p-1 rounded-full border border-slate-200 hover:bg-slate-100 text-slate-500"
            >
              <FiChevronRight className="w-4 h-4" />
            </button>
          )}

          <div className="w-14 h-14 rounded-lg border border-slate-200 overflow-hidden bg-slate-50 flex items-center justify-center">
            {activeItem?.thumbnailUrl ? (
              <img
                src={activeItem.thumbnailUrl}
                alt={activeItem.productTitle}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-[10px] text-slate-400 text-center px-1">
                אין תמונה
              </span>
            )}
          </div>

          {itemCount > 1 && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleNext();
              }}
              className="p-1 rounded-full border border-slate-200 hover:bg-slate-100 text-slate-500"
            >
              <FiChevronLeft className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="flex-1 flex flex-col gap-1">
          <span className="text-xs text-slate-500">
            מוצר פעיל
          </span>
          <span className="text-sm text-slate-900 w-full truncate">
            {itemsSummary}
          </span>
          {itemCount > 1 && (
            <span
              className="text-[11px]"
              style={{ color: MUTED_TEXT }}
            >
              {itemCount} פריטים בהזמנה
            </span>
          )}
        </div>
      </div>

      {/* לקוח */}
      <div className="flex flex-col gap-1">
        <span className="text-xs text-slate-500">לקוח</span>
        <span className="text-sm text-slate-900">
          {customerName}
        </span>
        {order.buyerPhone && (
          <span
            className="text-[11px]"
            style={{ color: MUTED_TEXT }}
          >
            {order.buyerPhone}
          </span>
        )}
      </div>

      {/* כתובת */}
      <div className="flex flex-col gap-1">
        <span className="text-xs text-slate-500">כתובת</span>
        <span className="text-sm text-slate-800">
          {addressLine || "-"}
        </span>
        {notes && (
          <span className="text-[11px] text-slate-500">
            {notes}
          </span>
        )}
      </div>

      {/* סכום */}
      <footer className="flex items-center justify-between pt-3 mt-1 border-t border-slate-100">
        <span className="text-xs text-slate-500">
          סכום כולל להזמנה
        </span>
        <span className="text-sm font-semibold text-slate-900">
          {formatPriceIls(amount)}
        </span>
      </footer>

      {/* פירוט מוצרים בהרחבה */}
      {expanded && (
        <div className="pt-2 mt-2 border-t border-dashed border-slate-200 text-[11px] text-slate-700 space-y-1">
          <div className="font-semibold mb-1">
            פרטי מוצרים:
          </div>
          <ul className="list-disc pr-4 space-y-0.5">
            {items.map((it, idx) => {
              const hasSku = !!it.sku;
              const hasVariation = !!it.variationName;
              const unit = it.unitPrice ?? 0;
              const line = it.lineTotal ?? unit * it.quantity;

              return (
                <li key={it.productId + idx}>
                  <div className="flex flex-col gap-0.5">
                    <span className="font-medium">
                      {it.productTitle}
                    </span>

                    {(hasSku || hasVariation) && (
                      <span className="text-slate-500">
                        {hasVariation &&
                          `וריאציה: ${it.variationName}`}
                        {hasVariation && hasSku && " | "}
                        {hasSku && `מק״ט: ${it.sku}`}
                      </span>
                    )}

                    <span className="text-slate-500">
                      כמות: {it.quantity} | מחיר ליחידה:{" "}
                      {formatPriceIls(unit)} | סה״כ:{" "}
                      {formatPriceIls(line)}
                    </span>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </article>
  );
};
