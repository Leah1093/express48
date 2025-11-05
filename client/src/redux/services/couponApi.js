// src/redux/services/couponsApi.js
import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "./baseApi";

export const couponsApi = createApi({
  reducerPath: "couponsApi",
  baseQuery: baseQueryWithReauth,          // כולל credentials: "include" וריענון טוקן
  tagTypes: ["Coupon"],
  endpoints: (builder) => ({
    createCoupon: builder.mutation({
      query: (body) => ({
        url: "/coupons",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Coupon"],
    }),

    // אופציונלי (אם תצטרכי רשימה/עריכה בהמשך):
    // getCoupons: builder.query({
    //   query: (params) => ({ url: "/coupons", params }),
    //   providesTags: ["Coupon"],
    // }),
    // updateCoupon: builder.mutation({
    //   query: ({ id, ...body }) => ({ url: `/coupons/${id}`, method: "PUT", body }),
    //   invalidatesTags: ["Coupon"],
    // }),
    // deleteCoupon: builder.mutation({
    //   query: (id) => ({ url: `/coupons/${id}`, method: "DELETE" }),
    //   invalidatesTags: ["Coupon"],
    // }),
  }),
});

export const {
  useCreateCouponMutation,
  // useGetCouponsQuery,
  // useUpdateCouponMutation,
  // useDeleteCouponMutation,
} = couponsApi;
