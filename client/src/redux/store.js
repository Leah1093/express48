import { configureStore } from "@reduxjs/toolkit";
import rootReducer from "./rootReducer";

import { favoritesApi } from "./api/favoritesApi";
import { sellerProductsApi } from "./services/sellerProductsApi";
import { authApi } from "./services/authApi"; // ← הוספה

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      favoritesApi.middleware,
      sellerProductsApi.middleware,
      authApi.middleware // ← הוספה
    ),
  devTools: process.env.NODE_ENV !== "production",
});
