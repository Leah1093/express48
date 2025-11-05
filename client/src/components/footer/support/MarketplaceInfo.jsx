// // components/marketplace/SellerApplyForm.jsx
// import { useState, useEffect } from "react";
// import { useSelector } from "react-redux";
// import axios from "axios";
// import { z } from "zod";

// const schema = z.object({
//   companyName: z.string().min(2, "שם חברה קצר מדי"),
//   fullName:    z.string().min(2, "שם מלא קצר מדי"),
//   email:       z.string().email("אימייל לא תקין"),
//   position:    z.string().optional().default(""),
//   phone:       z.string().optional().default(""),
//   categories:  z.string().optional().default(""),
//   notes:       z.string().optional().default(""),
//   // נוסיף userId אופציונלי כשמחוברים
//   userId:      z.string().optional().default(""),
// });

// const MarketplaceInfo = () => {
//   // --- Redux: יוזר מחובר (אם יש) ---
//   const user = useSelector((state) => state?.user?.user || null);

//   const [form, setForm] = useState({
//     companyName: "",
//     fullName: "",
//     email: "",
//     position: "",
//     phone: "",
//     categories: "",
//     notes: "",
//     userId: "",
//   });
//   const [busy, setBusy] = useState(false);
//   const [msg, setMsg] = useState({ type: "", text: "" });

//   // מופע Axios מקומי
//   const api = axios.create({
//     baseURL: "https://api.express48.com",
//     withCredentials: true,
//     timeout: 15000,
//   });

//   // מילוי אוטומטי אם המשתמש מחובר
//   useEffect(() => {
//     if (!user) return;
//     console.log("user",user)
//     const inferredId = user.userId || user.id || user._id || "";
//     setForm((f) => ({
//       ...f,
//       userId: inferredId,
//       fullName: f.fullName || user.firstName || user.name || "",
//       email: f.email || user.email || "",
//       phone: f.phone || user.phone || "",
//       companyName: f.companyName || user.companyName || "",
//     }));
//   }, [user]);

//   const onChange = (e) => {
//     const { name, value } = e.target;
//     setForm((f) => ({ ...f, [name]: value }));
//   };

//   const onSubmit = async (e) => {
//     e.preventDefault();
//     setMsg({ type: "", text: "" });

//     // אם מחובר – ודא ש־userId נכנס ל־form (גם אם נמחק ידנית)
//     const inferredId = user ? (user.userId || user.id || user._id || "") : "";
//     const dataToValidate = { ...form, userId: inferredId || form.userId || "" };

//     const parsed = schema.safeParse(dataToValidate);
//     if (!parsed.success) {
//       const first = parsed.error.errors[0]?.message || "שגיאת ולידציה";
//       setMsg({ type: "err", text: first });
//       return;
//     }

//     try {
//       setBusy(true);
//       // שליחה לשרת – כולל userId אם מחובר
//           console.log("user",dataToValidate)

//       await api.post("/marketplace/apply", dataToValidate);
//       setMsg({ type: "ok", text: "הבקשה נשלחה! נחזור אלייך במייל לאחר בדיקה." });

//       // ניקוי טופס (משאיר userId אם מחובר)
//       setForm({
//         companyName: user?.companyName || "",
//         fullName: user?.firstName || user?.name || "",
//         email: user?.email || "",
//         position: "",
//         phone: user?.phone || "",
//         categories: "",
//         notes: "",
//         userId: inferredId || "",
//       });
//     } catch (err) {
//       setMsg({
//         type: "err",
//         text: err?.response?.data?.message || "שליחה נכשלה. נסי שוב.",
//       });
//     } finally {
//       setBusy(false);
//     }
//   };
  
//   return (
//     <form onSubmit={onSubmit} className="max-w-2xl mx-auto space-y-4 p-4 bg-white border rounded-2xl">
//       <h2 className="text-xl font-semibold text-right">בקשה להצטרפות למרקטפלייס</h2>

//       {/* אם מחובר – שדה userId חסוי לשליחה בלבד */}
//       {user && (
//         <input type="hidden" name="userId" value={form.userId} />
//       )}

//       <div className="grid md:grid-cols-2 gap-4">
//         <label className="block text-right">
//           <span className="text-xs text-gray-600">שם חברה*</span>
//           <input
//             name="companyName"
//             value={form.companyName}
//             onChange={onChange}
//             className="input w-full"
//             placeholder='לדוגמה: חנות מתנות בע"מ'
//           />
//         </label>

//         <label className="block text-right">
//           <span className="text-xs text-gray-600">שם מלא איש קשר*</span>
//           <input
//             name="fullName"
//             value={form.fullName}
//             onChange={onChange}
//             className="input w-full"
//             placeholder="שם פרטי ושם משפחה"
//           />
//         </label>

//         <label className="block text-right">
//           <span className="text-xs text-gray-600">אימייל*</span>
//           <input
//             name="email"
//             type="email"
//             value={form.email}
//             onChange={onChange}
//             className="input w-full"
//             placeholder="name@example.com"
//           />
//         </label>

