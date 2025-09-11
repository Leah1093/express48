import { useParams, useNavigate } from "react-router-dom";
import { useGetSellerProductByIdQuery } from "../../redux/services/sellerProductsApi";

export default function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data, isFetching, isError } = useGetSellerProductByIdQuery(id);

  if (isFetching) return <div className="p-4">טוען...</div>;
  if (isError) return <div className="p-4 text-red-600">שגיאה בטעינת מוצר</div>;
  if (!data) return <div className="p-4">לא נמצא מוצר</div>;

  return (
    <div dir="rtl" className="p-6 max-w-4xl mx-auto">
      <button onClick={() => navigate(-1)} className="mb-4 px-3 py-1 border rounded">
        ← חזרה
      </button>

      <h1 className="text-2xl font-bold mb-2">{data.title}</h1>
      <div className="text-sm opacity-70 mb-4">
        {data.brand} {data.model} | SKU: {data.sku}
      </div>

      {data.images?.length > 0 && (
        <img src={data.images[0]} alt="" className="w-64 h-64 object-cover mb-4 rounded" />
      )}

      <p className="mb-4">{data.description}</p>

      <div className="text-lg font-semibold">
        מחיר: {data?.price?.amount?.toLocaleString("he-IL")} ₪
      </div>
      <div>מלאי: {data.stock}</div>
      <div>סטטוס: {data.status}</div>
    </div>
  );
}
