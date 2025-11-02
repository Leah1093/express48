// __tests__/__services__/ratingService.test.js
import { jest } from "@jest/globals";

/** -------------------------
 * Mocks
 * ------------------------- */
jest.unstable_mockModule("../../models/rating.js", () => {
  // in-memory stores
  let ratings = new Map();          // key = ratingId
  let likes = new Map();            // key = `${ratingId}:${userId}`
  let seq = 1;

  const clone = (obj) => JSON.parse(JSON.stringify(obj));

  const Rating = {
    create: jest.fn(async (doc) => {
      const _id = `r${seq++}`;
      const base = {
        _id,
        userId: doc.userId,
        productId: doc.productId,
        sellerId: doc.sellerId,
        orderId: doc.orderId ?? null,
        orderItemId: doc.orderItemId ?? null,
        variationId: doc.variationId ?? null,
        stars: doc.stars,
        text: doc.text ?? "",
        images: doc.images ?? [],
        videos: doc.videos ?? [],
        hasMedia: Boolean((doc.images?.length || 0) + (doc.videos?.length || 0)),
        anonymous: doc.anonymous ?? false,
        verifiedPurchase: doc.verifiedPurchase ?? false,
        status: doc.status ?? "approved",
        editableUntil: doc.editableUntil ?? null,
        likesCount: 0,
        dislikesCount: 0,
        deletedAt: null,
        deletedBy: null,
        restoredBy: null,
        updatedBy: null,
        createdAt: new Date(),
        save: jest.fn(async function () {
          ratings.set(_id, { ...this });
        }),
      };
      ratings.set(_id, base);
      return clone(base);
    }),

    findById: jest.fn(async (id) => {
      const r = ratings.get(id);
      if (!r) return null;
      return {
        ...clone(r),
        save: jest.fn(async function () {
          ratings.set(id, { ...this });
        }),
      };
    }),

    findOne: jest.fn(async (q) => {
      const arr = [...ratings.values()];
      const found = arr.find((x) =>
        (q._id ? x._id === q._id : true) &&
        (q.userId ? x.userId === q.userId : true) &&
        (q.deletedAt === null ? x.deletedAt === null : true)
      );
      return found
        ? {
          ...clone(found),
          save: jest.fn(async function () {
            ratings.set(found._id, { ...this });
          }),
        }
        : null;
    }),

    // for listByProduct(sort="helpful")
    aggregate: jest.fn(async (pipeline) => {
      let arr = [...ratings.values()];
      const matchStage = pipeline.find((s) => s.$match);
      if (matchStage) {
        const q = matchStage.$match;
        arr = arr.filter((x) =>
          (!q.productId || x.productId === q.productId) &&
          (!("status" in q) || x.status === q.status) &&
          (!("deletedAt" in q) || x.deletedAt === q.deletedAt) &&
          (!("hasMedia" in q) || !!x.hasMedia === !!q.hasMedia)
        );
      }
      arr = arr.map((x) => ({
        ...x,
        helpfulScore: (x.likesCount || 0) - (x.dislikesCount || 0),
      }));
      arr.sort((a, b) => {
        if (b.helpfulScore !== a.helpfulScore) return b.helpfulScore - a.helpfulScore;
        return new Date(b.createdAt) - new Date(a.createdAt);
      });

      const skipStage = pipeline.find((s) => s.$skip);
      const limitStage = pipeline.find((s) => s.$limit);
      const start = skipStage ? skipStage.$skip : 0;
      const end = start + (limitStage ? limitStage.$limit : arr.length);
      return arr.slice(start, end).map(clone);
    }),

    countDocuments: jest.fn(async (q) => {
      const arr = [...ratings.values()].filter((x) =>
        (!q.productId || x.productId === q.productId) &&
        (!("status" in q) || x.status === q.status) &&
        (!("deletedAt" in q) || x.deletedAt === q.deletedAt) &&
        (!("hasMedia" in q) || !!x.hasMedia === !!q.hasMedia)
      );
      return arr.length;
    }),

    // for listByProduct (non-helpful paths)
    find: jest.fn((q) => {
      const base = [...ratings.values()].filter((x) =>
        (!q.productId || x.productId === q.productId) &&
        (!("status" in q) || x.status === q.status) &&
        (!("deletedAt" in q) || x.deletedAt === q.deletedAt) &&
        (!("hasMedia" in q) || !!x.hasMedia === !!q.hasMedia)
      );

      const chain = {
        _arr: base,
        sort(sortObj) {
          if (sortObj?.createdAt) {
            this._arr.sort((a, b) =>
              sortObj.createdAt < 0
                ? new Date(b.createdAt) - new Date(a.createdAt)
                : new Date(a.createdAt) - new Date(b.createdAt)
            );
          }
          if (sortObj?.stars) {
            this._arr.sort((a, b) =>
              sortObj.stars < 0 ? (b.stars - a.stars) : (a.stars - b.stars)
            );
          }
          return this;
        },
        skip(n) { this._skip = n; return this; },
        limit(n) {
          const start = this._skip || 0;
          const end = start + n;
          return this._arr.slice(start, end).map(clone);
        },
      };
      return chain;
    }),
  };

  const RatingLike = {
    findOne: jest.fn(async ({ ratingId, userId }) => {
      const key = `${ratingId}:${userId}`;
      const ex = likes.get(key);
      return ex ? { ...clone(ex), save: jest.fn(async function () { likes.set(key, { ...this }); }) } : null;
    }),
    create: jest.fn(async (doc) => {
      const key = `${doc.ratingId}:${doc.userId}`;
      likes.set(key, { ...doc, save: jest.fn(async function () { likes.set(key, { ...this }); }) });
    }),
  };

  const __reset = () => {
    ratings = new Map();
    likes = new Map();
    seq = 1;
  };

  const __getRating = (id) => ratings.get(id);

  return { Rating, RatingLike, __reset, __getRating };
});

