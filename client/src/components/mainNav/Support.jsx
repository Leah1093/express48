import React, { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import ReCAPTCHA from "react-google-recaptcha";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import axios from "axios";
import toast from "react-hot-toast";

const schema = yup.object().shape({
    name: yup.string().required("יש להזין שם"),
    email: yup.string().email("אימייל לא תקין").required("שדה חובה"),
    phone: yup.string(),
    message: yup.string().required("יש להזין הודעה"),
});

const Support = () => {
    const recaptchaRef = useRef();

    const [loading, setLoading] = useState(false);
    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm({ resolver: yupResolver(schema) });
    const onSubmit = async (data) => {
        try {
            setLoading(true);

            // קבלת טוקן מ־Google
            const token = await recaptchaRef.current.executeAsync();
            recaptchaRef.current.reset();

            // שליחת הבקשה לשרת
            await axios.post("http://localhost:8080/contact/send", {
                name: data.name,
                email: data.email,
                message: data.message,
                honeypot: data.honeypot,
                phone: data.phone,

                recaptchaToken: token, // 🛡️ טוקן הגנה
            });
            toast.success("ההודעה נשלחה בהצלחה! 🎉");
            reset();
        } catch (err) {
            if (err.response?.status === 429) {
                toast.error("שליחת ההודעה נחסמה זמנית. נא להמתין ולנסות שוב.");
            } else {
                toast.error("שליחת ההודעה נכשלה 😢");
            }
            console.error("שגיאה בשליחת הודעת צור קשר:", err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <form
                onSubmit={handleSubmit(onSubmit)}
                className="max-w-4xl mx-auto bg-gray-100 p-8 md:p-12 rounded-lg shadow-md"
            >
                <h2 className="text-3xl font-bold text-gray-800 mb-10 flex items-center justify-end gap-2">דברו איתנו 🙂</h2>

                <div className="grid grid-cols-1 gap-6">
                    <div>
                        <label className="block text-right font-bold text-sm mb-1"><span className="text-red-600">*</span>שם</label>
                        <input
                            {...register("name")}
                            disabled={loading}
                            className="w-full p-3 rounded border"
                        />
                        {errors.name && <p className="text-red-600 text-sm">{errors.name.message}</p>}
                    </div>

                    <div>
                        <label className="block text-right font-bold text-sm mb-1"><span className="text-red-600">*</span>אימייל</label>
                        <input
                            {...register("email")}
                            disabled={loading}
                            className="w-full p-3 rounded border"
                        />
                        {errors.email && <p className="text-red-600 text-sm">{errors.email.message}</p>}
                    </div>

                    <div>
                        <label className="block text-right font-bold text-sm mb-1">טלפון</label>
                        <input
                            {...register("phone")}
                            disabled={loading}
                            className="w-full p-3 rounded border"
                        />
                    </div>

                    <div>
                        <label className="block text-right font-bold text-sm mb-1"><span className="text-red-600">*</span>הודעה</label>
                        <textarea
                            rows={5}
                            {...register("message")}
                            disabled={loading}
                            className="w-full p-3 rounded border"
                        />
                        {errors.message && <p className="text-red-600 text-sm">{errors.message.message}</p>}
                    </div>
                    <input
                        type="text"
                        name="honeypot"
                        autoComplete="off"
                        tabIndex="-1"
                        {...register("honeypot")}
                        // className="hidden"
                        className="border p-2 bg-red-100"
                    />


                    <button
                        type="submit" className="bg-blue-900 text-white py-3 rounded w-full text-lg font-semibold hover:bg-blue-800 transition" disabled={loading}
                    >  {loading ? "שולח..." : "שליחה"}</button>
                </div>

            </form>
            <ReCAPTCHA
                sitekey="6LeK9pkrAAAAAICTnxK8hkJuKqSngnKGi7IKq8wz"
                size="invisible"
                ref={recaptchaRef}
            />
        </>
    );
};

export default Support;
