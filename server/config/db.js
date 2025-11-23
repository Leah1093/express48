import mongoose from "mongoose";

// מסתיר יוזר/סיסמה בלוג
const redact = (uri = "") => {
  try {
    const u = new URL(uri);
    if (u.password) u.password = "***";
    if (u.username) u.username = "***";
    return u.toString();
  } catch {
    return uri ? "[redacted]" : "(empty)";
  }
};

export async function connectDB() {
  // תומך בשני שמות של משתנה סביבה
  const uri = process.env.MONGODB_URI || process.env.MONGO_URI;
  if (!uri) {
    console.error("❌ Missing MONGODB_URI / MONGO_URI in .env");
    process.exit(1);
  }

  const options = {
    serverSelectionTimeoutMS: 10000, // 10s
    socketTimeoutMS: 20000,
    tls: true,          // נדרש ב-Atlas (גם עם SRV)
    retryWrites: true,
    w: "majority",
    family: 4,          // מעדיף IPv4 כדי לעקוף תקלות IPv6
  };

  const MAX_TRIES = 5;
  for (let attempt = 1; attempt <= MAX_TRIES; attempt++) {
    try {
      console.log(`🔌 MongoDB connecting (attempt ${attempt}/${MAX_TRIES}) to`, redact(uri));
      await mongoose.connect(uri, options);
      console.log("✅ MongoDB connected");
      return;
    } catch (err) {
      console.error(`❌ DB connection error (attempt ${attempt}):`, err.message);
      if (attempt === MAX_TRIES) {
        console.error("⛔ giving up after retries");
        process.exit(1);
      }
      // backoff לפני ניסיון נוסף
      await new Promise((r) => setTimeout(r, 2000 * attempt));
    }
  }
}
