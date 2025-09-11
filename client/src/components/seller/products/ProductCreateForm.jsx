// src/components/products/ProductCreateForm.jsx
import React, { useState } from "react";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCreateProductMutation } from "./productsApi";
// אם יש לך redux עם userSlice: 
// import { useSelector } from "react-redux";
// import { selectUser } from "../../redux/slices/userSelectors";

const priceSchema = z.object({
  currency: z.string().default("ILS"),
  amount: z.coerce.number().positive("מחיר חייב להיות גדול מאפס"),
});

const variationSchema = z.object({
  sku: z.string().optional(),
  attributes: z.object({
    color: z.string().optional(),
    size: z.string().optional(),
    storage: z.string().optional(),
  }),
  price: priceSchema,
  stock: z.coerce.number().int().min(0).default(0),
  images: z.array(z.string().url("URL תמונה לא תקין")).optional().default([]),
});

const deliverySchema = z.object({
  requiresDelivery: z.coerce.boolean().optional().default(false),
  cost: z.coerce.number().min(0).default(0),
  notes: z.string().optional().default(""),
});

const shippingSchema = z.object({
  dimensions: z.string().optional().default(""),
  weight: z.string().optional().default(""),
  from: z.string().optional().default("IL"),
});

const schema = z.object({
  // זיהוי לפי ספק/מוכר/חנות
  supplier: z.string().optional(),
  sellerId: z.string().optional(),
  storeId: z.string().optional(),

  // מידע כללי
  title: z.string().min(2, "שם מוצר קצר מדי"),
  titleEn: z.string().optional().default(""),
  description: z.string().optional().default(""),
  brand: z.string().optional().default(""),
  category: z.string().optional().default("אחר"),
  subCategory: z.string().optional().default(""),
  model: z.string().optional().default(""),
  gtin: z.string().optional().default(""),

  // מחיר ראשי
  price: priceSchema,
  originalPrice: z.coerce.number().optional(),

  // תמונות כלליות (מופרדות בפסיקים בשדה הטופס - נפרק למערך)
  imagesCsv: z.string().optional().default(""),

  // מלאי כללי
  stock: z.coerce.number().int().min(0).default(0),

  // וריאציות
  variations: z.array(variationSchema).optional().default([]),

  // נראות/סטטוס
  status: z.enum(["טיוטא", "מפורסם", "מושהה"]).default("טיוטא"),
  visibility: z.enum(["public", "private", "restricted"]).default("public"),
  scheduledAt: z.string().optional(),
  visibleUntil: z.string().optional(),

  // אחריות ושילוח/הובלה
  warranty: z.string().optional().default("12 חודשים אחריות יבואן רשמי"),
  shipping: shippingSchema,
  delivery: deliverySchema,

  // סקירה כללית
  overviewText: z.string().optional().default(""),
  overviewImagesCsv: z.string().optional().default(""),
  overviewVideosCsv: z.string().optional().default(""),

  // הנחה (רשות – אם שולחים, חייבים עקביות)
  discountType: z.enum(["percent", "fixed"]).optional(),
  discountValue: z.coerce.number().optional(),
  discountExpiresAt: z.string().optional(),
});

