import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { addItemAsync } from "../../../redux/thunks/cartThunks";
import { addGuestItem } from "../../../redux/slices/guestCartSlice";
import QuantityInput from "../../TopNav/cart/QuantityInput";
import { useNavigate } from "react-router-dom";
import { selectCartSubtotal, selectCartItems } from "../../../redux/slices/cartSelectors";

export default function ProductPage() {
    const { productSlug } = useParams();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [quantity, setQuantity] = useState(1);
    const [selectedVariation, setSelectedVariation] = useState(null);
    const [selectedShipping, setSelectedShipping] = useState(0);
    const [shippingOptions, setShippingOptions] = useState();
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const user = useSelector((state) => state.user.user);
    const cartItems = useSelector(selectCartItems);    const isMobile = useSelector((state) => state.ui.isMobile);


    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const productResponse = await fetch(`http://localhost:8080/products/${productSlug}`);

                if (!productResponse.ok) throw new Error('Network response was not ok');
                const product = await productResponse.json();
                console.log("product", product)
                setProduct(product);
                // setShippingOptions([
                //     {
                //         title: "משלוח עד הבית",
                //         price: "30₪ או משלוח חינם בקניה מעל 200₪",
                //         address: user?.address || "לא הוגדר כתובת",
                //     },
                //     {
                //         title: "נקודת איסוף",
                //         price: "חינם",
                //         address: "דואר ישראל, זול סטוק ,יפו 217, ירושלים",
                //     }
                // ]);

            } catch (error) {
                console.error("Error fetching product:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchProduct();
    }, [productSlug]);

    useEffect(() => {
        console.log(product);
        console.log(user);
        console.log(shippingOptions);
    }, [product]);

    const existing = cartItems.find(
    (it) => (it.productId?._id ?? it.productId) === product?._id
  );


    // Quantity handlers
    const handleDecrease = () => setQuantity(q => Math.max(1, q - 1));
    const handleIncrease = () => setQuantity(q => q + 1);

    // Variation handler
    const handleVariationSelect = (variation) => setSelectedVariation(variation);

    // Add to cart handler
    const handleAddToCart = () => {
        if (user) {
            dispatch(addItemAsync(product._id));
        } else {
            dispatch(addGuestItem(product));
        }
    };

    // Buy now handler
    const handleClick = () => {
        navigate("/cart");
    };

    // Calculate delivery date: today + 7 days
    const getDeliveryDate = () => {
        const today = new Date();
        const deliveryDate = new Date(today);
        deliveryDate.setDate(today.getDate() + 7);
        const options = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' };
        return deliveryDate.toLocaleDateString('he-IL', options);
    };

    const stripTags = (html) => {
        const doc = new DOMParser().parseFromString(html, 'text/html');
        return doc.body.textContent || "";
    };

    if (loading) return <div className="text-center py-20">Loading...</div>;
    if (!product) return <div className="text-center py-20">Product not found</div>;

    return (
        <div
            className={`font-rubik bg-[${isMobile ? '#FFF7F2' : '#EDFFEA'}] text-gray-900 mx-auto ${isMobile ? 'max-w-[430px] px-2' : 'max-w-[1320px] px-8'} py-4`}
            style={{ minHeight: isMobile ? '4417px' : 'auto' }}
        >
            {/* Main flex container */}
            <div className={`flex flex-col ${isMobile ? 'items-start' : 'items-end'} gap-12 w-full`}>
                {/* Top Section: Title, Breadcrumbs, Gallery */}
                <div className={`flex ${isMobile ? 'flex-col items-center gap-8' : 'flex-row items-end gap-32'} w-full`} dir="rtl">
                    {/* Gallery */}
                    <div className={`${isMobile ? 'w-full flex flex-col items-center' : 'w-[584px] flex flex-col items-start gap-6'}`}>
                        <div className={`flex flex-col justify-center items-center border border-[#ECECEC] rounded-xl ${isMobile ? 'w-[364px] h-[413px]' : 'h-[663px] w-full'} mb-4`}>
                            <img src={product.image || product.images?.[0]} alt={product.title} className="object-contain max-h-full max-w-full" />
                        </div>
                        {/* Thumbnails */}
                        <div className={`flex ${isMobile ? 'gap-2' : 'gap-6'} overflow-hidden w-full justify-end`}>
                            {product.images?.map((img, i) => (
                                <div key={i} className="border border-[#ECECEC] rounded-xl flex justify-center items-center w-[117px] h-[133px]">
                                    <img src={img} alt={`thumb-${i}`} className="object-contain max-h-full max-w-full" />
                                </div>
                            ))}
                        </div>
                    </div>
                    {/* Details */}
                    <div className={`${isMobile ? 'w-full' : 'w-[608px] flex flex-col items-end gap-6'} py-4`} dir="rtl" >
                        {/* Title & Brand */}
                        <div className="flex flex-col items-end gap-2">
                            <h1 className="font-semibold text-[24px] leading-[120%] text-right mb-1" >{product.title}</h1>
                            <div className="text-[16px] text-gray-500 text-right mb-1" >{product.brand}</div>
                            {/* <div className="flex items-center gap-2 mb-1">
                                    <span className="text-orange-600 text-xl font-bold">{product.ratings?.avg}</span>
                                    <span className="flex gap-1">
                                        {[...Array(5)].map((_, i) => (
                                            <span key={i} className={i < Math.round(product.ratings?.avg) ? "text-orange-500" : "text-gray-300"}>★</span>
                                        ))}
                                    </span>
                                </div>
                                <div className="text-sm text-gray-600 flex gap-2">
                                    <span>{product.ratings?.count} ביקורות</span>
                                    <span>{product.purchases} נמכר</span>
                                    <span>{product.views} צפיות</span>
                                </div> */}
                        </div>
                        {/* Description */}
                        <div className="text-[16px] leading-[120%] text-right mb-4">
                            {stripTags(product.description)}
                        </div>
                        {/* Price & Selectors */}
                        <div className={`flex ${isMobile ? 'flex-col gap-4' : 'flex-row gap-12'} items-end w-full`}>
                            {/* Price */}
                            <div className="flex flex-col items-end gap-2 w-[165px]">
                                <span className="text-[16px] font-semibold">מחיר</span>
                                <span className="text-[24px] font-semibold">₪{product.price?.amount || product.price}</span>
                            </div>
                            {/* Color Selector */}
                            {product.variations && product.variations.length > 0 && (
                                <div className="flex flex-col items-end gap-2 w-[202px]">
                                    <div className="flex gap-2 items-center justify-end">
                                        <span className="text-[16px] font-semibold">צבע:</span>
                                        <span className="text-[16px]">{product.variations[0]?.attributes.color}</span>
                                    </div>
                                    <div className="flex gap-2 flex-wrap justify-end">
                                        {product.variations.map((v, i) => (
                                            <button
                                                key={i}
                                                className={`px-3 py-1 border rounded-[16px] text-[14px] ${selectedVariation === v ? 'border-orange-600 bg-orange-50' : 'border-gray-300 bg-white'} font-normal`}
                                                onClick={() => handleVariationSelect(v)}
                                            >
                                                {v.attributes.color}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                            {/* Quantity Selector */}
                            <div className="flex flex-col items-end gap-2 w-[76px]">
                                <span className="text-[16px] font-semibold">כמות</span>
                                <div className="flex gap-2 items-center justify-end">
                                    <button className="px-2 py-1 border rounded" onClick={handleDecrease}>-</button>
                                    <span>{quantity}</span>
                                    <button className="px-2 py-1 border rounded" onClick={handleIncrease}>+</button>
                                </div>
                            </div>
                        </div>
                        {/* Add to Cart / Buy Now */}
                        <div className={`flex ${isMobile ? 'flex-col gap-4' : 'flex-row gap-4'} w-full mt-4`}>
                            <button
                                className="bg-orange-600 text-white rounded-[16px] text-[16px] font-bold py-3 px-8 flex-1 hover:bg-orange-700 transition"
                                onClick={handleAddToCart}
                            >
                                הוסף לעגלת קניות
                            </button>
                            <button
                                className="border-2 border-orange-600 text-orange-600 rounded-[16px] text-[16px] font-bold py-3 px-8 flex-1 hover:bg-orange-50 transition"
                                onClick={handleClick}
                            >
                                קנה עכשיו
                            </button>
                        </div>
                    </div>
                </div>
                {/* Store Info */}
                <div className={`flex flex-col items-end gap-2 w-full border-b border-[#ECECEC] py-4`}>
                    <div className="flex items-center gap-2 justify-between w-full">
                        <span className="text-[16px] font-semibold">שם החנות</span>
                        <span className="text-[16px] font-semibold">נמכר ע"י</span>
                    </div>
                </div>
                {/* Shipping */}
                <div className="flex flex-col items-end gap-6 w-full">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="text-[16px] font-semibold">משלוחים</span>
                    </div>
                    <div className={`flex ${isMobile ? 'flex-col gap-4' : 'flex-row gap-6'} w-full`}>
                        {shippingOptions?.map((option, idx) => (
                            <div
                                key={idx}
                                className={`rounded-xl border transition cursor-pointer relative p-6 ${selectedShipping === idx ? 'border-orange-500 bg-orange-50' : 'border-[#ECECEC] bg-white'}`}
                                onClick={() => setSelectedShipping(idx)}
                                style={{ minWidth: isMobile ? '365px' : '632px' }}
                            >
                                {/* Orange dot for selected */}
                                {selectedShipping === idx && (
                                    <span className="absolute right-2 top-2 w-3 h-3 bg-orange-500 rounded-full"></span>
                                )}
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="font-bold text-[16px]">{option.title}</span>
                                </div>
                                <div className="text-[16px] text-gray-700 mb-1">משלוח: <span className="font-bold">{option.price}</span></div>
                                <div className="text-[16px] text-gray-700 mb-1">מסירה - 7 ימים</div>
                                <div className="text-[16px] text-gray-700">{option.address}</div>
                            </div>
                        ))}
                    </div>
                </div>
                {/* Product Specs */}
                {product.specs && (
                    <div className="flex flex-col items-end gap-2 w-full border-b border-[#ECECEC] py-4">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="text-[16px] font-semibold">מפרט טכני</span>
                        </div>
                    </div>
                    )}
                </div>
                {/* Security Policy */}
                <div className="flex flex-col items-end gap-2 w-full border-b border-[#ECECEC] py-4">
                    <span className="text-[16px] font-semibold">אבטחה</span>
                    <span className="text-[16px] leading-[120%] text-right">
                        לנסח פסקה על אבטחה לנסח פסקה על אבטחה לנסח פסקה על אבטחה לנסח פסקה על אבטחה לנסח פסקה על אבטחה לנסח פסקה על אבטחה לנסח פסקה על אבטחה לנסח פסקה על אבטחה לנסח פסקה על אבטחה לנסח פסקה על אבטחה
                    </span>
                </div>
                {/* Reviews */}
                <div className="flex flex-col items-end gap-2 w-full mt-12">
                    <span className="text-[16px] font-semibold">ביקורות</span>
                    <div className={`grid ${isMobile ? 'grid-cols-1' : 'grid-cols-2'} gap-6 w-full`}>
                        {product.reviews?.map((r, i) => (
                            <div key={i} className="bg-gray-100 rounded-lg p-4">
                                <div className="font-semibold">{r.user}</div>
                                <div className="text-orange-600">{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</div>
                                <div className="text-sm text-gray-800">{r.text}</div>
                            </div>
                        ))}
                    </div>
                </div>
                {/* Related Products */}
                <div className="flex flex-col items-end gap-2 w-full mt-12">
                    <span className="text-[16px] font-semibold">אולי תאהבו גם</span>
                    <div className={`grid ${isMobile ? 'grid-cols-2' : 'grid-cols-4'} gap-6 w-full`}>
                        {product.related?.map((p, i) => (
                            <div key={i} className="bg-gray-100 rounded-lg p-4 text-center">
                                <img src={p.image} alt={p.name} className="w-24 h-24 object-contain mx-auto mb-2" />
                                <div className="text-sm font-semibold">{p.name}</div>
                                <div className="text-orange-600 font-bold">₪{p.price}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
    );
}