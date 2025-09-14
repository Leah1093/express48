// src/components/product/forms/TermRow.jsx
import { useFormContext, useFieldArray } from "react-hook-form";
import { useEffect } from "react";

export default function TermRow({ attrIndex, index, onRemove }) {
  const { register, watch, control, setValue } = useFormContext();
  const base = `variationsConfig.attributes.${attrIndex}.terms.${index}`;
  const priceType = watch(`${base}.priceType`) || "none";

  const imagesField = useFieldArray({ control, name: `${base}.images` });

  // אין השפעת מחיר → לנקות price כדי לא להשאיר NaN
  useEffect(() => {
    if (priceType === "none") {
      setValue(`${base}.price`, undefined, { shouldDirty: true, shouldValidate: false });
    }
  }, [priceType, base, setValue]);

  const addImage = () => imagesField.append("");
  const removeImage = (i) => imagesField.remove(i);

  return (
    <div className="rounded-lg border p-2">
      <div className="grid grid-cols-1 md:grid-cols-5 gap-2 items-end">
        <div className="md:col-span-2">
          <label className="block text-sm font-medium mb-1">מונח</label>
          <input className="w-full rounded-md border p-2" placeholder="ורוד / L / 256GB"
                 {...register(`${base}.label`)} />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">השפעת מחיר</label>
          <select className="w-full rounded-md border p-2" {...register(`${base}.priceType`)}>
            <option value="none">ללא תוספת תשלום</option>
            <option value="addon">תוספת תשלום</option>
            <option value="override">מחיר שונה</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">מחיר</label>
          <input
            type="number"
            step="0.01"
            disabled={priceType === "none"}
            className="w-full rounded-md border p-2 disabled:bg-gray-100"
            placeholder={priceType === "override" ? "מחיר סופי" : "תוספת למחיר"}
            {...register(`${base}.price`, {
              setValueAs: (v) => (v === "" ? undefined : Number(v)),
            })}
          />
        </div>

        <div className="flex gap-2 justify-end">
          <button type="button" onClick={addImage} className="px-3 py-2 rounded-lg border">
            תמונה למונח
          </button>
          <button type="button" onClick={onRemove} className="px-3 py-2 rounded-lg border text-red-600">
            הסר מונח
          </button>
        </div>
      </div>

      {imagesField.fields.length ? (
        <div className="mt-2 grid grid-cols-1 md:grid-cols-3 gap-2">
          {imagesField.fields.map((f, i) => (
            <div key={f.id} className="flex items-center gap-2">
              <input className="flex-1 rounded-md border p-2" placeholder="URL / FileID"
                     {...register(`${base}.images.${i}`)} />
              <button type="button" onClick={() => removeImage(i)} className="px-3 py-2 rounded-lg border text-red-600">
                הסר
              </button>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
