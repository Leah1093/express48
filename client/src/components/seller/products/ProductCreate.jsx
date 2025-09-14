import { useNavigate } from "react-router-dom";
import ProductForm from "./forms/ProductForm";
export default function ProductCreate() {
  const navigate = useNavigate();
  return (
    <ProductForm
      mode="create"
      initialData={null}
      endpoint="/seller/products"   // POST
      onSuccess={(res) => {
        const id = res?.data?._id || res?._id;
        navigate(id ? `/seller/products/${id}/edit` : `/seller/products`, { replace:true });
      }}
    />
  );
}
