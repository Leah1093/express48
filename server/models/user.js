// models/user.js
import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
    unique: true
  },
  username: {
    type: String,
    required: true,
    trim: true,

  }, phone: {
    type: String,
    trim: true,
    default: "", // ⬅️ אופציונלי, ברירת מחדל למחרוזת ריקה
  }
}, { timestamps: true });

export const User = mongoose.model('User', userSchema);
