import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { storeSlugSchema } from "../../validations/storeSchemas";

export default function StoreSlugForm({
  initial,            // { slug, slugChanged, isDraft }
  onSaveSlug,         // async (slug) => void
}) {
  const canChangeSlug = !!(initial?.isDraft && !initial?.slugChanged);

  const { register, handleSubmit, formState: { isSubmitting } } = useForm({
    resolver: zodResolver(storeSlugSchema),
    defaultValues: {
      slug: initial?.slug || "",
      slugChanged: !!initial?.slugChanged,
      isDraft: !!initial?.isDraft,
    },
  });

  const slugFieldProps = {
    ...register("slug"),
    readOnly: !canChangeSlug,
    className: `mt-1 block w-full rounded-md border-gray-300 shadow-sm ${!canChangeSlug ? "bg-slate-50 cursor-not-allowed" : ""}`,
    placeholder: "למשל: my-store-name",
  };

  return (
    <form
      onSubmit={handleSubmit(async (data) => {
        if (!canChangeSlug) return;
        await onSaveSlug?.(data.slug);
      })}
      className="space-y-4"
      noValidate
    >
      <section className="bg-white p-4 rounded-xl shadow space-y-3">
        <h3 className="font-bold text-lg">סלוג</h3>

        <div>
          <div className="text-sm mb-1">הסלוג הנוכחי</div>
          <input {...slugFieldProps} />
          {!canChangeSlug
            ? <div className="text-xs text-slate-500 mt-1">לא ניתן לשנות (כבר שונה פעם אחת או שהחנות אינה בטיוטה).</div>
            : <div className="text-xs text-slate-500 mt-1">ניתן לשנות פעם אחת בזמן טיוטה.</div>}
        </div>

        {canChangeSlug && (
          <div className="flex flex-wrap gap-2">
            <button type="submit" className="px-3 py-2 rounded bg-indigo-700 text-white hover:bg-indigo-600" disabled={isSubmitting}>
              {isSubmitting ? "שומר…" : "שמירת סלוג מותאם"}
            </button>
          </div>
        )}
      </section>
    </form>
  );
}
