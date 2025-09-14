
import { combineReducers } from '@reduxjs/toolkit';
import cartReducer from './slices/cartSlice';
import userReducer from './slices/userSlice';
import guestCartReducer from './slices/guestCartSlice';
import { favoritesApi } from './api/favoritesApi';
import guestFavoritesReducer from "./slices/guestFavoritesSlice";
import addressReducer from "./slices/addressSlice";
import uiReducer from './slices/uiSlice';
import categoriesReducer from './slices/categoriesSlice';

export default combineReducers({
  cart: cartReducer,
  user: userReducer,
  guestCart: guestCartReducer,
  guestFavorites: guestFavoritesReducer,
  addresses: addressReducer,
  ui: uiReducer,
  categories: categoriesReducer,
  [favoritesApi.reducerPath]: favoritesApi.reducer,
});
