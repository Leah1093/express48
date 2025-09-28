import multer from "multer";
import path from "path";
import fs from "fs";

// יצירת תיקייה אם לא קיימת
const uploadDir = path.join(process.cwd(), "uploads/icons");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// הגדרה של אחסון
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const uniqueName = Date.now() + "-" + Math.round(Math.random() * 1e9) + ext;
    cb(null, uniqueName);
  },
});

// סינון קבצים – רק תמונות
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("ניתן להעלות רק קבצי תמונה"), false);
  }
};

export const upload = multer({ storage, fileFilter });
