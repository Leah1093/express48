import { useFormContext } from "react-hook-form";
import { useEffect, useState } from "react";

export default function VariationEditModal({ index, initial, onClose }) {
  const { getValues, setValue } = useFormContext();
  const [local, setLocal] = useState(initial);

  useEffect(() => setLocal(initial), [initial]);

  const save = () => {
    // שמירה לתוך variations[index]
    const next = { ...local };
    // אם הוגדר מחיר ידני → נשמור גם price.amount וגם _manualOverride
    if (typeof next._manualOverride === "number" && !Number.isNaN(next._manualOverride)) {
      next.price = { ...(next.price || { currency: "ILS" }), amount: next._manualOverride };
    } else {
      // אין override → נשאיר price מחושב
      if (next.price && typeof next.price.amount === "number") {
        // ok
      } else {
        delete next.price;
      }
    }

    const all = getValues("variations") || [];
    all[index] = next;
    setValue("variations", all, { shouldDirty: true });
    onClose?.();
  };

  const setImage = (idx, val) => {
    const arr = [...(local.images || [])];
    arr[idx] = val;
    setLocal({ ...local, images: arr });
  };

  const addImage = () => setLocal({ ...local, images: [...(local.images || []), ""] });
  const removeImage = (i) => {
    const arr = [...(local.images || [])];
    arr.splice(i, 1);
    setLocal({ ...local, images: arr });
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="w-full max-w-2xl bg-white rounded-2xl border shadow-xl p-4 space-y-3" dir="rtl">
        <header className="flex items-center justify-between">
          <h4 className="font-semibold">עריכת וריאציה</h4>
          <button className="px-3 py-1.5 rounded-lg border" onClick={onClose}>סגור</button>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium mb-1">SKU</label>
            <input className="w-full rounded-md border p-2"
              value={local.sellerSku || ""}
              onChange={(e) => setLocal({ ...local, sellerSku: e.target.value })} />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">ברקוד (GTIN)</label>
            <input className="w-full rounded-md border p-2"
              value={local.gtin || ""}
              onChange={(e) => setLocal({ ...local, gtin: e.target.value })} />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">מלאי</label>
            <input type="number" className="w-full rounded-md border p-2"
              value={local.stock ?? 0}
              onChange={(e) => {
                const stock = Number(e.target.value || 0);
                setLocal({ ...local, stock, inStock: stock > 0 });
              }} />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">מחיר ידני (לא חובה)</label>
            <input type="number" step="0.01" className="w-full rounded-md border p-2"
              placeholder={`מחושב: ${(local._calculatedPrice ?? 0).toFixed(2)} ₪`}
              value={local._manualOverride ?? ""}
              onChange={(e) => {
                const val = e.target.value === "" ? undefined : Number(e.target.value);
                setLocal({ ...local, _manualOverride: val });
              }} />
          </div>
        </div>

        {/* תמונות הווריאציה */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-medium">תמונות הווריאציה</span>
            <button type="button" className="px-3 py-1.5 rounded-lg border" onClick={addImage}>הוספת תמונה</button>
          </div>
          {(local.images || []).length ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {local.images.map((src, i) => (
                <div key={i} className="flex items-center gap-2">
                  <input className="flex-1 rounded-md border p-2" placeholder="URL / FileID"
                    value={src || ""}
                    onChange={(e) => setImage(i, e.target.value)} />
                  <button type="button" className="px-3 py-1.5 rounded-lg border text-red-600" onClick={() => removeImage(i)}>
                    הסר
                  </button>
                </div>
              ))}
            </div>
          ) : <p className="text-sm opacity-70">אין תמונות – אפשר להוסיף למעלה.</p>}
        </div>

        <footer className="flex justify-end gap-2">
          <button className="px-4 py-2 rounded-xl border" onClick={onClose}>ביטול</button>
          <button className="px-4 py-2 rounded-xl border bg-blue-600 text-white" onClick={save}>שמירה</button>
        </footer>
      </div>
    </div>
  );
}
