import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import ReCAPTCHA from "react-google-recaptcha";
import { useState, useRef } from "react";
import { useForgotPasswordMutation } from "../../redux/services/authApi";
import { FiChevronRight } from "react-icons/fi";
import { useSelector } from "react-redux";
import AuthHeader from "./AuthHeader";

const schema = z.object({
  email: z.string().nonempty("נדרש להכניס כתובת אימייל").email("כתובת מייל לא תקינה"),
});

const ForgotPassword = () => {
  const { register, handleSubmit, formState: { errors, isValid }, reset, } = useForm({ resolver: zodResolver(schema), mode: "onChange" });
  const [isEmailFocused, setIsEmailFocused] = useState(false);
  const [recaptchaToken, setRecaptchaToken] = useState("");
  const recaptchaRef = useRef();
  const [formError, setFormError] = useState("");
  const [success, setSuccess] = useState(false);
  const [sentEmail, setSentEmail] = useState("");
  const [forgotPassword, { isLoading }] = useForgotPasswordMutation();
  const isMobile = useSelector((state) => state.ui.isMobile);

  const onSubmit = async (data) => {
    setFormError("");

    if (!recaptchaToken) {
      setFormError("נא לאשר את reCAPTCHA");
      return;
    }

    try {
      await forgotPassword({ email: data.email, recaptchaToken }).unwrap();
      setSentEmail(data.email);
      setSuccess(true);
      reset();
    } catch (error) {
      if (error?.status === 429) {
        setFormError("יותר מדי ניסיונות. נסה שוב מאוחר יותר.");
        return;
      }
      setFormError("שגיאה בשליחת הקישור");
    } finally {
      recaptchaRef.current?.reset();
      setRecaptchaToken("");
    }
  };

  if (success) {
    return (
      <div className="flex min-h-screen">
        {!isMobile && (<div className="w-1/2 bg-cover bg-center" style={{ backgroundImage: "url('/auth.jpg')" }} />)}
        <div className={`flex w-full ${!isMobile ? "md:w-1/2" : "w-full"} flex-col relative bg-white`}>
          <AuthHeader />

          <div className="flex-1 w-full max-w-[600px] mx-auto flex flex-col items-center justify-center px-[24px] md:px-[10%] relative -mt-[13%]">
            <h2 className="font-rubik font-semibold text-[24px] md:text-[28px] lg:text-[29px] leading-[120%] tracking-[-0.011em] text-center text-[#141414]">בדוק את האימייל שלך</h2>
            <p className="mt-[12px] font-rubik font-normal text-[16px] md:text-[18px] lg:text-[19px] leading-[120%] tracking-[-0.011em] text-center text-[#141414]">
              <span className="font-semibold">{sentEmail}</span> נשלח קישור לדוא״ל<br />.לחץ כדי לאמת את חשבונך</p>
            <div className="flex flex-row-reverse items-center justify-center gap-2 mt-[48px]">
              <p className="font-rubik text-[#141414] text-[16px] md:text-[18px] lg:text-[19px]">?לא קיבלת אימייל</p>
              <button
                type="button"
                onClick={() => setSuccess(false)}
                className="text-[#FF6500] font-rubik text-[16px] md:text-[18px] lg:text-[19px] hover:cursor-pointer mr-3"
              >
                שלח שוב
              </button>
            </div>
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
            <div className="w-full max-w-[600px] mt-[24px]">
              <div
                id="error-box"
                className="flex items-center gap-2 w-full p-4 rounded-[12px] bg-[#FFF2F2]"
                style={{ direction: "rtl" }}
              >
                <p className="text-[#141414] font-rubik text-[14px] leading-[120%] tracking-[-0.154px] flex-1">
                  {formError}
                </p>
              </div>
            </div>
          )}

          <h2 className={`font-rubik font-semibold text-[24px] leading-[120%] tracking-[-0.011em] text-center text-[#141414] ${formError ? "mt-[24px]" : "mt-[64px]"} `}>האימייל שלך</h2>

          <h4 className="mt-[12px] font-rubik font-normal text-[16px] leading-[120%] tracking-[-0.011em] text-center text-[#141414]" > הזן את כתובת הדוא״ל שלך כדי לאפס את הסיסמא </h4>

          <div className="flex flex-col items-end gap-2 w-full relative mt-[48px]">

            <label htmlFor="email" className={`absolute right-3 -top-3 px-2 text-[16px] font-rubik text-[#141414] ${isEmailFocused ? "bg-gradient-to-b from-white from-40% to-[#FFF7F2] to-60%" : "bg-white"}`}>אימייל</label>

            <input
              id="email"
              type="email"
              {...register("email")}
              onFocus={() => setIsEmailFocused(true)}
              onBlur={() => setIsEmailFocused(false)}
              className={`w-full h-[59px] px-4 text-right font-rubik rounded-[12px] border ${errors.email ? "border-[#C7111C]" : isEmailFocused ? "border-black" : "border-[#EDEDED]"} ${isEmailFocused ? "bg-[#FFF7F2]" : "bg-white"} focus:outline-none focus:ring-0`} />

            <div className="h-[20px] -mt-1 text-right">
              {errors.email && (<p className="text-[14px] font-rubik text-[#C7111C] mr-2">{errors.email.message}</p>)}
            </div>

          </div>

          <div className="w-full mt-[12px] flex justify-end -mr-[8%]">
            <div className="transform scale-[0.85] origin-top">
              <ReCAPTCHA sitekey={import.meta.env.VITE_RECAPTCHA_V2_SITE_KEY} onChange={(token) => setRecaptchaToken(token)} ref={recaptchaRef} size="normal" />
            </div>
          </div>


          <button
            type="submit"
            disabled={!isValid || !recaptchaToken || isLoading}
            className={`w-full h-[54px] mt-[24px] rounded-[16px] ${!isValid || !recaptchaToken || isLoading ? "bg-[#737373] text-white cursor-not-allowed opacity-100" : "bg-[#141414] text-white hover:opacity-90 cursor-pointer"} font-rubik font-bold text-[18px]`}>
            {isLoading ? "...שולח קישור" : "שלח קישור"}
          </button>

        </form>
      </div>
    </div>

  );
};

export default ForgotPassword;
