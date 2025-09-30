
import { useGetNewProductsQuery } from "../../../redux/services/productsApi";

import MiniProductCard from "../product/MiniProductCard";

function HomeNewProducts() {
  const { data, isLoading, error } = useGetNewProductsQuery(10);

  if (isLoading) return <div>טוען מוצרים...</div>;
  if (error) return <div>שגיאה בטעינת מוצרים</div>;

  return (
    <section
      className="
    flex flex-col
    gap-[48px] 
    w-full max-w-[2000px] mx-auto
    md:gap-[64px]
    px-4 sm:px-6 lg:px-16
  "
    >
      {/* כותרת */}
      <h2 className="text-xl font-semibold text-right w-full">
        חדשים באתר
      </h2>

      {/* רשימת מוצרים */}
      <div
        className="
    grid gap-5
    grid-cols-[repeat(auto-fit,minmax(170px,1fr))]   /* מובייל */
    md:grid-cols-[repeat(auto-fit,minmax(230px,1fr))] /* מחשב */
    w-full
  "

      >
        {data?.items?.map((p) => (
          <MiniProductCard key={p._id} product={p} />
        ))}
      </div>
    </section>

  );
}

export default HomeNewProducts;
