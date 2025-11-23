import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "./baseApi";

export const sellerProductsApi = createApi({
  reducerPath: "sellerProductsApi",
  baseQuery: baseQueryWithReauth, // כולל ריענון אוטומטי אם יש 401
  tagTypes: ["SellerProducts", "Product"],
  endpoints: (build) => ({
    // --- רשימת מוצרים של המוכר ---
    listSellerProducts: build.query({
      query: (params = {}) => {
        const qp = new URLSearchParams({
          page: String(params.page ?? 1),
          limit: String(params.limit ?? 20),
          sort: params.sort ?? "-updatedAt",
          search: params.search ?? "",
          status: params.status ?? "",
          brand: params.brand ?? "",
          category: params.category ?? "",
          deleted: params.deleted ?? "active",
          fields:
            params.fields ??
            "_id,title,brand,sku,price.amount,stock,status,updatedAt,images,variations._id,isDeleted",
        });

        return { url: `/seller/products?${qp.toString()}` };
      },
      providesTags: (result) =>
        result?.items
          ? [
              ...result.items.map((p) => ({ type: "SellerProducts", id: p._id })),
              { type: "SellerProducts", id: "LIST" },
            ]
          : [{ type: "SellerProducts", id: "LIST" }],
    }),

    // --- שליפת מוצר לפי ID ---
    getSellerProductById: build.query({
      query: (id) => ({ url: `/seller/products/${id}` }),
      providesTags: (_res, _err, id) => [{ type: "Product", id }],
    }),

    // --- יצירת מוצר חדש ---
    createSellerProduct: build.mutation({
      query: (data) => ({
        url: `/seller/products`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: [{ type: "SellerProducts", id: "LIST" }],
    }),

    // --- עדכון מוצר קיים ---
    updateSellerProduct: build.mutation({
      query: ({ id, ...data }) => ({
        url: `/seller/products/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: (_res, _err, { id }) => [
        { type: "Product", id },
        { type: "SellerProducts", id: "LIST" },
      ],
    }),

    // --- מחיקה רכה ---
    deleteSellerProduct: build.mutation({
      query: (id) => ({
        url: `/seller/products/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (_res, _err, id) => [
        { type: "Product", id },
        { type: "SellerProducts", id: "LIST" },
      ],
    }),

    // --- שחזור ממחיקה ---
    restoreSellerProduct: build.mutation({
      query: (id) => ({
        url: `/seller/products/${id}/restore`,
        method: "PATCH",
      }),
      invalidatesTags: (_res, _err, id) => [
        { type: "Product", id },
        { type: "SellerProducts", id: "LIST" },
      ],
    }),

    // --- עדכון סטטוס ---
    updateSellerProductStatus: build.mutation({
      query: ({ id, status }) => ({
        url: `/seller/products/${id}/status`,
        method: "PATCH",
        body: { status },
      }),
      invalidatesTags: (_res, _err, { id }) => [
        { type: "Product", id },
        { type: "SellerProducts", id: "LIST" },
      ],
    }),
    importSellerProductsCsv: build.mutation({
      query: (file) => {
        const formData = new FormData();
        formData.append("file", file);

        return {
          url: "/seller/products/import-csv", // הנתיב שהגדרנו בשרת
          method: "POST",
          body: formData,
        };
      },
    }),
  }),
});

export const {
  useListSellerProductsQuery,
  useGetSellerProductByIdQuery,
  useCreateSellerProductMutation,
  useUpdateSellerProductMutation,
  useDeleteSellerProductMutation,
  useRestoreSellerProductMutation,
  useUpdateSellerProductStatusMutation,
  useImportSellerProductsCsvMutation
} = sellerProductsApi;
