import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { addAddress, updateAddress } from "../../../redux/thunks/addressThunks";
import AddressFields from "./AddressFields";
export default function AddressForm({ initialData, onSuccess }) {
    const { list } = useSelector((state) => state.addresses);
    const defaultAddress = list.find((a) => a.isDefault) || list[0];
    const navigate = useNavigate();
    const dispatch = useDispatch();

    // מצב פנימי של הטופס
    const [form, setForm] = useState({
        country: "ישראל",
        city: "",
        street: "",
        zip: "",
        notes: "",
        // phone: ""
    });

    // ✅ טען נתונים ראשוניים (או מ־initialData, או מ־defaultAddress)
    useEffect(() => {
        const source = initialData ;
        if (source) {
            setForm({
                country: source.country || "ישראל",
                city: source.city || "",
                street: source.street || "",
                zip: source.zip || "",
                notes: source.notes || "",
                // phone: source.phone || ""
            });
        }
    }, [initialData, defaultAddress]);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const source = initialData ;

            if (source) {
                // אם שונה → עדכון
                const isChanged = Object.keys(form).some(
                    (key) => form[key] !== (source[key] || "")
                );

                if (isChanged) {
                    const updated = await dispatch(
                        updateAddress({ id: source._id, data: form })
                    ).unwrap();

                    if (onSuccess) onSuccess(updated);
                }
                navigate("/payment");
            } else {
                // אין כתובת קיימת → מוסיפים חדשה
                const newAddress = await dispatch(addAddress(form)).unwrap();
                if (onSuccess) onSuccess(newAddress);
                navigate("/payment");
            }
        } catch (err) {
            console.error("Error saving/updating address", err);
            alert("שגיאה בשמירת הכתובת");
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="rounded-xl bg-white p-6 shadow-sm">
                <h2 className="mb-5 text-xl font-semibold">פרטי חיוב</h2>

                <AddressFields form={form} onChange={handleChange} />

                <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
                    שמירה
                </button>
            </div>
        </form>
    );
}
