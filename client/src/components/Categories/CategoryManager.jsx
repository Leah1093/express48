// import { useState, useEffect } from "react";
// import axios from "axios";

// export default function CategoryManager({ onCategoriesChange }) {
//     const [categories, setCategories] = useState([]);
//     const [name, setName] = useState("");
//     const [icon, setIcon] = useState(null);
//     const [selectedId, setSelectedId] = useState(null); // לעדכון/מחיקה
//     const [parentId, setParentId] = useState(null);


//     // שליפת קטגוריות מהשרת
//     const loadCategories = async () => {
//         const res = await axios.get("https://api.express48.com/categories", { withCredentials: true });
//         setCategories(res.data);
//         onCategoriesChange(res.data); // מעדכן את קומפוננטת הצד
//     };

//     useEffect(() => {
//         loadCategories();
//     }, []);

//     //   // הוספה או עדכון קטגוריה
//     //   const handleSubmit = async (e) => {
//     //     e.preventDefault();
//     //     try {
//     //       let catId = selectedId;

//     //       if (!catId) {
//     //         // יצירת קטגוריה חדשה
//     //         const res = await axios.post(
//     //           "https://api.express48.com/categories",
//     //           { name },
//     //           { withCredentials: true }
//     //         );
//     //         catId = res.data._id;
//     //       } else {
//     //         // עדכון קטגוריה קיימת
//     //         await axios.put(
//     //           `https://api.express48.com/categories/${catId}`,
//     //           { name },
//     //           { withCredentials: true }
//     //         );
//     //       }

//     //       // אם הועלתה תמונה – שלח אייקון
//     //       if (icon) {
//     //         const formData = new FormData();
//     //         formData.append("icon", icon);
//     //         await axios.post(
//     //           `https://api.express48.com/categories/${catId}/icon`,
//     //           formData,
//     //           { headers: { "Content-Type": "multipart/form-data" }, withCredentials: true }
//     //         );
//     //       }

//     //       setName("");
//     //       setIcon(null);
//     //       setSelectedId(null);

//     //       await loadCategories();
//     //     } catch (err) {
//     //       console.error(err.response.data);
//     //     }
//     //   };

//     // הוספה או עדכון קטגוריה
//     const handleSubmit = async (e) => {
//         e.preventDefault();
//         try {
//             // בדיקת שם ריק
//             if (!name.trim()) {
//                 alert("חייב למלא שם קטגוריה");
//                 return;
//             }

//             // קטגוריה ראשית: חייב גם שם וגם תמונה - אבל רק ביצירה (לא בעדכון)
//             if (!selectedId && !parentId && !icon) {
//                 alert("חייב להוסיף גם שם וגם תמונה לקטגוריה ראשית");
//                 return;
//             }


//             // תת קטגוריה: חייב שם, תמונה לא חובה
//             if (parentId && !name.trim()) {
//                 alert("חייב להוסיף שם לתת קטגוריה");
//                 return;
//             }

//             const exists = categories.some(
//                 (cat) => cat.name.trim() === name.trim() && cat._id !== selectedId
//             );
//             if (exists) {
//                 alert("קטגוריה בשם הזה כבר קיימת!");
//                 return;
//             }
//             const formData = new FormData();
//             formData.append("name", name);          // מוסיפים שם ל-FormData
//             if (parentId) formData.append("parentId", parentId || ""); // אם זו תת קטגוריה
//             if (!parentId && icon) formData.append("icon", icon); // רק קטגוריה ראשית מקבלת אייקון
//             // if (icon) formData.append("icon", icon); // אם יש קובץ – מוסיפים גם אותו
//             // if (parentId) formData.append("parentId", parentId); // אם יש היררכיה

//             // ✅ כאן להוסיף debug:
//             for (let pair of formData.entries()) {
//                 console.log(pair[0], pair[1]);
//             }

