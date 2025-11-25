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

// import { useCartItemLogic } from "../../../hooks/useCartItemLogic";

// export default function CartItem({ item }) {
// <<<<<<< HEAD
//   console.log("item", item);
// =======
// >>>>>>> 09f9d3e93b71ea13f78e0f5427133a8dd3e1f9d4
//   const {
//     user, displayQty, unitPrice, title, image, localQty,
//     handleAdd, handleRemove, handleRemoveCompletely,
//     handleLocalChange, handleChangeGuest, commitIfValid,
//     id, setLocalQty,
//   } = useCartItemLogic(item);

//   // --- ✨ לוגיקה להצגת פרטי וריאציה אם קיימת ✨ ---
//   const variationTitle = item.snapshot?.attributes?.color || item.snapshot?.attributes?.size;
//   const variationImage = item.snapshot?.images?.[0] || item.productId?.images?.[0];
//   const variationPrice = item.snapshot?.price || item.productId?.price?.amount;

//   return (
//     <div className="relative flex flex-row-reverse items-center border-b py-4 px-4 gap-4 text-right">
//       {/* כפתור מחיקה מוחלטת */}
//       <button
//         onClick={handleRemoveCompletely}
//         className="absolute top-2 left-2 text-gray-500 hover:text-red-500 text-xl"
//       >
//         ×
//       </button>

//       {/* תמונה */}
//       <img
//         src={variationImage}
//         alt={item.productId.title}
//         className="w-20 h-20 object-contain"
//       />

//       {/* פרטים */}
//       <div className="flex flex-col flex-1 text-black">
//         <div>
//           <h4 className="text-md font-semibold leading-snug">
//             {item.productId.title}
//           </h4>
//           {/* שם הווריאציה אם קיימת */}
//           {item.snapshot?.attributes && (
//             <p className="text-sm text-gray-600">
//               {" "}
//               {Object.entries(item.snapshot?.attributes || {})
//                 .map(([key, value]) => `${key}: ${value}`)
//                 .join(", ")}
//             </p>
//           )}

//         </div>

//         <div className="flex items-center justify-start mt-3 gap-2">
//           <button
//             // type="button"
//             // onMouseDown={e => e.preventDefault()}
//             onClick={handleRemove}
//             className="border rounded px-3 py-1 text-lg font-bold"
//           >
//             -
//           </button>
//           {/* <span className="text-md w-6 text-center">{item.quantity}</span> */}
//           <input type="number" min="1"
//             value={user ? localQty : item.quantity}
//             onChange={user ? handleLocalChange : (e) => handleChangeGuest(id, e)}
//             onBlur={user ? commitIfValid : undefined}
//             onKeyDown={user ? (e) => {
//               if (e.key === "Enter") {
//                 e.preventDefault();
//                 e.currentTarget.blur(); // יפעיל את onBlur => שולח ל-API
//               }
//             } : undefined}
//             className="text-md w-6 text-center appearance-none [mozAppearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none" />
//           <button
//             // type="button"
//             // onMouseDown={e => e.preventDefault()}
//             onClick={handleAdd}
//             className="border rounded px-3 py-1 text-lg font-bold"
//           >
//             +
//           </button>
//         </div>

//         <p className="text-blue-700 font-semibold mt-3 text-md">
//           {/* ₪{item.productId.price.amount} × {item.quantity} */}
//           ₪{variationPrice} × {item.quantity}

//         </p>
//       </div>
//     </div>
//   );
// };







// // src/components/TopNav/cart/CartItem.jsx
// import { useCartItemLogic } from "../../../hooks/useCartItemLogic";

// export default function CartItem({ item }) {
//   const {
//     user, displayQty, unitPrice, title, image, localQty,
//     handleAdd, handleRemove, handleRemoveCompletely,
//     handleLocalChange, handleChangeGuest, commitIfValid,
//     id, setLocalQty,
//   } = useCartItemLogic(item);

//   // פרטי וריאציה אם קיימת
//   const variationTitle = item.snapshot?.attributes?.color || item.snapshot?.attributes?.size;
//   const variationImage = item.snapshot?.images?.[0] || item.productId?.images?.[0];
//   const variationPrice = item.snapshot?.price || item.productId?.price?.amount;

//   return (
//     <div className="relative flex flex-row-reverse items-center border-b py-4 px-4 gap-4 text-right">
//       {/* מחיקה מוחלטת */}
//       <button
//         onClick={handleRemoveCompletely}
//         className="absolute top-2 left-2 text-gray-500 hover:text-red-500 text-xl"
//         aria-label="הסרת פריט"
//       >
//         ×
//       </button>

