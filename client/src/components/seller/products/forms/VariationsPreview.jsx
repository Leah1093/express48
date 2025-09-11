import { useState } from "react";
import VariationEditModal from "./VariationEditModal";

// ממיר בבטחה לערך מספרי; אם לא מספר – מחזיר 0
function toNumberSafe(v) {
  const n = typeof v === "number" ? v : Number(v);
  return Number.isFinite(n) ? n : 0;
}

// איחוד מחיר להציג: ידני -> price.amount -> מחושב -> 0
function getDisplayPrice(v) {
  const manual = toNumberSafe(v?._manualOverride);
  const amount = toNumberSafe(v?.price?.amount);
  const calc = toNumberSafe(v?._calculatedPrice);
  const chosen = manual || amount || calc || 0;
  return toNumberSafe(chosen);
}

// תומך גם ב-Map מהשרת
function entriesFromAttributes(attrs) {
  if (!attrs) return [];
  if (attrs instanceof Map) return Array.from(attrs.entries());
  if (typeof attrs === "object") return Object.entries(attrs);
  return [];
}

export default function VariationsPreview({ items = [] }) {
  const [editing, setEditing] = useState(null);

  if (!Array.isArray(items) || !items.length) {
    return <div className="rounded-xl border p-3 text-sm opacity-70">אין וריאציות להצגה.</div>;
  }

  return (
    <div className="rounded-xl border p-3" dir="rtl">
      <h3 className="font-semibold mb-2">סקירת וריאציות ({items.length})</h3>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="bg-gray-50">
              <th className="p-2 text-right">תמונה</th>
              <th className="p-2 text-right">מאפיינים</th>
              <th className="p-2 text-right">SKU</th>
              <th className="p-2 text-right">מלאי</th>
              <th className="p-2 text-right">מחיר</th>
              <th className="p-2 text-right">פעולות</th>
            </tr>
          </thead>
          <tbody>
            {items.map((v, idx) => {
              const priceToShow = getDisplayPrice(v).toFixed(2);
              const attrs = entriesFromAttributes(v?.attributes);

              return (
                <tr key={v?.sellerSku || v?.gtin || idx} className="border-t">
                  <td className="p-2">
                    {Array.isArray(v?.images) && v.images[0] ? (
                      <img
                        src={v.images[0]}
                        alt=""
                        className="w-12 h-12 rounded-lg object-cover border"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-lg border bg-gray-50" />
                    )}
                  </td>

                  <td className="p-2">
                    <div className="flex flex-wrap gap-1">
                      {attrs.map(([k, val]) => (
                        <span key={`${k}-${String(val)}`} className="px-2 py-0.5 rounded-full bg-gray-100 border">
                          {k}: {String(val)}
                        </span>
                      ))}
                    </div>
                  </td>

                  <td className="p-2">{v?.sellerSku || "-"}</td>
                  <td className="p-2">{toNumberSafe(v?.stock)}</td>
                  <td className="p-2">{priceToShow} ₪</td>

                  <td className="p-2">
                    <button
                      type="button"
                      className="px-3 py-1.5 rounded-lg border"
                      onClick={() => setEditing({ index: idx, variation: v })}
                    >
                      עריכה
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {editing ? (
        <VariationEditModal
          index={editing.index}
          initial={editing.variation}
          onClose={() => setEditing(null)}
        />
      ) : null}
    </div>
  );
}
