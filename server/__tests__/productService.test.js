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
    it("צריך להחזיר מוצרים חדשים עם שדות מעובדים", async () => {
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


      // mock ל־Product.find
      Product.find.mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue([fakeProduct])
      });

      // mock ל־hydrate ול־getEffectivePricing
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
      expect(result).toEqual([
        expect.objectContaining({
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
        })
      ]);

    });
    it("צריך להחזיר מוצר חדש בלי הנחה (discountValue=0)", async () => {
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

    it("צריך להחזיר מוצר ישן (isNew=false)", async () => {
      const oldDate = new Date(Date.now() - 20 * 24 * 60 * 60 * 1000); // לפני 20 יום
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

      expect(result[0]).toMatchObject({
        title: "מוצר ישן",
        isNew: false
      });
    });

    it("צריך לכבד limit ולחזיר רק מוצר אחד", async () => {
      const fakeProducts = [
        { _id: "4", title: "מוצר 1", slug: "p1", images: [], currency: "ILS", publishedAt: new Date() },
        { _id: "5", title: "מוצר 2", slug: "p2", images: [], currency: "ILS", publishedAt: new Date() }
      ];

      Product.find.mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue(fakeProducts)
      });

      Product.hydrate.mockReturnValue({
        getEffectivePricing: () => ({
          finalAmount: 100,
          baseAmount: 100,
          savedAmount: 0,
          hasDiscount: false
        })
      });

      const result = await productService.listNewProducts(1);

      expect(result.length).toBe(2);
    });
  });



  describe("getAllProductsService", () => {
    it("צריך להחזיר את כל המוצרים", async () => {
      const fakeProducts = [{ _id: "1", title: "A" }];
      Product.find.mockReturnValue({
        populate: jest.fn().mockResolvedValue(fakeProducts)
      });

      const result = await productService.getAllProductsService();
      expect(result).toEqual(fakeProducts);
    });

    it("צריך לזרוק שגיאה במקרה של בעיה", async () => {
      Product.find.mockImplementation(() => {
        throw new Error("DB error");
      });

      await expect(productService.getAllProductsService()).rejects.toThrow(
        "Error fetching products"
      );
    });

    it("צריך לקרוא ל־populate עם storeId", async () => {
      const fakeProducts = [{ _id: "6", title: "מוצר עם חנות" }];
      const populateMock = jest.fn().mockResolvedValue(fakeProducts);

      Product.find.mockReturnValue({ populate: populateMock });

      const result = await productService.getAllProductsService();

      expect(populateMock).toHaveBeenCalledWith("storeId");
      expect(result).toEqual(fakeProducts);
    });
  });

  describe("getProductBySlugService", () => {
    it("צריך להחזיר מוצר לפי slug", async () => {
      const fakeProduct = { _id: "1", slug: "phone" };
      Product.findOne.mockReturnValue({
        populate: jest.fn().mockResolvedValue(fakeProduct)
      });

      const result = await productService.getProductBySlugService("phone");
      expect(result).toEqual(fakeProduct);
    });

    it("צריך לזרוק שגיאה במקרה של בעיה", async () => {
      Product.findOne.mockImplementation(() => {
        throw new Error("DB error");
      });

      await expect(
        productService.getProductBySlugService("bad-slug")
      ).rejects.toThrow("Error fetching product by slug");
    });

    it("צריך להחזיר null אם לא נמצא מוצר", async () => {
      Product.findOne.mockReturnValue({
        populate: jest.fn().mockResolvedValue(null)
      });

      const result = await productService.getProductBySlugService("not-exist");
      expect(result).toBeNull();
    });
  });
});
