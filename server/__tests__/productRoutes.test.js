import { jest } from "@jest/globals";
import request from "supertest";
import express from "express";
import productRouter from "../routes/product.routes.js";
import { productService } from "../services/product.service.js";

jest.mock("../services/product.service.js");

const app = express();
app.use(express.json());
app.use("/products", productRouter);

describe("Product routes", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test("GET /products should return all products", async () => {
    productService.getAllProductsService.mockResolvedValue([
      { _id: "1", title: "Test" },
    ]);

    const res = await request(app).get("/products");

    expect(res.status).toBe(200);
    expect(res.body[0].title).toBe("Test");
  });

  test("GET /products/:slug should return product if found", async () => {
    productService.getProductBySlugService.mockResolvedValue({
      _id: "1",
      slug: "test",
    });

    const res = await request(app).get("/products/test");

    expect(res.status).toBe(200);
    expect(res.body.slug).toBe("test");
  });

  test("GET /products/:slug should return 404 if not found", async () => {
    productService.getProductBySlugService.mockResolvedValue(null);

    const res = await request(app).get("/products/notfound");

    expect(res.status).toBe(404);
  });
});
