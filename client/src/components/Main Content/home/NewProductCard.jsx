// // src/components/mainContent/home/NewProductCard.jsx
// import { useState } from "react";

// // סימון מטבע
// const symbolFor = (currency) => {
//     switch (currency) {
//         case "ILS": return "₪";
//         case "USD": return "$";
//         case "EUR": return "€";
//         default: return currency || "";
//     }
// };

// export default function NewProductCard({ product, onAddToCart }) {
//     const [imgIndex, setImgIndex] = useState(0);
//     const symbol = symbolFor(product?.currency);

//     // מעבר תמונות לפי מיקום העכבר
//     const handleMouseMove = (e) => {
//         const imgs = product?.images || [];
//         if (imgs.length < 2) return;
//         const rect = e.currentTarget.getBoundingClientRect();
//         const x = e.clientX - rect.left;
//         const percent = Math.max(0, Math.min(1, x / rect.width));
//         const next = Math.min(imgs.length - 1, Math.floor(percent * imgs.length));
//         if (next !== imgIndex) setImgIndex(next);
//     };

//     const handleMouseLeave = () => setImgIndex(0);

//     const hasDiscount = !!product?.hasDiscount && product?.basePrice > product?.finalPrice;

//     return (
//         <div
//             dir="rtl"
//             className="
//     relative flex flex-col items-center
//     rounded-[12px] border border-[#EDEDED] overflow-hidden
//     w-[183px] md:w-[250px]
//     pt-[1px] md:pt-[8px]
//     pb-[16px] md:pb-[24px]
//     gap-[16px] md:gap-[24px]
//   "
//         >
//             {/* תמונה */}
//             <div
//                 className="relative flex justify-center items-center w-[181px] h-[170px] rounded-t-[10px] bg-white overflow-hidden"
//                 onMouseMove={handleMouseMove}
//                 onMouseLeave={handleMouseLeave}
//             >
//                 {(product?.images || []).map((src, i) => (
//                     <img
//                         key={i}
//                         src={src}
//                         alt={product?.title || ""}
//                         className={`absolute w-[181px] h-[170px] object-contain transition-opacity duration-300 ${i === imgIndex ? "opacity-100" : "opacity-0"
//                             }`}
//                         draggable={false}
//                     />
//                 ))}
//             </div>

//             {/* כותרת מוצר */}
//             <div className="w-full text-center text-[#141414] font-rubik leading-[120%] tracking-[-0.176px] md:text-[16px] md:font-normal text-[12px] font-normal">
//                 {product?.title}
//             </div>
//             {/* מחיר */}
//             {hasDiscount ? (
//                 // עם הנחה – פס תחתון כתום בהיר
//                 <div className="flex flex-col items-center justify-center gap-[10px] self-stretch py-2 bg-[#FFF7F2]">
//                     {/* מחיר עדכני (בולט) */}
//                     <div className="w-[55px] text-center text-black font-rubik text-[12px] font-bold leading-[120%] tracking-[-0.132px]">
//                         {product?.finalPrice} {symbol}
//                     </div>
//                     {/* מחיר מקורי (קו חוצה) */}
//                     <div className="w-[55px] text-center text-[#141414] font-rubik text-[10px] font-normal leading-[100%] tracking-[-0.11px] line-through">
//                         {product?.basePrice} {symbol}
//                     </div>
//                 </div>
//             ) : (
//                 // בלי הנחה – טקסט שחור רגיל ללא רקע
//                 <div className="flex flex-col items-center justify-center gap-[10px] self-stretch py-2">
//                     <div className="w-[75px] text-center text-black font-rubik leading-[120%] tracking-[-0.176px] md:text-[16px] md:font-semibold text-[12px] font-bold">
//                         {product?.finalPrice ?? product?.basePrice} {symbol}
//                     </div>
//                 </div>
//             )}


