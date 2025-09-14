import { useDispatch } from "react-redux";
import { getLocalCart, clearLocalCart } from "../../helpers/localCart";
import { mergeCartThunk, loadCart } from "../../redux/thunks/cartThunks";
import { mergeGuestFavoritesIfAny } from "../../helpers/mergeGuestFavorites";
import { clearGuests } from "../../redux/slices/guestFavoritesSlice";
import { favoritesApi } from "../../redux/api/favoritesApi";
import {clearGuestCart} from "../../redux/slices/guestCartSlice";

export default function useMergeCartAfterLogin() {
  const dispatch = useDispatch();

  const mergeCartAfterLogin = async (userId) => {
    const localCart = getLocalCart();
    console.log("📦 localCart:", localCart);

    if (localCart.length > 0) {
      const itemsToMerge = localCart.map((item) => ({
        productId: item.productId?._id || item.productId,
        quantity: item.quantity,
        selected: item.selected,
      }));

      console.log("🚀 מנסה למזג עגלה...");

      const result = await dispatch(
        mergeCartThunk({ userId, guestCart: itemsToMerge })
      );

      console.log("🛒 עגלה מוזגת מהשרת:", result.payload);

      // אחרי מיזוג נטען עגלה מעודכנת
      await dispatch(loadCart());

      // אופציונלי: נקה localStorage כדי לא למזג שוב בטעות
      clearLocalCart();
        dispatch(clearGuestCart());
    } else {
      console.log("📭 אין עגלת אורח, טוען עגלה ממונגו...");
    console.log("🛒");

      await dispatch(loadCart());
    }
    // 1) מיזוג מועדפים של אורח לשרת
          await mergeGuestFavoritesIfAny();          // ← אם יצרת את הפונקציה helper
    console.log("🛒");
          // 2) נקה סטייט של אורחים ב-Redux (שלא יישאר כפול)
          dispatch(clearGuests());
    console.log("🛒");
    
          // 3) רענון רשימת המועדפים מהשרת (RTK Query)
          dispatch(favoritesApi.util.invalidateTags?.(["Favorites"]));
          // או:
    console.log("🛒");

          // await dispatch(favoritesApi.endpoints.listFavorites.initiate(undefined, { forceRefetch: true }));
  };

  return mergeCartAfterLogin;
}