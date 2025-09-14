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
                url: "/auth/google",   // ← הנתיב שהגדרת בשרת
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
    }),
});

export const {
    useLoginMutation,
    useRegisterMutation,
    useGoogleLoginMutation,
    useGetCurrentUserQuery,
    useLogoutMutation,
} = authApi;
