
import { combineReducers } from '@reduxjs/toolkit';
import cartReducer from './slices/cartSlice';


export default combineReducers({
  cart: cartReducer,
});
