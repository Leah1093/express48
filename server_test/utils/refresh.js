// utils/refresh.js
import crypto from "crypto";
import bcrypt from "bcryptjs";

//יוצר Refresh Token חדש
export function buildRefreshToken(sessionId) {
  const secret = crypto.randomBytes(48).toString("base64url");
  return `${sessionId}.${secret}`;
}

//מפרק את ה־Refresh Token ל־2 החלקים: sessionId ו־secret
export function splitRefreshToken(token) {
  const i = token.indexOf(".");
  if (i <= 0) throw new Error("Malformed refresh token");
  return { sessionId: token.slice(0, i), secret: token.slice(i + 1) };
}

//לוקח את ה־secret ושומר אותו במסד נתונים בצורה מוצפנת
export async function hashRefreshSecret(secret) {
  const salt = await bcrypt.genSalt(12);
  return bcrypt.hash(secret, salt);
}

//בודק אם ה־secret מהטוקן שנשלח ע"י המשתמש תואם להאש שמור במסד
export async function compareRefreshSecret(secret, hash) {
  return bcrypt.compare(secret, hash);
}
