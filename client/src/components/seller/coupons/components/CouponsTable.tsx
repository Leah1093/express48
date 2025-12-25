import { useState, type FC } from "react";
import { FiEdit2, FiTrash2, FiChevronDown, FiChevronUp } from "react-icons/fi";
import type { CouponDto } from "./CouponForm";
import {
  DISCOUNT_TYPE_LABELS,
  RESTRICTION_TYPE_LABELS,
} from "../constants/coupon.constants";

type Props = {
  coupons: CouponDto[];
  onEdit: (coupon: CouponDto) => void;
  onDelete: (coupon: CouponDto) => void;
};

const formatDate = (iso: string) => iso.slice(0, 10);
const formatMinOrder = (amount: number) =>
  amount > 0 ? `${amount} ₪` : "ללא מינימום";

const getUsageText = (coupon: CouponDto): string => {
  const anyCoupon = coupon as any;
  const usedBy = Array.isArray(anyCoupon.usedBy) ? anyCoupon.usedBy : [];
  const usedCount = usedBy.length;

  if (coupon.usageLimit == null) {
    return `${usedCount} שימושים`;
  }

  return `${usedCount} / ${coupon.usageLimit}`;
};

const getRestrictionsSummary = (coupon: CouponDto): string => {
  const anyCoupon = coupon as any;

  const tags: string[] = [];

  // מינימום הזמנה
  if (coupon.minOrderAmount > 0) {
    tags.push(`מינימום ${coupon.minOrderAmount} ₪`);
  }

  // הגבלת כמות שימושים כללית
  if (coupon.usageLimit != null) {
    tags.push(`עד ${coupon.usageLimit} שימושים`);
  }

  // חד פעמי ללקוח
  if (coupon.usagePerUser) {
    tags.push("שימוש חד פעמי ללקוח");
  }

  // הגבלות לפי רשימות
  const allowedProductsCount = Array.isArray(anyCoupon.allowedProducts)
    ? anyCoupon.allowedProducts.length
    : 0;
  const allowedUsersCount = Array.isArray(anyCoupon.allowedUsers)
    ? anyCoupon.allowedUsers.length
    : 0;
  const allowedSellersCount = Array.isArray(anyCoupon.allowedSellers)
    ? anyCoupon.allowedSellers.length
    : 0;

  if (allowedProductsCount > 0) {
    tags.push(`מוצרים ספציפיים (${allowedProductsCount})`);
  }

  if (allowedUsersCount > 0) {
    tags.push(`לקוחות מסוימים (${allowedUsersCount})`);
  }

  if (allowedSellersCount > 0) {
    tags.push(`מוכרים מסוימים (${allowedSellersCount})`);
  }

  // אם אין כלום, נ fallback לפי restrictionType
  if (!tags.length && coupon.restrictionType === "none") {
    return "ללא הגבלות מיוחדות";
  }

  if (!tags.length) {
    return (
      RESTRICTION_TYPE_LABELS[coupon.restrictionType] || "הגבלה מותאמת אישית"
    );
  }

  return tags.join(" • ");
};

// ========= helpers לשמות יפים במקום IDs =========

const getUserLabel = (item: any): string => {
  if (!item) return "";
  if (typeof item === "string") return item;
  // אם זה מאוכלס מ-populate: { _id, username, email }
  const parts = [
    item.username,
    item.email ? `(${item.email})` : "",
  ].filter(Boolean);
  if (parts.length) return parts.join(" ");
  return item._id || String(item);
};

const getProductLabel = (item: any): string => {
  if (!item) return "";
  if (typeof item === "string") return item;
  // אם זה מאוכלס מ-populate: { _id, title, sku, brand }
  const parts = [
    item.title,
    item.sku ? `SKU: ${item.sku}` : "",
    item.brand ? `(${item.brand})` : "",
  ].filter(Boolean);
  if (parts.length) return parts.join(" ");
  return item._id || String(item);
};

const getSellerLabel = (item: any): string => {
  if (!item) return "";
  if (typeof item === "string") return item;

  const labelParts = [
    item.fullName,
    item.name,
    item.sellerName,
    item.companyName,
  ].filter(Boolean);

  if (labelParts.length) {
    return labelParts.join(" - ");
  }

  // fallback אחרון
  return item._id || String(item);
};


