// import React, { useEffect, useState } from 'react';
// import { useSelector } from 'react-redux';
// import CartItem from "./CartItem";
// import { getLocalCart } from "../../../helpers/localCart";
// import { useNavigate } from "react-router-dom";
// import CartItemsTable from "./CartItemsTable"
// import { selectCartSubtotal, selectCartItems } from "../../../redux/slices/cartSelectors"; // הנתיב בהתאם לפרויקט

// function CartDrawer({ isOpen, onClose }) {
//   const navigate = useNavigate();

//   // const user = useSelector((state) => state.user.user);
//   // const reduxCart = useSelector((state) => state.cart);
//   // const guestCart = useSelector((state) => state.guestCart);

//   // // קבלת פריטי העגלה לפי מצב משתמש/אורח
//   // const cartItems = Array.isArray(user ? reduxCart : guestCart)
//   //   ? (user ? reduxCart : guestCart)
//   //   : [];

//   // חישוב סכום ביניים (price * quantity) עם גיבויים לשדות נפוצים
//   //  const subtotal = cartItems.reduce((sum, item) => {
//   //   const price =
//   //     Number(item?.price ?? item?.product?.price ?? item?.productId?.price ?? 0);
//   //   const qty = Number(item?.quantity ?? item?.qty ?? 1);
//   //   return sum + price * qty;
//   // }, 0);
//   //   const subtotal = (cartItems ?? []).reduce((sum, item) => {
//   //   const price = Number(item?.unitPrice ?? 0);     // להשתמש ב־unitPrice
//   //   const qty   = Number(item?.quantity ?? item?.qty ?? 1);
//   //   return sum + price * qty;
//   // }, 0);
//   const cartItems = useSelector(selectCartItems);
//   const subtotal = useSelector(selectCartSubtotal);
//   const formatILS = (n) =>
//     Number(n).toLocaleString("he-IL", { style: "currency", currency: "ILS" });

//   return (
//     <div className={`fixed top-0 left-0 h-full w-full sm:w-[400px] bg-white shadow-lg z-50 transition-transform duration-300 ease-in-out overflow-y-auto ${isOpen ? "translate-x-0" : "-translate-x-full"}`}>
//       {/* Header */}
//       <div className="flex justify-between items-center px-4 py-4 border-b">
//         <h2 className="text-lg font-semibold text-black">עגלת קניות</h2>
//         <button onClick={onClose} className="text-gray-500 hover:text-black">×</button>
//       </div>

//       <hr className="my-4 border-gray-300" />

//       {cartItems.length === 0 ? (
//         <div className="flex flex-col justify-center items-center h-[calc(100%-64px)] text-center px-4">
//           <img src="https://cdn-icons-png.flaticon.com/512/833/833314.png" alt="עגלת קניות ריקה" className="w-20 h-20 mb-4 opacity-20" />
//           <p className="text-gray-700 mb-4">אין מוצרים בסל הקניות.</p>
//           <button onClick={onClose} className="bg-[#0c2f52] text-white px-4 py-2 rounded-md hover:bg-[#0a2743] transition">חזור לחנות</button>
//         </div>
//       ) : (
//         <div className="overflow-y-auto max-h-[calc(100%-64px)]">
//           <CartItemsTable itemComponent={CartItem} />
//           {/* {cartItems.map((item) => (
//             <CartItem key={
//               item._id ||
//               (item.product && item.product._id) ||
//               (typeof item.productId === 'object' ? item.productId._id : item.productId)
//             } item={item} />
//           ))} */}
//         </div>
//       )}

//       <hr className="my-4 border-gray-300" />

//       {/* פוטר סכום ביניים + כפתורים */}
//       <div className="px-4 pt-3 pb-6 border-t bg-white">
//         {/* סכום ביניים */}
//         <div className="flex items-center justify-between mb-2">
//           <span className="text-[18px] font-bold text-[#2e5bd1]">
//             סכום ביניים:
//           </span>
//           <span className="text-[20px] font-semibold text-black">
//             {formatILS(subtotal)}
//           </span>
//         </div>

//         {/* טקסט זכאות למשלוח חינם */}
//         {subtotal >= 1500 && (
//           <p className="text-center text-gray-700 mb-2">
//             ההזמנה שלך זכאית למשלוח חינם!
//           </p>
//         )}

//         {/* פס כחול מפוספס */}
//         <div
//           className="w-full h-3 rounded-md mb-4"
//           style={{
//             backgroundColor: "#0c2f52",
//             backgroundImage:
//               "repeating-linear-gradient(45deg, rgba(255,255,255,0.25) 0 10px, transparent 10px 20px)",
//           }}
//         />

//         {/* כפתור מעבר לסל הקניות */}
//         <button
//           type="button"
//           onClick={() => navigate("/cart")}
//           className="w-full py-3 rounded-md text-white font-semibold mb-3 transition
//                      bg-[#ED6A23] hover:brightness-95 active:brightness-90"
//         >
//           מעבר לסל הקניות
//         </button>

//         {/* כפתור תשלום */}
//         <button
//           type="button"
//           onClick={() => navigate("/checkout")}
//           className="w-full py-3 rounded-md text-white font-semibold transition
//                      bg-[#0c2f52] hover:bg-[#0a2743]"
//         >
//           תשלום
//         </button>
//       </div>

//     </div>
//   );
// }

