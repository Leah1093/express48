import { combineReducers } from "@reduxjs/toolkit";
import cartReducer from "./slices/cartSlice";
import userReducer from "./slices/userSlice";
import guestCartReducer from "./slices/guestCartSlice";
import guestFavoritesReducer from "./slices/guestFavoritesSlice";
import addressReducer from "./slices/addressSlice";
import uiReducer from './slices/uiSlice';
import categoriesReducer from './slices/categoriesSlice';

import { favoritesApi } from "./api/favoritesApi";
import { sellerProductsApi } from "./services/sellerProductsApi";
import { authApi } from "./services/authApi"; // ← הוספה

export default combineReducers({
  cart: cartReducer,
  user: userReducer,
  guestCart: guestCartReducer,
  guestFavorites: guestFavoritesReducer,
  addresses: addressReducer,
  ui: uiReducer,
  categories: categoriesReducer,
  [favoritesApi.reducerPath]: favoritesApi.reducer,
  [sellerProductsApi.reducerPath]: sellerProductsApi.reducer,
  [authApi.reducerPath]: authApi.reducer, // ← הוספה
});
