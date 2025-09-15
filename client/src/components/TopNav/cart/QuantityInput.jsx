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
    <div className="col-span-2 flex items-center justify-center gap-2">
      <button
        onClick={handleRemove}
        className="h-9 w-9 rounded-md border bg-white text-lg leading-none hover:bg-gray-50"
        title="הפחת"
      >
        −
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
        className="text-md w-6 text-center appearance-none [mozAppearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
      />

      <button
        onClick={handleAdd}
        className="h-9 w-9 rounded-md border bg-white text-lg leading-none hover:bg-gray-50"
        title="הוסף"
      >
        +
      </button>
    </div>
  );
}
