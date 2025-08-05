// import { useForm } from "react-hook-form";
// import { z } from "zod";
// import { zodResolver } from "@hookform/resolvers/zod";
// import toast from "react-hot-toast";
// import { useNavigate } from "react-router-dom";

// import axios from "axios";

// const schema = z.object({
//     email: z.string().email("כתובת מייל לא תקינה"),
//     password: z.string().min(6, "סיסמה חייבת לכלול לפחות 6 תווים"),
// });

// const Login = () => {
//     const navigate = useNavigate();

//     const {
//         register,
//         handleSubmit,
//         reset,
//         formState: { errors, isSubmitting },
//     } = useForm({
//         resolver: zodResolver(schema),
//     });


//     const onSubmit = async (data) => {
//         try {
//             const res = await axios.post("http://localhost:8080/entrance/login", data, {
//                 withCredentials: true
//             });

//             const { token } = res.data;
//             localStorage.setItem("token", token);

//             toast.success("התחברת בהצלחה");
//             reset();
//             navigate('/products'); // ⬅️ הפניה לעמוד הבית (או לכל עמוד שתרצי)

//         } catch (err) {
//             if (err.response?.data?.message) {
//                 toast.error(err.response.data.message);
//             } else {
//                 toast.error("שגיאה בשרת");
//             }
//             console.error("Login error:", err);
//         }
//     };

//     return (
//         <form
//             onSubmit={handleSubmit(onSubmit)}
//             className="w-full max-w-sm mx-auto p-6 bg-white shadow rounded space-y-5"
//         >
//             <h2 className="text-2xl font-semibold text-center">כניסה</h2>

//             <div>
//                 <input
//                     type="email"
//                     placeholder="אימייל"
//                     {...register("email")}
//                     className="w-full p-3 border rounded focus:outline-none focus:ring focus:ring-blue-400"
//                 />
//                 {errors.email && <p className="text-red-500 text-sm">{errors.email.message}</p>}
//             </div>

//             <div>
//                 <input
//                     type="password"
//                     placeholder="סיסמה"
//                     {...register("password")}
//                     className="w-full p-3 border rounded focus:outline-none focus:ring focus:ring-blue-400"
//                 />
//                 {errors.password && <p className="text-red-500 text-sm">{errors.password.message}</p>}
//             </div>

//             <button
//                 type="submit"
//                 disabled={isSubmitting}
//                 className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50"
//             >
//                 התחבר
//             </button>
//         </form>
//     );
// }


// export default Login




import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useDispatch } from "react-redux";
import { setUser } from "../../redux/slices/userSlice";

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
console.log("hi",res.data)
      dispatch(setUser(res.data.data)); // ⬅️ שמירת המשתמש ל־Redux

      toast.success("התחברת בהצלחה");
      reset();
      navigate("/products");

    } catch (err) {
      if (err.response?.data?.message) {
        toast.error(err.response.data.message);
      } else {
        toast.error("שגיאה בשרת");
      }
      console.error("Login error:", err);
    }
  };

  return (
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
    </form>
  );
};

export default Login;
