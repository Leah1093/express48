import React from "react";
import { useAddFavoriteMutation, useRemoveFavoriteMutation, useListFavoritesQuery } from "../../redux/api/favoritesApi";
import { Heart } from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import { addGuest, removeGuest } from "../../redux/slices/guestFavoritesSlice";

function FavoriteButton({ productId,product, favorites }) {
    const user = useSelector((state) => state.user.user);
    const dispatch = useDispatch();

    const [addFavorite] = useAddFavoriteMutation();
    const [removeFavorite] = useRemoveFavoriteMutation();


    const items = favorites; // מוציאים את המערך
    const isFavorite = items.some(f => {
        const favId = typeof f.productId === "object" ? f.productId._id : f.productId;
        return favId === productId;
    });


    const toggleFavorite = () => {
        if (user) {
            if (isFavorite) removeFavorite(productId);
            else addFavorite(productId);

        } else {
            if (isFavorite) dispatch(removeGuest(productId));
            else dispatch(addGuest(product));
        }
    };

    return (
        <button
            onClick={toggleFavorite}
            className="p-2 bg-white rounded-lg shadow hover:bg-gray-100"
        >
            <Heart size={18} className={isFavorite ? "text-red-500 fill-red-500" : ""} />
        </button>
    );
}

export default FavoriteButton;
