import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import { handleApiError } from "../../utils/handleApiError";
export default function ResetPasswordPage() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
console.log("vh")
    if (newPassword !== confirmPassword) {
      toast.error("הסיסמאות אינן תואמות");
      return;
    }
    try {
      setLoading(true);
      await axios.post("http://localhost:8080/password/reset-password", {
        token,
        newPassword,
      });
      toast.success("הסיסמה עודכנה בהצלחה");
      navigate("/login");
    }
    catch (err) {
      handleApiError(err, "נכשל עדכון הסיסמה");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-sm mx-auto mt-10 p-6 bg-white shadow rounded space-y-4"
    >
      <h2 className="text-2xl font-semibold text-center">איפוס סיסמה</h2>

      <input
        type="password"
        placeholder="סיסמה חדשה"
        className="w-full p-3 border rounded"
        value={newPassword}
        onChange={(e) => setNewPassword(e.target.value)}
      />

      <input
        type="password"
        placeholder="אימות סיסמה"
        className="w-full p-3 border rounded"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
      />

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50"
      >
        איפוס סיסמה
      </button>
    </form>
  );
}
