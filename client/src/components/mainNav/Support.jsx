// import React, { useState, useRef, useEffect } from "react";
// import { useForm } from "react-hook-form";
// import ReCAPTCHA from "react-google-recaptcha";
// import { yupResolver } from "@hookform/resolvers/yup";
// import * as yup from "yup";
// import axios from "axios";
// import toast from "react-hot-toast";
// import { useSelector } from "react-redux";

// const schema = yup.object().shape({
//   name: yup.string().required("יש להזין שם"),
//   email: yup.string().email("אימייל לא תקין").required("שדה חובה"),
//   phone: yup.string(),
//   message: yup.string().required("יש להזין הודעה"),
// });

// const Support = () => {
//   const recaptchaRef = useRef();
//   const user = useSelector((state) => state.user.user);
//   console.log(user)
//   const [loading, setLoading] = useState(false);

//   const {
//     register,
//     handleSubmit,
//     reset,
//     formState: { errors },
//   } = useForm({
//     resolver: yupResolver(schema),
//     defaultValues: {
//       name: "",
//       email: "",
//       phone: "",
//       message: "",
//       honeypot: "",
//     },
//   });

//   useEffect(() => {
//     if (user) {
//       reset((prev) => ({
//         ...prev,
//         name: user.username || "",
//         email: user.email || "",
//         phone: user.phone || "",
//       }));
//     }
//   }, [user, reset]);

//   const onSubmit = async (data) => {
//     try {
//       setLoading(true);
//       const token = await recaptchaRef.current.executeAsync();
//       recaptchaRef.current.reset();

//       await axios.post("https://api.express48.com/contact/send", {
//         ...data,
//         recaptchaToken: token,
//       });

//       toast.success("ההודעה נשלחה בהצלחה! 🎉");
//       reset();
//     } catch (err) {
//       if (err.response?.status === 429) {
//         toast.error("שליחת ההודעה נחסמה זמנית. נא להמתין ולנסות שוב.");
//       } else {
//         toast.error("שליחת ההודעה נכשלה 😢");
//       }
//       console.error("שגיאה בשליחת הודעת צור קשר:", err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <>
//       <form
//         onSubmit={handleSubmit(onSubmit)}
//         className="max-w-4xl mx-auto bg-gray-100 p-8 md:p-12 rounded-lg shadow-md"
//       >
//         <h2 className="text-3xl font-bold text-gray-800 mb-10 flex items-center justify-end gap-2">
//           דברו איתנו 🙂
//         </h2>

//         <div className="grid grid-cols-1 gap-6">
//           <div>
//             <label className="block text-right font-bold text-sm mb-1">
//               <span className="text-red-600">*</span>שם
//             </label>
//             <input {...register("name")} disabled={loading} className="w-full p-3 rounded border" />
//             {errors.name && <p className="text-red-600 text-sm">{errors.name.message}</p>}
//           </div>

//           <div>
//             <label className="block text-right font-bold text-sm mb-1">
//               <span className="text-red-600">*</span>אימייל
//             </label>
//             <input {...register("email")} disabled={loading} className="w-full p-3 rounded border" />
//             {errors.email && <p className="text-red-600 text-sm">{errors.email.message}</p>}
//           </div>

//           <div>
//             <label className="block text-right font-bold text-sm mb-1">טלפון</label>
//             <input {...register("phone")} disabled={loading} className="w-full p-3 rounded border" />
//           </div>

//           <div>
//             <label className="block text-right font-bold text-sm mb-1">
//               <span className="text-red-600">*</span>הודעה
//             </label>
//             <textarea rows={5} {...register("message")} disabled={loading} className="w-full p-3 rounded border" />
//             {errors.message && <p className="text-red-600 text-sm">{errors.message.message}</p>}
//           </div>

//           <input
//             type="text"
//             name="honeypot"
//             autoComplete="off"
//             tabIndex="-1"
//             {...register("honeypot")}
//             className="hidden"
//           />

//           <button
//             type="submit"
//             className="bg-blue-900 text-white py-3 rounded w-full text-lg font-semibold hover:bg-blue-800 transition"
//             disabled={loading}
//           >
//             {loading ? "שולח..." : "שליחה"}
//           </button>
//         </div>
//       </form>

