// import { createSlice } from "@reduxjs/toolkit";
// import {
//   getGuestFavorites,
//   addGuestFavorite,
//   removeGuestFavorite,
//   clearGuestFavorites,
// } from "../../helpers/localFavorites";

// // סטייט התחלתי – מהלוקל
// const initialState = getGuestFavorites();

// const guestFavoritesSlice = createSlice({
//   name: "guestFavorites",
//   initialState,
//   reducers: {
//     addGuest: (state, action) => {
//       const productId = action.payload;
//       if (!state.includes(productId)) {
//         state.push(productId);
//         addGuestFavorite(productId); // עדכון localStorage
//       }
//     },
//     removeGuest: (state, action) => {
//       const productId = action.payload;
//       return state.filter((id) => id !== productId);
//       // עדכון localStorage
//       removeGuestFavorite(productId);
//     },
//     clearGuest: () => {
//       clearGuestFavorites();
//       return [];
//     },
//     syncGuest: () => {
//       // טוען מחדש מהלוקל ל־redux
//       return getGuestFavorites();
//     },
//   },
// });

// export const { addGuest, removeGuest, clearGuest, syncGuest } =
//   guestFavoritesSlice.actions;

// export default guestFavoritesSlice.reducer;

// redux/slices/guestFavoritesSlice.js
import { createSlice } from "@reduxjs/toolkit";
import {
  getGuestFavorites,
  addGuestFavorite,
  removeGuestFavorite,
  clearGuestFavorites,
} from "../../helpers/localFavorites";

const initialState = getGuestFavorites();

const guestFavoritesSlice = createSlice({
  name: "guestFavorites",
  initialState,
  reducers: {
    addGuest(state, action) {
        const product = action.payload; // ✅ חילוץ
      // שמירה ב־localStorage
      addGuestFavorite(product);

      // עדכון state
      state.push({
        productId: product._id,
        addedAt: new Date().toISOString(),
        product,
      });
    },
    removeGuest(state, action) {
        const productId = action.payload; // ✅ חילוץ
      // הסרה מ־localStorage
      removeGuestFavorite(productId);

      // עדכון state
      return state.filter(fav => fav.productId !== productId);
    },
    clearGuests() {
      clearGuestFavorites();
      return [];
    },
    setGuests(_state, action) {
      // מאפשר לדרוס את ה־state (למשל במיזוג עם שרת)
      return action.payload;
    },
  },
});

export const { addGuest, removeGuest, clearGuests, setGuests } =
  guestFavoritesSlice.actions;

export default guestFavoritesSlice.reducer;

