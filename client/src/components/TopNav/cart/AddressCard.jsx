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
                className="flex items-center justify-end  gap-1 cursor-pointer mb-2 text-sm text-gray-600"
                onClick={() => {
                    setIsModalOpen(true)
                    setEditingAddress(null);   // מאפס עריכה
                }}
            >
                <span>שינוי כתובת</span>
                <ChevronLeft size={16} className="text-gray-600" />
            </div>

            {/* 🔹 מלבן הכתובת */}
            <div className="border rounded-lg shadow-sm bg-white p-4 relative">
                {/* אייקון עריכה קטן בתוך המלבן */}
                <button
                    onClick={() => {
                        setEditingAddress(address); // הכתובת הספציפית מהכרטיס
                        setIsModalOpen(true);       // פותח את המודל
                    }}
                    className="absolute top-3 left-3 text-gray-500 hover:text-gray-700"
                >
                    <Pencil size={18} />
                </button>

                {/* שם + טלפון */}
                <div className="font-semibold text-lg">{user?.username}</div>
                <div className="text-gray-600 mb-2">{user?.phone}</div>

                {/* כתובת */}
                <div className="text-gray-800">{address?.street}</div>
                <div className="text-gray-600">
                    {address?.city}, {address?.zip}, {address?.country}
                </div>
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
