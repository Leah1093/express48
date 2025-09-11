// components/store/settings/forms/StoreSlugForm.jsx
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { slugFormSchema, buildDefaultValues } from "../storeSchemas.js";

const Section = ({ title, children }) => (
  <section className="bg-white p-4 rounded-xl shadow space-y-3">
    <h3 className="font-bold text-lg">{title}</h3>
    {children}
  </section>
);

export default function StoreSlugForm({ initial, submitting, onSaveSlug, isDraft, onCustomSlug }) {
  const canChangeSlug = !!(isDraft && !initial?.slugChanged);

  const { register, handleSubmit, getValues } = useForm({
    resolver: zodResolver(slugFormSchema),
    mode: "onSubmit",
    defaultValues: buildDefaultValues(initial),
  });

  const slugFieldProps = {
    ...register("slug"),
    readOnly: !canChangeSlug,
    className: `mt-1 block w-full rounded-md border-gray-300 shadow-sm ${!canChangeSlug ? "bg-slate-50 cursor-not-allowed" : ""}`,
    placeholder: "למשל: my-store-name",
  };

  return (
    <form onSubmit={handleSubmit(onSaveSlug)} className="space-y-6" noValidate>
      <Section title="סלוג">
        <div className="grid gap-3">
          <div>
            <div className="text-sm mb-1">הסלוג הנוכחי</div>
            <input {...slugFieldProps} />
            {!canChangeSlug ? (
              <div className="text-xs text-slate-500 mt-1">
                לא ניתן לשנות (כבר שונה פעם אחת או שהחנות אינה בטיוטה).
              </div>
            ) : (
              <div className="text-xs text-slate-500 mt-1">
                ניתן לשנות פעם אחת בזמן טיוטה.
              </div>
            )}
          </div>

          {canChangeSlug && (
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                className="px-3 py-2 rounded bg-indigo-700 text-white hover:bg-indigo-600"
                onClick={() => onCustomSlug?.(getValues("slug"))}
              >
                שמירת סלוג מותאם
              </button>
            </div>
          )}
        </div>
      </Section>

      <div className="flex justify-end">
        <button type="submit" disabled={submitting} className="bg-gray-800 text-white px-4 py-2 rounded hover:bg-gray-700 disabled:opacity-60">
          {submitting ? "שומר…" : "עדכון סלוג"}
        </button>
      </div>
    </form>
  );
}
