import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { setUser } from "../../redux/slices/userSlice";
import axios from "axios";
import toast from "react-hot-toast";
export default function Profile() {

  const user = useSelector((state) => state.user.user);

  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username || "",
        email: user.email || "",
        phone: user.phone || "",
      });
    }
  }, [user]);

  const dispatch = useDispatch();
  const [isEditing, setIsEditing] = useState(false);
  const [showModal, setShowModal] = useState(false);


  const [formData, setFormData] = useState({
    username: user?.username || "",
    email: user?.email || "",
    phone: user?.phone || "",
  });
  console.log(formData)
  const [passwords, setPasswords] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSave = async () => {
    try {
      const res = await axios.put(
        `http://localhost:8080/entrance/update-profile`,
        formData,
        { withCredentials: true }
      );

      dispatch(setUser(res.data.updatedUser));
      toast.success("הפרטים עודכנו בהצלחה");
      setIsEditing(false);
    } catch (err) {
      toast.error("שגיאה בעדכון הפרטים");
      console.error("Profile update error:", err);
    }
  };

  const handleCancel = () => {
    setFormData({
      username: user.username,
      email: user.email,
      phone: user.phone || "",
    });
    setIsEditing(false);
  };

  const handlePasswordChange = (e) => {
    setPasswords({ ...passwords, [e.target.name]: e.target.value });
  };

  const handleSubmitPasswordChange = async (e) => {
    e.preventDefault();
    if (passwords.newPassword !== passwords.confirmPassword) {
      alert("הסיסמאות החדשות לא תואמות");
      return;
    }

    try {
      await axios.post(
        "http://localhost:8080/entrance/change-password",
        passwords,
        { withCredentials: true }
      );
      toast.success("הסיסמה עודכנה");
    } catch (err) {
      toast.error("שגיאה בעדכון הסיסמה");
    }

    setShowModal(false);
    setPasswords({ currentPassword: "", newPassword: "", confirmPassword: "" });
  };

  if (!user) return <p className="text-center mt-10">אין משתמש מחובר</p>;

  return (
    <div className="max-w-xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-6 text-right">פרטי חשבון</h2>

      <form className="space-y-4 text-right">
        <div>
          <label className="block text-sm font-medium mb-1">שם משתמש</label>
          <input
            type="text"
            name="username"
            value={formData.username}
            readOnly={!isEditing}
            onChange={handleChange}
            className={`w-full p-2 border rounded ${!isEditing ? "bg-gray-100 cursor-not-allowed" : ""
              }`}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">דוא"ל</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            readOnly
            className="w-full p-2 border rounded bg-gray-100 cursor-not-allowed"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">טלפון</label>
          <input
            type="text"
            name="phone"
            value={formData.phone}
            readOnly={!isEditing}
            onChange={handleChange}
            className={`w-full p-2 border rounded ${!isEditing ? "bg-gray-100 cursor-not-allowed" : ""
              }`}
          />
        </div>

        <div className="flex gap-4 justify-start mt-4">
          {isEditing ? (
            <>
              <button
                type="button"
                onClick={handleSave}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                שמור
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400"
              >
                ביטול
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
              >
                ערוך פרטים
              </button>
              <button
                type="button"
                onClick={() => setShowModal(true)}
                className="bg-yellow-600 text-white px-4 py-2 rounded hover:bg-yellow-700"
              >
                שינוי סיסמה
              </button>
            </>
          )}
        </div>
      </form>

      {/* שינוי סיסמה */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow max-w-md w-full text-right">
            <h3 className="text-xl font-bold mb-4">שינוי סיסמה</h3>
            <form onSubmit={handleSubmitPasswordChange} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">סיסמה נוכחית</label>
                <input
                  type="password"
                  name="currentPassword"
                  value={passwords.currentPassword}
                  onChange={handlePasswordChange}
                  required
                  className="w-full p-2 border rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">סיסמה חדשה</label>
                <input
                  type="password"
                  name="newPassword"
                  value={passwords.newPassword}
                  onChange={handlePasswordChange}
                  required
                  className="w-full p-2 border rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">אישור סיסמה חדשה</label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={passwords.confirmPassword}
                  onChange={handlePasswordChange}
                  required
                  className="w-full p-2 border rounded"
                />
              </div>
              <div className="flex gap-4 justify-start mt-4">
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                  שמור סיסמה
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400"
                >
                  ביטול
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
