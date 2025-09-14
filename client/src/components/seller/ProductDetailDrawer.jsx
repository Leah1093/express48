import { Fragment, useEffect } from "react";
import { createPortal } from "react-dom";
import { useGetSellerProductByIdQuery } from "../../redux/services/sellerProductsApi";

export default function ProductDetailDrawer({ id, onClose }) {
  const enabled = Boolean(id);
  const { data, isFetching, isError } = useGetSellerProductByIdQuery(id, {
    skip: !enabled,
  });

  // סגירה ב-Escape
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose?.();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  if (!enabled) return null;

  return createPortal(
    <Fragment>
      <div className="fixed inset-0 bg-black/25" onClick={onClose} />
      <div dir="rtl" className="fixed top-0 right-0 h-full w-full max-w-xl bg-white shadow-2xl p-4 overflow-y-auto">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xl font-bold">פרטי מוצר</h2>
          <button onClick={onClose} className="text-sm px-3 py-1 border rounded-lg">סגירה</button>
        </div>

        {isFetching && <div>טוען…</div>}
        {isError && <div className="text-red-600">שגיאה בטעינת המוצר.</div>}

        {data && (
          <div className="space-y-3">
            <div className="flex gap-3">
              <div className="w-28 h-28 bg-gray-100 rounded-lg overflow-hidden">
                {data.images?.[0] && <img src={data.images[0]} alt="" className="w-full h-full object-cover" />}
              </div>
              <div>
                <div className="text-lg font-semibold">{data.title}</div>
                <div className="text-sm opacity-70">{data.brand} {data.model}</div>
                <div className="text-sm">SKU: {data.sku}</div>
                <div className="text-sm">GTIN: {data.gtin || "-"}</div>
                <div className="text-sm">מחיר: {data?.price?.amount?.toLocaleString?.("he-IL")} {data.currency || "ILS"}</div>
                <div className="text-sm">מלאי: {data.stock}</div>
                <div className="text-sm">סטטוס: {data.status}</div>
              </div>
            </div>

            {data.description && (
              <div>
                <div className="font-semibold mb-1">תיאור</div>
                <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: data.description }} />
              </div>
            )}

            {Array.isArray(data.variations) && data.variations.length > 0 && (
              <div>
                <div className="font-semibold mb-1">וריאציות</div>
                <div className="border rounded-xl overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 text-right">
                      <tr>
                        <th className="p-2">SKU</th>
                        <th className="p-2">מאפיינים</th>
                        <th className="p-2">מחיר</th>
                        <th className="p-2">מלאי</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.variations.map(v => (
                        <tr key={v._id} className="border-t">
                          <td className="p-2">{v.sku}</td>
                          <td className="p-2">
                            {v.attributes
                              ? Object.entries(Object.fromEntries(Object.entries(v.attributes))).map(([k,val]) =>
                                  <span key={k} className="inline-block mr-2 mb-1 px-2 py-0.5 bg-gray-100 rounded">{k}: {String(val)}</span>
                                )
                              : "-"}
                          </td>
                          <td className="p-2">{v?.price?.amount ?? "-"}</td>
                          <td className="p-2">{v?.stock ?? 0}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {data.seo && (
              <div className="grid grid-cols-1 gap-2">
                <div><span className="font-semibold">Meta Title: </span>{data.seo?.title || data.metaTitle}</div>
                <div><span className="font-semibold">Meta Description: </span>{data.seo?.description || data.metaDescription}</div>
              </div>
            )}
          </div>
        )}
      </div>
    </Fragment>,
    document.body
  );
}
