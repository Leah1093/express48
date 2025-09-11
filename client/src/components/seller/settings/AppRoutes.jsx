import { Routes, Route, Navigate } from "react-router-dom";
import StoreSettingsPage from "../pages/store/StoreSettingsPage";
import StoreGeneralForm from "../pages/store/StoreGeneralForm";
import StoreMediaForm from "../pages/store/StoreMediaForm";
import StoreSlugForm from "../pages/store/StoreSlugForm";

// כאן את מחברת את הנתונים וה־handlers האמיתיים שלך מהשרת
export default function AppRoutes() {
    const initial = window.__STORE_INITIAL__ || {}; // דוגמה – תחליפי ב־RTK Query/axios
    const isDraft = initial?.status === "draft";

    return (
        <Routes>
            <Route path="/store/settings" element={<StoreSettingsPage />}>
                <Route
                    index
                    element={<Navigate to="general" replace />}
                />
                <Route
                    path="general"
                    element={
                        <StoreGeneralForm
                            initial={initial}
                            onSubmit={async (data) => {
                                // updateStore(data)
                            }}
                        />
                    }
                />
                <Route
                    path="media"
                    element={
                        <StoreMediaForm
                            initial={initial}
                            onUploaded={(store) => {
                                // עדכון סטייט גלובלי אם צריך
                            }}
                        />
                    }
                />
                <Route
                    path="slug"
                    element={
                        <StoreSlugForm
                            initial={{ slug: initial?.slug, slugChanged: initial?.slugChanged, isDraft }}
                            onSaveSlug={async (slug) => {
                                // onCustomSlug(slug) מהקוד המקורי שלך
                            }}
                        />
                    }
                />
            </Route>
        </Routes>
    );
}
