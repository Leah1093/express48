// api/favoritesApi.js
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const favoritesApi = createApi({
  reducerPath: 'favoritesApi',
  baseQuery: fetchBaseQuery({
    baseUrl: 'http://localhost:8080',
    credentials: 'include', // חשוב אם את משתמשת ב־cookies
  }),
  tagTypes: ['Favorites'],
  endpoints: (builder) => ({
    listFavorites: builder.query({
      query: () => '/favorites',
      providesTags: ['Favorites'],
    }),
    addFavorite: builder.mutation({
      query: (productId) => ({
        url: '/favorites',
        method: 'POST',
        body: { productId },
      }),
      invalidatesTags: ['Favorites'],
    }),
    removeFavorite: builder.mutation({
      query: (productId) => ({
        url: `/favorites/${productId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Favorites'],
    }),
  }),
});

export const {
  useListFavoritesQuery,
  useAddFavoriteMutation,
  useRemoveFavoriteMutation,
} = favoritesApi;
