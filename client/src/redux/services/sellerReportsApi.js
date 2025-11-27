// src/redux/services/sellerReportsApi.js
import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "./baseApi";

// בניית אובייקט params בלי ערכים ריקים/undefined
const buildReportQueryParams = (base = {}) => {
  const params = new URLSearchParams();

  if (base.from) params.set("from", base.from);
  if (base.to) params.set("to", base.to);
  if (base.page != null) params.set("page", String(base.page));
  if (base.limit != null) params.set("limit", String(base.limit));

  return Object.fromEntries(params.entries());
};

export const sellerReportsApi = createApi({
  reducerPath: "sellerReportsApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["SellerReports"],
  endpoints: (builder) => ({

    // --- דוח מוצרים למוכר: מוצר | מלאי | נמכר | סכום ---
    getSellerProductReports: builder.query({
      // queryParams צפוי להיות אובייקט: { from, to, page, limit }
      query: (queryParams = {}) => {
        const params = buildReportQueryParams(queryParams);

        return {
          url: "/seller/reports/products",
          method: "GET",
          params,
        };
      },
      providesTags: (res) => {
        const items = res?.items || [];
        return [
          { type: "SellerReports", id: "LIST" },
          ...items.map((item) => ({
            type: "SellerReports",
            id: item.productId,
          })),
        ];
      },
      keepUnusedDataFor: 60,
    }),

    // --- פירוט למוצר אחד (כשפותחים שורה בטבלה) ---
    getSellerProductReportDetails: builder.query({
      // args: { productId, from?, to?, page?, limit? }
      query: ({ productId, ...queryParams }) => {
        const params = buildReportQueryParams(queryParams);

        return {
          url: `/seller/reports/products/${productId}`,
          method: "GET",
          params,
        };
      },
      providesTags: (res, err, args) => ([
        {
          type: "SellerReports",
          id: res?.productId || args?.productId || "DETAILS",
        },
      ]),
    }),

  }),
});

export const {
  useGetSellerProductReportsQuery,
  useGetSellerProductReportDetailsQuery,
} = sellerReportsApi;
