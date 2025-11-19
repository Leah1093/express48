import multer from "multer";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // עד 10MB

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  if (file.mimetype && file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("מותר להעלות רק קבצי תמונה"), false);
  }
};

export const uploadSingleImage = multer({
  storage,
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter,
}).single("image"); // השם של השדה ב-FormData

export const uploadCategoryIcon = multer({ storage, fileFilter }).single(
  "icon"
);
