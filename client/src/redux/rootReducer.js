
import { combineReducers } from '@reduxjs/toolkit';
import cartReducer from './slices/cartSlice';
import userReducer from './slices/userSlice'

export default combineReducers({
  cart: cartReducer,
  user: userReducer,
});
