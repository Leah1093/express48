import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useDispatch } from "react-redux";
import { setUser } from "../../redux/slices/userSlice";
import GoogleLoginButton from "./GoogleLoginButton";

const schema = z.object({
  email: z.string().email("כתובת מייל לא תקינה"),
  password: z.string().min(6, "סיסמה חייבת לכלול לפחות 6 תווים"),
});

const Login = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

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
      const res = await axios.post("http://localhost:8080/entrance/login", data, {
        withCredentials: true,
      });

      dispatch(setUser(res.data.user));

      toast.success("התחברת בהצלחה");
      reset();
      navigate("/");

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
