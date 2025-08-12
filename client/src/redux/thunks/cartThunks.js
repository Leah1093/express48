import { createAsyncThunk } from '@reduxjs/toolkit';
import * as api from '../cartAPI';
import { mergeCartService } from "../../services/cartService";


export const loadCart = createAsyncThunk('cart/', async () => {
  const res = await api.fetchCart();
  return res.data.items;
});

export const addItemAsync = createAsyncThunk('cart/addItem', async (productId) => {
  const res = await api.addToCart(productId, 1);
  return res.data.items;
});

export const removeItemAsync = createAsyncThunk('cart/removeItem', async (productId) => {
  const res = await api.removeFromCart(productId);
  return res.data.items;
});

export const clearCartAsync = createAsyncThunk('cart/clearCart', async () => {
  const res = await api.clearCart();
  return res.data.items;
});

export const removeProductCompletelyThunk = createAsyncThunk('cart/removeCompletely',
 async (productId, { rejectWithValue }) => {
      // לוג של הפרמטרים
  //  console.log('🚀 removeProductCompletelyThunk', { productId, source, stack: new Error().stack });
    try {
      const res = await api.removeProductCompletely(productId);
       return res.data.items;
    } catch (err) {
      return rejectWithValue(err.response.data);
    }
  }
);

export const updateItemQuantityThunk = createAsyncThunk(
  "cart/updateQuantity",
  async ({ productId, quantity }, { rejectWithValue }) => {
    try {
      const res = await api.updateItemQuantity(productId, quantity);
      return res.data.items;
    } catch (err) {
      return rejectWithValue(err.response.data);
    }
  }
);




export const mergeCartThunk = createAsyncThunk(
  'cart/mergeGuestCart',
  async ({ userId, guestCart }, { rejectWithValue }) => {
    try {
      console.log("🔁 mergeCartThunk התחיל עם:", userId, guestCart); // << כאן לשים
      const mergedCart = await mergeCartService(userId, guestCart);
      localStorage.removeItem("cart");
      return mergedCart;
    } catch (error) {
      console.error("❌ שגיאה במיזוג עגלה:", error);
      return rejectWithValue(error.response?.data || "שגיאה כללית");
    }
  }
);
