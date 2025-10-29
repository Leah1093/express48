import { jest } from "@jest/globals";

const makeFindChain = (result) => {
    const chain = {
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue(result),
    };
    return chain;
};

const productModulePath = "../../models/Product.js";
const mongooseModulePath = "mongoose";
const customErrorPath = "../../utils/CustomError.js";
const servicePath = "../../service/storefront.service.js";

describe("StorefrontService", () => {
    let ProductMock;
    let mongooseMock;
    let CustomError;
    let StorefrontService;

    beforeEach(async () => {
        jest.resetModules();
        jest.clearAllMocks();

        // mock CustomError (primary)
        ({ CustomError } = await import(customErrorPath));

        // mock Product model
        jest.unstable_mockModule(productModulePath, () => {
            ProductMock = {
                find: jest.fn(),
                countDocuments: jest.fn(),
                findOne: jest.fn(),
            };
            return { __esModule: true, Product: ProductMock };
        });

        // mock mongoose.Types.ObjectId.isValid
        jest.unstable_mockModule(mongooseModulePath, () => {
            mongooseMock = {
                Types: {
                    ObjectId: { isValid: jest.fn() },
                },
            };
            return { __esModule: true, default: mongooseMock, ...mongooseMock };
        });

        // dynamic import AFTER mocks
        ({ StorefrontService } = await import(servicePath));
    });

    describe("listPublished", () => {
        test("happy path - no q, default page/limit, pages>=1", async () => {
            const svc = new StorefrontService();
            const items = [{ _id: "1" }];
            ProductMock.find.mockReturnValue(makeFindChain(items));
            ProductMock.countDocuments.mockResolvedValue(1);

            const res = await svc.listPublished({});
            expect(ProductMock.find).toHaveBeenCalledWith({ status: "published", isDeleted: false });
            expect(res).toEqual({ items, total: 1, page: 1, pages: 1 });
        });

        test("with q trims and applies $text", async () => {
            const svc = new StorefrontService();
            const items = [];
            ProductMock.find.mockReturnValue(makeFindChain(items));
            ProductMock.countDocuments.mockResolvedValue(0);

            await svc.listPublished({ q: "  camera  " });
            const call = ProductMock.find.mock.calls[0][0];
            expect(call.$text).toEqual({ $search: "camera" });
        });

        test("validates page and limit (positive ints)", async () => {
            const svc = new StorefrontService();
            await expect(svc.listPublished({ page: 0 })).rejects.toThrow("page must be a positive integer");
            await expect(svc.listPublished({ limit: "x" })).rejects.toThrow("limit must be a positive integer");
        });

        test("limit over MAX_LIMIT -> 400", async () => {
            const svc = new StorefrontService();
            await expect(svc.listPublished({ limit: 101 })).rejects.toThrow("limit must be <= 100");
        });

        test("DB error is wrapped as CustomError 500", async () => {
            const svc = new StorefrontService();
            ProductMock.find.mockImplementation(() => {
                const c = makeFindChain(Promise.resolve([]));
                c.lean = jest.fn().mockRejectedValue(new Error("boom"));
                return c;
            });
            ProductMock.countDocuments.mockResolvedValue(0);

            await expect(svc.listPublished({})).rejects.toMatchObject({ statusCode: 500, status: 500 });
        });

        test("pages are computed with Math.max(1, ...)", async () => {
            const svc = new StorefrontService();
            ProductMock.find.mockReturnValue(makeFindChain([]));
            ProductMock.countDocuments.mockResolvedValue(0);

            const res = await svc.listPublished({ page: 3, limit: 20 });
            expect(res.pages).toBe(1);
            expect(res.page).toBe(3);
        });
    });

    describe("getOnePublic", () => {
        test("requires idOrSlug", async () => {
            const svc = new StorefrontService();
            await expect(svc.getOnePublic()).rejects.toThrow("idOrSlug is required");
            await expect(svc.getOnePublic(123)).rejects.toThrow("idOrSlug is required");
        });

        test("by ObjectId (valid) -> uses _id filter", async () => {
            const svc = new StorefrontService();
            mongooseMock.Types.ObjectId.isValid.mockReturnValue(true);
            ProductMock.findOne.mockReturnValue({ lean: jest.fn().mockResolvedValue({ _id: "abc" }) });

            const res = await svc.getOnePublic("abc");
            expect(ProductMock.findOne).toHaveBeenCalledWith({
                isDeleted: false,
                status: "published",
                _id: "abc",
            });
            expect(res).toEqual({ _id: "abc" });
        });

        test("by slug (invalid ObjectId) -> uses slug filter", async () => {
            const svc = new StorefrontService();
            mongooseMock.Types.ObjectId.isValid.mockReturnValue(false);
            ProductMock.findOne.mockReturnValue({ lean: jest.fn().mockResolvedValue({ slug: "nice-slug" }) });

            const res = await svc.getOnePublic("nice-slug");
            expect(ProductMock.findOne).toHaveBeenCalledWith({
                isDeleted: false,
                status: "published",
                slug: "nice-slug",
            });
            expect(res).toEqual({ slug: "nice-slug" });
        });

        test("not found -> 404 CustomError", async () => {
            const svc = new StorefrontService();
            mongooseMock.Types.ObjectId.isValid.mockReturnValue(false);
            ProductMock.findOne.mockReturnValue({ lean: jest.fn().mockResolvedValue(null) });

            await expect(svc.getOnePublic("missing")).rejects.toMatchObject({ statusCode: 404, status: 404 });
        });

        test("DB error wrapped as 500", async () => {
            const svc = new StorefrontService();
            mongooseMock.Types.ObjectId.isValid.mockReturnValue(true);
            ProductMock.findOne.mockReturnValue({ lean: jest.fn().mockRejectedValue(new Error("db boom")) });

            await expect(svc.getOnePublic("650000000000000000000001")).rejects.toMatchObject({ statusCode: 500, status: 500 });
        });
    });

    // --- תוספות כיסוי ---

    describe("listPublished - edge cases for q/page/limit", () => {
        test("q is whitespace only -> does NOT add $text", async () => {
            const svc = new StorefrontService();
            ProductMock.find.mockReturnValue(
                // ללא פריטים
                {
                    sort: jest.fn().mockReturnThis(),
                    skip: jest.fn().mockReturnThis(),
                    limit: jest.fn().mockReturnThis(),
                    lean: jest.fn().mockResolvedValue([]),
                }
            );
            ProductMock.countDocuments.mockResolvedValue(0);

            await svc.listPublished({ q: "   " }); // רק רווחים
            expect(ProductMock.find).toHaveBeenCalledTimes(1);
            const call = ProductMock.find.mock.calls[0][0];
            expect(call).toEqual({ status: "published", isDeleted: false }); // אין $text
        });

        test("q is non-string (number) -> does NOT add $text", async () => {
            const svc = new StorefrontService();
            ProductMock.find.mockReturnValue({
                sort: jest.fn().mockReturnThis(),
                skip: jest.fn().mockReturnThis(),
                limit: jest.fn().mockReturnThis(),
                lean: jest.fn().mockResolvedValue([]),
            });
            ProductMock.countDocuments.mockResolvedValue(0);

            await svc.listPublished({ q: 7 });
            const call = ProductMock.find.mock.calls[0][0];
            expect(call).toEqual({ status: "published", isDeleted: false }); // אין $text
        });

        test("page/limit as numeric strings are accepted", async () => {
            const svc = new StorefrontService();
            const items = [{ _id: "1" }];
            ProductMock.find.mockReturnValue({
                sort: jest.fn().mockReturnThis(),
                skip: jest.fn().mockReturnThis(), // יוודא שמתקבל מספר אחרי Number()
                limit: jest.fn().mockReturnThis(),
                lean: jest.fn().mockResolvedValue(items),
            });
            ProductMock.countDocuments.mockResolvedValue(1);

            const res = await svc.listPublished({ page: "2", limit: "10" });
            expect(res.page).toBe(2);
            expect(res.pages).toBe(1);
        });
    });

    describe("getOnePublic - rethrow CustomError branch", () => {
        test("DB throws CustomError -> rethrown as-is", async () => {
            const svc = new StorefrontService();
            const { CustomError } = await import(customErrorPath);

            mongooseMock.Types.ObjectId.isValid.mockReturnValue(true);
            // lean דוחה עם CustomError כדי לכסות את הענף if (err instanceof CustomError) throw err;
            ProductMock.findOne.mockReturnValue({
                lean: jest.fn().mockRejectedValue(new CustomError("Authorization failed", 407)),
            });

            await expect(svc.getOnePublic("650000000000000000000001"))
                .rejects.toMatchObject({ statusCode: 407, status: 407, message: "Authorization failed" });
        });
    });

});
