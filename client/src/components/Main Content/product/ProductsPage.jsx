import { useSearchParams } from "react-router-dom";
import ProductsList from "./ProductsList";
import SearchResultsPage from "./SearchResultsPage";

function ProductsPage() {
  const [params] = useSearchParams();
  const searchTerm = params.get("search");

  return searchTerm ? (
    <SearchResultsPage />
  ) : (
    <ProductsList />
  );
}

export default ProductsPage;
