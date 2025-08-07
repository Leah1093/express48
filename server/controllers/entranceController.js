import { EntranceService } from '../service/entranceService.js';
import { registerSchema } from '../validations/registerSchema.js';
import { loginSchema } from "../validations/loginSchema.js";

import 'dotenv/config'

export default class EntranceController {

  async login(req, res, next) {
    try {
      const entranceService = new EntranceService();

      // ✨ ולידציה עם zod
      const validatedData = loginSchema.parse(req.body);
      const { email, password } = validatedData;

      const result = await entranceService.login(email, password);

      res.cookie("token", result.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "Lax",
        maxAge: 1000 * 60 * 60,
      });

      res.status(200).json({
        success: true,
        message: "התחברת בהצלחה",
        user: result.user, // או data: result.user אם את רוצה לשמור אחידות
      });
    } catch (err) {
      if (err.name === "ZodError") {
        return res.status(400).json({
          success: false,
          message: "ולידציה נכשלה",
          errors: err.errors,
        });
      }

      next(err);
    }
  }

  async register(req, res, next) {
    console.log("EntranceController 📝 register");

    try {
      // 1. ולידציה עם zod
      const validatedData = registerSchema.parse(req.body);

      // 2. destructure (כדי לעבוד עם אותו קוד שהיה לך)
      const { username, email, phone, password } = validatedData;

      // 3. המשך רגיל
      const entranceService = new EntranceService();
      const result = await entranceService.registerUser({ username, email, phone, password });

      res.cookie("token", result.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "Strict",
        maxAge: 1000 * 60 * 60 * 24,
      });

      res.status(201).json({
        success: true,
        message: "נרשמת בהצלחה",
        data: result.user,
      });
    } catch (err) {
      // 4. טיפול בשגיאה של Zod (במידה ויש)
      if (err.name === "ZodError") {
        return res.status(400).json({
          success: false,
          message: "ולידציה נכשלה",
          errors: err.errors,
        });
      }

      next(err); // שגיאות אחרות
    }
  }


  async getCurrentUser(req, res, next) {
    console.log("getCurrentUser me")
    try {
      const userId = req.user.userId;
      const entranceService = new EntranceService();
      const user = await entranceService.getUserById(userId);

      if (!user) {
        return res.status(404).json({ error: "משתמש לא נמצא" });
      }
    console.log("getCurrentUser")

      res.status(200).json({
        success: true,
        user,
      });
    } catch (err) {
      next(err);
    }
  }



  async logout(req, res) {
    try {
      res.clearCookie("token", {
        httpOnly: true,
        sameSite: "None",
        secure: true,
      });

      res.status(200).json({ message: "התנתקת בהצלחה" });
    } catch (err) {
      console.error("Logout error:", err);
      res.status(500).json({ message: "שגיאה בהתנתקות" });
    }
  };
}
