import { jest } from "@jest/globals";

// --- mock: service layer as a class that returns a single captured instance ---
jest.unstable_mockModule("../../service/sellerProducts.service.js", () => {
  const instances = [];
  const makeInstance = () => ({
    list: jest.fn(),
    getOne: jest.fn(),
    update: jest.fn(),
    createProduct: jest.fn(),
    softDelete: jest.fn(),
    restore: jest.fn(),
    updateStatus: jest.fn(),
  });

  const SellerProductsService = jest.fn(() => {
    const inst = makeInstance();
    instances.push(inst);
    return inst;
  });

  return { __esModule: true, SellerProductsService, __instances: instances };
});

// --- mock: zod schemas (we control parse() result/throw per test) ---
jest.unstable_mockModule("../../validations/sellerProductsSchemas.js", () => {
  const listQuerySchema = { parse: jest.fn((raw) => raw) };
  const idParamSchema = { parse: jest.fn((raw) => raw) };
  const updateStatusSchema = { parse: jest.fn((raw) => raw) };
  return { __esModule: true, listQuerySchema, idParamSchema, updateStatusSchema };
});

// dynamic imports AFTER mocks:
const { default: SellerProductsController } = await import(
  "../../controllers/sellerProducts.controller.js"
);
const { __instances } = await import("../../service/sellerProducts.service.js");
const { listQuerySchema, idParamSchema, updateStatusSchema } = await import(
  "../../validations/sellerProductsSchemas.js"
);

const makeRes = () => {
  const res = {};
  res.status = jest.fn(() => res);
  res.json = jest.fn(() => res);
  res.end = jest.fn(() => res);
  res.setHeader = jest.fn();
  return res;
};

const makeNext = () => jest.fn();

const ctrl = new SellerProductsController();
const svc = __instances[0];

afterEach(() => {
  jest.clearAllMocks();
});

// -------------------- LIST --------------------
describe("SellerProductsController.list", () => {
  it("200 success -> returns service.list result", async () => {
    const res = makeRes();
    const next = makeNext();

    listQuerySchema.parse.mockReturnValue({ page: 1, limit: 3 });
    svc.list.mockResolvedValue({ items: [{ _id: "1" }], total: 1 });

    const req = {
      auth: { role: "seller", sellerId: "S1", storeId: "ST1" },
      query: { page: "1", limit: "3", empty: "" }, // ריק יהפוך ל-undefined לפני parse
    };

    await ctrl.list(req, res, next);

    expect(svc.list).toHaveBeenCalledWith(
      expect.objectContaining({
        sellerId: "S1",
        storeId: "ST1",
        role: "seller",
        query: { page: 1, limit: 3 },
      })
    );

    expect(res.json).toHaveBeenCalledWith({ items: [{ _id: "1" }], total: 1 });
    expect(next).not.toHaveBeenCalled();
  });

  it("422 ZodError", async () => {
    const res = makeRes();
    const next = makeNext();
    const err = new Error("bad");
    err.name = "ZodError";
    err.errors = [{ path: "p", message: "mm" }];

    listQuerySchema.parse.mockImplementation(() => {
      throw err;
    });

    const req = { auth: {}, query: { page: "x" } };

    await ctrl.list(req, res, next);

    expect(res.status).toHaveBeenCalledWith(422);
    expect(res.json).toHaveBeenCalledWith({
      error: "ValidationError",
      details: err.errors,
    });
  });

  it("passes unknown errors to next", async () => {
    const res = makeRes();
    const next = makeNext();

    listQuerySchema.parse.mockReturnValue({});
    svc.list.mockRejectedValue(new Error("boom"));

    await ctrl.list({ auth: {}, query: {} }, res, next);
    expect(next).toHaveBeenCalledWith(expect.any(Error));
  });

  it("list: resolves role from auth.roles[0] when auth.role missing", async () => {
    const res = makeRes();
    const next = makeNext();

    listQuerySchema.parse.mockReturnValue({ page: 1, limit: 3 });
    svc.list.mockResolvedValue({ items: [], total: 0 });

    const req = {
      auth: { roles: ["seller"], sellerId: "S1", storeId: "ST1" }, // אין role, רק roles[]
      query: { page: "1", limit: "3" },
    };

    await ctrl.list(req, res, next);

    expect(svc.list).toHaveBeenCalledWith(
      expect.objectContaining({
        role: "seller",
        sellerId: "S1",
        storeId: "ST1",
        query: { page: 1, limit: 3 },
      })
    );
    expect(res.json).toHaveBeenCalledWith({ items: [], total: 0 });
  });

  it("list: handles missing req.query (Object.entries(req.query || {}))", async () => {
    const res = makeRes();
    const next = makeNext();

    listQuerySchema.parse.mockReturnValue({});
    svc.list.mockResolvedValue({ items: [], total: 0 });

    await ctrl.list({ auth: { role: "seller", sellerId: "S1", storeId: "ST1" } }, res, next);

    expect(svc.list).toHaveBeenCalledWith(
      expect.objectContaining({
        role: "seller",
        sellerId: "S1",
        storeId: "ST1",
        query: {},
      })
    );
    expect(res.json).toHaveBeenCalledWith({ items: [], total: 0 });
  });

  it("list: passes unknown errors to next (covers catch -> next)", async () => {
    const res = makeRes();
    const next = makeNext();

    listQuerySchema.parse.mockReturnValue({});
    svc.list.mockRejectedValueOnce(new Error("boom-list"));

    await ctrl.list({ auth: { role: "seller" }, query: {} }, res, next);

    expect(next).toHaveBeenCalledWith(expect.any(Error));
  });
});

