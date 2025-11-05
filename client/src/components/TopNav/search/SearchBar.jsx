// import { useNavigate } from "react-router-dom";
// import SearchInput from "./SearchInput";
// import SearchResults from "./SearchResults";
// import { useSearch } from "../../../hooks/useSearch";
// import { useState, useEffect } from "react";
// import axios from "axios";

// function SearchBar() {
//   const {
//     term,
//     setTerm,
//     results,
//     loading,
//     error,
//     searchNow,
//     recentSearches,
//     removeFromHistory,
//   } = useSearch({ minLength: 2, debounce: 600 });

//   const [popularSearches, setPopularSearches] = useState([]);
//   const [showResults, setShowResults] = useState(false);
//   const navigate = useNavigate();

//   // חיפושים נפוצים מהשרת
//   useEffect(() => {
//     axios
//       .get("https://api.express48.com/products/popular-searches")
//       .then((res) => {
//         console.log(res.data.items);
//         setPopularSearches(res.data.items || [])
//       })
//       .catch(() => setPopularSearches([]));
//   }, []);

//   return (
//     <div className="relative w-full">
//       <SearchInput
//         value={term}
//         onChange={setTerm}
//         onSubmit={() => {
//           searchNow(term, true)
//           navigate(`/products?search=${encodeURIComponent(term)}`)
//         }}
//         onFocus={() => setShowResults(true)}
//         onBlur={() => setTimeout(() => setShowResults(false), 150)}
//       />

//       {showResults && (
//         <SearchResults
//           results={results}
//           loading={loading}
//           error={error}
//           recentSearches={recentSearches}
//           popularSearches={popularSearches}
//           onPickSearch={(q) => {
//             searchNow(q, true)
//             navigate(`/products?search=${encodeURIComponent(q)}`)
//           }}
//           query={term}
//           onViewAll={() =>
//             navigate(`/products?search=${encodeURIComponent(term)}`)
//           }
//           removeFromHistory={removeFromHistory}
//         />
//       )}
//     </div>
//   );
// }

// export default SearchBar;

import { useNavigate } from "react-router-dom";
import SearchInput from "./SearchInput";
import SearchResults from "./SearchResults";
import { useSearch } from "../../../hooks/useSearch";
import { useState } from "react";
import { useGetPopularSearchesQuery } from "../../../redux/services/productsApi";

function SearchBar() {
  const {
    term,
    setTerm,
    results,
    loading,
    error,
    searchNow,
    recentSearches,
    removeFromHistory,
  } = useSearch({ minLength: 2, debounce: 600 });

  const [showResults, setShowResults] = useState(false);
  const navigate = useNavigate();

  // חיפושים נפוצים דרך RTK Query
  const {
    data: popularData,
    isLoading: popularLoading,
    isError: popularError,
  } = useGetPopularSearchesQuery();

  const popularSearches = popularData?.items || [];

  return (
    <div className="relative w-full">
      <SearchInput
        value={term}
        onChange={setTerm}
        onSubmit={() => {
          searchNow(term, true);
          navigate(`/products?search=${encodeURIComponent(term)}`);
        }}
        onFocus={() => setShowResults(true)}
        onBlur={() => setTimeout(() => setShowResults(false), 150)}
      />

      {showResults && (
        <SearchResults
          results={results}
          loading={loading}
          error={error}
          recentSearches={recentSearches}
          popularSearches={popularSearches}
          // אפשר להוסיף ל-SearchResults פרופס שמצביעים על popularLoading / popularError אם נדרש
          onPickSearch={(q) => {
            searchNow(q, true);
            navigate(`/products?search=${encodeURIComponent(q)}`);
          }}
          query={term}
          onViewAll={() =>
            navigate(`/products?search=${encodeURIComponent(term)}`)
          }
          removeFromHistory={removeFromHistory}
        />
      )}
    </div>
  );
}

export default SearchBar;


