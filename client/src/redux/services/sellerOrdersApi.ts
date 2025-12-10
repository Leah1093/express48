import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "./baseApi";
import type {
  SellerOrderApiResponse,
  OrderStatus,
} from "../../components/seller/orders/types/sellerOrders.types";

export interface GetSellerOrdersParams {
  status?: OrderStatus;
  search?: string;
}

export const sellerOrdersApi = createApi({
  reducerPath: "sellerOrdersApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["SellerOrders"],
  endpoints: (builder) => ({
    getSellerOrders: builder.query<
      SellerOrderApiResponse[],
      GetSellerOrdersParams | void
    >({
      query: (params) => {
        const qp = new URLSearchParams();
        if (params?.status) qp.set("status", params.status);
        if (params?.search) qp.set("search", params.search);

        const queryString = qp.toString();
        return {
          url: queryString
            ? `/seller/orders?${queryString}`
            : "/seller/orders",
          method: "GET",
        };
      },
      providesTags: (result) =>
        result
          ? [
              ...result.map((o) => ({
                type: "SellerOrders" as const,
                id: o._id,
              })),
              { type: "SellerOrders" as const, id: "LIST" },
            ]
          : [{ type: "SellerOrders" as const, id: "LIST" }],
    }),
    updateSellerOrderStatus: builder.mutation<
      { success: boolean },
      { orderId: string; status: OrderStatus }
    >({
      query: ({ orderId, status }) => ({
        url: `/seller/orders/${orderId}/status`,
        method: "PATCH",
        body: { status },
      }),
      invalidatesTags: (result, error, arg) => [
        { type: "SellerOrders", id: "LIST" },
        { type: "SellerOrders", id: arg.orderId },
      ],
    }),
    
  }),
  
});

export const { useGetSellerOrdersQuery , useUpdateSellerOrderStatusMutation } = sellerOrdersApi;
