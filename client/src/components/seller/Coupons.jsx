// import { useState } from "react";
// import axios from "axios";

// export default function CouponForm() {
//     const [form, setForm] = useState({
//         code: "",
//         discountType: "percent",
//         discountValue: 0,
//         expiryDate: "",
//         usageLimit: null,
//         usagePerUser: false,
//         minOrderAmount: 0,
//         restrictionType: "none",
//     });

//     const handleChange = (e) => {
//         const { name, value, type, checked } = e.target;
//         setForm((prev) => ({
//             ...prev,
//             [name]: type === "checkbox" ? checked : value,
//         }));
//     };

//     const handleSubmit = async (e) => {
//         e.preventDefault();
//         try {
//             await axios.post("https://api.express48.com/coupons", form, { withCredentials: true });
//             alert("קופון נוצר בהצלחה!");
//         } catch (err) {
//             alert(err.response?.data?.error || "שגיאה");
//         }
//     };

//     return (
//         <form onSubmit={handleSubmit} className="space-y-4 p-4 bg-white rounded shadow">
//             <div>
//                 <label className="block font-semibold">קוד קופון</label>
//                 <input
//                     type="text"
//                     name="code"
//                     value={form.code}
//                     onChange={handleChange}
//                     className="border p-2 rounded w-full"
//                     required
//                 />
//             </div>

//             <div>
//                 <label className="block font-semibold">סוג הנחה</label>
//                 <select
//                     name="discountType"
//                     value={form.discountType}
//                     onChange={handleChange}
//                     className="border p-2 rounded w-full"
//                 >
//                     <option value="percent">אחוז</option>
//                     <option value="fixed">סכום קבוע</option>
//                 </select>
//             </div>

//             <div>
//                 <label className="block font-semibold">ערך הנחה</label>
//                 <input
//                     type="number"
//                     name="discountValue"
//                     value={form.discountValue}
//                     onChange={handleChange}
//                     className="border p-2 rounded w-full"
//                     required
//                 />
//             </div>

//             <div>
//                 <label className="block font-semibold">תאריך תפוגה</label>
//                 <input
//                     type="date"
//                     name="expiryDate"
//                     value={form.expiryDate}
//                     onChange={handleChange}
//                     className="border p-2 rounded w-full"
//                     required
//                 />
//             </div>

//             <div>
//                 <label className="block font-semibold"> מספר השימושים המרבי בקופון (לכל המשתמשים יחד)</label>
//                 <input
//                     type="number"
//                     name="usageLimit"
//                     value={form.usageLimit || ""}
//                     onChange={handleChange}
//                     className="border p-2 rounded w-full"
//                 />
//             </div>

//             <div className="flex items-center gap-2">
//                 <input
//                     type="checkbox"
//                     name="usagePerUser"
//                     checked={form.usagePerUser}
//                     onChange={handleChange}
//                 />
//                 <label>שימוש חד פעמי לכל משתמש</label>
//             </div>

//             <div>
//                 <label className="block font-semibold">סכום מינימום להזמנה</label>
//                 <input
//                     type="number"
//                     name="minOrderAmount"
//                     value={form.minOrderAmount}
//                     onChange={handleChange}
//                     className="border p-2 rounded w-full"
//                 />
//             </div>
//             <div>
//                 <label>הגבלת קופון</label>
//                 <select
//                     name="restrictionType"
//                     value={form.restrictionType}
//                     onChange={handleChange}
//                     className="border p-2 rounded w-full"
//                 >
//                     <option value="none">ללא (פתוח לכולם)</option>
//                     {/* <option value="specificUsers">משתמשים ספציפיים</option> */}
//                     <option value="birthday">לקוחות ביום הולדת</option>
//                     <option value="abandonedCart">לקוחות עם עגלה נטושה</option>
//                 </select>
//             </div>
//             <button
//                 type="submit"
//                 className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
//             >
//                 צור קופון
//             </button>
//         </form>
//     );
// }




// components/CouponForm.jsx
import { useState } from "react";
import { useCreateCouponMutation } from "../../redux/services/couponApi";
// עוזר: המרת ערכים לפני שליחה
function normalizePayload(form) {
  const toNumber = (v, def = 0) => {
    const n = Number(v);
    return Number.isNaN(n) ? def : n;
  };
  const toNullOrNumber = (v) => {
    if (v === "" || v === null || typeof v === "undefined") return null;
    const n = Number(v);
    return Number.isNaN(n) ? null : n;
  };

  return {
    code: String(form.code || "").trim(),
    discountType: form.discountType === "fixed" ? "fixed" : "percent",
    discountValue: toNumber(form.discountValue, 0),
    expiryDate: form.expiryDate,               // yyyy-mm-dd
    usageLimit: toNullOrNumber(form.usageLimit),
    usagePerUser: !!form.usagePerUser,
    minOrderAmount: toNumber(form.minOrderAmount, 0),
    restrictionType: form.restrictionType || "none",
  };
}

