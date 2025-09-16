import { useState } from "react";
import { IoHeartOutline, IoHeart, IoShareSocialOutline } from "react-icons/io5";
import { useDispatch, useSelector } from "react-redux";
import { useAddFavoriteMutation, useRemoveFavoriteMutation } from "../../../../redux/api/favoritesApi";

export default function TopActions({ product }) {
    const [isFavorite, setIsFavorite] = useState(false);
    const user = useSelector((state) => state.user.user);
    const dispatch = useDispatch();

    const [addFavorite] = useAddFavoriteMutation();
    const [removeFavorite] = useRemoveFavoriteMutation();
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


    // מועדפים
    const handleToggleFavorite = () => {
        setIsFavorite((prev) => !prev);
        if (user) {
            if (!isFavorite) removeFavorite(product._Id);
            else addFavorite(product._Id);

        } else {
            if (!isFavorite) dispatch(removeGuest(product._Id));
            else dispatch(addGuest(product));
        }
    };

    return (
        <div className="flex gap-2">
            {/* כפתור שיתוף */}
            <button
                onClick={handleShare}
                className="w-10 h-10 flex items-center justify-center rounded-full bg-[#fff7f2] hover:bg-[#ffe8d9] transition"
            >
                <IoShareSocialOutline className="w-5 h-5 text-[#ff6500]" />
            </button>

            {/* כפתור מועדפים */}
            <button
                onClick={handleToggleFavorite}
                className="w-10 h-10 flex items-center justify-center rounded-full bg-[#fff7f2] hover:bg-[#ffe8d9] transition"
            >
                {isFavorite ? (
                    <IoHeart className="w-5 h-5 text-[#ff6500]" />
                ) : (
                    <IoHeartOutline className="w-5 h-5 text-[#ff6500]" />
                )}
            </button>
        </div>
    );
}
