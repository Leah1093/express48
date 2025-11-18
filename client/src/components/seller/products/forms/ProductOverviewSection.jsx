import { useFieldArray, useFormContext, useWatch } from "react-hook-form";
import RichTextEditorPro from "./RichTextEditorPro";
import { useUploadOverviewImageMutation } from "../../../../redux/services/uploadApi";

/** תצוגה מקדימה קטנה לפי שם שדה */
function PreviewImageField({ name }) {
  const { control } = useFormContext();
  const url = useWatch({ control, name });

  if (!url) return null;

  return (
    <div className="w-16 h-16 rounded-lg overflow-hidden border bg-gray-100 flex items-center justify-center">
      <img src={url} alt="" className="w-full h-full object-cover" />
    </div>
  );
}

export default function ProductOverviewSection() {
  const { control, register, setValue } = useFormContext();

  const { fields, append, remove, move } = useFieldArray({
    control,
    name: "overview.blocks",
  });

  const [uploadOverviewImage, { isLoading: isUploading }] =
    useUploadOverviewImageMutation();

  const addBlock = (type) => {
    if (type === "text") {
      append({ type: "text", html: "" });
    } else if (type === "image") {
      append({ type: "image", url: "", alt: "", sourceType: "url" });
    } else if (type === "video") {
      append({ type: "video", videoUrl: "", provider: "youtube" });
    }
  };

  const handleUpload = async (index, file) => {
    try {
      const data = await uploadOverviewImage(file).unwrap();

      // url שחזר מהשרת
      setValue(`overview.blocks.${index}.url`, data.url, {
        shouldDirty: true,
        shouldTouch: true,
      });

      // אם בשרת החזרת גם publicId
      if (data.publicId) {
        setValue(`overview.blocks.${index}.publicId`, data.publicId, {
          shouldDirty: true,
          shouldTouch: true,
        });
      }

      setValue(`overview.blocks.${index}.sourceType`, "upload", {
        shouldDirty: true,
        shouldTouch: true,
      });
    } catch (err) {
      console.error("uploadOverviewImage error RAW:", err)
       if (err?.data?.code === "LIMIT_FILE_SIZE") {
      alert(err.data.error || "הקובץ גדול מדי (מוגבל ל-5MB)");
    } else {
      alert(err?.data?.error || "שגיאה בהעלאת התמונה, בדקי קונסול.");
    }
    }
  };

  return (
    <section dir="rtl" className="bg-white rounded-2xl p-4 border shadow-sm">
      {/* כותרת + כפתורי הוספה */}
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-semibold">סקירה</h2>

        <div className="flex gap-2 text-sm">
          <button
            type="button"
            onClick={() => addBlock("text")}
            className="px-3 py-1 rounded-lg border hover:bg-gray-50"
          >
            + טקסט
          </button>
          <button
            type="button"
            onClick={() => addBlock("image")}
            className="px-3 py-1 rounded-lg border hover:bg-gray-50"
          >
            + תמונה
          </button>
          <button
            type="button"
            onClick={() => addBlock("video")}
            className="px-3 py-1 rounded-lg border hover:bg-gray-50"
          >
            + וידאו
          </button>
        </div>
      </div>

      {fields.length === 0 && (
        <p className="text-sm text-gray-500">
          עדיין אין סקירה. אפשר להוסיף בלוק טקסט / תמונה / וידאו.
        </p>
      )}

      <div className="space-y-4">
        {fields.map((field, index) => {
          const type = field.type;

          return (
            <div
              key={field.id}
              className="border rounded-xl p-3 bg-gray-50/70 space-y-3"
            >
              {/* שורת כותרת לבלוק */}
              <div className="flex items-center justify-between mb-2 text-xs text-gray-600">
                <span>
                  בלוק #{index + 1} ·{" "}
                  {type === "text"
                    ? "טקסט"
                    : type === "image"
                    ? "תמונה"
                    : "וידאו"}
                </span>

                <div className="flex gap-2">
                  {index > 0 && (
                    <button
                      type="button"
                      className="px-2 py-1 rounded border hover:bg-gray-100"
                      onClick={() => move(index, index - 1)}
                    >
                      למעלה
                    </button>
                  )}
                  {index < fields.length - 1 && (
                    <button
                      type="button"
                      className="px-2 py-1 rounded border hover:bg-gray-100"
                      onClick={() => move(index, index + 1)}
                    >
                      למטה
                    </button>
                  )}
                  <button
                    type="button"
                    className="px-2 py-1 rounded border border-red-300 text-red-700 hover:bg-red-50"
                    onClick={() => remove(index)}
                  >
                    מחק
                  </button>
                </div>
              </div>

              {/* תוכן הבלוק */}
              {type === "text" && (
                <RichTextEditorPro
                  name={`overview.blocks.${index}.html`}
                  label="טקסט סקירה"
                />
              )}

              {type === "image" && (
                <div className="space-y-2">
                  <label className="block text-sm font-medium">תמונה</label>

                  {/* URL ידני */}
                  <input
                    className="w-full rounded-xl border p-2 text-sm"
                    placeholder="https://example.com/image.jpg"
                    {...register(`overview.blocks.${index}.url`)}
                  />

                  {/* העלאה מהמחשב */}
                  <div className="flex items-center gap-3">
                    <input
                      type="file"
                      accept="image/*"
                      className="text-sm"
                      disabled={isUploading}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleUpload(index, file);
                      }}
                    />

                    <PreviewImageField
                      name={`overview.blocks.${index}.url`}
                    />
                  </div>

                  {/* alt */}
                  <input
                    className="w-full rounded-xl border p-2 text-sm"
                    placeholder="טקסט אלטרנטיבי (alt)"
                    {...register(`overview.blocks.${index}.alt`)}
                  />
                </div>
              )}

              {type === "video" && (
                <div className="space-y-2">
                  <label className="block text-sm font-medium">
                    כתובת וידאו (YouTube / MP4)
                  </label>
                  <input
                    className="w-full rounded-xl border p-2 text-sm"
                    placeholder="https://youtube.com/..."
                    {...register(`overview.blocks.${index}.videoUrl`)}
                  />
                  <input
                    type="hidden"
                    value="youtube"
                    {...register(`overview.blocks.${index}.provider`)}
                  />
                </div>
              )}

              {/* type נסתר כדי שישמר */}
              <input
                type="hidden"
                {...register(`overview.blocks.${index}.type`)}
              />
            </div>
          );
        })}
      </div>
    </section>
  );
}
