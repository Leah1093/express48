import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { useListFavoritesQuery, useRemoveFavoriteMutation } from "../../../redux/api/favoritesApi";
import { removeGuest, clearGuests } from "../../../redux/slices/guestFavoritesSlice";
import { X } from "lucide-react";
import { Link } from "react-router-dom";


export default function FavoritesList() {
    const user = useSelector((state) => state.user.user);
    const guestFavorites = useSelector((state) => state.guestFavorites);
    const dispatch = useDispatch();

    // למשתמשים מחוברים – שליפה מהשרת
    const { data: serverFavorites = [] } = useListFavoritesQuery(undefined, {
        skip: !user,
    });
    const [removeFavorite] = useRemoveFavoriteMutation();

    //   const favorites = user ? serverFavorites : guestFavorites;
    // const favorites = Array.isArray(user ? serverFavorites : guestFavorites)
    //   ? (user ? serverFavorites : guestFavorites)
    //   : [];
    console.log("serverFavorites:", serverFavorites);

    const favorites = user
        ? serverFavorites?.items || []   // למשתמש מחובר – קח את items
        : guestFavorites;                // לא מחובר – קח מה-Redux

    // פונקציה פנימית בתוך הקומפוננטה
    const normalizeFavorites = (arr) =>
        arr.map(fav => {
            const id = fav.productId?._id || fav.productId || fav.product?._id;
            const product = fav.product || fav.productId || {};
            return { id, product };
        });

    // הפעלה
    const normalizedFavorites = normalizeFavorites(favorites);




    const handleRemove = (productId) => {
        if (user) {
            removeFavorite(productId);
        } else {
            dispatch(removeGuest(productId));
        }
    };

    const handleClearAll = () => {
        if (user) {
            // כאן אפשר לקרוא לאקשן שמוחק את כל המועדפים בשרת
            // לדוגמה: dispatch(clearAllServerFavorites())
        } else {
            dispatch(clearGuests());
        }
    };

    if (!favorites || favorites.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] text-center">
                <div className="text-gray-300">
                    <svg xmlns="http://www.w3.org/2000/svg"
                        fill="none" viewBox="0 0 24 24"
                        strokeWidth="1.5" stroke="currentColor"
                        className="w-24 h-24 mx-auto">
                        <path strokeLinecap="round" strokeLinejoin="round"
                            d="M12 21.35l-1.45-1.32C5.4 15.36 
                  2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 
                  0 3.41.81 4.5 2.09C13.09 3.81 
                  14.76 3 16.5 3 19.58 3 22 
                  5.42 22 8.5c0 3.78-3.4 
                  6.86-8.55 11.54L12 21.35z" />
                    </svg>
                </div>
                <h2 className="text-2xl font-semibold text-gray-800 mt-4">
                    רשימת משאלות זו ריקה.
                </h2>
                <p className="text-gray-500 mt-2">
                    עדיין אין לך מוצרים ברשימת המשאלות. תמצא הרבה מוצרים מעניינים בדף "חנות" שלנו.
                </p>
                <Link to="/products" className="mt-6 px-6 py-2 bg-blue-900 text-white rounded-lg shadow hover:bg-blue-800 transition">
                    חזרה לחנות
                </Link>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto p-4">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">המועדפים שלי</h2>
                <button
                    onClick={handleClearAll}
                    className="text-red-600 hover:text-red-800 text-sm flex items-center gap-1"
                >
                    <X size={16} /> נקה הכל
                </button>
            </div>

            <div className="grid gap-4">
                {normalizedFavorites.map((fav) => {
                     console.log("fav", fav);
                return (
                    <div
                        key={fav.id}
                        className="flex items-center justify-between border rounded-lg p-3 bg-white shadow-sm hover:shadow-md transition"
                    >
                        <div className="flex items-center gap-4">
                            {/* תמונה */}
                            <img
                                src={fav.product.images || "/placeholder.png"}
                                alt={fav.product.title}
                                className="w-16 h-16 object-cover rounded-lg border"
                            />

                            {/* פרטים */}
                            <div>
                                <h3 className="font-semibold text-lg">{fav.product.title || "מוצר"}</h3>
                                <p className="text-sm text-gray-600">
                                    {fav.product?.price?.amount ? `${fav.product.price.amount} ₪` : "ללא מחיר"}
                                </p>
                            </div>
                        </div>

                        {/* כפתור הסרה */}
                        <button
                            onClick={() => handleRemove(fav.id)}
                            className="text-gray-400 hover:text-red-500 transition"
                        >
                            <X size={20} />
                        </button>
                    </div>
                )
            })}
            </div>
        </div>
    );
}
