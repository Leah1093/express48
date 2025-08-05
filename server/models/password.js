// models/password.js
import mongoose from "mongoose";

const passwordSchema = new mongoose.Schema({
  password: {
    type: String,
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // שם המודל של המשתמשים שלך
    required: true,
  }
}, { timestamps: true });

export const Password = mongoose.model("Password", passwordSchema);
// import mongoose from "mongoose";

// const userPasswordSchema = new mongoose.Schema({
//   userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
//   password: { type: String, required: true },
// });

// export const UserPassword = mongoose.model("UserPassword", userPasswordSchema);
