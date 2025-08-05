// models/passwordResetToken.js
import mongoose from 'mongoose';

const passwordResetTokenSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // יש לוודא שזה השם של המודל של המשתמשים שלך
    required: true
  },
  token: {
    type: String,
    required: true
  },
  expires: {
    type: Date,
    required: true
  }
}, { timestamps: true });

export const PasswordResetToken = mongoose.model('PasswordResetToken', passwordResetTokenSchema);
export const userQueries = {
  findByEmail: (email) => ({ email }),
};


// import mongoose from "mongoose";

// const resetTokenSchema = new mongoose.Schema({
//   userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
//   token: { type: String, required: true },
//   expiresAt: { type: Date, required: true },
// });

// export const ResetToken = mongoose.model("ResetToken", resetTokenSchema);


// // mongoQueries/userQueries.js
// export const userQueries = {
//   findByEmail: (email) => ({ email }),
// };