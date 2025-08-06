import { User } from '../models/user.js';
// import { UserPassword } from '../models/userPassword.js';
import { Password } from '../models/password.js';
import { userQueries } from '../mongoQueries/userQueries.js';
import { PasswordResetToken } from '../models/passwordResetToken.js';
// import { sendResetEmail } from "../utils/sendEmail.js";
import { sendResetEmail } from '../utils/email/sendResetEmail.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { sendPasswordChangedEmail } from '../utils/email/sendPasswordChangedEmail.js';
import dotenv from 'dotenv';
dotenv.config();
export class PasswordService {

    async changePassword(userId, currentPassword, newPassword) {
        const passwordRecord = await Password.findOne({ userId });
        if (!passwordRecord) {
            const error = new Error("סיסמה לא קיימת עבור המשתמש");
            error.statusCode = 404;
            throw error;
        }

        const isMatch = await bcrypt.compare(currentPassword, passwordRecord.password);
        if (!isMatch) {
            const error = new Error("הסיסמה הנוכחית שגויה");
            error.statusCode = 401;
            throw error;
        }
        const isSameAsCurrent = await bcrypt.compare(newPassword, passwordRecord.password);
        if (isSameAsCurrent) {
            const error = new Error("הסיסמה החדשה חייבת להיות שונה מהסיסמה הנוכחית");
            error.statusCode = 400;
            throw error;
        }
        const hashedNewPassword = await bcrypt.hash(newPassword, 10);
        passwordRecord.password = hashedNewPassword;
        await passwordRecord.save();
        await sendPasswordChangedEmail(userId);
    }


    async requestPasswordReset(email) {

        const user = await User.findOne(userQueries.findByEmail(email));
        if (!user) {
            const error = new Error("משתמש לא נמצא");
            error.statusCode = 404;
            throw error;
        }

        // const token = crypto.randomBytes(32).toString("hex");
        // const expiresAt = new Date(Date.now() + 1000 * 60 * 15); // 15 דקות תוקף
        // await PasswordResetToken.create({ userId: user._id, token, expires: expiresAt });
        // const resetLink = `${process.env.FRONTEND_URL}/reset-password/${token}`;

        const rawToken = crypto.randomBytes(32).toString("hex");
        const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');
        const expiresAt = new Date(Date.now() + 1000 * 60 * 15); // 15 דקות
        await PasswordResetToken.create({ userId: user._id, token: hashedToken, expires: expiresAt });
        const resetLink = `${process.env.FRONTEND_URL}/reset-password/${rawToken}`;


        console.log("🔗 Reset link:", resetLink);

        await sendResetEmail(user.email, resetLink);

    }

    async resetPassword(token, newPassword) {
        // const tokenRecord = await PasswordResetToken.findOne({ token });

        const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

        const tokenRecord = await PasswordResetToken.findOne({ token: hashedToken });

        if (!tokenRecord || tokenRecord.expires < new Date()) {
            const error = new Error("הקישור לא תקף או שפג תוקפו");
            error.statusCode = 400;
            throw error;
        }

        const hashedNewPassword = await bcrypt.hash(newPassword, 10);
        await Password.findOneAndUpdate(
            { userId: tokenRecord.userId },
            { password: hashedNewPassword },
            { new: true }
        );
        await PasswordResetToken.deleteMany({ userId: tokenRecord.userId });

        console.log(`הסיסמה עודכנה עבור משתמש: ${tokenRecord.userId}`);
        await sendPasswordChangedEmail(tokenRecord.userId)
    }
}