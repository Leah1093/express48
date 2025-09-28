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
