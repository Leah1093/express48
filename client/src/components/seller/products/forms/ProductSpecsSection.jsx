import { useFieldArray, useFormContext } from "react-hook-form";

export default function ProductSpecsSection() {
  const { control, register } = useFormContext();
  const { fields, append, remove } = useFieldArray({ control, name: "specsPairs" });
  // הערה: בצד שרת יש Map. בצד לקוח ננהל כזוגות [{key:'', value:''}] ונמיר במשלוח לבקאנד למפה.

  return (
    <section dir="rtl" className="bg-white rounded-2xl p-4 border shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-semibold">מפרט טכני</h2>
        <button type="button" onClick={() => append({ key: "", value: "" })}
          className="px-3 py-1 rounded-lg border hover:bg-gray-50 text-sm">
          הוסף מאפיין
        </button>
      </div>

      <div className="space-y-2">
        {fields.map((f, i) => (
          <div key={f.id} className="grid grid-cols-1 md:grid-cols-12 gap-2">
            <input className="md:col-span-5 rounded-xl border p-2"
              placeholder="שם מאפיין (לדוגמה: סוג סוללה)"
              {...register(`specsPairs.${i}.key`)} />
            <input className="md:col-span-6 rounded-xl border p-2"
              placeholder="ערך (לדוגמה: Li-ion 500mAh)"
              {...register(`specsPairs.${i}.value`)} />
            <button type="button" onClick={() => remove(i)}
              className="md:col-span-1 px-2 rounded-lg border hover:bg-gray-50">✖</button>
          </div>
        ))}
      </div>

      <p className="text-xs text-gray-500 mt-2">
        * בהגשת הטופס המירו את specsPairs לאובייקט Map בצד השרת או בבקשה ל־API.
      </p>
    </section>
  );
}
