
import { combineReducers } from '@reduxjs/toolkit';
import cartReducer from './slices/cartSlice';
import userReducer from './slices/userSlice';
import guestCartReducer from './slices/guestCartSlice';
import { favoritesApi } from './api/favoritesApi';
import guestFavoritesReducer from "./slices/guestFavoritesSlice";

export default combineReducers({
  cart: cartReducer,
  user: userReducer,
  guestCart: guestCartReducer,
  guestFavorites: guestFavoritesReducer,
  [favoritesApi.reducerPath]: favoritesApi.reducer,
});