//             {/* כפתור/אייקון עגלה */}
//            <button
//   type="button"
//   aria-label="הוסף לסל"
//   onClick={() => onAddToCart?.(product)}
//   className="
//     absolute left-[12px] bottom-[81px]
//     flex justify-center items-center
//     w-10 h-10 rounded-full bg-[#FFF7F2] p-2
//   "
// >
//   <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none">
//     <path
//       d="M15.75 10.5V6c0-.994-.395-1.948-1.098-2.651A3.747 3.747 0 0 0 12 2.25c-.994 0-1.948.395-2.651 1.099A3.747 3.747 0 0 0 8.25 6v4.5M19.606 8.507l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.13 1.13 0 0 1-1.12-1.372l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007Z"
//       stroke="#FF6500"
//       strokeWidth="1.5"
//       strokeLinecap="round"
//       strokeLinejoin="round"
//     />
//   </svg>
// </button>

//         </div>
//     );
// }




// // src/components/mainContent/home/NewProductCard.jsx
// import { useState } from "react";

// // סימון מטבע
// const symbolFor = (currency) => {
//     switch (currency) {
//         case "ILS": return "₪";
//         case "USD": return "$";
//         case "EUR": return "€";
//         default: return currency || "";
//     }
// };

// export default function NewProductCard({ product, onAddToCart }) {
//     const [imgIndex, setImgIndex] = useState(0);
//     const symbol = symbolFor(product?.currency);

//     // מעבר תמונות לפי מיקום העכבר
//     const handleMouseMove = (e) => {
//         const imgs = product?.images || [];
//         if (imgs.length < 2) return;
//         const rect = e.currentTarget.getBoundingClientRect();
//         const x = e.clientX - rect.left;
//         const percent = Math.max(0, Math.min(1, x / rect.width));
//         const next = Math.min(imgs.length - 1, Math.floor(percent * imgs.length));
//         if (next !== imgIndex) setImgIndex(next);
//     };

//     const handleMouseLeave = () => setImgIndex(0);

//     const hasDiscount = !!product?.hasDiscount && product?.basePrice > product?.finalPrice;

//     return (

//         <div
//             dir="rtl"
//             className="
//     relative flex flex-col items-center
//     rounded-[12px] border border-[#EDEDED] overflow-hidden
//     w-[183px] md:w-[250px]
//     pt-[1px] md:pt-[8px]
//     pb-[16px] md:pb-[24px]
//     gap-[16px] md:gap-[24px]
//   "
//         >
//             {/* תמונה */}
//             <div
//                 className="relative w-[181px] h-[170px] md:w-[220px] md:h-[200px] rounded-t-[10px] bg-white flex justify-center items-center overflow-hidden"
//                 onMouseMove={handleMouseMove}
//                 onMouseLeave={handleMouseLeave}
//             >
//                 {(product?.images || []).map((src, i) => (
//                     <img
//                         key={i}
//                         src={src}
//                         alt={product?.title || ""}
//                         className={`absolute inset-0 w-full h-full object-contain transition-opacity duration-300 ${i === imgIndex ? "opacity-100" : "opacity-0"
//                             }`}
//                         draggable={false}
//                     />
//                 ))}

//                 {/* כפתור עגלה בתוך אזור התמונה */}
//                 <button
//                     type="button"
//                     aria-label="הוסף לסל"
//                     onClick={() => onAddToCart?.(product)}
//                     className="
//         absolute left-3 bottom-3
//         flex justify-center items-center
//         w-10 h-10 rounded-full bg-[#FFF7F2] p-2
//       "
//                 >
//                     <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none">
//                         <path
//                             d="M15.75 10.5V6c0-.994-.395-1.948-1.098-2.651A3.747 3.747 0 0 0 12 2.25c-.994 0-1.948.395-2.651 1.099A3.747 3.747 0 0 0 8.25 6v4.5M19.606 8.507l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.13 1.13 0 0 1-1.12-1.372l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007Z"
//                             stroke="#FF6500"
//                             strokeWidth="1.5"
//                             strokeLinecap="round"
//                             strokeLinejoin="round"
//                         />
//                     </svg>
//                 </button>
//             </div>

//             {/* כותרת */}
//             <div
//                 className="
//     w-full text-center text-[#141414] font-rubik leading-[120%] tracking-[-0.176px]
//     md:text-[15px] text-[13px] font-normal px-2 line-clamp-2
//   "
//             >
//                 {product?.title}
//             </div>

