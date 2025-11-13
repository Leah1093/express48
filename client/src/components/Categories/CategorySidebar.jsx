import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useGetCategoriesQuery } from "../../redux/services/categoriesApi"; // עדכני נתיב לפי מבנה הפרויקט שלך

export default function CategorySidebar() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [hoveredCatId, setHoveredCatId] = useState(null);
  const [submenuPos, setSubmenuPos] = useState({ top: 0, right: 0 });

  // טוען קטגוריות מהרידקס
  const { data: categories = [] } = useGetCategoriesQuery();

  // קריאה ל־VITE_API_URL
  const BASE_URL = import.meta.env.VITE_API_URL || "https://api.express48.com";

  const handleMouseEnter = (cat, e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setHoveredCatId(cat._id);
    setSubmenuPos({
      top: rect.top,
      right: window.innerWidth - rect.right,
    });
  };

  return (
    <div
      className="relative z-50"
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => {
        setIsExpanded(false);
        setHoveredCatId(null);
      }}
    >
      <div
        className={`fixed top-0 right-0 h-screen flex flex-col bg-white shadow-md border-l transition-all duration-300 pt-16 ${
          isExpanded ? "w-64" : "w-16"
        }`}
      >
        <ul className="flex-1 overflow-y-auto">
          {categories
            .filter((cat) => !cat.parentId)
            .map((cat) => (
            
              <li
                key={cat._id}
                className="relative group"
                onMouseEnter={(e) => handleMouseEnter(cat, e)}
                onMouseLeave={() => setHoveredCatId(null)}
              >
                <div className="flex items-center justify-end gap-3 px-3 py-2 hover:bg-gray-100 cursor-pointer">
                  {isExpanded && (
                    <span className="text-sm font-medium text-right">
                      {cat.name}
                    </span>
                  )}
                  <img
                    src={cat.icon}
                    alt={cat.name}
                    className="w-6 h-6 object-contain"
                  />
                </div>

                {hoveredCatId === cat._id && (
                  <ul
                    className="fixed bg-white shadow-lg rounded w-40 z-[9999]"
                    style={{
                      top: submenuPos.top,
                      right: submenuPos.right + 230,
                    }}
                    onMouseLeave={() => setHoveredCatId(null)}
                  >
                    {categories
                      .filter((sub) => String(sub.parentId) === String(cat._id))
                      .map((sub) => (
                        <li
                          key={sub._id}
                          className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                        >
                          {sub.name}
                        </li>
                      ))}
                  </ul>
                )}
              </li>
            ))}
        </ul>

        <div className="p-4 border-t">
          <Link
            to="/categories/manage"
            className="block text-center bg-blue-600 text-white px-3 py-2 rounded hover:bg-blue-700"
          >
            ניהול קטגוריות
          </Link>
        </div>
      </div>
    </div>
  );
}