//       {/* תמונה */}
//       <img
//         src={variationImage}
//         alt={item.productId?.title || "מוצר"}
//         className="w-20 h-20 object-contain"
//       />

//       {/* פרטים */}
//       <div className="flex flex-col flex-1 text-black">
//         <div>
//           <h4 className="text-md font-semibold leading-snug">
//             {item.productId?.title}
//           </h4>

//           {/* שם הווריאציה אם קיימת */}
//           {item.snapshot?.attributes && (
//             <p className="text-sm text-gray-600">
//               {Object.entries(item.snapshot.attributes)
//                 .map(([key, value]) => `${key}: ${value}`)
//                 .join(", ")}
//             </p>
//           )}
//         </div>

//         <div className="flex items-center justify-start mt-3 gap-2">
//           <button
//             onClick={handleRemove}
//             className="border rounded px-3 py-1 text-lg font-bold"
//             aria-label="הפחת כמות"
//           >
//             -
//           </button>

//           <input
//             type="number"
//             min="1"
//             value={user ? localQty : item.quantity}
//             onChange={user ? handleLocalChange : (e) => handleChangeGuest(id, e)}
//             onBlur={user ? commitIfValid : undefined}
//             onKeyDown={
//               user
//                 ? (e) => {
//                     if (e.key === "Enter") {
//                       e.preventDefault();
//                       e.currentTarget.blur(); // מפעיל onBlur ושולח ל־API
//                     }
//                   }
//                 : undefined
//             }
//             className="text-md w-10 text-center appearance-none [mozAppearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
//             aria-label="כמות"
//           />

//           <button
//             onClick={handleAdd}
//             className="border rounded px-3 py-1 text-lg font-bold"
//             aria-label="הגדל כמות"
//           >
//             +
//           </button>
//         </div>

//         <p className="text-blue-700 font-semibold mt-3 text-md">
//           ₪{variationPrice} × {item.quantity}
//         </p>
//       </div>
//     </div>
//   );
// }

// // src/components/TopNav/cart/CartItem.jsx
// import { useCartItemLogic } from "../../../hooks/useCartItemLogic";

// export default function CartItem({ item }) {
//   const {
//     user, displayQty, unitPrice, title, image, localQty,
//     handleAdd, handleRemove, handleRemoveCompletely,
//     handleLocalChange, handleChangeGuest, commitIfValid,
//     id, setLocalQty,
//   } = useCartItemLogic(item);

//   // וריאציה/תמונה/מחיר למקרה שיש צילום מצב
//   const variationTitle =
//     item.snapshot?.attributes?.color ||
//     item.snapshot?.attributes?.size ||
//     undefined;

//   const variationImage =
//     item.snapshot?.images?.[0] ||
//     item.productId?.images?.[0] ||
//     image;

//   const variationPrice =
//     item.snapshot?.price ||
//     item.productId?.price?.amount ||
//     unitPrice ||
//     0;

//   const qty = user ? localQty : (item.quantity ?? displayQty ?? 1);

//   return (
//     // כרטיס: בלי מסגרת חיצונית, קו מפריד רק למטה — כמו בפיגמה
//     <div
//       className="px-5 sm:px-6 py-4 text-right"
//       style={{ borderBottom: "1px solid #E6E6E6" }}
//     >
//       {/* שלוש עמודות: תמונה מימין, טקסט ממורכז, כמות/מחיקה משמאל */}
//       <div className="grid grid-cols-12 items-center gap-3">
//         {/* תמונה (מימין ב-RTL) */}
//         <div className="col-span-2 flex justify-end">
//           <img
//             src={variationImage}
//             alt={item.productId?.title || title || "מוצר"}
//             className="w-[64px] h-[64px] object-contain"
//           />
//         </div>

//         {/* טקסט ממורכז — שם המוצר ושורת משנה/וריאציה */}
//         <div className="col-span-7 text-center">
//           <h4 className="font-semibold leading-6 text-[16px] sm:text-[18px] text-[#141414]">
//             {item.productId?.title || title}
//           </h4>

//           {/* שורת משנה דקה (אופציונלית) */}
//           {(variationTitle || item.snapshot?.attributes) && (
//             <p className="text-[12px] sm:text-[13px] text-[#6B7280] mt-1">
//               {item.snapshot?.attributes
//                 ? Object.entries(item.snapshot.attributes)
//                     .map(([k, v]) => `${v}`)
//                     .join(" • ")
//                 : variationTitle}
//             </p>
//           )}