//         <label className="block text-right">
//           <span className="text-xs text-gray-600">תפקיד</span>
//           <input
//             name="position"
//             value={form.position}
//             onChange={onChange}
//             className="input w-full"
//             placeholder="בעלים / מנהלת חנות"
//           />
//         </label>

//         <label className="block text-right">
//           <span className="text-xs text-gray-600">טלפון</span>
//           <input
//             name="phone"
//             value={form.phone}
//             onChange={onChange}
//             className="input w-full"
//             placeholder="050-0000000"
//           />
//         </label>

//         <label className="block text-right">
//           <span className="text-xs text-gray-600">קטגוריות</span>
//           <input
//             name="categories"
//             value={form.categories}
//             onChange={onChange}
//             className="input w-full"
//             placeholder="אופנה, מתנות, צעצועים..."
//           />
//         </label>
//       </div>

//       <label className="block text-right">
//         <span className="text-xs text-gray-600">הערות</span>
//         <textarea
//           name="notes"
//           value={form.notes}
//           onChange={onChange}
//           className="input w-full min-h-[96px]"
//           placeholder="הערות/מידע נוסף"
//         />
//       </label>

//       <div className="flex items-center justify-between">
//         <span
//           className={
//             msg.type === "ok"
//               ? "text-sm text-green-600"
//               : msg.type === "err"
//               ? "text-sm text-red-600"
//               : "text-sm text-gray-500"
//           }
//         >
//           {msg.text}
//         </span>

//         <button
//           disabled={busy}
//           className="rounded-2xl bg-gray-900 px-4 py-2 text-sm text-white hover:bg-black disabled:opacity-50"
//         >
//           {busy ? "שולח..." : "שליחת בקשה"}
//         </button>
//       </div>
//     </form>
//   );
// };

// export default MarketplaceInfo;



import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import axios from "axios";

// סכימת ולידציה
const schema = z.object({
  companyName: z.string().min(2, "חובה למלא שם חברה/חנות"),
  fullName: z.string().min(2, "חובה למלא שם מלא"),
  email: z.string().email("אימייל לא תקין"),
  position: z.string().optional(),
  phone: z.string().min(7, "טלפון לא תקין"),
  categories: z.string().optional(),
  notes: z.string().optional(),
});

export default function MarketplaceInfo() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isSubmitSuccessful },
    reset,
  } = useForm({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data) => {
    try {
      await axios.post("https://api.express48.com/marketplace/sellers", data, {
        withCredentials: true,
      });
      alert("הבקשה נשלחה בהצלחה!");
      reset();
    } catch (err) {
      console.error(err);
      alert("שגיאה בשליחת הבקשה, נסה שוב.");
    }
  };

  return (
    <div className="max-w-xl mx-auto p-6 bg-gray-50 rounded-lg shadow">
      <h2 className="text-2xl font-bold text-center mb-2">מה זה מרקטפלייס?</h2>
      <p className="text-center mb-6 text-gray-700">
        פלטפורמה המאפשרת לכם לנהל ולמכור את מוצריכם ישירות למיליוני לקוחות
        אקספרס 48 האתר המוביל במדינה.
      </p>

      <h3 className="text-lg font-bold mb-4 text-center">
        בקשת הצטרפות למרקטפלייס
      </h3>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <input
            type="text"
            placeholder="שם חברה/חנות"
            {...register("companyName")}
            className="w-full border rounded p-2"
          />
          {errors.companyName && (
            <p className="text-red-500 text-sm">{errors.companyName.message}</p>
          )}
        </div>

        <div>
          <input
            type="text"
            placeholder="שם מלא"
            {...register("fullName")}
            className="w-full border rounded p-2"
          />
          {errors.fullName && (
            <p className="text-red-500 text-sm">{errors.fullName.message}</p>
          )}
        </div>

        <div>
          <input
            type="email"
            placeholder="אימייל"
            {...register("email")}
            className="w-full border rounded p-2"
          />
          {errors.email && (
            <p className="text-red-500 text-sm">{errors.email.message}</p>
          )}
        </div>

        <div>
          <input
            type="text"
            placeholder="תפקיד"
            {...register("position")}
            className="w-full border rounded p-2"
          />
        </div>

        <div>
          <input
            type="tel"
            placeholder="טלפון"
            {...register("phone")}
            className="w-full border rounded p-2"
          />
          {errors.phone && (
            <p className="text-red-500 text-sm">{errors.phone.message}</p>
          )}
        </div>

        <div>
          <input
            type="text"
            placeholder="קטגוריה (ציינו באילו תחומים המוצרים שלכם)"
            {...register("categories")}
            className="w-full border rounded p-2"
          />
        </div>

        <div>
          <textarea
            placeholder="פרטים נוספים/הערות"
            {...register("notes")}
            className="w-full border rounded p-2"
            rows="4"
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-blue-900 text-white py-2 rounded hover:bg-blue-800"
        >
          {isSubmitting ? "שולח..." : "שליחה"}
        </button>
      </form>
    </div>
  );
}
