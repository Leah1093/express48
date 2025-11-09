// <<<<<<< HEAD
// // import { useForm } from "react-hook-form";
// // import { z } from "zod";
// // import { zodResolver } from "@hookform/resolvers/zod";
// // import { useState } from "react";
// // import { AiOutlineEye, AiOutlineEyeInvisible, AiOutlineClose } from "react-icons/ai";
// // import { useNavigate, useLocation } from "react-router-dom";
// // import { useDispatch } from "react-redux";
// // import { setUser } from "../../redux/slices/userSlice";
// // import useMergeCartAfterLogin from "./useMergeCartAfterLogin.js";
// // import { useLoginMutation } from "../../redux/services/authApi";
// // import GoogleLoginButton from "./GoogleLoginButton";

// // const schema = z.object({
// //   email: z.string().nonempty("נדרש להכניס כתובת אימייל").email("נא הזן כתובת אימייל תקינה"),
// //   password: z.string().nonempty("נדרש להזין סיסמא").min(6, "אורך מינימלי 6 תווים"),
// // });

// // const Login = () => {
// //   const [login, { isLoading }] = useLoginMutation();
// //   const navigate = useNavigate();
// //   const location = useLocation();
// //   const dispatch = useDispatch();
// //   const mergeCartAfterLogin = useMergeCartAfterLogin();
// //   const [showPassword, setShowPassword] = useState(false);
// //   const from = location.state?.from?.pathname || "/";
// //   const [isEmailFocused, setIsEmailFocused] = useState(false);
// //   const [isPasswordFocused, setIsPasswordFocused] = useState(false);
// //   const [formError, setFormError] = useState("");
// //   const [rememberMe, setRememberMe] = useState(true);
// //   const { register, handleSubmit, reset, formState: { errors, isSubmitting, isValid }, } = useForm({ resolver: zodResolver(schema), mode: "onChange" });

// 3..toExponential
// //   const onSubmit = async (data) => {
// //     try {
// //       const res = await login(data).unwrap();
// //       dispatch(setUser(res.user));
// //       await mergeCartAfterLogin(res.user._id);
// //       reset();
// //       navigate(from, { replace: true });
// //       // const from = location.state?.from;
// //       // navigate(from === "/checkout" ? "/cart" : "/");

// //     } catch (err) {
// //       console.log(err)
// //       if (err?.status === 429) {
// //         setFormError("יותר מדי ניסיונות. נסv שוב מאוחר יותר.");
// //         return;
// //       }
// //       if (err?.status === 401) {
// //         setFormError("שם המשתמש או הסיסמה אינם נכונים");
// //         return;
// //       }
// //       setFormError("אירעה שגיאה בלתי צפויה. נסה שוב מאוחר יותר");
// //     }

// //   };

// //   return (
// //     <form
// //       onSubmit={handleSubmit(onSubmit)}
// //       noValidate
// //       className="w-full max-w-[600px] min-h-screen mx-auto flex flex-col items-center justify-start px-4  "    >

// //       {formError && (
// //         <div className="w-full max-w-[600px]  mt-[64px]">
// //           <div id="error-box" className="flex items-center gap-2 w-full p-4 rounded-[12px] bg-[#FFF2F2]" style={{ direction: "rtl" }}>
// //             <button type="button" onClick={() => setFormError("")} className="w-6 h-6 flex items-center justify-center text-[#141414]"            >
// //               <AiOutlineClose className="w-6 h-6" />
// //             </button>
// //             <p className="text-[#141414] font-rubik text-[14px] leading-[120%] tracking-[-0.154px] flex-1 mr-2">{formError}</p>
// //           </div>
// //         </div>
// //       )}

// //       <h2 className={`text-[24px] font-rubik font-semibold leading-[120%] tracking-[-0.264px] text-center text-black ${formError ? "mt-[48px]" : "mt-[64px]"}`}>התחברות</h2>

// //       <div className="flex flex-col items-end gap-2 w-full relative mt-[24px]">

// //         <label htmlFor="email" className={`absolute right-3 -top-3 px-2 text-[16px] font-rubik text-[#141414] ${isEmailFocused ? "bg-gradient-to-b from-white from-40% to-[#FFF7F2] to-60%" : "bg-white"}`}        >
// //           אימייל
// //         </label>

