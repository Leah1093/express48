
import { useEffect, useState } from "react";
import ProductCard from "./ProductCard";
import axios from 'axios';
import LogoutButton from "../../authentication/LogoutButton";
import { useListFavoritesQuery } from "../../../redux/api/favoritesApi";
import { useSelector } from "react-redux";


function ProductsList() {
  const user = useSelector((state) => state.user.user); // נניח שזה ה־state של המשתמש המחובר
  const guestFavorites = useSelector((state) => state.guestFavorites); // מגיע מה־slice שיצרנו
  // קריאה לשרת רק אם המשתמש מחובר
  const { data: favorites } = useListFavoritesQuery(undefined, {
    skip: !user, // 👈 אם אין user → לא שולחים בקשה
  });


  // אם יש user → לוקחים מהשרת, אחרת → מה־ slice
  const items = user ? favorites?.items || [] : guestFavorites;
  console.log("favoritesApi data:", items);

  const [products, setProducts] = useState([]);

  useEffect(() => {
    axios.get("http://localhost:8080/products")
      .then(res => {
        setProducts(res.data)
        console.log("Products loaded:", res.data);
      })
      .catch((err) => console.error("שגיאה בטעינה:", err));
  }, []);

  return (
    <div style={listStyles.wrapper}>

      {products.map((product) => {
        console.log(product); // כאן רואים מה מגיע
        return (
          <ProductCard key={product._id} product={product} favorites={items} />
        );
      })}


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
