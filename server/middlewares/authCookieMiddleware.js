import jwt from "jsonwebtoken";

export function authCookieMiddleware(req, res, next) {
  const token = req.cookies.token;
console.log("hi coo")
  if (!token) {
    return res.status(401).json({ error: "Missing authentication token" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { userId: decoded.userId };
    console.log("Decoded token:", decoded);

    next();
  } catch (err) {
    return res.status(403).json({ error: "Invalid or expired token" });
  }
}