// //         <input
// //           id="email"
// //           type="email"
// //           {...register("email")}
// //           onFocus={() => { setIsEmailFocused(true); setFormError(""); }}
// //           onBlur={() => setIsEmailFocused(false)}
// //           className={`w-full h-[59px] px-4 text-right font-rubik rounded-[12px] border ${errors.email ? "border-[#C7111C]" : isEmailFocused ? "border-black" : "border-[#EDEDED]"} ${isEmailFocused ? "bg-[#FFF7F2]" : "bg-white"} focus:outline-none focus:ring-0`}
// //         />

// //         <div className="h-[20px] -mt-1 text-right">
// //           {errors.email && (<p className="text-[14px] font-rubik text-[#C7111C] mr-2">{errors.email.message}</p>)}
// //         </div>

// //       </div>

// //       <div className="flex flex-col items-end gap-2 w-full relative  mt-[24px] ">

// //         <label htmlFor="password" className={`absolute right-3 -top-3 px-2 text-[16px] font-rubik text-[#141414] ${isPasswordFocused ? "bg-gradient-to-b from-white from-40% to-[#FFF7F2] to-60%" : "bg-white"}`}>
// //           סיסמא
// //         </label>

// //         <input
// //           id="password"
// //           type={showPassword ? "text" : "password"}
// //           {...register("password")}
// //           onFocus={() => { setIsPasswordFocused(true); setFormError(""); }}
// //           onBlur={() => setIsPasswordFocused(false)}
// //           className={`w-full h-[59px] pr-4 pl-10 text-right font-rubik rounded-[12px] border ${errors.password ? "border-[#C7111C]" : isPasswordFocused ? "border-black" : "border-[#EDEDED]"} ${isPasswordFocused ? "bg-[#FFF7F2]" : "bg-white"} focus:outline-none focus:ring-0`}
// //         />

// //         <button
// //           type="button"
// //           onClick={() => { setShowPassword((prev) => !prev); setIsPasswordFocused(true); }}
// //           onMouseDown={(e) => e.preventDefault()}
// //           className="absolute left-4 top-[35%] -translate-y-1/2 text-[#141414]">
// //           {showPassword ? (<AiOutlineEye className="text-[24px]" />) : (<AiOutlineEyeInvisible className="text-[24px]" />)}
// //         </button>

// //         <div className="flex items-center justify-between w-full h-[20px] -mt-1">
// //           <button
// //             type="button"
// //             onClick={() => navigate("/forgot-password")}
// //             className="text-[14px] font-rubik text-[#141414] hover:cursor-pointer ml-2"
// //           >שכחתי את הסיסמא שלי</button>

// //           {errors.password && (<p className="text-[14px] font-rubik text-[#C7111C] mr-2">{errors.password.message}</p>)}
// //         </div>
// //       </div>

// //       <div className="flex flex-col gap-4 w-full mt-[24px]">
// //         <div className="flex items-center justify-end gap-2">

// //           <label className="flex flex-row-reverse items-center gap-2 cursor-pointer select-none">
// //             <div className={`w-[20px] h-[20px] flex items-center justify-center border ${rememberMe ? "bg-[#FF6500] border-[#FF6500]" : "bg-[#FFF7F2] border-[#FFF7F2]"} rounded-[2px] transition `}>
// //               {rememberMe && (<span className="text-white text-[18px] leading-none translate-y-[1.2px]">✓</span>)}
// //             </div>
// //             <span className="text-[18px] font-rubik text-[#141414]">זכור אותי</span>
// //             <input type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} className="hidden" />
// //           </label>

// //         </div>

// //       </div>

// //       <button
// //         type="submit"
// //         disabled={!isValid || isSubmitting || isLoading}
// //         className={`w-full h-[54px] mt-[24px] rounded-[16px] ${!isValid || isSubmitting || isLoading? "bg-[#737373] cursor-not-allowed opacity-100": "bg-[#141414] hover:opacity-90 cursor-pointer"} text-white font-rubik font-bold text-[18px]`}>
// //         {isSubmitting || isLoading ? "...מתחבר" : "התחבר"}
// //       </button>


// //       <div className="mt-[24px] w-full"><GoogleLoginButton /></div>

// //       <div className="flex flex-row-reverse items-center justify-center gap-2 mt-[24px]">
// //         <p className="text-[16px] font-rubik text-[#000]">?עדיין אין לך חשבון</p>
// //         <button
// //           type="button"
// //           onClick={() => navigate("/register")}
// //           className="text-[#FF6500] font-rubik text-[16px] hover:cursor-pointer"
// //         >יצירת חשבון חדש</button>
// //       </div>

// //     </form>
// //   );
// // };

