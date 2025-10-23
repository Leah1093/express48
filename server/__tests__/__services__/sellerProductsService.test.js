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
});
