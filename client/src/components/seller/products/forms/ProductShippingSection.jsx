import { useFormContext } from "react-hook-form";

export default function ProductShippingSection() {
  const {
    register,
    watch,
    formState: { errors },
  } = useFormContext();

  const requiresDelivery = watch("delivery.requiresDelivery");

  const Error = ({ name }) =>
    errors?.[name]?.message ? (
      <p className="text-red-600 text-xs mt-1">{errors[name].message}</p>
    ) : null;

  return (
    <section dir="rtl" className="bg-white rounded-2xl p-4 border shadow-sm">
      <h2 className="text-lg font-semibold mb-3">משלוח והובלה</h2>

      {/* משלוח */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* משקל KG - במודל הוא מחרוזת */}
        <div className="col-span-1">
          <label className="block text-sm font-medium mb-1">משקל בק״ג</label>
          <input
            type="text"
            inputMode="decimal"
            placeholder="לדוגמה 3.5"
            {...register("shipping.weight")}
            className="w-full rounded-xl border p-2"
          />
          <Error name="shipping?.weight" />
        </div>

        {/* אורך */}
        <div className="col-span-1">
          <label className="block text-sm font-medium mb-1">אורך בס״מ</label>
          <input
            type="number"
            step="1"
            min="0"
            {...register("shipping.dimensions.length", { valueAsNumber: true })}
            className="w-full rounded-xl border p-2"
          />
          <Error name="shipping?.dimensions?.length" />
        </div>

        {/* רוחב */}
        <div className="col-span-1">
          <label className="block text-sm font-medium mb-1">רוחב בס״מ</label>
          <input
            type="number"
            step="1"
            min="0"
            {...register("shipping.dimensions.width", { valueAsNumber: true })}
            className="w-full rounded-xl border p-2"
          />
          <Error name="shipping?.dimensions?.width" />
        </div>

        {/* גובה */}
        <div className="col-span-1">
          <label className="block text-sm font-medium mb-1">גובה בס״מ</label>
          <input
            type="number"
            step="1"
            min="0"
            {...register("shipping.dimensions.height", { valueAsNumber: true })}
            className="w-full rounded-xl border p-2"
          />
          <Error name="shipping?.dimensions?.height" />
        </div>

        {/* מדינת מקור */}
        <div className="col-span-1 md:col-span-2">
          <label className="block text-sm font-medium mb-1">מדינת מקור</label>
          <select
            {...register("shipping.from")}
            className="w-full rounded-xl border p-2 bg-white"
          >
            {/* דיפולט IL */}
            <option value="IL">ישראל - IL</option>
            <option value="CN">סין - CN</option>
            <option value="US">ארה״ב - US</option>
            <option value="DE">גרמניה - DE</option>
            <option value="TR">טורקיה - TR</option>
            {/* הוסיפי עוד לפי צורך */}
          </select>
          <Error name="shipping?.from" />
        </div>
      </div>

      <hr className="my-4" />

      {/* הובלה מיוחדת */}
      <div className="space-y-3">
        <label className="inline-flex items-center gap-2">
          <input
            type="checkbox"
            {...register("delivery.requiresDelivery")}
            className="size-4"
          />
          <span className="text-sm font-medium">דורש הובלה מיוחדת</span>
        </label>

        {requiresDelivery && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">מחיר הובלה</label>
              <input
                type="number"
                step="0.5"
                min="0"
                {...register("delivery.cost", { valueAsNumber: true })}
                className="w-full rounded-xl border p-2"
              />
              <Error name="delivery?.cost" />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">הערות</label>
              <input
                type="text"
                placeholder="לדוגמה: כולל התקנה, זמן תיאום 3 ימי עסקים"
                {...register("delivery.notes")}
                className="w-full rounded-xl border p-2"
              />
              <Error name="delivery?.notes" />
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
