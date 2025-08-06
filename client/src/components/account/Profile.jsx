import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSelector, useDispatch } from "react-redux";
import { setUser } from "../../redux/slices/userSlice";
import axios from "axios";
import toast from "react-hot-toast";
import { profileSchema, passwordSchema } from "../validations/profileSchema"; // ודאי שזה לא rofileSchema

export default function Profile() {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user.user);
  const [isEditing, setIsEditing] = useState(false);
  const [showModal, setShowModal] = useState(false);

  // טופס פרופיל
  const {
    register,
    handleSubmit,
    reset,
    clearErrors,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      username: "",
      email: "",
      phone: "",
    },
  });

  // טופס סיסמה
  const {
    register: registerPass,
    handleSubmit: handleSubmitPass,
    reset: resetPass,
    formState: { errors: errorsPass },
  } = useForm({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  useEffect(() => {
    if (user) {
      reset({
        username: user.username || "",
        email: user.email || "",
        phone: user.phone || "",
      });
    }
  }, [user, reset]);

  const onSave = async (data) => {
    if (!isEditing) return; // הגנה כפולה
    try {
      const res = await axios.put("http://localhost:8080/user/update-profile", data, {
        withCredentials: true,
      });
      dispatch(setUser(res.data.updatedUser));
      toast.success("הפרטים עודכנו בהצלחה");
      setIsEditing(false);
    } catch (err) {
      toast.error("שגיאה בעדכון הפרטים");
    }
  };

  const onChangePassword = async (data) => {
    try {
      await axios.post("http://localhost:8080/password/change-password", data, {
        withCredentials: true,
      });
      toast.success("הסיסמה עודכנה בהצלחה");
      resetPass();
      setShowModal(false);
    } catch (err) {
      toast.error(err.response?.data?.message || "שגיאה בעדכון הסיסמה");
    }
  };

  const handleEditToggle = () => {
    if (!user) {
      toast.error("לא ניתן לערוך כשאין משתמש מחובר");
      return;
    }
    setIsEditing(true);
  };

  const handleCancel = () => {
    if (!user) return;
    reset({
      username: user.username || "",
      email: user.email || "",
      phone: user.phone || "",
    });
    clearErrors();
    setIsEditing(false);
  };

  if (!user) return <p className="text-center mt-10">אין משתמש מחובר</p>;

  return (
    <div className="max-w-xl mx-auto p-4 text-right">
      <h2 className="text-2xl font-bold mb-6">פרטי חשבון</h2>

      <form onSubmit={handleSubmit(onSave)} className="space-y-4">
        <InputField label="שם משתמש" {...register("username")} readOnly={!isEditing} error={errors.username} />
        <InputField label='דוא"ל' {...register("email")} readOnly error={errors.email} />
        <InputField label="טלפון" {...register("phone")} readOnly={!isEditing} error={errors.phone} />


        {isEditing && (
          <div className="flex gap-4 mt-4">
            <button type="submit" className="btn-blue">שמור</button>
            <button type="button" className="btn-gray" onClick={handleCancel}>ביטול</button>
          </div>
        )}
      </form>

      {/* 🔽 כפתורים חיצוניים לטופס */}
      {!isEditing && (
        <div className="flex gap-4 mt-4">
          <button type="button" className="btn-green" onClick={handleEditToggle}>ערוך פרטים</button>
          <button type="button" className="btn-yellow" onClick={() => setShowModal(true)}>שינוי סיסמה</button>
        </div>
      )}
      {/* <div className="flex gap-4 mt-4">
        {isEditing ? (
          <>
            <button type="submit" className="btn-blue">שמור</button>
            <button type="button" className="btn-gray" onClick={handleCancel}>ביטול</button>
          </>
        ) : (
          <>
            <button type="button" className="btn-green" onClick={handleEditToggle}>ערוך פרטים</button>
            <button type="button" className="btn-yellow" onClick={() => setShowModal(true)}>שינוי סיסמה</button>
          </>
        )}
      </div> */}
      {/* שינוי סיסמה */}
      {showModal && (
        <PasswordModal
          register={registerPass}
          errors={errorsPass}
          onSubmit={handleSubmitPass(onChangePassword)}
          onClose={() => {
            setShowModal(false);
            resetPass();
          }}
        />
      )}
    </div>
  );
}

// 🔽 קומפוננטות עזר

function InputField({ label, error, readOnly, ...rest }) {
  return (
    <div>
      <label className="block mb-1">{label}</label>
      <input
        {...rest}
        readOnly={readOnly}
        className={`w-full p-2 border rounded ${readOnly ? "bg-gray-100" : ""}`}
      />
      {error && <p className="text-red-500 text-sm">{error.message}</p>}
    </div>
  );
}

function PasswordModal({ register, errors, onSubmit, onClose }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded shadow max-w-md w-full text-right">
        <h3 className="text-xl font-bold mb-4">שינוי סיסמה</h3>
        <form onSubmit={onSubmit} className="space-y-4">
          <InputField label="סיסמה נוכחית" {...register("currentPassword")} error={errors.currentPassword} />
          <InputField label="סיסמה חדשה" {...register("newPassword")} error={errors.newPassword} />
          <InputField label="אישור סיסמה חדשה" {...register("confirmPassword")} error={errors.confirmPassword} />

          <div className="flex gap-4 mt-4">
            <button type="submit" className="btn-blue">שמור סיסמה</button>
            <button type="button" className="btn-gray" onClick={onClose}>ביטול</button>
          </div>
        </form>
      </div>
    </div>
  );
}