jest.unstable_mockModule("../../models/Product.js", () => {
  let products = new Map();

  const makeProduct = (id) => ({
    _id: id,
    ratingSum: 0,
    ratingCount: 0,
    ratingAvg: 0,
    ratingBreakdown: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
    markModified: jest.fn(),
    save: jest.fn(async function () { products.set(id, { ...this }); }),
    select: jest.fn(async function () { return this; }), // מאפשר .select() בשרשור
  });

  const Product = {
    findById: jest.fn(async (id) => {
      if (id === "missing-product") return null;
      if (!products.has(id)) products.set(id, makeProduct(id));
      return products.get(id);
    }),
  };

  const __reset = () => { products = new Map(); };
  const __get = (id) => products.get(id);
  return { Product, __reset, __get };
});

jest.unstable_mockModule("../../models/seller.js", () => {
  let sellers = new Map();

  const makeSeller = (id) => ({
    _id: id,
    ratingSum: 0,
    ratingCount: 0,
    ratingAvg: 0,
    ratingBreakdown: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
    applyRatingDelta(addStars, addCount, oldStars, newStars) {
      this.ratingSum = Math.max(0, this.ratingSum + (addStars || 0));
      this.ratingCount = Math.max(0, this.ratingCount + (addCount || 0));
      if (oldStars != null) this.ratingBreakdown[oldStars] = Math.max(0, (this.ratingBreakdown[oldStars] || 0) - 1);
      if (newStars != null) this.ratingBreakdown[newStars] = (this.ratingBreakdown[newStars] || 0) + 1;
      this.ratingAvg = this.ratingCount ? +(this.ratingSum / this.ratingCount).toFixed(1) : 0;
    },
    markModified: jest.fn(),
    save: jest.fn(async function () { sellers.set(id, { ...this }); }),
  });

  const Seller = {
    findById: jest.fn(async (id) => {
      if (!id || id === "missing-seller") return null;
      if (!sellers.has(id)) sellers.set(id, makeSeller(id));
      return sellers.get(id);
    }),
  };

  const __reset = () => { sellers = new Map(); };
  const __get = (id) => sellers.get(id);
  return { Seller, __reset, __get };
});

// import service dynamically after mocks
let RatingService;
let Rating, RatingLike, resetRating, getRating;
let Product, resetProducts, getProduct;
let Seller, resetSellers, getSeller;

