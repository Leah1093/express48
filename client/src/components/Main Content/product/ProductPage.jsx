import React, { use, useEffect, useState } from "react";
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
    // const [quantity, setQuantity] = useState(1);
    const [selectedVariation, setSelectedVariation] = useState(null);
    const [selectedShipping, setSelectedShipping] = useState(0);
    const [shippingOptions, setShippingOptions] = useState();
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const user = useSelector((state) => state.user.user);
    const cartItems = useSelector(selectCartItems);

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
    // const handleDecrease = () => setQuantity(q => Math.max(1, q - 1));
    // const handleIncrease = () => setQuantity(q => q + 1);

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
        <div className="font-heebo bg-white text-gray-900 max-w-6xl mx-auto p-8" dir="rtl">
            {/* Header: Icons, Title, Ratings */}
            <div className="flex items-start justify-between mb-4">
                {/* Icons */}
                <div className="flex gap-4">
                    <button className="p-2 rounded-full hover:bg-orange-100 transition" title="שיתוף">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6 text-orange-600">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 8.25V6a3 3 0 10-6 0v2.25M12 15v-6" />
                            <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
                        </svg>
                    </button>
                    <button className="p-2 rounded-full hover:bg-orange-100 transition" title="הוספה למועדפים">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" className="w-6 h-6 text-orange-600">
                            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41 0.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                        </svg>
                    </button>
                </div>
            </div>
            {/* Title */}
            <h1 className="text-3xl font-bold mb-2 text-right">{product.title}</h1>
            <div className="text-lg text-gray-500 mb-2 text-right">{product.brand}</div>
            <div className="flex flex-col items">
                <div className="flex items-center gap-2 mb-1">
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
                </div>
            </div>
            <div className="flex flex-col md:flex-row gap-8 text-right">
                {/* Left: Product Images */}
                <div className="md:w-1/2 flex flex-col items-center">
                    <img src={product.image || product.images?.[0]} alt={product.title} className="w-96 h-96 object-contain rounded-2xl mb-4" />
                    <div className="flex gap-2">
                        {product.images?.map((img, i) => (
                            <img key={i} src={img} alt={`thumb-${i}`} className="w-16 h-16 object-cover rounded-lg border" />
                        ))}
                    </div>
                </div>
                {/* Right: Product Details */}
                <div className="md:w-1/2 flex flex-col justify-between text-right">
                    <div>

                        {/* Description */}
                        <div className="mb-6">
                            {stripTags(product.description)}
                        </div>
                        <div className="flex items-center gap-2 mb-4">
                            <span className="font-semibold">מחיר:</span>
                            <span className="text-2xl text-orange-600 font-bold">₪{product.price?.amount || product.price}</span>
                            {product.discount && (
                                <span className="text-sm text-green-600 bg-green-100 px-2 py-1 rounded">
                                    {product.discount.discountType === "percent"
                                        ? `-${product.discount.discountValue}%`
                                        : `-${product.discount.discountValue}₪`}
                                </span>
                            )}
                        </div>

                        {/* Color/Size/Storage selectors */}
                        {product.variations && product.variations.length > 0 && (
                            <div className="mb-4">
                                <div className="mb-2 font-semibold">בחר וריאציה:</div>
                                <div className="flex gap-2 flex-wrap">
                                    {product.variations.map((v, i) => (
                                        <button
                                            key={i}
                                            className={`px-3 py-1 border rounded-lg bg-gray-100 hover:bg-orange-100 ${selectedVariation === v ? 'border-orange-600 bg-orange-50' : ''}`}
                                            onClick={() => handleVariationSelect(v)}
                                        >
                                            {v.attributes.color} {v.attributes.size} {v.attributes.storage}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                        {/* Quantity selector */}
                        <div className="mb-4 flex items-center gap-2">
                            <span className="font-semibold">כמות:</span>
                            <QuantityInput item={{
                                productId: product,
                                quantity:  existing ? existing.quantity : 1,                 // ברירת מחדל להתחלה
                                unitPrice: product.price.amount, // המחיר מהמודל החדש
                                selected: false
                            }}
                            productMode={true}
                             />

                        </div>
                        {/* Add to Cart / Buy Now */}
                        <div className="flex gap-4 mb-6">
                            <button
                                className="flex-1 py-3 bg-orange-600 text-white rounded-lg text-base font-bold hover:bg-orange-700 transition"
                                onClick={handleAddToCart}
                            >
                                הוסף לעגלת קניות
                            </button>
                            <button
                                className="flex-1 py-3 border border-orange-600 text-orange-600 rounded-lg text-base font-bold hover:bg-orange-50 transition"
                                onClick={handleClick}
                            >
                                קנה עכשיו
                            </button>
                        </div>
                    </div>
                </div>
            </div>


            {/* Specs */}
            {product.specs && (
                <div className="mb-6">
                    <div className="text-2xl font-bold mb-4">מפרט טכני</div>
                    <ul className="list-disc pl-5 text-gray-700">
                        {Object.entries(product.specs).map(([key, value], i) => (
                            <li key={i}><span className="font-bold">{key}:</span> {value}</li>
                        ))}
                    </ul>
                </div>
            )}

            {/* Specs */}
            {product.specs && (
                <div className="mb-6">
                    <div className="text-2xl font-bold mb-4">נמכר ע"י</div>
                    {/* Here i want to add div that display the name of the store with link to the store*/}
                </div>
            )}

            {/* Shipping Selector */}
            <div className="mb-6">
                <div className="text-2xl font-bold mb-4">משלוחים</div>
                <div className="flex flex-col gap-4">
                    {/* {shippingOptions.map((option, idx) => (
                        <div
                            key={idx}
                            className={`p-4 rounded-xl border transition cursor-pointer relative ${selectedShipping === idx ? 'border-orange-500 bg-orange-50' : 'border-gray-200 bg-white'}`}
                            onClick={() => setSelectedShipping(idx)}
                        > */}
                            {/* Orange dot for selected */}
                            {/* {selectedShipping === idx && (
                                <span className="absolute right-2 top-2 w-3 h-3 bg-orange-500 rounded-full"></span>
                            )}
                            <div className="flex items-center gap-2 mb-1">
                                <span className="text-xl">{option.icon}</span>
                                <span className="font-bold">{option.title}</span>
                            </div>
                            <div className="text-sm text-gray-700 mb-1">משלוח: <span className="font-bold">{option.price}</span></div>
                            <div className="text-sm text-gray-700 mb-1">מסירה: {getDeliveryDate()}</div>
                            <div className="text-sm text-gray-700">{option.address}</div>
                        </div>
                    ))} */}
                </div>
            </div>

            {/* Reviews */}
            <div className="mt-12 text-right">
                <h2 className="text-2xl font-bold mb-4">ביקורות</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
            <div className="mt-12 text-right">
                <h2 className="text-2xl font-bold mb-4">אולי תאהבו גם</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
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