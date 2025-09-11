// controllers/googleAuth.controller.js
import { OAuth2Client } from "google-auth-library";
import { EntranceService } from "../service/entrance.service.js";
import { loginFlow } from "../service/auth.service.js";

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export default class GoogleAuthController {
  async googleLogin(req, res, next) {
    try {
      const { token } = req.body; // שימי לב לשם השדה מהפרונט
      if (!token) return res.status(400).json({ message: "Missing idToken" });

      const ticket = await client.verifyIdToken({
        idToken: token,
        audience: process.env.GOOGLE_CLIENT_ID,
      });

      const payload = ticket.getPayload();
      const email = payload.email;
      const name = payload.name || email?.split("@")[0];

      const entranceService = new EntranceService();
      const { user, sellerId, storeId } = await entranceService.findOrCreateGoogleUser({ email, name, });

      const ua = req.get("user-agent");
      const ipHash = req.ip; // אם הטמעת hashIp – השתמשי בו כאן
      await loginFlow({ res, user: { ...user.toObject(), sellerId, storeId }, userAgent: ua, ipHash });

      return res.status(200).json({
        success: true,
        message: "Google login success",
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          phone: user.phone || "",
          role: user.role,
          roles: user.roles || [],
          sellerId,
        },
      });
    } catch (err) {
      return next(err);
    }
  }
}
