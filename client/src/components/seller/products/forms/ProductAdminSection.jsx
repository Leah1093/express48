import { useFormContext } from "react-hook-form";

export default function ProductAdminSection() {
  const { register, formState:{ errors } } = useFormContext();
  const Err = ({e}) => e ? <p className="text-red-600 text-xs mt-1">{e.message}</p> : null;

  return (
    <section dir="rtl" className="bg-white rounded-2xl p-4 border shadow-sm">
      <h2 className="text-lg font-semibold mb-3">נתונים ניהוליים</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* סטטוס פנימי */}
        <div>
          <label className="block text-sm font-medium mb-1">סטטוס</label>
          <select className="w-full rounded-xl border p-2" {...register("status")}>
            <option value="טיוטא">טיוטא</option>
            <option value="מפורסם">מפורסם</option>
            <option value="מושהה">מושהה</option>
          </select>
          <Err e={errors?.status} />
        </div>

        {/* SKU פנימי - בד״כ readOnly אם נוצר אוטומטית
        <div>
          <label className="block text-sm font-medium mb-1">SKU פנימי</label>
          <input className="w-full rounded-xl border p-2 bg-gray-50" {...register("sku")} readOnly placeholder="נוצר אוטומטית" />
          <Err e={errors?.sku} />
        </div> */}

        {/* sellerSku - המק"ט שהמוכר מזין */}
        <div>
          <label className="block text-sm font-medium mb-1">מק״ט מוכר (Sku)</label>
          <input className="w-full rounded-xl border p-2" {...register("sellerSku")} placeholder="מק״ט פנימי של המוכר/ספק" />
          <Err e={errors?.sellerSku} />
        </div>

        {/* model - דגם יצרן */}
        <div>
          <label className="block text-sm font-medium mb-1">דגם יצרן</label>
          <input className="w-full rounded-xl border p-2" {...register("model")} placeholder="לדוגמה: WH-1000XM5" />
          <Err e={errors?.model} />
        </div>

        {/* supplier */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium mb-1">ספק</label>
          <input className="w-full rounded-xl border p-2" {...register("supplier")} placeholder="מזהה/שם ספק" />
          <Err e={errors?.supplier} />
        </div>
      </div>

      <p className="text-xs text-gray-500 mt-2">
        * שדה <b>sku</b> מנוהל על ידכם אוטומטית. <b>sellerSku</b> הוא המק״ט שהמוכר מספק.
      </p>
    </section>
  );
}