// export default CartDrawer;



// src/components/TopNav/cart/CartDrawer.jsx
import React, { useState, useCallback } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

// *** השארת הלוגיקה שלך ללא שינוי ***
import CartItem from "./CartItem";
import CartItemsTable from "./CartItemsTable";
import {
  selectCartItems,
  selectCartSubtotal,
} from "../../../redux/slices/cartSelectors";

export default function CartDrawer({ isOpen, onClose }) {
  const navigate = useNavigate();
  const cartItems = useSelector(selectCartItems) || [];
  const totalSubtotal = useSelector(selectCartSubtotal) || 0;
  
  const [selectedSubtotal, setSelectedSubtotal] = useState(totalSubtotal);

  // פונקציה לחישוב המחיר של המוצרים שנבחרו
  const handleSelectedItemsChange = useCallback((selectedIds, selectionMap) => {
    const selected = cartItems.reduce((sum, item) => {
      const itemId = item._id || item.productId?._id || item.productId;
      if (selectionMap[itemId]) {
        const price = Number(item?.unitPrice ?? 0);
        const qty = Number(item?.quantity ?? item?.qty ?? 1);
        return sum + (price * qty);
      }
      return sum;
    }, 0);
    setSelectedSubtotal(selected);
  }, [cartItems]);

  // צבעים לפי הפיגמה
  const NAVY = "#0C2F52";
  const ORANGE = "#ED6A23";
  const BORDER = "#E6E6E6";
  const SUB = "#6B7280";
  const TEXT = "#141414";

  const formatILS = (n) =>
    Number(n).toLocaleString("he-IL", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <div
      className={`fixed inset-0 z-50 ${
        isOpen ? "pointer-events-auto" : "pointer-events-none"
      }`}
      dir="rtl"
    >
      {/* רקע */}
      <div
        className={`absolute inset-0 bg-black/30 transition ${
          isOpen ? "opacity-100" : "opacity-0"
        }`}
        onClick={onClose}
        aria-hidden
      />

      {/* המגירה משמאל */}
      <aside
        className={`absolute left-0 w-full sm:w-[380px] bg-white transition-transform duration-300 ease-in-out flex flex-col sm:rounded-tr-[16px] ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        style={{
          top: '64px',
          bottom: 0,
          boxShadow: '0px 10px 14px 0px rgba(15, 42, 81, 0.03)',
          maxHeight: 'calc(100vh - 64px)'
        }}
        role="dialog"
        aria-label="סל הקניות שלי"
      >
        {/* כותרת + X */}
        <div className="flex-shrink-0 flex items-center justify-between px-5 py-4 bg-white border-b" style={{ borderColor: BORDER }}>
          {/* ספייסר משמאל */}
          <div className="w-9"></div>

          {/* כותרת */}
          <h2 className="text-[17px] font-bold flex-1 text-center" style={{ color: TEXT }}>
            סל הקניות שלי
          </h2>

          {/* כפתור X בצד ימין (RTL) - בולט ומודגש */}
          <button
            onClick={onClose}
            className="flex items-center justify-center w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors cursor-pointer"
            aria-label="סגירה"
            title="סגירת העגלה"
            type="button"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#141414" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        {/* גוף העגלה */}
        <div className="flex-1 overflow-y-auto">
          {cartItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center px-6">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#E5E7EB" strokeWidth="1.5" className="mb-4">
                <circle cx="9" cy="21" r="1"></circle>
                <circle cx="20" cy="21" r="1"></circle>
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
              </svg>
              <p className="text-[14px] mb-2" style={{ color: SUB }}>
                העגלה שלך ריקה
              </p>
              <p className="text-[12px]" style={{ color: SUB }}>
                הוסף מוצרים כדי להמשיך
              </p>
            </div>
          ) : (
            <CartItemsTable 
              itemComponent={CartItem} 
              onSelectedItemsChange={handleSelectedItemsChange}
            />
          )}
        </div>

        {/* פוטר */}
        <div
          className="flex-shrink-0 px-6 pt-4 pb-6 bg-white border-t"
          style={{ borderColor: BORDER }}
        >
          {/* סכום ביניים */}
          <div className="flex items-center justify-between mb-4">
            <span className="text-[14px] font-medium" style={{ color: SUB }}>
              סכום ביניים:
            </span>
            <span
              className="text-[20px] font-bold"
              style={{ color: NAVY }}
            >
              ₪{formatILS(selectedSubtotal)}
            </span>
          </div>

          {/* כפתורים */}
          <div className="flex gap-3">
            <button
              type="button"
              className="flex-1 h-12 rounded-[12px] text-[15px] font-semibold bg-white hover:bg-[#F6F7FA] transition-all cursor-pointer"
              style={{ color: NAVY, border: `1.5px solid ${NAVY}` }}
              onClick={() => {
                onClose?.();
                navigate("/");
              }}
            >
              המשך בקניות
            </button>
            <button
              type="button"
              className="flex-1 h-12 rounded-[12px] text-white text-[15px] font-semibold hover:brightness-95 active:brightness-90 transition-all cursor-pointer"
              style={{ backgroundColor: ORANGE }}
              onClick={() => {
                onClose?.();
                navigate("/cart");
              }}
            >
              מעבר לעגלת קניות
            </button>

            
          </div>
        </div>
      </aside>
    </div>
  );
}
