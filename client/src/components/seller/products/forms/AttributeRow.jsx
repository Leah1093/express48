import { useFieldArray, useFormContext } from "react-hook-form";
import TermRow from "./TermRow";

export default function AttributeRow({ index, onRemove }) {
  const { register, control } = useFormContext();
  const base = `variationsConfig.attributes.${index}`;
  const { fields, append, remove } = useFieldArray({ control, name: `${base}.terms` });

  const addTerm = () => {
    append({
      id: crypto.randomUUID(),
      label: "",
      priceType: "none",
      price: undefined,
      images: [],
    });
  };

  return (
    <div className="rounded-lg border p-3 space-y-3">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
        <div>
          <label className="block text-sm font-medium mb-1">שם תכונה (slug באנגלית)</label>
          <input className="w-full rounded-md border p-2"
            placeholder="color / size / storage"
            {...register(`${base}.name`)} />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">שם תצוגה</label>
          <input className="w-full rounded-md border p-2"
            placeholder="צבע / מידה / אחסון"
            {...register(`${base}.displayName`)} />
        </div>
        <div className="flex items-end justify-between gap-2">
          <button type="button" onClick={addTerm} className="px-3 py-2 rounded-lg border">
            הוספת מונח
          </button>
          <button type="button" onClick={onRemove} className="px-3 py-2 rounded-lg border text-red-600">
            הסרת תכונה
          </button>
        </div>
      </div>

      <div className="space-y-2">
        {fields.map((t, tIdx) => (
          <TermRow key={t.id} attrIndex={index} index={tIdx} onRemove={() => remove(tIdx)} />
        ))}
        {!fields.length ? <p className="text-sm opacity-70">אין מונחים לתכונה זו.</p> : null}
      </div>
    </div>
  );
}
