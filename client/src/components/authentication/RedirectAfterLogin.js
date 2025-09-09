// hooks/useRedirectAfterLogin.js
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { fetchAddresses } from "../../redux/thunks/addressThunks";

export default function useRedirectAfterLogin() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const redirectAfterLogin = async () => {
    try {
      const addresses = await dispatch(fetchAddresses()).unwrap();

      if (addresses.length > 0) {
        navigate("/payment");   // יש כתובת
      } else {
        navigate("/checkout");  // אין כתובת
      }
    } catch (err) {
      console.error("Error checking addresses:", err);
      navigate("/checkout"); // fallback
    }
  };

  return redirectAfterLogin;
}
