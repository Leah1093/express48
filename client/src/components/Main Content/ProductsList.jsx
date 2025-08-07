import React, { useEffect, useState } from "react";
import ProductCard from "./ProductCard";
import axios from "axios";

import LogoutButton from "../authentication/LogoutButton";
import { useListFavoritesQuery } from "../../redux/api/favoritesApi";
import { useSelector } from "react-redux";

function ProductsList() {
  // מצב משתמש מחובר + מועדפים לאורח
  const user = useSelector((state) => state.user.user);
  const guestFavorites = useSelector((state) => state.guestFavorites);

  // אם אין user לא מושכים מועדפים מהשרת
  const { data: favorites } = useListFavoritesQuery(undefined, { skip: !user });

  // בחירת מקור המועדפים לפי מצב התחברות
  const items = user ? (favorites?.items ?? []) : (guestFavorites ?? []);

  const [products, setProducts] = useState([]);

  useEffect(() => {
    axios
      .get("http://localhost:8080/products")
      .then((res) => setProducts(res.data || []))
      .catch((err) => console.error("שגיאה בטעינת מוצרים:", err));
  }, []);

  return (
    <div className="products-list">
      {products.map((product) => (
        <ProductCard
          key={product._id || product.id}
          product={product}
          favorites={items}
        />
      ))}
    </div>
  );
}

export default ProductsList;
