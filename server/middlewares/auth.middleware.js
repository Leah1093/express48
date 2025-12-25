import jwt from "jsonwebtoken";
import { cookieNames } from "../utils/cookies.js";

export function authMiddleware(req, res, next) {
  const token = req.cookies?.[cookieNames.access];

  if (!token) {
    return res.status(401).json({ error: "Missing authentication token" });
  }

  try {
    // const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
        const decoded = verifyAccessToken(token);
        const userId = decoded.sub;

    req.user =  { ...decoded, userId, _id: userId }
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}
