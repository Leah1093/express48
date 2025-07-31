// import { useSearchParams } from "react-router-dom";
// import { useForm } from "react-hook-form";
// import { z } from "zod";
// import { zodResolver } from "@hookform/resolvers/zod";
// import axios from "axios";
// import toast from "react-hot-toast";

// const schema = z
//   .object({
//     password: z.string().min(6, "סיסמה חייבת להכיל לפחות 6 תווים"),
//     confirmPassword: z.string(),
//   })
//   .refine((data) => data.password === data.confirmPassword, {
//     message: "הסיסמאות לא תואמות",
//     path: ["confirmPassword"],
//   });

// const ResetPassword=()=> {
//   const [searchParams] = useSearchParams();
//   const token = searchParams.get("token");

//   const {
//     register,
//     handleSubmit,
//     formState: { errors, isSubmitting },
//     reset,
//   } = useForm({ resolver: zodResolver(schema) });

//   const onSubmit = async (data) => {
//     try {
//       await axios.post("/api/reset-password", {
//         token,
//         newPassword: data.password,
//       });
//       toast.success("הסיסמה עודכנה בהצלחה");
//       reset();
//     } catch (error) {
//       toast.error("שגיאה באיפוס הסיסמה");
//       console.error(error);
//     }
//   };

//   if (!token) {
//     return <p className="text-center text-red-600 mt-10">קישור שגוי או חסר</p>;
//   }

//   return (
//     <form
//       onSubmit={handleSubmit(onSubmit)}
//       className="w-full max-w-sm mx-auto p-6 bg-white shadow rounded space-y-5 mt-10"
//     >
//       <h2 className="text-2xl font-semibold text-center">איפוס סיסמה</h2>

//       <input
//         type="password"
//         placeholder="סיסמה חדשה"
//         {...register("password")}
//         className="w-full p-3 border rounded"
//       />
//       {errors.password && <p className="text-red-500 text-sm">{errors.password.message}</p>}

//       <input
//         type="password"
//         placeholder="אישור סיסמה"
//         {...register("confirmPassword")}
//         className="w-full p-3 border rounded"
//       />
//       {errors.confirmPassword && (
//         <p className="text-red-500 text-sm">{errors.confirmPassword.message}</p>
//       )}

//       <button
//         type="submit"
//         disabled={isSubmitting}
//         className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50"
//       >
//         עדכן סיסמה
//       </button>
//     </form>
//   );
// }
// export default ResetPassword




import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";

export default function ResetPasswordPage() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      toast.error("הסיסמאות אינן תואמות");
      return;
    }

    try {
      setLoading(true);
      await axios.post("http://localhost:8080/password/reset-password", {
        token,
        newPassword,
      });
      toast.success("הסיסמה עודכנה בהצלחה");
      navigate("/login");
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.error || "שגיאה באיפוס סיסמה");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-sm mx-auto mt-10 p-6 bg-white shadow rounded space-y-4"
    >
      <h2 className="text-2xl font-semibold text-center">איפוס סיסמה</h2>

      <input
        type="password"
        placeholder="סיסמה חדשה"
        className="w-full p-3 border rounded"
        value={newPassword}
        onChange={(e) => setNewPassword(e.target.value)}
      />

      <input
        type="password"
        placeholder="אימות סיסמה"
        className="w-full p-3 border rounded"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
      />

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50"
      >
        איפוס סיסמה
      </button>
    </form>
  );
}