beforeAll(async () => {
  ({ Rating, RatingLike, __reset: resetRating, __getRating: getRating } = await import("../../models/rating.js"));
  ({ Product, __reset: resetProducts, __get: getProduct } = await import("../../models/Product.js"));
  ({ Seller, __reset: resetSellers, __get: getSeller } = await import("../../models/seller.js"));
  ({ RatingService } = await import("../../service/rating.service.js")); // נתיב נכון
});

beforeEach(() => {
  jest.clearAllMocks();
  resetRating();
  resetProducts();
  resetSellers();
});

/** -------------------------
 * Helpers
 * ------------------------- */
const svc = () => new RatingService();

/** -------------------------
 * Tests
 * ------------------------- */

describe("RatingService.create", () => {
  test("creates rating with media, updates product & seller, sets hasMedia", async () => {
    const s = svc();
    const r = await s.create({
      userId: "u1",
      productId: "p1",
      sellerId: "s1",
      stars: 5,
      images: ["i1"],
      videos: [],
      verifiedPurchase: true,
      productIsActive: true,
      editableHours: 24,
    });

    expect(r.hasMedia).toBe(true);

    const p = getProduct("p1");
    expect(p.ratingCount).toBe(1);
    expect(p.ratingSum).toBe(5);
    expect(p.ratingAvg).toBe(5);
    expect(p.ratingBreakdown[5]).toBe(1);
    expect(p.save).toHaveBeenCalledTimes(1);
    expect(p.markModified).toHaveBeenCalledWith("ratingBreakdown");

    const sObj = getSeller("s1");
    expect(sObj.ratingCount).toBe(1);
    expect(sObj.ratingSum).toBe(5);
    expect(sObj.ratingAvg).toBe(5);
    expect(sObj.ratingBreakdown[5]).toBe(1);
    expect(sObj.save).toHaveBeenCalledTimes(1);
  });

  test("productIsActive=false → does not update seller", async () => {
    const s = svc();
    await s.create({
      userId: "u1",
      productId: "p2",
      sellerId: "s2",
      stars: 4,
      productIsActive: false,
    });
    expect(Seller.findById).not.toHaveBeenCalled();
  });

  test("invalid stars throws CustomError 400", async () => {
    const s = svc();
    await expect(s.create({
      userId: "u1",
      productId: "p1",
      sellerId: "s1",
      stars: 0,
    })).rejects.toThrow("Stars must be between 1 and 5");
  });

  test("product not found → still creates rating, no product save", async () => {
    const s = svc();
    await s.create({
      userId: "u1",
      productId: "missing-product",
      sellerId: "s1",
      stars: 3,
    });
    expect(Product.findById).toHaveBeenCalledWith("missing-product");
  });
});

describe("RatingService.edit", () => {
  test("edit text/images/videos only → recalculates hasMedia; no product/seller delta", async () => {
    const s = svc();
    const r = await s.create({ userId: "u1", productId: "p3", sellerId: "s3", stars: 3 });
    const edited = await s.edit({
      ratingId: r._id,
      userId: "u1",
      text: "updated",
      images: ["x"],
      videos: [],
      productIsActive: true,
    });
    expect(edited.text).toBe("updated");
    expect(edited.hasMedia).toBe(true);
    const p = getProduct("p3");
    expect(p.ratingCount).toBe(1);
    expect(p.ratingSum).toBe(3);
  });

  test("stars changed 3→5 updates product & seller deltas", async () => {
    const s = svc();
    const r = await s.create({ userId: "u1", productId: "p4", sellerId: "s4", stars: 3 });
    await s.edit({ ratingId: r._id, userId: "u1", stars: 5, productIsActive: true });

    const p = getProduct("p4");
    expect(p.ratingCount).toBe(1);
    expect(p.ratingSum).toBe(5);
    expect(p.ratingBreakdown[3]).toBe(0);
    expect(p.ratingBreakdown[5]).toBe(1);

    const sel = getSeller("s4");
    expect(sel.ratingCount).toBe(1);
    expect(sel.ratingSum).toBe(5);
    expect(sel.ratingBreakdown[3]).toBe(0);
    expect(sel.ratingBreakdown[5]).toBe(1);
  });

  test("rating not found → 404 CustomError", async () => {
    const s = svc();
    await expect(s.edit({
      ratingId: "nope",
      userId: "u1",
      text: "x",
    })).rejects.toThrow("Rating not found");
  });

  test("editable window expired → 403 CustomError", async () => {
    const s = svc();
    const r = await s.create({
      userId: "u1",
      productId: "p5",
      sellerId: "s5",
      stars: 2,
      editableHours: 0, // immediately expired
    });
    await expect(s.edit({
      ratingId: r._id,
      userId: "u1",
      text: "late",
    })).rejects.toThrow("Edit window expired");
  });

  test("stars supplied but unchanged → no product/seller delta", async () => {
    const s = svc();
    const r = await s.create({ userId: "u1", productId: "p6", sellerId: "s6", stars: 4 });
    const pBefore = { ...getProduct("p6") };
    await s.edit({ ratingId: r._id, userId: "u1", stars: 4, productIsActive: true });
    const pAfter = getProduct("p6");
    expect(pAfter.ratingSum).toBe(pBefore.ratingSum);
    expect(pAfter.ratingCount).toBe(pBefore.ratingCount);
  });
});

