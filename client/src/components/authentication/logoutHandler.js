import axios from "axios";
import { setUser } from "../../redux/slices/userSlice";
import toast from "react-hot-toast";

/**
 * קריאה לשרת להתנתקות
 */
const logoutService = async () => {
  try {
    await axios.post("http://localhost:8080/entrance/logout", {}, {
      withCredentials: true,
    });
    return { success: true };
  } catch (error) {
    console.error("Logout failed:", error);
    return { success: false, error };
  }
};

/**
 * טיפול מלא בהתנתקות – קריאה לשרת, עדכון סטייט, טוסט, ניווט
 * @param {Function} dispatch - Redux dispatch
 * @param {Function} navigate - useNavigate מ־react-router
 */
export const handleLogout = async (dispatch, navigate) => {
  const result = await logoutService();

  if (result.success) {
    dispatch(setUser(null));
    toast.success("התנתקת בהצלחה");
    navigate("/");
  } else {
    toast.error("שגיאה בהתנתקות");
  }
};
