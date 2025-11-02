import { jest } from "@jest/globals";

/** -------------------------
 * Mock RatingService (ESM)
 * ------------------------- */
let methods;
jest.unstable_mockModule("../../service/rating.service.js", () => {
  methods = {
    create: jest.fn(),
    edit: jest.fn(),
    like: jest.fn(),
    adminDelete: jest.fn(),
    adminRestore: jest.fn(),
    listByProduct: jest.fn(),
    productSummary: jest.fn(),
  };
  class RatingService {
    constructor() { Object.assign(this, methods); }
  }
  return { RatingService, __methods: methods };
});

/** import controller AFTER mocks */
let RatingController;
beforeAll(async () => {
  ({ RatingController } = await import("../../controllers/rating.controller.js"));
});

beforeEach(() => {
  jest.clearAllMocks();
  Object.values(methods).forEach(fn => fn.mockReset && fn.mockReset());
});

/** helpers */
const mkRes = () => ({ json: jest.fn() });
const mkNext = () => jest.fn();

/** -------------------------
 * Tests
 * ------------------------- */
describe("RatingController.create", () => {
  test("passes all fields (incl. _ratingContext) and returns ok + rating", async () => {
    const ctrl = new RatingController();
    const req = {
      user: { _id: "u1" },
      body: {
        productId: "p1", orderId: "o1", orderItemId: "oi1", variationId: "v1",
        stars: 5, text: "t", images: ["i"], videos: ["v"], anonymous: true,
      },
      _ratingContext: { sellerId: "s1", productIsActive: true, verifiedPurchase: true },
    };
    const res = mkRes();
    const next = mkNext();

    const fakeRating = { _id: "r1" };
    methods.create.mockResolvedValue(fakeRating);

    await ctrl.create(req, res, next);

    expect(methods.create).toHaveBeenCalledWith({
      userId: "u1",
      productId: "p1",
      sellerId: "s1",
      orderId: "o1",
      orderItemId: "oi1",
      variationId: "v1",
      stars: 5,
      text: "t",
      images: ["i"],
      videos: ["v"],
      anonymous: true,
      verifiedPurchase: true,
      productIsActive: true,
    });
    expect(res.json).toHaveBeenCalledWith({ ok: true, rating: fakeRating });
    expect(next).not.toHaveBeenCalled();
  });

  test("on error calls next(err)", async () => {
    const ctrl = new RatingController();
    const req = { user: { _id: "u1" }, body: { productId: "p1", stars: 5 }, _ratingContext: {} };
    const res = mkRes(); const next = mkNext();
    const err = new Error("boom");
    methods.create.mockRejectedValue(err);

    await ctrl.create(req, res, next);
    expect(next).toHaveBeenCalledWith(err);
  });
});

describe("RatingController.edit", () => {
  test("passes updaterUserId=userId and productIsActive=true", async () => {
    const ctrl = new RatingController();
    const req = {
      user: { _id: "u2" },
      params: { ratingId: "r2" },
      body: { stars: 4, text: "x", images: ["a"], videos: [] },
    };
    const res = mkRes(); const next = mkNext();
    const fake = { _id: "r2", stars: 4 };
    methods.edit.mockResolvedValue(fake);

    await ctrl.edit(req, res, next);

    expect(methods.edit).toHaveBeenCalledWith({
      ratingId: "r2",
      userId: "u2",
      stars: 4,
      text: "x",
      images: ["a"],
      videos: [],
      productIsActive: true,
      updaterUserId: "u2",
    });
    expect(res.json).toHaveBeenCalledWith({ ok: true, rating: fake });
  });

  test("on error calls next(err)", async () => {
    const ctrl = new RatingController();
    const req = { user: { _id: "u" }, params: { ratingId: "r" }, body: {} };
    const res = mkRes(); const next = mkNext();
    methods.edit.mockRejectedValue(new Error("bad"));

    await ctrl.edit(req, res, next);
    expect(next).toHaveBeenCalled();
  });
});

describe("RatingController.like", () => {
  test("casts value to Number and returns likes/dislikes", async () => {
    const ctrl = new RatingController();
    const req = { user: { _id: "u3" }, params: { ratingId: "r3" }, body: { value: "1" } };
    const res = mkRes(); const next = mkNext();
    methods.like.mockResolvedValue({ likes: 2, dislikes: 0 });

    await ctrl.like(req, res, next);

    expect(methods.like).toHaveBeenCalledWith({ ratingId: "r3", userId: "u3", value: 1 });
    expect(res.json).toHaveBeenCalledWith({ ok: true, likes: 2, dislikes: 0 });
  });

  test("on error calls next(err)", async () => {
    const ctrl = new RatingController();
    const req = { user: { _id: "u" }, params: { ratingId: "r" }, body: { value: "-1" } };
    const res = mkRes(); const next = mkNext();
    methods.like.mockRejectedValue(new Error("bad"));

    await ctrl.like(req, res, next);
    expect(next).toHaveBeenCalled();
  });
});

