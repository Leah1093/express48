import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import toast from "react-hot-toast";

const schema = z.object({
  name: z.string().min(2, "שם מלא חובה"),
  email: z.string().email("כתובת מייל לא תקינה"),
  phone: z
    .string()
    .min(9, "מספר טלפון לא תקין")
    .max(15, "מספר טלפון ארוך מדי")
    .regex(/^\d+$/, "טלפון חייב להכיל ספרות בלבד"),
  password: z.string().min(6, "סיסמה חייבת לפחות 6 תווים"),
});

const Register=()=> {
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
      await axios.post("/api/register", data);
      toast.success("נרשמת בהצלחה!");
      reset();
    } catch (err) {
      toast.error("שגיאה בהרשמה");
      console.error(err);
    }
    //לעבור לעמוד ראשי 
    //ניקוי טופס
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="w-full max-w-sm mx-auto p-6 bg-white shadow rounded space-y-5"
    >
      <h2 className="text-2xl font-semibold text-center">הרשמה</h2>

      <input
        type="text"
        placeholder="שם מלא"
        {...register("name")}
        className="w-full p-3 border rounded"
      />
      {errors.name && <p className="text-red-500 text-sm">{errors.name.message}</p>}

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

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 disabled:opacity-50"
      >
        הרשם
      </button>
    </form>
  );
}


export default Register