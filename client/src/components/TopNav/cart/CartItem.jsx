import React from 'react';
import { useDispatch } from 'react-redux';
import {
  increaseQuantity,
  decreaseQuantity,
  removeItem,
} from "../../../redux/slices/cartSlice";

const CartItem = ({ item }) => {
  const dispatch = useDispatch();

  return (
    <div className="relative flex flex-row-reverse items-center border-b py-4 px-4 gap-4 text-right">
      {/* כפתור X בפינה שמאלית עליונה */}
      <button
        onClick={() => dispatch(removeItem(item.id))}
        className="absolute top-2 left-2 text-gray-500 hover:text-red-500 text-xl"
      >
        ×
      </button>

      {/* תמונת המוצר */}
      <img
        src={item.image}
        alt={item.title}
        className="w-20 h-20 object-contain"
      />

      {/* תוכן טקסטואלי: כותרת, כפתורים, מחיר */}
      <div className="flex flex-col flex-1 text-black">
        {/* כותרת בשתי שורות */}
        <div>
          <h4 className="text-md font-semibold leading-snug">{item.title}</h4>
          <p className="text-sm text-gray-600">{item.subtitle}</p>
        </div>

        {/* כפתורי כמות */}
        <div className="flex items-center justify-start mt-3 gap-2">
          <button
            onClick={() => dispatch(decreaseQuantity(item.id))}
            className="border rounded px-3 py-1 text-lg font-bold"
          >
            -
          </button>
          <span className="text-md w-6 text-center">{item.quantity}</span>
          <button
            onClick={() => dispatch(increaseQuantity(item.id))}
            className="border rounded px-3 py-1 text-lg font-bold"
          >
            +
          </button>
        </div>

        {/* מחיר */}
        <p className="text-blue-700 font-semibold mt-3 text-md">
          ₪{item.price} × {item.quantity}
        </p>
      </div>
    </div>
  );
};

export default CartItem;
