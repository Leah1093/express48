
import { OAuth2Client } from "google-auth-library";
import { EntranceService } from "../service/entrance.service.js";

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export default class GoogleAuthController {
  async googleLogin(req, res, next) {
    const entranceService = new EntranceService();

    try {
      const { token } = req.body;
      if (!token) return res.status(400).json({ message: "Missing token" });

      const ticket = await client.verifyIdToken({
        idToken: token,
        audience: process.env.GOOGLE_CLIENT_ID,
      });

      const { email, name } = ticket.getPayload();

      const result = await entranceService.findOrCreateGoogleUser({ email, name });
      res.cookie("token", result.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "Strict",
        maxAge: 1000 * 60 * 60 * 24,
      });

      res.status(200).json({
        user: result.user
      }); 
    } catch (err) {
      next(err);
    }
  }
}
