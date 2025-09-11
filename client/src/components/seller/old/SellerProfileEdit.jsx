// components/seller/SellerProfileEdit.jsx
import { useEffect, useState } from "react";
import axios from "axios";

// מופע Axios מקומי (התאימי את ה-URL לפי הסביבה שלך)
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8080",
  withCredentials: true, // אם את עובדת עם Cookies מאובטחים
});

export default function SellerProfileEdit() {
  const [form, setForm] = useState({
    businessName: "", displayName: "", email: "", phone: "",
    supportEmail: "", supportPhone: "", about: "",
    address: { street: "", city: "", zip: "", country: "IL" },
    pickupAddress: { street: "", city: "", zip: "", country: "IL" },
    logoUrl: ""
  });
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  // נטען ערכי התחלה פעם אחת
  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get("/seller-profile/me");
        const s = data?.seller || data;
        setForm({
          businessName: s?.businessName || "",
          displayName: s?.displayName || "",
          email: s?.email || "",
          phone: s?.phone || "",
          supportEmail: s?.supportEmail || "",
          supportPhone: s?.supportPhone || "",
          about: s?.about || "",
          logoUrl: s?.logoUrl || "",
          address: {
            street: s?.address?.street || "", city: s?.address?.city || "",
            zip: s?.address?.zip || "", country: s?.address?.country || "IL",
          },
          pickupAddress: {
            street: s?.pickupAddress?.street || "", city: s?.pickupAddress?.city || "",
            zip: s?.pickupAddress?.zip || "", country: s?.pickupAddress?.country || "IL",
          },
        });
      } catch {}
    })();
  }, []);

  const onChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith("address.")) {
      const key = name.split(".")[1];
      setForm(f => ({ ...f, address: { ...f.address, [key]: value } }));
    } else if (name.startsWith("pickupAddress.")) {
      const key = name.split(".")[1];
      setForm(f => ({ ...f, pickupAddress: { ...f.pickupAddress, [key]: value } }));
    } else {
      setForm(f => ({ ...f, [name]: value }));
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      setBusy(true); setMsg("");
      await api.patch("/seller-profile/me", form);
      setMsg("נשמר בהצלחה");
    } catch (err) {
      setMsg(err?.response?.data?.message || "שגיאה בשמירה");
    } finally { setBusy(false); }
  };

  const Input = (props) => <input {...props} className="input" />;

  return (
    <form onSubmit={onSubmit} className="rounded-2xl border bg-white p-4 space-y-4">
      <h3 className="font-semibold">עריכת פרופיל</h3>

      <div className="grid md:grid-cols-2 gap-4">
        <label className="block space-y-1">
          <span className="text-xs text-gray-700">שם עסק</span>
          <Input name="businessName" value={form.businessName} onChange={onChange} />
        </label>
        <label className="block space-y-1">
          <span className="text-xs text-gray-700">שם תצוגה</span>
          <Input name="displayName" value={form.displayName} onChange={onChange} />
        </label>
        <label className="block space-y-1">
          <span className="text-xs text-gray-700">אימייל</span>
          <Input name="email" type="email" value={form.email} onChange={onChange} />
        </label>
        <label className="block space-y-1">
          <span className="text-xs text-gray-700">טלפון</span>
          <Input name="phone" value={form.phone} onChange={onChange} />
        </label>
      </div>

      <label className="block space-y-1">
        <span className="text-xs text-gray-700">אודות</span>
        <textarea name="about" value={form.about} onChange={onChange} className="input min-h-[96px]" />
      </label>

      <div className="grid md:grid-cols-2 gap-4">
        <label className="block space-y-1">
          <span className="text-xs text-gray-700">כתובת: רחוב</span>
          <Input name="address.street" value={form.address.street} onChange={onChange} />
        </label>
        <label className="block space-y-1">
          <span className="text-xs text-gray-700">עיר</span>
          <Input name="address.city" value={form.address.city} onChange={onChange} />
        </label>
        <label className="block space-y-1">
          <span className="text-xs text-gray-700">מיקוד</span>
          <Input name="address.zip" value={form.address.zip} onChange={onChange} />
        </label>
        <label className="block space-y-1">
          <span className="text-xs text-gray-700">מדינה</span>
          <Input name="address.country" value={form.address.country} onChange={onChange} />
        </label>
      </div>

      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-600">{msg}</span>
        <button
          className="rounded-2xl bg-gray-900 px-4 py-2 text-sm text-white hover:bg-black disabled:opacity-50"
          disabled={busy}
        >
          {busy ? "שומר..." : "שמירת שינויים"}
        </button>
      </div>
    </form>
  );
}
