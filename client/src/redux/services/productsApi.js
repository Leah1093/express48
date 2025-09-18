// src/redux/services/productsApi.js
import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "./baseApi";

export const productsApi = createApi({
  reducerPath: "productsApi",
  baseQuery: baseQueryWithReauth,
  endpoints: (builder) => ({
    getNewProducts: builder.query({
      query: (limit = 12) => `/products/new?limit=${limit}`,
    }),
    // בהמשך תוכלי להוסיף עוד:
    // getProductById: builder.query({
    //   query: (id) => `/products/${id}`,
    // }),
    // getProductsByStore: builder.query({
    //   query: (storeSlug) => `/stores/${storeSlug}/products`,
    // }),
  }),
});

export const { useGetNewProductsQuery } = productsApi;
