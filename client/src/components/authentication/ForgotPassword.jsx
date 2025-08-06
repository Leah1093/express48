import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import toast from "react-hot-toast";
import ReCAPTCHA from "react-google-recaptcha";
import { useState, useRef } from "react";

const schema = z.object({
  email: z.string().email("נא להזין אימייל תקין"),
});

const ForgotPassword = () => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm({ resolver: zodResolver(schema) });

  const [recaptchaToken, setRecaptchaToken] = useState("");
  const recaptchaRef = useRef();

  const onSubmit = async (data) => {
    if (!recaptchaToken) {
      toast.error("נא לאשר את reCAPTCHA");
      return;
    }

    try {
      await axios.post("http://localhost:8080/password/forgot-password", {
        ...data,
        recaptchaToken,
      });
      toast.success("קישור לאיפוס נשלח לאימייל");
      reset();
    } catch (error) {
      toast.error("שגיאה בשליחת הקישור");
      console.error(error);
    } finally {
      recaptchaRef.current?.reset();
      setRecaptchaToken("");
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
      {errors.email && (
        <p className="text-red-500 text-sm">{errors.email.message}</p>
      )}

      <ReCAPTCHA
        sitekey={import.meta.env.VITE_RECAPTCHA_V2_SITE_KEY}
        onChange={(token) => setRecaptchaToken(token)}
        ref={recaptchaRef}
      />

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50"
      >
        שלח קישור לאיפוס
      </button>
    </form>
  );
};

export default ForgotPassword;
