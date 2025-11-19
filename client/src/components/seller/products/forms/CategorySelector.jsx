// // src/components/seller/products/forms/CategorySelector.jsx
// import { useEffect, useState } from "react";
// import { useFormContext } from "react-hook-form";
// import {
//   useGetRootCategoriesQuery,
//   useGetCategoryChildrenQuery,
// } from "../../../../redux/services/categoriesApi";

// export default function CategorySelector() {
//   const {
//     register,
//     setValue,
//     watch,
//     formState: { errors },
//   } = useFormContext();

//   // רישום השדה ל-react-hook-form (גם אם אין input גלוי)
//   useEffect(() => {
//     register("categoryId", {
//       required: "חובה לבחור קטגוריה",
//     });
//   }, [register]);

//   // סטייטים לכל רמה
//   const [rootId, setRootId] = useState("");
//   const [level2Id, setLevel2Id] = useState("");
//   const [level3Id, setLevel3Id] = useState("");
//   const [level4Id, setLevel4Id] = useState("");

//   const selectedCategoryId = watch("categoryId");

//   // שליפת שורשים
//   const {
//     data: roots,
//     isLoading: loadingRoots,
//     isError: rootsError,
//   } = useGetRootCategoriesQuery();

//   // רמה 2 - ילדים של root
//   const {
//     data: level2,
//     isLoading: loadingLevel2,
//   } = useGetCategoryChildrenQuery(rootId, {
//     skip: !rootId,
//   });

//   // רמה 3 - ילדים של level2
//   const {
//     data: level3,
//     isLoading: loadingLevel3,
//   } = useGetCategoryChildrenQuery(level2Id, {
//     skip: !level2Id,
//   });

//   // רמה 4 - ילדים של level3
//   const {
//     data: level4,
//     isLoading: loadingLevel4,
//   } = useGetCategoryChildrenQuery(level3Id, {
//     skip: !level3Id,
//   });

//   const Err = ({ e }) =>
//     e ? <p className="text-red-600 text-xs mt-1">{e.message}</p> : null;

//   // פונקציה שמעדכנת את categoryId לפי העומק הכי עמוק שנבחר
//   const updateCategoryId = (next = {}) => {
//     const {
//       root = rootId,
//       l2 = level2Id,
//       l3 = level3Id,
//       l4 = level4Id,
//     } = next;

//     const finalId = l4 || l3 || l2 || root || null;
//     setValue("categoryId", finalId || null, { shouldValidate: true });
//   };

//   const handleRootChange = (e) => {
//     const id = e.target.value || "";
//     setRootId(id);
//     setLevel2Id("");
//     setLevel3Id("");
//     setLevel4Id("");
//     updateCategoryId({ root: id, l2: "", l3: "", l4: "" });
//   };

//   const handleLevel2Change = (e) => {
//     const id = e.target.value || "";
//     setLevel2Id(id);
//     setLevel3Id("");
//     setLevel4Id("");
//     updateCategoryId({ l2: id, l3: "", l4: "" });
//   };

//   const handleLevel3Change = (e) => {
//     const id = e.target.value || "";
//     setLevel3Id(id);
//     setLevel4Id("");
//     updateCategoryId({ l3: id, l4: "" });
//   };

//   const handleLevel4Change = (e) => {
//     const id = e.target.value || "";
//     setLevel4Id(id);
//     updateCategoryId({ l4: id });
//   };

//   return (
//     <div className="space-y-3">
//       <label className="block text-sm font-medium mb-1">
//         שיוך קטגוריה (חובה)
//       </label>

//       {/* רמת שורש */}
//       <div>
//         <select
//           className="w-full rounded-xl border p-2 bg-white text-sm"
//           value={rootId}
//           onChange={handleRootChange}
//         >
//           <option value="">בחרי קטגוריה ראשית...</option>
//           {loadingRoots && <option disabled>טוען...</option>}
//           {rootsError && <option disabled>שגיאה בטעינת קטגוריות</option>}

//           {roots?.map((cat) => (
//             <option key={cat._id} value={cat._id}>
//               {cat.name}
//             </option>
//           ))}
//         </select>
//       </div>

