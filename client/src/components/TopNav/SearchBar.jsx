import { useState } from "react";
import { IoSearchOutline } from "react-icons/io5";
import { useNavigate } from "react-router-dom";

function SearchBar() {
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showResults, setShowResults] = useState(false);
  const navigate = useNavigate()

  const handleSearch = async () => {
    if (!searchTerm.trim()) return;
    setLoading(true);
    setError("");
    try {
      const res = await import("axios").then(({ default: axios }) =>
        axios.get("http://localhost:8080/products/search", {
          params: { search: searchTerm }
        })
      );
      setResults(res.data.items || []);
      setShowResults(true);
    } catch (err) {
      setError("שגיאה בחיפוש");
      setResults([]);
      setShowResults(true);
    } finally {
      setLoading(false);
    }
  };

  const handleType = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    if (results.length > 0 && value.trim()) {
      setShowResults(true);
    } else {
      setShowResults(false);
    }
  };

  const handleInputBlur = () => {
    setTimeout(() => setShowResults(false), 150);
    setError("");
  };

  const handleInputFocus = () => {
    if (results.length > 0 || error) setShowResults(true);
  };


  return (
    <div className="relative w-full">
      <div className="flex items-center gap-4 h-[48px] px-[0_16px_0_2px] rounded-[16px] border border-[#EDEDED] bg-white flex-shrink-0">
        {/* כפתור חיפוש */}
        <button
          onClick={handleSearch}
          className="flex items-center justify-center cursor-pointer w-[47px] h-[44px] p-[10px_11px_10px_12px] rounded-[16px] border-[1.5px] border-[#FF6500] bg-[#FFF7F2]"
          type="button"
        >
          <IoSearchOutline className="w-6 h-6 text-orange-500" />
        </button>

        {/* שדה חיפוש */}
        <input
          type="text"
          value={searchTerm}
          onChange={handleType}
          placeholder="חיפוש מוצר"
          dir="rtl"
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          onBlur={handleInputBlur}
          onFocus={handleInputFocus}
          className="flex-1 h-[44px] px-4 rounded-[16px] border-none outline-none text-[16px] text-black bg-transparent font-[Rubik]"
          style={{ minWidth: 0 }}
        />
      </div>
      {/* תצוגת תוצאות */}
      {showResults && (loading || error || (results.length > 0 && searchTerm.trim()) || (results.length === 0 && searchTerm.trim())) && (
        <div className="absolute left-0 right-0 z-10 bg-white border border-[#EDEDED] rounded-b-[16px] mt-1 shadow-sm">
          {loading && <div className="p-2 text-center text-gray-500">טוען...</div>}
          {error && <div className="p-2 text-center text-red-500">{error}</div>}
          {!loading && !error && searchTerm.trim() && (
            (() => {
              const filtered = results.filter(product =>
                product.title && product.title.toLowerCase().includes(searchTerm.trim().toLowerCase())
              );
              if (filtered.length > 0) {
                return (
                  <ul className="divide-y">
                    {filtered.map(product => (
                      <li key={product._id || product.slug} className="p-2 flex items-center gap-2 cursor-pointer" dir="rtl"
                        onClick={() => { navigate(`/products/${product.storeId.slug}/${product.slug}`) }}>
                        {product.images && product.images.length > 0 && (
                          <img src={product.images[0]} alt={product.title} className="w-10 h-10 object-cover rounded" />
                        )}
                        <span className="font-medium">{product.title}</span>
                        {product.slug && (
                          <span className="text-xs text-gray-400">({product.slug})</span>
                        )}
                      </li>
                    ))}
                  </ul>
                );
              } else {
                return <div className="p-2 text-center text-gray-400">לא נמצאו מוצרים</div>;
              }
            })()
          )}
        </div>
      )}
    </div>
  );
}

export default SearchBar;








