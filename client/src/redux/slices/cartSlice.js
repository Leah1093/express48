import { createSlice } from '@reduxjs/toolkit';
import { loadCart, addItemAsync, removeItemAsync, clearCartAsync, removeProductCompletelyThunk,
  updateItemQuantityThunk,toggleItemSelectedThunk,toggleSelectAllThunk } from '../thunks/cartThunks';

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
      })
      .addCase(removeProductCompletelyThunk.fulfilled, (state, action) => {
        return action.payload;
      })
      .addCase(updateItemQuantityThunk.fulfilled, (state, action) => {
        // console.log('after plus/minus payload:', action.payload);
        return action.payload; // מחליף את העגלה בגרסה המעודכנת
      })
      .addCase(toggleItemSelectedThunk.fulfilled, (state, action) => {
        return action.payload; // מחזיר עגלה מעודכנת
      })
      .addCase(toggleSelectAllThunk.fulfilled, (state, action) => {
        return action.payload.items; // מחזיר עגלה מעודכנת
      });

  },
});

export default cartSlice.reducer;
