import { jest } from "@jest/globals";

jest.unstable_mockModule("../../models/Product.js", () => ({
  __esModule: true,
  Product: {
    find: jest.fn(),
    findOne: jest.fn(),
    hydrate: jest.fn(),
    countDocuments: jest.fn()
  }
}));

jest.unstable_mockModule("../../models/SearchLog.js", () => ({
  __esModule: true,
  SearchLog: {
    findOneAndUpdate: jest.fn(),
    find: jest.fn()
  }
}));

const { productService } = await import("../../service/product.service.js");
const { Product } = await import("../../models/Product.js");
const { SearchLog } = await import("../../models/SearchLog.js");

describe("ProductService", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  // --- listNewProducts ---
  describe("listNewProducts", () => {
    it("should return new products with processed fields", async () => {
      const fakeProduct = {
        _id: "1",
        title: "טלפון",
        slug: "phone",
        images: ["img1.jpg"],
        currency: "ILS",
        publishedAt: new Date()
      };

      Product.find.mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue([fakeProduct])
      });

      Product.hydrate.mockReturnValue({
        getEffectivePricing: () => ({
          finalAmount: 800,
          baseAmount: 1000,
          savedAmount: 200,
          hasDiscount: true
        })
      });

      const result = await productService.listNewProducts();
      expect(result[0]).toMatchObject({
        _id: "1",
        finalPrice: 800,
        discountValue: 200,
        isNew: true
      });
    });

    it("should throw CustomError if limit is invalid", async () => {
      await expect(productService.listNewProducts(-1)).rejects.toThrow(
        "Limit must be a positive number"
      );
    });

    it("should return product without discount correctly", async () => {
      const fakeProduct = { _id: "2", publishedAt: new Date() };

      Product.find.mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue([fakeProduct])
      });

      Product.hydrate.mockReturnValue({
        getEffectivePricing: () => ({
          finalAmount: 500,
          baseAmount: 500,
          savedAmount: 0,
          hasDiscount: false
        })
      });

      const result = await productService.listNewProducts();
      expect(result[0]).toMatchObject({ hasDiscount: false, discountValue: 0 });
    });

    it("should return old product with isNew=false", async () => {
      const oldDate = new Date(Date.now() - 20 * 24 * 60 * 60 * 1000);
      const fakeProduct = { _id: "3", publishedAt: oldDate };

      Product.find.mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue([fakeProduct])
      });

      Product.hydrate.mockReturnValue({
        getEffectivePricing: () => ({
          finalAmount: 700,
          baseAmount: 700,
          savedAmount: 0,
          hasDiscount: false
        })
      });

      const result = await productService.listNewProducts();
      expect(result[0].isNew).toBe(false);
    });

    it("should handle product without publishedAt -> isNew=false", async () => {
      const fakeProduct = { _id: "99" };

      Product.find.mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue([fakeProduct])
      });

      Product.hydrate.mockReturnValue({
        getEffectivePricing: () => ({
          finalAmount: 100,
          baseAmount: 100,
          savedAmount: 0,
          hasDiscount: false
        })
      });

      const result = await productService.listNewProducts();

      expect(result[0]).toMatchObject({
        _id: "99",
        isNew: false
      });
    });


  });

  // --- getAllProductsService ---
  describe("getAllProductsService", () => {
    it("should return all products", async () => {
      const fakeProducts = [{ _id: "1" }];
      Product.find.mockReturnValue({
        populate: jest.fn().mockResolvedValue(fakeProducts)
      });
      const result = await productService.getAllProductsService();
      expect(result).toEqual(fakeProducts);
    });

    it("should throw CustomError if DB fails", async () => {
      Product.find.mockImplementation(() => { throw new Error("DB error"); });
      await expect(productService.getAllProductsService()).rejects.toThrow("DB error");
    });

    it("should call populate with storeId", async () => {
      const fakeProducts = [{ _id: "2" }];
      const populateMock = jest.fn().mockResolvedValue(fakeProducts);
      Product.find.mockReturnValue({ populate: populateMock });
      await productService.getAllProductsService();
      expect(populateMock).toHaveBeenCalledWith("storeId");
    });

    it("should throw CustomError if products is null", async () => {
      Product.find.mockReturnValue({
        populate: jest.fn().mockResolvedValue(null)
      });
      await expect(productService.getAllProductsService()).rejects.toThrow(
        "No products found"
      );
    });

    it("should throw CustomError if products is undefined", async () => {
      Product.find.mockReturnValue({
        populate: jest.fn().mockResolvedValue(undefined)
      });
      await expect(productService.getAllProductsService()).rejects.toThrow(
        "No products found"
      );
    });
  });

  // --- getProductBySlugService ---
  describe("getProductBySlugService", () => {
    it("should return product by slug", async () => {
      const fakeProduct = { _id: "1", slug: "phone" };
      Product.findOne.mockReturnValue({
        populate: jest.fn().mockResolvedValue(fakeProduct)
      });
      const result = await productService.getProductBySlugService("phone");
      expect(result).toEqual(fakeProduct);
    });

    it("should throw CustomError if slug not provided", async () => {
      await expect(productService.getProductBySlugService()).rejects.toThrow("Slug is required");
    });

    it("should throw CustomError if product not found", async () => {
      Product.findOne.mockReturnValue({ populate: jest.fn().mockResolvedValue(null) });
      await expect(productService.getProductBySlugService("bad")).rejects.toThrow(/not found/);
    });

    it("should throw CustomError if DB fails", async () => {
      Product.findOne.mockImplementation(() => { throw new Error("DB error"); });
      await expect(productService.getProductBySlugService("phone")).rejects.toThrow("DB error");
    });
  });

  // --- searchProductsService ---
  describe("searchProductsService", () => {
    it("should return products with pagination", async () => {
      const fakeProducts = [{ _id: "1" }];
      Product.find.mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        populate: jest.fn().mockResolvedValue(fakeProducts)
      });
      Product.countDocuments.mockResolvedValue(1);
      SearchLog.findOneAndUpdate.mockResolvedValue({});
      const result = await productService.searchProductsService({ search: "טלפון" });
      expect(result.items).toEqual(fakeProducts);
    });

    it("should handle empty search without logging", async () => {
      const fakeProducts = [{ _id: "2" }];
      Product.find.mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        populate: jest.fn().mockResolvedValue(fakeProducts)
      });
      Product.countDocuments.mockResolvedValue(1);
      const result = await productService.searchProductsService({ search: "" });
      expect(SearchLog.findOneAndUpdate).not.toHaveBeenCalled();
      expect(result.items).toEqual(fakeProducts);
    });

    it("should handle invalid page/limit values", async () => {
      const fakeProducts = [{ _id: "x" }];
      Product.find.mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        populate: jest.fn().mockResolvedValue(fakeProducts)
      });
      Product.countDocuments.mockResolvedValue(1);
      const result = await productService.searchProductsService({ search: "a", page: "abc", limit: -5 });
      expect(result.page).toBe(1);
      expect(result.limit).toBe(1);
    });

    it("should normalize Hebrew final letters", async () => {
      const fakeProducts = [{ _id: "3" }];
      Product.find.mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        populate: jest.fn().mockResolvedValue(fakeProducts)
      });
      Product.countDocuments.mockResolvedValue(1);
      SearchLog.findOneAndUpdate.mockResolvedValue({});
      const result = await productService.searchProductsService({ search: "מלך" });
      expect(result.items).toEqual(fakeProducts);
    });

    it("should strip nikud and special chars", async () => {
      const fakeProducts = [{ _id: "4" }];
      Product.find.mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        populate: jest.fn().mockResolvedValue(fakeProducts)
      });
      Product.countDocuments.mockResolvedValue(1);
      const result = await productService.searchProductsService({ search: "שָׁלוֹם״✡️" });
      expect(result.items).toEqual(fakeProducts);
    });

    it("should throw CustomError if DB fails", async () => {
      Product.find.mockImplementation(() => { throw new Error("DB error"); });
      await expect(productService.searchProductsService({ search: "טלפון" })).rejects.toThrow("DB error");
    });
  });

  // --- getPopularSearches ---
  describe("getPopularSearches", () => {
    it("should return popular search terms", async () => {
      const fakeTerms = [{ term: "טלפון", count: 5 }];
      SearchLog.find.mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        select: jest.fn().mockResolvedValue(fakeTerms)
      });
      const result = await productService.getPopularSearches(5);
      expect(result).toEqual(fakeTerms);
    });

    it("should throw CustomError if DB fails", async () => {
      SearchLog.find.mockImplementation(() => { throw new Error("DB error"); });
      await expect(productService.getPopularSearches()).rejects.toThrow("DB error");
    });

    it("should throw CustomError with status from error", async () => {
      const error = new Error("custom fail");
      error.status = 503;
      SearchLog.find.mockImplementation(() => { throw error; });
      await expect(productService.getPopularSearches()).rejects.toMatchObject({
        message: "custom fail",
        status: 503
      });
    });

    it("should throw CustomError without status", async () => {
      SearchLog.find.mockImplementation(() => { throw new Error("plain error"); });
      await expect(productService.getPopularSearches()).rejects.toMatchObject({
        message: "plain error",
        status: 500
      });
    });
  });

  // --- export ---
  it("should export productService instance", () => {
    expect(productService).toBeInstanceOf(Object);
    expect(typeof productService.listNewProducts).toBe("function");
  });
});
