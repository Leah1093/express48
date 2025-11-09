import axios from 'axios';

const API = axios.create({
  baseURL: 'https://api.express48.com/cart',
  withCredentials: true, // חשוב כדי להעביר את ה-cookie עם הטוקן
});

export const fetchCart = () => API.get('/');
export const addToCart = (productId,variationId, quantity = 1) => API.post('/add', { productId,variationId,quantity });
export const removeFromCart = (productId) => API.delete('/remove', { data: { productId } });
export const removeProductCompletely = (productId,variationId) => API.delete('/remove-completely', { data: { productId,variationId } });
export const clearCart = () => API.delete('/clear');
export const updateItemQuantity = (productId,variationId, quantity) => API.put("/update-quantity", { productId,variationId, quantity });

