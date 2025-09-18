import React from "react";
import { useAddFavoriteMutation, useRemoveFavoriteMutation } from "../../redux/api/favoritesApi";
import { AiOutlineHeart, AiFillHeart } from "react-icons/ai";
import { useSelector, useDispatch } from "react-redux";
import { addGuest, removeGuest } from "../../redux/slices/guestFavoritesSlice";

function FavoriteButton({ productId, product, favorites }) {
  const user = useSelector((state) => state.user.user);
  const dispatch = useDispatch();

  const [addFavorite] = useAddFavoriteMutation();
  const [removeFavorite] = useRemoveFavoriteMutation();

  const items = favorites;
  const isFavorite = items.some((f) => {
    const favId =
      f?.productId && typeof f.productId === "object"
        ? f.productId._id
        : f?.productId ?? null;

    return favId === productId;
  });

  const toggleFavorite = (e) => {
    e.stopPropagation();
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
      className="flex flex-row items-center justify-center bg-[#FFF7F2] text-[#FF6500] rounded-[12px] h-[40px] w-[40px] transition hover:bg-[#ffe3d1] border-none p-0"
      tabIndex={-1}
      aria-label="הוסף למועדפים"
    >
      {isFavorite ? (
        <AiFillHeart className="w-6 h-6 text-[#FF6500]" />
      ) : (
        <AiOutlineHeart className="w-6 h-6 text-[#FF6500]" />
      )}
    </button>
  );
}

export default FavoriteButton;