// // export default Login;







// =======
// >>>>>>> 09f9d3e93b71ea13f78e0f5427133a8dd3e1f9d4
// import { useForm } from "react-hook-form";
// import { z } from "zod";
// import { zodResolver } from "@hookform/resolvers/zod";
// import { useState } from "react";
// import { AiOutlineEye, AiOutlineEyeInvisible, AiOutlineClose } from "react-icons/ai";
// import { FiChevronRight } from "react-icons/fi";
// import { useNavigate, useLocation } from "react-router-dom";
// import { useDispatch, useSelector } from "react-redux";
// import { setUser } from "../../redux/slices/userSlice";
// import useMergeCartAfterLogin from "./useMergeCartAfterLogin.js";
// import { useLoginMutation } from "../../redux/services/authApi";
// import GoogleLoginButton from "./GoogleLoginButton";
// import AuthHeader from "./AuthHeader.jsx";
// const schema = z.object({
//   email: z.string().nonempty("נדרש להכניס כתובת אימייל").email("נא הזן כתובת אימייל תקינה"),
//   password: z.string().nonempty("נדרש להזין סיסמא").min(6, "אורך מינימלי 6 תווים"),
// });

// const Login = () => {
//   const [login, { isLoading }] = useLoginMutation();
//   const isMobile = useSelector((state) => state.ui.isMobile);
//   const navigate = useNavigate();
//   const location = useLocation();
//   const dispatch = useDispatch();
//   const mergeCartAfterLogin = useMergeCartAfterLogin();
//   const [showPassword, setShowPassword] = useState(false);
//   const from = location.state?.from?.pathname || "/";
//   const [isEmailFocused, setIsEmailFocused] = useState(false);
//   const [isPasswordFocused, setIsPasswordFocused] = useState(false);
//   const [formError, setFormError] = useState("");
//   const [rememberMe, setRememberMe] = useState(true);
//   const { register, handleSubmit, reset, formState: { errors, isSubmitting, isValid }, } = useForm({ resolver: zodResolver(schema), mode: "onChange" });

//   const onSubmit = async (data) => {
//     try {
//       console.log("data",data);
//       const res = await login(data).unwrap();
//       console.log("res",res);
//       dispatch(setUser(res.user));
//       await mergeCartAfterLogin(res.user._id);
//       reset();
//       navigate(from, { replace: true });
//       // const from = location.state?.from;
//       // navigate(from === "/checkout" ? "/cart" : "/");

//     } catch (err) {
//       console.log(err)
//       if (err?.status === 429) {
//         setFormError("יותר מדי ניסיונות. נסv שוב מאוחר יותר.");
//         return;
//       }
//       if (err?.status === 401) {
//         setFormError("שם המשתמש או הסיסמה אינם נכונים");
//         return;
//       }
//       setFormError("אירעה שגיאה בלתי צפויה. נסה שוב מאוחר יותר");
//     }

//   };

//   return (


//     <div className="flex min-h-screen">
//       {!isMobile && (<div className="w-1/2 bg-cover bg-center" style={{ backgroundImage: "url('/auth.jpg')" }} />)}
//       <div className={`flex w-full ${!isMobile ? "md:w-1/2" : "w-full"} flex-col relative bg-white`}>
//         <AuthHeader />

//         <form
//           onSubmit={handleSubmit(onSubmit)}
//           noValidate
//           className={`flex-1 flex flex-col items-center justify-start px-[24px] ${!isMobile ? "md:px-[24%]" : ""}`}>

//           {formError && (
//             <div className="w-full max-w-[600px]  mt-[64px]">
//               <div id="error-box" className="flex items-center gap-2 w-full p-4 rounded-[12px] bg-[#FFF2F2]" style={{ direction: "rtl" }}>
//                 <button type="button" onClick={() => setFormError("")} className="w-6 h-6 flex items-center justify-center text-[#141414]">
//                   <AiOutlineClose className="w-6 h-6" />
//                 </button>
//                 <p className="text-[#141414] font-rubik text-[14px] leading-[120%] tracking-[-0.154px] flex-1 mr-2">{formError}</p>
//               </div>
//             </div>
//           )}

//           <h2 className={`text-[24px] font-rubik font-semibold leading-[120%] tracking-[-0.264px] text-center text-black ${formError ? "mt-[48px]" : "mt-[64px]"}`}>התחברות</h2>

//           <div className="flex flex-col items-end gap-2 w-full relative mt-[24px]">

