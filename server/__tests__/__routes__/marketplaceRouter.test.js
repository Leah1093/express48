import request from "supertest";
import express from "express";
import { jest } from "@jest/globals";

// 🟦 mock middlewares (auth + roles) כדי לא להסתבך בהרשאות אמיתיות
jest.unstable_mockModule("../../middlewares/auth.js", () => ({
  authMiddleware: (req, res, next) => {
    // חייב להיות ObjectId חוקי לפי הסכמה
    req.user = { userId: "65d123456789abcdef012345", role: "admin" };
    next();
  },
}));
jest.unstable_mockModule("../../middlewares/requireRoles.js", () => ({
  requireRoles: () => (req, res, next) => next(),
}));

// 🟦 mock service
jest.unstable_mockModule("../../service/marketplace.service.js", () => ({
  MarketplaceService: jest.fn().mockImplementation(() => ({
    createSeller: jest.fn().mockResolvedValue({ id: "s1", email: "s1@test.com" }),
    getSellerByUserId: jest.fn().mockResolvedValue({ id: "s1" }),
    updateSeller: jest.fn().mockResolvedValue({ id: "s1", phone: "123" }),
    listSellers: jest.fn().mockResolvedValue({ items: [], total: 0, page: 1, limit: 20 }),
    adminUpdateSellerStatus: jest.fn().mockResolvedValue({ id: "s1", status: "approved" }),
  })),
}));

// טעינה אחרי mocks
const { marketplaceRouter } = await import("../../router/marketplace.router.js");

describe("Marketplace Router (Integration)", () => {
  let app;
  const objectId = "65d123456789abcdef012345"; // ObjectId חוקי לפי הסכמה

  beforeAll(() => {
    app = express();
    app.use(express.json());
    app.use("/", marketplaceRouter);
  });

test("POST /sellers → should create seller", async () => {
  const res = await request(app)
    .post("/sellers")
    .send({
      companyName: "My Company",
      fullName: "Test Seller",
      email: "test@test.com",
      phone: "0501234567",
      status: "new"   // 👈 הוספנו כדי לעבור את ה־schema
    });

  expect(res.status).toBe(201);
  expect(res.body).toHaveProperty("success", true);
  expect(res.body.seller).toHaveProperty("id", "s1");
});


  test("GET /sellers/me → should return seller of current user", async () => {
    const res = await request(app).get("/sellers/me");
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ success: true, seller: { id: "s1" } });
  });

  test("PUT /sellers/:id → should update seller", async () => {
    const res = await request(app)
      .put(`/sellers/${objectId}`)
      .send({ phone: "123" });

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ success: true, seller: { id: "s1", phone: "123" } });
  });

  test("GET /admin/sellers → should return sellers list", async () => {
    const res = await request(app).get("/admin/sellers");
    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      success: true,
      items: [],
      total: 0,
      page: 1,
      limit: 20,
    });
  });

  test("PATCH /admin/sellers/:id/status → should update status", async () => {
    const res = await request(app)
      .patch(`/admin/sellers/${objectId}/status`)
      .send({ status: "approved", note: "ok" });

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ success: true, seller: { id: "s1", status: "approved" } });
  });
});
