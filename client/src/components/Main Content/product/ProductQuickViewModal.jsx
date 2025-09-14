import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { addGuestItem } from "../../../redux/slices/guestCartSlice";
import { addItemAsync } from "../../../redux/thunks/cartThunks";


export default function ProductQuickViewModal({ product, isOpen, onClose }) {
    const [quantity, setQuantity] = useState(1);
    const [selectedVariation, setSelectedVariation] = useState(null);
    const navigate = useNavigate();
    const user = useSelector((state) => state.user.user);
    const dispatch = useDispatch();


    if (!isOpen || !product) return null;

    const handleDecrease = () => setQuantity(q => Math.max(1, q - 1));
    const handleIncrease = () => setQuantity(q => q + 1);
    const handleVariationSelect = (variation) => setSelectedVariation(variation);

    const stripTags = (html) => {
        const doc = new DOMParser().parseFromString(html, 'text/html');
        return doc.body.textContent || "";
    };

    const handleAddToCart = () => {
        if (user) {
            dispatch(addItemAsync(product._id));
        } else {
            dispatch(addGuestItem(product));
        }
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center"
            style={{ background: 'rgba(128,128,128,0.5)' }}
            dir="rtl"
            onClick={onClose}
        >
            <div
                className="bg-white rounded-xl shadow-lg p-8 w-full max-w-lg relative text-right font-heebo max-h-[70vh] overflow-y-auto scrollbar-thin scrollbar-thumb-orange-300 scrollbar-track-gray-100"
                onClick={e => e.stopPropagation()}
            >
                <button className="absolute left-4 top-4 text-gray-500 hover:text-orange-600 text-2xl" onClick={onClose}>
                    &times;
                </button>
                <div className="flex flex-col items-center mb-4">
                    <img
                        src={product.image || product.images?.[0]}
                        alt={product.title}
                        className="w-48 h-48 object-contain rounded-xl mb-2"
                    />
                </div>
                <h2 className="text-2xl font-bold mb-2">{product.title}</h2>
                <div className="mb-4 text-gray-700">{stripTags(product.description)}</div>
                <div className="flex items-center gap-2 mb-4">
                    <span className="font-semibold">מחיר:</span>
                    <span className="text-xl text-orange-600 font-bold">₪{product.price?.amount || product.price}</span>
                </div>
                {product.variations && product.variations.length > 0 && (
                    <div className="mb-4">
                        <div className="mb-2 font-semibold">צבע:</div>
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
                <div className="mb-4 flex items-center gap-2">
                    <span className="font-semibold">כמות:</span>
                    <button className="px-2 py-1 border rounded" onClick={handleDecrease}>-</button>
                    <span>{quantity}</span>
                    <button className="px-2 py-1 border rounded" onClick={handleIncrease}>+</button>
                </div>
                <div className="flex gap-4 mb-4">
                    <button
                        className="flex-1 py-2 bg-orange-600 text-white rounded-lg text-base font-bold hover:bg-orange-700 transition"
                        onClick={handleAddToCart}>
                        הוסף לסל
                    </button>
                    <button
                        className="flex-1 py-2 border border-orange-600 text-orange-600 rounded-lg text-base font-bold hover:bg-orange-50 transition"
                    // TODO: buy now logic
                    >
                        קנה עכשיו
                    </button>
                </div>
                <button
                    className="w-full py-2 mt-2 bg-gray-100 text-orange-600 rounded-lg font-bold hover:bg-orange-50 transition"
                    onClick={() => navigate(`/products/${product.storeId?.slug || 'store'}/${product.slug}`)}
                >
                    הצג פרטים
                </button>
            </div>
        </div>
    );
}