//       <ReCAPTCHA
//         sitekey="6LeK9pkrAAAAAICTnxK8hkJuKqSngnKGi7IKq8wz"
//         size="invisible"
//         ref={recaptchaRef}
//       />
//     </>
//   );
// };

// export default Support;






// src/components/support/Support.jsx
import React, { useEffect, useRef, useState } from "react";
import ReCAPTCHA from "react-google-recaptcha";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import toast from "react-hot-toast";
import { useSelector } from "react-redux";
import { useSendContactMutation } from "../../redux/services/contactApi"; // עדכני נתיב לפי הפרויקט

const schema = yup.object().shape({
  name: yup.string().required("יש להזין שם"),
  email: yup.string().email("אימייל לא תקין").required("שדה חובה"),
  phone: yup.string(),
  message: yup.string().required("יש להזין הודעה"),
  honeypot: yup.string().nullable(),
});

export default function Support() {
  const recaptchaRef = useRef();
  const user = useSelector((s) => s.user.user);
  const [sendContact, { isLoading }] = useSendContactMutation();

  const RECAPTCHA_SITE_KEY =
    import.meta.env.VITE_RECAPTCHA_V2_SITE_KEY || "___PUT_YOUR_KEY___";

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      message: "",
      honeypot: "",
    },
  });

  useEffect(() => {
    if (user) {
      reset((prev) => ({
        ...prev,
        name: user.username || "",
        email: user.email || "",
        phone: user.phone || "",
      }));
    }
  }, [user, reset]);

  const onSubmit = async (data) => {
    try {
      const token = await recaptchaRef.current.executeAsync();
      recaptchaRef.current.reset();

      await sendContact({ ...data, recaptchaToken: token }).unwrap();

      toast.success("ההודעה נשלחה בהצלחה! 🎉");
      reset();
    } catch (err) {
      // err בפורמט של RTK Query: { status, data }
      if (err?.status === 429) {
        toast.error("שליחת ההודעה נחסמה זמנית. נא להמתין ולנסות שוב.");
      } else {
        toast.error(err?.data?.message || "שליחת ההודעה נכשלה 😢");
      }
      console.error("שגיאה בשליחת הודעת צור קשר:", err);
    }
  };

  return (
    <>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="max-w-4xl mx-auto bg-gray-100 p-8 md:p-12 rounded-lg shadow-md"
      >
        <h2 className="text-3xl font-bold text-gray-800 mb-10 flex items-center justify-end gap-2">
          דברו איתנו 🙂
        </h2>

        <div className="grid grid-cols-1 gap-6">
          <div>
            <label className="block text-right font-bold text-sm mb-1">
              <span className="text-red-600">*</span>שם
            </label>
            <input {...register("name")} disabled={isLoading} className="w-full p-3 rounded border" />
            {errors.name && <p className="text-red-600 text-sm">{errors.name.message}</p>}
          </div>

          <div>
            <label className="block text-right font-bold text-sm mb-1">
              <span className="text-red-600">*</span>אימייל
            </label>
            <input {...register("email")} disabled={isLoading} className="w-full p-3 rounded border" />
            {errors.email && <p className="text-red-600 text-sm">{errors.email.message}</p>}
          </div>

          <div>
            <label className="block text-right font-bold text-sm mb-1">טלפון</label>
            <input {...register("phone")} disabled={isLoading} className="w-full p-3 rounded border" />
          </div>

          <div>
            <label className="block text-right font-bold text-sm mb-1">
              <span className="text-red-600">*</span>הודעה
            </label>
            <textarea rows={5} {...register("message")} disabled={isLoading} className="w-full p-3 rounded border" />
            {errors.message && <p className="text-red-600 text-sm">{errors.message.message}</p>}
          </div>

          {/* honeypot (נגד בוטים) */}
          <input
            type="text"
            autoComplete="off"
            tabIndex="-1"
            {...register("honeypot")}
            className="hidden"
          />

          <button
            type="submit"
            className="bg-blue-900 text-white py-3 rounded w-full text-lg font-semibold hover:bg-blue-800 transition disabled:opacity-60"
            disabled={isLoading}
          >
            {isLoading ? "שולח..." : "שליחה"}
          </button>
        </div>
      </form>

      <ReCAPTCHA sitekey={RECAPTCHA_SITE_KEY} size="invisible" ref={recaptchaRef} />
    </>
  );
}
