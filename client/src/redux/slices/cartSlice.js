import { createSlice } from '@reduxjs/toolkit';
import { loadCart, addItemAsync, removeItemAsync, clearCartAsync } from '../thunks/cartThunks';

const cartSlice = createSlice({
  name: 'cart',
  initialState: [],
  reducers: {}, // השארת אם את עדיין רוצה local actions
  extraReducers: (builder) => {
    builder
      .addCase(loadCart.fulfilled, (state, action) => {
        return action.payload;
      })
      .addCase(addItemAsync.fulfilled, (state, action) => {
        return action.payload;
      })
      .addCase(removeItemAsync.fulfilled, (state, action) => {
        return action.payload;
      })
      .addCase(clearCartAsync.fulfilled, () => {
        return [];
      });
  },
});

export default cartSlice.reducer;
