import { GoogleLogin } from '@react-oauth/google';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useDispatch } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import { setUser } from "../../redux/slices/userSlice";
import useRedirectAfterLogin from "./RedirectAfterLogin";
import useMergeCartAfterLogin from "./useMergeCartAfterLogin.js";


function GoogleLoginButton() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
   const redirectAfterLogin = useRedirectAfterLogin();
      const mergeCartAfterLogin = useMergeCartAfterLogin();

  const handleSuccess = async (credentialResponse) => {
    try {
      const res = await axios.post(
        'http://localhost:8080/auth/google',
        { token: credentialResponse.credential },
        { withCredentials: true }
      );
      dispatch(setUser(res.data.user));
         await mergeCartAfterLogin(res.data.user._id);
      toast.success("התחברת בהצלחה דרך Google");
      // אחרי login מוצלח
     
      if (location.state?.from === "/checkout") {
        navigate("/cart");
      } else {
        navigate("/");
      }

    } catch (err) {
      toast.error("שגיאה בהתחברות עם Google");
      console.error(err);
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
