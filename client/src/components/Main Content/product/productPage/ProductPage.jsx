// import React, { useEffect, useState } from "react";
// import { useParams, useNavigate } from "react-router-dom";
// import { useDispatch, useSelector } from "react-redux";
// import { addItemAsync } from "../../../../redux/thunks/cartThunks";
// import { addGuestItem } from "../../../../redux/slices/guestCartSlice";
// import { selectCartItems } from "../../../../redux/slices/cartSelectors";

// import ProductDetails from "./ProductDetails.jsx";
// import ProductGallery from "./ProductGalery.jsx";
// import ProductSpecs from "./ProductSpecs.jsx";
// import ProductShipping from "./ProductShipping.jsx";
// import ProductReviews from "./ProductReviews.jsx";
// import ProductSeller from "./ProductSeller.jsx";
// import ProductOverview from "./ProductOverview.jsx";
// import RelatedProducts from "./RelatedProducts.jsx";

// export default function ProductPage() {
//   const { productSlug } = useParams();
//   const [product, setProduct] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [selectedVariation, setSelectedVariation] = useState(null);
//   const dispatch = useDispatch();
//   const navigate = useNavigate();
//   const user = useSelector((state) => state.user.user);
//   const cartItems = useSelector(selectCartItems);

//   useEffect(() => {
//     const fetchProduct = async () => {
//       try {
//         const res = await fetch(`https://api.express48.com/products/${productSlug}`);
//         if (!res.ok) throw new Error("Network error");
//         const data = await res.json();
//         setProduct(data);
//       } catch (err) {
//         console.error("Error fetching product:", err);
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchProduct();
//   }, [productSlug]);

//   const existing = cartItems.find(
//     (it) => (it.productId?._id ?? it.productId) === product?._id
//   );

//   const handleAddToCart = (quantity) => {
//     if (user) {
//       dispatch(addItemAsync(product._id, quantity));
//     } else {
//       dispatch(addGuestItem(product, quantity));
//     }
//   };

//   const handleClick = () => navigate("/cart");

//   if (loading) return <div className="text-center py-20">טוען...</div>;
//   if (!product) return <div className="text-center py-20">מוצר לא נמצא</div>;

//   return (
//     <div className="font-heebo bg-white text-gray-900 max-w-[1440px] mx-auto px-4 md:px-8 lg:px-12 py-6 md:py-10">
//       {/* בלוק עליון - גלריה + פרטים */}
//       <div className="flex flex-col md:flex-row-reverse justify-end items-start gap-8 lg:gap-[100px] self-stretch">
//         {/* גלריה */}
//         <div className="md:flex md:justify-end w-full md:w-[55%]">
//           <div className="w-[100%] md:max-w-[600px]">
//             <ProductGallery product={product} />
//           </div>
//         </div>

//         {/* פרטים */}
//         <div className="md:flex md:justify-end w-full md:w-[45%]">
//           <div className="w-auto md:max-w-[400px]">
//             <ProductDetails
//               product={product}
//               existing={existing}
//               selectedVariation={selectedVariation}
//               setSelectedVariation={setSelectedVariation}
//               handleAddToCart={handleAddToCart}
//               handleClick={handleClick}
//             />
//           </div>
//         </div>
//       </div>

//       {/* מוכר */}
//       <div className="mt-12 rounded-2xl border-b border-[#EDEDED] p-3">
//         <ProductSeller store={product.storeId} />
//       </div>

//       {/* משלוחים */}
//       <ProductShipping
//         shippingOptions={[
//           {
//             id: "pickup",
//             title: "נקודת איסוף",
//             price: "חינם",
//             delivery: "מסירה - 7 ימים",
//             address: "דואר ישראל, זול סטוק ,יפו 217, ירושלים",
//             isSelected: true,
//           },
//           {
//             id: "home",
//             title: "משלוח עד הבית",
//             price: "30₪ או חינם מעל 200₪",
//             delivery: "מסירה - 7 ימים",
//             address: "הלל 18, ירושלים",
//             isSelected: false,
//           },
//         ]}
//       />

//       {/* סקירה כללית */}
//       {product.overview && (
//         <ProductOverview overview={product.overview} />
//       )}

