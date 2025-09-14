import { useState } from "react";
import { useSelector } from "react-redux";

function SearchBar() {
  const [searchTerm, setSearchTerm] = useState("");

  const handleSearch = () => {
    console.log("מחפש:", searchTerm);
  };

  // דסקטופ: עיצוב מלא לפי פיגמה
  return (
    <div className="flex items-center gap-4 h-[48px] px-[0_16px_0_2px] rounded-[16px] border border-[#EDEDED] bg-white flex-shrink-0">
      {/* כפתור חיפוש */}
      <button
        onClick={handleSearch}
        className="flex items-center justify-center w-[47px] h-[44px] p-[10px_11px_10px_12px] rounded-[16px] border-[1.5px] border-[#FF6500] bg-[#FFF7F2]"
        type="button"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 21 20" fill="none">
          <path d="M19.4998 19L14.3028 13.803M14.3028 13.803C15.7094 12.3964 16.4996 10.4887 16.4996 8.4995C16.4996 6.5103 15.7094 4.60258 14.3028 3.196C12.8962 1.78942 10.9885 0.999218 8.99931 0.999218C7.01011 0.999218 5.10238 1.78942 3.69581 3.196C2.28923 4.60258 1.49902 6.5103 1.49902 8.4995C1.49902 10.4887 2.28923 12.3964 3.69581 13.803C5.10238 15.2096 7.01011 15.9998 8.99931 15.9998C10.9885 15.9998 12.8962 15.2096 14.3028 13.803Z" stroke="#FF6500" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {/* שדה חיפוש */}
      <input
        type="text"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder="חיפוש מוצר"
        dir="rtl"
        onKeyDown={(e) => e.key === "Enter" && handleSearch()}
        className="flex-1 h-[44px] px-4 rounded-[16px] border-none outline-none text-[16px] text-black bg-transparent font-[Rubik]"
        style={{ minWidth: 0 }}
      />

    </div>
  );
}

export default SearchBar;








