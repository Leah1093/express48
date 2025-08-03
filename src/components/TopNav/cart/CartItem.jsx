
import React from 'react';
import { useDispatch } from 'react-redux';
import { increaseQuantity, decreaseQuantity, removeItem } from "../../../redux/slices/cartSlice";

const CartItem = ({ item }) => {
  const dispatch = useDispatch();

  return (
    <div className="flex justify-between items-center py-2 border-b px-4">
      <div>
        <h4 className="font-medium">{item.name}</h4>
        <p className="text-sm text-gray-600">₪{item.price} × {item.quantity}</p>
      </div>
      <div className="flex items-center gap-2">
        <button onClick={() => dispatch(decreaseQuantity(item.id))}>➖</button>
        <span>{item.quantity}</span>
        <button onClick={() => dispatch(increaseQuantity(item.id))}>➕</button>
        <button onClick={() => dispatch(removeItem(item.id))} className="ml-4 text-red-500">🗑️</button>
      </div>
    </div>
  );
};

export default CartItem;
