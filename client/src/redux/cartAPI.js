import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:8080/cart',
  withCredentials: true, // חשוב כדי להעביר את ה-cookie עם הטוקן
});

export const fetchCart = () => API.get('/');
export const addToCart = (productId, quantity = 1) => API.post('/add', { productId, quantity });
export const removeFromCart = (productId) => API.delete('/remove', { data: { productId } });
export const removeProductCompletely = (productId) => API.delete('/remove-completely', { data: { productId } });
export const clearCart = () => API.delete('/clear');
