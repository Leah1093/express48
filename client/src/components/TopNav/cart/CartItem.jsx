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

import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  addItemAsync,
  removeItemAsync,
  clearCartAsync ,
  removeProductCompletelyThunk
} from "../../../redux/thunks/cartThunks";
import {
  clearGuestCart,
  removeGuestItem,
  addGuestItem,
  removeGuestProductCompletely
} from "../../../redux/slices/guestCartSlice";

const CartItem = ({ item }) => {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user.user);

  const id = item._id || (item.product && item.product._id);
  const idUser = typeof item.productId === 'object' ? item.productId._id : item.productId;



  const handleRemove = () => {
    if (user) {
      dispatch(removeItemAsync(idUser));
    } else {
      dispatch(removeGuestItem(id));
    }
  };

  const handleclearCart = () => {
    if (user) {
      dispatch(clearCartAsync(idUser));
    } else {
      dispatch(clearGuestCart(item));
    }
  };

  const handleAdd = () => {
    if (user) {
      dispatch(addItemAsync(idUser));
    } else {
      dispatch(addGuestItem(item.product || item));
    }
  };

  const handleRemoveCompletely = () => {
  if (user) {
    dispatch(removeProductCompletelyThunk(idUser));
  } else {
    dispatch(removeGuestProductCompletely(id));
  }
};

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
        src={item.productId?.image || item.image}
        alt={item.productId?.title || item.title}
        className="w-20 h-20 object-contain"
      />

      {/* פרטים */}
      <div className="flex flex-col flex-1 text-black">
        <div>
          <h4 className="text-md font-semibold leading-snug">
            {item.productId?.title || item.title}
          </h4>
        </div>

        <div className="flex items-center justify-start mt-3 gap-2">
          <button
            onClick={handleRemove}
            className="border rounded px-3 py-1 text-lg font-bold"
          >
            -
          </button>
          <span className="text-md w-6 text-center">{item.quantity}</span>
          <button
            onClick={handleAdd}
            className="border rounded px-3 py-1 text-lg font-bold"
          >
            +
          </button>
        </div>

        <p className="text-blue-700 font-semibold mt-3 text-md">
          ₪{item.productId?.price || item.price} × {item.quantity}
        </p>
      </div>
    </div>
  );
};

export default CartItem;


