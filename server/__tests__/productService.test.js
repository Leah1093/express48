import { jest } from "@jest/globals";
import { productService } from "../service/product.service.js";
import { Product } from "../models/Product.js";

jest.mock("../models/Product.js");

describe("ProductService", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test("createProduct should save product", async () => {
    const mockData = { title: "Test Product" };
    const mockActor = { id: "123" };

    const mockSave = jest.fn().mockResolvedValue({ _id: "1", ...mockData });
    Product.mockImplementation(() => ({ save: mockSave }));

    const result = await productService.createProduct({
      data: mockData,
      actor: mockActor,
    });

    expect(result.title).toBe("Test Product");
    expect(mockSave).toHaveBeenCalledTimes(1);
  });

  test("getAllProductsService should return products", async () => {
    const mockProducts = [{ _id: "1", title: "Test" }];
    Product.find.mockReturnValue({
      populate: jest.fn().mockResolvedValue(mockProducts),
    });

    const result = await productService.getAllProductsService();
    expect(result).toEqual(mockProducts);
  });

  test("getProductBySlugService should return product", async () => {
    const mockProduct = { _id: "1", slug: "test" };
    Product.findOne.mockReturnValue({
      populate: jest.fn().mockResolvedValue(mockProduct),
    });

    const result = await productService.getProductBySlugService("test");
    expect(result).toEqual(mockProduct);
  });
});