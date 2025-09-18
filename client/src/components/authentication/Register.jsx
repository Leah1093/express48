import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useDispatch, useSelector } from "react-redux";
import { setUser } from "../../redux/slices/userSlice";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { AiOutlineEye, AiOutlineEyeInvisible, AiOutlineClose } from "react-icons/ai";
import GoogleLoginButton from "./GoogleLoginButton";
import { useRegisterMutation } from "../../redux/services/authApi";
import AuthHeader from "./AuthHeader";

const schema = z
  .object({
    username: z.string().min(2, "שם מלא חייב להיות לפחות 2 תווים").optional().or(z.literal("")),
    email: z.string().nonempty("נדרש להכניס כתובת אימייל").email("כתובת מייל לא תקינה"),
    phone: z.string()
      .regex(/^\d+$/, "טלפון חייב להכיל ספרות בלבד")
      .min(9, "מספר טלפון לא תקין")
      .max(15, "מספר טלפון ארוך מדי")
      .optional()
      .or(z.literal("")),
    password: z.string().nonempty("נדרש להזין סיסמא").min(6, "אורך מינימלי 6 תווים"),
    confirmPassword: z.string().nonempty("נא לאשר את הסיסמה"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "הסיסמאות אינן תואמות",
  });

const Register = () => {
  const { register, handleSubmit, reset, formState: { errors, isSubmitting, isValid } } =
    useForm({ resolver: zodResolver(schema), mode: "onChange" });

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const isMobile = useSelector((state) => state.ui.isMobile);
  const [formError, setFormError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isNameFocused, setIsNameFocused] = useState(false);
  const [isEmailFocused, setIsEmailFocused] = useState(false);
  const [isPhoneFocused, setIsPhoneFocused] = useState(false);
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);
  const [isConfirmPasswordFocused, setIsConfirmPasswordFocused] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [registerUser, { isLoading }] = useRegisterMutation();

  const onSubmit = async (data) => {
    window.scrollTo(0, 0);
    const { confirmPassword, ...formData } = data;
    Object.keys(formData).forEach((key) => { if (formData[key] === "") { delete formData[key]; } });

    try {
      const res = await registerUser(formData).unwrap();
      dispatch(setUser(res.user));
      reset();
      navigate("/");
    } catch (err) {
      if (err?.status === 409) {
        setFormError("משתמש כבר קיים, נא להתחבר");
      } else if (err?.status === 429) {
        setFormError("יותר מדי ניסיונות. נסה שוב מאוחר יותר.");
      } else {
        setFormError("אירעה שגיאה בלתי צפויה. נסה שוב מאוחר יותר");
      }
    }
  };

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
            <div className="w-full max-w-[600px]  mt-[64px]">
              <div id="error-box" className="flex items-center gap-2 w-full p-4 rounded-[12px] bg-[#FFF2F2]" style={{ direction: "rtl" }}>
                <button type="button" onClick={() => setFormError("")} className="w-6 h-6 flex items-center justify-center text-[#141414]">
                  <AiOutlineClose className="w-6 h-6" />
                </button>
                <p className="text-[#141414] font-rubik text-[14px] leading-[120%] tracking-[-0.154px] flex-1 mr-2">{formError}</p>
              </div>
            </div>
          )}

          <h2 className={`text-[24px] font-rubik font-semibold leading-[120%] tracking-[-0.264px] text-center text-black ${formError ? "mt-[48px]" : "mt-[64px]"}`}>הרשמה</h2>

          <div className="flex flex-col items-end gap-2 w-full relative mt-[24px]">

            <label htmlFor="email" className={`absolute right-3 -top-3 px-2 text-[16px] font-rubik text-[#141414] ${isEmailFocused ? "bg-gradient-to-b from-white from-40% to-[#FFF7F2] to-60%" : "bg-white"}`}        >
              אימייל
            </label>

            <input
              id="email"
              type="email"
              {...register("email")}
              onFocus={() => setIsEmailFocused(true)}
              onBlur={() => setIsEmailFocused(false)}
              className={`w-full h-[59px] px-4 text-right font-rubik rounded-[12px] border ${errors.email ? "border-[#C7111C]" : isEmailFocused ? "border-black" : "border-[#EDEDED]"} ${isEmailFocused ? "bg-[#FFF7F2]" : "bg-white"} focus:outline-none focus:ring-0`}
            />

            <div className="h-[20px] -mt-1 text-right">
              {errors.email && (<p className="text-[14px] font-rubik text-[#C7111C] mr-2">{errors.email.message}</p>)}
            </div>

          </div>

          <div className="flex flex-col items-end gap-2 w-full relative  mt-[24px] ">

            <label htmlFor="password" className={`absolute right-3 -top-3 px-2 text-[16px] font-rubik text-[#141414] ${isPasswordFocused ? "bg-gradient-to-b from-white from-40% to-[#FFF7F2] to-60%" : "bg-white"}`}>
              סיסמא
            </label>

            <input
              id="password"
              type={showPassword ? "text" : "password"}
              {...register("password")}
              onFocus={() => setIsPasswordFocused(true)}
              onBlur={() => setIsPasswordFocused(false)}
              className={`w-full h-[59px] pr-4 pl-10 text-right font-rubik rounded-[12px] border ${errors.password ? "border-[#C7111C]" : isPasswordFocused ? "border-black" : "border-[#EDEDED]"} ${isPasswordFocused ? "bg-[#FFF7F2]" : "bg-white"} focus:outline-none focus:ring-0`}
            />

            <button
              type="button"
              onClick={() => { setShowPassword((prev) => !prev); setIsPasswordFocused(true); }}
              onMouseDown={(e) => e.preventDefault()}
              className="absolute left-4 top-[35%] -translate-y-1/2 text-[#141414]">
              {showPassword ? (<AiOutlineEye className="text-[24px]" />) : (<AiOutlineEyeInvisible className="text-[24px]" />)}
            </button>

            <div className="h-[20px] -mt-1 text-right">
              {errors.password && (<p className="text-[14px] font-rubik text-[#C7111C] mr-2">{errors.password.message}</p>)}
            </div>

          </div>

          <div className="flex flex-col items-end gap-2 w-full relative  mt-[24px] ">

            <label htmlFor="confirmPassword" className={`absolute right-3 -top-3 px-2 text-[16px] font-rubik text-[#141414] ${isConfirmPasswordFocused ? "bg-gradient-to-b from-white from-40% to-[#FFF7F2] to-60%" : "bg-white"}`}>
              אימות סיסמא
            </label>

            <input
              id="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              {...register("confirmPassword")}
              onFocus={() => setIsConfirmPasswordFocused(true)}
              onBlur={() => setIsConfirmPasswordFocused(false)}
              className={`w-full h-[59px] pr-4 pl-10 text-right font-rubik rounded-[12px] border ${errors.password ? "border-[#C7111C]" : isConfirmPasswordFocused ? "border-black" : "border-[#EDEDED]"} ${isConfirmPasswordFocused ? "bg-[#FFF7F2]" : "bg-white"} focus:outline-none focus:ring-0`}
            />

            <button
              type="button"
              onClick={() => { setShowConfirmPassword((prev) => !prev); setIsConfirmPasswordFocused(true); }}
              onMouseDown={(e) => e.preventDefault()}
              className="absolute left-4 top-[35%] -translate-y-1/2 text-[#141414]">
              {showConfirmPassword ? (<AiOutlineEye className="text-[24px]" />) : (<AiOutlineEyeInvisible className="text-[24px]" />)}
            </button>

            <div className="h-[20px] -mt-1 text-right">
              {errors.confirmPassword && (<p className="text-[14px] font-rubik text-[#C7111C] mr-2">{errors.confirmPassword.message}</p>)}
            </div>

          </div>


          <div className="flex flex-col items-end gap-2 w-full relative mt-[24px]">

            <label htmlFor="phone" className={`absolute right-3 -top-3 px-2 text-[16px] font-rubik text-[#141414] ${isPhoneFocused ? "bg-gradient-to-b from-white from-40% to-[#FFF7F2] to-60%" : "bg-white"}`}        >
              (אופציונלי) טלפון
            </label>

            <input
              id="phone"
              type="tel"
              {...register("phone")}
              onFocus={() => setIsPhoneFocused(true)}
              onBlur={() => setIsPhoneFocused(false)}
              className={`w-full h-[59px] px-4 text-right font-rubik rounded-[12px] border ${errors.phone ? "border-[#C7111C]" : isPhoneFocused ? "border-black" : "border-[#EDEDED]"} ${isPhoneFocused ? "bg-[#FFF7F2]" : "bg-white"} focus:outline-none focus:ring-0`}
            />

            <div className="h-[20px] -mt-1 text-right">
              {errors.phone && (<p className="text-[14px] font-rubik text-[#C7111C] mr-2">{errors.phone.message}</p>)}
            </div>

          </div>


          <div className="flex flex-col items-end gap-2 w-full relative mt-[24px]">

            <label htmlFor="username" className={`absolute right-3 -top-3 px-2 text-[16px] font-rubik text-[#141414] ${isNameFocused ? "bg-gradient-to-b from-white from-40% to-[#FFF7F2] to-60%" : "bg-white"}`}        >
              (אופציונלי) שם משתמש
            </label>

            <input
              id="username"
              type="text"
              {...register("username")}
              onFocus={() => setIsNameFocused(true)}
              onBlur={() => setIsNameFocused(false)}
              className={`w-full h-[59px] px-4 text-right font-rubik rounded-[12px] border ${errors.username ? "border-[#C7111C]" : isNameFocused ? "border-black" : "border-[#EDEDED]"} ${isNameFocused ? "bg-[#FFF7F2]" : "bg-white"} focus:outline-none focus:ring-0`}
            />

            <div className="h-[20px] -mt-1 text-right">
              {errors.username && (<p className="text-[14px] font-rubik text-[#C7111C] mr-2">{errors.username.message}</p>)}
            </div>

          </div>


          <div className="flex flex-col gap-4 w-full mt-[24px]">
            <div className="flex items-center justify-end gap-2">

              <label className="flex flex-row-reverse items-center gap-2 cursor-pointer select-none">
                <div className={`w-[20px] h-[20px] flex items-center justify-center border ${rememberMe ? "bg-[#FF6500] border-[#FF6500]" : "bg-[#FFF7F2] border-[#FFF7F2]"} rounded-[2px] transition `}>
                  {rememberMe && (<span className="text-white text-[18px] leading-none translate-y-[1.2px]">✓</span>)}
                </div>
                <span className="text-[18px] font-rubik text-[#141414]">זכור אותי</span>
                <input type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} className="hidden" />
              </label>

            </div>

          </div>

          <button
            type="submit"
            disabled={!isValid || isSubmitting || isLoading} className={` w-full h-[54px] mt-[24px] rounded-[16px]${!isValid || isSubmitting || isLoading ? " bg-[#737373] text-white cursor-not-allowed opacity-100" : " bg-[#141414] text-white hover:opacity-90 cursor-pointer"} font-rubik font-bold text-[18px]`}>
            {isSubmitting || isLoading ? "...נרשם" : "הרשמה"}
          </button>

          <div className="mt-[24px] w-full"><GoogleLoginButton /></div>

          <div className="flex flex-row-reverse items-center justify-center gap-2 mt-[24px] mb-[14%]">
            <p className="text-[16px] font-rubik text-[#000]">?כבר יש לך חשבון</p>
            <button
              type="button"
              onClick={() => navigate("/login")}
              className="text-[#FF6500] font-rubik text-[16px] hover:cursor-pointer"
            >כניסה לחשבון</button>
          </div>
        </form>
      </div>
    </div>
  );
};


export default Register;
