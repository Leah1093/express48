import { Link, useLocation, useNavigate } from "react-router-dom";

export default function UnauthorizedPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const from = location.state?.from?.pathname || "/";

  return (
    <div dir="rtl" className="mx-auto max-w-xl p-6">
      <h1 className="text-2xl font-bold mb-3">אין לך הרשאה</h1>
      <p className="mb-6">
        אין לך הרשאות לצפות בעמוד:{" "}
        <code className="px-1 py-0.5 bg-gray-100 rounded">{from}</code>
      </p>

      <div className="flex flex-wrap gap-3">
        <button onClick={() => navigate(-1)} className="underline">
          חזרה לעמוד הקודם
        </button>
        <Link to="/login" state={{ from: location.state?.from }} className="underline">
          התחברי עם חשבון אחר
        </Link>
        <Link to="/support" className="underline">
          יצירת קשר
        </Link>
        <Link to="/" className="underline">
          דף הבית
        </Link>
      </div>
    </div>
  );
}
