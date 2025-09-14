import { useFieldArray, useFormContext } from "react-hook-form";

export default function ProductMediaSection() {
  const { control, register, watch, setValue } = useFormContext();
  const { fields, append, remove, swap } = useFieldArray({ control, name: "images" });

  const images = watch("images") || [];
  const primaryIndex = 0; // ניהול פשוט: התמונה הראשונה = ראשית

  return (
    <section dir="rtl" className="bg-white rounded-2xl p-4 border shadow-sm">
      <h2 className="text-lg font-semibold mb-3">מדיה</h2>

      {/* גלריית תמונות */}
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-medium">תמונות מוצר</h3>
        <button type="button" onClick={() => append("")}
          className="px-3 py-1 rounded-lg border hover:bg-gray-50 text-sm">הוסף תמונה</button>
      </div>

      <div className="space-y-2">
        {fields.map((f, i) => (
          <div key={f.id} className="grid grid-cols-1 md:grid-cols-12 gap-2 items-center">
            <input className="md:col-span-9 rounded-xl border p-2"
              placeholder="URL תמונה"
              {...register(`images.${i}`)} />
            <div className="md:col-span-3 flex gap-2">
              <button type="button" onClick={() => i>0 && swap(i, i-1)}
                className="px-2 rounded-lg border hover:bg-gray-50">▲</button>
              <button type="button" onClick={() => i<fields.length-1 && swap(i, i+1)}
                className="px-2 rounded-lg border hover:bg-gray-50">▼</button>
              <button type="button" onClick={() => remove(i)}
                className="px-2 rounded-lg border hover:bg-gray-50">✖</button>
            </div>
            {i === primaryIndex && images[i] && (
              <p className="md:col-span-12 text-xs text-green-700">* זו התמונה הראשית</p>
            )}
          </div>
        ))}
      </div>

      {/* וידאו */}
      <div className="mt-6">
        <label className="block text-sm font-medium mb-1">סרטון מוצר (URL)</label>
        <input className="w-full rounded-xl border p-2" placeholder="https://..."
          {...register("video")} />
        <p className="text-xs text-gray-500 mt-1">ניתן להשתמש ב־YouTube/Vimeo או קישור MP4 ישיר.</p>
      </div>
    </section>
  );
}
