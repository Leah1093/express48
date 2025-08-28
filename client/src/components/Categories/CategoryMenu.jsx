import { useState ,useEffect } from "react";
import CategoryManager from "./CategoryManager.jsx";
import { Link } from "react-router-dom";
import axios from "axios";


export default function CategorySidebarMenu() {
    const [categories, setCategories] = useState([]);
    const [isExpanded, setIsExpanded] = useState(false);   // נוסף
    const [hoveredCatIdx, setHoveredCatIdx] = useState(null); // נוסף
    const [hoveredCatId, setHoveredCatId] = useState(null); // 👈 חובה להוסיף
    const [submenuPos, setSubmenuPos] = useState({ top: 0, right: 0 }); // מיקום החלון

      // ✅ שליפת קטגוריות מהשרת
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const res = await axios.get("http://localhost:8080/categories", {
          withCredentials: true,
        });
        setCategories(res.data);
      } catch (err) {
        console.error("שגיאה בשליפת קטגוריות", err);
      }
    };
    loadCategories();
  }, []);

    const handleMouseEnter = (cat, e) => {
        const rect = e.currentTarget.getBoundingClientRect(); // המיקום של ה-li במסך
        setHoveredCatId(cat._id);
        setSubmenuPos({
            top: rect.top,          // מתחילים מאותו גובה של הקטגוריה
            right: window.innerWidth - rect.right, // חישוב המרחק מהצד הימני
        });
    };

    return (
        <div
            className="relative z-50"
            onMouseEnter={() => setIsExpanded(true)}
            onMouseLeave={() => {
                setIsExpanded(false);
                setHoveredCatIdx(null);
            }}
        >
            {/* תפריט צד */}
            <div
                className={`fixed top-0 right-0 h-screen flex flex-col bg-white shadow-md border-l transition-all duration-300 pt-16 ${isExpanded ? "w-64" : "w-16"
                    }`}
            >
                {/* ☰ כאן יכול לבוא כפתור תפריט או אייקון */}
                ...

                {/* רשימת קטגוריות */}
                <ul className="flex-1 overflow-y-auto">
                    {categories
                        .filter((cat) => !cat.parentId) // ✅ רק קטגוריות ראשיות
                        .map((cat, index) => (
                            <li
                                key={cat._id}
                                className="relative group"
                                onMouseEnter={(e) => handleMouseEnter(cat, e)}
                                onMouseLeave={() => setHoveredCatId(null)}
                            >
                                <div className="flex items-center justify-end gap-3 px-3 py-2 hover:bg-gray-100 cursor-pointer">
                                    {isExpanded && (
                                        <span className="text-sm font-medium text-right">{cat.name}</span>
                                    )}
                                    <img src={`http://localhost:8080${cat.icon}`} alt={cat.name} className="w-6 h-6 object-contain" />
                                </div>

                                {/* חלון תתי־קטגוריות */}
                                {hoveredCatId === cat._id && (
                                    <ul className="fixed bg-white shadow-lg rounded w-40 z-[9999]"
                                        style={{
                                            top: submenuPos.top,          // ✅ גובה לפי הקטגוריה
                                            right: submenuPos.right + 230 // ✅ צמוד לצד הימני של הסיידבר (250 = רוחב)
                                        }}
                                        onMouseLeave={() => setHoveredCatId(null)}
                                    >
                                        {categories
                                            .filter((sub) => String(sub.parentId) === String(cat._id)) // רק הילדים של הקטגוריה
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

                {/* אזור ניהול קטגוריות */}
                {/* <CategoryManager onCategoriesChange={setCategories} /> */}
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
