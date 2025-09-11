import { useFormContext } from "react-hook-form";

export default function PriceRuleSelector() {
  const { register, watch } = useFormContext();
  const value = watch("variationsConfig.priceRule") || "sum";

  return (
    <div className="rounded-xl border p-3">
      <label className="block font-semibold mb-2">חוק חישוב מחיר וריאציות</label>
      <div className="flex gap-6">
        <label className="inline-flex items-center gap-2">
          <input type="radio" value="sum" {...register("variationsConfig.priceRule")} checked={value === "sum"} />
          <span>מיזוג מחירים (סכום כל התוספות)</span>
        </label>
        <label className="inline-flex items-center gap-2">
          <input type="radio" value="max" {...register("variationsConfig.priceRule")} checked={value === "max"} />
          <span>בחר הגבוה מביניהם</span>
        </label>
      </div>
    </div>
  );
}
