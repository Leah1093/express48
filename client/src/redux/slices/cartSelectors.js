import { createSelector } from "@reduxjs/toolkit";

export const selectCartItems = (state) => {
  const user = state.user.user;

  if (user) {
    // משתמש מחובר - state.cart הוא array של items
    const cart = state.cart;
    const result = Array.isArray(cart) ? cart : [];
    return result;
  } else {
    // אורח - guestCart תמיד array
    const guestCart = state.guestCart;
    const result = Array.isArray(guestCart) ? guestCart : [];
    return result;
  }
};

export const selectCartSubtotal = createSelector(
  [selectCartItems],
  (items) =>
    items.reduce((sum, item) => {
      const price = Number(item?.unitPrice ?? 0);
      const qty   = Number(item?.quantity ?? item?.qty ?? 1);
      return sum + price * qty;
    }, 0)
);