//           {/* מחיר בשורה נפרדת במרכז, בכחול של המותג */}
//           <div className="mt-2 text-[15px] sm:text-[16px] font-semibold text-[#0C2F52]">
//             ₪{Number(variationPrice).toLocaleString("he-IL")} <span className="mx-1">×</span> {qty}
//           </div>
//         </div>

//         {/* שליטת כמות + מחיקה (משמאל) */}
//         <div className="col-span-3">
//           <div className="flex items-center justify-start gap-3">
//             {/* מינוס */}
//             <button
//               onClick={handleRemove}
//               aria-label="הפחת כמות"
//               className="w-10 h-10 grid place-items-center rounded-[10px] bg-white text-[18px] font-bold"
//               style={{ border: "1px solid #E6E6E6", color: "#141414" }}
//               type="button"
//             >
//               −
//             </button>

//             {/* אינפוט כמות — בגודל כפתור, ממורכז, ללא ספינרים */}
//             <input
//               type="number"
//               min="1"
//               value={qty}
//               onChange={
//                 user
//                   ? handleLocalChange
//                   : (e) => handleChangeGuest(id, e)
//               }
//               onBlur={user ? commitIfValid : undefined}
//               onKeyDown={
//                 user
//                   ? (e) => {
//                       if (e.key === "Enter") {
//                         e.preventDefault();
//                         e.currentTarget.blur();
//                       }
//                     }
//                   : undefined
//               }
//               className="w-10 h-10 text-center rounded-[10px] bg-white text-[16px]"
//               style={{ border: "1px solid #E6E6E6", color: "#141414" }}
//             />

//             {/* פלוס */}
//             <button
//               onClick={handleAdd}
//               aria-label="הגדל כמות"
//               className="w-10 h-10 grid place-items-center rounded-[10px] bg-white text-[18px] font-bold"
//               style={{ border: "1px solid #E6E6E6", color: "#141414" }}
//               type="button"
//             >
//               +
//             </button>

//             {/* מחיקת פריט — אייקון פח קטן, בלי X צף */}
//             <button
//               onClick={handleRemoveCompletely}
//               aria-label="הסרת פריט"
//               title="הסרת פריט"
//               className="p-2 rounded-md hover:bg-[#F6F7FA]"
//               type="button"
//             >
//               <svg
//                 width="18"
//                 height="18"
//                 viewBox="0 0 24 24"
//                 fill="none"
//                 stroke="#6B7280"
//                 strokeWidth="2"
//                 strokeLinecap="round"
//                 strokeLinejoin="round"
//               >
//                 <polyline points="3 6 5 6 21 6" />
//                 <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
//                 <path d="M10 11v6" />
//                 <path d="M14 11v6" />
//                 <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
//               </svg>
//             </button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// src/components/TopNav/cart/CartItem.jsx
import { useState, useEffect } from "react";
import { useCartItemLogic } from "../../../hooks/useCartItemLogic";