export default function CouponForm() {
  const [form, setForm] = useState({
    code: "",
    discountType: "percent",
    discountValue: 0,
    expiryDate: "",
    usageLimit: null,
    usagePerUser: false,
    minOrderAmount: 0,
    restrictionType: "none",
  });

  const [createCoupon, { isLoading, isSuccess, error, reset }] =
    useCreateCouponMutation();

  const [message, setMessage] = useState(null);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setForm((prev) => {
      // המרות טיפוסים בסיסיות בשלב ההקלדה
      if (type === "checkbox") return { ...prev, [name]: !!checked };
      if (name === "discountValue" || name === "minOrderAmount") {
        return { ...prev, [name]: value === "" ? "" : Number(value) };
      }
      if (name === "usageLimit") {
        return { ...prev, [name]: value === "" ? "" : Number(value) };
      }
      return { ...prev, [name]: value };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);
    reset(); // איפוס סטטוס ה־mutation הקודם

    // ולידציה בסיסית בצד לקוח
    if (!form.code.trim()) {
      setMessage({ type: "error", text: "יש למלא קוד קופון" });
      return;
    }
    if (!form.expiryDate) {
      setMessage({ type: "error", text: "יש לבחור תאריך תפוגה" });
      return;
    }
    if (!form.discountValue || Number(form.discountValue) <= 0) {
      setMessage({ type: "error", text: "ערך ההנחה חייב להיות גדול מ־0" });
      return;
    }

    try {
      const payload = normalizePayload(form);
      await createCoupon(payload).unwrap();
      setMessage({ type: "success", text: "קופון נוצר בהצלחה!" });
      // איפוס הטופס אחרי הצלחה
      setForm({
        code: "",
        discountType: "percent",
        discountValue: 0,
        expiryDate: "",
        usageLimit: null,
        usagePerUser: false,
        minOrderAmount: 0,
        restrictionType: "none",
      });
    } catch (err) {
      // RTKQ כבר חושף error, אבל נציג הודעה ידידותית
      const serverMsg =
        err?.data?.error ||
        err?.error ||
        "שגיאה ביצירת הקופון";
      setMessage({ type: "error", text: serverMsg });
    }
  };

  const serverError =
    error?.data?.error ||
    error?.error ||
    null;

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 bg-white rounded shadow">
      {/* הודעות */}
      {message?.type === "error" && (
        <div className="rounded border border-red-300 bg-red-50 p-2 text-red-700 text-sm">
          {message.text}
        </div>
      )}
      {serverError && (
        <div className="rounded border border-red-300 bg-red-50 p-2 text-red-700 text-sm">
          {serverError}
        </div>
      )}
      {message?.type === "success" && (
        <div className="rounded border border-green-300 bg-green-50 p-2 text-green-700 text-sm">
          {message.text}
        </div>
      )}

      <div>
        <label className="block font-semibold">קוד קופון</label>
        <input
          type="text"
          name="code"
          value={form.code}
          onChange={handleChange}
          className="border p-2 rounded w-full"
          required
          dir="ltr"
        />
      </div>

      <div>
        <label className="block font-semibold">סוג הנחה</label>
        <select
          name="discountType"
          value={form.discountType}
          onChange={handleChange}
          className="border p-2 rounded w-full"
        >
          <option value="percent">אחוז</option>
          <option value="fixed">סכום קבוע</option>
        </select>
      </div>

      <div>
        <label className="block font-semibold">ערך הנחה</label>
        <input
          type="number"
          name="discountValue"
          value={form.discountValue}
          onChange={handleChange}
          className="border p-2 rounded w-full"
          min={0}
          step="0.01"
          required
        />
      </div>

      <div>
        <label className="block font-semibold">תאריך תפוגה</label>
        <input
          type="date"
          name="expiryDate"
          value={form.expiryDate}
          onChange={handleChange}
          className="border p-2 rounded w-full"
          required
        />
      </div>

      <div>
        <label className="block font-semibold">
          מספר השימושים המרבי בקופון (לכל המשתמשים יחד)
        </label>
        <input
          type="number"
          name="usageLimit"
          value={form.usageLimit === null ? "" : form.usageLimit}
          onChange={handleChange}
          className="border p-2 rounded w-full"
          min={0}
          placeholder="השאירו ריק = ללא הגבלה"
        />
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          name="usagePerUser"
          checked={!!form.usagePerUser}
          onChange={handleChange}
        />
        <label>שימוש חד פעמי לכל משתמש</label>
      </div>

      <div>
        <label className="block font-semibold">סכום מינימום להזמנה</label>
        <input
          type="number"
          name="minOrderAmount"
          value={form.minOrderAmount}
          onChange={handleChange}
          className="border p-2 rounded w-full"
          min={0}
          step="0.01"
        />
      </div>

      <div>
        <label className="block font-semibold">הגבלת קופון</label>
        <select
          name="restrictionType"
          value={form.restrictionType}
          onChange={handleChange}
          className="border p-2 rounded w-full"
        >
          <option value="none">ללא (פתוח לכולם)</option>
          {/* <option value="specificUsers">משתמשים ספציפיים</option> */}
          <option value="birthday">לקוחות ביום הולדת</option>
          <option value="abandonedCart">לקוחות עם עגלה נטושה</option>
        </select>
      </div>

      <button
        type="submit"
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-60"
        disabled={isLoading}
      >
        {isLoading ? "יוצר קופון..." : "צור קופון"}
      </button>
    </form>
  );
}
