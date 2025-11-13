// // src/redux/services/productsApi.js
// import { createApi } from "@reduxjs/toolkit/query/react";
// import { baseQueryWithReauth } from "./baseApi";

// export const productsApi = createApi({
//   reducerPath: "productsApi",
//   baseQuery: baseQueryWithReauth,
//   tagTypes: ["Products", "Product"],
//   endpoints: (builder) => ({

//     // --- רשימת מוצרים כללית (אופציונלי) ---
//     getProducts: builder.query({
//       query: (params) => ({
//         url: "/products",
//         method: "GET",
//         params, // { search, q, categoryId, page, limit } לפי השרת שלך
//       }),
//       providesTags: (res) => {
//         const items = res && Array.isArray(res) ? res : res?.items || [];
//         if (!items) return ["Products"];
//         return ["Products", ...items.map((p) => ({ type: "Product", id: p._id }))];
//       },
//       keepUnusedDataFor: 60,
//     }),

//     // --- מוצרים חדשים (אם קיים אצלך) ---
//     getNewProducts: builder.query({
//       query: (limit = 12) => `/products/new?limit=${limit}`,
//       providesTags: ["Products"],
//     }),

//     // --- מוצר בודד לפי מזהה (אופציונלי) ---
//     getProductById: builder.query({
//       query: (id) => `/products/${id}`,
//       providesTags: (res, err, id) => [{ type: "Product", id }],
//     }),

//     // --- מוצר לפי slug (לדפי מוצר) ---
//     getProductBySlug: builder.query({
//       query: (slug) => `/products/${slug}`,
//       providesTags: (res, err, slug) => [{ type: "Product", id: res?._id || slug }],
//     }),

//     getPopularSearches: builder.query({
//       query: () => ({ url: "/products/popular-searches", method: "GET" }),
//       // אם תרצי לקבל ישר מערך: הוסיפי transformResponse: (res) => res?.items ?? [],
//       providesTags: ["PopularSearches"],
//       keepUnusedDataFor: 300,
//     }),

//     // --- יצירת מוצר (החידוש) ---
//     createProduct: builder.mutation({
//       query: (body) => ({
//         url: "/products",
//         method: "POST",
//         body, // שולחים JSON. אם השרת דורש multipart נעדכן בהתאם.
//       }),
//       invalidatesTags: ["Products"],
//     }),

//     // --- לפי חנות (אופציונלי) ---
//     getProductsByStore: builder.query({
//       query: (storeSlug) => `/stores/${storeSlug}/products`,
//       providesTags: ["Products"],
//     }),
//   }),
// });

// export const {
//   useGetProductsQuery,
//   useGetNewProductsQuery,
//   useGetProductByIdQuery,
//   useGetProductBySlugQuery,
//   useGetProductsByStoreQuery,
//   useCreateProductMutation, 
//   useGetPopularSearchesQuery,
// } = productsApi;
// src/redux/services/productsApi.js
import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "./baseApi";

export const productsApi = createApi({
  reducerPath: "productsApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["Products", "Product", "PopularSearches"],
  endpoints: (builder) => ({

    // --- רשימת מוצרים כללית ---
    getProducts: builder.query({
      query: (params) => ({
        url: "/products",
        method: "GET",
        params,
      }),
      providesTags: (res) => {
        const items = res?.items || (Array.isArray(res) ? res : []);
        return [
          "Products",
          ...items.map((p) => ({ type: "Product", id: p._id })),
        ];
      },
      keepUnusedDataFor: 60,
    }),

    // --- מוצרים חדשים ---
    getNewProducts: builder.query({
      query: (limit = 12) => `/products/new?limit=${limit}`,
      providesTags: ["Products"],
    }),

    // --- מוצר בודד לפי מזהה ---
    getProductById: builder.query({
      query: (id) => `/products/${id}`,
      providesTags: (res, err, id) => [{ type: "Product", id }],
    }),

    // --- מוצר לפי slug ---
    getProductBySlug: builder.query({
      query: (slug) => `/products/${slug}`,
      providesTags: (res, err, slug) => [{ type: "Product", id: res?._id || slug }],
    }),

    // --- חיפושים פופולריים ---
    getPopularSearches: builder.query({
      query: () => ({ url: "/products/popular-searches", method: "GET" }),
      providesTags: ["PopularSearches"],
      keepUnusedDataFor: 300,
      transformResponse: (res) => res?.items ?? [],
    }),

    // --- יצירת מוצר ---
    createProduct: builder.mutation({
      query: (body) => ({ url: "/products", method: "POST", body }),
      invalidatesTags: ["Products"],
    }),

    // --- לפי חנות ---
    getProductsByStore: builder.query({
      query: (storeSlug) => `/stores/${storeSlug}/products`,
      providesTags: ["Products"],
    }),

    // --- מוצרים לפי קטגוריה (fullSlug) עם עמודים/מיון ---
getByCategory: builder.query({
  query: ({ fullSlug, page = 1, limit = 24, sort }) => {
    const params = new URLSearchParams();
    params.set("fullSlug", String(fullSlug || "").trim());
    params.set("page", String(page));
    params.set("limit", String(limit));
    if (sort) params.set("sort", String(sort));

    return {
      url: `/products/by-category?${params.toString()}`,
      method: "GET",
    };
  },
  providesTags: (res) => {
    const items = res?.items || [];
    return ["Products", ...items.map((p) => ({ type: "Product", id: p._id }))];
  },
  keepUnusedDataFor: 60,
}),


  }),
});

// ייצוא הוקים
export const {
  useGetProductsQuery,
  useGetNewProductsQuery,
  useGetProductByIdQuery,
  useGetProductBySlugQuery,
  useGetProductsByStoreQuery,
  useCreateProductMutation,
  useGetPopularSearchesQuery,
  // ההוק החדש לשימוש בעמוד הקטגוריה
  useGetByCategoryQuery,
} = productsApi;
