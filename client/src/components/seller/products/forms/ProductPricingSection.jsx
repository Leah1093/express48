// src/components/product/forms/ProductPricingSection.jsx
import { useEffect, useMemo } from "react";
import { useFormContext } from "react-hook-form";

export default function ProductPricingSection() {
  const {
    register,
    watch,
    setValue,
    formState: { errors },
  } = useFormContext();

  const amount = watch("price.amount");
  const currency = watch("currency");
  const discountType = watch("discount.discountType"); // "percent" | "fixed" | "" (אין הנחה)
  const discountValue = watch("discount.discountValue");
  const startsAt = watch("discount.startsAt");
  const expiresAt = watch("discount.expiresAt");

  // ברירת מחדל ל-startsAt: עכשיו (אם לא מוגדר)
  useEffect(() => {
    if (!startsAt) {
      const now = new Date();
      // תבנית YYYY-MM-DDTHH:mm להתאמה ל-input type="datetime-local"
      const pad = (n) => String(n).padStart(2, "0");
      const local = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}T${pad(now.getHours())}:${pad(now.getMinutes())}`;
      setValue("discount.startsAt", local, { shouldDirty: true });
    }
  }, [startsAt, setValue]);

  const discounted = useMemo(() => {
    const base = Number(amount || 0);
    const val = Number(discountValue || 0);
    if (!discountType) return { final: base, saved: 0 };

    if (discountType === "percent") {
      const saved = (base * Math.min(Math.max(val, 0), 100)) / 100;
      return { final: Math.max(base - saved, 0), saved };
    }
    // fixed
    const saved = Math.max(val, 0);
    return { final: Math.max(base - saved, 0), saved: Math.min(saved, base) };
  }, [amount, discountType, discountValue]);

  const Error = ({ err }) =>
    err ? <p className="text-red-600 text-xs mt-1">{err.message}</p> : null;

  return (
    <section dir="rtl" className="bg-white rounded-2xl p-4 border shadow-sm">
      <h2 className="text-lg font-semibold mb-3">מחירון</h2>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* מחיר סכום */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium mb-1">מחיר</label>
          <input
            type="number"
            min="0"
            step="0.1"
            {...register("price.amount", { valueAsNumber: true })}
            className="w-full rounded-xl border p-2"
            placeholder="לדוגמה 199.90"
          />
          <Error err={errors?.price?.amount} />
        </div>

        {/* מטבע */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium mb-1">מטבע</label>
          <select
            {...register("currency")}
            className="w-full rounded-xl border p-2 bg-white"
          >
            <option value="ILS">₪ ILS - שקל חדש</option>
            <option value="USD">$ USD - דולר</option>
            <option value="EUR">€ EUR - אירו</option>
            <option value="GBP">£ GBP - ליש״ט</option>
          </select>
          <Error err={errors?.currency} />
        </div>
      </div>

      <hr className="my-4" />

      {/* הנחה */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">סוג הנחה</label>
          <select
            {...register("discount.discountType")}
            className="w-full rounded-xl border p-2 bg-white"
          >
            <option value="">ללא</option>
            <option value="percent">אחוז</option>
            <option value="fixed">כסף</option>
          </select>
          <Error err={errors?.discount?.discountType} />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            ערך ההנחה {discountType === "percent" ? "(%)" : discountType === "fixed" ? `(${currency || "ILS"})` : ""}
          </label>
          <input
            type="number"
            step={discountType === "percent" ? "1" : "0.1"}
            min="0"
            {...register("discount.discountValue", { valueAsNumber: true })}
            className="w-full rounded-xl border p-2"
            disabled={!discountType}
            placeholder={discountType === "percent" ? "לדוגמה 10" : "לדוגמה 20"}
          />
          <Error err={errors?.discount?.discountValue} />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">מתחיל בתוקף</label>
          <input
            type="datetime-local"
            {...register("discount.startsAt")}
            className="w-full rounded-xl border p-2"
            disabled={!discountType}
          />
          <Error err={errors?.discount?.startsAt} />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">תאריך תפוגה</label>
          <input
            type="datetime-local"
            {...register("discount.expiresAt")}
            className="w-full rounded-xl border p-2"
            disabled={!discountType}
          />
          <Error err={errors?.discount?.expiresAt} />
        </div>
      </div>

      {/* חיווי מחיר לאחר הנחה */}
      <div className="mt-4">
        <div className="inline-flex items-center gap-3 rounded-xl border px-3 py-2 bg-gray-50">
          <span className="text-sm">מחיר סופי:</span>
          <span className="font-semibold">
            {discounted.final.toFixed(2)} {currency || "ILS"}
          </span>
          {discounted.saved > 0 && (
            <span className="text-xs opacity-70">
              (חסכון: {discounted.saved.toFixed(2)} {currency || "ILS"})
            </span>
          )}
        </div>
      </div>
    </section>
  );
}
