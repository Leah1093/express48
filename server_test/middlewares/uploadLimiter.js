import rateLimit from "express-rate-limit";

export const uploadLimiter = rateLimit({
  windowMs: 60 * 1000, // חלון זמן: דקה
  max: 10, // מקסימום בקשות בחלון
  message: { error: "Too many upload requests, please try again later." },
});
