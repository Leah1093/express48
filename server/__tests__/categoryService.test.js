import { jest } from "@jest/globals";

jest.unstable_mockModule("../models/category.js", () => ({
    __esModule: true,
    Category: {
        create: jest.fn(),
        find: jest.fn(),
        findById: jest.fn(),
        findByIdAndUpdate: jest.fn(),
        findByIdAndDelete: jest.fn(),
        deleteMany: jest.fn(),
    },
}));

const { Category } = await import("../models/category.js");
const { CategoryService } = await import("../service/categoryService.js");
const { CustomError } = await import("../utils/CustomError.js");

describe("CategoryService", () => {
    let service;
    beforeEach(() => {
        service = new CategoryService();
        jest.clearAllMocks();
    });

    describe("create", () => {
        test("should create category", async () => {
            const fake = { _id: "1", name: "Phones" };
            Category.create.mockResolvedValue(fake);

            const result = await service.create({ name: "Phones" });
            expect(result).toEqual(fake);
        });

        test("should throw CustomError if DB fails", async () => {
            Category.create.mockRejectedValue(new Error("DB error"));
            await expect(service.create({})).rejects.toThrow(CustomError);
        });
    });

    describe("getById", () => {
        test("should return category", async () => {
            Category.findById.mockReturnValue({ lean: jest.fn().mockResolvedValue({ _id: "1" }) });
            const result = await service.getById("1");
            expect(result).toEqual({ _id: "1" });
        });

        test("should throw 404 if not found", async () => {
            Category.findById.mockReturnValue({ lean: jest.fn().mockResolvedValue(null) });
            await expect(service.getById("x")).rejects.toMatchObject({ status: 404 });
        });
    });

    describe("update", () => {
        test("should update category", async () => {
            Category.findByIdAndUpdate.mockResolvedValue({ _id: "1", name: "Updated" });
            const result = await service.update("1", { name: "Updated" });
            expect(result.name).toBe("Updated");
        });

        test("should throw 404 if not found", async () => {
            Category.findByIdAndUpdate.mockResolvedValue(null);
            await expect(service.update("x", {})).rejects.toMatchObject({ status: 404 });
        });
    });

    describe("remove", () => {
        test("should remove category and subcategories", async () => {
            Category.findByIdAndDelete.mockResolvedValue({ _id: "1" });
            Category.deleteMany.mockResolvedValue({});
            const result = await service.remove("1");
            expect(result._id).toBe("1");
            expect(Category.deleteMany).toHaveBeenCalledWith({ parentId: "1" });
        });

        test("should throw 404 if not found", async () => {
            Category.findByIdAndDelete.mockResolvedValue(null);
            await expect(service.remove("x")).rejects.toMatchObject({ status: 404 });
        });
    });

    describe("uploadIcon", () => {
        test("should update icon path", async () => {
            Category.findByIdAndUpdate.mockResolvedValue({ _id: "1", icon: "/uploads/icons/test.png" });
            const result = await service.uploadIcon("1", "/tmp/test.png");
            expect(result.icon).toBe("/uploads/icons/test.png");
        });

        test("should throw 404 if not found", async () => {
            Category.findByIdAndUpdate.mockResolvedValue(null);
            await expect(service.uploadIcon("x", "/tmp/test.png")).rejects.toMatchObject({ status: 404 });
        });
    });

    describe("CategoryService additional error coverage", () => {
        let service;
        beforeEach(() => {
            service = new CategoryService();
            jest.clearAllMocks();
        });

        test("list should throw CustomError on DB failure", async () => {
            Category.find.mockImplementation(() => { throw new Error("DB fail"); });
            await expect(service.list()).rejects.toMatchObject({
                status: 500,
                message: "Failed to fetch categories",
            });
        });

        test("getById should throw 500 CustomError on DB failure", async () => {
            Category.findById.mockImplementation(() => { throw new Error("DB error"); });
            await expect(service.getById("1")).rejects.toMatchObject({
                status: 500,
                message: "Failed to fetch category",
            });
        });

        test("update should throw 500 CustomError on DB failure", async () => {
            Category.findByIdAndUpdate.mockImplementation(() => { throw new Error("DB error"); });
            await expect(service.update("1", {})).rejects.toMatchObject({
                status: 500,
                message: "Failed to update category",
            });
        });

        test("remove should throw 500 CustomError on DB failure", async () => {
            Category.findByIdAndDelete.mockImplementation(() => { throw new Error("DB error"); });
            await expect(service.remove("1")).rejects.toMatchObject({
                status: 500,
                message: "Failed to delete category",
            });
        });

        test("uploadIcon should throw 500 CustomError on DB failure", async () => {
            Category.findByIdAndUpdate.mockImplementation(() => { throw new Error("DB error"); });
            await expect(service.uploadIcon("1", "/tmp/a.png")).rejects.toMatchObject({
                status: 500,
                message: "Failed to upload icon",
            });
        });

        test("create should throw default CustomError message if error has no message", async () => {
  const error = new Error();
  delete error.message; // מסיר את ה-message כדי להכריח להשתמש בברירת מחדל
  Category.create.mockRejectedValue(error);

  await expect(service.create({})).rejects.toMatchObject({
    status: 500,
    message: "Failed to create category",
  });
});

    });

});
