import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  isMobile: false,
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setIsMobile: (state, action) => {
      state.isMobile = action.payload;
    },
  },
});

export const { setIsMobile } = uiSlice.actions;
export default uiSlice.reducer;
