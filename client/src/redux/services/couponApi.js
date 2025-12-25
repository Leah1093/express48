import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "./baseApi";

export const couponApi = createApi({
  reducerPath: "couponsApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["Coupon"],
  endpoints: (builder) => ({
    // רשימת קופונים של המוכר
    getCoupons: builder.query({
      query: () => ({
        url: "/coupons",
      }),
      providesTags: (result) =>
        result && Array.isArray(result) && result.length > 0
          ? [
              { type: "Coupon", id: "LIST" },
              ...result.map((coupon) => ({
                type: "Coupon",
                id: coupon._id,
              })),
            ]
          : [{ type: "Coupon", id: "LIST" }],
    }),

    // קופון בודד לפי id (אם תרצי בעתיד למסך עריכה נפרד)
    getCouponById: builder.query({
      query: (id) => ({
        url: `/coupons/${id}`,
      }),
      providesTags: (result, error, id) => [{ type: "Coupon", id }],
    }),

    // יצירת קופון חדש
    createCoupon: builder.mutation({
      query: (body) => ({
        url: "/coupons",
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "Coupon", id: "LIST" }],
    }),

    // עדכון קופון קיים
    updateCoupon: builder.mutation({
      query: ({ id, data }) => ({
        url: `/coupons/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Coupon", id },
        { type: "Coupon", id: "LIST" },
      ],
    }),

    // מחיקת קופון
    deleteCoupon: builder.mutation({
      query: (id) => ({
        url: `/coupons/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, id) => [
        { type: "Coupon", id },
        { type: "Coupon", id: "LIST" },
      ],
    }),
    validateCoupon: builder.mutation({
      query: (body) => ({
        url: "/coupons/validate",
        method: "POST",
        body, // { code, cart }
      }),
    }),

    // ----- צד לקוח: החלת קופון (עדכון usedBy) -----
    applyCoupon: builder.mutation({
      query: (code) => ({
        url: "/coupons/apply",
        method: "POST",
        body: { code },
      }),
    }),
  }),
});

export const {
  useGetCouponsQuery,
  useGetCouponByIdQuery,
  useCreateCouponMutation,
  useUpdateCouponMutation,
  useDeleteCouponMutation,
  useValidateCouponMutation,
  useApplyCouponMutation,

} = couponApi;
