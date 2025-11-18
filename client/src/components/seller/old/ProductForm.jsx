// pages/seller/components/ProductForm.jsx
import { useEffect, useState } from "react";
import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8080",
  withCredentials: true,
  timeout: 15000,
});

export default function ProductForm({ initial, onSaved }) {
  // שומרים מחרוזות כדי למנוע NaN
  const [form, setForm] = useState({
    title: "",
    description: "",
    price: "0",
    compareAtPrice: "",
    currency: "ILS",
    stock: "0",
    sku: "",
    barcode: "",
    categoryId: "",
  });
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  // מצב עריכה: טוענים פעם אחת לפי ה-id בלבד
  useEffect(() => {
    if (!initial?._id) return;
    (async () => {
      try {
        setBusy(true);
        setMsg("");
        const { data } = await api.get(`/seller/products/${initial._id}`);
        const p = data || {};
        setForm({
          title: String(p.title ?? ""),
          description: String(p.description ?? ""),
          price: p.price != null ? String(p.price) : "0",
          compareAtPrice: p.compareAtPrice != null ? String(p.compareAtPrice) : "",
          currency: String(p.currency ?? "ILS"),
          stock: p.stock != null ? String(p.stock) : "0",
          sku: String(p.sku ?? ""),
          barcode: String(p.barcode ?? ""),
          categoryId: String(p.categoryId ?? ""),
        });
      } catch (e) {
        setMsg(e?.response?.data?.message || "שגיאה בטעינת מוצר");
      } finally {
        setBusy(false);
      }
    })();
  }, [initial?._id]);

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const toNumberOr = (val, fallback = 0) => {
    if (val === "" || val == null) return fallback;
    const n = Number(val);
    return Number.isFinite(n) ? n : fallback;
    // מונע NaN בשמירה
  };

  const onSubmit = async (e) => {
    debugger
    e.preventDefault();
    try {
      setBusy(true);
      setMsg("");

      const payload = {
        title: form.title.trim(),
        description: form.description,
        price: toNumberOr(form.price, 0),
        stock: toNumberOr(form.stock, 0),
        compareAtPrice: form.compareAtPrice === "" ? undefined : toNumberOr(form.compareAtPrice, 0),
        currency: form.currency || "ILS",
        sku: form.sku.trim() || undefined,
        barcode: form.barcode.trim() || undefined,
        categoryId: form.categoryId.trim() || undefined,
      };

      if (initial?._id) {
        await api.put(`/seller/products/${initial._id}`, payload);
      } else {
        debugger
        await api.post(`/seller/products`, payload);
      }

      onSaved?.();
    } catch (e) {
      setMsg(e?.response?.data?.message || "שגיאה בשמירה");
    } finally {
      setBusy(false);
    }
  };

  const Input = (p) => <input {...p} className="input" />;

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <div className="grid gap-3 md:grid-cols-2">
        <label className="block space-y-1">
          <span className="text-xs">כותרת</span>
          <Input name="title" value={form.title} onChange={onChange} />
        </label>

        <label className="block space-y-1">
          <span className="text-xs">מחיר</span>
          <Input name="price" type="number" step="0.01" value={form.price} onChange={onChange} />
        </label>

        <label className="block space-y-1">
          <span className="text-xs">מחיר קודם (אופציונלי)</span>
          <Input
            name="compareAtPrice"
            type="number"
            step="0.01"
            value={form.compareAtPrice}
            onChange={onChange}
            placeholder="השאירי ריק אם אין"
          />
        </label>

        <label className="block space-y-1">
          <span className="text-xs">מלאי</span>
          <Input name="stock" type="number" value={form.stock} onChange={onChange} />
        </label>

        <label className="block space-y-1">
          <span className="text-xs">SKU</span>
          <Input name="sku" value={form.sku} onChange={onChange} />
        </label>

        <label className="block space-y-1">
          <span className="text-xs">ברקוד</span>
          <Input name="barcode" value={form.barcode} onChange={onChange} />
        </label>

        <label className="block space-y-1 md:col-span-2">
          <span className="text-xs">קטגוריה (אופציונלי)</span>
          <Input name="categoryId" value={form.categoryId} onChange={onChange} />
        </label>
      </div>

      <label className="block space-y-1">
        <span className="text-xs">תיאור</span>
        <textarea
          name="description"
          value={form.description}
          onChange={onChange}
          className="input min-h-[100px]"
        />
      </label>

      {msg && <div className="text-sm text-rose-600">{msg}</div>}

      <div className="flex justify-end gap-2">
        <button
          type="submit"
          disabled={busy}
          className="rounded-2xl bg-gray-900 text-white px-4 py-2 text-sm disabled:opacity-50"
        >
          {busy ? "שומר..." : initial?._id ? "שמירת שינויים" : "יצירת מוצר"}
        </button>
      </div>
    </form>
  );
}