export default function CartItem({ item, onSelectionChange }) {
  const {
    user, displayQty, unitPrice, title, image, localQty,
    handleAdd, handleRemove, handleRemoveCompletely,
    handleLocalChange, handleChangeGuest, commitIfValid,
    id,
  } = useCartItemLogic(item);

  const [isSelected, setIsSelected] = useState(true); // ברירת מחדל - נבחר

  // עדכון ההורה כשהבחירה משתנה
  useEffect(() => {
    if (onSelectionChange) {
      onSelectionChange(item._id || id, isSelected);
    }
  }, [isSelected, item._id, id, onSelectionChange]);

  const variationTitle =
    item.snapshot?.attributes?.color ||
    item.snapshot?.attributes?.size ||
    undefined;

  const variationImage =
    item.snapshot?.images?.[0] ||
    item.productId?.images?.[0] ||
    image;

  const variationPrice =
    item.snapshot?.price ||
    item.productId?.price?.amount ||
    unitPrice ||
    0;

  const qty = user ? localQty : (item.quantity ?? displayQty ?? 1);

  return (
    <div className="py-5 px-5 mt-4" dir="rtl" style={{ borderBottom: "1px solid #EBEBEB" }}>
      <div className="flex items-start gap-4">
        {/* Checkbox - צד ימין, מעוצב ויפה - בצבע כתום */}
        <div className="flex-shrink-0 pt-1">
          <button
            onClick={() => setIsSelected(!isSelected)}
            className="w-6 h-6 rounded-md flex items-center justify-center transition-all duration-200 cursor-pointer shadow-sm"
            style={{ 
              backgroundColor: isSelected ? '#ED6A23' : 'white',
              border: isSelected ? '2px solid #ED6A23' : '2px solid #D1D5DB',
              transform: isSelected ? 'scale(1)' : 'scale(0.95)',
            }}
            aria-label={isSelected ? "בטל בחירה" : "בחר מוצר"}
            type="button"
          >
            {isSelected && (
              <svg 
                width="16" 
                height="16" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="white" 
                strokeWidth="3.5" 
                strokeLinecap="round" 
                strokeLinejoin="round"
                style={{ 
                  animation: 'checkmark 0.3s ease-in-out'
                }}
              >
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            )}
          </button>
        </div>

        {/* תמונה - מודרנית ובולטת עם צל ורקע לבן */}
        <div 
          className="flex-shrink-0 w-[80px] h-[80px] rounded-xl overflow-visible flex items-center justify-center transition-all duration-300 bg-white"
          style={{
            boxShadow: isSelected 
              ? '0 4px 12px rgba(237, 106, 35, 0.15), 0 2px 4px rgba(237, 106, 35, 0.08)'
              : '0 2px 8px rgba(0, 0, 0, 0.06)',
            border: isSelected ? '1px solid rgba(237, 106, 35, 0.2)' : '1px solid #E5E7EB',
          }}
        >
          <img
            src={variationImage}
            alt={item.productId?.title || title || "מוצר"}
            className="w-full h-full object-contain p-2 transition-all duration-300"
            style={{ 
              transform: isSelected ? 'rotate(-12deg) scale(1.05)' : 'rotate(-12deg) scale(0.95)',
              opacity: isSelected ? 1 : 0.5,
              filter: isSelected ? 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))' : 'grayscale(50%)'
            }}
          />
        </div>

        {/* תוכן - צד שמאל */}
        <div className="flex-1 flex flex-col">
          {/* כותרת - מרכוז */}
          <div className="mb-3 text-center">
            <h4 className="font-semibold text-[15px] leading-tight text-[#1A1A1A] mb-1">
              {item.productId?.title || title}
            </h4>
          </div>

          {/* מחיר בשחור למטה - מרכוז, כפל רק אם כמות > 1 */}
          <div className="text-center mb-3">
            <div className="text-[16px] font-bold text-[#1A1A1A]" style={{ opacity: isSelected ? 1 : 0.4 }}>
              ₪{Number(variationPrice).toLocaleString("he-IL")}
              {qty > 1 && (
                <>
                  <span className="mx-1">×</span>
                  {qty}
                </>
              )}
            </div>
          </div>

          {/* כפתורים למטה - בצד שמאל */}
          <div className="flex items-center justify-start gap-3">
            {/* פח */}
            <button
              onClick={handleRemoveCompletely}
              aria-label="הסרת פריט"
              title="הסרת פריט"
              className="w-[32px] h-[32px] flex items-center justify-center text-[#B0B0B0] hover:text-[#FF6B35] hover:bg-[#FFF5F2] rounded-md transition-colors cursor-pointer"
              type="button"
            >
              <svg 
                width="20" 
                height="20" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              >
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                <path d="M10 11v6" />
                <path d="M14 11v6" />
              </svg>
            </button>

            {/* פלוס, כמות, מינוס - צפופים */}
            <div className="flex items-center gap-0.5">
              {/* פלוס */}
              <button
                onClick={handleAdd}
                aria-label="הגדל כמות"
                className="w-[25px] h-[25px] flex items-center justify-center border border-[#FF8C6B] rounded-md bg-white text-[#FF8C6B] hover:bg-[#FFF5F2] transition-colors cursor-pointer"
                type="button"
              >
                <span className="text-[18px] leading-none font-light">+</span>
              </button>

              {/* כמות - ללא מסגרת */}
              <input
                type="number"
                min="1"
                value={qty}
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
                className="w-[42px] h-[34px] text-center rounded-md text-[15px] font-semibold text-[#1A1A1A] outline-none appearance-none [mozAppearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none cursor-text"
              />

              {/* מינוס */}
              <button
                onClick={handleRemove}
                aria-label="הפחת כמות"
                className="w-[25px] h-[25px] flex items-center justify-center border border-[#DDDDDD] rounded-md bg-white text-[#333333] hover:border-[#FF6B35] hover:text-[#FF6B35] transition-colors cursor-pointer"
                type="button"
              >
                <span className="text-[18px] leading-none font-light">−</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
