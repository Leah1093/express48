import fs from "fs/promises";
import path from "path";

export async function deleteProductImageFiles(productId, key) {
  // כך נוצרו השמות ב-processAndSaveImages: {key}-m.webp / {key}-t.webp
  const baseDir = path.join("uploads", "products", String(productId));
  const files = [
    path.join(baseDir, `${key}-m.webp`),
    path.join(baseDir, `${key}-t.webp`),
  ];

  for (const p of files) {
    try { await fs.unlink(p); } 
    catch (e) { if (e.code !== "ENOENT") console.warn("delete failed:", p, e.message); }
  }
}
