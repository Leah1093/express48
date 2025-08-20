import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import CartItem from "./CartItem";
import { getLocalCart } from "../../../helpers/localCart";
import { useNavigate } from "react-router-dom";
import CartItemsTable from "./CartItemsTable"
import { selectCartSubtotal, selectCartItems } from "../../../redux/slices/cartSelectors"; // הנתיב בהתאם לפרויקט

function CartDrawer({ isOpen, onClose }) {
  const navigate = useNavigate();

  // const user = useSelector((state) => state.user.user);
  // const reduxCart = useSelector((state) => state.cart);
  // const guestCart = useSelector((state) => state.guestCart);

  // // קבלת פריטי העגלה לפי מצב משתמש/אורח
  // const cartItems = Array.isArray(user ? reduxCart : guestCart)
  //   ? (user ? reduxCart : guestCart)
  //   : [];

  // חישוב סכום ביניים (price * quantity) עם גיבויים לשדות נפוצים
  //  const subtotal = cartItems.reduce((sum, item) => {
  //   const price =
  //     Number(item?.price ?? item?.product?.price ?? item?.productId?.price ?? 0);
  //   const qty = Number(item?.quantity ?? item?.qty ?? 1);
  //   return sum + price * qty;
  // }, 0);
  //   const subtotal = (cartItems ?? []).reduce((sum, item) => {
  //   const price = Number(item?.unitPrice ?? 0);     // להשתמש ב־unitPrice
  //   const qty   = Number(item?.quantity ?? item?.qty ?? 1);
  //   return sum + price * qty;
  // }, 0);
  const cartItems = useSelector(selectCartItems);
  const subtotal = useSelector(selectCartSubtotal);
  const formatILS = (n) =>
    Number(n).toLocaleString("he-IL", { style: "currency", currency: "ILS" });

  return (
    <div className={`fixed top-0 left-0 h-full w-full sm:w-[400px] bg-white shadow-lg z-50 transition-transform duration-300 ease-in-out overflow-y-auto ${isOpen ? "translate-x-0" : "-translate-x-full"}`}>
      {/* Header */}
      <div className="flex justify-between items-center px-4 py-4 border-b">
        <h2 className="text-lg font-semibold text-black">עגלת קניות</h2>
        <button onClick={onClose} className="text-gray-500 hover:text-black">×</button>
      </div>

      <hr className="my-4 border-gray-300" />

      {cartItems.length === 0 ? (
        <div className="flex flex-col justify-center items-center h-[calc(100%-64px)] text-center px-4">
          <img src="https://cdn-icons-png.flaticon.com/512/833/833314.png" alt="עגלת קניות ריקה" className="w-20 h-20 mb-4 opacity-20" />
          <p className="text-gray-700 mb-4">אין מוצרים בסל הקניות.</p>
          <button onClick={onClose} className="bg-[#0c2f52] text-white px-4 py-2 rounded-md hover:bg-[#0a2743] transition">חזור לחנות</button>
        </div>
      ) : (
        <div className="overflow-y-auto max-h-[calc(100%-64px)]">
          <CartItemsTable itemComponent={CartItem} />
          {/* {cartItems.map((item) => (
            <CartItem key={
              item._id ||
              (item.product && item.product._id) ||
              (typeof item.productId === 'object' ? item.productId._id : item.productId)
            } item={item} />
          ))} */}
        </div>
      )}

      <hr className="my-4 border-gray-300" />

      {/* פוטר סכום ביניים + כפתורים */}
      <div className="px-4 pt-3 pb-6 border-t bg-white">
        {/* סכום ביניים */}
        <div className="flex items-center justify-between mb-2">
          <span className="text-[18px] font-bold text-[#2e5bd1]">
            סכום ביניים:
          </span>
          <span className="text-[20px] font-semibold text-black">
            {formatILS(subtotal)}
          </span>
        </div>

        {/* טקסט זכאות למשלוח חינם */}
        {subtotal >= 1500 && (
          <p className="text-center text-gray-700 mb-2">
            ההזמנה שלך זכאית למשלוח חינם!
          </p>
        )}

        {/* פס כחול מפוספס */}
        <div
          className="w-full h-3 rounded-md mb-4"
          style={{
            backgroundColor: "#0c2f52",
            backgroundImage:
              "repeating-linear-gradient(45deg, rgba(255,255,255,0.25) 0 10px, transparent 10px 20px)",
          }}
        />

        {/* כפתור מעבר לסל הקניות */}
        <button
          type="button"
          onClick={() => navigate("/cart")}
          className="w-full py-3 rounded-md text-white font-semibold mb-3 transition
                     bg-[#ED6A23] hover:brightness-95 active:brightness-90"
        >
          מעבר לסל הקניות
        </button>

        {/* כפתור תשלום */}
        <button
          type="button"
          onClick={() => navigate("/checkout")}
          className="w-full py-3 rounded-md text-white font-semibold transition
                     bg-[#0c2f52] hover:bg-[#0a2743]"
        >
          תשלום
        </button>
      </div>

    </div>
  );
}

export default CartDrawer;
