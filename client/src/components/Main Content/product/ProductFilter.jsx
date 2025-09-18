import { FiChevronLeft } from "react-icons/fi";
import { SlidersHorizontal } from "lucide-react";

export default function ProductFilter() {
  return (
    <div className="w-full flex justify-between items-center px-2 py-3">
      <div className="flex gap-2">
        <button className="flex items-center gap-1 border border-black rounded-md px-3 py-1 text-sm">
          <span>מותג</span>
          <FiChevronLeft className="w-4 h-4" />
        </button>
        <button className="flex items-center gap-1 border border-black rounded-md px-3 py-1 text-sm">
          <span>צבע</span>
          <FiChevronLeft className="w-4 h-4" />
        </button>
        <button className="flex items-center gap-1 border border-black rounded-md px-3 py-1 text-sm">
          <span>מחיר</span>
          <FiChevronLeft className="w-4 h-4" />
        </button>
      </div>

      <button className="flex items-center justify-center rounded-[12px] h-[40px] w-[40px] bg-[#FFF7F2] border border-[#FF6500] text-[#FF6500]">
        <SlidersHorizontal className="w-5 h-5" />
      </button>
    </div>
  );
}
