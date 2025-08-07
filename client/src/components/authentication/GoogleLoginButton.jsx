import { GoogleLogin } from '@react-oauth/google';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { setUser } from "../../redux/slices/userSlice";

function GoogleLoginButton() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleSuccess = async (credentialResponse) => {
    try {
      const res = await axios.post(
        'http://localhost:8080/auth/google',
        { token: credentialResponse.credential },
        { withCredentials: true }
      );
      dispatch(setUser(res.data.user));
      toast.success("התחברת בהצלחה דרך Google");
      navigate("/"); 
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
