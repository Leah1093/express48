import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { handleApiError } from "../../utils/handleApiError";
import { AiOutlineClose } from "react-icons/ai";
import { useResetPasswordMutation } from "../../redux/services/authApi";
import { useSelector } from "react-redux";
import AuthHeader from "./AuthHeader";

const schema = z
  .object({
    newPassword: z.string().nonempty("נדרש להזין סיסמא").min(6, "אורך מינימלי 6 תווים"),
    confirmPassword: z.string().nonempty("נא לאשר את הסיסמה"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "הסיסמאות אינן תואמות",
    path: ["confirmPassword"],
  });

export default function ResetPasswordPage() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [formError, setFormError] = useState("");
  const [success, setSuccess] = useState(false);
  const [isNewPasswordFocused, setNewPasswordFocused] = useState(false);
  const [isConfirmPasswordFocused, setConfirmPasswordFocused] = useState(false);
  const [resetPassword, { isLoading }] = useResetPasswordMutation();
  const isMobile = useSelector((state) => state.ui.isMobile);

  const { register, handleSubmit, formState: { errors, isValid }, } = useForm({ resolver: zodResolver(schema), mode: "onChange", });

  const onSubmit = async (data) => {
    try {
      setFormError("");
      await resetPassword({ token, newPassword: data.newPassword }).unwrap();
      setSuccess(true);
    } catch (err) {
      setFormError("נכשל עדכון הסיסמה");
      handleApiError(err, "נכשל עדכון הסיסמה");
    }
  };

  if (success) {
    return (
      <div className="flex min-h-screen">
        {!isMobile && (<div className="w-1/2 bg-cover bg-center" style={{ backgroundImage: "url('/auth.jpg')" }} />)}
        <div className={`flex flex-col w-full ${!isMobile ? "md:w-1/2" : "w-full"} bg-white`}>
          <AuthHeader />

          <div className="flex-1 w-full max-w-[600px] mx-auto flex flex-col items-center justify-center px-[24px] md:px-[10%] relative -mt-[13%] ">
            <h2 className="font-rubik font-semibold text-[24px] md:text-[28px] lg:text-[29px] leading-[120%] tracking-[-0.011em] text-center text-[#141414]">הסיסמה השתנתה</h2>
            <p className="mt-[12px] font-rubik font-normal text-[16px] md:text-[18px] lg:text-[19px] leading-[120%] tracking-[-0.011em] text-center text-[#141414]">הסיסמא שלך עודכנה בהצלחה.</p>
            <button
              onClick={() => navigate("/login")}
              className="w-full h-[54px] md:h-[60px] lg:h-[64px] mt-[48px] rounded-[16px] bg-[#141414] text-white font-rubik font-bold text-[18px] md:text-[20px] lg:text-[18px] hover:opacity-90 transition"
            >
              התחבר
            </button>
          </div>

        </div>
      </div>

    );
  }

  return (
    <div className="flex min-h-screen">
      {!isMobile && (<div className="w-1/2 bg-cover bg-center" style={{ backgroundImage: "url('/auth.jpg')" }} />)}
      <div className={`flex w-full ${!isMobile ? "md:w-1/2" : "w-full"} flex-col relative bg-white`}>
        <AuthHeader />

        <form
          onSubmit={handleSubmit(onSubmit)}
          noValidate
          className={`flex-1 flex flex-col items-center justify-start px-[24px] ${!isMobile ? "md:px-[24%]" : ""}`}>

          {formError && (
            <div className="w-full max-w-[600px]  mt-[48px] -mb-[16px]">
              <div id="error-box" className="flex items-center gap-2 w-full p-4 rounded-[12px] bg-[#FFF2F2]" style={{ direction: "rtl" }}>
                <button type="button" onClick={() => setFormError("")} className="w-6 h-6 flex items-center justify-center text-[#141414]">
                  <AiOutlineClose className="w-6 h-6" />
                </button>
                <p className="text-[#141414] font-rubik text-[14px] leading-[120%] tracking-[-0.154px] flex-1 mr-2">{formError}</p>
              </div>
            </div>
          )}

          <h2 className="font-rubik font-semibold text-[24px] text-center text-[#141414] mt-[48px]">
            איפוס סיסמא
          </h2>
          <h4 className="mt-[2px] font-rubik font-normal text-[16px] text-center text-[#141414]">
            הזן את הסיסמא החדשה שלך
          </h4>

          <div className="flex flex-col items-end gap-2 w-full relative mt-[48px]">

            <label htmlFor="newPassword" className={`absolute right-3 -top-3 px-2 text-[16px] font-rubik text-[#141414] ${isNewPasswordFocused ? "bg-gradient-to-b from-white from-40% to-[#FFF7F2] to-60%" : "bg-white"}`}        >
              סיסמא חדשה
            </label>

            <input
              id="newPassword"
              type="text"
              {...register("newPassword")}
              onFocus={() => setNewPasswordFocused(true)}
              onBlur={() => setNewPasswordFocused(false)}
              className={`w-full h-[59px] px-4 text-right font-rubik rounded-[12px] border ${errors.newPassword ? "border-[#C7111C]" : isNewPasswordFocused ? "border-black" : "border-[#EDEDED]"} ${isNewPasswordFocused ? "bg-[#FFF7F2]" : "bg-white"} focus:outline-none focus:ring-0`}
            />
            <div className="h-[20px] -mt-1 text-right">
              {errors.newPassword && (<p className="text-[14px] font-rubik text-[#C7111C] mr-2">{errors.newPassword.message}</p>)}
            </div>
          </div>

          <div className="flex flex-col items-end gap-2 w-full relative mt-[24px]">

            <label htmlFor="confirmPassword" className={`absolute right-3 -top-3 px-2 text-[16px] font-rubik text-[#141414] ${isConfirmPasswordFocused ? "bg-gradient-to-b from-white from-40% to-[#FFF7F2] to-60%" : "bg-white"}`}        >
              אימות סיסמא
            </label>

            <input
              id="confirmPassword"
              type="text"
              {...register("confirmPassword")}
              onFocus={() => setConfirmPasswordFocused(true)}
              onBlur={() => setConfirmPasswordFocused(false)}
              className={`w-full h-[59px] px-4 text-right font-rubik rounded-[12px] border ${errors.confirmPassword ? "border-[#C7111C]" : isConfirmPasswordFocused ? "border-black" : "border-[#EDEDED]"} ${isConfirmPasswordFocused ? "bg-[#FFF7F2]" : "bg-white"} focus:outline-none focus:ring-0`}
            />
            <div className="h-[20px] -mt-1 text-right">
              {errors.confirmPassword && (<p className="text-[14px] font-rubik text-[#C7111C] mr-2">{errors.confirmPassword.message}</p>)}
            </div>
          </div>

          <button
            type="submit"
            disabled={!isValid || isLoading}
            className={`w-full h-[54px] mt-[24px] rounded-[16px] ${!isValid || isLoading ? "bg-[#737373] text-white cursor-not-allowed opacity-100" : "bg-[#141414] text-white hover:opacity-90 cursor-pointer"} font-rubik font-bold text-[18px]`}>
            {isLoading ? "...שולח" : "שליחה"}
          </button>

        </form>
      </div>
    </div>

  );
}

