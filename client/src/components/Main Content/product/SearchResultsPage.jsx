// import { useEffect, useState } from "react";
// import { useSearchParams } from "react-router-dom";
// import axios from "axios";
// import MiniProductCard from "./MiniProductCard";

// function SearchResultsPage() {
//   const [searchParams] = useSearchParams();
//   const [results, setResults] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState("");
//   const searchTerm = searchParams.get("search") || "";

//   useEffect(() => {
//     if (!searchTerm) return;

//     const fetchData = async () => {
//       setLoading(true);
//       setError("");
//       try {
//         const res = await axios.get("https://api.express48.com/products/search", {
//           params: { search: searchTerm },
//         });
//         setResults(res.data.items || []);
//       } catch (err) {
//         setError("שגיאה בטעינת התוצאות");
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchData();
//   }, [searchTerm]);

//   return (
//     <div className="max-w-[1200px] mx-auto px-4 py-6" dir="rtl">
//       {/* כותרת */}
//       <h2 className="text-lg font-bold mb-4">
//         תוצאות חיפוש ({results.length})
//       </h2>

//       {/* מצב טעינה/שגיאה */}
//       {loading && <div className="text-gray-500">טוען...</div>}
//       {error && <div className="text-red-500">{error}</div>}

//       {/* תוצאות */}
//       {!loading && !error && (
//         <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
//           {results.map((product) => (
//             <MiniProductCard key={product._id} product={product} />
//           ))}
//         </div>
//       )}
//     </div>
//   );
// }

// export default SearchResultsPage;


// src/components/products/SearchResultsPage.jsx
import { useSearchParams } from "react-router-dom";
import MiniProductCard from "./MiniProductCard";
import { useGetProductsQuery } from "../../../redux/services/productsApi"; // ← נתיב לפי הפרויקט
function SearchResultsPage() {
  const [searchParams] = useSearchParams();
  const searchTerm = searchParams.get("search") || "";

  // קריאה ל־RTK Query עם פרמטר החיפוש
  const {
    data: productsData,
    isFetching,
    isError,
  } = useGetProductsQuery(
    searchTerm ? { search: searchTerm } : undefined,
    { skip: !searchTerm }
  );

  // אם השרת מחזיר { items: [] } – נשתמש בזה
  const results = Array.isArray(productsData)
    ? productsData
    : productsData?.items || [];

  return (
    <div className="max-w-[1200px] mx-auto px-4 py-6" dir="rtl">
      {/* כותרת */}
      <h2 className="text-lg font-bold mb-4">
        תוצאות חיפוש ({results.length})
      </h2>

      {/* מצב טעינה / שגיאה */}
      {isFetching && <div className="text-gray-500">טוען...</div>}
      {isError && <div className="text-red-500">שגיאה בטעינת התוצאות</div>}

      {/* תוצאות */}
      {!isFetching && !isError && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {results.map((product) => (
            <MiniProductCard key={product._id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}

export default SearchResultsPage;
