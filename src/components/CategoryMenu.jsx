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
  const [hovered, setHovered] = useState(null);

  return (
    <div className="fixed top-0 right-0 h-screen z-40 flex flex-col bg-white border-l shadow-md w-16">
      {/* כפתור ☰ — כשמרחפים עליו בלבד נפתח התפריט */}
      <div
        className="w-full h-[64px] flex items-center justify-center border-b cursor-pointer"
        onMouseEnter={() => setIsExpanded(true)}
        onMouseLeave={() => setIsExpanded(false)}
      >
        <div className="space-y-1">
          <div className="w-6 h-0.5 bg-gray-800"></div>
          <div className="w-6 h-0.5 bg-gray-800"></div>
          <div className="w-6 h-0.5 bg-gray-800"></div>
        </div>
      </div>

      {/* אייקונים של הקטגוריות בלבד */}
      <ul className="overflow-y-auto flex-1">
        {categories.map((cat, index) => (
          <li
            key={index}
            onMouseEnter={() => setHovered(index)}
            onMouseLeave={() => setHovered(null)}
            className="relative group"
          >
            {/* אייקון בלבד */}
            <div className="flex items-center justify-center px-3 py-3 hover:bg-gray-100 cursor-pointer">
              <img src={cat.icon} alt={cat.name} className="w-6 h-6 object-contain" />
            </div>

            {/* שמות ותתי קטגוריות — רק אם ☰ פתוח */}
            {isExpanded && (
              <div className="absolute right-0 top-0 bg-white border shadow-lg rounded-md px-3 py-2 z-50 min-w-[140px] text-sm text-right">
                <div className="font-semibold mb-1">{cat.name}</div>
                {hovered === index && (
                  <ul>
                    {cat.subcategories.map((sub, subIdx) => (
                      <li key={subIdx} className="py-1 hover:text-red-600">{sub}</li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}