// -------------------- GET ONE --------------------
describe("SellerProductsController.getOne", () => {
  it("200 success (sets ETag)", async () => {
    const res = makeRes();
    const next = makeNext();

    idParamSchema.parse.mockReturnValue({ id: "P1" });
    svc.getOne.mockResolvedValue({ product: { _id: "P1" }, etag: 'W/"abc"' });

    const req = { auth: { role: "admin" }, params: { id: "P1" }, headers: {} };

    await ctrl.getOne(req, res, next);

    expect(res.setHeader).toHaveBeenCalledWith("ETag", 'W/"abc"');
    expect(res.json).toHaveBeenCalledWith({ _id: "P1" });
  });

  it("304 when If-None-Match equals etag", async () => {
    const res = makeRes();
    const next = makeNext();

    idParamSchema.parse.mockReturnValue({ id: "P1" });
    svc.getOne.mockResolvedValue({ product: { _id: "P1" }, etag: 'W/"abc"' });

    const req = {
      auth: { role: "admin" },
      params: { id: "P1" },
      headers: { "if-none-match": 'W/"abc"' },
    };

    await ctrl.getOne(req, res, next);
    expect(res.status).toHaveBeenCalledWith(304);
    expect(res.end).toHaveBeenCalled();
    expect(res.setHeader).not.toHaveBeenCalled();
  });

  it("404 when service returns notFound flag", async () => {
    const res = makeRes();
    const next = makeNext();

    idParamSchema.parse.mockReturnValue({ id: "P1" });
    svc.getOne.mockResolvedValue({ notFound: true });

    await ctrl.getOne({ auth: {}, params: { id: "P1" }, headers: {} }, res, next);

    expect(res.status).toHaveBeenCalledWith(404);
  });

  it("403 when service returns forbidden flag", async () => {
    const res = makeRes();
    const next = makeNext();

    idParamSchema.parse.mockReturnValue({ id: "P1" });
    svc.getOne.mockResolvedValue({ forbidden: true });

    await ctrl.getOne({ auth: {}, params: { id: "P1" }, headers: {} }, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
  });

  it("422 ZodError", async () => {
    const res = makeRes();
    const next = makeNext();
    const err = new Error("bad");
    err.name = "ZodError";
    err.errors = [{ path: "id" }];

    idParamSchema.parse.mockImplementation(() => {
      throw err;
    });

    await ctrl.getOne({ auth: {}, params: {}, headers: {} }, res, next);

    expect(res.status).toHaveBeenCalledWith(422);
    expect(res.json).toHaveBeenCalledWith({
      error: "ValidationError",
      details: err.errors,
    });
  });

  it("passes unknown errors to next", async () => {
    const res = makeRes();
    const next = makeNext();

    idParamSchema.parse.mockReturnValue({ id: "P1" });
    svc.getOne.mockRejectedValue(new Error("db fail"));

    await ctrl.getOne({ auth: {}, params: { id: "P1" }, headers: {} }, res, next);

    expect(next).toHaveBeenCalledWith(expect.any(Error));
  });

  // ← מכסה את ענף שורה ~79: בחירת role מתוך roles[0] כשה-role חסר
  it("getOne: resolves role from auth.roles[0] when auth.role is missing", async () => {
    const res = makeRes();
    const next = makeNext();

    idParamSchema.parse.mockReturnValue({ id: "P1" });
    svc.getOne.mockResolvedValue({ product: { _id: "P1" }, etag: 'W/"r1"' });

    const req = { auth: { roles: ["seller"], sellerId: "S1", storeId: "ST1" }, params: { id: "P1" }, headers: {} };
    await ctrl.getOne(req, res, next);

    expect(svc.getOne).toHaveBeenCalledWith(
      expect.objectContaining({ role: "seller", sellerId: "S1", storeId: "ST1" })
    );
    expect(res.setHeader).toHaveBeenCalledWith("ETag", 'W/"r1"');
    expect(res.json).toHaveBeenCalledWith({ _id: "P1" });
  });
});

// -------------------- UPDATE --------------------
describe("SellerProductsController.update", () => {
  it("200 success + filters allowed fields + normalizes discount dates + ignores bad visibility + forwards If-Match", async () => {
    const res = makeRes();
    const next = makeNext();

    idParamSchema.parse.mockReturnValue({ id: "P1" });
    svc.update.mockResolvedValue({
      updated: { _id: "P1", title: "T" },
      etag: 'W/"xyz"',
    });

    const req = {
      auth: { role: "seller", sellerId: "S1", storeId: "ST1" },
      params: { id: "P1" },
      headers: { "if-match": 'W/"prev"' },
      body: {
        title: "T",
        discount: { startsAt: "2025-01-01", expiresAt: "2025-02-01" },
        visibility: "NOPE",
        illegal: "X",
      },
    };

    await ctrl.update(req, res, next);

    const call = svc.update.mock.calls[0][0];
    expect(call.id).toBe("P1");
    expect(call.ifMatch).toBe('W/"prev"');
    expect(call.data).toMatchObject({ title: "T" });
    expect(call.data.discount.startsAt instanceof Date).toBe(true);
    expect(call.data.discount.expiresAt instanceof Date).toBe(true);
    expect(call.data.visibility).toBeUndefined();

    expect(res.setHeader).toHaveBeenCalledWith("ETag", 'W/"xyz"');
    expect(res.json).toHaveBeenCalledWith({ _id: "P1", title: "T" });
  });

  it("404/403/412 flags from service", async () => {
    const res = makeRes();
    const next = makeNext();
    idParamSchema.parse.mockReturnValue({ id: "P1" });

    svc.update.mockResolvedValueOnce({ notFound: true });
    await ctrl.update({ auth: {}, params: { id: "P1" }, headers: {}, body: {} }, res, next);
    expect(res.status).toHaveBeenCalledWith(404);

    res.status.mockClear(); res.json.mockClear();
    svc.update.mockResolvedValueOnce({ forbidden: true });
    await ctrl.update({ auth: {}, params: { id: "P1" }, headers: {}, body: {} }, res, next);
    expect(res.status).toHaveBeenCalledWith(403);

    res.status.mockClear(); res.json.mockClear();
    svc.update.mockResolvedValueOnce({ preconditionFailed: true });
    await ctrl.update({ auth: {}, params: { id: "P1" }, headers: {}, body: {} }, res, next);
    expect(res.status).toHaveBeenCalledWith(412);
  });

  it("422 ZodError", async () => {
    const res = makeRes();
    const next = makeNext();

    const err = new Error("invalid");
    err.name = "ZodError";
    err.errors = [{ path: "id" }];

    idParamSchema.parse.mockImplementation(() => { throw err; });

    await ctrl.update({ auth: {}, params: {}, headers: {}, body: {} }, res, next);

    expect(res.status).toHaveBeenCalledWith(422);
    expect(res.json).toHaveBeenCalledWith({
      error: "ValidationError",
      details: err.errors,
    });
  });

  it("passes unknown errors to next", async () => {
    const res = makeRes();
    const next = makeNext();

    idParamSchema.parse.mockReturnValue({ id: "P1" });
    svc.update.mockRejectedValue(new Error("boom"));

    await ctrl.update({ auth: {}, params: { id: "P1" }, headers: {}, body: {} }, res, next);
    expect(next).toHaveBeenCalledWith(expect.any(Error));
  });

  it("update: resolves role from roles[] and filters only allowed fields", async () => {
    const res = makeRes();
    const next = makeNext();

    idParamSchema.parse.mockReturnValue({ id: "P1" });
    svc.update.mockResolvedValue({ updated: { _id: "P1", title: "ok" }, etag: 'W/"e1"' });

    const req = {
      auth: { roles: ["seller"], sellerId: "S1", storeId: "ST1" },
      params: { id: "P1" },
      headers: {},
      body: { title: "ok", illegal1: "x", model: "m", illegal2: "y" },
    };

    await ctrl.update(req, res, next);

    const call = svc.update.mock.calls[0][0];
    expect(call.role).toBe("seller");
    expect(call.data).toMatchObject({ title: "ok", model: "m" });
    expect(call.data.illegal1).toBeUndefined();
    expect(call.data.illegal2).toBeUndefined();

    expect(res.setHeader).toHaveBeenCalledWith("ETag", 'W/"e1"');
    expect(res.json).toHaveBeenCalledWith({ _id: "P1", title: "ok" });
  });

  // ← מכסה ענף ברירת מחדל של pickAllowedUpdate (שורה ~4)
  it("update: body is undefined -> pickAllowedUpdate uses default {} (no keys included)", async () => {
    const res = makeRes();
    const next = makeNext();

    idParamSchema.parse.mockReturnValue({ id: "P1" });
    svc.update.mockResolvedValue({ updated: { _id: "P1" }, etag: 'W/"t"' });

    await ctrl.update(
      { auth: { role: "seller", sellerId: "S1", storeId: "ST1" }, params: { id: "P1" }, headers: {} },
      res,
      next
    );

    const call = svc.update.mock.calls[0][0];
    expect(call.data).toEqual({});
    expect(res.setHeader).toHaveBeenCalledWith("ETag", 'W/"t"');
    expect(res.json).toHaveBeenCalledWith({ _id: "P1" });
  });

  // ארבעת המצבים כדי לכסות את שורות 121–122 (true/false לכל ענף)
  it("update: discount object present but empty (no inner normalization)", async () => {
    const res = makeRes();
    const next = makeNext();

    idParamSchema.parse.mockReturnValue({ id: "P1" });
    svc.update.mockResolvedValue({ updated: { _id: "P1" }, etag: 'W/"t"' });

    await ctrl.update(
      { auth: { role: "seller", sellerId: "S1", storeId: "ST1" }, params: { id: "P1" }, headers: {}, body: { discount: {} } },
      res,
      next
    );

    const call = svc.update.mock.calls[0][0];
    expect(call.data.discount).toEqual({});
  });

  it("update: discount only startsAt -> normalizes startsAt only", async () => {
    const res = makeRes();
    const next = makeNext();

    idParamSchema.parse.mockReturnValue({ id: "P1" });
    svc.update.mockResolvedValue({ updated: { _id: "P1" }, etag: 'W/"t"' });

    await ctrl.update(
      { auth: { role: "seller", sellerId: "S1", storeId: "ST1" }, params: { id: "P1" }, headers: {}, body: { discount: { startsAt: "2025-01-01" } } },
      res,
      next
    );

    const d = svc.update.mock.calls[0][0].data.discount;
    expect(d.startsAt instanceof Date).toBe(true);
    expect(d.expiresAt).toBeUndefined();
  });

  it("update: discount only expiresAt -> normalizes expiresAt only", async () => {
    const res = makeRes();
    const next = makeNext();

    idParamSchema.parse.mockReturnValue({ id: "P1" });
    svc.update.mockResolvedValue({ updated: { _id: "P1" }, etag: 'W/"t"' });

    await ctrl.update(
      { auth: { role: "seller", sellerId: "S1", storeId: "ST1" }, params: { id: "P1" }, headers: {}, body: { discount: { expiresAt: "2025-02-02" } } },
      res,
      next
    );

    const d = svc.update.mock.calls[0][0].data.discount;
    expect(d.startsAt).toBeUndefined();
    expect(d.expiresAt instanceof Date).toBe(true);
  });

  it("update: resolves role=null when neither auth.role nor auth.roles exist", async () => {
    const res = makeRes();
    const next = makeNext();

    idParamSchema.parse.mockReturnValue({ id: "P1" });
    svc.update.mockResolvedValue({ updated: { _id: "P1" }, etag: 'W/"t"' });

    await ctrl.update({ auth: {}, params: { id: "P1" }, headers: {}, body: { title: "T" } }, res, next);

    const call = svc.update.mock.calls[0][0];
    expect(call.role).toBe(null);
    expect(res.json).toHaveBeenCalledWith({ _id: "P1" });
  });
});

// -------------------- CREATE --------------------
describe("SellerProductsController.create", () => {
  it("seller: 201 success + strips seller-controlled fields + enforces sellerId/storeId/status/visibility", async () => {
    const res = makeRes();
    const next = makeNext();

    svc.createProduct.mockResolvedValue({ _id: "P1" });

    const req = {
      user: { role: "seller", _id: "U1", sellerId: "S1", storeId: "ST1" },
      body: {
        title: "T",
        sellerId: "HACK",
        storeId: "HACK",
        status: "published",
        visibility: "public",
        scheduledAt: "2020-01-01",
        visibleUntil: "2020-01-02",
      },
    };

    await ctrl.create(req, res, next);

    const call = svc.createProduct.mock.calls[0][0];
    expect(call.data).toMatchObject({
      title: "T",
      sellerId: "S1",
      storeId: "ST1",
      status: "draft",
      visibility: "private",
    });
    expect(call.data.scheduledAt).toBeUndefined();
    expect(call.data.visibleUntil).toBeUndefined();
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({ _id: "P1" });
  });

  // ← מכסה את ענף ברירת המחדל של stripSellerControlledFields(body || {}) (שורה ~48)
  it("create (seller): body is undefined → still 201 and data composed only from enforced fields", async () => {
    const res = makeRes();
    const next = makeNext();

    svc.createProduct.mockResolvedValue({ _id: "P2" });

    const req = { user: { role: "seller", _id: "U1", sellerId: "S1", storeId: "ST1" } }; // אין body כלל

    await ctrl.create(req, res, next);

    expect(svc.createProduct).toHaveBeenCalledWith(
      expect.objectContaining({
        actor: { id: "U1", role: "seller" },
        data: expect.objectContaining({
          sellerId: "S1",
          storeId: "ST1",
          status: "draft",
          visibility: "private",
        }),
      })
    );
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({ _id: "P2" });
  });

  it("seller: 403 when storeId exists but sellerId missing", async () => {
    const res = makeRes();
    const next = makeNext();

    await ctrl.create(
      { user: { role: "seller", _id: "U1", storeId: "ST1" }, body: { title: "T" } },
      res,
      next
    );
    expect(next).toHaveBeenCalledWith(expect.objectContaining({ status: 403 }));
  });

  it("seller: 403 when sellerId exists but storeId missing", async () => {
    const res = makeRes();
    const next = makeNext();

    await ctrl.create(
      { user: { role: "seller", _id: "U1", sellerId: "S1" }, body: { title: "T" } },
      res,
      next
    );
    expect(next).toHaveBeenCalledWith(expect.objectContaining({ status: 403 }));
  });

  it("admin: 400 when sellerId provided but storeId missing", async () => {
    const res = makeRes();
    const next = makeNext();

    await ctrl.create(
      { user: { role: "admin", _id: "U1" }, body: { title: "T", sellerId: "S1" } },
      res,
      next
    );
    expect(next).toHaveBeenCalledWith(expect.objectContaining({ status: 400 }));
  });

  it("admin: 400 when storeId provided but sellerId missing", async () => {
    const res = makeRes();
    const next = makeNext();

    await ctrl.create(
      { user: { role: "admin", _id: "U1" }, body: { title: "T", storeId: "ST1" } },
      res,
      next
    );
    expect(next).toHaveBeenCalledWith(expect.objectContaining({ status: 400 }));
  });

  it("admin: scheduledAt in the past → next(err.status=400)", async () => {
    const res = makeRes();
    const next = makeNext();

    const pastTs = Date.now() - 24 * 3600 * 1000;

    const req = {
      user: { role: "admin", _id: "U1" },
      body: { title: "T", sellerId: "S1", storeId: "ST1", scheduledAt: pastTs },
    };

    await ctrl.create(req, res, next);
    expect(next).toHaveBeenCalledWith(expect.objectContaining({ status: 400 }));
  });

  it("admin: visibleUntil <= scheduledAt → next(err.status=400)", async () => {
    const res = makeRes();
    const next = makeNext();

    const scheduledAt = Date.now() + 2 * 24 * 3600 * 1000;
    const visibleUntil = scheduledAt - 24 * 3600 * 1000;

    const req = {
      user: { role: "admin", _id: "U1" },
      body: { title: "T", sellerId: "S1", storeId: "ST1", scheduledAt, visibleUntil },
    };

    await ctrl.create(req, res, next);
    expect(next).toHaveBeenCalledWith(expect.objectContaining({ status: 400 }));
  });

  it("admin: 201 success (valid scheduling) returns 201 & body", async () => {
    const res = makeRes();
    const next = makeNext();

    svc.createProduct.mockResolvedValue({ _id: "PX" });

    const scheduledAt = Date.now() + 60 * 60 * 1000;
    const visibleUntil = scheduledAt + 60 * 60 * 1000;

    const req = {
      user: { role: "admin", _id: "U1" },
      body: { title: "T", sellerId: "S1", storeId: "ST1", scheduledAt, visibleUntil },
    };

    await ctrl.create(req, res, next);

    expect(svc.createProduct).toHaveBeenCalledWith({
      data: req.body,
      actor: { id: "U1", role: "admin" },
    });
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({ _id: "PX" });
    expect(next).not.toHaveBeenCalled();
  });

  it("create (admin): scheduledAt as ISO string (Number.isFinite false) still passes (201)", async () => {
    const res = makeRes();
    const next = makeNext();

    svc.createProduct.mockResolvedValue({ _id: "PX" });

    const req = {
      user: { role: "admin", _id: "U1" },
      body: {
        title: "T",
        sellerId: "S1",
        storeId: "ST1",
        scheduledAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
      },
    };

    await ctrl.create(req, res, next);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({ _id: "PX" });
  });

  it("create: unknown role → next(err.status=403)", async () => {
    const res = makeRes();
    const next = makeNext();

    const req = { user: { role: "viewer", _id: "U1" }, body: { title: "T" } };

    await ctrl.create(req, res, next);
    expect(next).toHaveBeenCalledWith(expect.objectContaining({ status: 403 }));
  });

  // ← מכסה את ענף ברירת המחדל של const user = req.user || {} (שורה ~150)
  it("create: missing req.user → next(err.status=403)", async () => {
    const res = makeRes();
    const next = makeNext();

    await ctrl.create({ /* no user */ body: { title: "T" } }, res, next);
    expect(next).toHaveBeenCalledWith(expect.objectContaining({ status: 403 }));
  });

  it("admin: 201 success basic", async () => {
    const res = makeRes();
    const next = makeNext();

    svc.createProduct.mockResolvedValue({ _id: "PX" });

    const req = {
      user: { role: "admin", _id: "U1" },
      body: { title: "T", sellerId: "S1", storeId: "ST1" },
    };

    await ctrl.create(req, res, next);

    expect(svc.createProduct).toHaveBeenCalledWith({
      data: req.body,
      actor: { id: "U1", role: "admin" },
    });
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({ _id: "PX" });
  });
});

// -------------------- SOFT DELETE / RESTORE --------------------
describe("SellerProductsController.softDelete / restore", () => {
  it("softDelete: 200 success; 404 when null", async () => {
    const res = makeRes();
    const next = makeNext();

    svc.softDelete.mockResolvedValueOnce({ _id: "P1" });
    await ctrl.softDelete({ params: { id: "P1" }, auth: { sub: "U1" } }, res, next);
    expect(res.json).toHaveBeenCalledWith({ success: true, product: { _id: "P1" } });

    res.status.mockClear(); res.json.mockClear();

    svc.softDelete.mockResolvedValueOnce(null);
    await ctrl.softDelete({ params: { id: "P1" }, auth: { sub: "U1" } }, res, next);
    expect(res.status).toHaveBeenCalledWith(404);
  });

  it("restore: 200 success; 404 when null", async () => {
    const res = makeRes();
    const next = makeNext();

    svc.restore.mockResolvedValueOnce({ _id: "P1" });
    await ctrl.restore({ params: { id: "P1" }, auth: { sub: "U1" } }, res, next);
    expect(res.json).toHaveBeenCalledWith({ success: true, product: { _id: "P1" } });

    res.status.mockClear(); res.json.mockClear();

    svc.restore.mockResolvedValueOnce(null);
    await ctrl.restore({ params: { id: "P1" }, auth: { sub: "U1" } }, res, next);
    expect(res.status).toHaveBeenCalledWith(404);
  });

  it("softDelete: 200 success returns { success, product }", async () => {
    const res = makeRes();
    const next = makeNext();

    svc.softDelete.mockResolvedValueOnce({ _id: "P1" });

    await ctrl.softDelete({ params: { id: "P1" }, auth: { sub: "U1" } }, res, next);

    expect(res.json).toHaveBeenCalledWith({ success: true, product: { _id: "P1" } });
    expect(next).not.toHaveBeenCalled();
  });

  it("restore: 200 success returns { success, product }", async () => {
    const res = makeRes();
    const next = makeNext();

    svc.restore.mockResolvedValueOnce({ _id: "P1" });

    await ctrl.restore({ params: { id: "P1" }, auth: { sub: "U1" } }, res, next);

    expect(res.json).toHaveBeenCalledWith({ success: true, product: { _id: "P1" } });
    expect(next).not.toHaveBeenCalled();
  });

  it("softDelete: passes unknown errors to next (covers catch -> next)", async () => {
    const res = makeRes();
    const next = makeNext();

    svc.softDelete.mockRejectedValueOnce(new Error("boom"));

    await ctrl.softDelete({ params: { id: "P1" }, auth: { sub: "U1" } }, res, next);

    expect(next).toHaveBeenCalledWith(expect.any(Error));
    expect(res.status).not.toHaveBeenCalled();
    expect(res.json).not.toHaveBeenCalled();
  });

  it("restore: passes unknown errors to next (covers catch -> next)", async () => {
    const res = makeRes();
    const next = makeNext();

    svc.restore.mockRejectedValueOnce(new Error("oops"));

    await ctrl.restore({ params: { id: "P1" }, auth: { sub: "U1" } }, res, next);

    expect(next).toHaveBeenCalledWith(expect.any(Error));
    expect(res.status).not.toHaveBeenCalled();
    expect(res.json).not.toHaveBeenCalled();
  });
});

// -------------------- UPDATE STATUS --------------------
describe("SellerProductsController.updateStatus", () => {
  it("200 success", async () => {
    const res = makeRes();
    const next = makeNext();

    updateStatusSchema.parse.mockReturnValue({ status: "published" });
    svc.updateStatus.mockResolvedValue({ _id: "P1", status: "published" });

    await ctrl.updateStatus(
      { params: { id: "P1" }, body: { status: "published" }, auth: { sub: "U1", role: "seller", sellerId: "S1" } },
      res,
      next
    );

    expect(res.json).toHaveBeenCalledWith({ success: true, product: { _id: "P1", status: "published" } });
  });

  it("422 ZodError", async () => {
    const res = makeRes();
    const next = makeNext();
    const err = new Error("bad");
    err.name = "ZodError";
    err.errors = [{ path: "status" }];

    updateStatusSchema.parse.mockImplementation(() => { throw err; });

    await ctrl.updateStatus({ params: { id: "P1" }, body: {}, auth: {} }, res, next);

    expect(res.status).toHaveBeenCalledWith(422);
    expect(res.json).toHaveBeenCalledWith({
      error: "ValidationError",
      message: "נתונים לא תקינים",
      details: err.errors,
    });
  });

  it("403 FORBIDDEN code", async () => {
    const res = makeRes();
    const next = makeNext();

    updateStatusSchema.parse.mockReturnValue({ status: "published" });
    const err = new Error("nope");
    err.code = "FORBIDDEN";
    svc.updateStatus.mockRejectedValue(err);

    await ctrl.updateStatus({ params: { id: "P1" }, body: { status: "published" }, auth: {} }, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
  });

  it("409 INVALID_TRANSITION code", async () => {
    const res = makeRes();
    const next = makeNext();

    updateStatusSchema.parse.mockReturnValue({ status: "suspended" });
    const err = new Error("bad transition");
    err.code = "INVALID_TRANSITION";
    svc.updateStatus.mockRejectedValue(err);

    await ctrl.updateStatus({ params: { id: "P1" }, body: { status: "suspended" }, auth: {} }, res, next);

    expect(res.status).toHaveBeenCalledWith(409);
  });

  it("400 Mongoose ValidationError", async () => {
    const res = makeRes();
    const next = makeNext();

    updateStatusSchema.parse.mockReturnValue({ status: "published" });
    const err = new Error("מוצר מפורסם חייב לכלול לפחות תמונה אחת");
    err.name = "ValidationError";
    err.errors = { images: { message: "required" } };
    svc.updateStatus.mockRejectedValue(err);

    await ctrl.updateStatus({ params: { id: "P1" }, body: { status: "published" }, auth: {} }, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      error: "ValidationError",
      message: err.message,
      details: err.errors,
    });
  });

  it("passes unknown errors to next", async () => {
    const res = makeRes();
    const next = makeNext();

    updateStatusSchema.parse.mockReturnValue({ status: "published" });
    svc.updateStatus.mockRejectedValue(new Error("boom"));

    await ctrl.updateStatus({ params: { id: "P1" }, body: { status: "published" }, auth: {} }, res, next);
    expect(next).toHaveBeenCalledWith(expect.any(Error));
  });

  it("updateStatus: service returns null → 404", async () => {
    const res = makeRes();
    const next = makeNext();

    updateStatusSchema.parse.mockReturnValue({ status: "published" });
    svc.updateStatus.mockResolvedValue(null);

    await ctrl.updateStatus(
      { params: { id: "P1" }, body: { status: "published" }, auth: { sub: "U1", role: "seller", sellerId: "S1" } },
      res,
      next
    );

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: "Product not found" });
  });
});
