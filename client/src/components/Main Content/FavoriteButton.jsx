// // import React from "react";
// // import { useAddFavoriteMutation, useRemoveFavoriteMutation } from "../../redux/api/favoritesApi";
// // import { AiOutlineHeart, AiFillHeart } from "react-icons/ai";
// // import { useSelector, useDispatch } from "react-redux";
// // import { addGuest, removeGuest } from "../../redux/slices/guestFavoritesSlice";

// // function FavoriteButton({ productId, product, favorites }) {
// //   const user = useSelector((state) => state.user.user);
// //   const dispatch = useDispatch();

// //   const [addFavorite] = useAddFavoriteMutation();
// //   const [removeFavorite] = useRemoveFavoriteMutation();

// //   const items = favorites;
// //   const isFavorite = items.some((f) => {
// //     const favId =
// //       f?.productId && typeof f.productId === "object"
// //         ? f.productId._id
// //         : f?.productId ?? null;

// //     return favId === productId;
// //   });

// //   const toggleFavorite = (e) => {
// //     e.stopPropagation();
// //     if (user) {
// //       if (isFavorite) removeFavorite(productId);
// //       else addFavorite(productId);
// //     } else {
// //       if (isFavorite) dispatch(removeGuest(productId));
// //       else dispatch(addGuest(product));
// //     }
// //   };

// //   return (
// //     <button
// //       onClick={toggleFavorite}
// //       className="flex flex-row items-center justify-center bg-[#FFF7F2] text-[#FF6500] rounded-[12px] h-[40px] w-[40px] transition hover:bg-[#ffe3d1] border-none p-0"
// //       tabIndex={-1}
// //       aria-label="הוסף למועדפים"
// //     >
// //       {isFavorite ? (
// //         <AiFillHeart className="w-6 h-6 text-[#FF6500]" />
// //       ) : (
// //         <AiOutlineHeart className="w-6 h-6 text-[#FF6500]" />
// //       )}
// //     </button>
// //   );
// // }

// // export default FavoriteButton;




// import React from "react";
// import { useAddFavoriteMutation, useRemoveFavoriteMutation } from "../../redux/api/favoritesApi";
// import { AiOutlineHeart, AiFillHeart } from "react-icons/ai";
// import { useSelector, useDispatch } from "react-redux";
// import { addGuest, removeGuest } from "../../redux/slices/guestFavoritesSlice";

// function FavoriteButton({
//   productId,
//   product,
//   favorites = [],
//   asChild = false,        // ✅ כשהוא עטוף בתוך כפתור אחר, שלחי asChild
//   className = "",
//   onToggle,               // אופציונלי: קולבק חיצוני
// }) {
//   const user = useSelector((state) => state.user.user);
//   const dispatch = useDispatch();

//   const [addFavorite] = useAddFavoriteMutation();
//   const [removeFavorite] = useRemoveFavoriteMutation();

//   const isFavorite = favorites.some((f) => {
//     const favId =
//       f?.productId && typeof f.productId === "object"
//         ? f.productId._id
//         : f?.productId ?? null;
//     return favId === productId;
//   });

//   const doToggle = () => {
//     if (user) {
//       if (isFavorite) removeFavorite(productId);
//       else addFavorite(productId);
//     } else {
//       if (isFavorite) dispatch(removeGuest(productId));
//       else dispatch(addGuest(product));
//     }
//     onToggle?.(isFavorite);
//   };

//   // כדי לא להפעיל את הלחיצה של העטיפה החיצונית
//   const handleClick = (e) => {
//     e.stopPropagation();
//     e.preventDefault();
//     doToggle();
//   };

//   const content = (
//     <>
//       {isFavorite ? (
//         <AiFillHeart className="w-6 h-6 text-[#FF6500]" />
//       ) : (
//         <AiOutlineHeart className="w-6 h-6 text-[#FF6500]" />
//       )}
//     </>
//   );

//   if (asChild) {
//     // ✅ במצב עטוף, החזירי span ולא button
//     return (
//       <span
//         onClick={handleClick}
//         className={`flex items-center justify-center ${className}`}
//         aria-label="הוסף למועדפים"
//         tabIndex={-1}
//       >
//         {content}
//       </span>
//     );
//   }

//   // ✅ במצב רגיל, זה כפתור עצמאי
//   return (
//     <button
//       type="button"
//       onClick={handleClick}
//       className={`flex flex-row items-center justify-center bg-[#FFF7F2] text-[#FF6500] rounded-[12px] h-[40px] w-[40px] transition hover:bg-[#ffe3d1] border-none p-0 ${className}`}
//       tabIndex={-1}
//       aria-label="הוסף למועדפים"
//       aria-pressed={isFavorite}
//     >
//       {content}
//     </button>
//   );
// }

// export default FavoriteButton;


import React from "react";
import { AiOutlineHeart, AiFillHeart } from "react-icons/ai";
import { useSelector, useDispatch } from "react-redux";
import {
  useAddFavoriteMutation,
  useRemoveFavoriteMutation,
} from "../../redux/api/favoritesApi";
import { addGuest, removeGuest } from "../../redux/slices/guestFavoritesSlice";

function FavoriteButton({
  productId,
  product,
  favorites = [],
  asChild = false, // אם הכפתור עטוף ע"י קומפוננטה חיצונית
  className = "",
  onToggle, // אופציונלי: קולבק חיצוני
}) {
  const user = useSelector((state) => state.user.user);
  const dispatch = useDispatch();

  const [addFavorite] = useAddFavoriteMutation();
  const [removeFavorite] = useRemoveFavoriteMutation();

  const isFavorite = favorites.some((f) => {
    const favId =
      f?.productId && typeof f.productId === "object"
        ? f.productId._id
        : f?.productId ?? null;
    return favId === productId;
  });

  const doToggle = async () => {
    try {
      if (user) {
        if (isFavorite) {
          await removeFavorite(productId);
        } else {
          await addFavorite(productId);
        }
      } else {
        if (isFavorite) {
          dispatch(removeGuest(productId));
        } else {
          // נדרשת ישות מוצר בסיסית כדי להוסיף כאורח
          dispatch(addGuest(product));
        }
      }
      onToggle?.(isFavorite);
    } catch (e) {
      // אפשר להוסיף כאן הודעת שגיאה גלובלית אם יש מנגנון לכך
      console.error("Favorite toggle failed:", e);
    }
  };

  // לא מפעיל onClick של ההורה
  const handleClick = (e) => {
    e.stopPropagation();
    e.preventDefault();
    doToggle();
  };

  const content = isFavorite ? (
    <AiFillHeart className="w-6 h-6 text-[#FF6500]" />
  ) : (
    <AiOutlineHeart className="w-6 h-6 text-[#FF6500]" />
  );

  if (asChild) {
    // במצב עטוף - span ולא button
    return (
      <span
        onClick={handleClick}
        className={`flex items-center justify-center ${className}`}
        aria-label="הוסף למועדפים"
        role="button"
        tabIndex={-1}
        aria-pressed={isFavorite}
      >
        {content}
      </span>
    );
  }

  // במצב רגיל - כפתור עצמאי
  return (
    <button
      type="button"
      onClick={handleClick}
      className={`flex items-center justify-center bg-[#FFF7F2] text-[#FF6500] rounded-[12px] h-[40px] w-[40px] transition hover:bg-[#ffe3d1] border-none p-0 ${className}`}
      tabIndex={-1}
      aria-label="הוסף למועדפים"
      aria-pressed={isFavorite}
    >
      {content}
    </button>
  );
}

export default FavoriteButton;