const renderList = (items: any[], getLabel: (x: any) => string) =>
  items.length === 0 ? (
    <span className="text-xs text-slate-400">ללא</span>
  ) : (
    <ul className="mt-1 space-y-0.5 text-xs text-slate-700 break-all">
      {items.map((item, idx) => (
        <li key={idx}>{getLabel(item)}</li>
      ))}
    </ul>
  );

// =================================================

// רכיב פנימי שמציג את החלונית מתחת לשורה
const CouponDetailsRow: FC<{ coupon: CouponDto; colSpan: number }> = ({
  coupon,
  colSpan,
}) => {
  const anyCoupon = coupon as any;

  const allowedProducts: any[] = Array.isArray(anyCoupon.allowedProducts)
    ? anyCoupon.allowedProducts
    : [];
  const allowedUsers: any[] = Array.isArray(anyCoupon.allowedUsers)
    ? anyCoupon.allowedUsers
    : [];
  const allowedSellers: any[] = Array.isArray(anyCoupon.allowedSellers)
    ? anyCoupon.allowedSellers
    : [];
  const usedByRaw: any[] = Array.isArray(anyCoupon.usedBy)
    ? anyCoupon.usedBy
    : [];

  // usedBy אצלך זה [{ userId, count }], ואם עשית populate זה יהיה userId = אובייקט של יוזר
  const usedByUsers = usedByRaw
    .map((entry) => entry?.userId || entry) // אם אין userId (למקרה ישן) – נ fallback לכולו
    .filter(Boolean);

  return (
    <tr className="bg-slate-50/60">
      <td colSpan={colSpan} className="px-4 pb-4 pt-2">
        <div className="text-right text-sm text-slate-800">
          <div className="mb-2 text-xs font-semibold text-slate-500">
            פרטים מפורטים על הקופון
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {/* צד שמאל: הגבלות כלליות */}
            <div className="space-y-1.5">
              <div className="text-xs text-slate-600">
                <span className="font-semibold">קוד:</span> {coupon.code}
              </div>
              <div className="text-xs text-slate-600">
                <span className="font-semibold">סוג הנחה:</span>{" "}
                {DISCOUNT_TYPE_LABELS[coupon.discountType]}
              </div>
              <div className="text-xs text-slate-600">
                <span className="font-semibold">ערך הנחה:</span>{" "}
                {coupon.discountType === "percent"
                  ? `${coupon.discountValue}%`
                  : `${coupon.discountValue} ₪`}
              </div>
              <div className="text-xs text-slate-600">
                <span className="font-semibold">תוקף:</span>{" "}
                {formatDate(coupon.expiryDate)}
              </div>
              <div className="text-xs text-slate-600">
                <span className="font-semibold">מינימום הזמנה:</span>{" "}
                {formatMinOrder(coupon.minOrderAmount)}
              </div>
              <div className="text-xs text-slate-600">
                <span className="font-semibold">שימושים:</span>{" "}
                {getUsageText(coupon)}
              </div>
              <div className="text-xs text-slate-600">
                <span className="font-semibold">שימוש פר לקוח:</span>{" "}
                {coupon.usagePerUser ? "חד פעמי" : "ללא הגבלה מיוחדת"}
              </div>
              <div className="text-xs text-slate-600">
                <span className="font-semibold">סוג הגבלה:</span>{" "}
                {RESTRICTION_TYPE_LABELS[coupon.restrictionType] ??
                  coupon.restrictionType}
              </div>
            </div>

            {/* צד ימין: רשימות מפורטות עם שמות */}
            <div className="space-y-3">
              <div>
                <div className="text-xs font-semibold text-slate-600">
                  מוצרים שהקופון תקף עליהם
                </div>
                {renderList(allowedProducts, getProductLabel)}
              </div>

              <div>
                <div className="text-xs font-semibold text-slate-600">
                  לקוחות ספציפיים
                </div>
                {renderList(allowedUsers, getUserLabel)}
              </div>

              <div>
                <div className="text-xs font-semibold text-slate-600">
                  מוכרים ספציפיים
                </div>
                {renderList(allowedSellers, getSellerLabel)}
              </div>

              <div>
                <div className="text-xs font-semibold text-slate-600">
                  לקוחות שכבר השתמשו בקופון
                </div>
                {renderList(usedByUsers, getUserLabel)}
              </div>
            </div>
          </div>
        </div>
      </td>
    </tr>
  );
};

