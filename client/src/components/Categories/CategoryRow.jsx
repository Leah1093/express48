import React from "react";

export default function CategoryRow({ categories }) {
    // קטגוריות בשורה למובייל
    return (
        <div className="w-full bg-white py-2 px-2 flex flex-col items-end mt-[90px]">
            <span className="mb-2 text-right text-[#141414] text-[14px] font-semibold leading-[120%] tracking-[-0.154px]">
                קטגוריות מובילות
            </span>
            <div className="flex gap-6 overflow-x-auto touch-pan-x scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent w-full">
                {categories
                    .filter((cat) => !cat.parentId)
                    .map((cat) => (
                        <div key={cat._id} className="flex flex-col items-center min-w-[70px]">
                            <div
                                className="w-[46px] h-[46px] rounded-full border border-[#EDEDED] flex items-center justify-center mb-1 bg-gray-100"
                                style={{
                                    background: `url(http://localhost:8080${cat.icon}) lightgray -6.264px -4.431px / 159.231% 114.597% no-repeat`,
                                }}
                            ></div>
                            <span className="text-center text-[#141414] text-[12px] font-normal leading-[120%] tracking-[-0.132px] whitespace-nowrap">
                                {cat.name}
                            </span>
                        </div>
                    ))}

                {/* הסתרת פס גלילה ב-webkit */}
                <style>{`.flex::-webkit-scrollbar { display: none; } `}</style>
            </div>
        </div>
    );
}
