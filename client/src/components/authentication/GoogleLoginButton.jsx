// client/src/components/authentication/GoogleLoginButton.jsx
import { GoogleLogin } from "@react-oauth/google";
import toast from "react-hot-toast";
import { useDispatch } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import { setUser } from "../../redux/slices/userSlice";
import { useGoogleLoginMutation } from "../../redux/services/authApi";
// עדכני את הנתיב לפי הפרויקט שלך
import useMergeCartAfterLogin from "./useMergeCartAfterLogin.js";

function GoogleLoginButton() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [googleLogin] = useGoogleLoginMutation();
  const mergeCartAfterLogin = useMergeCartAfterLogin();

  const handleSuccess = async (credentialResponse) => {
    try {
      const res = await googleLogin({
        token: credentialResponse.credential,
      }).unwrap();

      dispatch(setUser(res.user));
      console.log("11111", res.user.id)
      // מיזוג עגלת אורח → משתמש
      await mergeCartAfterLogin(res.user.id);

      toast.success("התחברת בהצלחה דרך Google");

      // אם הגיעה מה־checkout — חזרה לעגלה, אחרת לדף הבית
      const from = location.state?.from;
      navigate(from === "/checkout" ? "/cart" : "/");
    } catch (err) {
      console.error("שגיאה בהתחברות עם Google:", err);
      toast.error("שגיאה בהתחברות עם Google");
    }
  };

  return (
    <GoogleLogin
      onSuccess={handleSuccess}
      onError={() => toast.error("ההתחברות נכשלה")}
    />
  );
}

export default GoogleLoginButton;




