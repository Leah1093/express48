import { createAsyncThunk } from '@reduxjs/toolkit';
import * as api from '../cartAPI';

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

export const removeProductCompletelyThunk = createAsyncThunk(
  'cart/removeCompletely',
  async (productId, { rejectWithValue }) => {
    try {
      const res = await api.removeProductCompletely(productId);
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
      const mergedCart = await mergeCartService(userId, guestCart);
      localStorage.removeItem("guestCart");
      return mergedCart;
    } catch (error) {
      console.error("❌ שגיאה במיזוג עגלה:", error);
      return rejectWithValue(error.response?.data || "שגיאה כללית");
    }
  }
);
