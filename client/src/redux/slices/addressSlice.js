import { createSlice } from "@reduxjs/toolkit";
import {
  fetchAddresses,
  addAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
} from "../thunks/addressThunks";

// --- Slice ---

const addressSlice = createSlice({
  name: "addresses",
  initialState: {
    list: [],        // כל הכתובות
    loading: false,  // מצב טעינה
    error: null,     // שגיאות
  },
  reducers: {
    clearAddresses: (state) => {
      state.list = [];
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchAddresses
      .addCase(fetchAddresses.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAddresses.fulfilled, (state, action) => {
        state.list = action.payload;
        state.loading = false;
      })
      .addCase(fetchAddresses.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })

      // addAddress
      .addCase(addAddress.fulfilled, (state, action) => {
        state.list.push(action.payload);
      })

      // updateAddress
      .addCase(updateAddress.fulfilled, (state, action) => {
        const index = state.list.findIndex((a) => a._id === action.payload._id);
        if (index !== -1) state.list[index] = action.payload;
      })

      // deleteAddress
      .addCase(deleteAddress.fulfilled, (state, action) => {
        state.list = state.list.filter((a) => a._id !== action.payload);
      })

      // setDefaultAddress
      .addCase(setDefaultAddress.fulfilled, (state, action) => {
        // נוודא שרק כתובת אחת היא ברירת מחדל
        state.list = state.list.map((a) => ({
          ...a,
          isDefault: a._id === action.payload._id,
        }));
      });
  },
});

// --- ייצוא ---
export const { clearAddresses } = addressSlice.actions;
export default addressSlice.reducer;
