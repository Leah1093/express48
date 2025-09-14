// pages/seller/components/ProductImages.jsx
import { useEffect, useRef, useState } from "react";
import axios from "axios";

export default function ProductImages({ product, onUpdated }) {
  const api = axios.create({
    baseURL: "http://localhost:8080",
    withCredentials: true,
    timeout: 20000,
  });

  const [doc, setDoc] = useState(product);
  const [busy, setBusy] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => { setDoc(product); }, [product]);

  const upload = async () => {
    const files = inputRef.current?.files;
    if (!files || !files.length) return;
    try {
      setBusy(true);
      const fd = new FormData();
      for (const f of files) fd.append("images", f);
      const { data } = await api.post(`/seller/products/${doc._id}/images`, fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setDoc(data);
    } finally { setBusy(false); }
  };

  const setPrimary = async (key) => {
    try {
      setBusy(true);
      const { data } = await api.patch(`/seller/products/${doc._id}/images/${key}/primary`);
      setDoc(data);
    } finally { setBusy(false); }
  };

  const removeImage = async (key) => {
    if (!confirm("למחוק תמונה?")) return;
    try {
      setBusy(true);
      const { data } = await api.delete(`/seller/products/${doc._id}/images/${key}`);
      setDoc(data);
    } finally { setBusy(false); }
  };

  const saveOrder = async () => {
    try {
      setBusy(true);
      const order = (doc.images || []).map(i => i.key); // שמירה לפי המצב הנוכחי
      const { data } = await api.patch(`/seller/products/${doc._id}/images/order`, { order });
      setDoc(data);
    } finally { setBusy(false); }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <input ref={inputRef} type="file" multiple accept="image/*" />
        <button onClick={upload} disabled={busy} className="rounded-xl border px-3 py-1 text-sm">העלה</button>
        <button onClick={() => onUpdated?.()} className="rounded-xl border px-3 py-1 text-sm">סגור</button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {(doc.images || []).map(img => (
          <div key={img.key} className="border rounded-xl overflow-hidden">
            <img src={img.thumbUrl || img.url} alt={img.alt || ""} className="w-full h-32 object-cover" />
            <div className="p-2 flex justify-between items-center text-xs">
              <span className={`px-2 py-0.5 rounded ${img.isPrimary ? "bg-emerald-100" : "bg-gray-100"}`}>
                {img.isPrimary ? "ראשית" : "—"}
              </span>
              <div className="space-x-reverse space-x-2">
                {!img.isPrimary && (
                  <button className="underline" onClick={() => setPrimary(img.key)}>הפוך לראשית</button>
                )}
                <button className="text-rose-600 underline" onClick={() => removeImage(img.key)}>מחיקה</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-end">
        <button onClick={saveOrder} disabled={busy} className="rounded-xl border px-3 py-1 text-sm">שמירת סדר</button>
      </div>
    </div>
  );
}
