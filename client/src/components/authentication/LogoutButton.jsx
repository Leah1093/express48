import axios from "axios";
import { useDispatch } from "react-redux";
import { setUser } from "../../redux/slices/userSlice";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

function LogoutButton() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await axios.post("http://localhost:8080/entrance/logout", {}, {
        withCredentials: true
      });

      dispatch(setUser(null));
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
