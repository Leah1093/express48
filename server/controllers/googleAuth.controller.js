// // controllers/googleAuth.controller.js
// import { OAuth2Client } from "google-auth-library";
// import { EntranceService } from "../service/entrance.service.js";
// import { loginFlow } from "../service/auth.service.js";

// const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// export default class GoogleAuthController {
//   async googleLogin(req, res, next) {
//     try {
//       const { token } = req.body; // שימי לב לשם השדה מהפרונט
//       if (!token) return res.status(400).json({ message: "Missing idToken" });

//       const ticket = await client.verifyIdToken({
//         idToken: token,
//         audience: process.env.GOOGLE_CLIENT_ID,
//       });

//       const payload = ticket.getPayload();
//       const email = payload.email;
//       const name = payload.name || email?.split("@")[0];

//       const entranceService = new EntranceService();
//       const { user, sellerId, storeId } = await entranceService.findOrCreateGoogleUser({ email, name, });

//       const ua = req.get("user-agent");
//       const ipHash = req.ip; // אם הטמעת hashIp – השתמשי בו כאן
//       await loginFlow({ res, user: { ...user.toObject(), sellerId, storeId }, userAgent: ua, ipHash });

//       return res.status(200).json({
//         success: true,
//         message: "Google login success",
//         user: {
//           id: user._id,
//           username: user.username,
//           email: user.email,
//           phone: user.phone || "",
//           role: user.role,
//           roles: user.roles || [],
//           sellerId,
//         },
//       });
//     } catch (err) {
//       return next(err);
//     }
//   }
// }




import { OAuth2Client } from "google-auth-library";
import { EntranceService } from "../services/entrance.service.js";
import { loginFlow } from "../services/auth.service.js";

const client = new OAuth2Client({
  clientId: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  redirectUri: "postmessage", // חשוב! תואם ל-auth-code flow
});

export default class GoogleAuthController {
  async googleLogin(req, res, next) {
    try {
      const { code } = req.body; // מגיע מהפרונט
      if (!code) return res.status(400).json({ message: "Missing authorization code" });

      // ממירים את ה־code לטוקנים
      const { tokens } = await client.getToken({ code });
      const idToken = tokens.id_token;
      if (!idToken) return res.status(401).json({ message: "No id_token returned from Google" });

      // מאמתים את ה־ID Token
      const ticket = await client.verifyIdToken({
        idToken,
        audience: process.env.GOOGLE_CLIENT_ID,
      });
      const payload = ticket.getPayload();

      const email = payload.email;
      const name = payload.name || email?.split("@")[0];
      const googleId = payload.sub;

      const entranceService = new EntranceService();
      const { user, sellerId, storeId } =
        await entranceService.findOrCreateGoogleUser({ email, name, googleId });

      // זיהוי דפדפן/IP
      const ua = req.get("user-agent");
      const ipHash = req.ip;
      await loginFlow({
        res,
        user: { ...user.toObject(), sellerId, storeId },
        userAgent: ua,
        ipHash,
      });

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
      console.error("Google login error:", err);
      return next(err);
    }
  }
}
