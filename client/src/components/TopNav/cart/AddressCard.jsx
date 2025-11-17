import { useState } from "react";
import { Pencil, ChevronLeft } from "lucide-react";
import AddressListModal from "./AddressListModal";

export default function AddressCard({ user, address, addresses }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingAddress, setEditingAddress] = useState(null);

    return (
        <div className="relative">
            {/*  כותרת שינוי כתובת מעל המלבן */}
            <div
                className="flex items-center justify-end gap-1 cursor-pointer mb-3 text-sm lg:text-base text-gray-600 hover:text-[#ED6A23] transition-colors"
                onClick={() => {
                    setIsModalOpen(true)
                    setEditingAddress(null);   // מאפס עריכה
                }}
            >
                <span className="font-medium">שינוי כתובת</span>
                <ChevronLeft size={18} className="text-gray-600" />
            </div>

            {/* 🔹 מלבן הכתובת */}
            <div className="border-2 border-gray-200 rounded-2xl shadow-sm bg-white p-6 lg:p-8 relative hover:border-gray-300 transition-colors">
                {/* אייקון עריכה קטן בתוך המלבן */}
                <button
                    onClick={() => {
                        setEditingAddress(address); // הכתובת הספציפית מהכרטיס
                        setIsModalOpen(true);       // פותח את המודל
                    }}
                    className="absolute top-4 left-4 text-gray-400 hover:text-[#ED6A23] transition-colors bg-gray-50 p-2 rounded-lg hover:bg-orange-50"
                >
                    <Pencil size={18} />
                </button>

                {/* שם + טלפון */}
                <div className="font-bold text-lg lg:text-xl text-gray-900 mb-1">{user?.username || "שבי פלדמן"}</div>
                <div className="text-gray-600 mb-4 text-base lg:text-lg">{user?.phone || "0556791242"}</div>

                {/* כתובת */}
                {address ? (
                    <>
                        <div className="text-gray-800 font-medium mb-1 text-base lg:text-lg">{address.street}</div>
                        <div className="text-gray-600 text-base">
                            {address.city}, {address.zip}, {address.country}
                        </div>
                    </>
                ) : (
                    <div className="text-gray-500 text-center py-4 bg-gray-50 rounded-lg">
                        לא הוגדרה כתובת למשלוח
                    </div>
                )}
            </div>

            {/* 🔹 מודל בחירת כתובות */}
            {isModalOpen && (
                <AddressListModal
                    addresses={addresses}
                    onClose={() => setIsModalOpen(false)}
                    initialEditingAddress={editingAddress}
                />
            )}
        </div>
    );
}
