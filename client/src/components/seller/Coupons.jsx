import { useState } from "react";
import axios from "axios";

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

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setForm((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post("http://localhost:8080/coupons", form, { withCredentials: true });
            alert("קופון נוצר בהצלחה!");
        } catch (err) {
            alert(err.response?.data?.error || "שגיאה");
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4 p-4 bg-white rounded shadow">
            <div>
                <label className="block font-semibold">קוד קופון</label>
                <input
                    type="text"
                    name="code"
                    value={form.code}
                    onChange={handleChange}
                    className="border p-2 rounded w-full"
                    required
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
                <label className="block font-semibold"> מספר השימושים המרבי בקופון (לכל המשתמשים יחד)</label>
                <input
                    type="number"
                    name="usageLimit"
                    value={form.usageLimit || ""}
                    onChange={handleChange}
                    className="border p-2 rounded w-full"
                />
            </div>

            <div className="flex items-center gap-2">
                <input
                    type="checkbox"
                    name="usagePerUser"
                    checked={form.usagePerUser}
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
                />
            </div>
            <div>
                <label>הגבלת קופון</label>
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
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
                צור קופון
            </button>
        </form>
    );
}
