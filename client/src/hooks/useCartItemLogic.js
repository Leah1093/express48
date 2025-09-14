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
 const id =
  typeof item.productId === "object"
    ? item.productId._id
    : item.productId;

  const idUser = typeof item.productId === "object" ? item.productId._id : item.productId;

  // 1) כמות מקור אמת מ-Redux
  const qtyFromRedux = useSelector((s) => {
    const i = s.cart.find((it) => getId(it) === productId);
    return i?.quantity ?? item?.quantity ?? 1;
  });

  // 2) סטייט מקומי לשדה הקלט
  const [localQty, setLocalQty] = useState(String(qtyFromRedux));
  useEffect(() => { setLocalQty(String(qtyFromRedux)); }, [qtyFromRedux]);

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
    if (pendingQtyRef.current == null) return;
    if (pendingQtyRef.current <= 0) { pendingQtyRef.current = null; return; }
    dispatch(updateItemQuantityThunk({ productId: idUser, quantity: pendingQtyRef.current }));
    pendingQtyRef.current = null;
  };

  const bufferQuantityChange = (newQty) => {
    pendingQtyRef.current = newQty;
    clearTimeout(flushTimerRef.current);
    flushTimerRef.current = setTimeout(flushQuantity, FLUSH_MS);
  };

  // פעולות UI
  const handleRemoveCompletely = () => {
    if (user) dispatch(removeProductCompletelyThunk(idUser));
    else dispatch(removeGuestProductCompletely(id));
  };

  const handleLocalChange = (e) => setLocalQty(e.target.value);

  const handleChangeGuest = (productId, e) => {
    const n = Number(e.target.value);
    if (Number.isFinite(n) && n > 0) {
      dispatch(setGuestItemQuantity({ productId: String(productId), quantity: n }));
    }
  };

  const commitIfValid = () => {
    if (isRemovingRef.current) return;
    cancelFlush();
    const qty = Number(localQty);
    if (qty > 0) {
      dispatch(updateItemQuantityThunk({ productId: idUser, quantity: qty }));
    }
  };

  const handleAdd = () => {
    if (user) {
      setLocalQty((prev) => {
        const updated = Number(prev) + 1;
        bufferQuantityChange(updated);
        return updated;
      });
    } else {
      dispatch(addGuestItem(item.productId || item));
    }
  };

  const handleRemove = () => {
    if (user) {
      setLocalQty((prev) => {
        const updated = Math.max(0, Number(prev) - 1);
        if (updated === 0) {
          isRemovingRef.current = true;
          cancelFlush();
          dispatch(removeProductCompletelyThunk(idUser))
            .finally(() => { isRemovingRef.current = false; });
          return 0;
        }
        bufferQuantityChange(updated);
        return updated;
      });
    } else {
      dispatch(removeGuestItem(id));
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
