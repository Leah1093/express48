import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { Product } from "../models/product.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, "../.env") });

async function migrate() {
  await mongoose.connect(process.env.MONGO_URI);

  const cursor = Product.find({}).cursor();
  const ops = [];
  let scanned = 0;
  let skipped = 0;
  let modified = 0;

  for await (const doc of cursor) {
    scanned++;

    const updates = {};

    // supplier default
    if (!doc.supplier) updates.supplier = "fakestoreapi"; // שנה לפי הצורך

    // externalId -> string
    if (doc.externalId && typeof doc.externalId !== "string") {
      updates.externalId = String(doc.externalId);
    }

    // price: number -> { currency, amount }
    if (typeof doc.price === "number") {
      updates.price = { currency: "ILS", amount: doc.price };
      if (typeof doc.legacyPrice === "undefined") updates.legacyPrice = doc.price;
    } else if (doc.price && typeof doc.price === "object") {
      const amount =
        typeof doc.price.amount === "number"
          ? doc.price.amount
          : typeof doc.price.value === "number"
          ? doc.price.value
          : 0;
      updates.price = {
        currency: doc.price.currency || "ILS",
        amount,
      };
      if (typeof doc.legacyPrice === "undefined" && typeof amount === "number") {
        updates.legacyPrice = amount;
      }
    } else {
      updates.price = { currency: "ILS", amount: 0 };
    }

    // rating: { rate, count } -> { average, count }
    if (doc.rating && typeof doc.rating === "object") {
      const average =
        typeof doc.rating.average === "number"
          ? doc.rating.average
          : typeof doc.rating.rate === "number"
          ? doc.rating.rate
          : 0;
      const count = typeof doc.rating.count === "number" ? doc.rating.count : 0;
      updates.rating = { average, count };
    } else {
      updates.rating = { average: 0, count: 0 };
    }

    // images array from legacy image
    const hasImagesArray = Array.isArray(doc.images);
    if (!hasImagesArray) {
      if (doc.image) updates.images = [doc.image];
      else updates.images = [];
    }
    // ensure legacy single image exists for old UI
    if (!doc.image) {
      const first =
        (hasImagesArray && doc.images[0]) ||
        (updates.images && updates.images[0]);
      if (first) updates.image = first;
    }

    // defaults for new fields
    if (!doc.brand) updates.brand = "";
    if (!doc.subCategory) updates.subCategory = "";
    if (!doc.gtin) updates.gtin = "";
    if (!doc.sku) updates.sku = "";
    if (!doc.model) updates.model = "";
    if (!doc.specs || typeof doc.specs !== "object") updates.specs = {};
    if (!doc.variations) updates.variations = [];
    if (!doc.shipping || typeof doc.shipping !== "object") {
      updates.shipping = { dimensions: "", weight: "", from: "IL" };
    } else {
      updates.shipping = {
        dimensions: doc.shipping.dimensions || "",
        weight: doc.shipping.weight || "",
        from: doc.shipping.from || "IL",
      };
    }

    // category default
    if (!doc.category) updates.category = "אחר";

    if (Object.keys(updates).length === 0) {
      skipped++;
      continue;
    }

    ops.push({ updateOne: { filter: { _id: doc._id }, update: { $set: updates } } });

    if (ops.length >= 1000) {
      const res = await Product.bulkWrite(ops, { ordered: false });
      modified += res.modifiedCount || 0;
      ops.length = 0;
    }
  }

  if (ops.length) {
    const res = await Product.bulkWrite(ops, { ordered: false });
    modified += res.modifiedCount || 0;
  }

  console.log(`✅ Done. Scanned: ${scanned}, Modified: ${modified}, Skipped: ${skipped}`);
  await mongoose.disconnect();
  process.exit(0);
}

migrate().catch((err) => {
  console.error("❌ Migration failed:", err);
  process.exit(1);
});
