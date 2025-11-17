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
        console.log('🛒 loadCart.fulfilled - קיבלנו:', action.payload);
        return action.payload;
      })
      .addCase(addItemAsync.fulfilled, (state, action) => {
        console.log('➕ addItemAsync.fulfilled - קיבלנו:', action.payload);
        return action.payload;
      })
      .addCase(removeItemAsync.fulfilled, (state, action) => {
        console.log('➖ removeItemAsync.fulfilled - קיבלנו:', action.payload);
        return action.payload;
      })
      .addCase(clearCartAsync.fulfilled, () => {
        console.log('🗑️ clearCartAsync.fulfilled');
        return [];
      })
      .addCase(removeProductCompletelyThunk.fulfilled, (state, action) => {
        console.log('🗑️ removeProductCompletelyThunk.fulfilled - קיבלנו:', action.payload);
        return action.payload;
      })
      .addCase(updateItemQuantityThunk.fulfilled, (state, action) => {
        console.log('🔄 updateItemQuantityThunk.fulfilled - קיבלנו:', action.payload);
        return action.payload; // מחליף את העגלה בגרסה המעודכנת
      })
      .addCase(toggleItemSelectedThunk.fulfilled, (state, action) => {
        console.log('✅ toggleItemSelectedThunk.fulfilled - קיבלנו:', action.payload);
        return action.payload; // מחזיר עגלה מעודכנת
      })
      .addCase(toggleSelectAllThunk.fulfilled, (state, action) => {
        console.log('✅ toggleSelectAllThunk.fulfilled - קיבלנו:', action.payload);
        return action.payload.items; // מחזיר עגלה מעודכנת
      });

  },
});

export default cartSlice.reducer;
