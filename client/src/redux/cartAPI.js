import axios from 'axios';

const API = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL || 'http://localhost:8080'}/cart`,
  withCredentials: true, // חשוב כדי להעביר את ה-cookie עם הטוקן
});

export const fetchCart = () => API.get('/');

// ⭐ מעודכן – תומך ב-affiliateRef
export const addToCart = (
  productId,
  variationId = null,
  quantity = 1,
  affiliateRef = null
) =>
  API.post('/add', {
    productId,
    variationId,
    quantity,
    affiliateRef,
  });

export const removeFromCart = (productId) =>
  API.delete('/remove', { data: { productId } });

export const removeProductCompletely = (productId, variationId) =>
  API.delete('/remove-completely', { data: { productId, variationId } });

export const clearCart = () => API.delete('/clear');

export const updateItemQuantity = (productId, variationId, quantity) =>
  API.put('/update-quantity', { productId, variationId, quantity });