//             <label htmlFor="email" className={`absolute right-3 -top-3 px-2 text-[16px] font-rubik text-[#141414] ${isEmailFocused ? "bg-gradient-to-b from-white from-40% to-[#FFF7F2] to-60%" : "bg-white"}`}        >
//               אימייל
//             </label>

//             <input
//               id="email"
//               type="email"
//               {...register("email")}
//               onFocus={() => { setIsEmailFocused(true); setFormError(""); }}
//               onBlur={() => setIsEmailFocused(false)}
//               className={`w-full h-[59px] px-4 text-right font-rubik rounded-[12px] border ${errors.email ? "border-[#C7111C]" : isEmailFocused ? "border-black" : "border-[#EDEDED]"} ${isEmailFocused ? "bg-[#FFF7F2]" : "bg-white"} focus:outline-none focus:ring-0`}
//             />

//             <div className="h-[20px] -mt-1 text-right">
//               {errors.email && (<p className="text-[14px] font-rubik text-[#C7111C] mr-2">{errors.email.message}</p>)}
//             </div>

//           </div>

//           <div className="flex flex-col items-end gap-2 w-full relative  mt-[24px] ">

//             <label htmlFor="password" className={`absolute right-3 -top-3 px-2 text-[16px] font-rubik text-[#141414] ${isPasswordFocused ? "bg-gradient-to-b from-white from-40% to-[#FFF7F2] to-60%" : "bg-white"}`}>
//               סיסמא
//             </label>

//             <input
//               id="password"
//               type={showPassword ? "text" : "password"}
//               {...register("password")}
//               onFocus={() => { setIsPasswordFocused(true); setFormError(""); }}
//               onBlur={() => setIsPasswordFocused(false)}
//               className={`w-full h-[59px] pr-4 pl-10 text-right font-rubik rounded-[12px] border ${errors.password ? "border-[#C7111C]" : isPasswordFocused ? "border-black" : "border-[#EDEDED]"} ${isPasswordFocused ? "bg-[#FFF7F2]" : "bg-white"} focus:outline-none focus:ring-0`}
//             />

//             <button
//               type="button"
//               onClick={() => { setShowPassword((prev) => !prev); setIsPasswordFocused(true); }}
//               onMouseDown={(e) => e.preventDefault()}
//               className="absolute left-4 top-[35%] -translate-y-1/2 text-[#141414]">
//               {showPassword ? (<AiOutlineEye className="text-[24px]" />) : (<AiOutlineEyeInvisible className="text-[24px]" />)}
//             </button>

//             <div className="flex items-center justify-between w-full h-[20px] -mt-1">
//               <button
//                 type="button"
//                 onClick={() => navigate("/forgot-password")}
//                 className="text-[14px] font-rubik text-[#141414] hover:cursor-pointer ml-2"
//               >שכחתי את הסיסמא שלי</button>

//               {errors.password && (<p className="text-[14px] font-rubik text-[#C7111C] mr-2">{errors.password.message}</p>)}
//             </div>
//           </div>

//           <div className="flex flex-col gap-4 w-full mt-[24px]">
//             <div className="flex items-center justify-end gap-2">

//               <label className="flex flex-row-reverse items-center gap-2 cursor-pointer select-none">
//                 <div className={`w-[20px] h-[20px] flex items-center justify-center border ${rememberMe ? "bg-[#FF6500] border-[#FF6500]" : "bg-[#FFF7F2] border-[#FFF7F2]"} rounded-[2px] transition `}>
//                   {rememberMe && (<span className="text-white text-[18px] leading-none translate-y-[1.2px]">✓</span>)}
//                 </div>
//                 <span className="text-[18px] font-rubik text-[#141414]">זכור אותי</span>
//                 <input type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} className="hidden" />
//               </label>

//             </div>

//           </div>

//           <button
//             type="submit"
//             disabled={!isValid || isSubmitting || isLoading}
//             className={`w-full h-[54px] mt-[24px] rounded-[16px] ${!isValid || isSubmitting || isLoading ? "bg-[#737373] cursor-not-allowed opacity-100" : "bg-[#141414] hover:opacity-90 cursor-pointer"} text-white font-rubik font-bold text-[18px]`}>
//             {isSubmitting || isLoading ? "...מתחבר" : "התחבר"}
//           </button>


//           <div className="mt-[24px] w-full"><GoogleLoginButton /></div>

