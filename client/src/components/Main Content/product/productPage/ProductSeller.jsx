import { Link } from "react-router-dom";

export default function ProductSeller({ store }) {
  return (
    <div className="flex justify-between items-center w-full py-4">
      {/* שם החנות */}
      <div className="flex items-center gap-2 pr-4">
        <Link
          to={`/store/${store?.slug || store?._id}`}
          className="text-[16px] text-[#141414] hover:text-[#ff6500] transition"
        >
          {store?.name}
        </Link>
      </div>

      {/* נמכר ע"י */}
      <span className="font-semibold text-[16px] text-[#141414]">
        נמכר ע"י
      </span>
    </div>
  );
}
