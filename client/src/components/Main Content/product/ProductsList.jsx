import { useSelector } from "react-redux";
import { useListFavoritesQuery } from "../../../redux/api/favoritesApi";
import { useGetProductsQuery } from "../../../redux/services/productsApi";
import CategoryRow from "../../Categories/CategoryRow";
import ProductFilter from "./ProductFilter";
import ProductCard from "./ProductCard";

function ProductsList() {
  const user = useSelector((state) => state.user.user);
  const guestFavorites = useSelector((state) => state.guestFavorites);

  // פייבוריטס: בקשה רק כשיש משתמש מחובר
  const { data: favorites } = useListFavoritesQuery(undefined, { skip: !user });
  const favoriteItems = user ? favorites?.items || [] : guestFavorites || [];

  // מוצרים מה־API
  const {
    data,
    isFetching,
    isError,
  } = useGetProductsQuery();

  // נחפש את המערך האמיתי של המוצרים בצורה בטוחה
  let products = [];

  if (Array.isArray(data)) {
    // אם ה־API מחזיר ישר מערך
    products = data;
  } else if (data && Array.isArray(data.items)) {
    // אם מחזיר { items: [...] }
    products = data.items;
  } else if (data && Array.isArray(data.products)) {
    // אם מחזיר { products: [...] }
    products = data.products;
  }

  // לבדיקה: מה באמת חוזר מהשרת
  console.log("productsApi raw data:", data);
  console.log("normalized products:", products);

  return (
    <>
      <CategoryRow />
      <ProductFilter />

      {isError && (
        <div className="text-center text-red-600 mt-4">
          שגיאה בטעינת מוצרים
        </div>
      )}

      {isFetching && (
        <div className="h-10 w-full animate-pulse bg-gray-100 rounded my-4" />
      )}

      <div className="flex flex-wrap gap-5 justify-center p-8">
        {products.map((product) => (
          <ProductCard
            key={product._id || product.id}
            product={product}
            favorites={favoriteItems}
          />
        ))}
      </div>
    </>
  );
}

export default ProductsList;
