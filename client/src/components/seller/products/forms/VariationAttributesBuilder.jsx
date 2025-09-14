import { useFieldArray, useFormContext } from "react-hook-form";
import AttributeRow from "./AttributeRow";

export default function VariationAttributesBuilder() {
  const { control } = useFormContext();
  const { fields, append, remove } = useFieldArray({
    control,
    name: "variationsConfig.attributes",
  });

  const addAttribute = () => {
    append({
      name: "",
      displayName: "",
      terms: [],
    });
  };

  return (
    <div className="rounded-xl border p-3 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">תכונות ומונחים</h3>
        <button type="button" className="px-3 py-1.5 rounded-lg border" onClick={addAttribute}>
          הוספת תכונה
        </button>
      </div>

      <div className="space-y-3">
        {fields.map((f, idx) => (
          <AttributeRow key={f.id} index={idx} onRemove={() => remove(idx)} />
        ))}
        {!fields.length ? <p className="text-sm opacity-70">עדיין אין תכונות - הוסיפי תכונה ראשונה.</p> : null}
      </div>
    </div>
  );
}
