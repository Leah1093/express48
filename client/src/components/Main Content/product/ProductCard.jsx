// import React from "react";
// import { useDispatch, useSelector } from "react-redux";
// import { addItemAsync } from "../../../redux/thunks/cartThunks";
// import { addGuestItem } from "../../../redux/slices/guestCartSlice";
// import { Search, Shuffle } from "lucide-react";
// import FavoriteButton from "../FavoriteButton";
// import { useNavigate } from "react-router-dom";
// import { AiOutlineHeart } from "react-icons/ai";

// const ProductCard = React.memo(({ product, favorites }) => {
//   const dispatch = useDispatch();
//   const user = useSelector((state) => state.user.user);
//   const navigate = useNavigate();

//   const handleAddToCart = (event) => {
//     event.stopPropagation();
//     if (user) {
//       dispatch(addItemAsync(product._id));
//     } else {
//       dispatch(addGuestItem(product));
//     }
//   };

//   return (
//     <div
//       onClick={() => navigate(`/products/${product.storeId.slug}/${product.slug}`)}
//       className="group relative flex flex-row bg-white rounded-[16px] shadow-lg w-full max-w-[383px] h-[218px] cursor-pointer transition hover:shadow-xl overflow-hidden"
//       dir="rtl"
//     >
//       {/* Left: Image in square frame, half the card */}
//       <div className="flex-shrink-0 flex items-center justify-center h-full w-1/2 min-w-[180px]">
//         <div className="bg-white rounded-[12px] shadow border border-[#ededed] flex items-center justify-center w-[170px] h-[170px]">
//           <img
//             src={product.images}
//             alt={product.title}
//             className="w-[150px] h-[150px] object-contain object-center rounded-[10px]"
//             style={{ background: '#f7f7f7' }}
//           />
//         </div>
//       </div>

//       {/* Right: Product Details */}
//       <div className="flex flex-col justify-between flex-1 px-4 py-5 w-1/2">
//         <div>
//           <div className="text-[16px] font-semibold text-black leading-tight mb-1 break-words line-clamp-2" style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }} title={product.title}>{product.title}</div>
//           <div className="text-[14px] font-semibold text-black mb-1">{product.price.amount} ₪</div>
//           <div className="text-[13px] text-[#141414] opacity-70 mb-2">משלוח חינם - מסירה 7 ימים</div>
//         </div>
//         <div className="flex flex-row items-center gap-2 mt-2">
//           <button
//             className="flex flex-row items-center justify-center bg-[#FFF7F2] text-[#FF6500] rounded-[12px] h-[40px] w-[40px] transition hover:bg-[#ffe3d1] border-none p-0"
//             onClick={e => e.stopPropagation()}
//             tabIndex={-1}
//             aria-label="הוסף למועדפים"
//           >
//             {/* <img src={require('../../../assets/logoExpress.png')} alt="wishlist" className="w-5 h-5" /> */}
//             {/* <AiOutlineHeart className="text-orange-500 w-6 h-6" /> */}
//             <FavoriteButton
//               productId={product._id}
//               product={product}
//               favorites={favorites}
//               onClick={e => e.stopPropagation()}
//             />
//           </button>
//           <button
//             className="flex-1 bg-black text-white text-[14px] font-semibold rounded-[8px] h-[40px] transition hover:bg-[#222]"
//             onClick={e => { e.stopPropagation(); handleAddToCart(e); }}
//           >
//             הוספה לסל
//           </button>
//         </div>
//       </div>

//       {/* Floating icons on hover (unchanged) */}
//       {/* <div className="absolute top-4 right-4 flex flex-col gap-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
//         <button
//           className="p-2 bg-white rounded-lg shadow hover:bg-gray-100"
//           onClick={e => e.stopPropagation()}
//         >
//           <Shuffle size={18} />
//         </button>
//         <button
//           className="p-2 bg-white rounded-lg shadow hover:bg-gray-100"
//           onClick={e => e.stopPropagation()}
//         >
//           <Search size={18} />
//         </button>
//         <FavoriteButton
//           productId={product._id}
//           product={product}
//           favorites={favorites}
//           onClick={e => e.stopPropagation()}
//         />
//       </div> */}
//     </div>
//   );
// });

// export default ProductCard;





import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { addItemAsync } from "../../../redux/thunks/cartThunks";
import { addGuestItem } from "../../../redux/slices/guestCartSlice";
import FavoriteButton from "../FavoriteButton";
import { useNavigate } from "react-router-dom";

const ProductCard = React.memo(({ product, favorites }) => {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user.user);
  const navigate = useNavigate();

  const handleAddToCart = (event) => {
    event.stopPropagation();
    if (user) {
      dispatch(addItemAsync({productId:product._id}));
    } else {
      dispatch(addGuestItem({product}));
    }
  };

  return (
    <div
      onClick={() => navigate(`/products/${product.storeId.slug}/${product.slug}`)}
      className="group relative flex flex-row bg-white rounded-[16px] shadow-lg w-full max-w-[383px] h-[218px] cursor-pointer transition hover:shadow-xl overflow-hidden"
      dir="rtl"
    >
      {/* Left: Image */}
      <div className="flex-shrink-0 flex items-center justify-center h-full w-1/2 min-w-[180px]">
        <div className="bg-white rounded-[12px] shadow border border-[#ededed] flex items-center justify-center w-[170px] h-[170px]">
          <img
            src={product.images}
            alt={product.title}
            className="w-[150px] h-[150px] object-contain object-center rounded-[10px]"
            style={{ background: "#f7f7f7" }}
          />
        </div>
      </div>

      {/* Right: Details */}
      <div className="flex flex-col justify-between flex-1 px-4 py-5 w-1/2">
        <div>
          <div
            className="text-[16px] font-semibold text-black leading-tight mb-1 break-words line-clamp-2"
            style={{ display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}
            title={product.title}
          >
            {product.title}
          </div>
          <div className="text-[14px] font-semibold text-black mb-1">{product.price.amount} ₪</div>
          <div className="text-[13px] text-[#141414] opacity-70 mb-2">משלוח חינם - מסירה 7 ימים</div>
        </div>

        <div className="flex flex-row items-center gap-2 mt-2">
          {/* כפתור מועדפים — בלי עטיפה חיצונית */}
          <FavoriteButton
            productId={product._id}
            product={product}
            favorites={favorites}
            className="bg-[#FFF7F2] text-[#FF6500] rounded-[12px] h-[40px] w-[40px] transition hover:bg-[#ffe3d1] border-none p-0"
          />

          {/* הוספה לסל */}
          <button
            className="flex-1 bg-black text-white text-[14px] font-semibold rounded-[8px] h-[40px] transition hover:bg-[#222]"
            onClick={(e) => { e.stopPropagation(); handleAddToCart(e); }}
          >
            הוספה לסל
          </button>
        </div>
      </div>
    </div>
  );
});

export default ProductCard;
