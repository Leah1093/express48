// import { useForm } from "react-hook-form";
// import { z } from "zod";
// import { zodResolver } from "@hookform/resolvers/zod";
// import axios from "axios";
// import { useState } from "react";

// // === סכימה ===
// const productSchema = z.object({
//     // חובה
//     title: z.string().min(2, "שם מוצר קצר מדי"),
//     price: z.object({
//         amount: z.number({ required_error: "מחיר חובה" })
//             .positive("מחיר חייב להיות חיובי"),
//     }),

//     // אופציונלי
//     description: z.string().optional(),
//     brand: z.string().optional(),
//     model: z.string().optional(),
//     category: z.string().optional(),
//     subCategory: z.string().optional(),
//     stock: z.number().int().min(0).optional(),
//     warranty: z.string().optional(),
//     images: z.array(z.string().url("כתובת לא תקינה")).optional(),
//     specs: z.record(z.string()).optional(),
// });

// export default function ProductCreateForm() {
//     const [loading, setLoading] = useState(false);

//     const {
//         register,
//         handleSubmit,
//         setValue,
//         formState: { errors },
//     } = useForm({
//         resolver: zodResolver(productSchema),
//         defaultValues: {
//             title: "",
//             price: { amount: "" },
//             description: "",
//             brand: "",
//             model: "",
//             category: "",
//             subCategory: "",
//             stock: 0,
//             warranty: "",
//             images: [],
//             specs: {},
//         },
//     });

//     const onSubmit = async (data) => {
//         try {
//             const res = await axios.post("https://api.express48.com/seller/products", data, {
//                 withCredentials: true,
//             });


//             alert(res);
//             alert("המוצר נשלח בהצלחה!");
//         } catch (err) {
//             alert(err.response?.data?.error || "שגיאה בהעלאת");
//         } finally {
//             setLoading(false);
//         }
//     };

//     return (
//         <form
//             onSubmit={handleSubmit(onSubmit)}
//             className="space-y-4 max-w-xl mx-auto p-4 bg-white rounded-xl shadow"
//             dir="rtl"
//         >
//             {/* חובה */}
//             <div>
//                 <label className="block font-semibold">שם מוצר *</label>
//                 <input
//                     type="text"
//                     {...register("title")}
//                     className="w-full border rounded p-2"
//                 />
//                 {errors.title && <p className="text-red-500 text-sm">{errors.title.message}</p>}
//             </div>

//             <div>
//                 <label className="block font-semibold">מחיר (₪) *</label>
//                 <input
//                     type="number"
//                     step="0.01"
//                     {...register("price.amount", { valueAsNumber: true })}
//                     className="w-full border rounded p-2"
//                 />
//                 {errors.price?.amount && <p className="text-red-500 text-sm">{errors.price.amount.message}</p>}
//             </div>

//             {/* אופציונלי */}
//             <div>
//                 <label className="block font-semibold">תיאור</label>
//                 <textarea {...register("description")} className="w-full border rounded p-2" />
//             </div>

//             <div className="grid grid-cols-2 gap-2">
//                 <div>
//                     <label className="block font-semibold">מותג</label>
//                     <input type="text" {...register("brand")} className="w-full border rounded p-2" />
//                 </div>
//                 <div>
//                     <label className="block font-semibold">דגם</label>
//                     <input type="text" {...register("model")} className="w-full border rounded p-2" />
//                 </div>
//             </div>

//             <div className="grid grid-cols-2 gap-2">
//                 <div>
//                     <label className="block font-semibold">קטגוריה</label>
//                     <input type="text" {...register("category")} className="w-full border rounded p-2" />
//                 </div>
//                 <div>
//                     <label className="block font-semibold">קטגוריית משנה</label>
//                     <input type="text" {...register("subCategory")} className="w-full border rounded p-2" />
//                 </div>
//             </div>

//             <div>
//                 <label className="block font-semibold">מלאי</label>
//                 <input
//                     type="number"
//                     {...register("stock", { valueAsNumber: true })}
//                     className="w-full border rounded p-2"
//                 />
//             </div>

//             <div>
//                 <label className="block font-semibold">אחריות</label>
//                 <input type="text" {...register("warranty")} className="w-full border rounded p-2" />
//             </div>

//             <div>
//                 <label className="block font-semibold">תמונות (כתובות URL מופרדות בפסיק)</label>
//                 <input
//                     type="text"
//                     onChange={(e) =>
//                         setValue("images", e.target.value.split(",").map((s) => s.trim()))
//                     }
//                     className="w-full border rounded p-2"
//                 />
//                 {errors.images && <p className="text-red-500 text-sm">{errors.images.message}</p>}
//             </div>

//             <button
//                 type="submit"
//                 disabled={loading}
//                 className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
//             >
//                 {loading ? "שולח..." : "שמור מוצר"}
//             </button>
//         </form>
//     );
// }



import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCreateSellerProductMutation } from "../redux/services/sellerProductsApi";
import { useEffect, useState } from "react";

