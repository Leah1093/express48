import { createSelector } from "@reduxjs/toolkit";

export const selectCartItems = (state) => {
  const user = state.user.user;
  const cart = user ? state.cart : state.guestCart;
  return Array.isArray(cart) ? cart : [];
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
