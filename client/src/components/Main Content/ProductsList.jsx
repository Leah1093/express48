import { useEffect, useState } from "react";
import ProductCard from "./ProductCard";

function ProductsList() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    fetch("https://fakestoreapi.com/products/category/electronics")  
      .then((res) => res.json())
      .then((data) => setProducts(data))
      .catch((err) => console.error("שגיאה בטעינה:", err));
  }, []);

  return (
    <div style={listStyles.wrapper}>
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}

const listStyles = {
  wrapper: {
    display: "flex",
    flexWrap: "wrap",
    gap: "20px",
    justifyContent: "center",
    padding: "2rem",
  },
};

export default ProductsList;