//             {/* מחיר */}
//             {hasDiscount ? (
//                 <div className="flex flex-col items-center justify-center gap-[10px] self-stretch py-2 bg-[#FFF7F2]">
//                     <div className="w-[55px] text-center text-black font-rubik text-[12px] font-bold leading-[120%] tracking-[-0.132px]">
//                         {product?.finalPrice} {symbol}
//                     </div>
//                     <div className="w-[55px] text-center text-[#141414] font-rubik text-[10px] font-normal leading-[100%] tracking-[-0.11px] line-through">
//                         {product?.basePrice} {symbol}
//                     </div>
//                 </div>
//             ) : (
//                 <div className="flex flex-col items-center justify-center gap-[10px] self-stretch py-2">
//                     <div className="w-[75px] text-center text-black font-rubik leading-[120%] tracking-[-0.176px] md:text-[16px] md:font-semibold text-[12px] font-bold">
//                         {product?.finalPrice ?? product?.basePrice} {symbol}
//                     </div>
//                 </div>
//             )}
//         </div>
//     );
// }


// // src/components/mainContent/home/NewProductCard.jsx
// import { useState } from "react";

// // סימון מטבע
// const symbolFor = (currency) => {
//   switch (currency) {
//     case "ILS": return "₪";
//     case "USD": return "$";
//     case "EUR": return "€";
//     default: return currency || "";
//   }
// };

// export default function NewProductCard({ product, onAddToCart }) {
//   const [imgIndex, setImgIndex] = useState(0);
//   const symbol = symbolFor(product?.currency);

//   // מעבר תמונות לפי מיקום העכבר
//   const handleMouseMove = (e) => {
//     const imgs = product?.images || [];
//     if (imgs.length < 2) return;
//     const rect = e.currentTarget.getBoundingClientRect();
//     const x = e.clientX - rect.left;
//     const percent = Math.max(0, Math.min(1, x / rect.width));
//     const next = Math.min(imgs.length - 1, Math.floor(percent * imgs.length));
//     if (next !== imgIndex) setImgIndex(next);
//   };
//   const handleMouseLeave = () => setImgIndex(0);

//   const hasDiscount =
//     !!product?.hasDiscount && product?.basePrice > product?.finalPrice;

//   return (
// <div
//   dir="rtl"
//   className="
//     relative flex flex-col items-center
//     w-full min-w-[160px] max-w-[220px] flex-grow
//     rounded-[12px] border border-[#EDEDED] overflow-hidden
//     pt-[1px] gap-[16px]
//   "
// >

//       {/* תמונה */}
//       <div
//         className="
//     relative w-full h-[170px]
//     rounded-t-[10px] bg-white flex justify-center items-center overflow-hidden
//   "
//         onMouseMove={handleMouseMove}
//         onMouseLeave={handleMouseLeave}
//       >
//         {(product?.images || []).map((src, i) => (
//           <img
//             key={i}
//             src={src}
//             alt={product?.title || ""}
//             className={`absolute inset-0 w-full h-full object-contain transition-opacity duration-300 ${
//               i === imgIndex ? "opacity-100" : "opacity-0"
//             }`}
//             draggable={false}
//           />
//         ))}

//         {/* כפתור עגלה */}
//         <button
//           type="button"
//           aria-label="הוסף לסל"
//           onClick={() => onAddToCart?.(product)}
//           className="
//             absolute left-[11px] bottom-[-6px]
//             flex justify-center items-center
//             w-10 h-10 rounded-full bg-[#FFF7F2] p-2
//           "
//         >
//           <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none">
//             <path
//               d="M15.75 10.5V6c0-.994-.395-1.948-1.098-2.651A3.747 3.747 0 0 0 12 2.25c-.994 0-1.948.395-2.651 1.099A3.747 3.747 0 0 0 8.25 6v4.5M19.606 8.507l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.13 1.13 0 0 1-1.12-1.372l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007Z"
//               stroke="#FF6500"
//               strokeWidth="1.5"
//               strokeLinecap="round"
//               strokeLinejoin="round"
//             />
//           </svg>
//         </button>
//       </div>

//       {/* כותרת עם גובה קבוע לשלוש שורות */}
//       <div
//      className="
//     w-full text-center text-[#141414] font-rubik
//     text-[14px] font-normal leading-[120%] tracking-[-0.154px]
//     px-2 line-clamp-3
//     flex items-center justify-center
//     min-h-[50px]
//   "
// >
//         {product?.title}
//       </div>

