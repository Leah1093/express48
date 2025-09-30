import mongoose from "mongoose";
import { Product } from "../models/Product.js";

describe("Product Model", () => {
  beforeAll(async () => {
    await mongoose.connect("mongodb://localhost:27017/testdb", { useNewUrlParser: true, useUnifiedTopology: true });
  });
  afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.disconnect();
  });

  it("should create and save a valid product", async () => {
    const prod = new Product({
      sellerId: new mongoose.Types.ObjectId(),
      storeId: new mongoose.Types.ObjectId(),
      title: "מוצר לדוגמה",
      price: { amount: 100 },
      images: ["img1.jpg"],
      stock: 1 // כדי ש-inStock יהיה true
    });
    const saved = await prod.save();
    expect(saved._id).toBeDefined();
    expect(saved.title).toBe("מוצר לדוגמה");
    expect(saved.price.amount).toBe(100);
    expect(saved.inStock).toBe(true);
  });

  it("should fail validation for missing price", async () => {
    const prod = new Product({
      sellerId: new mongoose.Types.ObjectId(),
      storeId: new mongoose.Types.ObjectId(),
      title: "מוצר בלי מחיר",
      images: ["img1.jpg"]
    });
    await expect(prod.save()).rejects.toThrow(/price.amount/);
  });

  it("should fail validation for published product without images", async () => {
    const prod = new Product({
      sellerId: new mongoose.Types.ObjectId(),
      storeId: new mongoose.Types.ObjectId(),
      title: "מוצר בלי תמונה",
      price: { amount: 50 },
      status: "published",
      images: []
    });
    await expect(prod.save()).rejects.toThrow(/חייב לכלול לפחות תמונה אחת/);
  });

  it("should auto-generate slug and meta fields", async () => {
    const prod = new Product({
      sellerId: new mongoose.Types.ObjectId(),
      storeId: new mongoose.Types.ObjectId(),
      title: "טלפון סלולרי",
      price: { amount: 200 },
      images: ["img.jpg"]
    });
    await prod.save();
    expect(prod.slug).toMatch(/^[a-z0-9-]+$/);
    expect(prod.metaTitle.length).toBeGreaterThan(0);
    expect(prod.metaDescription.length).toBeGreaterThan(0);
  });

  it("should calculate effective pricing with discount", async () => {
    const prod = new Product({
      sellerId: new mongoose.Types.ObjectId(),
      storeId: new mongoose.Types.ObjectId(),
      title: "מוצר עם הנחה",
      price: { amount: 100 },
      discount: { discountType: "percent", discountValue: 20 }
    });
    await prod.save();
    const pricing = prod.getEffectivePricing();
    expect(pricing.finalAmount).toBeLessThan(100);
    expect(pricing.hasDiscount).toBe(true);
  });

  it("should update stock and inStock based on variations", async () => {
    const prod = new Product({
      sellerId: new mongoose.Types.ObjectId(),
      storeId: new mongoose.Types.ObjectId(),
      title: "מוצר עם וריאציות",
      price: { amount: 100 },
      images: ["img.jpg"],
      variations: [
        { price: { amount: 120 }, stock: 2 },
        { price: { amount: 130 }, stock: 0 }
      ]
    });
    await prod.save();
    expect(prod.stock).toBe(2);
    expect(prod.inStock).toBe(true);
    expect(prod.variations[0].inStock).toBe(true);
    expect(prod.variations[1].inStock).toBe(false);
  });

  it("should fail validation for invalid GTIN", async () => {
    const prod = new Product({
      sellerId: new mongoose.Types.ObjectId(),
      storeId: new mongoose.Types.ObjectId(),
      title: "מוצר עם GTIN לא חוקי",
      price: { amount: 100 },
      images: ["img.jpg"],
      gtin: "abc123"
    });
    await expect(prod.save()).rejects.toThrow(/GTIN לא חוקי/);
  });

  it("should update ratings breakdown and avg", async () => {
    const prod = new Product({
      sellerId: new mongoose.Types.ObjectId(),
      storeId: new mongoose.Types.ObjectId(),
      title: "מוצר עם דירוגים",
      price: { amount: 100 },
      images: ["img.jpg"],
      ratings: { breakdown: { 1: 1, 2: 2, 3: 3, 4: 4, 5: 5 } }
    });
    await prod.save();
    expect(prod.ratings.count).toBe(15);
    expect(prod.ratings.avg).toBeGreaterThan(0);
  });

  it("should set gtin to undefined if empty string", async () => {
    const prod = new Product({
      sellerId: new mongoose.Types.ObjectId(),
      storeId: new mongoose.Types.ObjectId(),
      title: "מוצר עם gtin ריק",
      price: { amount: 100 },
      images: ["img.jpg"],
      gtin: ""
    });
    await prod.save();
    expect(prod.gtin).toBeUndefined();
  });

  it("should trim metaTitle and metaDescription if manually set", async () => {
    const longTitle = "A".repeat(100);
    const longDesc = "B".repeat(200);
    const prod = new Product({
      sellerId: new mongoose.Types.ObjectId(),
      storeId: new mongoose.Types.ObjectId(),
      title: "מוצר SEO",
      price: { amount: 100 },
      images: ["img.jpg"],
      metaTitle: longTitle,
      metaDescription: longDesc
    });
    await prod.save();
    expect(prod.metaTitle.length).toBeLessThanOrEqual(60);
    expect(prod.metaDescription.length).toBeLessThanOrEqual(160);
  });

  it("should fail validation for published product with images undefined", async () => {
    const prod = new Product({
      sellerId: new mongoose.Types.ObjectId(),
      storeId: new mongoose.Types.ObjectId(),
      title: "מוצר בלי תמונות",
      price: { amount: 100 },
      status: "published"
      // images לא מוגדר
    });
    await expect(prod.save()).rejects.toThrow(/חייב לכלול לפחות תמונה אחת/);
  });

  it("should return product pricing if variationId not found", async () => {
    const prod = new Product({
      sellerId: new mongoose.Types.ObjectId(),
      storeId: new mongoose.Types.ObjectId(),
      title: "מוצר עם וריאציה לא קיימת",
      price: { amount: 100 },
      images: ["img.jpg"],
      variations: [{ price: { amount: 120 }, stock: 1 }]
    });
    await prod.save();
    const fakeId = new mongoose.Types.ObjectId();
    const pricing = prod.getEffectivePricing(fakeId);
    expect(pricing.baseAmount).toBe(100);
    expect(pricing.priceSource).toBe("product");
  });

  it("should handle scheduledAt/visibleUntil validation error", async () => {
    const prod = new Product({
      sellerId: new mongoose.Types.ObjectId(),
      storeId: new mongoose.Types.ObjectId(),
      title: "מוצר עם טווחי נראות לא תקינים",
      price: { amount: 100 },
      images: ["img.jpg"],
      scheduledAt: new Date("2025-09-25T10:00:00Z"),
      visibleUntil: new Date("2025-09-24T10:00:00Z") // לפני scheduledAt
    });
    await expect(prod.save()).rejects.toThrow(/visibleUntil must be after scheduledAt/);
  });

  it("should auto-generate SKU if not provided", async () => {
    const prod = new Product({
      sellerId: new mongoose.Types.ObjectId(),
      storeId: new mongoose.Types.ObjectId(),
      title: "מוצר בלי SKU",
      price: { amount: 100 },
      images: ["img.jpg"]
    });
    await prod.save();
    expect(prod.sku).toMatch(/^[A-Z0-9-]{8,64}$/);
  });

  it("should auto-generate variation SKUs if not provided", async () => {
    const prod = new Product({
      sellerId: new mongoose.Types.ObjectId(),
      storeId: new mongoose.Types.ObjectId(),
      title: "מוצר עם וריאציות בלי SKU",
      price: { amount: 100 },
      images: ["img.jpg"],
      variations: [{ price: { amount: 120 }, stock: 1 }, { price: { amount: 130 }, stock: 2 }]
    });
    await prod.save();
    expect(prod.variations[0].sku).toMatch(/-VAR-1$/);
    expect(prod.variations[1].sku).toMatch(/-VAR-2$/);
  });

  it("should update slug to avoid duplicates per store", async () => {
    const storeId = new mongoose.Types.ObjectId();
    const prod1 = new Product({
      sellerId: new mongoose.Types.ObjectId(),
      storeId,
      title: "מוצר ייחודי",
      price: { amount: 100 },
      images: ["img.jpg"],
      gtin: "12345678" // gtin ייחודי
    });
    await prod1.save();
    const prod2 = new Product({
      sellerId: new mongoose.Types.ObjectId(),
      storeId,
      title: "מוצר ייחודי",
      price: { amount: 100 },
      images: ["img.jpg"],
      gtin: "87654321" // gtin ייחודי
    });
    await prod2.save();
    expect(prod2.slug).not.toBe(prod1.slug);
    expect(prod2.slug.length).toBeGreaterThanOrEqual(3);
  });

  // פונקציה מקומית לנירמול עברית כמו במודל
  function normalizeHebrew(str = "") {
    const FINAL_MAP = { "ך": "כ", "ם": "מ", "ן": "נ", "ף": "פ", "ץ": "צ" };
    let s = String(str)
      .replace(/[\u0591-\u05C7]/g, "")
      .replace(/[\u05F3\u05F4'\"]/g, "")
      .replace(/[^\u0590-\u05FF0-9A-Za-z\s-]/g, " ")
      .replace(/\s+/g, " ")
      .trim();
    s = s.replace(/[ךםןףץ]/g, ch => FINAL_MAP[ch] || ch);
    return s.toLowerCase();
  }

  it("should set plain hebrew fields on save", async () => {
    const prod = new Product({
      sellerId: new mongoose.Types.ObjectId(),
      storeId: new mongoose.Types.ObjectId(),
      title: "טלפון סלולרי",
      brand: "סמסונג",
      description: "מכשיר מתקדם",
      model: "S24U",
      price: { amount: 100 },
      images: ["img.jpg"]
    });
    await prod.save();
    expect(prod.title_he_plain).toBe(normalizeHebrew("טלפון סלולרי"));
    expect(prod.brand_he_plain).toBe(normalizeHebrew("סמסונג"));
    expect(prod.description_he_plain).toBe(normalizeHebrew("מכשיר מתקדם"));
    expect(prod.model_he_plain).toBe(normalizeHebrew("S24U"));
  });
});
