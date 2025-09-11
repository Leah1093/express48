import { useFormContext } from "react-hook-form";

export default function ProductGeneralSection() {
  const { register, formState:{ errors } } = useFormContext();
  const Err = ({e}) => e ? <p className="text-red-600 text-xs mt-1">{e.message}</p> : null;

  return (
    <section dir="rtl" className="bg-white rounded-2xl p-4 border shadow-sm">
      <h2 className="text-lg font-semibold mb-3">מידע כללי</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">שם מוצר (עברית)</label>
          <input className="w-full rounded-xl border p-2" {...register("title")} placeholder="לדוגמה: אוזניות בלוטות׳" />
          <Err e={errors?.title} />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">שם מוצר (EN)</label>
          <input className="w-full rounded-xl border p-2" {...register("titleEn")} placeholder="Example: Wireless Headphones" />
          <Err e={errors?.titleEn} />
           <p className="text-xs text-gray-500 mt-1">חשוב עבור Slug בעל משמעות</p>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">מותג</label>
          <input className="w-full rounded-xl border p-2" {...register("brand")} placeholder="לדוגמה: Sony" />
          <Err e={errors?.brand} />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">קטגוריה</label>
          <input className="w-full rounded-xl border p-2" {...register("category")} placeholder="לדוגמה: סאונד" />
          <Err e={errors?.category} />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">קטגוריית משנה</label>
          <input className="w-full rounded-xl border p-2" {...register("subCategory")} placeholder="לדוגמה: אוזניות" />
          <Err e={errors?.subCategory} />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">אחריות</label>
          <input className="w-full rounded-xl border p-2" {...register("warranty")} placeholder="12 חודשים אחריות יבואן רשמי" />
          <Err e={errors?.warranty} />
        </div>
      </div>
    </section>
  );
}