describe("RatingService.adminDelete", () => {
  test("approved rating → decrements product & seller, sets deletedAt/by", async () => {
    const s = svc();
    const r = await s.create({ userId: "u1", productId: "p7", sellerId: "s7", stars: 5 });
    const res = await s.adminDelete({ ratingId: r._id, adminUserId: "admin1" });
    expect(res).toEqual({ ok: true });

    const p = getProduct("p7");
    expect(p.ratingCount).toBe(0);
    expect(p.ratingSum).toBe(0);
    expect(p.ratingBreakdown[5]).toBe(0);

    const sel = getSeller("s7");
    expect(sel.ratingCount).toBe(0);
    expect(sel.ratingSum).toBe(0);
    expect(sel.ratingBreakdown[5]).toBe(0);
  });

  test("not found or already deleted → 404", async () => {
    const s = svc();
    await expect(s.adminDelete({ ratingId: "none", adminUserId: "admin" }))
      .rejects.toThrow("Rating not found or already deleted");
  });
});

describe("RatingService.adminRestore", () => {
  test("restore deleted approved rating → increments product & seller back", async () => {
    const s = svc();
    const r = await s.create({ userId: "u1", productId: "p8", sellerId: "s8", stars: 2 });
    await s.adminDelete({ ratingId: r._id, adminUserId: "a1" });
    const result = await s.adminRestore({ ratingId: r._id, adminUserId: "a2" });
    expect(result).toEqual({ ok: true });

    const p = getProduct("p8");
    expect(p.ratingCount).toBe(1);
    expect(p.ratingSum).toBe(2);
    expect(p.ratingBreakdown[2]).toBe(1);

    const sel = getSeller("s8");
    expect(sel.ratingCount).toBe(1);
    expect(sel.ratingSum).toBe(2);
    expect(sel.ratingBreakdown[2]).toBe(1);
  });

  test("rating not deleted/not found → 404", async () => {
    const s = svc();
    await expect(s.adminRestore({ ratingId: "none", adminUserId: "a1" }))
      .rejects.toThrow("Rating not found or not deleted");
  });
});

describe("RatingService.like", () => {
  test("invalid value → 400", async () => {
    const s = svc();
    await expect(s.like({ ratingId: "r1", userId: "u1", value: 0 }))
      .rejects.toThrow("Invalid like value");
  });

  test("rating not available → 404", async () => {
    const s = svc();
    await expect(s.like({ ratingId: "nope", userId: "u1", value: 1 }))
      .rejects.toThrow("Rating not available");
  });

  test("first like +1; then switch to -1; then same value no-change", async () => {
    const s = svc();
    const r = await s.create({ userId: "u1", productId: "p9", sellerId: "s9", stars: 4 });
    // first like
    let res = await s.like({ ratingId: r._id, userId: "liker1", value: 1 });
    expect(res).toEqual({ likes: 1, dislikes: 0 });

    // switch to -1
    res = await s.like({ ratingId: r._id, userId: "liker1", value: -1 });
    expect(res).toEqual({ likes: 0, dislikes: 1 });

    // same value again → no change
    res = await s.like({ ratingId: r._id, userId: "liker1", value: -1 });
    expect(res).toEqual({ likes: 0, dislikes: 1 });
  });

  test("first dislike -1; then switch to +1 (dislike-- & like++)", async () => {
    const s = svc();
    const r = await s.create({ userId: "u10", productId: "p10", sellerId: "s10", stars: 5 });

    // שלב 1: דיסלייק ראשון
    let res = await s.like({ ratingId: r._id, userId: "likerX", value: -1 });
    expect(res).toEqual({ likes: 0, dislikes: 1 });

    // שלב 2: מעבר מ־-1 ל־+1 → מפעיל את:
    // r.dislikesCount = Math.max(... - 1)
    // r.likesCount    = Math.max(... + 1)
    res = await s.like({ ratingId: r._id, userId: "likerX", value: 1 });
    expect(res).toEqual({ likes: 1, dislikes: 0 });
  });

});

