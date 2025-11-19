// src/redux/services/addressApi.js
import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "./baseApi";

export const addressApi = createApi({
  reducerPath: "addressApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["Addresses"],
  endpoints: (builder) => ({
    // כל הכתובות של המשתמש המחובר
    getAddresses: builder.query({
      query: () => ({
        url: "/addresses", // הנתיב שהרוט של האדרס יושב עליו בשרת
        method: "GET",
      }),
      providesTags: (result) =>
        result
          ? [
              // תג לכל כתובת
              ...result.map((addr) => ({
                type: "Addresses",
                id: addr._id,
              })),
              // תג לרשימה
              { type: "Addresses", id: "LIST" },
            ]
          : [{ type: "Addresses", id: "LIST" }],
    }),

    // שליפת כתובת בודדת לפי id (למסך עריכה למשל)
    getAddressById: builder.query({
      query: (id) => ({
        url: `/addresses/${id}`,
        method: "GET",
      }),
      providesTags: (result, error, id) => [{ type: "Addresses", id }],
    }),

    // יצירת כתובת חדשה
    createAddress: builder.mutation({
      query: (body) => ({
        url: "/addresses",
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "Addresses", id: "LIST" }],
    }),

    // עדכון כתובת קיימת
    updateAddress: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/addresses/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Addresses", id },
        { type: "Addresses", id: "LIST" },
      ],
    }),

    // מחיקת כתובת
    deleteAddress: builder.mutation({
      query: (id) => ({
        url: `/addresses/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, id) => [
        { type: "Addresses", id },
        { type: "Addresses", id: "LIST" },
      ],
    }),

    // הגדרת כתובת כברירת מחדל
    setDefaultAddress: builder.mutation({
      query: (id) => ({
        url: `/addresses/${id}/default`,
        method: "PATCH",
      }),
      invalidatesTags: (result, error, id) => [
        { type: "Addresses", id },
        { type: "Addresses", id: "LIST" },
      ],
    }),
  }),
});

export const {
  useGetAddressesQuery,
  useGetAddressByIdQuery,
  useCreateAddressMutation,
  useUpdateAddressMutation,
  useDeleteAddressMutation,
  useSetDefaultAddressMutation,
} = addressApi;
