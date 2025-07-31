import React, { useState } from "react";
import computerImg from "../Category/ComputersAndCellphones.png";
import soundImg from "../Category/Sound.png";
import toolsImg from "../Category/Tools.png";
import cleaningImg from "../Category/Cleaning.png";
import electricalImg from "../Category/ElectricalAppliances.png";
import gamingImg from "../Category/Gaming.png";
import photographyImg from "../Category/Photography.png";
import smartHomeImg from "../Category/SmartHome.png";
import tvImg from "../Category/Televisions.png";
import toysImg from "../Category/Tools.png";
import watchesImg from "../Category/Watches Jewelry.png";
import carImg from "../Category/FortheCar.png";

const categories = [
  { name: "מחשבים וסלולר", icon: computerImg, subcategories: ["סמארטפונים", "מחשבים"] },
  { name: "מוצרי חשמל", icon: electricalImg, subcategories: ["מקררים", "מכונות כביסה"] },
  { name: "טלוויזיות", icon: tvImg, subcategories: ["4K", "OLED"] },
  { name: "גיימינג", icon: gamingImg, subcategories: ["קונסולות", "אביזרים"] },
  { name: "סאונד", icon: soundImg, subcategories: ["רמקולים", "אוזניות"] },
  { name: "צעצועים", icon: toysImg, subcategories: ["לילדים", "לתינוקות"] },
  { name: "שעונים ותכשיטים", icon: watchesImg, subcategories: ["שעוני גברים", "תכשיטי נשים"] },
  { name: "כלי עבודה", icon: toolsImg, subcategories: ["מברגות", "פטישים"] },
  { name: "צילום", icon: photographyImg, subcategories: ["מצלמות", "עדשות"] },
  { name: "נקיון", icon: cleaningImg, subcategories: ["שואבים", "חומרי ניקוי"] },
  { name: "לרכב", icon: carImg, subcategories: ["אביזרים", "כיסויים"] },
  { name: "בית חכם", icon: smartHomeImg, subcategories: ["חיישנים", "מצלמות אבטחה"] },
];

export default function CategorySidebarMenu() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [hoveredCatIdx, setHoveredCatIdx] = useState(null);

  return (
    <div
      className="relative z-50"
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => {
        setIsExpanded(false);
        setHoveredCatIdx(null);
      }}
    >
      <div
        className={`fixed top-0 right-0 h-screen flex flex-col bg-white shadow-md border-l transition-all duration-300
          ${isExpanded ? "w-64" : "w-16"}`}
      >
        {/* כפתור ☰ */}
        <div className="w-full h-[64px] flex items-center justify-center border-b cursor-pointer">
          <div className="space-y-1">
            <div className="w-6 h-0.5 bg-gray-800"></div>
            <div className="w-6 h-0.5 bg-gray-800"></div>
            <div className="w-6 h-0.5 bg-gray-800"></div>
          </div>
        </div>

        {/* תפריט קטגוריות */}
        <ul className="flex-1 overflow-y-auto">
          {categories.map((cat, index) => (
            <li
              key={index}
              className="relative group"
              onMouseEnter={() => setHoveredCatIdx(index)}
              onMouseLeave={() => setHoveredCatIdx(null)}
              style={{ height: "56px" }}
            >
              <div className="flex items-center justify-end gap-3 px-3 py-2 hover:bg-gray-100 cursor-pointer">
                {/* שם הקטגוריה בצד שמאל של האייקון */}
                {isExpanded && (
                  <span className="text-sm font-medium text-right">{cat.name}</span>
                )}
                {/* האייקון בצד ימין */}
                <img src={cat.icon} alt={cat.name} className="w-6 h-6 object-contain" />
              </div>

              {/* תתי קטגוריות בצד ימין כשהסייד בר פתוח */}
              {hoveredCatIdx === index && (
                <div className="absolute right-full top-0 bg-white border-r shadow-md px-3 py-2 text-xs min-w-[120px] z-[10000]">
                  <ul>
                    {cat.subcategories.map((sub, subIdx) => (
                      <li key={subIdx} className="py-1 hover:text-red-600">{sub}</li>
                    ))}
                  </ul>
                </div>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
