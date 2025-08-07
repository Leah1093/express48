import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import CartItem from "./CartItem";
import { getLocalCart } from "../../../helpers/localCart";

function CartDrawer({ isOpen, onClose }) {

  const user = useSelector((state) => state.user.user);
  const reduxCart = useSelector((state) => state.cart);
  const guestCart = useSelector((state) => state.guestCart);

  const cartItems = user ? reduxCart : guestCart;


  return (
    <div className={`fixed top-0 left-0 h-full w-full sm:w-[400px] bg-white shadow-lg z-50 transition-transform duration-300 ease-in-out ${isOpen ? "translate-x-0" : "-translate-x-full"}`}>
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
          {cartItems.map((item) => (
            <CartItem key={
              item._id ||
              (item.product && item.product._id) ||
              (typeof item.productId === 'object' ? item.productId._id : item.productId)
            } item={item} />
          ))}
        </div>
      )}
    </div>
  );
}

export default CartDrawer;
