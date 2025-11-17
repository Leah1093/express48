import React from "react";
import { useCartItemLogic } from "../../../hooks/useCartItemLogic";

export default function QuantityInput({ item }) {
  const {
    user,
    localQty,
    id,
    handleAdd,
    handleRemove,
    handleLocalChange,
    handleChangeGuest,
    commitIfValid,
  } = useCartItemLogic(item);

  return (
    <div className="flex items-center gap-1.5 lg:gap-2 bg-white border border-gray-300 rounded-lg px-1.5 lg:px-2 py-1">
      <button
        onClick={handleAdd}
        className="w-6 h-6 lg:w-7 lg:h-7 flex items-center justify-center text-gray-700 hover:bg-gray-100 transition-colors rounded"
        title="הוסף"
      >
        <span className="text-base lg:text-lg font-medium">+</span>
      </button>

      <input
        type="number"
        min="1"
        value={user ? localQty : item.quantity}
        onChange={user ? handleLocalChange : (e) => handleChangeGuest(id, e)}
        onBlur={user ? commitIfValid : undefined}
        onKeyDown={
          user
            ? (e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  e.currentTarget.blur();
                }
              }
            : undefined
        }
        className="w-7 lg:w-8 text-center text-sm lg:text-base font-medium appearance-none bg-transparent border-0 focus:outline-none [mozAppearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
      />

      <button
        onClick={handleRemove}
        className="w-6 h-6 lg:w-7 lg:h-7 flex items-center justify-center text-gray-700 hover:bg-gray-100 transition-colors rounded"
        title="הפחת"
      >
        <span className="text-base lg:text-lg font-medium">−</span>
      </button>
    </div>
  );
}
