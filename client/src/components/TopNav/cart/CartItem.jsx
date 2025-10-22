// import React from 'react';
// import { useDispatch } from 'react-redux';
// import {
//   increaseQuantity,
//   decreaseQuantity,
//   removeItem,
// } from "../../../redux/slices/cartSlice";

// const CartItem = ({ item }) => {
//   const dispatch = useDispatch();

//   return (
//     <div className="relative flex flex-row-reverse items-center border-b py-4 px-4 gap-4 text-right">
//       {/* כפתור X בפינה שמאלית עליונה */}
//       <button
//         onClick={() => dispatch(removeItem(item.id))}
//         className="absolute top-2 left-2 text-gray-500 hover:text-red-500 text-xl"
//       >
//         ×
//       </button>

//       {/* תמונת המוצר */}
//       <img
//         src={item.image}
//         alt={item.title}
//         className="w-20 h-20 object-contain"
//       />

//       {/* תוכן טקסטואלי: כותרת, כפתורים, מחיר */}
//       <div className="flex flex-col flex-1 text-black">
//         {/* כותרת בשתי שורות */}
//         <div>
//           <h4 className="text-md font-semibold leading-snug">{item.title}</h4>
//           <p className="text-sm text-gray-600">{item.subtitle}</p>
//         </div>

//         {/* כפתורי כמות */}
//         <div className="flex items-center justify-start mt-3 gap-2">
//           <button
//             onClick={() => dispatch(decreaseQuantity(item.id))}
//             className="border rounded px-3 py-1 text-lg font-bold"
//           >
//             -
//           </button>
//           <span className="text-md w-6 text-center">{item.quantity}</span>
//           <button
//             onClick={() => dispatch(increaseQuantity(item.id))}
//             className="border rounded px-3 py-1 text-lg font-bold"
//           >
//             +
//           </button>
//         </div>

//         {/* מחיר */}
//         <p className="text-blue-700 font-semibold mt-3 text-md">
//           ₪{item.price} × {item.quantity}
//         </p>
//       </div>
//     </div>
//   );
// };

// export default CartItem;

// import { useState, useEffect, useRef } from 'react';
// import { useDispatch, useSelector } from 'react-redux';
// import {
//   addItemAsync,
//   removeItemAsync,
//   clearCartAsync,
//   removeProductCompletelyThunk,
//   updateItemQuantityThunk
// } from "../../../redux/thunks/cartThunks";
// import {
//   clearGuestCart,
//   removeGuestItem,
//   addGuestItem,
//   removeGuestProductCompletely,
//   setGuestItemQuantity
// } from "../../../redux/slices/guestCartSlice";

// const getId = (x) => x?.productId?._id ?? x?.productId ?? x?._id;

// const CartItem = ({ item }) => {

//   // const [localQty, setLocalQty] = useState(item.quantity);
//   const dispatch = useDispatch();
//   const user = useSelector((state) => state.user.user);

//   const id = item._id || (item.product && item.product._id);
//   const idUser = typeof item.productId === 'object' ? item.productId._id : item.productId;

//   const productId = getId(item);

//   // 1) כמות מה-Redux (מקור אמת)
//   const qtyFromRedux = useSelector((state) => {
//     const i = state.cart.find((it) => getId(it) === productId);
//     return i?.quantity ?? 0;
//   });

//   // 2) סטייט מקומי להצגת input בזמן ההקלדה
//   const [localQty, setLocalQty] = useState(String(qtyFromRedux));

//   // 3) סנכרון Redux -> input בכל שינוי
//   useEffect(() => {
//     setLocalQty(String(qtyFromRedux));
//   }, [qtyFromRedux]);



// const handleRemove = () => {
//   if (user) {
//     dispatch(removeItemAsync(idUser));
//   } else {
//     dispatch(removeGuestItem(id));
//   }
// };

// const handleclearCart = () => {
//   if (user) {
//     dispatch(clearCartAsync(idUser));
//   } else {
//     dispatch(clearGuestCart(item));
//   }
// };

// const handleAdd = () => {
//   if (user) {
//     dispatch(addItemAsync(idUser));
//   } else {
//     dispatch(addGuestItem(item.product || item));
//   }
// };

// ====== כפתור איקס ======
// const handleRemoveCompletely = () => {
//   if (user) {
//     dispatch(removeProductCompletelyThunk(idUser));
//   } else {
//     dispatch(removeGuestProductCompletely(id));
//   }
// };

// const handleLocalChange = (e) => {
//   setLocalQty(e.target.value);
// };

