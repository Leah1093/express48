// src/redux/services/categoriesApi.js
import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "./baseApi";

// בונה query string נקי
const qs = (obj = {}) =>
  Object.entries(obj)
    .filter(([, v]) => v !== undefined && v !== null && v !== "")
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
    .join("&");

export const categoriesApi = createApi({
  reducerPath: "categoriesApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["Categories", "Category", "Tree"],
  endpoints: (builder) => ({
    // -------- רשימה כללית --------
    getCategories: builder.query({
      query: ({ parent, depth, active } = {}) => {
        const query = qs({ parent, depth, active });
        return { url: `/categories${query ? `?${query}` : ""}`, method: "GET" };
      },
      providesTags: (result) => [
        "Categories",
        ...(Array.isArray(result) ? result.map((c) => ({ type: "Category", id: c._id })) : []),
      ],
      keepUnusedDataFor: 60,
    }),

    // -------- שורשים --------
    getRootCategories: builder.query({
      query: () => ({ url: "/categories/roots", method: "GET" }),
      providesTags: (result) => [
        "Categories",
        ...(Array.isArray(result) ? result.map((c) => ({ type: "Category", id: c._id })) : []),
      ],
      keepUnusedDataFor: 60,
    }),

    // -------- לפי fullSlug --------
    getCategoryByFullSlug: builder.query({
      query: (fullSlug) => ({
        url: `/categories/by/fullSlug/${encodeURIComponent(fullSlug)}`,
        method: "GET",
      }),
      providesTags: (res) => (res?._id ? [{ type: "Category", id: res._id }] : ["Categories"]),
    }),

    // -------- ילדים ישירים --------
    getCategoryChildren: builder.query({
      query: (id) => ({ url: `/categories/${id}/children`, method: "GET" }),
      providesTags: (result, _err, id) => [
        { type: "Category", id },
        ...(Array.isArray(result) ? result.map((c) => ({ type: "Category", id: c._id })) : []),
      ],
      keepUnusedDataFor: 60,
    }),

    // -------- עץ מקונן מה־id (שם אנדפוינט שמתאים להוק שהקומפוננטה מצפה לו) --------
    getCategoryTreeFrom: builder.query({
      query: ({ id, maxDepth = 2 } = {}) => {
        const query = qs({ maxDepth });
        return { url: `/categories/${id}/tree${query ? `?${query}` : ""}`, method: "GET" };
      },
      providesTags: (res, _err, { id }) => [{ type: "Tree", id }],
      keepUnusedDataFor: 60,
    }),

    // (נשאיר גם ורסיה בשם כללי למקרה שיש שימושים אחרים בקוד)
    getCategoryTree: builder.query({
      query: ({ id, maxDepth = 2 } = {}) => {
        const query = qs({ maxDepth });
        return { url: `/categories/${id}/tree${query ? `?${query}` : ""}`, method: "GET" };
      },
      providesTags: (res, _err, { id }) => [{ type: "Tree", id }],
      keepUnusedDataFor: 60,
    }),

    // -------- שליפה בודדת --------
    getCategoryById: builder.query({
      query: (id) => ({ url: `/categories/${id}`, method: "GET" }),
      providesTags: (_res, _err, id) => [{ type: "Category", id }],
      keepUnusedDataFor: 60,
    }),

    // -------- יצירה --------
    createCategory: builder.mutation({
      query: ({
        name,
        slug,
        parent = null,
        order = 0,
        isActive = true,
        imageUrl = "",
        description = "",
        icon, // File/Blob אופציונלי
      }) => {
        const fd = new FormData();
        fd.append("name", String(name ?? ""));
        fd.append("slug", String(slug ?? "").toLowerCase());
        if (parent !== undefined && parent !== null) fd.append("parent", String(parent));
        if (parent === null) fd.append("parent", "null");
        fd.append("order", String(order ?? 0));
        fd.append("isActive", String(!!isActive));
        if (imageUrl) fd.append("imageUrl", imageUrl);
        if (description) fd.append("description", description);
        if (icon) fd.append("icon", icon);

        return { url: "/categories", method: "POST", body: fd };
      },
      invalidatesTags: ["Categories"],
    }),

    // -------- עדכון --------
    updateCategory: builder.mutation({
      query: ({
        id,
        name,
        slug,
        parent, // undefined=לא לשנות, null=שורש, או ObjectId
        order,
        isActive,
        imageUrl,
        description,
        icon,
      }) => {
        const fd = new FormData();
        if (name !== undefined) fd.append("name", String(name));
        if (slug !== undefined) fd.append("slug", String(slug).toLowerCase());
        if (parent !== undefined) fd.append("parent", parent === null ? "null" : String(parent));
        if (order !== undefined) fd.append("order", String(order));
        if (isActive !== undefined) fd.append("isActive", String(!!isActive));
        if (imageUrl !== undefined) fd.append("imageUrl", imageUrl);
        if (description !== undefined) fd.append("description", description);
        if (icon) fd.append("icon", icon);

        return { url: `/categories/${id}`, method: "PUT", body: fd };
      },
      invalidatesTags: (res, err, { id }) => [
        "Categories",
        { type: "Category", id },
        { type: "Tree", id },
      ],
    }),

    // -------- מחיקה --------
    deleteCategory: builder.mutation({
      query: ({ id, cascade = false }) => ({
        url: `/categories/${id}?${qs({ cascade })}`,
        method: "DELETE",
      }),
      invalidatesTags: (res, err, { id }) => [
        "Categories",
        { type: "Category", id },
        { type: "Tree", id },
      ],
    }),

    // -------- העלאת אייקון --------
    uploadCategoryIcon: builder.mutation({
      query: ({ id, icon }) => {
        const fd = new FormData();
        fd.append("icon", icon);
        return { url: `/categories/${id}/icon`, method: "POST", body: fd };
      },
      invalidatesTags: (res, err, { id }) => [{ type: "Category", id }, "Categories"],
    }),
  }),
});

export const {
  // Queries
  useGetCategoriesQuery,
  useGetRootCategoriesQuery,
  useGetCategoryByIdQuery,
  useGetCategoryByFullSlugQuery,
  useGetCategoryChildrenQuery,
  useGetCategoryTreeFromQuery, // ← זה ההוק שהקומפוננטה צריכה
  useGetCategoryTreeQuery,      // ← נשאר גם בשם הכללי למקרה שצריך

  // Mutations
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
  useUploadCategoryIconMutation,
} = categoriesApi;
