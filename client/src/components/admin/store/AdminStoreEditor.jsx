// src/admin/AdminStoreEditor.jsx
import { useEffect, useMemo, useState } from "react";
import {
  useGetAdminStoreByIdQuery,
  useUpdateAdminStoreStatusMutation,
  useUpdateAdminStoreSlugMutation,
} from "../redux/services/adminApi"; // עדכני נתיב לפי הפרויקט שלך

const STATUS_OPTS = [
  { value: "draft",     label: "טיוטה" },
  { value: "active",    label: "פעילה" },
  { value: "suspended", label: "מושהית" },
];

export default function AdminStoreEditor({ storeId }) {
  const { data: store, isLoading, isError } = useGetAdminStoreByIdQuery(
    storeId,
    { refetchOnMountOrArgChange: true }
  );

  const [updateStatus, { isLoading: isUpdatingStatus }] = useUpdateAdminStoreStatusMutation();
  const [updateSlug,   { isLoading: isUpdatingSlug   }] = useUpdateAdminStoreSlugMutation();

  const [status, setStatus] = useState(undefined);
  const [note,   setNote]   = useState("");
  const [slug,   setSlug]   = useState(undefined);

  useEffect(() => {
    setStatus(undefined);
    setSlug(undefined);
    setNote("");
  }, [storeId]);

  useEffect(() => {
    if (store) {
      setStatus((prev) => prev ?? (store.status || "draft"));
      setSlug((prev)   => prev ?? (store.slug   || ""));
    }
  }, [store]);

  const effectiveStatus = status ?? "draft";
  const effectiveSlug   = slug   ?? "";

  const normalizeSlug = (val) =>
    String(val || "")
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, "-")
      .replace(/-{2,}/g, "-")
      .replace(/^-+|-+$/g, "");

  const normalizedSlug = normalizeSlug(effectiveSlug);

  const isStatusDirty = store ? (effectiveStatus !== (store.status || "draft")) : false;
  const isSlugDirty   = store ? (normalizedSlug   !== (store.slug   || ""))     : false;

  const badge = useMemo(() => {
    const st = String(store?.status || "").toLowerCase();
    if (st === "active")    return { class: "bg-green-100 text-green-800", text: "פעילה" };
    if (st === "suspended") return { class: "bg-red-100 text-red-800",   text: "מושהית" };
    return { class: "bg-yellow-100 text-yellow-800", text: "טיוטה" };
  }, [store]);

  async function doUpdateStatus() {
    try {
      await updateStatus({ id: storeId, status: effectiveStatus, note }).unwrap();
      setNote("");
      alert("סטטוס עודכן");
    } catch (e) {
      alert(e?.data?.message || e?.error || "עדכון סטטוס נכשל");
      console.error(e);
    }
  }

  async function doUpdateSlug() {
    try {
      await updateSlug({ id: storeId, slug: normalizedSlug }).unwrap();
      setSlug(normalizedSlug);
      alert("סלוג עודכן");
    } catch (e) {
      alert(e?.data?.message || e?.error || "עדכון סלוג נכשל");
      console.error(e);
    }
  }

  if (isLoading)         return <div className="p-6">טוען…</div>;
  if (isError || !store) return <div className="p-6">לא נמצאה חנות</div>;

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{store.name || "חנות ללא שם"}</h1>
          <div className="text-sm text-slate-500">{store._id}</div>
        </div>
        <span className={`px-2 py-1 text-xs rounded ${badge.class}`}>{badge.text}</span>
      </header>

      {/* סלוג */}
      <section className="bg-white p-4 rounded-xl shadow space-y-3">
        <h2 className="font-semibold">סלוג</h2>
        <div className="grid gap-2">
          <label className="text-sm">סלוג נוכחי</label>
          <input
            className="border rounded p-2 w-full"
            value={effectiveSlug}
            onChange={(e) => setSlug(e.target.value)}
            placeholder="english-only, kebab-case"
            dir="ltr"
          />
          <div className="text-xs text-slate-500">
            סלוג באנגלית/ספרות ומקפים בלבד. לדוגמה: <code>my-awesome-store</code>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={doUpdateSlug}
              disabled={isUpdatingSlug || !isSlugDirty}
              className="px-3 py-2 rounded bg-indigo-700 text-white hover:bg-indigo-600 disabled:opacity-60"
            >
              {isUpdatingSlug ? "שומר…" : "שמירת סלוג"}
            </button>
          </div>
        </div>
      </section>

      {/* סטטוס */}
      <section className="bg-white p-4 rounded-xl shadow space-y-3">
        <h2 className="font-semibold">סטטוס</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <div className="text-sm mb-1">בחרי סטטוס</div>
            <select
              className="border rounded p-2 w-full"
              value={effectiveStatus}
              onChange={(e) => setStatus(e.target.value)}
            >
              {STATUS_OPTS.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
          <div>
            <div className="text-sm mb-1">הערה (אופציונלי)</div>
            <textarea
              className="border rounded p-2 w-full"
              rows={3}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="סיבה לשינוי/מידע לצוות"
            />
          </div>
        </div>
        <div className="flex gap-2 justify-end">
          <button
            type="button"
            onClick={doUpdateStatus}
            disabled={isUpdatingStatus || !isStatusDirty}
            className="px-3 py-2 rounded bg-slate-900 text-white hover:bg-slate-800 disabled:opacity-60"
          >
            {isUpdatingStatus ? "מעדכן…" : "עדכון סטטוס"}
          </button>
        </div>
      </section>

      {/* מידע מהיר */}
      <section className="bg-white p-4 rounded-xl shadow">
        <div className="grid md:grid-cols-2 gap-3 text-sm">
          <div><span className="text-slate-500">אימייל:</span> {store.contactEmail || "-"}</div>
          <div><span className="text-slate-500">טלפון:</span> {store.phone || "-"}</div>
          <div><span className="text-slate-500">Slug:</span> {store.slug || "-"}</div>
          <div><span className="text-slate-500">Slug Changed:</span> {String(store.slugChanged ?? false)}</div>
        </div>
      </section>
    </div>
  );
}
