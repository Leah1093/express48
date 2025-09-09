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
        state.push({ product, quantity: 1, unitPrice: product.price, selected: false });// ⬅️ כאן את מוסיפה 
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
    // ⭐ חדש: עדכון כמות ישירה לפי קלט
    setGuestItemQuantity: (state, action) => {
      const { productId, quantity } = action.payload;

      // חפש מוצר גם לפי product._id וגם productId (למקרה של פורמטים שונים)
      const index = state.findIndex(
        item =>
          (item.product && item.product._id === productId) ||
          item.productId === productId
      );

      if (index === -1) {
        // לא קיים בעגלה – לא עושים כלום (או שאפשר להחליט להוסיף אם quantity>0)
        return;
      }

      if (quantity <= 0) {
        // הסרה מלאה אם ביקשו 0 או פחות
        state.splice(index, 1);
      } else {
        state[index].quantity = quantity;
      }
      saveLocalCart(state);
    },

    loadGuestCart: (state) => {
      return getLocalCart();
    },

    toggleGuestItemSelected: (state, action) => {
      const { productId, selected } = action.payload;
      const item = state.find((it) => it.product._id === productId);
      if (item) {
        item.selected = selected;
      }
      saveLocalCart(state); // ⬅️ תמיד לשמור אחרי עדכון
    },

    // בתוך ה-slice של ה-cart לאורח
    toggleGuestSelectAll: (state, action) => {
      const selected = action.payload; // true = לבחור הכל, false = לנקות הכל
      state.forEach((item) => {
        item.selected = selected;
      });
      saveLocalCart(state); // ⬅️ תמיד לשמור אחרי עדכון
    },

  },
});

export const { addGuestItem, removeGuestItem, clearGuestCart, loadGuestCart, removeGuestProductCompletely, setGuestItemQuantity, toggleGuestItemSelected ,toggleGuestSelectAll } = guestCartSlice.actions;
export default guestCartSlice.reducer;
