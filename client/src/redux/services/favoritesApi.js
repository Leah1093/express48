// src/redux/services/favoritesApi.js
import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "./baseApi";

export const favoritesApi = createApi({
  reducerPath: "favoritesApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["Favorite", "Favorites"],
  endpoints: (builder) => ({
    // ✔ שליפת המועדפים של היוזר המחובר
    getFavorites: builder.query({
      // אפשר להעביר limit / skip אם תרצי
      query: ({ limit = 200, skip = 0 } = {}) => ({
        url: `/favorites?limit=${limit}&skip=${skip}`,
        method: "GET",
      }),
      // השרת מחזיר { ok: true, items: [...] } → אנחנו מחזירים רק items
      transformResponse: (response) => response?.items ?? [],
      providesTags: (result) =>
        result && Array.isArray(result)
          ? [
              ...result.map((fav) => ({
                type: "Favorite",
                id:
                  fav._id ||
                  fav.productId?._id ||
                  fav.productId || // למקרה שה-populate לא מלא
                  "UNKNOWN",
              })),
              { type: "Favorites", id: "LIST" },
            ]
          : [{ type: "Favorites", id: "LIST" }],
    }),

    // ✔ הוספה למועדפים (POST /favorites)
    addFavorite: builder.mutation({
      query: (productId) => ({
        url: "/favorites",
        method: "POST",
        body: { productId },
      }),
      invalidatesTags: (result, error, productId) => [
        { type: "Favorite", id: productId },
        { type: "Favorites", id: "LIST" },
      ],
    }),

    // ✔ הסרה ממועדפים (DELETE /favorites/:productId)
    removeFavorite: builder.mutation({
      query: (productId) => ({
        url: `/favorites/${productId}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, productId) => [
        { type: "Favorite", id: productId },
        { type: "Favorites", id: "LIST" },
      ],
    }),

    // אופציונלי: מיזוג מועדפים אנונימיים אחרי לוגין (POST /favorites/merge)
    mergeFavorites: builder.mutation({
      query: (items) => ({
        url: "/favorites/merge",
        method: "POST",
        body: { items }, // [{ productId, addedAt }, ...]
      }),
      transformResponse: (response) => response?.items ?? [],
      invalidatesTags: [{ type: "Favorites", id: "LIST" }],
    }),

    // אופציונלי: בדיקה אם מוצר ספציפי במועדפים (GET /favorites/exists)
    existsFavorite: builder.query({
      query: (productId) => ({
        url: `/favorites/exists?productId=${productId}`,
        method: "GET",
      }),
      transformResponse: (response) => Boolean(response?.exists),
      providesTags: (result, error, productId) => [
        { type: "Favorite", id: productId },
      ],
    }),
  }),
});

export const {
  useGetFavoritesQuery,
  useAddFavoriteMutation,
  useRemoveFavoriteMutation,
  useMergeFavoritesMutation,
  useExistsFavoriteQuery,
} = favoritesApi;
