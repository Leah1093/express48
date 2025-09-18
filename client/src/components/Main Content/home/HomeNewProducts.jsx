
import { useGetNewProductsQuery } from "../../../redux/services/productsApi";
import NewProductCard from "./NewProductCard";

function HomeNewProducts() {
    const { data, isLoading, error } = useGetNewProductsQuery(10);

    if (isLoading) return <div>טוען מוצרים...</div>;
    if (error) return <div>שגיאה בטעינת מוצרים</div>;

    return (
        <section
            className="
    flex flex-col
    gap-[48px] 
    w-full max-w-[1400px] mx-auto
    md:gap-[128px]
  "
        >
            {/* כותרת */}
            <h2 className="text-xl font-semibold text-right w-full">
                חדשים באתר
            </h2>
            {/* רשימת מוצרים */}
 <div
  className="
    grid gap-6
    grid-cols-[repeat(auto-fit,minmax(220px,1fr))]
    max-w-[1400px] w-full mx-auto px-4
  "
>
                {data?.items?.map((p) => (
                    <NewProductCard key={p._id} product={p} />
                ))}
            </div>
        </section>
    );
}

export default HomeNewProducts;
