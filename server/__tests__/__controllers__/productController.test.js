import { jest } from "@jest/globals";

// Mock ל-service
jest.unstable_mockModule("../../service/product.service.js", () => ({
  __esModule: true,
  productService: {
    listNewProducts: jest.fn(),
    getAllProductsService: jest.fn(),
    getProductBySlugService: jest.fn(),
  },
}));

const { productService } = await import("../../service/product.service.js");
const { ProductController } = await import("../../controllers/product.controller.js");
const { CustomError } = await import("../../utils/CustomError.js");

describe("ProductController (Unit) עם Middleware imitation", () => {
  let controller;
  let req, res, next;

  beforeEach(() => {
    controller = new ProductController();

    req = { query: {}, params: {}, originalUrl: "/test", method: "GET" };
    res = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis(),
    };
    next = jest.fn((err) => {
      // מחקה את הלוגיקה של ה-errorHandler
      const statusCode = err.status || err.statusCode || 500;
      const message = err.message || "Internal Server Error";
      res.status(statusCode).json({ status: statusCode, error: message });
    });

    jest.clearAllMocks();
  });

  // ----- getNewProducts -----
  test("getNewProducts מחזיר מוצרים (limit ברירת מחדל)", async () => {
    const fakeProducts = [{ id: 1, title: "טלפון" }];
    productService.listNewProducts.mockResolvedValue(fakeProducts);

    await controller.getNewProducts(req, res, next);

    expect(productService.listNewProducts).toHaveBeenCalledWith(12);
    expect(res.json).toHaveBeenCalledWith({ items: fakeProducts });
  });

  test("getNewProducts מחזיר JSON עם שגיאה במקרה של חריגה", async () => {
    productService.listNewProducts.mockRejectedValue(new Error("DB error"));

    await controller.getNewProducts(req, res, next);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      status: 500,
      error: "שגיאה בשליפת מוצרים חדשים",
    });
  });

  // ----- getAllProducts -----
  test("getAllProducts מחזיר רשימת מוצרים", async () => {
    const fakeProducts = [{ id: 2 }];
    productService.getAllProductsService.mockResolvedValue(fakeProducts);

    await controller.getAllProducts(req, res, next);

    expect(res.json).toHaveBeenCalledWith(fakeProducts);
  });

  test("getAllProducts מחזיר JSON עם שגיאה במקרה של חריגה", async () => {
    productService.getAllProductsService.mockRejectedValue(new Error("DB error"));

    await controller.getAllProducts(req, res, next);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      status: 500,
      error: "שגיאה בשליפת מוצרים",
    });
  });

  // ----- getProductsBySlug -----
  test("getProductsBySlug מחזיר מוצר קיים לפי slug", async () => {
    req.params.slug = "phone";
    const fakeProduct = { id: 3, slug: "phone" };
    productService.getProductBySlugService.mockResolvedValue(fakeProduct);

    await controller.getProductsBySlug(req, res, next);

    expect(productService.getProductBySlugService).toHaveBeenCalledWith("phone");
    expect(res.json).toHaveBeenCalledWith(fakeProduct);
  });

  test("getProductsBySlug מחזיר 404 JSON אם המוצר לא נמצא", async () => {
    req.params.slug = "missing";
    productService.getProductBySlugService.mockResolvedValue(null);

    await controller.getProductsBySlug(req, res, next);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      status: 404,
      error: "מוצר לא נמצא",
    });
  });

  test("getProductsBySlug מחזיר 500 JSON במקרה של שגיאה רגילה", async () => {
    req.params.slug = "fail";
    productService.getProductBySlugService.mockRejectedValue(new Error("DB error"));

    await controller.getProductsBySlug(req, res, next);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      status: 500,
      error: "שגיאה בשליפת מוצר",
    });
  });

  test("getProductsBySlug מעביר CustomError JSON אם מתקבלת CustomError", async () => {
    req.params.slug = "custom";
    const customErr = new CustomError("בעיית Custom", 400);
    productService.getProductBySlugService.mockRejectedValue(customErr);

    await controller.getProductsBySlug(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      status: 400,
      error: "בעיית Custom",
    });
  });

  // ----- searchProducts -----
  test("searchProducts מחזיר תוצאות חיפוש בהצלחה", async () => {
    req.query = { search: "טלפון", page: 2, limit: 5 };
    const fakeResult = { items: [{ id: 4, title: "טלפון" }], total: 1 };
    productService.searchProductsService = jest.fn().mockResolvedValue(fakeResult);

    await controller.searchProducts(req, res, next);

    expect(productService.searchProductsService).toHaveBeenCalledWith({
      search: "טלפון",
      page: 2,
      limit: 5,
    });
    expect(res.json).toHaveBeenCalledWith(fakeResult);
  });

  test("searchProducts מחזיר JSON עם שגיאה במקרה של חריגה", async () => {
    req.query = { search: "מחשב" };
    productService.searchProductsService = jest.fn().mockRejectedValue(new Error("DB error"));

    await controller.searchProducts(req, res, next);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      status: 500,
      error: "שגיאה בחיפוש מוצרים",
    });
  });

  // ----- getPopularSearches -----
  test("getPopularSearches מחזיר חיפושים פופולריים", async () => {
    req.query = { limit: "3" };
    const fakeSearches = ["טלפון", "מחשב", "טאבלט"];
    productService.getPopularSearches = jest.fn().mockResolvedValue(fakeSearches);

    await controller.getPopularSearches(req, res, next);

    expect(productService.getPopularSearches).toHaveBeenCalledWith(3);
    expect(res.json).toHaveBeenCalledWith({ items: fakeSearches });
  });

  test("getPopularSearches מעביר שגיאה ל-next במקרה חריגה", async () => {
    const error = new Error("DB error");
    productService.getPopularSearches = jest.fn().mockRejectedValue(error);

    await controller.getPopularSearches(req, res, next);

    // next אמור לקבל את ה-error המקורי
    expect(next).toHaveBeenCalledWith(error);
  });

});
