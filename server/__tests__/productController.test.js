import { jest } from "@jest/globals";

// יוצרים mock ל-service
jest.unstable_mockModule("../service/product.service.js", () => ({
  __esModule: true,
  productService: {
    listNewProducts: jest.fn(),
    getAllProductsService: jest.fn(),
    getProductBySlugService: jest.fn()
  }
}));

const { productService } = await import("../service/product.service.js");
const { ProductController } = await import("../controllers/product.controller.js");

describe("ProductController", () => {
  let controller;
  let req, res, next;

  beforeEach(() => {
    controller = new ProductController();

    req = { query: {}, params: {} };
    res = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis()
    };
    next = jest.fn();

    jest.clearAllMocks();
  });

  describe("getNewProducts", () => {
    it("מחזיר מוצרים חדשים עם limit ברירת מחדל", async () => {
      const fakeProducts = [{ _id: "1", title: "טלפון" }];
      productService.listNewProducts.mockResolvedValue(fakeProducts);

      await controller.getNewProducts(req, res, next);

      expect(productService.listNewProducts).toHaveBeenCalledWith(12);
      expect(res.json).toHaveBeenCalledWith({ items: fakeProducts });
    });

    it("מחזיר מוצרים חדשים עם limit מותאם", async () => {
      req.query.limit = "5";
      productService.listNewProducts.mockResolvedValue([]);

      await controller.getNewProducts(req, res, next);

      expect(productService.listNewProducts).toHaveBeenCalledWith(5);
    });

    it("מעביר שגיאה ל-next אם יש תקלה", async () => {
      const error = new Error("DB error");
      productService.listNewProducts.mockRejectedValue(error);

      await controller.getNewProducts(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe("getAllProducts", () => {
    it("מחזיר את כל המוצרים", async () => {
      const fakeProducts = [{ _id: "2", title: "A" }];
      productService.getAllProductsService.mockResolvedValue(fakeProducts);

      await controller.getAllProducts(req, res);

      expect(res.json).toHaveBeenCalledWith(fakeProducts);
    });

    it("מחזיר 500 במקרה של תקלה", async () => {
      productService.getAllProductsService.mockRejectedValue(new Error("DB error"));

      await controller.getAllProducts(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: "שגיאה בשליפת מוצרים" });
    });
  });

  describe("getProductsBySlug", () => {
    it("מחזיר מוצר לפי slug", async () => {
      req.params.slug = "phone";
      const fakeProduct = { _id: "3", slug: "phone" };
      productService.getProductBySlugService.mockResolvedValue(fakeProduct);

      await controller.getProductsBySlug(req, res);

      expect(productService.getProductBySlugService).toHaveBeenCalledWith("phone");
      expect(res.json).toHaveBeenCalledWith(fakeProduct);
    });

    it("מחזיר 404 אם מוצר לא נמצא", async () => {
      req.params.slug = "not-found";
      productService.getProductBySlugService.mockResolvedValue(null);

      await controller.getProductsBySlug(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: "מוצר לא נמצא" });
    });

    it("מחזיר 500 במקרה של תקלה", async () => {
      req.params.slug = "bad";
      productService.getProductBySlugService.mockRejectedValue(new Error("DB error"));

      await controller.getProductsBySlug(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: "שגיאה בשליפת מוצר" });
    });
  });
});