//             if (!selectedId) {
//                 // יצירת קטגוריה חדשה
//                 await axios.post("https://api.express48.com/categories", formData, {
//                     headers: { "Content-Type": "multipart/form-data" },
//                     withCredentials: true,
//                 });
//             } else {
//                 // עדכון קטגוריה קיימת
//                 await axios.put(
//                     `https://api.express48.com/categories/${selectedId}`,
//                     formData,
//                     {
//                         headers: { "Content-Type": "multipart/form-data" },
//                         withCredentials: true,
//                     }
//                 );
//             }

//             setName("");
//             setIcon(null);
//             setSelectedId(null);

//             await loadCategories();
//         } catch (err) {
//             console.error(err.response?.data || err.message);
//         }
//     };


//     // מחיקת קטגוריה
//     const handleDelete = async (id) => {
//         try {
//             await axios.delete(`https://api.express48.com/categories/${id}`, { withCredentials: true });
//             if (id === selectedId) setSelectedId(null);
//             await loadCategories();
//         } catch (err) {
//             console.error(err);
//         }
//     };

//     return (
//          <div className="flex justify-center items-start min-h-screen bg-gray-100">
//         <div className="p-4 border-t bg-gray-50 w-[600px]">
//             <form onSubmit={handleSubmit} className="space-y-3">
//                 <input
//                     type="text"
//                     placeholder="שם קטגוריה"
//                     value={name}
//                     onChange={(e) => setName(e.target.value)}
//                     className="w-full border rounded px-3 py-2 text-sm"
//                 />

//                 <select
//                     value={parentId || ""}
//                     onChange={(e) => setParentId(e.target.value || null)}
//                     className="w-full border rounded px-3 py-2 text-sm"
//                 >
//                     <option value="">קטגוריה ראשית</option>
//                     {categories
//                         .filter((cat) => !cat.parentId) // רק קטגוריות ראשיות
//                         .map((cat) => (
//                             <option key={cat._id} value={cat._id}>
//                                 {cat.name}
//                             </option>
//                         ))}
//                 </select>

//                 {!parentId && (
//                     <input
//                         type="file"
//                         accept="image/*"
//                         onChange={(e) => {
//                             console.log("file picked:", e.target.files[0]);
//                             setIcon(e.target.files[0]);
//                         }}
//                         className="w-full text-sm"
//                     />)}

//                 <div className="flex gap-2">
//                     <button
//                         type="submit"
//                         className="flex-1 bg-blue-600 text-white px-3 py-2 rounded text-sm hover:bg-blue-700"
//                     >
//                         {selectedId ? "עדכן קטגוריה" : "הוסף קטגוריה"}
//                     </button>
//                     {selectedId && (
//                         <button
//                             type="button"
//                             onClick={() => handleDelete(selectedId)}
//                             className="bg-red-500 text-white px-3 py-2 rounded text-sm hover:bg-red-600"
//                         >
//                             מחק
//                         </button>
//                     )}
//                 </div>
//             </form>

//             {/* רשימת קטגוריות לניהול */}
//             <ul className="mt-4 space-y-2">
//                 {categories
//                     .filter((cat) => !cat.parentId) // רק קטגוריות ראשיות
//                     .map((cat) => (
//                         <li
//                             key={cat._id}
//                             onClick={() => {
//                                 setSelectedId(cat._id);
//                                 setName(cat.name);
//                                 setParentId(null); // כי זו קטגוריה ראשית
//                             }}
//                             className={`px-3 py-2 rounded cursor-pointer ${selectedId === cat._id ? "bg-gray-200" : "hover:bg-gray-100"
//                                 }`}
//                         >
//                             <div className="flex items-center justify-between">
//                                 <span className="font-semibold">{cat.name}</span>
//                                 {cat.icon && (
//                                     <img
//                                         src={`https://api.express48.com${cat.icon}`}
//                                         alt={cat.name}
//                                         className="w-6 h-6 object-contain"
//                                     />
//                                 )}
//                             </div>