//       {/* מחיר */}
//       <div
//         className={`
//           flex items-center justify-center gap-2 self-stretch py-4
//           ${hasDiscount ? "bg-[#FFF7F2]" : ""}
//         `}
//       >
//         <div className="text-black font-rubik text-[14px] font-semibold leading-[120%] tracking-[-0.154px]">
//           {product?.finalPrice ?? product?.basePrice} {symbol}
//         </div>

//         {hasDiscount && (
//           <div className="text-[#000] font-rubik text-[10px] font-normal leading-[100%] tracking-[-0.11px] line-through">
//             {product?.basePrice} {symbol}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }

// // src/components/mainContent/home/NewProductCard.jsx
// import { useState } from "react";

// // סימון מטבע
// const symbolFor = (currency) => {
//   switch (currency) {
//     case "ILS": return "₪";
//     case "USD": return "$";
//     case "EUR": return "€";
//     default: return currency || "";
//   }
// };

// export default function NewProductCard({ product, onAddToCart }) {
//   const [imgIndex, setImgIndex] = useState(0);
//   const symbol = symbolFor(product?.currency);

//   // מעבר תמונות לפי מיקום העכבר
//   const handleMouseMove = (e) => {
//     const imgs = product?.images || [];
//     if (imgs.length < 2) return;
//     const rect = e.currentTarget.getBoundingClientRect();
//     const x = e.clientX - rect.left;
//     const percent = Math.max(0, Math.min(1, x / rect.width));
//     const next = Math.min(imgs.length - 1, Math.floor(percent * imgs.length));
//     if (next !== imgIndex) setImgIndex(next);
//   };
//   const handleMouseLeave = () => setImgIndex(0);

//   const hasDiscount =
//     !!product?.hasDiscount && product?.basePrice > product?.finalPrice;

//   return (
//     <div
//       dir="rtl"
//       className="
//         relative flex flex-col items-center
//         w-full min-w-[160px] max-w-[360px] flex-grow
//         rounded-[12px] border border-[#EDEDED] overflow-hidden
//         px-0 pt-2  gap-[16px]
//       "
//     >
//       {/* תמונה */}
//       <div
//         className="
//           relative w-full h-[170px]
//           rounded-t-[10px] bg-white flex justify-center items-center overflow-hidden
        
//         "
//         onMouseMove={handleMouseMove}
//         onMouseLeave={handleMouseLeave}
//       >
//         {(product?.images || []).map((src, i) => (
//           <img
//             key={i}
//             src={src}
//             alt={product?.title || ""}
//             className={`absolute inset-0 w-full h-full object-contain transition-opacity duration-300 ${
//               i === imgIndex ? "opacity-100" : "opacity-0"
//             }`}
//             draggable={false}
//           />
//         ))}

//         {/* כפתור עגלה */}
//         <button
//           type="button"
//           aria-label="הוסף לסל"
//           onClick={() => onAddToCart?.(product)}
//           className="
//             absolute left-[11px] bottom-[-6px]
//             flex justify-center items-center
//             w-10 h-10 rounded-full bg-[#FFF7F2] p-2
//           "
//         >
//           <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none">
//             <path
//               d="M15.75 10.5V6c0-.994-.395-1.948-1.098-2.651A3.747 3.747 0 0 0 12 2.25c-.994 0-1.948.395-2.651 1.099A3.747 3.747 0 0 0 8.25 6v4.5M19.606 8.507l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.13 1.13 0 0 1-1.12-1.372l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007Z"
//               stroke="#FF6500"
//               strokeWidth="1.5"
//               strokeLinecap="round"
//               strokeLinejoin="round"
//             />
//           </svg>
//         </button>
//       </div>

//       {/* כותרת עם גובה קבוע לשלוש שורות */}
//       <div
//         className="
//           w-full text-center text-[#141414] font-rubik
//           text-[14px] font-normal leading-[120%] tracking-[-0.154px]
//           px-2 line-clamp-3
//           flex items-center justify-center
//           min-h-[50px]
//         "
//       >
//         {product?.title}
//       </div>

