import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { setUser, clearUser } from "../redux/slices/userSlice";
import axios from "axios";

export default function AuthInit() {
  const dispatch = useDispatch();

  useEffect(() => {
    const checkUser = async () => {
      try {
        const res = await axios.get("http://localhost:8080/entrance/me", { withCredentials: true });
        dispatch(setUser(res.data.user));
      } catch (err) {
        dispatch(clearUser());
      }
    };

    checkUser();
  }, [dispatch]);

  return null; // קומפוננטת רקע שלא מציגה כלום
}
