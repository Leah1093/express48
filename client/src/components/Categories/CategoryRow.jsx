// import axios from "axios";
// import React, { useEffect, useState } from "react";

// export default function CategoryRow() {
//     const [categories, setCategories] = useState([]);

//     useEffect(() => {
//         const loadCategories = async () => {
//             try {
//                 const res = await axios.get("https://api.express48.com/categories", {
//                     withCredentials: true,
//                 });
//                 setCategories(res.data);
//             } catch (err) {
//                 console.error("שגיאה בשליפת קטגוריות", err);
//             }
//         };
//         loadCategories();
//     }, []);

//     return (
//         <div className="w-full bg-white py-2 px-2 flex flex-col items-end">
//             <span className="mb-2 text-right text-[#141414] text-[14px] font-semibold leading-[120%] tracking-[-0.154px]">
//                 קטגוריות מובילות
//             </span>
//             <div className="flex flex-nowrap gap-6 overflow-x-auto scrollbar-hide w-full " dir="rtl">
//                 {categories
//                     .filter((cat) => !cat.parentId)
//                     .map((cat) => (
//                         <div
//                             key={cat._id}
//                             className="flex flex-col items-center min-w-[80px] flex-shrink-0"
//                         >
//                             <div
//                                 onClick={() => {
//                                     console.log("to do");
//                                 }}
//                                 className="rounded-full border border-[#EDEDED] flex items-center justify-center mb-1 bg-gray-100"
//                                 style={{
//                                     background: `url(https://api.express48.com${cat.icon}) center/cover no-repeat`,
//                                     height: "59px",
//                                     width: "59px",
//                                 }}
//                             ></div>
//                             <span className="text-center text-[#141414] text-[12px] font-normal leading-[120%] tracking-[-0.132px] whitespace-nowrap">
//                                 {cat.name}
//                             </span>
//                         </div>
//                     ))}
//             </div>

//         </div >
//     );
// }







// src/components/home/CategoryRow.jsx
import React from "react";
import { useGetCategoriesQuery } from "../../redux/services/categoriesApi"; // עדכני לפי הנתיב שלך

export default function CategoryRow() {
  const { data: categories = [] } = useGetCategoriesQuery();

  const BASE_URL = import.meta.env.VITE_API_URL || "https://api.express48.com";

  return (
    <div className="w-full bg-white py-2 px-2 flex flex-col items-end">
      <span className="mb-2 text-right text-[#141414] text-[14px] font-semibold leading-[120%] tracking-[-0.154px]">
        קטגוריות מובילות
      </span>
      <div className="flex flex-nowrap gap-6 overflow-x-auto scrollbar-hide w-full" dir="rtl">
        {categories
          .filter((cat) => !cat.parentId)
          .map((cat) => (
            <div
              key={cat._id}
              className="flex flex-col items-center min-w-[80px] flex-shrink-0"
            >
              <div
                onClick={() => {
                  console.log("to do");
                }}
                className="rounded-full border border-[#EDEDED] flex items-center justify-center mb-1 bg-gray-100"
                style={{
                  background: cat.icon
                    ? `url(${BASE_URL}${cat.icon}) center/cover no-repeat`
                    : undefined,
                  height: "59px",
                  width: "59px",
                }}
              ></div>
              <span className="text-center text-[#141414] text-[12px] font-normal leading-[120%] tracking-[-0.132px] whitespace-nowrap">
                {cat.name}
              </span>
            </div>
          ))}
      </div>
    </div>
  );
}