//       {/* מחיר */}
//       <div
//         className={`
//           flex items-center justify-center gap-2 self-stretch py-4
//           ${hasDiscount ? "bg-[#FFF7F2]" : ""}
//         `}
//       >
//         <div className="text-black font-rubik text-[14px] font-semibold leading-[120%] tracking-[-0.154px]">
//           {product?.finalPrice ?? product?.basePrice} {symbol}
//         </div>

//         {hasDiscount && (
//           <div className="text-[#000] font-rubik text-[10px] font-normal leading-[100%] tracking-[-0.11px] line-through">
//             {product?.basePrice} {symbol}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }


// src/components/mainContent/home/NewProductCard.jsx
import { useState } from "react";

// סימון מטבע
const symbolFor = (currency) => {
  switch (currency) {
    case "ILS": return "₪";
    case "USD": return "$";
    case "EUR": return "€";
    default: return currency || "";
  }
};

export default function NewProductCard({ product, onAddToCart }) {
  const [imgIndex, setImgIndex] = useState(0);
  const symbol = symbolFor(product?.currency);

  // מעבר בין תמונות לפי מיקום העכבר (רק בדסקטופ)
  const handleMouseMove = (e) => {
    const imgs = product?.images || [];
    if (imgs.length < 2) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percent = Math.max(0, Math.min(1, x / rect.width));
    const next = Math.min(imgs.length - 1, Math.floor(percent * imgs.length));
    if (next !== imgIndex) setImgIndex(next);
  };
  const handleMouseLeave = () => setImgIndex(0);

  const hasDiscount =
    !!product?.hasDiscount && product?.basePrice > product?.finalPrice;

  return (
    <div
  dir="rtl"
  className="
    relative flex flex-col items-center
    w-full min-w-[200px] flex-grow
    rounded-[12px] border border-[#EDEDED] overflow-hidden
    pt-[1px] gap-[16px]
  "
>
  {/* תמונה */}
  <div
    className="
      relative w-full h-[170px] md:h-[200px]
      flex justify-center items-center
      px-[20px] md:px-[88px] pt-[8px]
      rounded-t-[10px] overflow-hidden bg-white
    "
    onMouseMove={handleMouseMove}
    onMouseLeave={handleMouseLeave}
  >
    {(product?.images || []).map((src, i) => (
      <img
        key={i}
        src={src}
        alt={product?.title || ""}
        className={`absolute inset-0 w-full h-full object-contain transition-opacity duration-300 ${
          i === imgIndex ? "opacity-100" : "opacity-0"
        }`}
        draggable={false}
      />
    ))}
  </div>

  {/* כפתור עגלה */}
  <button
    type="button"
    aria-label="הוסף לסל"
    onClick={() => onAddToCart?.(product)}
    className="
      absolute left-[20px] bottom-[115px]
      flex justify-center items-center
      w-10 h-10 rounded-[20px] bg-[#FFF7F2] p-2
      
    "
  >
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none">
      <path
        d="M15.75 10.5V6c0-.994-.395-1.948-1.098-2.651A3.747 3.747 0 0 0 12 2.25c-.994 0-1.948.395-2.651 1.099A3.747 3.747 0 0 0 8.25 6v4.5M19.606 8.507l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.13 1.13 0 0 1-1.12-1.372l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007Z"
        stroke="#FF6500"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  </button>

      {/* כותרת */}
      <div
        className="
          flex justify-center items-center
          h-[44px] w-full px-2 text-center
          text-[#141414] font-rubik
          text-[14px] font-normal leading-[120%] tracking-[-0.154px]
          line-clamp-3
        "
      >
        {product?.title}
      </div>

      {/* מחיר */}
      <div
        className={`
          flex justify-center items-center gap-[8px] self-stretch
          py-4
          ${hasDiscount ? "bg-[#FFF7F2]" : "bg-white"}
        `}
      >
        <div className="text-[#000] font-rubik text-[14px] font-semibold leading-[120%] tracking-[-0.154px]">
          {product?.finalPrice ?? product?.basePrice} {symbol}
        </div>

        {hasDiscount && (
          <div className="text-[#000] font-rubik text-[11px] font-normal leading-[100%] tracking-[-0.11px] line-through">
            {product?.basePrice} {symbol}
          </div>
        )}
      </div>
    </div>
  );
}
