import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import toast from "react-hot-toast";
import { useDispatch } from "react-redux";
import { setUser } from "../../redux/slices/userSlice";
import { useNavigate } from "react-router-dom";
import GoogleLoginButton from "./GoogleLoginButton";
const schema = z
  .object({
    username: z.string().min(2, "שם מלא חובה"),
    email: z.string().email("כתובת מייל לא תקינה"),
    phone: z
      .string()
      .min(9, "מספר טלפון לא תקין")
      .max(15, "מספר טלפון ארוך מדי")
      .regex(/^\d+$/, "טלפון חייב להכיל ספרות בלבד"),
    password: z.string().min(6, "סיסמה חייבת לפחות 6 תווים"),
    confirmPassword: z.string().min(6, "נא לאשר את הסיסמה"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "הסיסמאות אינן תואמות",
  });

const Register = () => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(schema),
  });

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const onSubmit = async (data) => {
    const { confirmPassword, ...formData } = data;

    try {
      const res = await axios.post("http://localhost:8080/entrance/register", formData, {
        withCredentials: true,
      });

      dispatch(setUser(res.data.user));
      toast.success("נרשמת בהצלחה!");
      reset();
      navigate("/");
    } catch (err) {
      if (err.response?.status === 409) {
        toast.error("משתמש כבר קיים, נא להתחבר");
        navigate("/login");
      } else if (err.response?.data?.message) {
        toast.error(err.response.data.message);
      } else {
        toast.error("שגיאה בהרשמה");
      }
      console.error("Registration error:", err);
    }
  };

  return (
    <>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="w-full max-w-sm mx-auto p-6 bg-white shadow rounded space-y-5"
      >
        <h2 className="text-2xl font-semibold text-center">הרשמה</h2>

        <input
          type="text"
          placeholder="שם מלא"
          {...register("username")}
          className="w-full p-3 border rounded"
        />
        {errors.username && <p className="text-red-500 text-sm">{errors.username.message}</p>}

        <input
          type="email"
          placeholder="אימייל"
          {...register("email")}
          className="w-full p-3 border rounded"
        />
        {errors.email && <p className="text-red-500 text-sm">{errors.email.message}</p>}

        <input
          type="tel"
          placeholder="טלפון"
          {...register("phone")}
          className="w-full p-3 border rounded"
        />
        {errors.phone && <p className="text-red-500 text-sm">{errors.phone.message}</p>}

        <input
          type="password"
          placeholder="סיסמה"
          {...register("password")}
          className="w-full p-3 border rounded"
        />
        {errors.password && <p className="text-red-500 text-sm">{errors.password.message}</p>}

        <input
          type="password"
          placeholder="אימות סיסמה"
          {...register("confirmPassword")}
          className="w-full p-3 border rounded"
        />
        {errors.confirmPassword && (
          <p className="text-red-500 text-sm">{errors.confirmPassword.message}</p>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 disabled:opacity-50"
        >
          הרשם
        </button>
      </form>
      <GoogleLoginButton />
    </>
  );
};

export default Register;
