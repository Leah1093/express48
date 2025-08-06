
import { OAuth2Client } from "google-auth-library";
import { EntranceService } from "../service/entranceService.js";

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

      const user = await entranceService.findOrCreateGoogleUser({ email, name });

      const jwtToken = entranceService.generateToken(user._id);

      res.cookie("token", jwtToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 3600000, // 1 hour
      });

      res.status(200).json({
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          phone: user.phone,
        },
      });
    } catch (err) {
      next(err);
    }
  }
}
