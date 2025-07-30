import React from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import toast from "react-hot-toast";

const schema = yup.object().shape({
    name: yup.string().required("יש להזין שם"),
    email: yup.string().email("אימייל לא תקין").required("שדה חובה"),
    phone: yup.string(),
    message: yup.string().required("יש להזין הודעה"),
});

const Support = () => {
    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm({ resolver: yupResolver(schema) });

    const onSubmit = (data) => {
        console.log("נשלח:", data);
        toast.success("ההודעה נשלחה בהצלחה! 🎉");
        reset();
    };

    return (
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
                        className="w-full p-3 rounded border"
                    />
                    {errors.name && <p className="text-red-600 text-sm">{errors.name.message}</p>}
                </div>

                <div>
                    <label className="block text-right font-bold text-sm mb-1"><span className="text-red-600">*</span>אימייל</label>
                    <input
                        {...register("email")}
                        className="w-full p-3 rounded border"
                    />
                    {errors.email && <p className="text-red-600 text-sm">{errors.email.message}</p>}
                </div>

                <div>
                    <label className="block text-right font-bold text-sm mb-1">טלפון</label>
                    <input
                        {...register("phone")}
                        className="w-full p-3 rounded border"
                    />
                </div>

                <div>
                    <label className="block text-right font-bold text-sm mb-1"><span className="text-red-600">*</span>הודעה</label>
                    <textarea
                        rows={5}
                        {...register("message")}
                        className="w-full p-3 rounded border"
                    />
                    {errors.message && <p className="text-red-600 text-sm">{errors.message.message}</p>}
                </div>

                <button
                    type="submit" className="bg-blue-900 text-white py-3 rounded w-full text-lg font-semibold hover:bg-blue-800 transition"
                > שליחה</button>
            </div>
        </form>
    );
};

export default Support;
