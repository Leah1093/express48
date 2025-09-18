// controllers/entrance.controller.js
import { EntranceService } from "../service/entrance.service.js";
import { registerSchema } from "../validations/registerSchema.js";
import { loginSchema } from "../validations/loginSchema.js";
import { loginFlow, refreshFlow, logoutFlow } from "../service/auth.service.js";
import { User } from "../models/user.js";
import { cookieNames } from "../utils/cookies.js";

export default class EntranceController {
  async login(req, res, next) {
    try {
      const { email, password } = loginSchema.parse(req.body);
      const entranceService = new EntranceService();
      const { user, sellerId, storeId } = await entranceService.verifyCredentials(email, password);//בודק אם משתמש קיים ואם פרטים נכונים

      const ua = req.get("user-agent");//זיהוי דפדפן
      const ipHash = req.ip; // אם תוסיפי hash אמיתי, החליפי כאן ל-hashIp(req.ip)
      await loginFlow({ res, user: { ...user.toObject(), sellerId, storeId }, userAgent: ua, ipHash });//יצירת טוקן וקוקיס

      res.status(200).json({
        success: true,
        message: "התחברת בהצלחה",
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          phone: user.phone,
          role: user.role,
          roles: user.roles || [],
          sellerId,
        },
      });
    } catch (err) {
      if (err.name === "ZodError") {
        return res
          .status(400)
          .json({ success: false, message: "ולידציה נכשלה", errors: err.errors });
      }

      if (err.message === "INVALID_CREDENTIALS") {
        return res
          .status(401)
          .json({ success: false, message: "שם המשתמש או הסיסמה אינם נכונים" });
      }
      next(err);
    }
  }

  async register(req, res, next) {
    try {
      const { username, email, phone, password } = registerSchema.parse(req.body);
      const finalUsername = username && username.trim() !== "" ? username : email.split("@")[0];

      const entranceService = new EntranceService();
      const { user } = await entranceService.registerUser({ username: finalUsername, email, phone, password });

      const ua = req.get("user-agent");
      const ipHash = req.ip;
      await loginFlow({
        res, user: {
          ...user.toObject(),
          role: user.role,
          roles: user.roles || [],
          sellerId: null,
          storeId: null,
        }, userAgent: ua, ipHash
      });

      res.status(201).json({
        success: true,
        message: "נרשמת בהצלחה",
        data: {
          id: user._id,
          username: user.username,
          email: user.email,
          phone: user.phone,
          role: "user",
          roles: [],
        },
      });
    } catch (err) {
      console.error("Zod error:", err);
      if (err.name === "ZodError") {
        return res.status(400).json({ success: false, message: "ולידציה נכשלה", errors: err.errors });
      }
      next(err);
    }
  }
  
  //לבדוק לגבי זה אם צריך בדיוק ואיך לעשות
  async getCurrentUser(req, res, next) {
    try {
      const userId = req.auth?.sub;
      //לבדוק אם צריך פה ולא מספיק במידלוואר
      if (!userId) return res.status(401).json({ error: "לא מחובר" });

      const entranceService = new EntranceService();
      const user = await entranceService.getUserById(userId);
      if (!user) return res.status(404).json({ error: "משתמש לא נמצא" });

      res.status(200).json({ success: true, user });
    } catch (err) {
      next(err);
    }
  }

  async refresh(req, res) {
    try {
      const { session } = await refreshFlow({ req, res });
      //להעביר לסרבר
      const user = await User.findById(session.userId).select("roles role sellerId storeId");
      if (!user) return res.status(401).json({ error: "User not found" });
      return res.json({ ok: true });
    } catch {
      return res.status(401).json({ error: "Refresh failed" });
    }
  }
  //בדיקה
  async logout(req, res) {
    try {
      let sid = req.auth?.sid;
      if (!sid) {
        const token = req.cookies?.[cookieNames.refresh];
        if (token) {
          const [sessionId] = token.split(".");
          sid = sessionId || undefined;
        }
      }
      await logoutFlow({ res, sessionId: sid });
      res.status(200).json({ message: "התנתקת בהצלחה" });
    } catch {
      res.status(500).json({ message: "שגיאה בהתנתקות" });
    }
  }
}