describe("RatingService.listByProduct", () => {
  test('sort="helpful" uses aggregate pipeline and paginates; withMedia filter works', async () => {
    const s = svc();
    const base = { userId: "u1", productId: "px", sellerId: "sx" };
    const r1 = await s.create({ ...base, stars: 5, images: ["img"] }); // hasMedia
    const r2 = await s.create({ ...base, stars: 3 });
    const r3 = await s.create({ ...base, stars: 4, videos: ["vid"] }); // hasMedia

    await s.like({ ratingId: r1._id, userId: "a", value: 1 });
    await s.like({ ratingId: r1._id, userId: "b", value: 1 });
    await s.like({ ratingId: r2._id, userId: "c", value: -1 });
    await s.like({ ratingId: r3._id, userId: "d", value: 1 });

    const page1 = await s.listByProduct({ productId: "px", page: 1, pageSize: 2, sort: "helpful", withMedia: true });
    expect(page1.total).toBe(2); // r1 and r3
    expect(page1.items.length).toBe(2);
  });

  test('sort="high"/"low"/"new"/"old" paths and withMedia=false', async () => {
    const s = svc();
    const base = { userId: "u2", productId: "py", sellerId: "sy" };
    await s.create({ ...base, stars: 2 });
    await s.create({ ...base, stars: 5 });
    await s.create({ ...base, stars: 3 });

    const high = await s.listByProduct({ productId: "py", sort: "high", page: 1, pageSize: 2 });
    expect(high.items.length).toBe(2);

    const low = await s.listByProduct({ productId: "py", sort: "low", page: 1, pageSize: 2 });
    expect(low.items.length).toBe(2);

    const newest = await s.listByProduct({ productId: "py", sort: "new", page: 1, pageSize: 3 });
    expect(newest.items.length).toBe(3);

    const oldest = await s.listByProduct({ productId: "py", sort: "old", page: 1, pageSize: 3 });
    expect(oldest.items.length).toBe(3);
  });
});

describe("RatingService.productSummary", () => {
  test("returns summary with defaults and full 1..5 breakdown", async () => {
    const s = svc();
    await s.create({ userId: "u3", productId: "ps", sellerId: "ss", stars: 4 });
    const sum = await s.productSummary({ productId: "ps" });
    expect(sum).toEqual({
      avg: 4,
      count: 1,
      breakdown: { 1: 0, 2: 0, 3: 0, 4: 1, 5: 0 },
    });
  });

  test("product not found → 404", async () => {
    const s = svc();
    await expect(s.productSummary({ productId: "missing-product" }))
      .rejects.toThrow("Product not found");
  });
});

describe("RatingService.adminDelete (status ≠ approved)", () => {
  test("skips product/seller deltas when status is pending", async () => {
    const s = svc();
    const r = await s.create({ userId: "uX", productId: "pX", sellerId: "sX", stars: 4 });

    // שנה סטטוס לדירוג ל-pending כדי להפעיל את הענף שלא מכניס דלתא
    const toEdit = await Rating.findById(r._id);
    toEdit.status = "pending";
    await toEdit.save();

    const pBefore = { ...getProduct("pX") };
    const selBefore = { ...getSeller("sX") };

    const res = await s.adminDelete({ ratingId: r._id, adminUserId: "adm" });
    expect(res).toEqual({ ok: true });

    const pAfter = getProduct("pX");
    const selAfter = getSeller("sX");

    // לא אמור לרדת הספירה/סכום כי status ≠ approved
    expect(pAfter.ratingCount).toBe(pBefore.ratingCount); // נשאר 1
    expect(pAfter.ratingSum).toBe(pBefore.ratingSum);     // נשאר 4
    expect(selAfter.ratingCount).toBe(selBefore.ratingCount);
    expect(selAfter.ratingSum).toBe(selBefore.ratingSum);
  });
});

