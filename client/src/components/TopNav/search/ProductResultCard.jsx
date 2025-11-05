import { highlightMatch } from "./utils.jsx";

function ProductResultCard({ product, query, onClick }) {
  return (
    <div
      className="border border-[#EDEDED] rounded-[12px] p-2 flex flex-col items-center gap-2 cursor-pointer hover:shadow"
      onClick={onClick}
    >
      {product.images?.[0] && (
        <img
          src={product.images[0]}
          alt={product.title}
          className="w-12 h-12 object-cover rounded"
        />
      )}
      <div className="text-center text-xs font-medium">
        {highlightMatch(product.title, query)}
      </div>
      {product.price && (
        <div className="text-orange-500 font-bold text-sm">
          ₪ {typeof product.price === "object" ? product.price.amount : product.price}
        </div>
      )}
    </div>
  );
}

export default ProductResultCard;
