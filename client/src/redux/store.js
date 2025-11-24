import { configureStore } from "@reduxjs/toolkit";
import rootReducer from "./rootReducer";
import { adminApi } from "./services/adminApi";
import { userApi } from "./services/userApi";
import { favoritesApi } from "./services/favoritesApi";
import { authApi } from "./services/authApi";
import { productsApi } from "./services/productsApi"; // ← הוספה
import { categoriesApi } from "./services/categoriesApi";
import { contactApi } from "./services/contactApi";
import { sellerStoreApi } from "./services/sellerStoreApi";
import { couponApi } from "./services/couponApi";
import { orderApi } from "./services/orderApi";
import { addressApi } from "./services/addressApi";
import { uploadApi } from "./services/uploadApi";
import { sellerProductsApi } from "./services/sellerProductsApi";
import { sellerOrdersApi } from "./services/sellerOrdersApi";

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      favoritesApi.middleware,
      authApi.middleware,
      productsApi.middleware,
      adminApi.middleware,
      userApi.middleware,
      categoriesApi.middleware,
      contactApi.middleware,
      sellerStoreApi.middleware,
      couponApi.middleware,
      orderApi.middleware,
      addressApi.middleware,
      uploadApi.middleware,
      sellerProductsApi.middleware,
      sellerOrdersApi.middleware
    ),
  devTools: process.env.NODE_ENV !== "production",
});
