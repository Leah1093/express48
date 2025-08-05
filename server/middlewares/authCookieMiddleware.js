import jwt from "jsonwebtoken";

export function authCookieMiddleware(req, res, next) {
  const token = req.cookies.token;
console.log("hi coo")
  if (!token) {
    return res.status(401).json({ error: "Missing authentication token" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { id: decoded.userId };
    console.log("Decoded token:", decoded);

    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}



