import { jest } from "@jest/globals";
import request from "supertest";
import express from "express";

// עושים מוק ל־service
jest.unstable_mockModule("../service/product.service.js", () => ({
  __esModule: true,
  productService: {
    listNewProducts: jest.fn(),
    getAllProductsService: jest.fn(),
    getProductBySlugService: jest.fn(),
  },
}));

// אחרי המוק מייבאים את ה־service
const { productService } = await import("../service/product.service.js");

// ואז מייבאים את שאר הקבצים
const { default: productRouter } = await import("../router/product.router.js");
const { errorHandler } = await import("../middlewares/errorHandler.js");

// בונים אפליקציה אמיתית
const app = express();
app.use(express.json());
app.use("/products", productRouter);
app.use(errorHandler);

// משתיקים לוגים של errorHandler
beforeAll(() => {
  jest.spyOn(console, "error").mockImplementation(() => {});
});

afterAll(() => {
  console.error.mockRestore();
});

describe("Product Router (Integration)", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test("GET /products/new מחזיר מוצרים", async () => {
    productService.listNewProducts.mockResolvedValue([{ id: 1 }]);

    const res = await request(app).get("/products/new?limit=2");

    expect(res.status).toBe(200);
    expect(res.body.items).toEqual([{ id: 1 }]);
  });

  test("GET /products מחזיר את כל המוצרים", async () => {
    productService.getAllProductsService.mockResolvedValue([{ id: 2 }]);

    const res = await request(app).get("/products");

    expect(res.status).toBe(200);
    expect(res.body).toEqual([{ id: 2 }]);
  });

  test("GET /products/:slug מחזיר מוצר קיים", async () => {
    productService.getProductBySlugService.mockResolvedValue({ slug: "abc" });

    const res = await request(app).get("/products/abc");

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ slug: "abc" });
  });

  test("GET /products/:slug מחזיר 404 אם לא נמצא", async () => {
    productService.getProductBySlugService.mockResolvedValue(null);

    const res = await request(app).get("/products/none");

    expect(res.status).toBe(404);
    expect(res.body.error).toBe("מוצר לא נמצא");
  });
});
