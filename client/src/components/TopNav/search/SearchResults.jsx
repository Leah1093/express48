import RecentSearchesList from "./RecentSearchesList";
import PopularSearchesList from "./PopularSearchesList";
import ProductResultCard from "./ProductResultCard";
import { useNavigate } from "react-router-dom";

function SearchResults({
    results,
    loading,
    error,
    recentSearches,
    popularSearches,
    onPickSearch,
    query,
    onViewAll,
    removeFromHistory
}) {
    const navigate = useNavigate()

    return (

        <div
            className="absolute left-0 right-0 z-10 bg-white border border-[#EDEDED] rounded-b-[16px] mt-1 shadow-sm flex flex-row min-h-[220px]"
            dir="rtl"
        >
            {/* צד ימין */}
            <div className="w-1/2 p-4 border-l border-[#EDEDED] flex flex-col gap-4">
                {recentSearches.length ? <RecentSearchesList searches={recentSearches} onPick={onPickSearch} query={query} onRemove={removeFromHistory} /> : <></>}
                {popularSearches ? <PopularSearchesList searches={popularSearches} onPick={onPickSearch} query={query} /> : <></>}
            </div>

            {/* צד שמאל */}
            <div className="w-1/2 p-4 flex flex-col justify-between">
                <div>
                    <div className="text-xs text-gray-400 mb-2">מוצרים</div>
                    {loading && <div className="p-2 text-center text-gray-500">טוען...</div>}
                    {error && <div className="p-2 text-center text-red-500">{error}</div>}
                    {!loading && !error && (
                        <div className="grid grid-cols-2 gap-2">
                            {results.length > 0 ? (
                                results.slice(0, 4).map((product) => (
                                    <ProductResultCard
                                        key={product._id || product.slug}
                                        product={product}
                                        query={query}
                                        onClick={() => navigate(`/products/${product.storeId?.slug}/${product.slug}`)}
                                    />
                                ))
                            ) : (
                                <div className="col-span-2 text-center text-gray-400">לא נמצאו מוצרים</div>
                            )}
                        </div>
                    )}
                </div>

                <button
                    className="w-full mt-4 bg-black text-white rounded-[8px] py-2 font-bold"
                    onClick={onViewAll}
                >
                    לצפייה בכל המוצרים
                </button>
            </div>
        </div>
    );
}

export default SearchResults;
