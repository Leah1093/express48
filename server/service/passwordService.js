import { User } from '../models/user.js';
// import { UserPassword } from '../models/userPassword.js';
import { Password } from '../models/password.js';
import { userQueries } from '../mongoQueries/userQueries.js';
// import { sendResetEmail } from "../utils/sendEmail.js";
import { sendResetEmail } from '../utils/email/sendResetEmail.js';
import { PasswordResetToken } from '../models/passwordResetToken.js';

import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();
export class PasswordService1 {



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

        const hashedNewPassword = await bcrypt.hash(newPassword, 10);
        passwordRecord.password = hashedNewPassword;
        await passwordRecord.save();
    }


    async requestPasswordReset(email) {

        console.log(" לפני 🎈")
                const resetLink1 = `https://yourfrontend.com/reset-password/`;
        console.log("אחרי 🎈🎈")

        await sendResetEmail(email, resetLink1);
        const user = await User.findOne(userQueries.findByEmail(email));
        if (!user) {
            const error = new Error("משתמש לא נמצא");
            error.statusCode = 404;
            throw error;
        }


        const token = crypto.randomBytes(32).toString("hex");
        const expiresAt = new Date(Date.now() + 1000 * 60 * 15); // 15 דקות תוקף

        await PasswordResetToken.create({ userId: user._id, token, expiresAt });

        // כאן שליחת מייל עם הקישור לדוגמה בלבד
        const resetLink = `https://yourfrontend.com/reset-password/${token}`;
        console.log("🔗 Reset link:", resetLink);
        // אפשר לשלב כאן nodemailer לשליחה בפועל
        await sendResetEmail(user.email, resetLink);

    }

    async resetPassword(token, newPassword) {
        const tokenRecord = await PasswordResetToken.findOne({ token });
        if (!tokenRecord || tokenRecord.expiresAt < new Date()) {
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

        await PasswordResetToken.deleteOne({ token });
    }
}