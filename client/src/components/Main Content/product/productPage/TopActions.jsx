import { useState } from "react";
import { IoHeartOutline, IoHeart, IoShareSocialOutline } from "react-icons/io5";
import { useDispatch, useSelector } from "react-redux";
import { useAddFavoriteMutation, useRemoveFavoriteMutation,useListFavoritesQuery  } from "../../../../redux/api/favoritesApi";
import FavoriteButton from "../../FavoriteButton";


export default function TopActions({ product }) {

    const user = useSelector((state) => state.user.user);

    // מועדפים מהשרת (רק אם יש user)
    const { data: favoritesData } = useListFavoritesQuery(undefined, {
        skip: !user,
    });

    // מועדפים לאורח
    const guestFavorites = useSelector((state) => state.guestFavorites);

    // בחירה לפי מצב המשתמש
    const favorites = user ? favoritesData?.items || [] : guestFavorites;

    // שיתוף
    const handleShare = async () => {
        const url = window.location.href;


        if (navigator.share) {
            try {
                await navigator.share({
                    title: product?.title || "מוצר",
                    url,
                });
            } catch (err) {
                console.error("Share cancelled:", err);
            }
        } else {
            // fallback – מעתיק ללוח
            await navigator.clipboard.writeText(url);
            alert("קישור הועתק");
        }
    };


    
    return (
        <div className="flex gap-2">
            {/* כפתור שיתוף */}
            <button
                onClick={handleShare}
                className="w-10 h-10 flex items-center justify-center rounded-full bg-[#fff7f2] hover:bg-[#ffe8d9] transition"
            >
                <IoShareSocialOutline className="w-6 h-6 text-[#ff6500]" />
            </button>
            {/* כפתור מועדפים */}
            <FavoriteButton
                productId={product._id} // 👈 חשוב לשים _id נכון
                product={product}
                favorites={favorites} // 👈 תעבירי את רשימת המועדפים שמגיעה מה־Redux או מה־props
            />
        </div>
    );
}
