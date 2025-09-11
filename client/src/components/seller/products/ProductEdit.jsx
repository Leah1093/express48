import { useParams } from "react-router-dom";
import ProductForm from "./forms/ProductForm";
import { useGetSellerProductByIdQuery } from "../../../redux/services/sellerProductsApi";
const toHeb = s => s==="draft"?"טיוטא":s==="published"?"מפורסם":s==="suspended"?"מושהה":s;

export default function ProductEdit() {
  const { id } = useParams();
  const { data, isLoading, isError, error, refetch } = useGetSellerProductByIdQuery(id, { skip: !id });

  if (isLoading) return <div dir="rtl">טוען…</div>;
  if (isError)   return <div dir="rtl" className="text-red-600">שגיאה: {error?.data?.error||"לא נטען"} <button onClick={refetch}>רענון</button></div>;

  const initialData = data ? { ...data, status: toHeb(data.status) } : null;

  return (
    <ProductForm
      mode="edit"
      initialData={initialData}
      endpoint="/seller/products"   // הטופס יעשה PATCH /:id
      onSuccess={() => {/* אופציונלי: נווט חזרה לרשימה */}}
    />
  );
}
