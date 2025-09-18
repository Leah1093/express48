import React from "react";
import { useCartItemLogic } from "../../../hooks/useCartItemLogic";
import QuantityInput from "./QuantityInput";

export default function CartRow({ item }) {
  console.log("item",item)
  const {
    title, image, unitPrice, localQty,user,displayQty,id,
    handleAdd, handleRemove, handleRemoveCompletely,
    handleLocalChange, commitIfValid,handleChangeGuest,
  } = useCartItemLogic(item);

  const name = title || "מוצר ללא שם";
  const qtyNum = Number(displayQty || 0);

  return (
    <div className="grid grid-cols-12 items-center gap-3 border-b px-4 py-4 last:border-b-0">
      {/* מוצר: תמונה + שם */}
      <div className="col-span-6 flex items-center gap-4">
        <button
          onClick={handleRemoveCompletely}
          className="rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
          title="הסר"
        >
          ×
        </button>
        <img
          src={item.productId.images}
          alt={item.productId.title}
          className="h-16 w-16 rounded-lg border object-cover"
        />
        <div className="min-w-0">
          <div className="truncate font-medium text-gray-900">{item.productId.title}</div>
        </div>
      </div>

      {/* מחיר ליחידה */}
      <div className="col-span-2 text-center text-gray-800">
        {Number(unitPrice || 0).toLocaleString("he-IL")} ₪
      </div>

      {/* כמות: כפתורי +/- וקלט ידני */}
      {/* <div className="col-span-2 flex items-center justify-center gap-2">
        <button
          onClick={handleRemove}
          className="h-9 w-9 rounded-md border bg-white text-lg leading-none hover:bg-gray-50"
          title="הפחת"
        >
          −
        </button> */}

        {/* <input
          type="number"
          className="h-9 w-16 rounded-md border text-center"
          value={localQty}
          min={0}
          onChange={handleLocalChange}
          onBlur={commitIfValid}
        /> */}

        {/* <input type="number" min="1"
            value={user ? localQty : item.quantity}
            onChange={user ? handleLocalChange : (e) => handleChangeGuest(id, e)}
            onBlur={user ? commitIfValid : undefined}
            onKeyDown={user ? (e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                e.currentTarget.blur(); // יפעיל את onBlur => שולח ל-API
              }
            } : undefined}
            className="text-md w-6 text-center appearance-none [mozAppearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none" />

        <button
          onClick={handleAdd}
          className="h-9 w-9 rounded-md border bg-white text-lg leading-none hover:bg-gray-50"
          title="הוסף"
        >
          +
        </button>
      </div> */}
      <div className="col-span-2 flex items-center justify-center gap-2">
      <QuantityInput item={item} />
      </div>


      {/* סכום ביניים לשורה */}
      <div className="col-span-2 text-left font-semibold">
        {(Number(unitPrice || 0) * qtyNum).toLocaleString("he-IL")} ₪
      </div>
    </div>
  );
}
