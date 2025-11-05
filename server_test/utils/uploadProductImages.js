
// utils/uploadProductImages.js
import fs from "fs";
import path from "path";
import multer from "multer";
import sharp from "sharp";
import { randomUUID } from "crypto";

const storage = multer.memoryStorage();
export const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024, files: 10 }, // 5MB, עד 10 קבצים
  fileFilter: (_req, file, cb) => {
    const ok = ["image/jpeg", "image/png", "image/webp"].includes(file.mimetype);
    cb(ok ? null : new Error("Only jpg/png/webp allowed"), ok);
  },
});

export async function processAndSaveImages(files, productId) {
  const outDir = path.join("uploads", "products", String(productId));
  fs.mkdirSync(outDir, { recursive: true });

  const saved = [];
  for (const f of files) {
    const id = randomUUID();
    const base = path.join(outDir, id);

    // בינוני
    const mediumPath = `${base}-m.webp`;
    await sharp(f.buffer).resize(1200).webp({ quality: 82 }).toFile(mediumPath);

    // thumbnail
    const thumbPath = `${base}-t.webp`;
    await sharp(f.buffer).resize(300).webp({ quality: 80 }).toFile(thumbPath);

    saved.push({
      url: `/${mediumPath.replace(/\\/g, "/")}`,
      thumbUrl: `/${thumbPath.replace(/\\/g, "/")}`,
      key: id, // מזהה פנימי שלנו
      isPrimary: false,
    });
  }
  return saved;
}
