import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "./baseApi";

export const uploadApi = createApi({
  reducerPath: "uploadApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["Upload"],
  endpoints: (builder) => ({
    // העלאת תמונה לסקירה (overview)
    uploadOverviewImage: builder.mutation({
      query: (file) => {
        const formData = new FormData();
        formData.append("image", file);

        return {
          url: "/uploads/image", 
          method: "POST",
          body: formData,
        };
      },
      invalidatesTags: ["Upload"],
    }),
  }),
});

export const { useUploadOverviewImageMutation } = uploadApi;
