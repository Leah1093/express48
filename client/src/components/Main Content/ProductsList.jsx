import { useEffect, useState } from "react";
import ProductCard from "./ProductCard";
import axios from 'axios';
import LogoutButton from "../authentication/LogoutButton";

function ProductsList() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    axios.get("http://localhost:8080/products")  
      .then(res => setProducts(res.data))
      .catch((err) => console.error("שגיאה בטעינה:", err));
  }, []);

  return (
    <div style={listStyles.wrapper}>
      {products.map((product) => (
        <ProductCard key={product._id} product={product} />
      ))}
      <LogoutButton/>
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
