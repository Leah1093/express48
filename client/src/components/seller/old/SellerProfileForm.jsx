import { useState } from "react";

import axios from "axios";
export default function SellerProfileForm({ initial, onSaved }) {
    const [form, setForm] = useState(() => ({
        displayName: initial?.displayName || "",
        businessName: initial?.businessName || "",
        email: initial?.email || "",
        phone: initial?.phone || "",
        supportEmail: initial?.supportEmail || "",
        supportPhone: initial?.supportPhone || "",
        about: initial?.about || "",
        logoUrl: initial?.logoUrl || "",
        address: {
            street: initial?.address?.street || "",
            city: initial?.address?.city || "",
            zip: initial?.address?.zip || "",
            country: initial?.address?.country || "IL",
        },
        pickupAddress: {
            street: initial?.pickupAddress?.street || "",
            city: initial?.pickupAddress?.city || "",
            zip: initial?.pickupAddress?.zip || "",
            country: initial?.pickupAddress?.country || "IL",
        },
    }));
    const [saving, setSaving] = useState(false);
    const [msg, setMsg] = useState("");

    const onChange = (e) => {
        const { name, value } = e.target;
        if (name.startsWith("address.")) {
            const k = name.split(".")[1];
            setForm(f => ({ ...f, address: { ...f.address, [k]: value } }));
        } else if (name.startsWith("pickupAddress.")) {
            const k = name.split(".")[1];
            setForm(f => ({ ...f, pickupAddress: { ...f.pickupAddress, [k]: value } }));
        } else {
            setForm(f => ({ ...f, [name]: value }));
        }
    };

    const onSubmit = async (e) => {
        e.preventDefault();
        try {
            setSaving(true);
            setMsg("");

            const { data } = await axios.patch(
                "http://localhost:8080/seller-profile/me",
                form,
                { withCredentials: true }
            );

            onSaved?.(data?.seller || data);
            setMsg("נשמר בהצלחה");
        } catch (err) {
            setMsg(err?.response?.data?.message || "שגיאה בשמירה");
        } finally {
            setSaving(false);
        }
    };

    const Input = (props) => <input {...props} className="input" />;
    const Field = ({ label, children }) => (
        <label className="block space-y-1">
            <span className="text-xs font-medium text-gray-700">{label}</span>
            {children}
        </label>
    );

    return (
        <form onSubmit={onSubmit} className="grid grid-cols-1 gap-5 lg:grid-cols-2">
            <div className="space-y-4">
                <Field label="שם עסק">
                    <Input name="businessName" value={form.businessName} onChange={onChange} placeholder="חנות יעל" />
                </Field>
                <Field label="שם תצוגה">
                    <Input name="displayName" value={form.displayName} onChange={onChange} />
                </Field>
                <Field label="אימייל קשר">
                    <Input name="email" type="email" value={form.email} onChange={onChange} />
                </Field>
                <Field label="טלפון קשר">
                    <Input name="phone" value={form.phone} onChange={onChange} />
                </Field>
                <Field label="אודות">
                    <textarea name="about" value={form.about} onChange={onChange} className="input min-h-[96px]" />
                </Field>
            </div>

            <div className="space-y-4">
                <Field label="אימייל תמיכה">
                    <Input name="supportEmail" type="email" value={form.supportEmail} onChange={onChange} />
                </Field>
                <Field label="טלפון תמיכה">
                    <Input name="supportPhone" value={form.supportPhone} onChange={onChange} />
                </Field>
                <Field label="Logo URL (אופציונלי)">
                    <Input name="logoUrl" value={form.logoUrl} onChange={onChange} placeholder="https://..." />
                </Field>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <Field label="רחוב">
                        <Input name="address.street" value={form.address.street} onChange={onChange} />
                    </Field>
                    <Field label="עיר">
                        <Input name="address.city" value={form.address.city} onChange={onChange} />
                    </Field>
                    <Field label="מיקוד">
                        <Input name="address.zip" value={form.address.zip} onChange={onChange} />
                    </Field>
                    <Field label="מדינה">
                        <Input name="address.country" value={form.address.country} onChange={onChange} />
                    </Field>
                </div>
            </div>

            <div className="col-span-1 lg:col-span-2 flex items-center justify-between">
                <div className="text-sm text-gray-600">{msg && <span>{msg}</span>}</div>
                <button type="submit" disabled={saving}
                    className="rounded-2xl bg-gray-900 px-4 py-2 text-sm text-white hover:bg-black disabled:opacity-50">
                    {saving ? "שומר..." : "שמירת שינויים"}
                </button>
            </div>
        </form>
    );
}
