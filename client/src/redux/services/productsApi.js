// src/redux/services/productsApi.js
import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "./baseApi";

export const productsApi = createApi({
  reducerPath: "productsApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["Products", "Product"],
  endpoints: (builder) => ({

    // --- רשימת מוצרים כללית (אופציונלי) ---
    getProducts: builder.query({
      query: (params) => ({
        url: "/products",
        method: "GET",
        params, // { search, q, categoryId, page, limit } לפי השרת שלך
      }),
      providesTags: (res) => {
        const items = res && Array.isArray(res) ? res : res?.items || [];
        if (!items) return ["Products"];
        return ["Products", ...items.map((p) => ({ type: "Product", id: p._id }))];
      },
      keepUnusedDataFor: 60,
    }),

    // --- מוצרים חדשים (אם קיים אצלך) ---
    getNewProducts: builder.query({
      query: (limit = 12) => `/products/new?limit=${limit}`,
      providesTags: ["Products"],
    }),

    // --- מוצר בודד לפי מזהה (אופציונלי) ---
    getProductById: builder.query({
      query: (id) => `/products/${id}`,
      providesTags: (res, err, id) => [{ type: "Product", id }],
    }),

    // --- מוצר לפי slug (לדפי מוצר) ---
    getProductBySlug: builder.query({
      query: (slug) => `/products/${slug}`,
      providesTags: (res, err, slug) => [{ type: "Product", id: res?._id || slug }],
    }),

    getPopularSearches: builder.query({
      query: () => ({ url: "/products/popular-searches", method: "GET" }),
      // אם תרצי לקבל ישר מערך: הוסיפי transformResponse: (res) => res?.items ?? [],
      providesTags: ["PopularSearches"],
      keepUnusedDataFor: 300,
    }),

    // --- יצירת מוצר (החידוש) ---
    createProduct: builder.mutation({
      query: (body) => ({
        url: "/products",
        method: "POST",
        body, // שולחים JSON. אם השרת דורש multipart נעדכן בהתאם.
      }),
      invalidatesTags: ["Products"],
    }),

    // --- לפי חנות (אופציונלי) ---
    getProductsByStore: builder.query({
      query: (storeSlug) => `/stores/${storeSlug}/products`,
      providesTags: ["Products"],
    }),
  }),
});

export const {
  useGetProductsQuery,
  useGetNewProductsQuery,
  useGetProductByIdQuery,
  useGetProductBySlugQuery,
  useGetProductsByStoreQuery,
  useCreateProductMutation, 
  useGetPopularSearchesQuery,
} = productsApi;