//       {/* מפרט טכני */}
//       {product.specs && (
//         <ProductSpecs specs={product.specs} />
//       )}

//       {/* ביקורות */}
//       {product.reviews?.length > 0 && (
//         <ProductReviews reviews={product.reviews} />
//       )}

//       {/* מוצרים קשורים */}
//       {product.related?.length > 0 && (
//         <RelatedProducts related={product.related} />
//       )}

//     </div>
//   );
// }

// // src/components/products/product-page/ProductPage.jsx
// import { useState } from "react";
// import { useParams, useNavigate } from "react-router-dom";
// import { useDispatch, useSelector } from "react-redux";
// import { addItemAsync } from "../../../../redux/thunks/cartThunks";
// import { addGuestItem } from "../../../../redux/slices/guestCartSlice";
// import { selectCartItems } from "../../../../redux/slices/cartSelectors";

// import { useGetProductBySlugQuery } from "../../../../redux/services/productsApi";

// import ProductDetails from "./ProductDetails.jsx";
// import ProductGallery from "./ProductGalery.jsx";
// import ProductSpecs from "./ProductSpecs.jsx";
// import ProductShipping from "./ProductShipping.jsx";
// import ProductReviews from "./ProductReviews.jsx";
// import ProductSeller from "./ProductSeller.jsx";
// import ProductOverview from "./ProductOverview.jsx";
// import RelatedProducts from "./RelatedProducts.jsx";

// export default function ProductPage() {
//   const { productSlug } = useParams();
//   const dispatch = useDispatch();
//   const navigate = useNavigate();

//   // שליפה דרך RTK Query לפי slug
//   const { data: product, isFetching, isError } = useGetProductBySlugQuery(productSlug);

//   const user = useSelector((state) => state.user.user);
//   const cartItems = useSelector(selectCartItems);

// <<<<<<< HEAD
//   useEffect(() => {
//     const fetchProduct = async () => {
//       try {
//         const res = await fetch(`http://localhost:8080/products/${productSlug}`);
//         if (!res.ok) throw new Error("Network error");
//         const data = await res.json();
//         setProduct(data);
//         console.log("Product data:", data);
//       } catch (err) {
//         console.error("Error fetching product:", err);
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchProduct();
//   }, [productSlug]);
// =======
//   const [selectedVariation, setSelectedVariation] = useState(null);
// >>>>>>> 09f9d3e93b71ea13f78e0f5427133a8dd3e1f9d4

// const existing = cartItems.find(
//   (it) =>
//     String(it.productId?._id ?? it.productId) === String(product?._id) &&
//     String(it.variationId ?? "") === String(selectedVariation?._id ?? "")
// );

//   const handleAddToCart = (quantity) => {
// <<<<<<< HEAD
//     console.log("selectedVariation:", selectedVariation?._id || null);
//     if (user) {
//       dispatch(addItemAsync({productId:product._id,variationId: selectedVariation?._id || null, quantity}));
// =======
//     if (!product) return;
//     if (user) {
//       // thunk בצד שלך שמקבל (productId, quantity)
//       dispatch(addItemAsync(product._id, quantity));
// >>>>>>> 09f9d3e93b71ea13f78e0f5427133a8dd3e1f9d4
//     } else {
//       dispatch(addGuestItem({product,variation: selectedVariation || null, quantity}));
//     }
//   };

//   const handleClick = () => navigate("/cart");

//   if (isFetching) return <div className="text-center py-20">טוען...</div>;
//   if (isError || !product) return <div className="text-center py-20">מוצר לא נמצא</div>;

//   return (
//     <div className="font-heebo bg-white text-gray-900 max-w-[1440px] mx-auto px-4 md:px-8 lg:px-12 py-6 md:py-10">
//       {/* בלוק עליון - גלריה + פרטים */}
//       <div className="flex flex-col md:flex-row-reverse justify-end items-start gap-8 lg:gap-[100px] self-stretch">
//         {/* גלריה */}
//         <div className="md:flex md:justify-end w-full md:w-[55%]">
//           <div className="w-[100%] md:max-w-[600px]">
//             <ProductGallery product={product}  selectedVariation={selectedVariation}/>
//           </div>
//         </div>

