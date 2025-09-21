import { jest } from "@jest/globals";

jest.unstable_mockModule("../models/Product.js", () => ({
  __esModule: true,
  Product: {
    find: jest.fn(),
    findOne: jest.fn(),
    hydrate: jest.fn()
  }
}));

const { productService } = await import("../service/product.service.js");
const { Product } = await import("../models/Product.js");

describe("ProductService", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("listNewProducts", () => {
    it("should return new products with processed fields", async () => {
      const fakeProduct = {
        _id: "1",
        title: "טלפון",
        slug: "phone",
        images: ["img1.jpg"],
        currency: "ILS",
        price: { amount: 1000 },
        discount: null,
        publishedAt: new Date(),
        storeId: "store1"
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

      expect(Product.find).toHaveBeenCalledWith(
        expect.objectContaining({ status: "published" })
      );
      expect(result[0]).toMatchObject({
        _id: "1",
        title: "טלפון",
        slug: "phone",
        images: ["img1.jpg"],
        currency: "ILS",
        basePrice: 1000,
        finalPrice: 800,
        discountValue: 200,
        hasDiscount: true,
        isNew: true
      });
    });

    it("should throw CustomError if limit is invalid", async () => {
      await expect(productService.listNewProducts(-1)).rejects.toThrow(
        "Limit must be a positive number"
      );
    });

    it("should return product without discount correctly", async () => {
      const fakeProduct = {
        _id: "2",
        title: "מוצר בלי הנחה",
        slug: "no-discount",
        images: ["img2.jpg"],
        currency: "ILS",
        price: { amount: 500 },
        discount: null,
        publishedAt: new Date(),
        storeId: "store1"
      };

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

      expect(result[0]).toMatchObject({
        title: "מוצר בלי הנחה",
        finalPrice: 500,
        discountValue: 0,
        hasDiscount: false,
        isNew: true
      });
    });

    it("should return old product with isNew=false", async () => {
      const oldDate = new Date(Date.now() - 20 * 24 * 60 * 60 * 1000);
      const fakeProduct = {
        _id: "3",
        title: "מוצר ישן",
        slug: "old-product",
        images: ["img3.jpg"],
        currency: "ILS",
        price: { amount: 700 },
        discount: null,
        publishedAt: oldDate,
        storeId: "store1"
      };

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


  });

  describe("getAllProductsService", () => {
    it("should return all products", async () => {
      const fakeProducts = [{ _id: "1", title: "A" }];
      Product.find.mockReturnValue({
        populate: jest.fn().mockResolvedValue(fakeProducts)
      });

      const result = await productService.getAllProductsService();
      expect(result).toEqual(fakeProducts);
    });

    it("should throw CustomError if DB fails", async () => {
      Product.find.mockImplementation(() => { throw new Error("DB error"); });

      await expect(productService.getAllProductsService()).rejects.toThrow(
        "DB error"
      );
    });

    it("should call populate with storeId", async () => {
      const fakeProducts = [{ _id: "6", title: "מוצר עם חנות" }];
      const populateMock = jest.fn().mockResolvedValue(fakeProducts);
      Product.find.mockReturnValue({ populate: populateMock });

      const result = await productService.getAllProductsService();

      expect(populateMock).toHaveBeenCalledWith("storeId");
      expect(result).toEqual(fakeProducts);
    });
  });

  describe("getProductBySlugService", () => {
    it("should return product by slug", async () => {
      const fakeProduct = { _id: "1", slug: "phone" };
      Product.findOne.mockReturnValue({ populate: jest.fn().mockResolvedValue(fakeProduct) });

      const result = await productService.getProductBySlugService("phone");
      expect(result).toEqual(fakeProduct);
    });

    it("should throw CustomError if slug not provided", async () => {
      await expect(productService.getProductBySlugService()).rejects.toThrow(
        "Slug is required"
      );
    });

    it("should throw CustomError if product not found", async () => {
      Product.findOne.mockReturnValue({ populate: jest.fn().mockResolvedValue(null) });
      await expect(productService.getProductBySlugService("not-exist")).rejects.toThrow(
        "Product with slug 'not-exist' not found"
      );
    });

    it("should throw CustomError if DB fails", async () => {
      Product.findOne.mockImplementation(() => { throw new Error("DB error"); });
      await expect(productService.getProductBySlugService("phone")).rejects.toThrow(
        "DB error"
      );
    });

    it("should throw CustomError if slug is missing", async () => {
      await expect(productService.getProductBySlugService()).rejects.toThrow(
        "Slug is required"
      );
    });

  });
});
