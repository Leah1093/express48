// src/components/product/forms/ProductVisibilitySection.jsx
import { useEffect } from "react";
import { useFormContext } from "react-hook-form";

export default function ProductVisibilitySection() {
  const {
    register,
    watch,
    setValue,
    formState: { errors },
  } = useFormContext();

  const visibility = watch("visibility");
  const scheduledAt = watch("scheduledAt");
  const visibleUntil = watch("visibleUntil");

  // אם visibility private/restricted ובלי scheduledAt - לא עושים כלום, אם public אפשר לתזמן
  useEffect(() => {
    // אופציונלי: כאשר visibility חוזר ל-public, לאפס תאריכים אם היו
    // setValue("scheduledAt", "", { shouldDirty: true });
    // setValue("visibleUntil", "", { shouldDirty: true });
  }, [visibility, setValue]);

  const Error = ({ err }) =>
    err ? <p className="text-red-600 text-xs mt-1">{err.message}</p> : null;

  return (
    <section dir="rtl" className="bg-white rounded-2xl p-4 border shadow-sm">
      <h2 className="text-lg font-semibold mb-3">נראות ותזמון</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* נראות */}
        <div>
          <label className="block text-sm font-medium mb-1">נראות</label>
          <select
            {...register("visibility")}
            className="w-full rounded-xl border p-2 bg-white"
          >
            <option value="public">ציבורי</option>
            <option value="private">פרטי</option>
            <option value="restricted">מוגבל</option>
          </select>
          <Error err={errors?.visibility} />
          <p className="text-xs text-gray-500 mt-1">
            ציבורי - כל המשתמשים | פרטי - לא מופיע באתר | מוגבל - לפי תנאים/תפקידים.
          </p>
        </div>

        {/* מועד התחלת הצגה */}
        <div>
          <label className="block text-sm font-medium mb-1">מועד התחלת הצגה</label>
          <input
            type="datetime-local"
            {...register("scheduledAt")}
            className="w-full rounded-xl border p-2"
          />
          <Error err={errors?.scheduledAt} />
        </div>

        {/* מועד סיום הצגה */}
        <div>
          <label className="block text-sm font-medium mb-1">מועד סיום הצגה</label>
          <input
            type="datetime-local"
            {...register("visibleUntil")}
            className="w-full rounded-xl border p-2"
          />
          <Error err={errors?.visibleUntil} />
          <p className="text-xs text-gray-500 mt-1">השאירי ריק כדי ללא מגבלה.</p>
        </div>
      </div>

      {/* חיווי קצר */}
      <div className="mt-4 text-sm text-gray-700">
        <span className="font-medium">סטטוס:</span>{" "}
        {visibility === "public"
          ? "מוצר ציבורי"
          : visibility === "private"
          ? "מוצר פרטי - לא יוצג באתר"
          : "מוצר מוגבל - חשוף לקבוצות/תנאים מוגדרים"}
        {scheduledAt ? ` | מתחיל ב־${scheduledAt}` : ""}
        {visibleUntil ? ` | מסתיים ב־${visibleUntil}` : ""}
      </div>
    </section>
  );
}
