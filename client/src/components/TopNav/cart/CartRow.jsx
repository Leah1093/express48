import React, { useState } from "react";
import { useCartItemLogic } from "../../../hooks/useCartItemLogic";
import QuantityInput from "./QuantityInput";

export default function CartRow({ item, isMobile = false }) {
  const {
    unitPrice,
    handleRemoveCompletely,
  } = useCartItemLogic(item);

  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const confirmDelete = () => {
    handleRemoveCompletely();
    setShowDeleteModal(false);
  };

  // 📱 פריסה מובייל
  if (isMobile) {
    return (
      <>
        <div className="flex gap-3" dir="rtl">
          {/* תמונה משמאל */}
          <div className="flex-shrink-0">
            <img
              src={item.snapshot?.images?.[0]}
              alt={item.productId.title}
              className="h-16 w-16 rounded-lg object-cover"
            />
          </div>

          {/* פרטי המוצר */}
          <div className="flex-1 min-w-0">
            {/* שם + מחיר */}
            <h3 className="font-medium text-gray-900 text-sm mb-1 truncate">
              {item.productId.title}
            </h3>
            <p className="text-base font-bold text-gray-900 mb-2">
              ₪{Number(unitPrice || 0).toLocaleString("he-IL")}
            </p>

            {/* כמות */}
            <div className="flex items-center justify-between">
              <QuantityInput item={item} />
              
              {/* כפתור מחיקה */}
              <button
                onClick={() => setShowDeleteModal(true)}
                className="p-1.5 text-white bg-[#ED6A23] hover:brightness-110 transition-all rounded-lg cursor-pointer"
                title="הסר מוצר"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="3 6 5 6 21 6" />
                  <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                  <path d="M10 11v6" />
                  <path d="M14 11v6" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* פופאפ אישור מחיקה */}
        {showDeleteModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => setShowDeleteModal(false)}>
            <div 
              className="bg-white rounded-2xl shadow-2xl p-6 max-w-md w-full mx-4 transform transition-all"
              onClick={(e) => e.stopPropagation()}
            >
              {/* אייקון */}
              <div className="flex justify-center mb-4">
                <div className="bg-orange-100 rounded-full p-3">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#ED6A23" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="3 6 5 6 21 6" />
                    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                    <path d="M10 11v6" />
                    <path d="M14 11v6" />
                  </svg>
                </div>
              </div>

              {/* כותרת */}
              <h3 className="text-xl font-bold text-center text-gray-900 mb-2">
                האם למחוק את המוצר?
              </h3>
              
              {/* תיאור */}
              <p className="text-center text-gray-600 mb-6">
                {item.productId.title}
              </p>

              {/* כפתורים */}
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="flex-1 px-4 py-3 rounded-xl border-2 border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 transition-colors"
                >
                  ביטול
                </button>
                <button
                  onClick={confirmDelete}
                  className="flex-1 px-4 py-3 rounded-xl bg-[#ED6A23] text-white font-semibold hover:brightness-110 transition-colors"
                >
                  מחק
                </button>
              </div>
            </div>
          </div>
        )}
      </>
    );
  }

  // 🖥️ פריסה דסקטופ

  return (
    <>
      <div className="flex items-center gap-4" dir="rtl">
        {/* תמונה בצד ימין */}
        <div className="flex-shrink-0">
          <img
            src={item.snapshot?.images?.[0]}
            alt={item.productId.title}
            className="h-20 w-20 rounded-lg object-cover"
          />
        </div>

        {/* שם המוצר */}
        <div className="flex-1 text-right">
          <h3 className="font-medium text-gray-900">
            {item.productId.title}
          </h3>
        </div>

        {/* מחיר */}
        <div className="text-center min-w-[80px]">
          <p className="text-lg font-bold text-gray-900">
            ₪{Number(unitPrice || 0).toLocaleString("he-IL")}
          </p>
        </div>

        {/* כמות */}
        <div className="flex-shrink-0">
          <QuantityInput item={item} />
        </div>

        {/* כפתור מחיקה */}
        <div className="flex-shrink-0">
          <button
            onClick={() => setShowDeleteModal(true)}
            className="p-2 text-gray-400 hover:text-[#ED6A23] transition-colors cursor-pointer"
            title="הסר מוצר"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
              <path d="M10 11v6" />
              <path d="M14 11v6" />
            </svg>
          </button>
        </div>
      </div>

      {/* פופאפ אישור מחיקה */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => setShowDeleteModal(false)}>
          <div 
            className="bg-white rounded-2xl shadow-2xl p-6 max-w-md w-full mx-4 transform transition-all"
            onClick={(e) => e.stopPropagation()}
          >
            {/* אייקון */}
            <div className="flex justify-center mb-4">
              <div className="bg-orange-100 rounded-full p-3">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#ED6A23" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="3 6 5 6 21 6" />
                  <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                  <path d="M10 11v6" />
                  <path d="M14 11v6" />
                </svg>
              </div>
            </div>

            {/* כותרת */}
            <h3 className="text-xl font-bold text-center text-gray-900 mb-2">
              האם למחוק את המוצר?
            </h3>
            
            {/* תיאור */}
            <p className="text-center text-gray-600 mb-6">
              {item.productId.title}
            </p>

            {/* כפתורים */}
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 px-4 py-3 rounded-xl border-2 border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 transition-colors"
              >
                ביטול
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 px-4 py-3 rounded-xl bg-[#ED6A23] text-white font-semibold hover:brightness-110 transition-colors"
              >
                מחק
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
