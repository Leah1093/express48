import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { addItemAsync } from "../../../../redux/thunks/cartThunks";
import { addGuestItem } from "../../../../redux/slices/guestCartSlice";
import { selectCartItems } from "../../../../redux/slices/cartSelectors";

import { useGetProductBySlugQuery } from "../../../../redux/services/productsApi";

import ProductDetails from "./ProductDetails.jsx";
import ProductGallery from "./ProductGalery.jsx";
import ProductSpecs from "./ProductSpecs.jsx";
import ProductShipping from "./ProductShipping.jsx";
import ProductReviews from "./ProductReviews.jsx";
import ProductSeller from "./ProductSeller.jsx";
import ProductOverview from "./ProductOverview.jsx";
import RelatedProducts from "./RelatedProducts.jsx";
import ProductTabs from "./ProductTabs.jsx";

export default function ProductPage() {
  const { productSlug } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const {
    data: product,
    isFetching,
    isError,
  } = useGetProductBySlugQuery(productSlug);

  const user = useSelector((state) => state.user.user);
  const cartItems = useSelector(selectCartItems);

  const [selectedVariation, setSelectedVariation] = useState(null);

  const existing = cartItems.find(
    (it) =>
      String(it.productId?._id ?? it.productId) === String(product?._id) &&
      String(it.variationId ?? "") === String(selectedVariation?._id ?? "")
  );

  const handleAddToCart = (quantity) => {
    if (!product) return;

    if (user) {
      dispatch(
        addItemAsync({
          productId: product._id,
          variationId: selectedVariation?._id || null,
          quantity,
        })
      );
    } else {
      dispatch(
        addGuestItem({
          product,
          variation: selectedVariation || null,
          quantity,
        })
      );
    }
  };

  const handleClick = () => navigate("/cart");

  if (isFetching) return <div className="text-center py-20">טוען...</div>;
  if (isError || !product)
    return <div className="text-center py-20">מוצר לא נמצא</div>;

   return (
    <div className="font-heebo bg-white text-gray-900 max-w-[1440px] mx-auto px-4 md:px-8 lg:px-12 py-6 md:py-10">
      {/* גלריה + פרטי מוצר */}
      <div
        className="
          w-full mx-auto
          grid grid-cols-1 md:grid-cols-2
          gap-[clamp(16px,2.5vw,36px)]
          md:items-start
        "
      >
        {/* פרטי מוצר – במובייל מתחת (order-2), בדסקטופ בעמודה השמאלית (md:order-1) */}
        <div className="w-full order-2 md:order-1">
          <ProductDetails
            product={product}
            existing={existing}
            selectedVariation={selectedVariation}
            setSelectedVariation={setSelectedVariation}
            handleAddToCart={handleAddToCart}
            handleClick={handleClick}
          />
        </div>

        {/* גלריה – במובייל למעלה (order-1), בדסקטופ בעמודה הימנית (md:order-2) */}
        <div className="w-full order-1 md:order-2">
          <ProductGallery
            product={product}
            selectedVariation={selectedVariation}
          />
        </div>
      </div>

      {/* טאבים לתוכן המוצר */}
      <div className="mt-105 md:mt-8 flex flex-col items-start gap-[46px] py-[40px] bg-[#F9FAFB] "
      dir="rtl">
        <ProductTabs
          overview={product.overview}
          specs={product.specs}
          reviews={product.reviews}
          description={product.description}
          warranty={product.warranty}
          // qa={product.qa}
        />
      </div>

      {product.related?.length > 0 && (
        <RelatedProducts related={product.related} />
      )}
    </div>
  );

}
