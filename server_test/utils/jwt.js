// utils/jwt.js
import jwt from "jsonwebtoken";

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET;
const ISS = process.env.JWT_ISSUER || "https://express48.co.il";
const AUD = process.env.JWT_AUDIENCE || "https://express48.co.il";
const ACCESS_TTL = process.env.ACCESS_TOKEN_TTL || "1m";

//יצירת טוקן
export function signAccessToken({ user, sessionId }) {
  const payload = {
    sub: String(user._id),
    sid: sessionId,
    role:user.role,
    roles: user.roles || [],
    ...(user.sellerId ? { sellerId: user.sellerId } : {}),
    ...(user.storeId ? { storeId: user.storeId } : {}),
  };

  return jwt.sign(payload, ACCESS_SECRET, {
    expiresIn: ACCESS_TTL,
    issuer: ISS,
    audience: AUD,
    algorithm: "HS256",
  });
}

//מבטיח שהטוקן שמתקבל בבקשות הוא אמיתי ולא שונה.
export function verifyAccessToken(token) {
  return jwt.verify(token, ACCESS_SECRET, {
    issuer: ISS,
    audience: AUD,
    algorithms: ["HS256"],
    clockTolerance: 5, 
  });
}
