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
