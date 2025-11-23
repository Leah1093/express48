import 'dotenv/config'
import { PasswordService } from '../service/pwdService';

export default class PasswordController1 {

    async changePassword(req, res, next) {
        try {
            const { currentPassword, newPassword } = req.body;
            const userId = req.user.userId;

            if (!currentPassword || !newPassword) {
                const error = new Error("יש להזין סיסמה נוכחית וחדשה");
                error.statusCode = 400;
                throw error;
            }

            const passwordService = new PasswordService();
            await passwordService.changePassword(userId, currentPassword, newPassword);

            res.json({ message: "הסיסמה עודכנה בהצלחה" });
        } catch (err) {
            next(err);
        }
    }

    async forgotPassword(req, res, next) {
        try {
            const { email } = req.body;
            if (!email) {
                const error = new Error("נא להזין כתובת מייל");
                error.statusCode = 400;
                throw error;
            }

            const passwordService = new PasswordService();
            await passwordService.requestPasswordReset(email);

            res.json({ message: "אם המשתמש קיים, נשלח אליו מייל לאיפוס סיסמה" });
        } catch (err) {
            next(err);
        }
    }

    async resetPassword(req, res, next) {
        try {
            const { token, newPassword } = req.body;
            if (!token || !newPassword) {
                const error = new Error("נא להזין טוקן וסיסמה חדשה");
                error.statusCode = 400;
                throw error;
            }

            const passwordService = new PasswordService();
            await passwordService.resetPassword(token, newPassword);

            res.json({ message: "הסיסמה אופסה בהצלחה" });
        } catch (err) {
            next(err);
        }
    }

}