// === סכימה (עם המרות מספרים) ===
const productSchema = z.object({
  // חובה
  title: z.string().min(2, "שם מוצר קצר מדי"),
  price: z.object({
    amount: z.coerce
      .number({ invalid_type_error: "מחיר חובה" })
      .positive("מחיר חייב להיות חיובי"),
  }),

  // אופציונלי
  description: z.string().optional(),
  brand: z.string().optional(),
  model: z.string().optional(),
  category: z.string().optional(),
  subCategory: z.string().optional(),
  stock: z.coerce.number().int().min(0).optional(),
  warranty: z.string().optional(),
  images: z.array(z.string().url("כתובת לא תקינה")).optional(),
  specs: z.record(z.string()).optional(),
});

export default function ProductCreateForm() {
  const [imagesText, setImagesText] = useState(""); // שדה טקסט ל־URLs מופרדים בפסיק

  const [createProduct, { isLoading, isSuccess, error, reset }] =
    useCreateSellerProductMutation();

  const {
    register,
    handleSubmit,
    setValue,
    reset: resetForm,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(productSchema),
    defaultValues: {
      title: "",
      price: { amount: "" }, // יומר למספר דרך z.coerce.number
      description: "",
      brand: "",
      model: "",
      category: "",
      subCategory: "",
      stock: 0,
      warranty: "",
      images: [],
      specs: {},
    },
  });

  // סנכרון טקסט ה־images לשדה המערך
  useEffect(() => {
    if (!imagesText) {
      setValue("images", []);
      return;
    }
    const arr = imagesText
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    setValue("images", arr);
  }, [imagesText, setValue]);

  const onSubmit = async (data) => {
    // data כבר בנוי לפי הסכמה, כולל price.amount כמספר
    try {
      await createProduct(data).unwrap();
      // איפוס טופס אחרי הצלחה
      resetForm();
      setImagesText("");
      // אפשר להציג הודעה חיובית ב־toast שלך אם יש
      alert("המוצר נשלח בהצלחה!");
    } catch (err) {
      // error מוצג גם דרך RTK Query, אבל נוסיף הודעה ידידותית
      const msg = err?.data?.error || err?.error || "שגיאה בהעלאת";
      alert(msg);
    }
  };

  const serverError = error?.data?.error || error?.error;

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-4 max-w-xl mx-auto p-4 bg-white rounded-xl shadow"
      dir="rtl"
    >
      {/* שגיאה מהשרת */}
      {serverError && (
        <div className="rounded border border-red-300 bg-red-50 p-2 text-red-700 text-sm">
          {serverError}
        </div>
      )}

      {/* חובה */}
      <div>
        <label className="block font-semibold">שם מוצר *</label>
        <input
          type="text"
          {...register("title")}
          className="w-full border rounded p-2"
        />
        {errors.title && (
          <p className="text-red-500 text-sm">{errors.title.message}</p>
        )}
      </div>

      <div>
        <label className="block font-semibold">מחיר (₪) *</label>
        <input
          type="number"
          step="0.01"
          {...register("price.amount")}
          className="w-full border rounded p-2"
        />
        {errors.price?.amount && (
          <p className="text-red-500 text-sm">{errors.price.amount.message}</p>
        )}
      </div>

      {/* אופציונלי */}
      <div>
        <label className="block font-semibold">תיאור</label>
        <textarea
          {...register("description")}
          className="w-full border rounded p-2"
        />
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block font-semibold">מותג</label>
          <input
            type="text"
            {...register("brand")}
            className="w-full border rounded p-2"
          />
        </div>
        <div>
          <label className="block font-semibold">דגם</label>
          <input
            type="text"
            {...register("model")}
            className="w-full border rounded p-2"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block font-semibold">קטגוריה</label>
          <input
            type="text"
            {...register("category")}
            className="w-full border rounded p-2"
          />
        </div>
        <div>
          <label className="block font-semibold">קטגוריית משנה</label>
          <input
            type="text"
            {...register("subCategory")}
            className="w-full border rounded p-2"
          />
        </div>
      </div>

      <div>
        <label className="block font-semibold">מלאי</label>
        <input
          type="number"
          {...register("stock")}
          className="w-full border rounded p-2"
          min={0}
        />
        {errors.stock && (
          <p className="text-red-500 text-sm">{errors.stock.message}</p>
        )}
      </div>

      <div>
        <label className="block font-semibold">אחריות</label>
        <input
          type="text"
          {...register("warranty")}
          className="w-full border rounded p-2"
        />
      </div>

      <div>
        <label className="block font-semibold">
          תמונות (כתובות URL מופרדות בפסיק)
        </label>
        <input
          type="text"
          value={imagesText}
          onChange={(e) => setImagesText(e.target.value)}
          className="w-full border rounded p-2"
          placeholder="https://... , https://..."
        />
        {errors.images && (
          <p className="text-red-500 text-sm">{errors.images.message}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-60"
      >
        {isLoading ? "שולח..." : "שמור מוצר"}
      </button>

      {isSuccess && (
        <p className="text-green-600 text-sm pt-1">המוצר נשלח בהצלחה</p>
      )}
    </form>
  );
}
