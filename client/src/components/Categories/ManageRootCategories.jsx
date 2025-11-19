import { useState } from "react";
import {
  useCreateCategoryMutation,
  useGetRootCategoriesQuery,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
} from "../../redux/services/categoriesApi";

/* ----------------- קומפוננטת מודאל אישור מחיקה ----------------- */
function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = "אישור",
  cancelLabel = "ביטול",
  onConfirm,
  onCancel,
  loading = false,
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40">
      <div
        className="w-full max-w-md rounded-2xl bg-white shadow-xl p-5"
        dir="rtl"
      >
        <div className="flex items-start gap-3">
          <div className="mt-1 flex h-8 w-8 items-center justify-center rounded-full bg-red-50">
            <span className="text-red-500 text-lg">!</span>
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-[#141414]">
              {title}
            </h3>
            <p className="mt-1 text-xs text-gray-600 whitespace-pre-line">
              {message}
            </p>
          </div>
        </div>

        <div className="mt-4 flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="px-3 py-1.5 rounded-xl border border-gray-200 text-xs text-gray-700 hover:bg-gray-50 disabled:opacity-60"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="px-3 py-1.5 rounded-xl bg-red-600 text-xs font-medium text-white hover:bg-red-700 disabled:opacity-60"
          >
            {loading ? "מוחק..." : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ----------------- קומפוננטת מודאל הודעה/שגיאה ----------------- */
function InfoDialog({ open, title, message, onClose }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40">
      <div
        className="w-full max-w-md rounded-2xl bg-white shadow-xl p-5"
        dir="rtl"
      >
        <div className="flex items-start gap-3">
          <div className="mt-1 flex h-8 w-8 items-center justify-center rounded-full bg-[#FFF3EA]">
            <span className="text-[#FF6500] text-lg">!</span>
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-[#141414]">
              {title}
            </h3>
            <p className="mt-1 text-xs text-gray-600 whitespace-pre-line">
              {message}
            </p>
          </div>
        </div>

        <div className="mt-4 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-[#141414] text-xs font-medium text-white hover:bg-black"
          >
            סגירה
          </button>
        </div>
      </div>
    </div>
  );
}

/* ----------------- הקומפוננטה הראשית ----------------- */
export default function ManageRootCategories() {
  const { data: roots, isLoading } = useGetRootCategoriesQuery();

  const [createCategory, { isLoading: isCreating }] =
    useCreateCategoryMutation();
  const [updateCategory, { isLoading: isUpdating }] =
    useUpdateCategoryMutation();
  const [deleteCategory, { isLoading: isDeleting }] =
    useDeleteCategoryMutation();

  // מצב הטופס
  const [editingCategory, setEditingCategory] = useState(null);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [iconFile, setIconFile] = useState(null);

  // מודאלים
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [errorDialog, setErrorDialog] = useState({
    open: false,
    message: "",
  });

  const isSaving = isCreating || isUpdating;

  const resetForm = () => {
    setEditingCategory(null);
    setName("");
    setSlug("");
    setDescription("");
    setImageUrl("");
    setIconFile(null);
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0] || null;
    setIconFile(file);
  };

  const handleGenerateSlug = () => {
    if (!slug && name) {
      setSlug(
        name
          .trim()
          .toLowerCase()
          .replace(/\s+/g, "-")
      );
    }
  };

  const handleEditClick = (cat) => {
    setEditingCategory(cat);
    setName(cat.name || "");
    setSlug(cat.slug || "");
    setDescription(cat.description || "");
    setImageUrl(cat.imageUrl || cat.icon || "");
    setIconFile(null);

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCancelEdit = () => {
    resetForm();
  };

  // פתיחת מודאל מחיקה
  const handleDeleteClick = (cat) => {
    setDeleteTarget(cat);
  };

  // אישור מחיקה מתוך המודאל
  const confirmDelete = async () => {
    if (!deleteTarget) return;

    try {
      await deleteCategory({
        id: deleteTarget._id,
        cascade: false,
      }).unwrap();

      if (editingCategory && editingCategory._id === deleteTarget._id) {
        resetForm();
      }

      setDeleteTarget(null);
    } catch (err) {
      console.error("Failed to delete category:", err);
      setDeleteTarget(null);
      setErrorDialog({
        open: true,
        message: err?.data?.error || "שגיאה במחיקת הקטגוריה",
      });
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();

    const hasExistingImage =
      editingCategory &&
      (editingCategory.icon || editingCategory.imageUrl);

    if (!iconFile && !imageUrl.trim() && !hasExistingImage) {
      setErrorDialog({
        open: true,
        message: "לכל קטגוריה ראשית חייבת להיות תמונה (קובץ או קישור).",
      });
      return;
    }

    try {
      if (editingCategory) {
        // מצב עריכה
        await updateCategory({
          id: editingCategory._id,
          name,
          slug: slug || name,
          description,
          imageUrl: imageUrl.trim() || "",
          icon: iconFile || undefined,
        }).unwrap();
      } else {
        // מצב יצירה
        await createCategory({
          name,
          slug: slug || name,
          description,
          imageUrl: imageUrl.trim() || "",
          icon: iconFile || undefined,
        }).unwrap();
      }

      resetForm();
      e.target.reset();
    } catch (err) {
      console.error("Failed to save category:", err);
      setErrorDialog({
        open: true,
        message: err?.data?.error || "שגיאה בשמירת הקטגוריה",
      });
    }
  };

  return (
    <div
      className="max-w-5xl mx-auto space-y-6 px-4 py-6 lg:px-0"
      dir="rtl"
    >
      {/* כותרת עמוד */}
      <header className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-[#141414]">
            ניהול קטגוריות ראשיות
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            יצירה, עריכה ומחיקה של קטגוריות ראשיות שיופיעו בחלק העליון של האתר.
          </p>
        </div>

        {editingCategory && (
          <div className="flex items-center gap-2 rounded-full bg-[#FFF3EA] px-3 py-1 border border-[#FFE0C2]">
            <span className="w-2 h-2 rounded-full bg-[#FF6500]" />
            <span className="text-xs text-[#7A3E16]">
              מצב עריכה: <strong>{editingCategory.name}</strong>
            </span>
          </div>
        )}
      </header>

      {/* חלוקה לשני טורים: טופס + רשימה */}
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
        {/* טופס יצירה / עריכה */}
        <form
          onSubmit={onSubmit}
          className="rounded-2xl border border-gray-100 bg-white/80 shadow-sm px-5 py-5 space-y-5"
        >
          <div className="flex items-center justify-between mb-1">
            <h2 className="text-sm font-semibold text-[#141414]">
              {editingCategory
                ? "עריכת קטגוריה ראשית"
                : "הוספת קטגוריה ראשית חדשה"}
            </h2>
            {editingCategory && (
              <button
                type="button"
                onClick={handleCancelEdit}
                className="text-xs text-gray-500 hover:text-gray-800 underline-offset-2 hover:underline"
              >
                ביטול עריכה
              </button>
            )}
          </div>

          {/* שם + slug */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* שם */}
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-gray-700">
                שם קטגוריה
              </label>
              <input
                type="text"
                className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-right placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FF6500]/40 focus:border-[#FF6500]"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onBlur={handleGenerateSlug}
                required
              />
            </div>

            {/* slug */}
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-gray-700">
                Slug (כתובת באנגלית)
              </label>
              <input
                type="text"
                dir="ltr"
                className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-left placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FF6500]/40 focus:border-[#FF6500]"
                value={slug}
                onChange={(e) =>
                  setSlug(
                    e.target.value
                      .trim()
                      .toLowerCase()
                      .replace(/\s+/g, "-")
                  )
                }
                placeholder="sound / laptops / tv"
                required
              />
              <p className="text-[11px] text-gray-400">
                הכתובת תופיע ב־URL של הקטגוריה (מומלץ באנגלית בלי רווחים).
              </p>
            </div>
          </div>

          {/* תיאור */}
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-gray-700">
              תיאור (אופציונלי)
            </label>
            <textarea
              className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm min-h-[70px] text-right placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FF6500]/40 focus:border-[#FF6500]"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {/* תמונה / אייקון */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
            {/* קישור */}
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-gray-700">
                קישור לתמונה (אופציונלי)
              </label>
              <input
                type="text"
                className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-left placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FF6500]/40 focus:border-[#FF6500]"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://example.com/image.jpg"
              />
              <p className="text-[11px] text-gray-400 mt-0.5">
                אם תעלי קובץ וגם תמלאי קישור – הקובץ יקבל עדיפות.
              </p>
            </div>

            {/* העלאת קובץ + תצוגה מקדימה */}
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-gray-700">
                תמונה מהמחשב (תעלה לקלאודינרי)
              </label>
              <div className="flex items-center gap-2">
                <label className="inline-flex cursor-pointer items-center justify-center rounded-xl border border-dashed border-gray-300 bg-gray-50 px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-100 transition">
                  בחרי קובץ
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
                {iconFile && (
                  <span className="text-[11px] text-gray-600 truncate max-w-[150px]">
                    {iconFile.name}
                  </span>
                )}
              </div>

              {(imageUrl || editingCategory?.icon || editingCategory?.imageUrl) && (
                <div className="mt-2 flex items-center gap-2">
                  <div className="w-12 h-12 rounded-xl overflow-hidden bg-gray-100 flex items-center justify-center border border-gray-200">
                    <img
                      src={
                        iconFile
                          ? URL.createObjectURL(iconFile)
                          : imageUrl ||
                            editingCategory?.icon ||
                            editingCategory?.imageUrl
                      }
                      alt="תצוגה מקדימה"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <span className="text-[11px] text-gray-500">
                    תצוגה מקדימה לתמונה שתשמר.
                  </span>
                </div>
              )}

              <p className="text-[11px] text-gray-400 mt-0.5">
                מומלץ תמונה ריבועית (1:1) באיכות טובה.
              </p>
            </div>
          </div>

          {/* כפתורי פעולה */}
          <div className="flex items-center justify-between pt-2">
            {editingCategory && (
              <button
                type="button"
                onClick={handleCancelEdit}
                className="text-xs text-gray-500 hover:text-gray-800 underline-offset-2 hover:underline"
              >
                ביטול וחזרה למצב יצירה
              </button>
            )}

            <button
              type="submit"
              disabled={isSaving}
              className="inline-flex items-center justify-center rounded-xl bg-[#141414] px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-black disabled:opacity-60 disabled:cursor-not-allowed transition"
            >
              {isSaving
                ? "שומר..."
                : editingCategory
                ? "עדכון קטגוריה"
                : "הוספת קטגוריה ראשית"}
            </button>
          </div>
        </form>

        {/* רשימת קטגוריות קיימות */}
        <section className="rounded-2xl border border-gray-100 bg-white/80 shadow-sm px-5 py-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-[#141414]">
              קטגוריות קיימות
            </h2>
            <span className="text-[11px] text-gray-400">
              {roots?.length ? `${roots.length} קטגוריות` : ""}
            </span>
          </div>

          {isLoading && (
            <p className="text-sm text-gray-500">טוען קטגוריות...</p>
          )}

          {!isLoading && (!roots || roots.length === 0) && (
            <p className="text-sm text-gray-500">
              אין עדיין קטגוריות. אפשר להתחיל ביצירה בצד שמאל.
            </p>
          )}

          {!isLoading && roots && roots.length > 0 && (
            <ul className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
              {roots.map((cat) => {
                const isEditing = editingCategory?._id === cat._id;

                return (
                  <li
                    key={cat._id}
                    className={[
                      "flex items-center justify-between rounded-xl border bg-white px-3 py-2 text-sm transition",
                      isEditing
                        ? "border-[#FF6500]/70 bg-[#FFF7F2]"
                        : "border-gray-100 hover:bg-gray-50/80",
                    ].join(" ")}
                  >
                    <div className="flex items-center gap-3">
                      {cat.icon && (
                        <div className="w-9 h-9 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center border border-gray-100">
                          <img
                            src={cat.icon}
                            alt={cat.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <div className="flex flex-col">
                        <span className="font-medium text-[#141414]">
                          {cat.name}
                        </span>
                        <span className="text-[11px] text-gray-500">
                          slug: <span dir="ltr">{cat.slug}</span>
                        </span>
                        <span className="text-[11px] text-gray-400">
                          fullSlug: <span dir="ltr">{cat.fullSlug}</span>
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleEditClick(cat)}
                        className="text-xs px-3 py-1 rounded-full border border-gray-200 text-gray-700 hover:bg-gray-100 transition"
                      >
                        עריכה
                      </button>
                      <button
                        type="button"
                        disabled={isDeleting}
                        onClick={() => handleDeleteClick(cat)}
                        className="text-xs px-3 py-1 rounded-full border border-red-100 text-red-600 hover:bg-red-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        מחיקה
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>

      {/* מודאל מחיקה */}
      <ConfirmDialog
        open={!!deleteTarget}
        title="מחיקת קטגוריה"
        message={
          deleteTarget
            ? `האם למחוק את הקטגוריה "${deleteTarget.name}"?\nאם יש מוצרים משויכים – המחיקה תיחסם אוטומטית.`
            : ""
        }
        confirmLabel="מחיקה"
        cancelLabel="ביטול"
        loading={isDeleting}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />

      {/* מודאל הודעות/שגיאות */}
      <InfoDialog
        open={errorDialog.open}
        title="הודעה"
        message={errorDialog.message}
        onClose={() => setErrorDialog({ open: false, message: "" })}
      />
    </div>
  );
}
