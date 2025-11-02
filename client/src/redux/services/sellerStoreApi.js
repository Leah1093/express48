// src/redux/services/sellerStoreApi.js
import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "./baseApi";

/**
 * תג יחיד "MyStore" לקאש חכם:
 * - getMyStore -> providesTags: [{type:'MyStore', id:'ME'}]
 * - כל עדכון/פרסום/סלוג/מדיה -> invalidatesTags: [{type:'MyStore', id:'ME'}]
 */
export const sellerStoreApi = createApi({
  reducerPath: "sellerStoreApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["MyStore"],
  endpoints: (builder) => ({

    // שליפה של החנות שלי
    getMyStore: builder.query({
      query: () => ({ url: "/seller-store/me", method: "GET" }),
      providesTags: [{ type: "MyStore", id: "ME" }],
      keepUnusedDataFor: 60,
    }),

    // שמירה/עדכון (JSON)
    saveMyStore: builder.mutation({
      query: (payload) => ({
        url: "/seller-store/me",
        method: "PUT",
        body: payload,
      }),
      invalidatesTags: [{ type: "MyStore", id: "ME" }],
    }),

    // עדכון סלוג
    updateMySlug: builder.mutation({
      query: (slug) => ({
        url: "/seller-store/me/slug",
        method: "PUT",
        body: { slug },
      }),
      invalidatesTags: [{ type: "MyStore", id: "ME" }],
    }),

    // פרסום חנות (יציאה מ-draft)
    publishMyStore: builder.mutation({
      query: () => ({
        url: "/seller-store/me/status",
        method: "PUT",
        body: { status: "active" },
      }),
      invalidatesTags: [{ type: "MyStore", id: "ME" }],
    }),

    // העלאת מדיה (multipart/form-data)
    uploadStoreMedia: builder.mutation({
      query: ({ bannerTypeStore, bannerTypeList, replaceSlider = false, files = {} }) => {
        const fd = new FormData();
        fd.append("bannerTypeStore", bannerTypeStore || "static");
        fd.append("bannerTypeList", bannerTypeList || "static");
        fd.append("replaceSlider", replaceSlider ? "true" : "false");
        if (files.logo) fd.append("logo", files.logo);
        if (files.storeBanner) fd.append("storeBanner", files.storeBanner);
        if (files.mobileBanner) fd.append("mobileBanner", files.mobileBanner);
        if (files.listBanner) fd.append("listBanner", files.listBanner);
        (files.slider || []).forEach((f) => fd.append("slider", f));
        return {
          url: "/seller-store/me/media",
          method: "POST",
          body: fd, // אל תשימי headers: fetchBaseQuery מזהה FormData לבד
        };
      },
      invalidatesTags: [{ type: "MyStore", id: "ME" }],
    }),

  }),
});

export const {
  useGetMyStoreQuery,
  useSaveMyStoreMutation,
  useUpdateMySlugMutation,
  usePublishMyStoreMutation,
  useUploadStoreMediaMutation,
} = sellerStoreApi;
