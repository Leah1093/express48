import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  user: null,
  loading: true,       // אם עדיין טוען
  initialized: false,  // האם כבר ניסינו לטעון /me
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload;
      state.loading = false;
      state.initialized = true; // סימון שסיימנו בדיקה
    },
    clearUser: (state) => {
      state.user = null;
      state.loading = false;
      state.initialized = true; // גם אם אין משתמש - ניסינו לבדוק
    },
    setInitializing: (state) => {
      state.loading = true;
      state.initialized = false; // התחלת בדיקה מחדש
    }
  },
});

export const { setUser, clearUser, setInitializing } = userSlice.actions;
export default userSlice.reducer;

