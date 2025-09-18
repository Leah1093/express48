import { useState } from "react";
import { IoSearchOutline, IoHeartOutline, IoMenuOutline } from "react-icons/io5";

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
        <IoSearchOutline className="w-6 h-6 text-orange-500"/>
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








