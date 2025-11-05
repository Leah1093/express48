
// import { useEffect, useState } from "react";
// import ProductCard from "./ProductCard";
// import axios from 'axios';
// import LogoutButton from "../../authentication/LogoutButton";
// import { useListFavoritesQuery } from "../../../redux/api/favoritesApi";
// import { useSelector } from "react-redux";
// import CategoryRow from "../../Categories/CategoryRow";
// import ProductFilter from "./ProductFilter";

// function ProductsList() {
//   const user = useSelector((state) => state.user.user); // נניח שזה ה־state של המשתמש המחובר
//   const guestFavorites = useSelector((state) => state.guestFavorites); // מגיע מה־slice שיצרנו
//   // קריאה לשרת רק אם המשתמש מחובר
//   const { data: favorites } = useListFavoritesQuery(undefined, {
//     skip: !user, // 👈 אם אין user → לא שולחים בקשה
//   });


//   // אם יש user → לוקחים מהשרת, אחרת → מה־ slice
//   const items = user ? favorites?.items || [] : guestFavorites;
//   console.log("favoritesApi data:", items);

//   const [products, setProducts] = useState([]);

//   useEffect(() => {

//     axios.get("https://api.express48.com/products")
//       .then(res => {
//         setProducts(res.data)
      
//       })
//       .catch((err) => console.error("שגיאה בטעינה:", err));
//   }, []);

//   return (<>
//     <CategoryRow />
//     <ProductFilter/>
//     <div className="flex flex-wrap gap-5 justify-center p-8">

      
//       {products.map((product) => {
//         console.log(product); // כאן רואים מה מגיע
//         return (
//           <ProductCard key={product._id} product={product} favorites={items} />
//         );
//       })}
//     </div>
//   </>
//   );
// }

// export default ProductsList;



// src/components/products/ProductsList.jsx
import { useSelector } from "react-redux";
import { useListFavoritesQuery } from "../../../redux/api/favoritesApi";
import { useGetProductsQuery } from "../../../redux/services/productsApi"; // ← נתיב לפי הפרויקט
import CategoryRow from "../../Categories/CategoryRow";
import ProductFilter from "./ProductFilter";
import ProductCard from "./ProductCard";

function ProductsList() {
  const user = useSelector((state) => state.user.user);
  const guestFavorites = useSelector((state) => state.guestFavorites);

  // פייבוריטס: בקשה רק כשיש משתמש מחובר
  const { data: favorites } = useListFavoritesQuery(undefined, { skip: !user });
  const favoriteItems = user ? favorites?.items || [] : guestFavorites;

  // מוצרים: דרך RTK Query בלבד (אפשר להעביר פרמטרים אם צריך)
  const { data: products = [], isFetching, isError } = useGetProductsQuery();

  return (
    <>
      <CategoryRow />
      <ProductFilter />

      {/* מצב טעינה/שגיאה (אופציונלי לשמור על UX) */}
      {isError && (
        <div className="text-center text-red-600 mt-4">שגיאה בטעינת מוצרים</div>
      )}
      {isFetching && (
        <div className="h-10 w-full animate-pulse bg-gray-100 rounded my-4" />
      )}

      <div className="flex flex-wrap gap-5 justify-center p-8">
        {products.map((product) => (
          <ProductCard
            key={product._id}
            product={product}
            favorites={favoriteItems}
          />
        ))}
      </div>
    </>
  );
}

export default ProductsList;
