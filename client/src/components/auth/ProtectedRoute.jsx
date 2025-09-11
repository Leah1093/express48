import { useEffect } from "react";
import { useSelector } from "react-redux";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { selectIsInitialized, selectRole, selectCurrentUser } from "../../redux/slices/userSelectors";
import { notifyNoPermission } from "../../toast";
// עוזר קטן להפניה עם טוסט בלי לעשות side-effects בתוך render
function RedirectWithToast({ to }) {
    const navigate = useNavigate();
    useEffect(() => {
        notifyNoPermission();
        navigate(to, { replace: true });
    }, [navigate, to]);
    return null;
}

/**
 * שימוש:
 * <ProtectedRoute allow={["admin"]}><AdminDashboard/></ProtectedRoute>
 * <ProtectedRoute allow={["user","seller","admin"]} userFacing><Profile/></ProtectedRoute>
 */
export default function ProtectedRoute({ allow = [], userFacing = false, children }) {
    const initialized = useSelector(selectIsInitialized);
    const role = useSelector(selectRole);
    const user = useSelector(selectCurrentUser);
    const location = useLocation();

    if (!initialized) return <div>טוען...</div>;

    const forbidden = allow.length > 0 && !allow.includes(role);

    // אורח שנחסם → התחברות
    if (!user && forbidden) {
        return (
            <Navigate
                to="/login"
                replace
                state={{ from: location }}
            />
        );
    }

    // מחובר אך חסום
    if (user && forbidden) {
        // למסכים ציבוריים → טוסט + הפניה רכה
        if (userFacing) {
            return <RedirectWithToast to="/profile" />;
        }
        // למסכים ניהוליים → דף ייעודי
        return (
            <Navigate
                to="/unauthorized"
                replace
                state={{ from: location }}
            />
        );
    }

    // יש הרשאה
    return children;
}
