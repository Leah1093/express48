import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "./baseApi";

export const userApi = createApi({
  reducerPath: "userApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["User"],
  endpoints: (builder) => ({
     // 🔹 רשימת משתמשים (להגבלת קופון ללקוחות ספציפיים)
    listUsers: builder.query({
      query: () => ({
        url: "/user/seller/users", // <<< לכי לפי מה שיש לך בשרת
        method: "GET",
      }),
      providesTags: ["User"],
    }),

    updateProfile: builder.mutation({
      query: (body) => ({
        url: "/user/update-profile",
        method: "PUT",
        body,
      }),
      invalidatesTags: ["User"],
    }),

    changePassword: builder.mutation({
      query: (body) => ({
        url: "/password/change-password",
        method: "POST",
        body,
      }),
    }),
  }),
});

export const {
  useListUsersQuery,
  useUpdateProfileMutation,
  useChangePasswordMutation,
} = userApi;