//                             {/* רשימת תתי־קטגוריות */}
//                             <ul className="ml-4 mt-2 space-y-1">
//                                 {categories
//                                     .filter((sub) => String(sub.parentId) === String(cat._id))
//                                     .map((sub) => (
//                                         <li
//                                             key={sub._id}
//                                             onClick={(e) => {
//                                                 e.stopPropagation(); // שלא יפעיל את ה־onClick של ההורה
//                                                 setSelectedId(sub._id);
//                                                 setName(sub.name);
//                                                 setParentId(cat._id); // ✅ תת קטגוריה שייכת לקטגוריה ראשית
//                                             }}
//                                             className={`pl-4 py-1 rounded cursor-pointer ${selectedId === sub._id
//                                                 ? "bg-gray-200"
//                                                 : "hover:bg-gray-100"
//                                                 }`}
//                                         >
//                                             {sub.name}
//                                         </li>
//                                     ))}
//                             </ul>
//                         </li>
//                     ))}
//             </ul>

//         </div>
//         </div>
//     );
// }




import { useMemo, useState } from "react";
import { useGetCategoriesQuery, useCreateCategoryMutation, useUpdateCategoryMutation, useDeleteCategoryMutation, } from "../../redux/services/categoriesApi";
export default function CategoryManager({ onCategoriesChange }) {
    const { data: categories = [], isFetching, isError } = useGetCategoriesQuery();

    const [createCategory, { isLoading: isCreating }] = useCreateCategoryMutation();
    const [updateCategory, { isLoading: isUpdating }] = useUpdateCategoryMutation();
    const [deleteCategory, { isLoading: isDeleting }] = useDeleteCategoryMutation();

    const [name, setName] = useState("");
    const [icon, setIcon] = useState(null);
    const [selectedId, setSelectedId] = useState(null); // לעדכון/מחיקה
    const [parentId, setParentId] = useState(null);

    useMemo(() => {
        if (onCategoriesChange) onCategoriesChange(categories);
    }, [categories, onCategoriesChange]);

    const busy = isFetching || isCreating || isUpdating || isDeleting;

    const topCategories = useMemo(
        () => categories.filter((c) => !c.parentId),
        [categories]
    );
    const childrenOf = (id) =>
        categories.filter((c) => String(c.parentId) === String(id));

    const resetForm = () => {
        setName("");
        setIcon(null);
        setSelectedId(null);
        setParentId(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!name.trim()) {
            alert("חייב למלא שם קטגוריה");
            return;
        }
        if (!selectedId && !parentId && !icon) {
            alert("חייב להוסיף גם שם וגם תמונה לקטגוריה ראשית");
            return;
        }

        const exists = categories.some(
            (cat) => cat.name.trim() === name.trim() && cat._id !== selectedId
        );
        if (exists) {
            alert("קטגוריה בשם הזה כבר קיימת!");
            return;
        }

        try {
            if (!selectedId) {
                await createCategory({ name, parentId, icon }).unwrap();
            } else {
                await updateCategory({ id: selectedId, name, parentId, icon }).unwrap();
            }
            resetForm();
        } catch (err) {
            console.error(err);
            alert(err?.data?.message || "שגיאה בשמירת קטגוריה");
        }
    };

    const handleDelete = async (id) => {
        if (!id) return;
        if (!confirm("למחוק את הקטגוריה? (תתי־קטגוריות קשורות יושפעו בהתאם למדיניות השרת)")) return;
        try {
            await deleteCategory(id).unwrap();
            if (id === selectedId) setSelectedId(null);
        } catch (err) {
            console.error(err);
            alert(err?.data?.message || "שגיאה במחיקה");
        }
    };

    return (
        <div className="flex justify-center items-start min-h-screen bg-gray-100">
            <div className="p-4 border-t bg-gray-50 w-[600px]">
                <h2 className="text-xl font-bold mb-3">ניהול קטגוריות</h2>

                {isError && (
                    <div className="text-sm text-red-600 mb-2">שגיאה בטעינת הקטגוריות</div>
                )}
                {isFetching && (
                    <div className="h-8 animate-pulse bg-gray-100 rounded mb-3" />
                )}

                <form onSubmit={handleSubmit} className="space-y-3">
                    <input
                        type="text"
                        placeholder="שם קטגוריה"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full border rounded px-3 py-2 text-sm"
                    />

                    <select
                        value={parentId || ""}
                        onChange={(e) => setParentId(e.target.value || null)}
                        className="w-full border rounded px-3 py-2 text-sm"
                    >
                        <option value="">קטגוריה ראשית</option>
                        {topCategories.map((cat) => (
                            <option key={cat._id} value={cat._id}>
                                {cat.name}
                            </option>
                        ))}
                    </select>

                    {/* אייקון רק לקטגוריה ראשית */}
                    {!parentId && (
                        <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => setIcon(e.target.files?.[0] || null)}
                            className="w-full text-sm"
                        />
                    )}

                    <div className="flex gap-2">
                        <button
                            type="submit"
                            disabled={busy}
                            className="flex-1 bg-blue-600 text-white px-3 py-2 rounded text-sm hover:bg-blue-700 disabled:opacity-50"
                        >
                            {selectedId ? "עדכן קטגוריה" : "הוסף קטגוריה"}
                        </button>
                        {selectedId && (
                            <button
                                type="button"
                                disabled={busy}
                                onClick={() => handleDelete(selectedId)}
                                className="bg-red-500 text-white px-3 py-2 rounded text-sm hover:bg-red-600 disabled:opacity-50"
                            >
                                מחק
                            </button>
                        )}
                        {selectedId && (
                            <button
                                type="button"
                                disabled={busy}
                                onClick={resetForm}
                                className="bg-slate-200 text-slate-900 px-3 py-2 rounded text-sm hover:bg-slate-300 disabled:opacity-50"
                            >
                                ניקוי טופס
                            </button>
                        )}
                    </div>
                </form>

                {/* רשימת קטגוריות לניהול */}
                <ul className="mt-4 space-y-2">
                    {topCategories.map((cat) => (
                        <li
                            key={cat._id}
                            onClick={() => {
                                setSelectedId(cat._id);
                                setName(cat.name);
                                setParentId(null); // קטגוריה ראשית
                                // אייקון לא נטען לטופס (אין preview כאן) – אם תרצי, אפשר להוסיף preview בהמשך
                            }}
                            className={`px-3 py-2 rounded cursor-pointer ${selectedId === cat._id ? "bg-gray-200" : "hover:bg-gray-100"
                                }`}
                        >
                            <div className="flex items-center justify-between">
                                <span className="font-semibold">{cat.name}</span>
                                {cat.icon && (
                                    <img
                                        src={`https://api.express48.com${cat.icon}`}
                                        alt={cat.name}
                                        className="w-6 h-6 object-contain"
                                    />
                                )}
                            </div>

                            {/* רשימת תתי־קטגוריות */}
                            <ul className="ml-4 mt-2 space-y-1">
                                {childrenOf(cat._id).map((sub) => (
                                    <li
                                        key={sub._id}
                                        onClick={(e) => {
                                            e.stopPropagation(); // לא להפעיל onClick של ההורה
                                            setSelectedId(sub._id);
                                            setName(sub.name);
                                            setParentId(cat._id); // תת־קטגוריה
                                        }}
                                        className={`pl-4 py-1 rounded cursor-pointer ${selectedId === sub._id ? "bg-gray-200" : "hover:bg-gray-100"
                                            }`}
                                    >
                                        {sub.name}
                                    </li>
                                ))}
                            </ul>
                        </li>
                    ))}

                    {topCategories.length === 0 && !isFetching && (
                        <li className="p-6 text-center text-gray-500">אין קטגוריות</li>
                    )}
                </ul>
            </div>
        </div>
    );
}
