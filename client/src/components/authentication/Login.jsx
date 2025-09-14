import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
// import toast from "react-hot-toast";
import { toast } from "react-toastify";

import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { useDispatch } from "react-redux";
import { setUser } from "../../redux/slices/userSlice";
import { mergeCartThunk, loadCart } from "../../redux/thunks/cartThunks";
import { getLocalCart } from "../../helpers/localCart";
import { favoritesApi } from "../../redux/api/favoritesApi";
import { clearGuests } from "../../redux/slices/guestFavoritesSlice";
import { mergeGuestFavoritesIfAny } from "../../helpers/mergeGuestFavorites";
import useRedirectAfterLogin from "./RedirectAfterLogin";
import useMergeCartAfterLogin from "./useMergeCartAfterLogin.js";

import { useLoginMutation } from "../../redux/services/authApi";
import GoogleLoginButton from "./GoogleLoginButton";

const schema = z.object({
  email: z.string().email("כתובת מייל לא תקינה"),
  password: z.string().min(6, "סיסמה חייבת לכלול לפחות 6 תווים"),
});

const Login = () => {
  const [login] = useLoginMutation();
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const mergeCartAfterLogin = useMergeCartAfterLogin();

  const from = location.state?.from?.pathname || "/";

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data) => {
    try {
      const res = await login(data).unwrap(); // unwrap מחלץ את ה-data או זורק שגיאה
      dispatch(setUser(res.user));
      await mergeCartAfterLogin(res.user._id);
      console.log("res.user", res.user)
      console.log("from", from)
      navigate(from, { replace: true });


      toast.success("התחברת בהצלחה");
      reset();
      const from = location.state?.from;
      navigate(from === "/checkout" ? "/cart" : "/");

    } catch (err) {
      // RTK Query error shape: { status, data, error } או status מחרוזת כמו "FETCH_ERROR"
      const statusRaw = err?.status ?? err?.originalStatus;
      const statusNum = typeof statusRaw === "number" ? statusRaw : NaN;
      const statusStr = typeof statusRaw === "string" ? statusRaw : "";

      const data = err?.data ?? {};
      const msg =
        (typeof data?.message === "string" && data.message) ||
        (typeof data?.error === "string" && data.error) ||
        (typeof err?.error === "string" && err.error) ||
        (typeof err?.message === "string" && err.message) ||
        "";

      console.log("status:", statusRaw);
      console.log("message:", msg);
      console.error("Login error:", err);

      // שגיאת רשת מה־fetchBaseQuery
      if (statusStr === "FETCH_ERROR") {
        toast.error("שגיאת רשת. נסי שוב בעוד רגע.");
        return;
      }

      // שגיאת פענוח תשובת השרת
      if (statusStr === "PARSING_ERROR") {
        toast.error("שגיאה בפענוח תשובת השרת.");
        return;
      }

      // 429 - Rate limit
      if (statusNum === 429) {
        toast.error(msg || "יותר מדי ניסיונות. נסי שוב מאוחר יותר.", {
          toastId: "rate-limit",
        });
        return;
      }

      // 404 או הודעת "משתמש לא קיים"
      if (statusNum === 404 || msg.includes("משתמש לא קיים")) {
        toast.error("המשתמש לא קיים, אנא הירשם", {
          toastId: "no-user",
          onClose: () => navigate("/"),
        });
        return;
      }

      // ברירת מחדל
      toast.error(msg || "שגיאה בשרת");
    }

  };

  return (
    <>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="w-full max-w-sm mx-auto p-6 bg-white shadow rounded space-y-5"
      >
        <h2 className="text-2xl font-semibold text-center">כניסה</h2>

        <div>
          <input
            type="email"
            placeholder="אימייל"
            {...register("email")}
            className="w-full p-3 border rounded focus:outline-none focus:ring focus:ring-blue-400"
          />
          {errors.email && <p className="text-red-500 text-sm">{errors.email.message}</p>}
        </div>

        <div>
          <input
            type="password"
            placeholder="סיסמה"
            {...register("password")}
            className="w-full p-3 border rounded focus:outline-none focus:ring focus:ring-blue-400"
          />
          {errors.password && <p className="text-red-500 text-sm">{errors.password.message}</p>}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          התחבר
        </button>
        <p className="text-sm text-center mt-3">
          אין לך חשבון?
          <button
            type="button"
            onClick={() => navigate("/register")}
            className="text-blue-600 underline ml-2"
          >
            להרשמה
          </button>
        </p>
      </form>
      <GoogleLoginButton />
    </>
  );
};

export default Login;