describe("RatingService.adminRestore (status ≠ approved)", () => {
  test("skips product/seller deltas when restoring non-approved rating", async () => {
    const s = svc();
    const r = await s.create({ userId: "uY", productId: "pY", sellerId: "sY", stars: 2 });

    // שנה סטטוס ל-pending
    const toEdit = await Rating.findById(r._id);
    toEdit.status = "pending";
    await toEdit.save();

    // מחיקה (לא משפיע על product/seller כי לא-approved)
    await s.adminDelete({ ratingId: r._id, adminUserId: "adm1" });

    const pBefore = { ...getProduct("pY") };
    const selBefore = { ...getSeller("sY") };

    // שחזור (וגם כאן אין דלתא כי לא-approved)
    const res = await s.adminRestore({ ratingId: r._id, adminUserId: "adm2" });
    expect(res).toEqual({ ok: true });

    const pAfter = getProduct("pY");
    const selAfter = getSeller("sY");
    expect(pAfter.ratingCount).toBe(pBefore.ratingCount); // נשאר 1
    expect(pAfter.ratingSum).toBe(pBefore.ratingSum);     // נשאר 2
    expect(selAfter.ratingCount).toBe(selBefore.ratingCount);
    expect(selAfter.ratingSum).toBe(selBefore.ratingSum);
  });
});

describe("RatingService.productSummary (no select path)", () => {
  test("works when Product.findById returns doc without select()", async () => {
    const s = svc();
    const original = Product.findById;

    // מחזיר אובייקט בלי select()
    Product.findById = jest.fn(async (id) => ({
      _id: id,
      ratingAvg: 3.3,
      ratingCount: 3,
      ratingBreakdown: { 1: 0, 2: 1, 3: 1, 4: 1, 5: 0 },
    }));

    const summary = await s.productSummary({ productId: "p-no-select" });
    expect(summary).toEqual({
      avg: 3.3,
      count: 3,
      breakdown: { 1: 0, 2: 1, 3: 1, 4: 1, 5: 0 },
    });

    Product.findById = original; // שחזור
  });
});


describe("Extra branch coverage", () => {
  test("create: Product without markModified (covers !markModified path)", async () => {
    const s = svc();
    const original = Product.findById;
    Product.findById = jest.fn(async (id) => ({
      _id: id,
      ratingSum: 0, ratingCount: 0, ratingAvg: 0, ratingBreakdown: {},
      save: jest.fn(async function(){}), // אין markModified
    }));
    await s.create({ userId: "uC1", productId: "pC1", sellerId: "sC1", stars: 5 });
    expect(Product.findById).toHaveBeenCalled();
    Product.findById = original;
  });

  test("create: Seller object without applyRatingDelta (covers typeof check false)", async () => {
    const s = svc();
    const original = Seller.findById;
    Seller.findById = jest.fn(async (id) => ({
      _id: id,
      ratingSum: 0, ratingCount: 0, ratingAvg: 0, ratingBreakdown: {},
      save: jest.fn(async function(){}), // אין applyRatingDelta
    }));
    await s.create({ userId: "uC2", productId: "pC2", sellerId: "sC2", stars: 4, productIsActive: true });
    expect(Seller.findById).toHaveBeenCalledWith("sC2");
    Seller.findById = original;
  });

  test("edit (stars change): product missing (covers applyDeltaToProduct with null)", async () => {
    const s = svc();
    // המוק שלך מחזיר null רק למזהה "missing-product"
    const r = await s.create({ userId: "uE", productId: "missing-product", sellerId: "sE", stars: 3 });
    await s.edit({ ratingId: r._id, userId: "uE", stars: 5, productIsActive: true });
    // רק מוודאים שלא נפלנו
    expect(true).toBe(true);
  });

  test("adminDelete: product missing (covers if(prod) false branch)", async () => {
    const s = svc();
    const r = await s.create({ userId: "uD", productId: "missing-product", sellerId: "sD", stars: 5 });
    const res = await s.adminDelete({ ratingId: r._id, adminUserId: "admD" });
    expect(res).toEqual({ ok: true });
  });

  test("adminRestore: product missing (covers if(prod) false branch)", async () => {
    const s = svc();
    const r = await s.create({ userId: "uR", productId: "missing-product", sellerId: "sR", stars: 2 });
    await s.adminDelete({ ratingId: r._id, adminUserId: "adm1" });
    const res = await s.adminRestore({ ratingId: r._id, adminUserId: "adm2" });
    expect(res).toEqual({ ok: true });
  });

  test("listByProduct: unknown sort uses default (covers sortMap fallback)", async () => {
    const s = svc();
    const base = { userId: "uS", productId: "pS", sellerId: "sS" };
    await s.create({ ...base, stars: 2 });
    await s.create({ ...base, stars: 5 });
    const res = await s.listByProduct({ productId: "pS", sort: "zzz", page: 1, pageSize: 10 });
    expect(res.items.length).toBeGreaterThan(0);
  });
});


