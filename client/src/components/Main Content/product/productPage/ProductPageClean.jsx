import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { addItemAsync } from "../../../../redux/thunks/cartThunks";
import { addGuestItem } from "../../../../redux/slices/guestCartSlice";

export default function ProductPage() {
  const { storeSlug, productSlug } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((state) => state.user.user);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await fetch(`https://api.express48.com/products/${productSlug}`);
        if (!res.ok) throw new Error("Network error");
        const data = await res.json();
        setProduct(data);
      } catch (error) {
        console.error('Error:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    if (productSlug) {
      fetchProduct();
    }
  }, [productSlug]);

  const handleAddToCart = () => {
    if (user) {
      dispatch(addItemAsync(product._id));
    } else {
      dispatch(addGuestItem(product));
    }
  };

  if (loading) return <div className="p-4">Loading...</div>;
  if (error) return <div className="p-4">Error: {error}</div>;
  if (!product) return <div className="p-4">Product not found</div>;

  return (
    <div className="container mx-auto p-4" dir="rtl">
      <button onClick={() => navigate(-1)} className="mb-4 text-blue-600">
        חזור
      </button>
      
      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <img 
            src={product.images || product.image} 
            alt={product.title} 
            className="w-full rounded-lg"
          />
        </div>
        
        <div>
          <h1 className="text-2xl font-bold mb-4">{product.title}</h1>
          <p className="text-xl text-orange-600 mb-4">
            ₪{typeof product.price === 'object' ? product.price.amount : product.price}
          </p>
          <p className="mb-4">{product.description}</p>
          
          <button 
            onClick={handleAddToCart}
            className="bg-orange-600 text-white px-6 py-2 rounded hover:bg-orange-700"
          >
            הוסף לעגלה
          </button>
        </div>
      </div>
    </div>
  );
}
