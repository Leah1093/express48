import { useDispatch } from "react-redux";
import { setUser } from "../../redux/slices/userSlice";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useLogoutMutation, authApi } from "../../redux/services/authApi";

function LogoutButton() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [logout, { isLoading }] = useLogoutMutation();

  const handleLogout = async () => {
    try {
      await logout().unwrap();
      dispatch(setUser(null));
      dispatch(authApi.util.resetApiState());
      toast.success("התנתקת בהצלחה");
      navigate("/");
    } catch (error) {
      toast.error("שגיאה בהתנתקות");
      console.error(error);
    }
  };

  return (
    <button
      onClick={handleLogout}
      className="text-red-600 hover:underline"
    >
      התנתקות
    </button>
  );
}

export default LogoutButton;
