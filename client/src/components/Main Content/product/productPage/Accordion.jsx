import { useState } from "react";
import { ChevronDown, ChevronLeft } from "lucide-react";

export default function Accordion({ title, children, defaultOpen = false }) {
    const [open, setOpen] = useState(defaultOpen);

    return (
        <section
            className="flex flex-col w-full animate-fade-in [--animation-delay:200ms] mt-6 rounded-2xl border border-[#EDEDED] p-3"
            dir="rtl"
        >
            {/* כותרת */}
            <header
                className={`flex items-center justify-between w-full py-3 ${open ? "border-b border-[#EDEDED]" : ""}`}
                onClick={() => setOpen(!open)}
            >
                <div className="font-semibold text-[#141414] text-base leading-6">
                    {title}
                </div>
                <button className="p-1 text-gray-500 hover:text-gray-700">
                    {open ? <ChevronDown size={20} /> : <ChevronLeft size={20} />}
                </button>
            </header>

            {/* תוכן */}
            {open && (
                <div className="flex flex-col items-end gap-3 w-full pt-3">
                    {children}
                </div>
            )}
        </section>

    );
}