export const CouponsTable: FC<Props> = ({ coupons, onEdit, onDelete }) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  if (!coupons.length) {
    return (
      <div className="w-full rounded-xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center text-sm text-slate-500">
        עדיין לא יצרת קופונים. לחצי על "קופון חדש" כדי להתחיל.
      </div>
    );
  }

  const toggleRow = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  const COL_COUNT = 8;

  return (
    <div className="w-full overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
      <table className="min-w-full text-right" dir="rtl">
        <thead className="bg-slate-50 text-xs font-medium text-slate-600">
          <tr>
            <th className="px-3 py-3.5 w-8"></th>
            <th className="px-4 py-3.5">קוד</th>
            <th className="px-4 py-3.5">סוג</th>
            <th className="px-4 py-3.5">ערך</th>
            <th className="px-4 py-3.5">תוקף עד</th>
            <th className="px-4 py-3.5 whitespace-nowrap">שימושים</th>
            <th className="px-4 py-3.5 whitespace-nowrap">מינימום הזמנה</th>
            <th className="px-4 py-3.5">הגבלות</th>
            <th className="px-4 py-3.5 text-center">פעולות</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 text-sm">
          {coupons.map((coupon) => {
            const isExpanded = expandedId === coupon._id;

            return (
              <>
                <tr
                  key={coupon._id}
                  className="cursor-pointer hover:bg-slate-50/60"
                  onClick={() => toggleRow(coupon._id)}
                >
                  {/* צ'ברון פתיחה/סגירה */}
                  <td className="px-3 py-3.5 text-center align-middle">
                    {isExpanded ? (
                      <FiChevronUp className="mx-auto h-4 w-4 text-slate-500" />
                    ) : (
                      <FiChevronDown className="mx-auto h-4 w-4 text-slate-500" />
                    )}
                  </td>

                  <td className="px-4 py-3.5 font-mono text-xs text-slate-900">
                    {coupon.code}
                  </td>
                  <td className="px-4 py-3.5 text-slate-800 whitespace-nowrap">
                    {DISCOUNT_TYPE_LABELS[coupon.discountType]}
                  </td>
                  <td className="px-4 py-3.5 text-slate-800 whitespace-nowrap">
                    {coupon.discountType === "percent"
                      ? `${coupon.discountValue}%`
                      : `${coupon.discountValue} ₪`}
                  </td>
                  <td className="px-4 py-3.5 text-slate-700 whitespace-nowrap">
                    {formatDate(coupon.expiryDate)}
                  </td>
                  <td className="px-4 py-3.5 text-slate-700 whitespace-nowrap">
                    {getUsageText(coupon)}
                  </td>
                  <td className="px-4 py-3.5 text-slate-700 whitespace-nowrap">
                    {formatMinOrder(coupon.minOrderAmount)}
                  </td>
                  <td className="px-4 py-3.5 text-slate-700 text-xs sm:text-sm">
                    {getRestrictionsSummary(coupon)}
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onEdit(coupon);
                        }}
                        className="flex items-center gap-1 rounded-full border border-slate-200 px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-100"
                      >
                        <FiEdit2 className="h-3 w-3" />
                        עריכה
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDelete(coupon);
                        }}
                        className="flex items-center gap-1 rounded-full border border-red-100 bg-red-50 px-3 py-1.5 text-xs text-red-700 hover:bg-red-100"
                      >
                        <FiTrash2 className="h-3 w-3" />
                        מחיקה
                      </button>
                    </div>
                  </td>
                </tr>

                {isExpanded && (
                  <CouponDetailsRow
                    key={`${coupon._id}-details`}
                    coupon={coupon}
                    colSpan={COL_COUNT + 1} // כולל עמודת הצ'ברון
                  />
                )}
              </>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
