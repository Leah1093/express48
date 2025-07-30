import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import toast from "react-hot-toast";

const schema = z.object({
    email: z.string().email("נא להזין אימייל תקין"),
});

const ForgotPassword=()=> {
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
        reset,
    } = useForm({ resolver: zodResolver(schema) });

    const onSubmit = async (data) => {
        try {
            // שלח בקשה לשרת
            await axios.post("/api/forgot-password", data);
            toast.success("קישור לאיפוס נשלח לאימייל");
            reset();
        } catch (error) {
            toast.error("שגיאה בשליחת הקישור");
            console.error(error);
        }
    };

    return (
        <form
            onSubmit={handleSubmit(onSubmit)}
            className="w-full max-w-sm mx-auto p-6 bg-white shadow rounded space-y-5"
        >
            <h2 className="text-2xl font-semibold text-center">שכחתי סיסמה</h2>

            <input
                type="email"
                placeholder="אימייל"
                {...register("email")}
                className="w-full p-3 border rounded"
            />
            {errors.email && <p className="text-red-500 text-sm">{errors.email.message}</p>}

            <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50"
            >
                שלח קישור לאיפוס
            </button>
        </form>
    );
}


export default ForgotPassword