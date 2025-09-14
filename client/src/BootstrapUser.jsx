// src/BootstrapUser.jsx
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { api } from "./lib/axios";
import { setUser, clearUser } from "./redux/slices/userSlice";
import { selectIsInitialized } from "./redux/slices/userSelectors";

export default function BootstrapUser({ children }) {
  const dispatch = useDispatch();
  const initialized = useSelector(selectIsInitialized);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const { data } = await api.get("/auth/whoami"); // מצפה { user }
        if (!alive) return;
        dispatch(setUser(data?.user || null));
      } catch {
        if (!alive) return;
        dispatch(clearUser());
      }
    })();
    return () => { alive = false; };
  }, [dispatch]);

  if (!initialized) return <div>טוען...</div>;
  return children;
}
