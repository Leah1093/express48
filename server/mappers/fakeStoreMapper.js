// Mapper לספק fakestoreapi
export function mapFakeStoreProduct(p) {
  return {
    supplier: "fakestoreapi",
    externalId: String(p.id),

    // מידע כללי
    title: p.title,
    description: p.description,
    brand: "", // אין ב־FakeStore
    category: p.category || "אחר",
    subCategory: "",

    gtin: "",
    sku: "",
    model: "",

    // מחיר כאובייקט
    price: {
      currency: "ILS",
      amount: p.price,
    },

    // אין ווריאציות בפייקסטור
    variations: [],

    specs: {},

    // מדיה
    images: [p.image],
    image: p.image, // שדה מורשת

    // דירוג
    rating: {
      average: p.rating?.rate || 0,
      count: p.rating?.count || 0,
    },

    // שילוח (אין מידע אמיתי כאן)
    shipping: {
      dimensions: "",
      weight: "",
      from: "IL",
    },

    // שדות מורשת
    legacyPrice: p.price,
  };
}
