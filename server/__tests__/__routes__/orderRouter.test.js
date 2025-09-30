import request from "supertest";
import express from "express";
import { jest } from "@jest/globals";

// מוקים ל־middlewares
jest.unstable_mockModule("../../middlewares/auth.js", () => ({
  authMiddleware: (req, res, next) => {
    req.user = { userId: "u1" };
    next();
  },
}));

jest.unstable_mockModule("../../middlewares/validate.js", () => ({
  validate: () => (req, res, next) => next(),
}));

// מוקים ל־controller
const mockCreate = jest.fn();
const mockList = jest.fn();
const mockGetOne = jest.fn();
const mockUpdateStatus = jest.fn();
const mockRemove = jest.fn();

jest.unstable_mockModule("../../controllers/orderController.js", () => ({
  OrderController: jest.fn().mockImplementation(() => ({
    create: mockCreate,
    list: mockList,
    getOne: mockGetOne,
    updateStatus: mockUpdateStatus,
    remove: mockRemove,
  })),
}));

// errorHandler לבדיקה אמיתית
const errorHandler = (err, req, res, next) => {
  res.status(err.status || 500).json({ status: err.status || 500, error: err.message });
};

const router = (await import("../../router/orderRoutes")).default;

describe("Order Router", () => {
  let app;
  beforeEach(() => {
    jest.clearAllMocks();
    app = express();
    app.use(express.json());
    app.use("/orders", router);
    app.use(errorHandler);
  });

  test("POST /orders → should call controller.create", async () => {
    mockCreate.mockImplementation((req, res) => res.status(201).json({ ok: true }));

    const res = await request(app)
      .post("/orders")
      .send({ items: [{ price: 100, quantity: 1 }] });

    expect(res.status).toBe(201);
    expect(res.body).toEqual({ ok: true });
    expect(mockCreate).toHaveBeenCalled();
  });

  test("GET /orders → should call controller.list", async () => {
    mockList.mockImplementation((req, res) => res.json(["o1"]));

    const res = await request(app).get("/orders");

    expect(res.status).toBe(200);
    expect(res.body).toEqual(["o1"]);
    expect(mockList).toHaveBeenCalled();
  });

  test("GET /orders/:id → should call controller.getOne", async () => {
    mockGetOne.mockImplementation((req, res) => res.json({ _id: "o1" }));

    const res = await request(app).get("/orders/o1");

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ _id: "o1" });
    expect(mockGetOne).toHaveBeenCalled();
  });

  test("PATCH /orders/:id/status → should call controller.updateStatus", async () => {
    mockUpdateStatus.mockImplementation((req, res) =>
      res.json({ _id: "o1", status: "shipped" })
    );

    const res = await request(app)
      .patch("/orders/o1/status")
      .send({ status: "shipped" });

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ _id: "o1", status: "shipped" });
    expect(mockUpdateStatus).toHaveBeenCalled();
  });

  test("DELETE /orders/:id → should call controller.remove", async () => {
    mockRemove.mockImplementation((req, res) =>
      res.json({ message: "deleted" })
    );

    const res = await request(app).delete("/orders/o1");

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ message: "deleted" });
    expect(mockRemove).toHaveBeenCalled();
  });

  test("should handle errors via errorHandler", async () => {
    mockGetOne.mockImplementation((req, res, next) =>
      next({ status: 404, message: "Not found" })
    );

    const res = await request(app).get("/orders/o404");

    expect(res.status).toBe(404);
    expect(res.body).toEqual({ status: 404, error: "Not found" });
  });
});
