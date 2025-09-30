import { jest } from "@jest/globals";
jest.unstable_mockModule("../../controllers/cartController.js", () => ({
  __esModule: true,
  getCart: jest.fn(),
  addToCart: jest.fn(),
  removeFromCart: jest.fn(),
  clearCart: jest.fn(),
  removeProductCompletely: jest.fn(),
  mergeLocalCart: jest.fn(),
  updateItemQuantity: jest.fn(),
  toggleSelected: jest.fn(),
  toggleSelecteAll: jest.fn()
}));
jest.unstable_mockModule("../../middlewares/auth.js", () => ({
  __esModule: true,
  authMiddleware: (req, res, next) => { req.user = { userId: "u1" }; next(); }
}));

const cartController = await import("../../controllers/cartController.js");
const cartRouter = (await import("../../router/cartRouter.js")).default;

import request from "supertest";
import express from "express";

const app = express();
app.use(express.json());
app.use("/cart", cartRouter);

beforeAll(() => {
  jest.spyOn(console, "error").mockImplementation(() => {});
});
afterAll(() => {
  console.error.mockRestore();
});

describe("Cart Router (Integration)", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test("GET /cart מחזיר עגלה", async () => {
    cartController.getCart.mockImplementation((req, res) => res.json({ userId: "u1", items: [] }));
    const res = await request(app).get("/cart");
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ userId: "u1", items: [] });
    expect(cartController.getCart).toHaveBeenCalled();
  });

  test("POST /cart/add מוסיף לעגלה", async () => {
    cartController.addToCart.mockImplementation((req, res) => res.json({ items: [1,2] }));
    const res = await request(app).post("/cart/add").send({ productId: "p1", quantity: 2 });
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ items: [1,2] });
    expect(cartController.addToCart).toHaveBeenCalled();
  });

  test("DELETE /cart/remove מסיר מהעגלה", async () => {
    cartController.removeFromCart.mockImplementation((req, res) => res.json({ userId: "u1", items: [] }));
    const res = await request(app).delete("/cart/remove").send({ productId: "p1" });
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ userId: "u1", items: [] });
    expect(cartController.removeFromCart).toHaveBeenCalled();
  });

  test("DELETE /cart/clear מנקה עגלה", async () => {
    cartController.clearCart.mockImplementation((req, res) => res.json({ userId: "u1", items: [] }));
    const res = await request(app).delete("/cart/clear");
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ userId: "u1", items: [] });
    expect(cartController.clearCart).toHaveBeenCalled();
  });

  test("DELETE /cart/remove-completely מסיר מוצר לחלוטין", async () => {
    cartController.removeProductCompletely.mockImplementation((req, res) => res.json({ userId: "u1", items: [] }));
    const res = await request(app).delete("/cart/remove-completely").send({ productId: "p1" });
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ userId: "u1", items: [] });
    expect(cartController.removeProductCompletely).toHaveBeenCalled();
  });

  test("POST /cart/merge ממזג עגלה", async () => {
    cartController.mergeLocalCart.mockImplementation((req, res) => res.json({ userId: "u1", items: [{ productId: "p1", quantity: 2 }] }));
    const res = await request(app).post("/cart/merge").send({ items: [{ productId: "p1", quantity: 2 }] });
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ userId: "u1", items: [{ productId: "p1", quantity: 2 }] });
    expect(cartController.mergeLocalCart).toHaveBeenCalled();
  });

  test("PUT /cart/update-quantity מעדכן כמות", async () => {
    cartController.updateItemQuantity.mockImplementation((req, res) => res.json({ userId: "u1", items: [{ productId: "p1", quantity: 5 }] }));
    const res = await request(app).put("/cart/update-quantity").send({ productId: "p1", quantity: 5 });
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ userId: "u1", items: [{ productId: "p1", quantity: 5 }] });
    expect(cartController.updateItemQuantity).toHaveBeenCalled();
  });

  test("PATCH /cart/item/:itemId/selected מסמן פריט", async () => {
    cartController.toggleSelected.mockImplementation((req, res) => res.json({ userId: "u1", items: [{ _id: "i1", selected: true }] }));
    const res = await request(app).patch("/cart/item/i1/selected").send({ selected: true });
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ userId: "u1", items: [{ _id: "i1", selected: true }] });
    expect(cartController.toggleSelected).toHaveBeenCalled();
  });

  test("PATCH /cart/select-all מסמן הכל", async () => {
    cartController.toggleSelecteAll.mockImplementation((req, res) => res.json({ userId: "u1", items: [{ selected: true }] }));
    const res = await request(app).patch("/cart/select-all").send({ selected: true });
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ userId: "u1", items: [{ selected: true }] });
    expect(cartController.toggleSelecteAll).toHaveBeenCalled();
  });
});