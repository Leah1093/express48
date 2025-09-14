import React, { useEffect, useState } from "react";
import { useOutletContext, useParams, useSearchParams } from "react-router-dom";
import axios from "axios";
import { abs } from "./abs";

export default function StoreProducts() {
  const { slug } = useParams();
  const { store } = useOutletContext();
  const [params, setParams] = useSearchParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const page = Math.max(1, parseInt(params.get("page") || "1"));
  const limit = store?.appearance?.productsPerPage || 24;

  useEffect(() => {
    let on = true;
    setLoading(true);
    (async () => {
      try {
        const { data } = await axios.get(`/api/public/store/${slug}/products`, { params: { page, limit } });
        if (on) setData(data);
      } catch {
        if (on) setData({ page, limit, total: 0, items: [] });
      } finally {
        if (on) setLoading(false);
      }
    })();
    return () => { on = false; };
  }, [slug, page, limit]);

  const next = () => setParams({ page: String(page + 1) });
  const prev = () => setParams({ page: String(Math.max(1, page - 1)) });

  if (loading) return <div className="p-4">טוען מוצרים...</div>;
  if (!data) return null;

  const totalPages = Math.max(1, Math.ceil((data.total || 0) / data.limit));

  return (
    <div className="mx-auto max-w-6xl">
      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 justify-items-stretch [direction:rtl]" style={{ justifyItems: "end" }}>
        {data.items?.map((p) => (
          <article key={p._id} className="w-full max-w-[360px] justify-self-end rounded-xl border bg-white p-3 shadow-sm">
            <a href={p.slug ? `/product/${p.slug}` : undefined} className="block">
              <div className="aspect-square w-full overflow-hidden rounded-lg bg-gray-100">
                {p.images?.[0]?.url && (
                  <img src={abs(p.images[0].url)} alt={p.images[0].alt || p.title} className="h-full w-full object-cover" />
                )}
              </div>
              <h3 className="mt-2 line-clamp-2 text-sm font-medium text-gray-900">{p.title}</h3>
              <div className="mt-1 text-sm text-gray-700">
                {typeof p.price === "number" ? `${p.price} ${p.currency || "₪"}` : ""}
              </div>
            </a>
          </article>
        ))}

        {!data.items?.length && (
          <div className="col-span-full rounded-xl border bg-white p-6 text-center text-gray-600">
            אין מוצרים להצגה.
          </div>
        )}
      </div>

      <div className="mt-4 flex items-center justify-between">
        <button onClick={prev} disabled={page <= 1} className="rounded-lg border px-3 py-1 text-sm disabled:opacity-50">קודם</button>
        <div className="text-sm">עמוד {page} מתוך {totalPages}</div>
        <button onClick={next} disabled={page >= totalPages} className="rounded-lg border px-3 py-1 text-sm disabled:opacity-50">הבא</button>
      </div>
    </div>
  );
}
