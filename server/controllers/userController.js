import { User } from "../models/user.js";

export const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id; // נלקח מתוך verifyToken
    const { username, phone } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        username,
        phone,
      },
      { new: true, runValidators: true }
    ).select("-password"); // לא להחזיר סיסמה

    res.status(200).json({ updatedUser });
  } catch (err) {
    console.error("Update profile error:", err);
    res.status(500).json({ message: "שגיאה בעדכון הפרופיל" });
  }
};
