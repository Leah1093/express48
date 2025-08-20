
import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { addItemAsync } from "../../redux/thunks/cartThunks"; 
import { addGuestItem } from "../../redux/slices/guestCartSlice";
import { Search, Shuffle } from "lucide-react";
import FavoriteButton from "./FavoriteButton";

function ProductCard({ product,favorites}) {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user.user);

  const handleAddToCart = () => {
    console.log("product._id:", product._id); 
    if (user) {
      dispatch(addItemAsync(product._id));
    } else {
      dispatch(addGuestItem(product));
    }
  };

  return (
    <div className="group relative bg-white rounded-xl shadow-md p-4 text-center w-[250px]">
      {/* תגית NEW */}
      <div className="absolute top-2 left-2 bg-green-600 text-white px-2 py-1 rounded-full text-xs">
        NEW
      </div>

      {/* אייקונים שמופיעים ב-hover */}
      <div className="absolute top-4 left-2 flex flex-col gap-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <button className="p-2 bg-white rounded-lg shadow hover:bg-gray-100">
          <Shuffle size={18} />
        </button>
        <button className="p-2 bg-white rounded-lg shadow hover:bg-gray-100">
          <Search size={18} />
        </button>
       <FavoriteButton productId={product._id} product={product} favorites={favorites} />
      </div>

      {/* תמונה */}
      <img
        src={product.image}
        alt={product.title}
        className="w-[120px] h-[120px] object-contain mx-auto"
      />

      {/* שם מוצר */}
      <div className="mt-3 font-bold text-sm">{product.title}</div>

      {/* מחיר */}
      <div className="text-[#0d2d52] font-bold text-lg my-2">
        {product.price} ₪
      </div>

      {/* צבעים מדומים */}
      <div className="flex justify-center gap-2 mb-3">
        <span className="w-4 h-4 rounded-full bg-[#d6b1d8]" />
        <span className="w-4 h-4 rounded-full bg-black" />
        <span className="w-4 h-4 rounded-full bg-white border border-gray-300" />
      </div>

      {/* כפתור */}
      <button
        className="bg-[#0d2d52] text-white rounded-md px-3 py-2 hover:bg-[#123a6d] transition"
        onClick={handleAddToCart}
      >
        בחר אפשרויות
      </button>
    </div>
  );
}

export default ProductCard;