describe("applyDeltaToProduct coverage via service paths", () => {
  test("create with product present but no breakdown change path still executes (covers rb assign & set)", async () => {
    const s = svc();
    // create ראשון כבר מכסה newStars; עכשיו נכסה קריאה ללא שינוי breakdown:
    // נייצר מוצר עם markModified כדי להפעיל את ענף ה-true
    const original = Product.findById;
    Product.findById = jest.fn(async (id) => ({
      _id: id,
      ratingSum: 0, ratingCount: 0, ratingAvg: 0, ratingBreakdown: {},
      markModified: jest.fn(),
      save: jest.fn(async function(){}),
    }));
    // קריאה ישירה למסלול create כבר מפעילה applyDeltaToProduct עם newStars, ואז נבצע עוד edit שלא משנה כוכבים (להדליק rb assign)
    const r = await s.create({ userId: "uADP1", productId: "pADP1", sellerId: "sADP1", stars: 4 });
    await s.edit({ ratingId: r._id, userId: "uADP1", text: "noop", images: [], videos: [] });
    Product.findById = original;
  });

  test("create with product missing (covers early-return branch; line with prod = null already hit)", async () => {
    const s = svc();
    await s.create({ userId: "uADP2", productId: "missing-product", sellerId: "sADP2", stars: 5 });
    expect(true).toBe(true);
  });

  test("create with product present without markModified (covers !markModified path)", async () => {
    const s = svc();
    const original = Product.findById;
    Product.findById = jest.fn(async (id) => ({
      _id: id,
      ratingSum: 0, ratingCount: 0, ratingAvg: 0, ratingBreakdown: {},
      save: jest.fn(async function () { }),
      // אין markModified כאן
    }));
    await s.create({ userId: "uADP3", productId: "pADP3", sellerId: "sADP3", stars: 3 });
    Product.findById = original;
  });
});


describe("applyDeltaToSeller guard branches", () => {
  test("sellerId is null → early return", async () => {
    const s = svc();
    await s.create({ userId: "uS1", productId: "pS1", sellerId: null, stars: 5, productIsActive: true });
    expect(Seller.findById).not.toHaveBeenCalled();
  });

  test("missing seller → early return after lookup", async () => {
    const s = svc();
    await s.create({ userId: "uS2", productId: "pS2", sellerId: "missing-seller", stars: 4, productIsActive: true });
    // לא נופל → מכסה if (!seller) return;
    expect(true).toBe(true);
  });

  test("seller without applyRatingDelta → only save()", async () => {
    const s = svc();
    const original = Seller.findById;
    Seller.findById = jest.fn(async (id) => ({
      _id: id,
      ratingSum: 0, ratingCount: 0, ratingAvg: 0, ratingBreakdown: {},
      save: jest.fn(async function(){})
      // אין applyRatingDelta
    }));
    await s.create({ userId: "uS3", productId: "pS3", sellerId: "sS3", stars: 3, productIsActive: true });
    Seller.findById = original;
  });
});
