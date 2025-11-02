import { PasswordService } from "../service/pwd.service.js";
import { CustomError } from "../utils/CustomError.js";

export default class PasswordController {
  async changePassword(req, res, next) {
    try {
      const { currentPassword, newPassword } = req.body || {};
      const userId = req?.user?.userId;

      if (!currentPassword || !newPassword) {
        throw new CustomError("יש להזין סיסמה נוכחית וחדשה", 400);
      }
      if (!userId) {
        throw new CustomError("משתמש לא מזוהה", 401);
      }

      const passwordService = new PasswordService();
      await passwordService.changePassword(userId, currentPassword, newPassword);

      return res.status(200).json({ status: 200, message: "הסיסמה עודכנה בהצלחה" });
    } catch (err) {
      next(err);
    }
  }

  async forgotPassword(req, res, next) {
    try {
      const { email } = req.body || {};
      if (!email) {
        throw new CustomError("נא להזין אימייל", 400);
      }

      const passwordService = new PasswordService();
      await passwordService.requestPasswordReset(email);

      return res
        .status(200)
        .json({ status: 200, message: "אם המשתמש קיים, נשלח אליו מייל לאיפוס סיסמה" });
    } catch (err) {
      next(err);
    }
  }

  async resetPassword(req, res, next) {
    try {
      const { token, newPassword } = req.body || {};
      if (!token || !newPassword) {
        throw new CustomError("נא להזין טוקן וסיסמה חדשה", 400);
      }

      const passwordService = new PasswordService();
      await passwordService.resetPassword(token, newPassword);

      return res.status(200).json({ status: 200, message: "הסיסמה אופסה בהצלחה" });
    } catch (err) {
      next(err);
    }
  }
}
