import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import axios from "axios";
import CategoryRow from "./CategoryRow.jsx";
import CategorySidebar from "./CategorySidebar.jsx";

export default function CategoryMenu() {
    const [categories, setCategories] = useState([]);
    const isMobile = useSelector((state) => state.ui.isMobile);

    // שליפת קטגוריות מהשרת
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

    if (isMobile) {
        // תצוגת מובייל: קטגוריות בשורה
        return <CategoryRow categories={categories} />;
    }
    // דסקטופ: תפריט צד
    return <CategorySidebar categories={categories} />;
}
