import { setUser } from "../../redux/slices/userSlice";
import { authApi } from "../../redux/services/authApi";
import toast from "react-hot-toast";

export const handleLogout = async (dispatch, navigate) => {
  try {
    await dispatch(authApi.endpoints.logout.initiate()).unwrap();
    dispatch(setUser(null));
    toast.success("התנתקת בהצלחה");
    navigate("/");
  } catch (err) {
    console.error("Logout failed:", err);
    toast.error("שגיאה בהתנתקות");
  }
};