export default function ProductCreateForm({
  defaultSupplier,
  defaultSellerId,
  defaultStoreId,
}) {
  // const user = useSelector(selectUser);
  const [createProduct, { isLoading }] = useCreateProductMutation();
  const [serverError, setServerError] = useState("");

  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
    watch,
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      supplier: defaultSupplier || "",
      sellerId: defaultSellerId || "",
      storeId: defaultStoreId || "",
      title: "",
      titleEn: "",
      description: "",
      brand: "",
      category: "אחר",
      subCategory: "",
      model: "",
      gtin: "",
      price: { currency: "ILS", amount: 0 },
      originalPrice: undefined,
      imagesCsv: "",
      stock: 0,
      variations: [],
      status: "טיוטא",
      visibility: "public",
      scheduledAt: "",
      visibleUntil: "",
      warranty: "12 חודשים אחריות יבואן רשמי",
      shipping: { dimensions: "", weight: "", from: "IL" },
      delivery: { requiresDelivery: false, cost: 0, notes: "" },
      overviewText: "",
      overviewImagesCsv: "",
      overviewVideosCsv: "",
      discountType: undefined,
      discountValue: undefined,
      discountExpiresAt: "",
    },
    mode: "onSubmit",
  });

  const {
    fields: variationFields,
    append: addVariation,
    remove: removeVariation,
  } = useFieldArray({ control, name: "variations" });

  const onSubmit = async (values) => {
    setServerError("");

    // המרה מ־CSV למערכי תמונות/וידאו
    const images = (values.imagesCsv || "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    const overviewImages = (values.overviewImagesCsv || "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    const overviewVideos = (values.overviewVideosCsv || "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    // בניית payload לפי המודל שלך (שדות SEO/slug נוצרים אוטומטית בשרת)
    const payload = {
      supplier: values.supplier || undefined,
      sellerId: values.sellerId || undefined,
      storeId: values.storeId || undefined,

      title: values.title,
      titleEn: values.titleEn || undefined,
      description: values.description || "",
      brand: values.brand || "",
      category: values.category || "אחר",
      subCategory: values.subCategory || "",
      model: values.model || "",
      gtin: values.gtin || "",

      price: {
        currency: values.price.currency || "ILS",
        amount: Number(values.price.amount || 0),
      },
      originalPrice:
        values.originalPrice !== undefined && values.originalPrice !== null
          ? Number(values.originalPrice)
          : undefined,

      images,
      stock: Number(values.stock || 0),

      variations:
        values.variations?.map((v) => ({
          sku: v.sku || undefined,
          attributes: {
            color: v.attributes?.color || undefined,
            size: v.attributes?.size || undefined,
            storage: v.attributes?.storage || undefined,
          },
          price: {
            currency: v.price?.currency || "ILS",
            amount: Number(v.price?.amount || 0),
          },
          stock: Number(v.stock || 0),
          images: v.images?.filter(Boolean) || [],
        })) || [],

      status: values.status,
      visibility: values.visibility,
      scheduledAt: values.scheduledAt ? new Date(values.scheduledAt) : undefined,
      visibleUntil: values.visibleUntil ? new Date(values.visibleUntil) : undefined,

      warranty: values.warranty || "12 חודשים אחריות יבואן רשמי",
      shipping: {
        dimensions: values.shipping?.dimensions || "",
        weight: values.shipping?.weight || "",
        from: values.shipping?.from || "IL",
      },
      delivery: {
        requiresDelivery: !!values.delivery?.requiresDelivery,
        cost: Number(values.delivery?.cost || 0),
        notes: values.delivery?.notes || "",
      },

      overview: {
        text: values.overviewText || "",
        images: overviewImages,
        videos: overviewVideos,
      },

      // הנחות - נשלח רק אם הוגדרו
      ...(values.discountType &&
        values.discountValue !== undefined && {
          discount: {
            discountType: values.discountType,
            discountValue: Number(values.discountValue),
            expiresAt: values.discountExpiresAt
              ? new Date(values.discountExpiresAt)
              : undefined,
          },
        }),
    };

    try {
      await createProduct(payload).unwrap();
      reset(); // איפוס טופס
      alert("המוצר נשמר בהצלחה");
    } catch (e) {
      setServerError(e?.data?.error || e?.error || "שמירה נכשלה");
    }
  };

  return (
    <div dir="rtl" className="max-w-5xl mx-auto p-6 bg-white rounded-2xl shadow">
      <h1 className="text-2xl font-bold mb-4">הוספת מוצר</h1>

      {serverError && (
        <div className="mb-4 rounded-lg border border-red-300 bg-red-50 p-3 text-red-700">
          {serverError}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* זיהוי */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block mb-1">ספק</label>
            <input className="input" {...register("supplier")} placeholder="למשל HAMILTON" />
            {errors.supplier && <p className="err">{errors.supplier.message}</p>}
          </div>
          <div>
            <label className="block mb-1">מזהה מוכר</label>
            <input className="input" {...register("sellerId")} placeholder="seller-123" />
          </div>
          <div>
            <label className="block mb-1">מזהה חנות</label>
            <input className="input" {...register("storeId")} placeholder="EXPRESS48" />
          </div>
        </div>

        {/* מידע כללי */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block mb-1">שם מוצר (עברית) *</label>
            <input className="input" {...register("title")} placeholder="טלפון XYZ 128GB" />
            {errors.title && <p className="err">{errors.title.message}</p>}
          </div>
          <div>
            <label className="block mb-1">שם מוצר (אנגלית)</label>
            <input className="input" {...register("titleEn")} placeholder="Phone XYZ 128GB" />
          </div>
          <div>
            <label className="block mb-1">מותג</label>
            <input className="input" {...register("brand")} placeholder="SAMSUNG / APPLE" />
          </div>
          <div>
            <label className="block mb-1">דגם</label>
            <input className="input" {...register("model")} placeholder="SM-A556" />
          </div>
          <div>
            <label className="block mb-1">קטגוריה</label>
            <input className="input" {...register("category")} placeholder="טלפונים" />
          </div>
          <div>
            <label className="block mb-1">תת קטגוריה</label>
            <input className="input" {...register("subCategory")} placeholder="סמארטפונים" />
          </div>
          <div>
            <label className="block mb-1">ברקוד GTIN</label>
            <input className="input" {...register("gtin")} placeholder="880609xxxxxxx" />
          </div>
          <div className="md:col-span-2">
            <label className="block mb-1">תיאור</label>
            <textarea className="input min-h-28" {...register("description")} placeholder="תיאור מלא..." />
          </div>
        </div>

        {/* מחיר ותמונות */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block mb-1">מחיר (₪) *</label>
            <input className="input" type="number" step="0.01" {...register("price.amount")} placeholder="0" />
            {errors.price?.amount && <p className="err">{errors.price.amount.message}</p>}
          </div>
          <div>
            <label className="block mb-1">מטבע</label>
            <input className="input" {...register("price.currency")} placeholder="ILS" />
          </div>
          <div>
            <label className="block mb-1">מחיר קודם (להצגת מבצע)</label>
            <input className="input" type="number" step="0.01" {...register("originalPrice")} placeholder="למשל 1999" />
          </div>
          <div className="md:col-span-3">
            <label className="block mb-1">תמונות מוצר (CSV)</label>
            <input className="input" {...register("imagesCsv")} placeholder="https://a.jpg, https://b.jpg" />
          </div>
        </div>

        {/* מלאי ונראות */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block mb-1">מלאי כללי</label>
            <input className="input" type="number" {...register("stock")} placeholder="0" />
          </div>
          <div>
            <label className="block mb-1">סטטוס</label>
            <select className="input" {...register("status")}>
              <option>טיוטא</option>
              <option>מפורסם</option>
              <option>מושהה</option>
            </select>
          </div>
          <div>
            <label className="block mb-1">נראות</label>
            <select className="input" {...register("visibility")}>
              <option value="public">public</option>
              <option value="private">private</option>
              <option value="restricted">restricted</option>
            </select>
          </div>
          <div>
            <label className="block mb-1">תזמון פרסום (אופציונלי)</label>
            <input className="input" type="datetime-local" {...register("scheduledAt")} />
          </div>
          <div>
            <label className="block mb-1">סיום הצגה (אופציונלי)</label>
            <input className="input" type="datetime-local" {...register("visibleUntil")} />
          </div>
        </div>

        {/* משלוח/הובלה ואחריות */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block mb-1">מידות אריזה</label>
            <input className="input" {...register("shipping.dimensions")} placeholder='למשל "100x50x30cm"' />
          </div>
          <div>
            <label className="block mb-1">משקל</label>
            <input className="input" {...register("shipping.weight")} placeholder="למשל 1.2kg" />
          </div>
          <div>
            <label className="block mb-1">מדינת מקור</label>
            <input className="input" {...register("shipping.from")} placeholder="IL" />
          </div>
          <div>
            <label className="block mb-1">אחריות</label>
            <input className="input" {...register("warranty")} placeholder="12 חודשים אחריות יבואן רשמי" />
          </div>
          <div className="md:col-span-2">
            <label className="inline-flex items-center gap-2">
              <input type="checkbox" {...register("delivery.requiresDelivery")} />
              דורש הובלה מיוחדת
            </label>
          </div>
          <div>
            <label className="block mb-1">עלות הובלה</label>
            <input className="input" type="number" step="0.01" {...register("delivery.cost")} placeholder="0" />
          </div>
          <div className="md:col-span-2">
            <label className="block mb-1">הערות הובלה</label>
            <input className="input" {...register("delivery.notes")} placeholder='למשל "כולל התקנה"' />
          </div>
        </div>

        {/* סקירה כללית */}
        <div className="grid grid-cols-1 gap-4">
          <div>
            <label className="block mb-1">סקירה - טקסט</label>
            <textarea className="input min-h-24" {...register("overviewText")} placeholder="סקירה/ Highlights" />
          </div>
          <div>
            <label className="block mb-1">סקירה - תמונות (CSV)</label>
            <input className="input" {...register("overviewImagesCsv")} placeholder="https://x.jpg, https://y.jpg" />
          </div>
          <div>
            <label className="block mb-1">סקירה - וידאו (CSV)</label>
            <input className="input" {...register("overviewVideosCsv")} placeholder="https://youtu.be/..., https://vimeo.com/..." />
          </div>
        </div>

        {/* הנחה */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block mb-1">סוג הנחה</label>
            <select className="input" {...register("discountType")}>
              <option value="">ללא</option>
              <option value="percent">percent</option>
              <option value="fixed">fixed</option>
            </select>
          </div>
          <div>
            <label className="block mb-1">ערך הנחה</label>
            <input className="input" type="number" step="0.01" {...register("discountValue")} placeholder="למשל 10 או 100" />
          </div>
          <div>
            <label className="block mb-1">תפוגת הנחה</label>
            <input className="input" type="datetime-local" {...register("discountExpiresAt")} />
          </div>
        </div>

        {/* וריאציות דינמיות */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">וריאציות</h2>
            <button
              type="button"
              className="px-3 py-2 rounded-xl border shadow hover:bg-gray-50"
              onClick={() =>
                addVariation({
                  sku: "",
                  attributes: { color: "", size: "", storage: "" },
                  price: { currency: "ILS", amount: 0 },
                  stock: 0,
                  images: [],
                })
              }
            >
              הוסף וריאציה
            </button>
          </div>

          {variationFields.length === 0 && (
            <p className="text-sm opacity-70">אין וריאציות כרגע. אפשר להוסיף לפי הצורך.</p>
          )}

          {variationFields.map((field, idx) => (
            <div key={field.id} className="rounded-2xl border p-4 grid grid-cols-1 md:grid-cols-6 gap-3">
              <div className="md:col-span-2">
                <label className="block mb-1">SKU וריאציה</label>
                <input className="input" {...register(`variations.${idx}.sku`)} placeholder="לא חובה - יווצר SKU כללי" />
              </div>
              <div>
                <label className="block mb-1">צבע</label>
                <input className="input" {...register(`variations.${idx}.attributes.color`)} placeholder="Black" />
              </div>
              <div>
                <label className="block mb-1">מידה</label>
                <input className="input" {...register(`variations.${idx}.attributes.size`)} placeholder="XL / 43 / 6.7”" />
              </div>
              <div>
                <label className="block mb-1">אחסון</label>
                <input className="input" {...register(`variations.${idx}.attributes.storage`)} placeholder="128GB" />
              </div>
              <div>
                <label className="block mb-1">מחיר וריאציה</label>
                <input className="input" type="number" step="0.01" {...register(`variations.${idx}.price.amount`)} placeholder="0" />
                {errors.variations?.[idx]?.price?.amount && (
                  <p className="err">{errors.variations[idx].price.amount.message}</p>
                )}
              </div>
              <div>
                <label className="block mb-1">מטבע</label>
                <input className="input" {...register(`variations.${idx}.price.currency`)} placeholder="ILS" />
              </div>
              <div>
                <label className="block mb-1">מלאי וריאציה</label>
                <input className="input" type="number" {...register(`variations.${idx}.stock`)} placeholder="0" />
              </div>
              <div className="md:col-span-3">
                <label className="block mb-1">תמונות וריאציה (CSV)</label>
                <Controller
                  control={control}
                  name={`variations.${idx}.images`}
                  render={({ field: { value, onChange } }) => (
                    <input
                      className="input"
                      placeholder="https://a.jpg, https://b.jpg"
                      value={(value || []).join(", ")}
                      onChange={(e) =>
                        onChange(
                          e.target.value
                            .split(",")
                            .map((s) => s.trim())
                            .filter(Boolean)
                        )
                      }
                    />
                  )}
                />
              </div>

              <div className="md:col-span-6 flex justify-end">
                <button
                  type="button"
                  className="px-3 py-2 rounded-xl border border-red-300 text-red-700 hover:bg-red-50"
                  onClick={() => removeVariation(idx)}
                >
                  מחק וריאציה
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* כפתורי שמירה */}
        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={isSubmitting || isLoading}
            className="px-5 py-3 rounded-2xl bg-[#0E3556] text-white shadow hover:opacity-90 disabled:opacity-50"
          >
            {isSubmitting || isLoading ? "שומר..." : "שמור מוצר"}
          </button>
          <button
            type="button"
            className="px-5 py-3 rounded-2xl border shadow hover:bg-gray-50"
            onClick={() => reset()}
          >
            איפוס טופס
          </button>
        </div>
      </form>

      {/* עזרי עיצוב קלים */}
      <style>{`
        .input { width: 100%; border: 1px solid #e5e7eb; padding: 10px 12px; border-radius: 12px; outline: none; }
        .input:focus { border-color: #0E3556; box-shadow: 0 0 0 3px rgba(14,53,86,0.08); }
        .err { color: #b91c1c; font-size: 0.85rem; margin-top: 4px; }
      `}</style>
    </div>
  );
}
