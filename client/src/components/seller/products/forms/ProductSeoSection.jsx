// src/components/product/forms/ProductSeoSection.jsx
import { useFormContext } from "react-hook-form";
import { useMemo } from "react";

export default function ProductSeoSection() {
  const {
    register,
    watch,
    formState: { errors },
  } = useFormContext();

  const metaTitle = watch("metaTitle") || "";
  const metaDescription = watch("metaDescription") || "";
  const title = watch("title") || "";         // לכיתוב תצוגה מקדימה
        // לקריאה בלבד אם מגיע מהשרת
  const site = "express48.co.il";             // שימי את הדומיין שלך

  const Error = ({ err }) =>
    err ? <p className="text-red-600 text-xs mt-1">{err.message}</p> : null;

  const previewTitle = useMemo(() => {
    return metaTitle.trim() || title.trim() || "כותרת המוצר";
  }, [metaTitle, title]);

  const previewDescription = useMemo(() => {
    return metaDescription.trim() || "תיאור קצר של המוצר יופיע כאן.";
  }, [metaDescription]);

  return (
    <section dir="rtl" className="bg-white rounded-2xl p-4 border shadow-sm">
      <h2 className="text-lg font-semibold mb-3">SEO</h2>

   

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* metaTitle */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Meta Title
            <span className="text-xs text-gray-500 mr-2">({metaTitle.length}/60)</span>
          </label>
          <input
            type="text"
            maxLength={60}
            placeholder="כותרת קצרה וממוקדת"
            {...register("metaTitle")}
            className="w-full rounded-xl border p-2"
          />
          <Error err={errors?.metaTitle} />
          <p className="text-xs text-gray-500 mt-1">מומלץ עד 50-60 תווים.</p>
        </div>

        {/* metaDescription */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Meta Description
            <span className="text-xs text-gray-500 mr-2">({metaDescription.length}/160)</span>
          </label>
          <textarea
            rows={3}
            maxLength={160}
            placeholder="תיאור קצר ברור ומשכנע שיופיע בגוגל"
            {...register("metaDescription")}
            className="w-full rounded-xl border p-2 resize-y"
          />
          <Error err={errors?.metaDescription} />
          <p className="text-xs text-gray-500 mt-1">מומלץ 120-160 תווים.</p>
        </div>
      </div>

      {/* תצוגה מקדימה בסגנון גוגל */}
      <div className="mt-6">
        <p className="text-sm font-medium mb-2">תצוגה מקדימה</p>
        <div className="rounded-xl border p-4 bg-gray-50">
          <p className="text-[#1a0dab] text-lg leading-6">{previewTitle}</p>
          <p className="text-gray-800 text-sm">{previewDescription}</p>
        </div>
      </div>
    </section>
  );
}
