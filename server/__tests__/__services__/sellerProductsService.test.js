import { jest } from "@jest/globals";

// --- Product mock: constructor + static methods (fits service usage) ---
jest.unstable_mockModule("../../models/Product.js", () => {
  const Product = jest.fn();
  Product.aggregate = jest.fn();
  Product.findById = jest.fn();
  Product.findOne = jest.fn();
  Product.findByIdAndUpdate = jest.fn();
  return { __esModule: true, Product };
});

// dynamic imports AFTER mocks
const { SellerProductsService, __testables } = await import("../../service/sellerProducts.service.js");
const { Product } = await import("../../models/Product.js");

// helpers – stateful mock document (so assignments are visible in toObject())
const makeDoc = (seed = {}) => {
  const doc = { ...seed };
  Object.defineProperty(doc, "toObject", {
    value: jest.fn(function () {
      const { toObject, save, ...rest } = this;
      return { ...rest, _to: true };
    }),
    enumerable: false,
  });
  Object.defineProperty(doc, "save", {
    value: jest.fn(async function () { return this; }),
    enumerable: false,
  });
  return doc;
};

const makeLean = (obj) => ({ setOptions: () => ({ lean: () => obj }) });

afterEach(() => { jest.clearAllMocks(); });

describe("SellerProductsService", () => {
  // --- helpers ---
  it("helpers", () => {
    const { toNum, toDate, escapeRegex, normalizeHebrew, parseDeletedFlag, generateETag } = __testables;
    expect(toNum("12")).toBe(12);
    expect(toNum("bad")).toBeUndefined();
    expect(toDate("2025-01-01") instanceof Date).toBe(true);
    expect(escapeRegex("a+b*c?")).toContain("\\");
    expect(normalizeHebrew("מלך")).toContain("כ");
    expect(parseDeletedFlag("deleted")).toBe("deleted");
    expect(parseDeletedFlag("unknown")).toBe("active");
    expect(generateETag({ a: 1 })).toHaveLength(40);
  });

  // --- list ---
  describe("list", () => {
    it("returns paged items and flags", async () => {
      Product.aggregate.mockReturnValueOnce({
        allowDiskUse: () => Promise.resolve([
          { items: [{ images: ["u"], variations: [{ _id: "v" }] }], total: 1 },
        ]),
      });

      const svc = new SellerProductsService();
      const out = await svc.list({
        role: "seller",
        sellerId: "507f191e810c19729de860ea",
        query: { page: 1, limit: 10, search: "abc", priceMin: "10", priceMax: "20", fields: "title,images" },
      });

      expect(out.items[0].hasVariations).toBe(true);
      expect(out.items[0].thumbnailUrl).toBe("u");
      expect(out.total).toBe(1);
    });

    it("hits else-if (query.storeId) branch", async () => {
      Product.aggregate.mockReturnValueOnce({
        allowDiskUse: () => Promise.resolve([{ items: [], total: 0 }]),
      });
      const svc = new SellerProductsService();
      await svc.list({
        role: "seller",
        sellerId: "507f191e810c19729de860ea",
        // בכוונה אין storeId למעלה – רק ב-query
        query: { storeId: "507f191e810c19729de860ea", deleted: "deleted" },
      });
      expect(Product.aggregate).toHaveBeenCalledTimes(1);
    });

    it("accepts deleted='all' and augments fields projection", async () => {
      Product.aggregate.mockReturnValueOnce({
        allowDiskUse: () => Promise.resolve([{ items: [], total: 0 }]),
      });
      const svc = new SellerProductsService();
      await svc.list({ role: "admin", query: { deleted: "all", fields: "title" } });
      expect(Product.aggregate).toHaveBeenCalled();
    });

    it("400 on invalid query", async () => {
      const svc = new SellerProductsService();
      await expect(svc.list({ role: "seller", query: null })).rejects.toMatchObject({ status: 400 });
    });

    it("hits top-level 'if (storeId...)' branch", async () => {
      Product.aggregate.mockReturnValueOnce({
        allowDiskUse: () => Promise.resolve([{ items: [], total: 0 }]),
      });

      const svc = new SellerProductsService();
      const storeId = "507f191e810c19729de860ea";

      await svc.list({
        role: "seller",
        sellerId: "507f191e810c19729de860ea",
        storeId,              // ← כאן בכוונה ב-parameter העליון, לא בתוך query
        query: {},            // מספיק אובייקט ריק כדי לעבור את ה-guard
      });

      const pipeline = Product.aggregate.mock.calls[0][0];
      expect(String(pipeline[0].$match.storeId)).toBe(storeId);

      expect(Product.aggregate).toHaveBeenCalledTimes(1);
    });

  });

  // --- getOne ---
  describe("getOne", () => {
    it("returns product for admin", async () => {
      Product.findById.mockReturnValueOnce(makeLean({ _id: "1", sellerId: "s", storeId: "st" }));
      const svc = new SellerProductsService();
      const out = await svc.getOne({ id: "507f191e810c19729de860ea", role: "admin" });
      expect(out.product._id).toBe("1");
      expect(out.etag).toHaveLength(40);
    });

    it("forbidden for non-owner", async () => {
      Product.findById.mockReturnValueOnce(makeLean({ _id: "1", sellerId: "A", storeId: "A" }));
      const svc = new SellerProductsService();
      await expect(
        svc.getOne({ id: "507f191e810c19729de860ea", sellerId: "B", storeId: "A", role: "seller" })
      ).rejects.toMatchObject({ status: 403 });
    });

    it("404 when missing", async () => {
      Product.findById.mockReturnValueOnce(makeLean(null));
      const svc = new SellerProductsService();
      await expect(svc.getOne({ id: "507f191e810c19729de860ea", role: "admin" })).rejects.toMatchObject({ status: 404 });
    });

    it("400 on invalid ObjectId", async () => {
      const svc = new SellerProductsService();
      await expect(svc.getOne({ id: "bad", role: "admin" })).rejects.toMatchObject({ status: 400 });
    });
  });

  // --- update ---
  describe("update", () => {
    it("checks ETag and saves", async () => {
      const doc = makeDoc({ _id: "1", __v: 1, updatedAt: new Date(), storeId: "st", title: "" });
      Product.findById.mockResolvedValueOnce(doc);
      const svc = new SellerProductsService();
      const currentETag = __testables.makeETag(doc);
      const out = await svc.update({ id: "507f191e810c19729de860ea", role: "seller", storeId: "st", data: { title: "T" }, ifMatch: currentETag });
      expect(out.updated.title).toBe("T");
    });

    it("412 when ETag mismatch", async () => {
      const doc = makeDoc({ _id: "1", __v: 1, updatedAt: new Date(), storeId: "st" });
      Product.findById.mockResolvedValueOnce(doc);
      const svc = new SellerProductsService();
      await expect(svc.update({ id: "507f191e810c19729de860ea", role: "seller", storeId: "st", data: {}, ifMatch: "bad" })).rejects.toMatchObject({ status: 412 });
    });

    it("403 when seller updates other store", async () => {
      const doc = makeDoc({ _id: "1", __v: 1, updatedAt: new Date(), storeId: "X" });
      Product.findById.mockResolvedValueOnce(doc);
      const svc = new SellerProductsService();
      await expect(svc.update({ id: "507f191e810c19729de860ea", role: "seller", storeId: "st", data: {} })).rejects.toMatchObject({ status: 403 });
    });

    it("404 when product missing", async () => {
      Product.findById.mockResolvedValueOnce(null);
      const svc = new SellerProductsService();
      await expect(svc.update({ id: "507f191e810c19729de860ea", role: "seller", storeId: "st", data: {} })).rejects.toMatchObject({ status: 404 });
    });
  });

  // --- createProduct ---
  describe("createProduct", () => {
    it("success via constructor .save()", async () => {
      Product.mockImplementation(() => ({ save: jest.fn().mockResolvedValue({ _id: "1" }) }));
      const svc = new SellerProductsService();
      const out = await svc.createProduct({ data: { title: "t" }, actor: { id: "u" } });
      expect(out._id).toBe("1");
    });

    it("409 on duplicate key (11000)", async () => {
      Product.mockImplementation(() => ({ save: jest.fn().mockRejectedValue({ code: 11000, keyValue: { sku: "X" } }) }));
      const svc = new SellerProductsService();
      await expect(svc.createProduct({ data: {}, actor: { id: "u" } })).rejects.toMatchObject({ status: 409 });
    });

    it("400 on ValidationError", async () => {
      Product.mockImplementation(() => ({ save: jest.fn().mockRejectedValue({ name: "ValidationError", message: "bad" }) }));
      const svc = new SellerProductsService();
      await expect(svc.createProduct({ data: {}, actor: { id: "u" } })).rejects.toMatchObject({ status: 400 });
    });

    it("bubbles unknown error", async () => {
      Product.mockImplementation(() => ({ save: jest.fn().mockRejectedValue(new Error("boom")) }));
      const svc = new SellerProductsService();
      await expect(svc.createProduct({ data: {}, actor: { id: "u" } })).rejects.toThrow("boom");
    });
  });

  // --- softDelete / restore ---
  describe("softDelete / restore", () => {
    it("calls findByIdAndUpdate twice", async () => {
      Product.findByIdAndUpdate.mockResolvedValue({ ok: 1 });
      const svc = new SellerProductsService();
      await svc.softDelete("507f191e810c19729de860ea", "u");
      await svc.restore("507f191e810c19729de860ea", "u");
      expect(Product.findByIdAndUpdate).toHaveBeenCalledTimes(2);
    });
  });

  // --- updateStatus ---
  describe("updateStatus", () => {
    it("valid transition (seller)", async () => {
      const doc = makeDoc({ status: "draft", sellerId: "S" });
      Product.findOne.mockResolvedValueOnce(doc);
      const svc = new SellerProductsService();
      const res = await svc.updateStatus({ id: "507f191e810c19729de860ea", nextStatus: "published", role: "seller", sellerId: "S", actorId: "U" });
      expect(res.status).toBe("published");
    });

    it("valid transition (admin bypass)", async () => {
      const doc = makeDoc({ status: "published", sellerId: "A" });
      Product.findOne.mockResolvedValueOnce(doc);
      const svc = new SellerProductsService();
      const res = await svc.updateStatus({ id: "507f191e810c19729de860ea", nextStatus: "suspended", role: "admin", sellerId: "B", actorId: "U" });
      expect(res.status).toBe("suspended");
    });

    it("409 on invalid transition", async () => {
      const doc = makeDoc({ status: "draft", sellerId: "S" });
      Product.findOne.mockResolvedValueOnce(doc);
      const svc = new SellerProductsService();
      await expect(svc.updateStatus({ id: "507f191e810c19729de860ea", nextStatus: "suspended", role: "seller", sellerId: "S" })).rejects.toMatchObject({ status: 409 });
    });

    it("403 on non-owner (seller)", async () => {
      Product.findOne.mockResolvedValueOnce(makeDoc({ status: "draft", sellerId: "A" }));
      const svc = new SellerProductsService();
      await expect(svc.updateStatus({ id: "507f191e810c19729de860ea", nextStatus: "published", role: "seller", sellerId: "B" })).rejects.toMatchObject({ status: 403 });
    });

    it("400 on invalid id", async () => {
      const svc = new SellerProductsService();
      await expect(svc.updateStatus({ id: "bad", nextStatus: "published", role: "seller", sellerId: "S" })).rejects.toMatchObject({ status: 400 });
    });

    it("404 when product not found", async () => {
      Product.findOne.mockResolvedValueOnce(null);
      const svc = new SellerProductsService();
      await expect(svc.updateStatus({ id: "507f191e810c19729de860ea", nextStatus: "published", role: "seller", sellerId: "S" })).rejects.toMatchObject({ status: 404 });
    });
  });

  describe("list – extra coverage", () => {
    it("augments projection when 'fields' missing variations._id", async () => {
      // fields='images' → variations._id יתווסף (true branch בשורה 133), images יישאר (false branch בשורה 134)
      Product.aggregate.mockReturnValueOnce({
        allowDiskUse: () => Promise.resolve([{ items: [], total: 0 }]),
      });
      const svc = new SellerProductsService();
      await svc.list({
        role: "seller",
        sellerId: "507f191e810c19729de860ea",
        query: { fields: "images" },
      });
      expect(Product.aggregate).toHaveBeenCalledTimes(1);
    });

    it("handles empty facet result (res undefined) → defaults (lines ~146)", async () => {
      // נחזיר [undefined] כדי ש-res יהיה undefined → rawItems=[], total=0
      Product.aggregate.mockReturnValueOnce({
        allowDiskUse: () => Promise.resolve([undefined]),
      });
      const svc = new SellerProductsService();
      const out = await svc.list({
        role: "seller",
        sellerId: "507f191e810c19729de860ea",
        query: {},
      });
      expect(out.items).toEqual([]);
      expect(out.total).toBe(0);
    });

    it("maps thumbnailUrl=null when images is empty (line ~150)", async () => {
      Product.aggregate.mockReturnValueOnce({
        allowDiskUse: () =>
          Promise.resolve([
            { items: [{ images: [], variations: [] }], total: 1 },
          ]),
      });
      const svc = new SellerProductsService();
      const out = await svc.list({
        role: "seller",
        sellerId: "507f191e810c19729de860ea",
        query: {},
      });
      expect(out.items[0].thumbnailUrl).toBeNull();
    });
  });

  describe("getOne – seller allowed path", () => {
    it("allows seller when sellerId & storeId match (covers line ~166 else-path)", async () => {
      const pid = "507f191e810c19729de860ea";
      Product.findById.mockReturnValueOnce({
        setOptions: () => ({ lean: () => ({ _id: pid, sellerId: "S1", storeId: "ST1" }) }),
      });
      const svc = new SellerProductsService();
      const out = await svc.getOne({ id: pid, role: "seller", sellerId: "S1", storeId: "ST1" });
      expect(out.product._id).toBe(pid);
      expect(out.etag).toBeTruthy();
    });
  });


  describe("update – admin path", () => {
    it("skips seller store check when role is admin (covers line ~179 other branch)", async () => {
      const doc = makeDoc({ _id: "1", __v: 1, updatedAt: new Date(), storeId: "OTHER", title: "" });
      Product.findById.mockResolvedValueOnce(doc);
      const svc = new SellerProductsService();
      const out = await svc.update({
        id: "507f191e810c19729de860ea",
        role: "admin",              // ← מדלג על בלוק ה-seller
        data: { title: "X" },
      });
      expect(out.updated.title).toBe("X");
    });
  });


  describe("createProduct – extra branches", () => {
    it("409 on duplicate key (uses keyPattern branch)", async () => {
      Product.mockImplementation(() => ({
        save: jest.fn().mockRejectedValue({ code: 11000, keyPattern: { sku: 1 } }),
      }));
      const svc = new SellerProductsService();
      await expect(svc.createProduct({ data: {}, actor: { id: "u" } }))
        .rejects.toMatchObject({ status: 409, message: expect.stringMatching(/Duplicate/i) });
    });
  });


  describe("updateStatus – extra branches", () => {
    it("403 when sellerId missing (hits !reqSeller branch ~238-239)", async () => {
      const doc = makeDoc({ status: "draft", sellerId: "S1" }); // pSeller='S1'
      Product.findOne.mockResolvedValueOnce(doc);
      const svc = new SellerProductsService();
      await expect(
        svc.updateStatus({ id: "507f191e810c19729de860ea", nextStatus: "published", role: "seller", sellerId: "" }) // reqSeller=''
      ).rejects.toMatchObject({ status: 403 });
    });

    it("409 when current status is unknown (uses fallback [] at line ~244)", async () => {
      const doc = makeDoc({ status: "weird", sellerId: "S1" }); // לא במפתח ALLOWED
      Product.findOne.mockResolvedValueOnce(doc);
      const svc = new SellerProductsService();
      await expect(
        svc.updateStatus({ id: "507f191e810c19729de860ea", nextStatus: "anything", role: "admin" }) // admin עוקף בדיקת בעלות
      ).rejects.toMatchObject({ status: 409 });
    });

    it("keeps existing statusHistory array (covers other branch of line ~249)", async () => {
      const doc = makeDoc({ status: "draft", sellerId: "S", statusHistory: [] }); // כבר קיים מערך
      Product.findOne.mockResolvedValueOnce(doc);
      const svc = new SellerProductsService();
      const res = await svc.updateStatus({
        id: "507f191e810c19729de860ea",
        nextStatus: "published",
        role: "seller",
        sellerId: "S",
        actorId: "U",
      });
      expect(Array.isArray(res.statusHistory)).toBe(true);
      expect(res.statusHistory.length).toBe(1);
    });
  });

  describe("list – missing branches", () => {
    it("sortMap – covers all sort variants incl. fallback", async () => {
      const cases = [
        ["-updatedAt", { updatedAt: -1 }],
        ["updatedAt", { updatedAt: 1 }],
        ["title", { title: 1 }],
        ["brand", { brand: 1 }],
        ["price", { "price.amount": 1 }],
        ["+price", { "price.amount": 1 }],
        ["-price", { "price.amount": -1 }],
        ["stock", { stock: 1 }],
        ["-stock", { stock: -1 }],
        // fallback (unknown)
        ["__weird__", { updatedAt: -1 }],
      ];

      for (const [sort, expected] of cases) {
        Product.aggregate.mockReturnValueOnce({
          allowDiskUse: () => Promise.resolve([{ items: [], total: 0 }]),
        });
        const svc = new SellerProductsService();
        await svc.list({
          role: "seller",
          sellerId: "507f191e810c19729de860ea",
          query: { sort },
        });
        const pipeline = Product.aggregate.mock.calls.at(-1)[0];
        expect(pipeline[1]).toEqual({ $sort: expected });
      }
    });

    it("priceMin only + priceMax only (and same for stock) – covers numeric range branches", async () => {
      // priceMin only
      Product.aggregate.mockReturnValueOnce({
        allowDiskUse: () => Promise.resolve([{ items: [], total: 0 }]),
      });
      let svc = new SellerProductsService();
      await svc.list({
        role: "seller",
        sellerId: "507f191e810c19729de860ea",
        query: { priceMin: 10 },
      });
      let pipeline = Product.aggregate.mock.calls.at(-1)[0];
      expect(pipeline[0].$match["price.amount"].$gte).toBe(10);
      expect(pipeline[0].$match["price.amount"].$lte).toBeUndefined();

      // priceMax only
      Product.aggregate.mockReturnValueOnce({
        allowDiskUse: () => Promise.resolve([{ items: [], total: 0 }]),
      });
      svc = new SellerProductsService();
      await svc.list({
        role: "seller",
        sellerId: "507f191e810c19729de860ea",
        query: { priceMax: 99 },
      });
      pipeline = Product.aggregate.mock.calls.at(-1)[0];
      expect(pipeline[0].$match["price.amount"].$lte).toBe(99);
      expect(pipeline[0].$match["price.amount"].$gte).toBeUndefined();

      // stockMin only
      Product.aggregate.mockReturnValueOnce({
        allowDiskUse: () => Promise.resolve([{ items: [], total: 0 }]),
      });
      svc = new SellerProductsService();
      await svc.list({
        role: "seller",
        sellerId: "507f191e810c19729de860ea",
        query: { stockMin: 5 },
      });
      pipeline = Product.aggregate.mock.calls.at(-1)[0];
      expect(pipeline[0].$match.stock.$gte).toBe(5);
      expect(pipeline[0].$match.stock.$lte).toBeUndefined();

      // stockMax only
      Product.aggregate.mockReturnValueOnce({
        allowDiskUse: () => Promise.resolve([{ items: [], total: 0 }]),
      });
      svc = new SellerProductsService();
      await svc.list({
        role: "seller",
        sellerId: "507f191e810c19729de860ea",
        query: { stockMax: 7 },
      });
      pipeline = Product.aggregate.mock.calls.at(-1)[0];
      expect(pipeline[0].$match.stock.$lte).toBe(7);
      expect(pipeline[0].$match.stock.$gte).toBeUndefined();
    });

    it("updatedFrom only + updatedTo only – covers date range branches", async () => {
      // updatedFrom only
      Product.aggregate.mockReturnValueOnce({
        allowDiskUse: () => Promise.resolve([{ items: [], total: 0 }]),
      });
      let svc = new SellerProductsService();
      await svc.list({
        role: "seller",
        sellerId: "507f191e810c19729de860ea",
        query: { updatedFrom: "2024-01-01" },
      });
      let pipeline = Product.aggregate.mock.calls.at(-1)[0];
      expect(pipeline[0].$match.updatedAt.$gte instanceof Date).toBe(true);
      expect(pipeline[0].$match.updatedAt.$lte).toBeUndefined();

      // updatedTo only
      Product.aggregate.mockReturnValueOnce({
        allowDiskUse: () => Promise.resolve([{ items: [], total: 0 }]),
      });
      svc = new SellerProductsService();
      await svc.list({
        role: "seller",
        sellerId: "507f191e810c19729de860ea",
        query: { updatedTo: "2025-01-01" },
      });
      pipeline = Product.aggregate.mock.calls.at(-1)[0];
      expect(pipeline[0].$match.updatedAt.$lte instanceof Date).toBe(true);
      expect(pipeline[0].$match.updatedAt.$gte).toBeUndefined();
    });

    it("search builds $or with normalized Hebrew and regex escaping (covers 99–110)", async () => {
      Product.aggregate.mockReturnValueOnce({
        allowDiskUse: () => Promise.resolve([{ items: [], total: 0 }]),
      });
      const svc = new SellerProductsService();
      await svc.list({
        role: "seller",
        sellerId: "507f191e810c19729de860ea",
        query: { search: "שָׁלוֹם\"()[]+.*" },
      });
      const pipeline = Product.aggregate.mock.calls.at(-1)[0];
      expect(Array.isArray(pipeline[0].$match.$or)).toBe(true);
      expect(pipeline[0].$match.$or.length).toBe(11); // מספר התנאים שבונים
    });

    it("projection augmentation when fields provided (covers 132–133)", async () => {
      Product.aggregate.mockReturnValueOnce({
        allowDiskUse: () => Promise.resolve([{ items: [], total: 0 }]),
      });
      const svc = new SellerProductsService();
      await svc.list({
        role: "admin",
        query: { fields: "title" }, // חסר images ו-variations._id => הסרוויס מוסיף
      });
      const pipeline = Product.aggregate.mock.calls.at(-1)[0];
      const proj = pipeline[2].$facet.items[2].$project;
      expect(proj["variations._id"]).toBe(1);
      expect(proj.images).toBe(1);
    });
  });


  describe("createProduct – keyPattern branch", () => {
    it("409 when duplicate key uses keyPattern", async () => {
      Product.mockImplementation(() => ({
        save: jest.fn().mockRejectedValue({ code: 11000, keyPattern: { sku: 1 } }),
      }));
      const svc = new SellerProductsService();
      await expect(
        svc.createProduct({ data: {}, actor: { id: "u" } })
      ).rejects.toMatchObject({
        status: 409,
        message: expect.stringMatching(/Duplicate/i),
      });
    });
  });


  describe("updateStatus – !pSeller branch", () => {
    it("403 when product has no sellerId (covers !pSeller)", async () => {
      const doc = makeDoc({ status: "draft" }); // אין sellerId בכלל
      Product.findOne.mockResolvedValueOnce(doc);
      const svc = new SellerProductsService();
      await expect(
        svc.updateStatus({
          id: "507f191e810c19729de860ea",
          nextStatus: "published",
          role: "seller",
          sellerId: "S1", // יש reqSeller, אבל pSeller ריק
        })
      ).rejects.toMatchObject({ status: 403 });
    });
  });


  describe("helpers extra", () => {
    it("normalizeHebrew strips nikud, quotes and special chars, normalizes finals, lowercases", () => {
      const { normalizeHebrew } = __testables;
      // כולל ניקוד, מרכאות, תווים זרים, אות סופית
      const out = normalizeHebrew('שָׁלוֹם"!? מלךּּּ  ');
      // שימי לב: ם → מ, ך → כ
      expect(out).toContain("שלומ"); // final ם נורמלה ל-מ
      expect(out).toContain("מלכ");  // final ך נורמלה ל-כ
      expect(out).toBe(out.toLowerCase());
    });


    it("escapeRegex escapes all meta chars", () => {
      const { escapeRegex } = __testables;
      const s = ".*+?^${}()|[]\\";
      const escaped = escapeRegex(s);
      // לוודא שכל תו הפך עם backslash
      for (const ch of [".", "*", "+", "?", "^", "$", "{", "}", "(", ")", "|", "[", "]", "\\"]) {
        expect(escaped).toContain("\\" + ch);
      }
    });
  });

  describe("helpers extra (full normalize & escape)", () => {
    it("normalizeHebrew: removes nikud + geresh/gershayim + specials, collapses spaces, normalizes finals, lowercases", () => {
      const { normalizeHebrew } = __testables;
      // כולל: ניקוד, גרש/גרשיים עבריים \u05F3 \u05F4, מרכאה ASCII, תווים זרים, רווחים מרובים/טאבים/שורות, אות סופית
      const out = normalizeHebrew('שָׁלוֹם\u05F3\u05F4 "!?  \t\n מלךּּּ  ');
      // ם→מ, ך→כ; רווחים קורסים ל-1; טרימינג; הכל lowercase
      expect(out).toBe("שלומ מלכ");
    });

    it("escapeRegex: escapes every metachar and also works on non-strings", () => {
      const { escapeRegex } = __testables;
      const s = ".*+?^${}()|[]\\";
      const escaped = escapeRegex(s);
      for (const ch of [".", "*", "+", "?", "^", "$", "{", "}", "(", ")", "|", "[", "]", "\\"]) {
        expect(escaped).toContain("\\" + ch);
      }
      // non-string input (covers String(s) path)
      expect(escapeRegex(12345)).toBe("12345");
    });
  });


  describe("list – search & projection branches", () => {
    it("opens search branch (99–101) with mixed chars; builds $or and uses q/qHe", async () => {
      Product.aggregate.mockReturnValueOnce({
        allowDiskUse: () => Promise.resolve([{ items: [], total: 0 }]),
      });
      const svc = new SellerProductsService();
      await svc.list({
        role: "seller",
        sellerId: "507f191e810c19729de860ea",
        query: { search: 'שָׁלוֹם\u05F3\u05F4 "[]()+.*' },
      });
      const pipeline = Product.aggregate.mock.calls.at(-1)[0];
      expect(Array.isArray(pipeline[0].$match.$or)).toBe(true);
      expect(pipeline[0].$match.$or.length).toBe(11); // כל התנאים
    });

    it("projection augmentation (132–133): adds variations._id and images when missing", async () => {
      Product.aggregate.mockReturnValueOnce({
        allowDiskUse: () => Promise.resolve([{ items: [], total: 0 }]),
      });
      const svc = new SellerProductsService();
      await svc.list({
        role: "admin",
        query: { fields: "title" }, // חסר images ו-variations._id
      });
      const pipeline = Product.aggregate.mock.calls.at(-1)[0];
      const proj = pipeline[2].$facet.items[2].$project;
      expect(proj["variations._id"]).toBe(1);
      expect(proj.images).toBe(1);
    });

    it("projection ‘no-op’: fields already include variations._id & images (evaluates the ifs to false)", async () => {
      Product.aggregate.mockReturnValueOnce({
        allowDiskUse: () => Promise.resolve([{ items: [], total: 0 }]),
      });
      const svc = new SellerProductsService();
      await svc.list({
        role: "admin",
        query: { fields: "title,images,variations._id" }, // שני השדות קיימים מראש
      });
      const pipeline = Product.aggregate.mock.calls.at(-1)[0];
      const proj = pipeline[2].$facet.items[2].$project;
      expect(proj["variations._id"]).toBe(1);
      expect(proj.images).toBe(1);
    });
  });


  describe("createProduct – 11000 branches", () => {
    it("409 on duplicate key via keyValue", async () => {
      Product.mockImplementation(() => ({
        save: jest.fn().mockRejectedValue({ code: 11000, keyValue: { sku: "X" } }),
      }));
      const svc = new SellerProductsService();
      await expect(svc.createProduct({ data: {}, actor: { id: "u" } }))
        .rejects.toMatchObject({ status: 409, message: expect.stringMatching(/Duplicate/i) });
    });

    it("409 on duplicate key via keyPattern (covers alt path)", async () => {
      Product.mockImplementation(() => ({
        save: jest.fn().mockRejectedValue({ code: 11000, keyPattern: { sku: 1 } }),
      }));
      const svc = new SellerProductsService();
      await expect(svc.createProduct({ data: {}, actor: { id: "u" } }))
        .rejects.toMatchObject({ status: 409, message: expect.stringMatching(/Duplicate/i) });
    });
  });


  it("numeric/date filters hit both sides (min-only / max-only)", async () => {
    // priceMin only
    Product.aggregate.mockReturnValueOnce({ allowDiskUse: () => Promise.resolve([{ items: [], total: 0 }]) });
    let svc = new SellerProductsService();
    await svc.list({ role: "seller", sellerId: "507f191e810c19729de860ea", query: { priceMin: 10 } });
    let pipeline = Product.aggregate.mock.calls.at(-1)[0];
    expect(pipeline[0].$match["price.amount"].$gte).toBe(10);
    expect(pipeline[0].$match["price.amount"].$lte).toBeUndefined();

    // priceMax only
    Product.aggregate.mockReturnValueOnce({ allowDiskUse: () => Promise.resolve([{ items: [], total: 0 }]) });
    svc = new SellerProductsService();
    await svc.list({ role: "seller", sellerId: "507f191e810c19729de860ea", query: { priceMax: 99 } });
    pipeline = Product.aggregate.mock.calls.at(-1)[0];
    expect(pipeline[0].$match["price.amount"].$lte).toBe(99);
    expect(pipeline[0].$match["price.amount"].$gte).toBeUndefined();

    // stockMin only
    Product.aggregate.mockReturnValueOnce({ allowDiskUse: () => Promise.resolve([{ items: [], total: 0 }]) });
    svc = new SellerProductsService();
    await svc.list({ role: "seller", sellerId: "507f191e810c19729de860ea", query: { stockMin: 5 } });
    pipeline = Product.aggregate.mock.calls.at(-1)[0];
    expect(pipeline[0].$match.stock.$gte).toBe(5);
    expect(pipeline[0].$match.stock.$lte).toBeUndefined();

    // stockMax only
    Product.aggregate.mockReturnValueOnce({ allowDiskUse: () => Promise.resolve([{ items: [], total: 0 }]) });
    svc = new SellerProductsService();
    await svc.list({ role: "seller", sellerId: "507f191e810c19729de860ea", query: { stockMax: 7 } });
    pipeline = Product.aggregate.mock.calls.at(-1)[0];
    expect(pipeline[0].$match.stock.$lte).toBe(7);
    expect(pipeline[0].$match.stock.$gte).toBeUndefined();

    // updatedFrom only
    Product.aggregate.mockReturnValueOnce({ allowDiskUse: () => Promise.resolve([{ items: [], total: 0 }]) });
    svc = new SellerProductsService();
    await svc.list({ role: "seller", sellerId: "507f191e810c19729de860ea", query: { updatedFrom: "2024-01-01" } });
    pipeline = Product.aggregate.mock.calls.at(-1)[0];
    expect(pipeline[0].$match.updatedAt.$gte instanceof Date).toBe(true);
    expect(pipeline[0].$match.updatedAt.$lte).toBeUndefined();

    // updatedTo only
    Product.aggregate.mockReturnValueOnce({ allowDiskUse: () => Promise.resolve([{ items: [], total: 0 }]) });
    svc = new SellerProductsService();
    await svc.list({ role: "seller", sellerId: "507f191e810c19729de860ea", query: { updatedTo: "2025-01-01" } });
    pipeline = Product.aggregate.mock.calls.at(-1)[0];
    expect(pipeline[0].$match.updatedAt.$lte instanceof Date).toBe(true);
    expect(pipeline[0].$match.updatedAt.$gte).toBeUndefined();
  });


  describe("helpers extra (normalize & escape edge-cases)", () => {
    it("normalizeHebrew: covers geresh/gershayim + single-quote + hyphen + latin/digits", () => {
      const { normalizeHebrew } = __testables;
      // כולל גרשיים עבריים \u05F3 \u05F4, גרש ASCII, מקף, אות סופית, לטיני ומספרים
      const out = normalizeHebrew("אבג\u05F3\u05F4'  xyz-123  שָׁלוֹם  מלך");
      // גרשיים וגרש הוסרו; ם→מ, ך→כ; מקף נשמר; לטיני/ספרות נשארים
      expect(out).toBe("אבג xyz-123 שלומ מלכ");
    });

    it("escapeRegex: also handles undefined (String(s) path)", () => {
      const { escapeRegex } = __testables;
      expect(escapeRegex(undefined)).toBe("undefined");
    });
  });
  describe("list – search & projection missing lines", () => {
    it("opens search branch (99–101) with mixed nikud/quotes/brackets", async () => {
      Product.aggregate.mockReturnValueOnce({
        allowDiskUse: () => Promise.resolve([{ items: [], total: 0 }]),
      });
      const svc = new SellerProductsService();
      await svc.list({
        role: "seller",
        sellerId: "507f191e810c19729de860ea",
        query: { search: 'שָׁלוֹם\u05F3\u05F4 "[]()+.*' },
      });
      const pipeline = Product.aggregate.mock.calls.at(-1)[0];
      expect(Array.isArray(pipeline[0].$match.$or)).toBe(true);
      expect(pipeline[0].$match.$or.length).toBe(11);
    });

    it("projection augmentation: fields=images ⇒ adds variations._id only (covers line 132 then-branch)", async () => {
      Product.aggregate.mockReturnValueOnce({
        allowDiskUse: () => Promise.resolve([{ items: [], total: 0 }]),
      });
      const svc = new SellerProductsService();
      await svc.list({
        role: "admin",
        query: { fields: "images" }, // images כבר קיים, variations._id חסר
      });
      const pipeline = Product.aggregate.mock.calls.at(-1)[0];
      const proj = pipeline[2].$facet.items[2].$project;
      expect(proj.images).toBe(1);                // לא נוסף כי כבר היה
      expect(proj["variations._id"]).toBe(1);     // נוסף כאן (השורה 132)
    });
  });

  describe("createProduct – 11000 fallback branch", () => {
    it("409 on duplicate key without keyValue/keyPattern (falls back to 'uniqueField')", async () => {
      Product.mockImplementation(() => ({
        save: jest.fn().mockRejectedValue({ code: 11000 }), // בלי keyValue/keyPattern
      }));
      const svc = new SellerProductsService();
      await expect(svc.createProduct({ data: {}, actor: { id: "u" } }))
        .rejects.toMatchObject({
          status: 409,
          message: expect.stringMatching(/Duplicate/i),
        });
    });
  });

});