//       {/* רמת ביניים (תתי קטגוריות של root) */}
//       {rootId && (
//         <div>
//           <select
//             className="w-full rounded-xl border p-2 bg-white text-sm"
//             value={level2Id}
//             onChange={handleLevel2Change}
//           >
//             <option value="">(אופציונלי) בחרי תת־קטגוריה...</option>
//             {loadingLevel2 && <option disabled>טוען...</option>}
//             {level2?.map((cat) => (
//               <option key={cat._id} value={cat._id}>
//                 {cat.name}
//               </option>
//             ))}
//           </select>
//         </div>
//       )}

//       {/* רמת עומק 3 */}
//       {level2Id && level3 && level3.length > 0 && (
//         <div>
//           <select
//             className="w-full rounded-xl border p-2 bg-white text-sm"
//             value={level3Id}
//             onChange={handleLevel3Change}
//           >
//             <option value="">(אופציונלי) בחרי קטגוריה עמוקה...</option>
//             {loadingLevel3 && <option disabled>טוען...</option>}
//             {level3.map((cat) => (
//               <option key={cat._id} value={cat._id}>
//                 {cat.name}
//               </option>
//             ))}
//           </select>
//         </div>
//       )}

//       {/* רמת עומק 4 (אם קיימת) */}
//       {level3Id && level4 && level4.length > 0 && (
//         <div>
//           <select
//             className="w-full rounded-xl border p-2 bg-white text-sm"
//             value={level4Id}
//             onChange={handleLevel4Change}
//           >
//             <option value="">(אופציונלי) בחרי רמת עומק נוספת...</option>
//             {loadingLevel4 && <option disabled>טוען...</option>}
//             {level4.map((cat) => (
//               <option key={cat._id} value={cat._id}>
//                 {cat.name}
//               </option>
//             ))}
//           </select>
//         </div>
//       )}

//       <p className="text-xs text-gray-500">
//         המערכת תשמור לפי הרמה העמוקה ביותר שבחרת. שאר הנתיב (שורש, תת־קטגוריה
//         וכו') מחושב אוטומטית בשרת.
//       </p>

//       <Err e={errors?.categoryId} />

//       {selectedCategoryId && (
//         <p className="text-[11px] text-gray-500 mt-1">
//           מזהה קטגוריה נבחרת: {selectedCategoryId}
//         </p>
//       )}
//     </div>
//   );
// }


//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
//קומפוננטה זמנית!!!  לא למחוק את הקומפוננטה המיורקת למעלה!!!
//ברגע שרוצים להעלות אופציה של שיוך גם לתתי קטגוריות ולא רק לראשית   -להשתמש בקומפוננטה המיורקת
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

import { useEffect, useState } from "react";
import { useFormContext } from "react-hook-form";
import { useGetRootCategoriesQuery } from "../../../../redux/services/categoriesApi";

export default function CategorySelector() {
  const {
    register,
    setValue,
    watch,
    formState: { errors },
  } = useFormContext();

  useEffect(() => {
    register("categoryId", {
      required: "חובה לבחור קטגוריה",
    });
  }, [register]);

  const [rootId, setRootId] = useState("");

  const {
    data: roots,
    isLoading: loadingRoots,
    isError: rootsError,
  } = useGetRootCategoriesQuery();

  const selectedCategoryId = watch("categoryId");

  const Err = ({ e }) =>
    e ? <p className="text-red-600 text-xs mt-1">{e.message}</p> : null;

  const handleRootChange = (e) => {
    const id = e.target.value || "";
    setRootId(id);
    // מעדכן את השדה האמיתי של הטופס
    setValue("categoryId", id || null, { shouldValidate: true });
  };

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium mb-1">
        שיוך קטגוריה (חובה)
      </label>

      <select
        className="w-full rounded-xl border p-2 bg-white text-sm"
        value={rootId}
        onChange={handleRootChange}
      >
        <option value="">
          {loadingRoots ? "טוען קטגוריות..." : "בחרי קטגוריה ראשית..."}
        </option>

        {rootsError && <option disabled>שגיאה בטעינת קטגוריות</option>}

        {roots?.map((cat) => (
          <option key={cat._id} value={cat._id}>
            {cat.name}
          </option>
        ))}
      </select>

      <p className="text-xs text-gray-500">
        כרגע אפשר לבחור רק קטגוריה ראשית. בהמשך נוסיף תתי קטגוריות מאותה קומפוננטה.
      </p>

      <Err e={errors?.categoryId} />

      {selectedCategoryId && (
        <p className="text-[11px] text-gray-500 mt-1">
          מזהה קטגוריה נבחרת: {selectedCategoryId}
        </p>
      )}
    </div>
  );
}
