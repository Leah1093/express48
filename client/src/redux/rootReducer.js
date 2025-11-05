
import { combineReducers } from '@reduxjs/toolkit';
import cartReducer from './slices/cartSlice';
import userReducer from './slices/userSlice';
import guestCartReducer from './slices/guestCartSlice';
import { favoritesApi } from './api/favoritesApi';
import guestFavoritesReducer from "./slices/guestFavoritesSlice";
import addressReducer from "./slices/addressSlice";
import uiReducer from './slices/uiSlice';
import categoriesReducer from './slices/categoriesSlice';
import { adminApi } from "./services/adminApi";
import { userApi } from './services/userApi';
import { sellerProductsApi } from "./services/sellerProductsApi";
import { authApi } from "./services/authApi";
import { productsApi } from "./services/productsApi";
import { categoriesApi } from './services/categoriesApi';
import { contactApi } from "./services/contactApi";
import { sellerStoreApi } from "./services/sellerStoreApi";
import { couponApi } from './services/couponApi';

export default combineReducers({
  cart: cartReducer,
  user: userReducer,
  guestCart: guestCartReducer,
  guestFavorites: guestFavoritesReducer,
  addresses: addressReducer,
  ui: uiReducer,
  categories: categoriesReducer,
  [userApi.reducerPath]: userApi.reducer,
  [categoriesApi.reducerPath]: categoriesApi.reducer,
  [favoritesApi.reducerPath]: favoritesApi.reducer,
   [sellerStoreApi.reducerPath]: sellerStoreApi.reducer,
  [sellerProductsApi.reducerPath]: sellerProductsApi.reducer,
  [authApi.reducerPath]: authApi.reducer,
  [productsApi.reducerPath]: productsApi.reducer,
  [adminApi.reducerPath]: adminApi.reducer,
   [contactApi.reducerPath]: contactApi.reducer,
   [couponApi.reducerPath]: couponApi.reducer,

});