// // שינוי ערך — לאורח שולחים מיד ל־Redux (localStorage)
// const handleChangeGuest = (productId, e) => {
//   const n = Number(e.target.value);
//   if (Number.isFinite(n) && n > 0) {
//     dispatch(setGuestItemQuantity({ productId: String(productId), quantity: n }));
//   }
// };


// const commitIfValid = () => {
//   if (isRemovingRef.current) return; // לא שולחים אם כרגע מסירים
//   cancelFlush();                    // ביטול כל debounce קיים
//   const qty = Number(localQty);
//   if (qty > 0) {
//     dispatch(updateItemQuantityThunk({
//       productId: item.productId._id || item.productId,
//       quantity: qty
//     }));
//   }
// };

// const FLUSH_MS = 300;
// const pendingQtyRef = useRef(null);
// const flushTimerRef = useRef(null);
// const isRemovingRef = useRef(false);

// // שליחה מרוכזת
// const flushQuantity = () => {
//   if (isRemovingRef.current) return;  // אם מסירים כרגע – לא שולחים
//   if (pendingQtyRef.current == null) return;  // אין שינוי ממתין
//   if (pendingQtyRef.current <= 0) { pendingQtyRef.current = null; return; }  // אם הכמות 0 – לא שולחים

//   dispatch(updateItemQuantityThunk({
//     productId: item.productId._id || item.productId,
//     quantity: pendingQtyRef.current
//   }));
//   pendingQtyRef.current = null;
// };
// // ====== תיימר ======
// const bufferQuantityChange = (newQty) => {
//   pendingQtyRef.current = newQty;
//   clearTimeout(flushTimerRef.current);
//   flushTimerRef.current = setTimeout(flushQuantity, FLUSH_MS);
// };

// // ====== כפתור פלוס ======
// const handleAdd = () => {
//   if (user) {
//     // שינוי מקומי מיידי
//     setLocalQty(prev => {
//       const updated = Number(prev) + 1;
//       bufferQuantityChange(updated);
//       return updated;
//     });
//   } else {
//     dispatch(addGuestItem(item.product || item));
//   }
// };

// const cancelFlush = () => {
//   clearTimeout(flushTimerRef.current);
//   flushTimerRef.current = null;
//   pendingQtyRef.current = null;
// };

// // ====== כפתור מינוס ======
// const handleRemove = () => {
//   if (user) {
//     setLocalQty(prev => {
//       const updated = Math.max(0, Number(prev) - 1);
//       if (updated === 0) {
//         isRemovingRef.current = true;   // <-- דגל
//         cancelFlush();                  // מבטל כל שליחה מושהית
//         dispatch(removeProductCompletelyThunk(idUser))
//           .finally(() => { isRemovingRef.current = false; });
//         return 0;
//       }
//       bufferQuantityChange(updated);
//       return updated;
//     });
//   } else {
//     dispatch(removeGuestItem(id));
//   }
// };

import { useCartItemLogic } from "../../../hooks/useCartItemLogic";

export default function CartItem({ item }) {
  const {
    user, displayQty, unitPrice, title, image,localQty,
    handleAdd, handleRemove, handleRemoveCompletely,
    handleLocalChange, handleChangeGuest, commitIfValid,
    id,setLocalQty,
  } = useCartItemLogic(item);

  return (
    <div className="relative flex flex-row-reverse items-center border-b py-4 px-4 gap-4 text-right">
      {/* כפתור מחיקה מוחלטת */}
      <button
        onClick={handleRemoveCompletely}
        className="absolute top-2 left-2 text-gray-500 hover:text-red-500 text-xl"
      >
        ×
      </button>

      {/* תמונה */}
      <img
        src={item.productId.images}
        alt={item.productId.title}
        className="w-20 h-20 object-contain"
      />

      {/* פרטים */}
      <div className="flex flex-col flex-1 text-black">
        <div>
          <h4 className="text-md font-semibold leading-snug">
            {item.productId.title}
          </h4>
        </div>

        <div className="flex items-center justify-start mt-3 gap-2">
          <button
            // type="button"
            // onMouseDown={e => e.preventDefault()}
            onClick={handleRemove}
            className="border rounded px-3 py-1 text-lg font-bold"
          >
            -
          </button>
          {/* <span className="text-md w-6 text-center">{item.quantity}</span> */}
          <input type="number" min="1"
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
            // type="button"
            // onMouseDown={e => e.preventDefault()}
            onClick={handleAdd}
            className="border rounded px-3 py-1 text-lg font-bold"
          >
            +
          </button>
        </div>

        <p className="text-blue-700 font-semibold mt-3 text-md">
          {/* ₪{item.productId.price.amount} × {item.quantity} */}
          ₪{item.productId?.price?.amount ?? 0} × {item.quantity}

        </p>
      </div>
    </div>
  );
};



