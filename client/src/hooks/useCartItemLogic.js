// src/hooks/useCartItemLogic.js
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useRef, useState } from "react";
import {
  addItemAsync,
  removeItemAsync,
  clearCartAsync,
  removeProductCompletelyThunk,
  updateItemQuantityThunk,
} from "../redux/thunks/cartThunks";
import {
  clearGuestCart,
  removeGuestItem,
  addGuestItem,
  removeGuestProductCompletely,
  setGuestItemQuantity,
} from "../redux/slices/guestCartSlice";

const getId = (x) => x?.productId?._id ?? x?.productId ?? x?._id;

export function useCartItemLogic(item) {

  const dispatch = useDispatch();
  const user = useSelector((s) => s.user.user);

  const productId = getId(item);

//  const id =
//   typeof item.productId === "object"
//     ? item.productId._id
//     : item.productId;

// console.log("DEBUG productId:", item.productId._id);

const id =
  typeof item?.productId === "object" && item.productId !== null
    ? item.productId._id
    : item?.productId ?? null;




  // const idUser = typeof item.productId === "object" ? item.productId._id : item.productId;

  const idUser =
  item?.productId && typeof item.productId === "object"
    ? item.productId._id
    : item?.productId ?? null;


  // 1) כמות מקור אמת מ-Redux
  // const qtyFromRedux = useSelector((s) => {
  //   const i = s.cart.find((it) => getId(it) === productId);
  //   return i?.quantity ?? item?.quantity ?? 1;
  // });
  const qtyFromRedux = useSelector((s) => {
  const i = s.cart.find(
    (it) =>
      getId(it) === productId &&
      (it.variationId ?? null) === (item.variationId ?? null)
  );
  return i?.quantity ?? item?.quantity ?? 1;
});

  // 2) סטייט מקומי לשדה הקלט
  // const [localQty, setLocalQty] = useState(String(qtyFromRedux));
  // useEffect(() => { setLocalQty(String(qtyFromRedux)); }, [qtyFromRedux]);
  const [localQty, setLocalQty] = useState(String(qtyFromRedux));

// גם ב־useEffect נוסיף תלות ב־variationId
useEffect(() => {
  setLocalQty(String(qtyFromRedux));
}, [qtyFromRedux, item?.variationId]);

  // מנגנון debounce לשליחה מרוכזת
  const FLUSH_MS = 300;
  const pendingQtyRef = useRef(null);
  const flushTimerRef = useRef(null);
  const isRemovingRef = useRef(false);

  const cancelFlush = () => {
    clearTimeout(flushTimerRef.current);
    flushTimerRef.current = null;
    pendingQtyRef.current = null;
  };

  const flushQuantity = () => {
  if (isRemovingRef.current) return;
  if (!pendingQtyRef.current) return;

  const { quantity, variationId } = pendingQtyRef.current; // 👈 שולפים את שני הערכים
  if (quantity <= 0) { 
    pendingQtyRef.current = null; 
    return; 
  }

  dispatch(updateItemQuantityThunk({ 
    productId: idUser, 
    variationId,     // 👈 שולחים גם את הוריאציה
    quantity 
  }));

  pendingQtyRef.current = null;
};


  const bufferQuantityChange = (newQty,variationId = null) => {
    pendingQtyRef.current = { quantity: newQty, variationId };
    clearTimeout(flushTimerRef.current);
    flushTimerRef.current = setTimeout(flushQuantity, FLUSH_MS);
  };

  // פעולות UI
  // const handleRemoveCompletely = () => {
  //   if (user) dispatch(removeProductCompletelyThunk(idUser));
  //   else dispatch(removeGuestProductCompletely(id));
  // };
  const handleRemoveCompletely = () => {
  if (user) {
    dispatch(removeProductCompletelyThunk({
      productId: idUser,
      variationId: item?.variationId ?? null   // ⬅️ שולחים גם וריאציה אם קיימת
    }));
  } else {
    dispatch(removeGuestProductCompletely({
      productId: id,
      variationId: item?.variationId ?? null
    }));
  }
};


  const handleLocalChange = (e) => setLocalQty(e.target.value);



  const handleChangeGuest = (productId, e) => {
    const n = Number(e.target.value);
    if (Number.isFinite(n) && n > 0) {
      dispatch(setGuestItemQuantity({ productId: String(productId),variationId: item?.variationId ?? null,  quantity: n }));
    }
  };

  const commitIfValid = () => {
    if (isRemovingRef.current) return;
    cancelFlush();
    const qty = Number(localQty);
    if (qty > 0) {
      dispatch(updateItemQuantityThunk({ productId: idUser,variationId: item?.variationId ?? null, quantity: qty }));
    }
  };

  const handleAdd = () => {
    if (user) {
      setLocalQty((prev) => {
        const updated = Number(prev) + 1;
        console.log("variationId",item.variationId );
        bufferQuantityChange(updated,item?.variationId ?? null);
        return updated;
      });
    } else {
      dispatch(addGuestItem({
        product:item.productId || item,
        variationId: item?.variationId ?? null 
      }));
    }
  };

  const handleRemove = () => {
    if (user) {
      setLocalQty((prev) => {
        const updated = Math.max(0, Number(prev) - 1);
        if (updated === 0) {
          isRemovingRef.current = true;
          cancelFlush();
          dispatch(removeProductCompletelyThunk({
          productId: idUser, 
          variationId: item?.variationId ?? null   
        }))
            .finally(() => { isRemovingRef.current = false; });
          return 0;
        }
        bufferQuantityChange(updated,item?.variationId ?? null);
        return updated;
      });
    } else {
      dispatch(removeGuestItem({ 
      productId: id, 
      variationId: item?.variationId ?? null 
    }));
    }
  };

  // נתוני תצוגה
  const title = item.productId?.title || item.title;
  const image = item.productId?.image || item.image;
  const unitPrice = item.unitPrice ?? item.productId?.price ?? item.price ?? 0;
  const displayQty = user ? localQty : item.quantity;

  return {
    // state
    user, localQty, displayQty, unitPrice, title, image,
    // ids
    id, idUser, productId,
    // actions
    handleAdd, handleRemove, handleRemoveCompletely, handleLocalChange,
    handleChangeGuest, commitIfValid, setLocalQty,
  };
}
