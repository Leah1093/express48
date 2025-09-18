// src/redux/services/authApi.js
import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "./baseApi";

export const authApi = createApi({
    reducerPath: "authApi",
    baseQuery: baseQueryWithReauth,
    endpoints: (builder) => ({
        login: builder.mutation({
            query: (body) => ({
                url: "/entrance/login",
                method: "POST",
                body,
            }),
        }),
        register: builder.mutation({
            query: (body) => ({
                url: "/entrance/register",
                method: "POST",
                body,
            }),
        }),
        googleLogin: builder.mutation({
            query: (body) => ({
                url: "/auth/google",
                method: "POST",
                body,
            }),
        }),
        getCurrentUser: builder.query({
            query: () => "/entrance/me",
        }),
        logout: builder.mutation({
            query: () => ({
                url: "/entrance/logout",
                method: "POST",
            }),
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
        updatePassword: builder.mutation({
            query: (body) => ({
                url: "/password/update-password",
                method: "POST",
                body,
            }),
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
    useUpdatePasswordMutation,
} = authApi;
