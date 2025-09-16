import { useState } from "react";
import { ChevronDown, ChevronLeft } from "lucide-react";
import Accordion from "./Accordion.jsx";
export default function ProductShipping({ shippingOptions }) {
  const [selectedId, setSelectedId] = useState(
    shippingOptions.find((o) => o.isSelected)?.id || shippingOptions[0]?.id
  );

  return (
    <Accordion title="משלוחים" defaultOpen={true}>
        <div className="flex flex-col items-end gap-6 w-full">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
            {shippingOptions.map((opt) => {
              const isSelected = selectedId === opt.id;
              return (
                <div
                  key={opt.id}
                  onClick={() => setSelectedId(opt.id)}
                  className={`relative flex flex-col items-end gap-3 px-4 py-6 rounded-xl border transition cursor-pointer w-full ${isSelected
                    ? "border-[#ff6500] bg-[#fff7f2]"
                    : "border-[#ececec] bg-white hover:shadow-sm"
                    }`}
                >
                  {/* עיגול בחלק השמאלי העליון */}
                  <div className="absolute top-3 left-3">
                    <span
                      className={`block w-3 h-3 rounded-full border ${isSelected
                        ? "bg-[#ff6500] border-[#ff6500]"
                        : "border-gray-400 bg-white"
                        }`}
                    />
                  </div>

                  {/* טקסט */}
                  <div className="font-semibold text-[#141414] text-right w-full">
                    {opt.title}
                  </div>
                  <div className="text-sm text-[#141414] text-right w-full">
                    משלוח: <span className="font-bold">{opt.price}</span>
                  </div>
                  <div className="text-sm text-[#141414] text-right w-full">
                    {opt.delivery}
                  </div>
                  {opt.address && (
                    <div className="text-sm text-gray-600 text-right w-full">
                      {opt.address}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
    </Accordion>
  );
}
