import { useState } from "react";
import { Pencil, Trash2, Copy, ChevronRight } from "lucide-react";
import AddressForm from "./AddressForm";
import { useDispatch } from "react-redux";
import { deleteAddress, setDefaultAddress } from "../../../redux/thunks/addressThunks";
import toast from "react-hot-toast";

export default function AddressListModal({
    addresses = [],
    onClose,
    initialEditingAddress = null,
}) {
    const [editingAddress, setEditingAddress] = useState(initialEditingAddress);
    const [addingNew, setAddingNew] = useState(false);
    const dispatch = useDispatch();

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-lg shadow-lg h-[500px] flex flex-col">
                {!editingAddress && !addingNew ? (
                    <>
                        <h2 className="text-xl font-bold mb-4">כתובות</h2>

                        {/* רשימת כתובות עם גלילה */}
                        <div className="flex-1 overflow-y-auto">
                            {addresses.map((addr) => (
                                <div key={addr._id} className="border rounded-lg p-4 mb-3 relative">
                                    <div className="font-semibold">{addr.username}</div>
                                    <div className="text-gray-600">{addr.phone}</div>
                                    <div className="text-gray-800">{addr.street}</div>
                                    <div className="text-gray-600">
                                        {addr.city}, {addr.zip}, {addr.country}
                                    </div>

                                    {/* פעולות */}
                                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="radio"
                                                checked={addr.isDefault}
                                                onChange={() => dispatch(setDefaultAddress(addr._id))}
                                            />
                                            ברירת מחדל
                                        </label>

                                        <button
                                            onClick={() => setEditingAddress(addr)}
                                            className="flex items-center gap-1 hover:text-blue-600"
                                        >
                                            <Pencil size={16} /> עריכה
                                        </button>

                                        <button
                                            onClick={() =>
                                                navigator.clipboard
                                                    .writeText(
                                                        `${addr.street}, ${addr.city}, ${addr.zip}, ${addr.country}`
                                                    )
                                                    .then(() => toast.success(" הכתובת הועתקה ללוח"))
                                                    .catch(() => toast.error(" שגיאה בהעתקה"))
                                            }
                                            className="flex items-center gap-1 hover:text-green-600"
                                        >
                                            <Copy size={16} /> העתקה
                                        </button>

                                        <button
                                            onClick={() => dispatch(deleteAddress(addr._id))}
                                            className="flex items-center gap-1 hover:text-red-600"
                                        >
                                            <Trash2 size={16} /> מחיקה
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* כפתורים למטה */}
                        <div className="mt-4 space-y-2">
                            <button
                                onClick={() => setAddingNew(true)}
                                className="w-full py-3 rounded-full bg-orange-500 text-white font-bold hover:bg-orange-600"
                            >
                                הוספת כתובת חדשה
                            </button>

                            <button
                                onClick={onClose}
                                className="w-full py-2 rounded bg-gray-200 hover:bg-gray-300"
                            >
                                סגור
                            </button>
                        </div>
                    </>
                ) : addingNew ? (
                    <>
                        <div

                            className="flex items-center gap-2 text-blue-600 cursor-pointer mb-4"
                            onClick={() => setAddingNew(false)}
                        >
                            <ChevronRight size={18} />
                            <span className="font-medium">חזור</span>
                        </div>

                        <h2 className="text-xl font-bold mb-4">הוספת כתובת חדשה</h2>

                        <div className="flex-1 overflow-y-auto">
                            <AddressForm
                                onSuccess={() => setAddingNew(false)}
                            />
                        </div>

                        <div className="mt-4">
                            <button
                                onClick={() => setAddingNew(false)}
                                className="w-full py-2 rounded bg-gray-200 hover:bg-gray-300"
                            >
                                ביטול
                            </button>
                        </div>
                    </>
                ) : (
                    <>
                        {/* כותרת עליונה עם חזור */}
                        <div
                            className="flex items-center gap-2 text-blue-600 cursor-pointer mb-4"
                            onClick={() => setEditingAddress(null)}
                        >
                            <ChevronRight size={18} />
                            <span className="font-medium">חזור</span>
                        </div>

                        <h2 className="text-xl font-bold mb-4">עריכת כתובת</h2>

                        {/* טופס עריכה עם גלילה */}
                        <div className="flex-1 overflow-y-auto">
                            <AddressForm
                                initialData={editingAddress}
                                onSuccess={() => setEditingAddress(null)}
                            />
                        </div>

                        {/* כפתור ביטול תמיד למטה */}
                        <div className="mt-4">
                            <button
                                onClick={() => setEditingAddress(null)}
                                className="w-full py-2 rounded bg-gray-200 hover:bg-gray-300"
                            >
                                ביטול
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
