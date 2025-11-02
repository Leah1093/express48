import * as bcrypt from "bcrypt";
import * as crypto from "crypto";
import { User } from "../models/user.js";
import { Password } from "../models/password.js";
import { PasswordResetToken } from "../models/passwordResetToken.js";
import { userQueries } from "../mongoQueries/user.queries.js";
import { sendResetEmail } from "../utils/email/sendResetEmail.js";
import { sendPasswordChangedEmail } from "../utils/email/sendPasswordChangedEmail.js";
import { CustomError } from "../utils/CustomError.js";
import dotenv from "dotenv";

dotenv.config();

export class PasswordService {
  async changePassword(userId, currentPassword, newPassword) {
    const passwordRecord = await Password.findOne({ userId });
    if (!passwordRecord) {
      throw new CustomError("סיסמה לא קיימת עבור המשתמש", 404);
    }

    const isMatch = await bcrypt.compare(currentPassword, passwordRecord.password);
    if (!isMatch) {
      throw new CustomError("הסיסמה הנוכחית שגויה", 401);
    }

    const isSameAsCurrent = await bcrypt.compare(newPassword, passwordRecord.password);
    if (isSameAsCurrent) {
      throw new CustomError("הסיסמה החדשה חייבת להיות שונה מהסיסמה הנוכחית", 400);
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    passwordRecord.password = hashedNewPassword;
    await passwordRecord.save();

    try {
      await sendPasswordChangedEmail(userId);
    } catch (err) {
      console.warn("⚠️ sendPasswordChangedEmail failed:", err.message);
    }

    return { success: true, message: "Password changed successfully" };
  }

  async requestPasswordReset(email) {
    const user = await User.findOne(userQueries.findByEmail(email));
    if (!user) {
      throw new CustomError("משתמש לא נמצא", 404);
    }

    const rawToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto.createHash("sha256").update(rawToken).digest("hex");
    const expiresAt = new Date(Date.now() + 1000 * 60 * 15); // 15 דקות

    await PasswordResetToken.create({
      userId: user._id,
      token: hashedToken,
      expires: expiresAt,
    });

    const resetLink = `${process.env.FRONTEND_URL}/reset-password/${rawToken}`;

    try {
      await sendResetEmail(user.email, resetLink);
    } catch (err) {
      console.warn("⚠️ sendResetEmail failed:", err.message);
    }

    return { success: true, message: "Reset link sent successfully" };
  }

  async resetPassword(token, newPassword) {
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
    const tokenRecord = await PasswordResetToken.findOne({ token: hashedToken });

    if (!tokenRecord || tokenRecord.expires < new Date()) {
      throw new CustomError("הקישור לא תקף או שפג תוקפו", 400);
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    await Password.findOneAndUpdate(
      { userId: tokenRecord.userId },
      { password: hashedNewPassword },
      { new: true }
    );

    await PasswordResetToken.deleteMany({ userId: tokenRecord.userId });

    try {
      await sendPasswordChangedEmail(tokenRecord.userId);
    } catch (err) {
      console.warn("⚠️ sendPasswordChangedEmail failed:", err.message);
    }

    return { success: true, message: "Password reset successfully" };
  }
}
