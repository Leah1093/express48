import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "./baseApi";

export const authApi = createApi({
    reducerPath: "authApi",
    baseQuery: baseQueryWithReauth,
    tagTypes: ["User"],
    endpoints: (builder) => ({
        login: builder.mutation({
            query: (body) => ({
                url: "/entrance/login",
                method: "POST",
                body,
            }),
            invalidatesTags: [{ type: "User", id: "ME" }],
        }),

        register: builder.mutation({
            query: (body) => ({
                url: "/entrance/register",
                method: "POST",
                body,
            }),
            invalidatesTags: [{ type: "User", id: "ME" }],
        }),

        googleLogin: builder.mutation({
            query: (body) => ({
                url: "/auth/google",
                method: "POST",
                body,
            }),
            invalidatesTags: [{ type: "User", id: "ME" }],
        }),

        getCurrentUser: builder.query({
            query: () => "/entrance/me",
            providesTags: [{ type: "User", id: "ME" }],
            keepUnusedDataFor: 300,
        }),

        logout: builder.mutation({
            query: () => ({
                url: "/entrance/logout",
                method: "POST",
            }),
            invalidatesTags: [{ type: "User", id: "ME" }],
        }),

        forgotPassword: builder.mutation({
            query: ({ email, recaptchaToken }) => ({
                url: "/password/forgot-password",
                method: "POST",
                body: { email, recaptchaToken },
            }),
        }),

        resetPassword: builder.mutation({
            query: ({ token, newPassword }) => ({
                url: "/password/reset-password",
                method: "POST",
                body: { token, newPassword },
            }),
        }),

        changePassword: builder.mutation({
            query: (body) => ({
                url: "/password/change-password",
                method: "POST",
                body,
            }),
        }),

        updateProfile: builder.mutation({
            query: (body) => ({
                url: "/user/update-profile",
                method: "PUT",
                body,
            }),
            invalidatesTags: [{ type: "User", id: "ME" }],
        }),
    }),
});

export const {
    useLoginMutation,
    useRegisterMutation,
    useGoogleLoginMutation,
    useGetCurrentUserQuery,
    useLogoutMutation,
    useForgotPasswordMutation,
    useResetPasswordMutation,
    useUpdateProfileMutation,
    useChangePasswordMutation,
} = authApi;
