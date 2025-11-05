import { useGoogleLogin } from "@react-oauth/google";

import toast from "react-hot-toast";

import { useDispatch } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import { setUser } from "../../redux/slices/userSlice";
import { useGoogleLoginMutation } from "../../redux/services/authApi";
import useMergeCartAfterLogin from "./useMergeCartAfterLogin.js";

function GoogleLoginButton({ text = "Google המשך עם" }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [googleLogin] = useGoogleLoginMutation();
  const mergeCartAfterLogin = useMergeCartAfterLogin();

  const login = useGoogleLogin({
    flow: "auth-code",
    scope: "openid email profile",
    ux_mode: "popup",
    onSuccess: async ({ code }) => {
      try {
        const res = await googleLogin({ code }).unwrap();
        dispatch(setUser(res.user));
        await mergeCartAfterLogin(res.user.id);

        toast.success("התחברת בהצלחה דרך Google");
        const from = location.state?.from;
        navigate(from === "/checkout" ? "/cart" : "/");
      } catch (err) {
        console.error("שגיאה בהתחברות עם Google:", err);
        toast.error("שגיאה בהתחברות עם Google");
      }
    },
    onError: () => toast.error("ההתחברות נכשלה"),
  });

  return (
    <button
      type="button"
      onClick={() => login()}
      className="w-full h-[54px] rounded-[16px] border-2 border-[#EDEDED]
                 bg-white text-[#141414] font-rubik font-normal text-[16px]
                 flex items-center justify-center gap-3 hover:bg-[#f9f9f9] transition"
    >
      <img
        src="https://www.svgrepo.com/show/355037/google.svg"
        alt="Google"
        className="w-6 h-6"
      />
      <span>{text}</span>
    </button>
  );
}

export default GoogleLoginButton;