import { useEffect } from "react";
import { useFormContext } from "react-hook-form";

export default function ProductInventorySection() {
  const {
    register,
    watch,
    setValue,
    formState: { errors },
  } = useFormContext();

  const stock = watch("stock");
  const sku = watch("sku"); // מק״ט אם קיים במודל שלך

  // נגזרת אוטומטית: יש מלאי אם stock > 0
  useEffect(() => {
    const hasStock = Number(stock || 0) > 0;
    setValue("inStock", hasStock, { shouldValidate: true, shouldDirty: true });
  }, [stock, setValue]);

  const Error = ({ err }) =>
    err ? <p className="text-red-600 text-xs mt-1">{err.message}</p> : null;

  return (
    <section dir="rtl" className="bg-white rounded-2xl p-4 border shadow-sm">
      <h2 className="text-lg font-semibold mb-3">מלאי</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* מק״ט — קריאה בלבד אם מנוהל אוטומטית
        <div>
          <label className="block text-sm font-medium mb-1">מק״ט</label>
          <input
            type="text"
            {...register("sku")}
            readOnly
            className="w-full rounded-xl border p-2 bg-gray-50"
            placeholder="נוצר אוטומטית"
          />
          <Error err={errors?.sku} />
        </div> */}

        {/* מלאי כללי */}
        <div>
          <label className="block text-sm font-medium mb-1">מלאי כללי</label>
          <input
            type="number"
            min="0"
            step="1"
            {...register("stock", { valueAsNumber: true })}
            className="w-full rounded-xl border p-2"
            placeholder="לדוגמה 25"
          />
          <Error err={errors?.stock} />
        </div>

        {/* ברקוד GTIN */}
        <div>
          <label className="block text-sm font-medium mb-1">ברקוד GTIN</label>
          <input
            type="text"
            inputMode="numeric"
            placeholder="EAN/UPC/ISBN"
            {...register("gtin")}
            className="w-full rounded-xl border p-2"
          />
          <Error err={errors?.gtin} />
        </div>
      </div>

      {/* חיווי נגזר */}
      <div className="mt-4">
        <span className={`inline-flex items-center rounded-lg px-3 py-1 text-sm border
          ${Number(stock || 0) > 0 ? "bg-green-50 border-green-200" : "bg-amber-50 border-amber-200"}`}>
          {Number(stock || 0) > 0 ? "יש מלאי" : "אין מלאי"}
        </span>
      </div>

      {/* שדה מוסתר רק לשמירת הערך הנגזר אם את רוצה לשלוח אותו לבקנד */}
      <input type="hidden" {...register("inStock")} />
    </section>
  );
}
