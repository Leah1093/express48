import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "./baseApi";

export const adminApi = createApi({
    reducerPath: "adminApi",
    baseQuery: baseQueryWithReauth,
    tagTypes: ["AdminSellers", "AdminSeller", "AdminStore"],
    endpoints: (builder) => ({

        getAdminSellerApplications: builder.query({
            query: ({ status, q, page = 1, limit = 20 } = {}) => ({
                url: "/marketplace/admin/sellers",
                params: { status, q, page, limit },
            }),
            providesTags: (result) => {
                if (!result?.items) return ["AdminSellers"];
                return [
                    "AdminSellers",
                    ...result.items.map((s) => ({ type: "AdminSeller", id: s.id || s._id })),
                ];
            },
            keepUnusedDataFor: 30,
        }),

        getAdminSellerApplicationById: builder.query({
            query: (id) => ({
                url: "/marketplace/admin/sellers",
                params: { id },
            }),
            providesTags: (res, err, id) => [{ type: "AdminSeller", id }, "AdminSellers"],
        }),

        updateAdminSellerApplicationStatus: builder.mutation({
            query: ({ id, status, note = "" }) => ({
                url: `/marketplace/admin/sellers/${id}/status`,
                method: "PATCH",
                body: { status, note },
            }),
            invalidatesTags: (res, err, { id }) => [
                { type: "AdminSeller", id },
                "AdminSellers",
            ],
        }),

        getAdminStoreById: builder.query({
            query: (id) => ({
                url: `/seller-store/admin/${id}`,
                method: "GET",
            }),
            providesTags: (res, err, id) => [{ type: "AdminStore", id }],
        }),

        updateAdminStoreStatus: builder.mutation({
            query: ({ id, status, note = "" }) => ({
                url: `/seller-store/admin/${id}/status`,
                method: "PATCH",
                body: { status, note },
            }),
            invalidatesTags: (res, err, { id }) => [{ type: "AdminStore", id }],
        }),

        updateAdminStoreSlug: builder.mutation({
            query: ({ id, slug }) => ({
                url: `/seller-store/admin/${id}/slug`,
                method: "PUT",
                body: { slug },
            }),
            invalidatesTags: (res, err, { id }) => [{ type: "AdminStore", id }],
        }),

        getAdminSellerApplicationsSimple: builder.query({
            query: () => ({
                url: "/marketplace/admin/seller-applications",
                method: "GET",
            }),
            providesTags: (result) => {
                const base = ["AdminApplications"];
                if (!result?.rows) return base;
                return [
                    ...base,
                    ...result.rows.map((r) => ({ type: "AdminApplication", id: r._id })),
                ];
            },
            keepUnusedDataFor: 30,
        }),

        approveAdminSellerApplication: builder.mutation({
            query: (id) => ({
                url: `/marketplace/admin/seller-applications/${id}/approve`,
                method: "PATCH",
            }),
            invalidatesTags: (res, err, id) => [
                { type: "AdminApplication", id },
                "AdminApplications",
            ],
        }),

        rejectAdminSellerApplication: builder.mutation({
            query: ({ id, reason = "" }) => ({
                url: `/marketplace/admin/seller-applications/${id}/reject`,
                method: "PATCH",
                body: { reason },
            }),
            invalidatesTags: (res, err, { id }) => [
                { type: "AdminApplication", id },
                "AdminApplications",
            ],
        }),
    }),
});

export const {
    useGetAdminSellerApplicationsQuery,
    useGetAdminSellerApplicationByIdQuery,
    useUpdateAdminSellerApplicationStatusMutation,
    useGetAdminStoreByIdQuery,
    useUpdateAdminStoreStatusMutation,
    useGetAdminSellerApplicationsSimpleQuery,
    useApproveAdminSellerApplicationMutation,
    useRejectAdminSellerApplicationMutation,
    useUpdateAdminStoreSlugMutation,
} = adminApi;
