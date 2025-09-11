// components/store/settings/forms/StoreAppearanceForm.jsx
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { appearanceSchema, buildDefaultValues } from "../schemas/storeSchemas.js";

const Section = ({ title, children }) => (
  <section className="bg-white p-4 rounded-xl shadow space-y-3">
    <h3 className="font-bold text-lg">{title}</h3>
    {children}
  </section>
);

export default function StoreAppearanceForm({ initial, submitting, onSubmit }) {
  const { register, handleSubmit } = useForm({
    resolver: zodResolver(appearanceSchema),
    defaultValues: buildDefaultValues(initial).appearance,
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Section title="הגדרת נראות חנות">
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <div className="text-sm mb-1">מיקום שם חנות</div>
            <select className="border rounded p-2 w-full" {...register("storeNamePosition")}>
              <option value="header">כותרת עליונה</option>
              <option value="over-banner">מעל באנר</option>
              <option value="hidden">מוסתר</option>
            </select>
          </div>

          <div>
            <div className="text-sm mb-1">מוצרים לעמוד</div>
            <input type="number" className="border rounded p-2 w-full" {...register("productsPerPage", { valueAsNumber: true })} />
          </div>

          <label className="flex items-center gap-2">
            <input type="checkbox" className="h-5 w-5" {...register("hideEmail")} />
            <span>הסתר אימייל</span>
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" className="h-5 w-5" {...register("hidePhone")} />
            <span>הסתר טלפון</span>
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" className="h-5 w-5" {...register("hideAddress")} />
            <span>הסתר כתובת</span>
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" className="h-5 w-5" {...register("hideAbout")} />
            <span>הסתר אודות</span>
          </label>
        </div>
      </Section>

      <div className="flex justify-end">
        <button type="submit" disabled={submitting} className="bg-blue-900 text-white px-4 py-2 rounded hover:bg-blue-800 disabled:opacity-60">
          {submitting ? "שומר…" : "שמירת נראות"}
        </button>
      </div>
    </form>
  );
}