//         {/* פרטים */}
//         <div className="md:flex md:justify-end w-full md:w-[45%]">
//           <div className="w-auto md:max-w-[400px]">
//             <ProductDetails
//               product={product}
//               existing={existing}
//               selectedVariation={selectedVariation}
//               setSelectedVariation={setSelectedVariation}
//               handleAddToCart={handleAddToCart}
//               handleClick={handleClick}
//             />
//           </div>
//         </div>
//       </div>

//       {/* מוכר */}
//       <div className="mt-12 rounded-2xl border-b border-[#EDEDED] p-3">
//         <ProductSeller store={product.storeId} />
//       </div>

//       {/* משלוחים (דמו – כמו שהיה) */}
//       <ProductShipping
//         shippingOptions={[
//           {
//             id: "pickup",
//             title: "נקודת איסוף",
//             price: "חינם",
//             delivery: "מסירה - 7 ימים",
//             address: "דואר ישראל, זול סטוק ,יפו 217, ירושלים",
//             isSelected: true,
//           },
//           {
//             id: "home",
//             title: "משלוח עד הבית",
//             price: "30₪ או חינם מעל 200₪",
//             delivery: "מסירה - 7 ימים",
//             address: "הלל 18, ירושלים",
//             isSelected: false,
//           },
//         ]}
//       />

//       {/* סקירה כללית */}
//       {product.overview && <ProductOverview overview={product.overview} />}

//       {/* מפרט טכני */}
//       {product.specs && <ProductSpecs specs={product.specs} />}

//       {/* ביקורות */}
//       {product.reviews?.length > 0 && <ProductReviews reviews={product.reviews} />}

//       {/* מוצרים קשורים */}
//       {product.related?.length > 0 && <RelatedProducts related={product.related} />}
//     </div>
//   );
// }

// src/components/products/product-page/ProductPage.jsx
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

  // שליפה דרך RTK Query לפי slug
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
      // אם ה-thunk שלך מקבל אובייקט פרמטרים:
      dispatch(
        addItemAsync({
          productId: product._id,
          variationId: selectedVariation?._id || null,
          quantity,
        })
      );
    } else {
      // עגלת אורח
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
      {/* עטיפה של שתי העמודות */}
      <div
        className="w-full mx-auto px-4 md:px-6 lg:px-8
                grid gap-[clamp(16px,2.5vw,36px)]
                sm:grid-cols-1 md:[grid-template-columns:50%_50%]"
      >
        {/* פרטים */}

        {/* להרחיב: להסיר w-auto/max-w קטן → לשים רוחב מלא ו־max של 639px */}
        <div className="w-full ">
          <ProductDetails
            product={product}
            existing={existing}
            selectedVariation={selectedVariation}
            setSelectedVariation={setSelectedVariation}
            handleAddToCart={handleAddToCart}
            handleClick={handleClick}
          />
        </div>

        {/* גלריה */}

        <div className="w-full">
          <ProductGallery
            product={product}
            selectedVariation={selectedVariation}
          />
        </div>
      </div>

      {/* מוכר */}
      {/* <div className="mt-12 rounded-2xl border-b border-[#EDEDED] p-3">
        <ProductSeller store={product.storeId} />
      </div> */}

      {/* משלוחים (דמו – כמו שהיה) */}
      {/* <ProductShipping
        shippingOptions={[
          {
            id: "pickup",
            title: "נקודת איסוף",
            price: "חינם",
            delivery: "מסירה - 7 ימים",
            address: "דואר ישראל, זול סטוק ,יפו 217, ירושלים",
            isSelected: true,
          },
          {
            id: "home",
            title: "משלוח עד הבית",
            price: "30₪ או חינם מעל 200₪",
            delivery: "מסירה - 7 ימים",
            address: "הלל 18, ירושלים",
            isSelected: false,
          },
        ]}
      /> */}
      {/* טאבים לתוכן המוצר */}
        <div className="flex flex-col items-start gap-[46px] py-[40px] bg-[#F9FAFB]">

      <ProductTabs
        overview={product.overview}
        specs={product.specs}
        reviews={product.reviews}
        description={product.description}
        warranty={product.warranty}
        // qa={product.qa}
      />
</div>

      {/* מוצרים קשורים */}
      {product.related?.length > 0 && (
        <RelatedProducts related={product.related} />
      )}
    </div>
  );
}