describe("RatingController.adminDelete", () => {
  test("returns out", async () => {
    const ctrl = new RatingController();
    const req = { user: { _id: "admin" }, params: { ratingId: "r4" } };
    const res = mkRes(); const next = mkNext();
    methods.adminDelete.mockResolvedValue({ ok: true });

    await ctrl.adminDelete(req, res, next);

    expect(methods.adminDelete).toHaveBeenCalledWith({ ratingId: "r4", adminUserId: "admin" });
    expect(res.json).toHaveBeenCalledWith({ ok: true });
  });

  test("on error calls next(err)", async () => {
    const ctrl = new RatingController();
    const req = { user: { _id: "admin" }, params: { ratingId: "r" } };
    const res = mkRes(); const next = mkNext();
    methods.adminDelete.mockRejectedValue(new Error("bad"));

    await ctrl.adminDelete(req, res, next);
    expect(next).toHaveBeenCalled();
  });
});

describe("RatingController.adminRestore", () => {
  test("returns out", async () => {
    const ctrl = new RatingController();
    const req = { user: { _id: "admin2" }, params: { ratingId: "r5" } };
    const res = mkRes(); const next = mkNext();
    methods.adminRestore.mockResolvedValue({ ok: true });

    await ctrl.adminRestore(req, res, next);

    expect(methods.adminRestore).toHaveBeenCalledWith({ ratingId: "r5", adminUserId: "admin2" });
    expect(res.json).toHaveBeenCalledWith({ ok: true });
  });

  test("on error calls next(err)", async () => {
    const ctrl = new RatingController();
    const req = { user: { _id: "admin" }, params: { ratingId: "r" } };
    const res = mkRes(); const next = mkNext();
    methods.adminRestore.mockRejectedValue(new Error("bad"));

    await ctrl.adminRestore(req, res, next);
    expect(next).toHaveBeenCalled();
  });
});

describe("RatingController.listByProduct", () => {
  test("casts page/pageSize to Number and withMedia from string", async () => {
    const ctrl = new RatingController();
    const req = {
      params: { productId: "pL" },
      query: { page: "2", pageSize: "5", sort: "helpful", withMedia: "true" },
    };
    const res = mkRes(); const next = mkNext();
    const payload = { items: [1], total: 1, page: 2, pageSize: 5 };
    methods.listByProduct.mockResolvedValue(payload);

    await ctrl.listByProduct(req, res, next);

    expect(methods.listByProduct).toHaveBeenCalledWith({
      productId: "pL",
      page: 2,
      pageSize: 5,
      sort: "helpful",
      withMedia: true,
    });
    expect(res.json).toHaveBeenCalledWith(payload);
  });

  test("withMedia defaults false when query is 'false' or missing", async () => {
    const ctrl = new RatingController();
    const req = { params: { productId: "pM" }, query: { page: "1", pageSize: "10", sort: "new", withMedia: "false" } };
    const res = mkRes(); const next = mkNext();
    const payload = { items: [], total: 0, page: 1, pageSize: 10 };
    methods.listByProduct.mockResolvedValue(payload);

    await ctrl.listByProduct(req, res, next);
    expect(methods.listByProduct).toHaveBeenCalledWith({
      productId: "pM",
      page: 1,
      pageSize: 10,
      sort: "new",
      withMedia: false,
    });
    expect(res.json).toHaveBeenCalledWith(payload);
  });

  test("on error calls next(err)", async () => {
    const ctrl = new RatingController();
    const req = { params: { productId: "pE" }, query: {} };
    const res = mkRes(); const next = mkNext();
    methods.listByProduct.mockRejectedValue(new Error("bad"));

    await ctrl.listByProduct(req, res, next);
    expect(next).toHaveBeenCalled();
  });
});

describe("RatingController.productSummary", () => {
  test("returns out", async () => {
    const ctrl = new RatingController();
    const req = { params: { productId: "pS" } };
    const res = mkRes(); const next = mkNext();
    const payload = { avg: 4.2, count: 3, breakdown: { 1:0,2:1,3:1,4:1,5:0 } };
    methods.productSummary.mockResolvedValue(payload);

    await ctrl.productSummary(req, res, next);

    expect(methods.productSummary).toHaveBeenCalledWith({ productId: "pS" });
    expect(res.json).toHaveBeenCalledWith(payload);
  });

  test("on error calls next(err)", async () => {
    const ctrl = new RatingController();
    const req = { params: { productId: "pS" } };
    const res = mkRes(); const next = mkNext();
    methods.productSummary.mockRejectedValue(new Error("bad"));

    await ctrl.productSummary(req, res, next);
    expect(next).toHaveBeenCalled();
  });
});

test("create without _ratingContext (triggers fallback `|| {}`)", async () => {
  const ctrl = new RatingController();
  const req = {
    user: { _id: "u0" },
    body: {
      productId: "p0",
      stars: 5,
      // לא מעבירים text/images/videos/anonymous/variationId בכוונה
    },
    // שימי לב: אין כאן _ratingContext בכלל
  };
  const res = { json: jest.fn() };
  const next = jest.fn();

  const fakeRating = { _id: "r0" };
  methods.create.mockResolvedValue(fakeRating);

  await ctrl.create(req, res, next);

  // מוודאים שנקרא עם fallback (sellerId / verifiedPurchase / productIsActive לא מוגדרים)
  expect(methods.create).toHaveBeenCalledWith(expect.objectContaining({
    userId: "u0",
    productId: "p0",
    stars: 5,
    sellerId: undefined,
    verifiedPurchase: undefined,
    productIsActive: undefined,
  }));

  // ושמחזירים תשובה רגילה
  expect(res.json).toHaveBeenCalledWith({ ok: true, rating: fakeRating });
  expect(next).not.toHaveBeenCalled();
});

