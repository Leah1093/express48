import { useFieldArray, useFormContext } from "react-hook-form";
import { useUploadOverviewImageMutation } from "../../../../redux/services/uploadApi";

export default function ProductMediaSection() {
  const { control, register, watch, setValue } = useFormContext();

  const { fields, append, remove, swap } = useFieldArray({
    control,
    name: "images",
  });

  const images = watch("images") || [];
  const primaryIndex = 0; // התמונה הראשונה = ראשית

  // משתמשים ב-hook הקיים שלך
  const [uploadOverviewImage, { isLoading: isUploading }] =
    useUploadOverviewImageMutation();

  const handleUpload = async (index, file) => {
    if (!file) return;

    try {
      const result = await uploadOverviewImage(file).unwrap();
      // מצפה לתשובה מהשרת בסגנון: { url, publicId, ... }
      if (result?.url) {
        setValue(`images.${index}`, result.url, {
          shouldDirty: true,
          shouldTouch: true,
        });
      }
    } catch (err) {
      console.error("uploadOverviewImage error RAW:", err);
      alert("שגיאה בהעלאת התמונה. נסי שוב או בחרי קובץ קטן יותר.");
    }
  };

  return (
    <section dir="rtl" className="bg-white rounded-2xl p-4 border shadow-sm">
      <h2 className="text-lg font-semibold mb-3">מדיה</h2>

      {/* גלריית תמונות */}
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-medium">תמונות מוצר</h3>
        <button
          type="button"
          onClick={() => append("")}
          className="px-3 py-1 rounded-lg border hover:bg-gray-50 text-sm"
        >
          הוסף תמונה
        </button>
      </div>

      <div className="space-y-3">
        {fields.map((f, i) => {
          const url = images[i];

          return (
            <div
              key={f.id}
              className="grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_auto] gap-3 items-start border rounded-xl p-3"
            >
              {/* צד שמאל – שדה URL + העלאה + פריוויו */}
              <div className="space-y-2">
                <input
                  className="w-full rounded-xl border p-2 text-sm"
                  placeholder="URL תמונה"
                  {...register(`images.${i}`)}
                />

                <div className="flex flex-wrap items-center gap-3">
                  {/* העלאה מהמחשב */}
                  <label className="text-xs">
                    <span className="inline-block mb-1">או העלאת קובץ:</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="block text-xs"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        await handleUpload(i, file);
                        e.target.value = ""; // כדי שאפשר יהיה לבחור שוב אותו קובץ
                      }}
                    />
                  </label>

                  {/* מצב טעינה */}
                  {isUploading && (
                    <span className="text-xs text-gray-500">מעלה...</span>
                  )}

                  {/* תצוגה מקדימה קטנה */}
                  {url ? (
                    <div className="w-16 h-16 rounded-md border overflow-hidden bg-gray-100">
                      <img
                        src={url}
                        alt={`preview-${i}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : null}
                </div>

                {i === primaryIndex && url && (
                  <p className="text-xs text-green-700">* זו התמונה הראשית</p>
                )}
              </div>

              {/* צד ימין – כפתורי סדר / מחיקה */}
              <div className="flex md:flex-col gap-2 justify-center">
                <button
                  type="button"
                  onClick={() => i > 0 && swap(i, i - 1)}
                  className="px-2 py-1 rounded-lg border hover:bg-gray-50 text-xs"
                  disabled={i === 0}
                >
                  ▲
                </button>
                <button
                  type="button"
                  onClick={() =>
                    i < fields.length - 1 && swap(i, i + 1)
                  }
                  className="px-2 py-1 rounded-lg border hover:bg-gray-50 text-xs"
                  disabled={i === fields.length - 1}
                >
                  ▼
                </button>
                <button
                  type="button"
                  onClick={() => remove(i)}
                  className="px-2 py-1 rounded-lg border hover:bg-red-50 text-xs text-red-600"
                >
                  ✖
                </button>
              </div>
            </div>
          );
        })}

        {fields.length === 0 && (
          <p className="text-sm text-gray-500">
            עדיין אין תמונות. אפשר להוסיף תמונה ולעלות קובץ מהמחשב.
          </p>
        )}
      </div>

      {/* וידאו */}
      <div className="mt-6">
        <label className="block text-sm font-medium mb-1">
          סרטון מוצר (URL)
        </label>
        <input
          className="w-full rounded-xl border p-2 text-sm"
          placeholder="https://..."
          {...register("video")}
        />
        <p className="text-xs text-gray-500 mt-1">
          ניתן להשתמש ב־YouTube/Vimeo או קישור MP4 ישיר.
        </p>
      </div>
    </section>
  );
}
