// src/redux/services/categoriesApi.js
import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "./baseApi";

export const categoriesApi = createApi({
  reducerPath: "categoriesApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["Categories", "Category"],
  endpoints: (builder) => ({

    // רשימת קטגוריות (扯 עץ מלא – מחזיר גם ראשיות וגם תתי־קטגוריות)
    getCategories: builder.query({
      query: () => ({ url: "/categories", method: "GET" }),
      providesTags: (result) => {
        if (!result) return ["Categories"];
        const items = Array.isArray(result) ? result : [];
        return [
          "Categories",
          ...items.map((c) => ({ type: "Category", id: c._id })),
        ];
      },
      keepUnusedDataFor: 60,
    }),

    // יצירה (תומך ב־FormData: name, parentId?, icon?)
    createCategory: builder.mutation({
      query: ({ name, parentId, icon }) => {
        const fd = new FormData();
        fd.append("name", name);
        if (parentId) fd.append("parentId", parentId);
        // אייקון נדרש רק לקטגוריה ראשית (לפי הלוגיקה שלך)
        if (!parentId && icon) fd.append("icon", icon);
        return {
          url: "/categories",
          method: "POST",
          body: fd,
        };
      },
      invalidatesTags: ["Categories"],
    }),

    // עדכון (FormData כך שניתן לעדכן שם/היררכיה/אייקון)
    updateCategory: builder.mutation({
      query: ({ id, name, parentId, icon }) => {
        const fd = new FormData();
        if (name != null) fd.append("name", name);
        if (parentId != null) fd.append("parentId", parentId);
        if (!parentId && icon) fd.append("icon", icon); // אייקון רק לראשית
        return {
          url: `/categories/${id}`,
          method: "PUT",
          body: fd,
        };
      },
      invalidatesTags: (res, err, { id }) => [
        "Categories",
        { type: "Category", id },
      ],
    }),

    // מחיקה
    deleteCategory: builder.mutation({
      query: (id) => ({
        url: `/categories/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Categories"],
    }),

    // אופציונלי: העלאת אייקון בנתיב נפרד (אם תרצי להשתמש בו)
    uploadCategoryIcon: builder.mutation({
      query: ({ id, icon }) => {
        const fd = new FormData();
        fd.append("icon", icon);
        return {
          url: `/categories/${id}/icon`,
          method: "POST",
          body: fd,
        };
      },
      invalidatesTags: (res, err, { id }) => [
        "Categories",
        { type: "Category", id },
      ],
    }),
  }),
});

export const {
  useGetCategoriesQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
  useUploadCategoryIconMutation, // אופציונלי
} = categoriesApi;
