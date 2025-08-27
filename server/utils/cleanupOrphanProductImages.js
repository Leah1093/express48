// utils/cleanupOrphanProductImages.js
import fs from "fs/promises";
import path from "path";
import { Product } from "../models/product.modeis.js";
export async function cleanupOrphanProductImages(productId) {
  const baseDir = path.join("uploads", "products", String(productId));

  try {
    const files = await fs.readdir(baseDir);
    if (!files.length) return;

    const product = await Product.findById(productId);
    if (!product) {
      // אם המוצר לא קיים בכלל — מוחקים הכל
      await Promise.all(files.map(f => fs.unlink(path.join(baseDir, f))));
      console.log(`🗑️ Deleted all images for non-existing product ${productId}`);
      return;
    }

    // אוספים את ה-keys הקיימים במסד
    const validKeys = new Set(product.images.map(img => img.key));

    for (const file of files) {
      const keyFromFile = file.split("-")[0]; // לפני -m.webp / -t.webp
      if (!validKeys.has(keyFromFile)) {
        await fs.unlink(path.join(baseDir, file));
        console.log(`🗑️ Deleted orphan image file: ${file}`);
      }
    }
  } catch (err) {
    if (err.code !== "ENOENT") console.error("Error cleaning orphan images:", err.message);
  }
}
