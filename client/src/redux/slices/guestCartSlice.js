import { createSlice } from '@reduxjs/toolkit';
import { getLocalCart, saveLocalCart, clearLocalCart as clearStorage } from "../../helpers/localCart";

const initialState = getLocalCart(); // נטען את העגלה מה-localStorage

const guestCartSlice = createSlice({
  name: 'guestCart',
  initialState,
  reducers: {
    addGuestItem: (state, action) => {
      const product = action.payload;
      const index = state.findIndex(item => item.product._id === product._id);

      if (index >= 0) {
        state[index].quantity += 1;
      } else {
        state.push({ product, quantity: 1 });
      }

      saveLocalCart(state); // עדכון localStorage
    },

    removeGuestItem: (state, action) => {
      const productId = action.payload;
      const index = state.findIndex(item => item.product._id === productId);

      if (index >= 0) {
        if (state[index].quantity > 1) {
          state[index].quantity -= 1;
        } else {
          state.splice(index, 1);
        }
      }

      saveLocalCart(state);
    },

    removeGuestProductCompletely: (state, action) => {
      const productId = action.payload;

      const updatedCart = state.filter(
        item => item.product._id !== productId && item.productId !== productId
      );

      saveLocalCart(updatedCart);
      return updatedCart;
    },

    clearGuestCart: (state) => {
      clearStorage();
      return [];
    },

    loadGuestCart: (state) => {
      return getLocalCart();
    },
  },
});

export const { addGuestItem, removeGuestItem, clearGuestCart, loadGuestCart,removeGuestProductCompletely } = guestCartSlice.actions;
export default guestCartSlice.reducer;
