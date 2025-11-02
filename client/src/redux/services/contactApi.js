// src/redux/services/contactApi.js
import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "./baseApi";

export const contactApi = createApi({
  reducerPath: "contactApi",
  baseQuery: baseQueryWithReauth,
  endpoints: (builder) => ({
    sendContact: builder.mutation({
      query: (body) => ({
        url: "/contact/send",
        method: "POST",
        body, // { name, email, phone, message, honeypot?, recaptchaToken }
      }),
    }),
  }),
});

export const { useSendContactMutation } = contactApi;
