// src/redux/services/baseApi.js
import { fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const baseQuery = fetchBaseQuery({
    baseUrl: import.meta.env.VITE_API_URL,
    credentials: "include", // שולח cookies אוטומטית
});

export const baseQueryWithReauth = async (args, api, extraOptions) => {
    let result = await baseQuery(args, api, extraOptions);

    if (result?.error?.status === 401) {
        // מנסה לרענן טוקן
        console.log("refresh",extraOptions,api)
        const refreshResult = await baseQuery({ url: "/entrance/refresh", method: "POST" }, api, extraOptions);
        console.log("after refresh")

        if (refreshResult?.data) {
            // מנסה שוב את הבקשה המקורית אחרי ריענון מוצלח
            result = await baseQuery(args, api, extraOptions);
        } else {
            // אם ריענון נכשל → ננקה state
            api.dispatch({ type: "user/logout" });
        }
    }

    return result;
};
