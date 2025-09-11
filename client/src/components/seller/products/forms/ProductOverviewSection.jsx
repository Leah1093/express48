import { useFieldArray, useFormContext } from "react-hook-form";
// import RichTextEditorPro from "@/components/common/RichTextEditorPro";
import RichTextEditorPro from "./RichTextEditorPro";
export default function ProductOverviewSection() {
  const { control, register } = useFormContext();

  const imgs = useFieldArray({ control, name: "overview.images" });
  const vids = useFieldArray({ control, name: "overview.videos" });

  return (
    <section dir="rtl" className="bg-white rounded-2xl p-4 border shadow-sm">
      <h2 className="text-lg font-semibold mb-3">סקירה</h2>

      <RichTextEditorPro name="overview.text" label="סקירה - טקסט" />

      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* תמונות סקירה */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium">תמונות סקירה</h3>
            <button type="button" onClick={() => imgs.append("")}
              className="px-3 py-1 rounded-lg border hover:bg-gray-50 text-sm">הוסף תמונה</button>
          </div>
          <div className="space-y-2">
            {imgs.fields.map((f, i) => (
              <div key={f.id} className="flex gap-2">
                <input className="flex-1 rounded-xl border p-2"
                  placeholder="URL של תמונה"
                  {...register(`overview.images.${i}`)} />
                <button type="button" onClick={() => imgs.remove(i)}
                  className="px-2 rounded-lg border hover:bg-gray-50">✖</button>
              </div>
            ))}
          </div>
        </div>

        {/* סרטוני סקירה */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium">סרטוני סקירה</h3>
            <button type="button" onClick={() => vids.append("")}
              className="px-3 py-1 rounded-lg border hover:bg-gray-50 text-sm">הוסף וידאו</button>
          </div>
          <div className="space-y-2">
            {vids.fields.map((f, i) => (
              <div key={f.id} className="flex gap-2">
                <input className="flex-1 rounded-xl border p-2"
                  placeholder="קישור YouTube/Vimeo/MP4"
                  {...register(`overview.videos.${i}`)} />
                <button type="button" onClick={() => vids.remove(i)}
                  className="px-2 rounded-lg border hover:bg-gray-50">✖</button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