//           <div className="flex flex-row-reverse items-center justify-center gap-2 mt-[24px]">
//             <p className="text-[16px] font-rubik text-[#000]">?עדיין אין לך חשבון</p>
//             <button
//               type="button"
//               onClick={() => navigate("/register")}
//               className="text-[#FF6500] font-rubik text-[16px] hover:cursor-pointer"
//             >יצירת חשבון חדש</button>
//           </div>

//         </form>
//       </div>
//     </div>

//   );
// };

// export default Login;





// src/components/authentication/Login.jsx
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { AiOutlineEye, AiOutlineEyeInvisible, AiOutlineClose } from "react-icons/ai";
import { useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { setUser } from "../../redux/slices/userSlice";
import useMergeCartAfterLogin from "./useMergeCartAfterLogin.js";
import { useLoginMutation } from "../../redux/services/authApi";
import GoogleLoginButton from "./GoogleLoginButton";
import AuthHeader from "./AuthHeader.jsx";

const schema = z.object({
  email: z.string().nonempty("נדרש להכניס כתובת אימייל").email("נא הזן כתובת אימייל תקינה"),
  password: z.string().nonempty("נדרש להזין סיסמא").min(6, "אורך מינימלי 6 תווים"),
});

const Login = () => {
  const [login, { isLoading }] = useLoginMutation();
  const isMobile = useSelector((state) => state.ui.isMobile);
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const mergeCartAfterLogin = useMergeCartAfterLogin();

  const [showPassword, setShowPassword] = useState(false);
  const from = location.state?.from?.pathname || "/";
  const [isEmailFocused, setIsEmailFocused] = useState(false);
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);
  const [formError, setFormError] = useState("");
  const [rememberMe, setRememberMe] = useState(true);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting, isValid },
  } = useForm({ resolver: zodResolver(schema), mode: "onChange" });

  const onSubmit = async (data) => {
    try {
      const res = await login(data).unwrap();
      dispatch(setUser(res.user));
      await mergeCartAfterLogin(res.user._id);
      reset();
      navigate(from, { replace: true });
    } catch (err) {
      if (err?.status === 429) {
        setFormError("יותר מדי ניסיונות. נסה שוב מאוחר יותר.");
        return;
      }
      if (err?.status === 401) {
        setFormError("שם המשתמש או הסיסמה אינם נכונים");
        return;
      }
      setFormError("אירעה שגיאה בלתי צפויה. נסה שוב מאוחר יותר");
    }
  };

  return (
    <div className="flex min-h-screen">
      {!isMobile && (
        <div
          className="w-1/2 bg-cover bg-center"
          style={{ backgroundImage: "url('/auth.jpg')" }}
        />
      )}

      <div className={`flex w-full ${!isMobile ? "md:w-1/2" : "w-full"} flex-col relative bg-white`}>
        <AuthHeader />

        <form
          onSubmit={handleSubmit(onSubmit)}
          noValidate
          className={`flex-1 flex flex-col items-center justify-start px-[24px] ${
            !isMobile ? "md:px-[24%]" : ""
          }`}
        >
          {formError && (
            <div className="w-full max-w-[600px] mt-[64px]">
              <div
                id="error-box"
                className="flex items-center gap-2 w-full p-4 rounded-[12px] bg-[#FFF2F2]"
                style={{ direction: "rtl" }}
              >
                <button
                  type="button"
                  onClick={() => setFormError("")}
                  className="w-6 h-6 flex items-center justify-center text-[#141414]"
                >
                  <AiOutlineClose className="w-6 h-6" />
                </button>
                <p className="text-[#141414] font-rubik text-[14px] leading-[120%] tracking-[-0.154px] flex-1 mr-2">
                  {formError}
                </p>
              </div>
            </div>
          )}

          <h2
            className={`text-[24px] font-rubik font-semibold leading-[120%] tracking-[-0.264px] text-center text-black ${
              formError ? "mt-[48px]" : "mt-[64px]"
            }`}
          >
            התחברות
          </h2>

          {/* אימייל */}
          <div className="flex flex-col items-end gap-2 w-full relative mt-[24px]">
            <label
              htmlFor="email"
              className={`absolute right-3 -top-3 px-2 text-[16px] font-rubik text-[#141414] ${
                isEmailFocused ? "bg-gradient-to-b from-white from-40% to-[#FFF7F2] to-60%" : "bg-white"
              }`}
            >
              אימייל
            </label>

            <input
              id="email"
              type="email"
              {...register("email")}
              onFocus={() => {
                setIsEmailFocused(true);
                setFormError("");
              }}
              onBlur={() => setIsEmailFocused(false)}
              className={`w-full h-[59px] px-4 text-right font-rubik rounded-[12px] border ${
                errors.email ? "border-[#C7111C]" : isEmailFocused ? "border-black" : "border-[#EDEDED]"
              } ${isEmailFocused ? "bg-[#FFF7F2]" : "bg-white"} focus:outline-none focus:ring-0`}
            />

            <div className="h-[20px] -mt-1 text-right">
              {errors.email && (
                <p className="text-[14px] font-rubik text-[#C7111C] mr-2">{errors.email.message}</p>
              )}
            </div>
          </div>

          {/* סיסמא */}
          <div className="flex flex-col items-end gap-2 w-full relative mt-[24px]">
            <label
              htmlFor="password"
              className={`absolute right-3 -top-3 px-2 text-[16px] font-rubik text-[#141414] ${
                isPasswordFocused ? "bg-gradient-to-b from-white from-40% to-[#FFF7F2] to-60%" : "bg-white"
              }`}
            >
              סיסמא
            </label>

            <input
              id="password"
              type={showPassword ? "text" : "password"}
              {...register("password")}
              onFocus={() => {
                setIsPasswordFocused(true);
                setFormError("");
              }}
              onBlur={() => setIsPasswordFocused(false)}
              className={`w-full h-[59px] pr-4 pl-10 text-right font-rubik rounded-[12px] border ${
                errors.password ? "border-[#C7111C]" : isPasswordFocused ? "border-black" : "border-[#EDEDED]"
              } ${isPasswordFocused ? "bg-[#FFF7F2]" : "bg-white"} focus:outline-none focus:ring-0`}
            />

            <button
              type="button"
              onClick={() => {
                setShowPassword((prev) => !prev);
                setIsPasswordFocused(true);
              }}
              onMouseDown={(e) => e.preventDefault()}
              className="absolute left-4 top-[35%] -translate-y-1/2 text-[#141414]"
              aria-label="הצגת סיסמא"
            >
              {showPassword ? <AiOutlineEye className="text-[24px]" /> : <AiOutlineEyeInvisible className="text-[24px]" />}
            </button>

            <div className="flex items-center justify-between w-full h-[20px] -mt-1">
              <button
                type="button"
                onClick={() => navigate("/forgot-password")}
                className="text-[14px] font-rubik text-[#141414] hover:cursor-pointer ml-2"
              >
                שכחתי את הסיסמא שלי
              </button>

              {errors.password && (
                <p className="text-[14px] font-rubik text-[#C7111C] mr-2">{errors.password.message}</p>
              )}
            </div>
          </div>

          {/* זכור אותי */}
          <div className="flex flex-col gap-4 w-full mt-[24px]">
            <div className="flex items-center justify-end gap-2">
              <label className="flex flex-row-reverse items-center gap-2 cursor-pointer select-none">
                <div
                  className={`w-[20px] h-[20px] flex items-center justify-center border ${
                    rememberMe ? "bg-[#FF6500] border-[#FF6500]" : "bg-[#FFF7F2] border-[#FFF7F2]"
                  } rounded-[2px] transition`}
                >
                  {rememberMe && <span className="text-white text-[18px] leading-none translate-y-[1.2px]">✓</span>}
                </div>
                <span className="text-[18px] font-rubik text-[#141414]">זכור אותי</span>
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* כפתור שליחה */}
          <button
            type="submit"
            disabled={!isValid || isSubmitting || isLoading}
            className={`w-full h-[54px] mt-[24px] rounded-[16px] ${
              !isValid || isSubmitting || isLoading
                ? "bg-[#737373] cursor-not-allowed opacity-100"
                : "bg-[#141414] hover:opacity-90 cursor-pointer"
            } text-white font-rubik font-bold text-[18px]`}
          >
            {isSubmitting || isLoading ? "...מתחבר" : "התחבר"}
          </button>

          {/* Google */}
          <div className="mt-[24px] w-full">
            <GoogleLoginButton />
          </div>

          {/* לינק להרשמה */}
          <div className="flex flex-row-reverse items-center justify-center gap-2 mt-[24px]">
            <p className="text-[16px] font-rubik text-[#000]">?עדיין אין לך חשבון</p>
            <button
              type="button"
              onClick={() => navigate("/register")}
              className="text-[#FF6500] font-rubik text-[16px] hover:cursor-pointer"
            >
              יצירת חשבון חדש
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
