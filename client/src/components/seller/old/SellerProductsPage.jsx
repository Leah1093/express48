// pages/seller/SellerProductsPage.jsx
import { useEffect, useState } from "react";
import axios from "axios";


import ProductForm from "./ProductForm";
import ProductImages from "./ProductImages";
export default function SellerProductsPage() {
  const api = axios.create({
    baseURL: "http://localhost:8080",
    withCredentials: true,
    timeout: 15000,
  });

  const [rows, setRows] = useState([]);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [q, setQ] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const [editing, setEditing] = useState(null); // null=create, {_id:..}=edit
  const [focusImagesFor, setFocusImagesFor] = useState(null);

  const load = async () => {
    try {
      setBusy(true);
      const { data } = await api.get("/seller/products", {
        params: { page, limit, q, sort: "-createdAt" },
      });
      setRows(data?.items || []);
      setMsg("");
    } catch (e) {
      setMsg(e?.response?.data?.message || "שגיאה בטעינה");
    } finally { setBusy(false); }
  };

  useEffect(() => { load(); }, [page, q]);

  const onDelete = async (id) => {
    if (!confirm("למחוק מוצר?")) return;
    try {
      setBusy(true);
      await api.delete(`/seller/products/${id}`);
      await load();
    } finally { setBusy(false); }
  };

  const onPublishReq = async (id) => {
    try {
      setBusy(true);
      await api.patch(`/seller/products/${id}/publish`);
      await load();
    } finally { setBusy(false); }
  };

  return (
    <div className="max-w-6xl mx-auto p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">מוצרים שלי</h1>
        <button
          onClick={() => setEditing({})}
          className="rounded-2xl bg-gray-900 text-white px-4 py-2 text-sm"
        >מוצר חדש</button>
      </div>

      <div className="flex gap-2">
        <input
          placeholder="חיפוש..."
          value={q}
          onChange={e => { setPage(1); setQ(e.target.value); }}
          className="input max-w-sm"
        />
      </div>

      {msg && <div className="text-sm">{msg}</div>}
      {busy && <div className="h-10 animate-pulse bg-gray-100 rounded" />}

      <div className="overflow-auto border rounded-2xl">
        <table className="min-w-full text-right">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-3">כותרת</th>
              <th className="p-3">מחיר</th>
              <th className="p-3">מלאי</th>
              <th className="p-3">סטטוס</th>
              <th className="p-3">תמונות</th>
              <th className="p-3">פעולות</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(r => (
              <tr key={r._id} className="border-t">
                <td className="p-3">{r.title}</td>
                <td className="p-3">{r.price}</td>
                <td className="p-3">{r.stock}</td>
                <td className="p-3"><span className="bg-gray-100 text-xs px-2 py-1 rounded">{r.status}</span></td>
                <td className="p-3">
                  <button className="text-sm underline" onClick={() => setFocusImagesFor(r)}>ניהול תמונות</button>
                </td>
                <td className="p-3 space-x-reverse space-x-2">
                  <button className="rounded-xl px-3 py-1 text-sm border" onClick={() => setEditing(r)}>עריכה</button>
                  <button className="rounded-xl px-3 py-1 text-sm border" onClick={() => onPublishReq(r._id)}>בקשת פרסום</button>
                  <button className="rounded-xl px-3 py-1 text-sm border text-red-600" onClick={() => onDelete(r._id)}>מחיקה</button>
                </td>
              </tr>
            ))}
            {rows.length === 0 && !busy && (
              <tr><td colSpan={6} className="p-6 text-center text-gray-500">אין מוצרים</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex justify-center gap-2">
        <button className="px-3 py-1 border rounded" disabled={page===1} onClick={() => setPage(p => Math.max(1, p-1))}>‹</button>
        <span className="text-sm px-2">עמוד {page}</span>
        <button className="px-3 py-1 border rounded" onClick={() => setPage(p => p+1)}>›</button>
      </div>

      {editing && (
        <div className="fixed inset-0 bg-black/40 grid place-items-center">
          <div className="bg-white rounded-2xl p-4 w-full max-w-2xl">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold">{editing?._id ? "עריכת מוצר" : "מוצר חדש"}</h3>
              <button onClick={() => setEditing(null)} className="text-sm">סגור ✕</button>
            </div>
            <ProductForm
              initial={editing?._id ? editing : null}
              onSaved={() => { setEditing(null); load(); }}
            />
          </div>
        </div>
      )}

      {focusImagesFor && (
        <div className="fixed inset-0 bg-black/40 grid place-items-center">
          <div className="bg-white rounded-2xl p-4 w-full max-w-3xl">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold">תמונות: {focusImagesFor.title}</h3>
              <button onClick={() => setFocusImagesFor(null)} className="text-sm">סגור ✕</button>
            </div>
            <ProductImages
              product={focusImagesFor}
              onUpdated={() => { setFocusImagesFor(null); load(); }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
