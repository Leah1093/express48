import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
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



import GoogleLoginButton from "./GoogleLoginButton";

const schema = z.object({
  email: z.string().email("כתובת מייל לא תקינה"),
  password: z.string().min(6, "סיסמה חייבת לכלול לפחות 6 תווים"),
});

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const redirectAfterLogin = useRedirectAfterLogin();
   const mergeCartAfterLogin = useMergeCartAfterLogin();

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
      console.log("log in")
      const res = await axios.post("http://localhost:8080/entrance/login", data, {
        withCredentials: true,
      });

      dispatch(setUser(res.data.user));
       await mergeCartAfterLogin(res.data.user._id);

      // מיזוג עגלת אורח אם קיימת
      // const localCart = getLocalCart();
      // console.log("📦 localCart:", localCart);
      // if (localCart.length > 0) {
      //   const itemsToMerge = localCart.map((item) => ({
      //     productId: item.product?._id || item.productId,
      //     quantity: item.quantity,
      //     selected: item.selected,
      //   }));
      //   console.log("🚀 מנסה למזג עגלה...");

      //   const result = await dispatch(mergeCartThunk({
      //     userId: res.data.user._id,
      //     guestCart: itemsToMerge,
      //   }));

      //   console.log("🛒 עגלה מוזגת מהשרת:", result.payload);

      //   await dispatch(loadCart());
      // } else {
      //   // אין עגלת אורח → פשוט טוענים את העגלה מהשרת
      //   console.log("📭 אין עגלת אורח, טוען עגלה ממונגו...");
      //   await dispatch(loadCart());
      // }

      // // 1) מיזוג מועדפים של אורח לשרת
      // await mergeGuestFavoritesIfAny();          // ← אם יצרת את הפונקציה helper

      // // 2) נקה סטייט של אורחים ב-Redux (שלא יישאר כפול)
      // dispatch(clearGuests());

      // // 3) רענון רשימת המועדפים מהשרת (RTK Query)
      // dispatch(favoritesApi.util.invalidateTags?.(["Favorites"]));
      // // או:
      // // await dispatch(favoritesApi.endpoints.listFavorites.initiate(undefined, { forceRefetch: true }));


      toast.success("התחברת בהצלחה");
      reset();

      // אחרי login מוצלח
      if (location.state?.from === "/checkout") {
        // אם הגיע מהקופה → נבדוק כתובות
        // await redirectAfterLogin();
         navigate("/cart");
      } else {
        // אחרת → פשוט לדף הבית
        navigate("/");
      }



    } catch (err) {
      const message = err.response?.data?.message;

      if (err.response?.status === 404 || message === "משתמש לא קיים") {
        toast.error("המשתמש לא קיים, אנא הירשם");
        navigate("/");
      } else if (message) {
        toast.error(message);
      } else {
        toast.error("שגיאה בשרת");
      }

      console.error("Login error:", err);
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
