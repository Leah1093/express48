// components/store/settings/forms/StoreGeneralForm.jsx
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import RichTextEditor from "../RichTextEditor.jsx";
import { generalFormSchema, buildDefaultValues } from "../storeSchemas.js";

const Section = ({ title, children }) => (
  <section className="bg-white p-4 rounded-xl shadow space-y-3">
    <h3 className="font-bold text-lg">{title}</h3>
    {children}
  </section>
);

export default function StoreGeneralForm({ initial, submitting, onSubmit }) {
  const { register, control, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(generalFormSchema),
    mode: "onSubmit",
    shouldFocusError: true,
    defaultValues: buildDefaultValues(initial),
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
      <div className={`p-2 rounded transition ${errors.name || errors.contactEmail ? "bg-red-50 text-red-700" : "invisible"}`}>
        יש להשלים שם חנות ואימייל תקין.
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Section title="פרטים כלליים">
          <div className="grid gap-4">
            <div>
              <div className="text-sm mb-1">שם החנות</div>
              <input className="border rounded p-2 w-full" autoComplete="organization" {...register("name")} />
              {errors.name?.message && <div className="text-xs text-red-600 mt-1">{errors.name.message}</div>}
            </div>

            <div>
              <div className="text-sm mb-1">אימייל החנות</div>
              <input type="email" autoComplete="email" className="border rounded p-2 w-full" {...register("contactEmail")} />
              {errors.contactEmail?.message && <div className="text-xs text-red-600 mt-1">{errors.contactEmail.message}</div>}
            </div>

            <div>
              <div className="text-sm mb-1">טלפון</div>
              <input autoComplete="tel" className="border rounded p-2 w-full" {...register("phone")} />
            </div>
          </div>
        </Section>

        <Section title="שירות לקוחות">
          <div className="grid gap-4">
            <div>
              <div className="text-sm mb-1">אימייל תמיכה</div>
              <input type="email" className="border rounded p-2 w-full" {...register("support.email")} />
            </div>
            <div>
              <div className="text-sm mb-1">טלפון תמיכה</div>
              <input className="border rounded p-2 w-full" {...register("support.phone")} />
            </div>
            <div>
              <div className="text-sm mb-1">WhatsApp</div>
              <input className="border rounded p-2 w-full" {...register("support.whatsapp")} />
            </div>
            <div>
              <div className="text-sm mb-1">שעות פעילות</div>
              <input placeholder="א-ה 09:00-17:00" className="border rounded p-2 w-full" {...register("support.hours")} />
            </div>
            <div>
              <div className="text-sm mb-1">הערה</div>
              <input className="border rounded p-2 w-full" {...register("support.note")} />
            </div>
          </div>
        </Section>
      </div>

      <Section title="תיאור החנות">
        <Controller
          control={control}
          name="description"
          render={({ field }) => (
            <RichTextEditor
              value={field.value}
              onChange={field.onChange}
              onAddMedia={() => {
                const url = window.prompt("הדבק URL של תמונה/וידאו:");
                if (!url) return;
                field.onChange(`${field.value || ""}\n<p><img src="${url}" alt="media" /></p>`);
              }}
            />
          )}
        />
      </Section>

      <Section title="הגדרת נראות חנות">
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <div className="text-sm mb-1">מיקום שם חנות</div>
            <select className="border rounded p-2 w-full" {...register("appearance.storeNamePosition")}>
              <option value="header">כותרת עליונה</option>
              <option value="over-banner">מעל באנר</option>
              <option value="hidden">מוסתר</option>
            </select>
          </div>

          <div>
            <div className="text-sm mb-1">מוצרים לעמוד</div>
            <input type="number" className="border rounded p-2 w-full" {...register("appearance.productsPerPage", { valueAsNumber: true })} />
          </div>

          <label className="flex items-center gap-2">
            <input type="checkbox" className="h-5 w-5" {...register("appearance.hideEmail")} />
            <span>הסתר אימייל</span>
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" className="h-5 w-5" {...register("appearance.hidePhone")} />
            <span>הסתר טלפון</span>
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" className="h-5 w-5" {...register("appearance.hideAddress")} />
            <span>הסתר כתובת</span>
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" className="h-5 w-5" {...register("appearance.hideAbout")} />
            <span>הסתר אודות</span>
          </label>
        </div>
      </Section>

      <Section title="מדיניות (לא חובה)">
        <div className="grid md:grid-cols-2 gap-6">
          <textarea className="border rounded p-2 w-full min-h-24" placeholder="אודות" {...register("policies.about")} />
          <textarea className="border rounded p-2 w-full min-h-24" placeholder="משלוחים" {...register("policies.shipping")} />
          <textarea className="border rounded p-2 w-full min-h-24" placeholder="החזרות" {...register("policies.returns")} />
          <textarea className="border rounded p-2 w-full min-h-24" placeholder="פרטיות" {...register("policies.privacy")} />
          <textarea className="border rounded p-2 w-full min-h-24" placeholder="תקנון" {...register("policies.terms")} />
        </div>
      </Section>

      <div className="flex justify-end">
        <button type="submit" disabled={submitting} className="bg-blue-900 text-white px-4 py-2 rounded hover:bg-blue-800 disabled:opacity-60">
          {submitting ? "שומר…" : "שמירת פרטים כלליים"}
        </button>
      </div>
    </form>
  );
}
