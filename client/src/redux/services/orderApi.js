import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "./baseApi";

export const orderApi = createApi({
  reducerPath: "orderApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["Orders", "Order"],
  endpoints: (builder) => ({
    // כל ההזמנות של המשתמש המחובר
    getOrders: builder.query({
        
     query: () => {
    debugger; // יעצור כאן ברגע שהקריאה יוצאת
    return {
      url: "/orders",
      method: "GET",
    };
  },
      providesTags: (result) =>
        result && Array.isArray(result)
          ? [
              ...result.map((o) => ({ type: "Order", id: o._id })),
              { type: "Orders", id: "LIST" },
            ]
          : [{ type: "Orders", id: "LIST" }],
    }),

    // הזמנה בודדת לפי id (אם תרצי עמוד "פרטי הזמנה")
    getOrderById: builder.query({
      query: (id) => ({
        url: `/orders/${id}`,
        method: "GET",
      }),
      providesTags: (result, error, id) => [{ type: "Order", id }],
    }),

    // יצירת הזמנה (אם תרצי להשתמש בזה מהצ’קאאאוט)
    createOrder: builder.mutation({
      query: (body) => ({
        url: "/orders",
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "Orders", id: "LIST" }],
    }),

    // עדכון סטטוס (ל־admin / support)
    updateOrderStatus: builder.mutation({
      query: ({ id, status }) => ({
        url: `/orders/${id}/status`,
        method: "PATCH",
        body: { status },
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Order", id },
        { type: "Orders", id: "LIST" },
      ],
    }),

    // מחיקת הזמנה
    deleteOrder: builder.mutation({
      query: (id) => ({
        url: `/orders/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, id) => [
        { type: "Order", id },
        { type: "Orders", id: "LIST" },
      ],
    }),
  }),
});

export const {
  useGetOrdersQuery,
  useGetOrderByIdQuery,
  useCreateOrderMutation,
  useUpdateOrderStatusMutation,
  useDeleteOrderMutation,
} = orderApi;
