import { jest } from "@jest/globals";
import request from "supertest";
import express from "express";
import path from "path";
import { fileURLToPath } from "url";

// פתרון ל־__dirname ב־ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);



// mock ל־CategoryService
jest.unstable_mockModule("../service/categoryService.js", () => ({
    __esModule: true,
    CategoryService: jest.fn().mockImplementation(() => ({
        create: jest.fn(),
        list: jest.fn(),
        getById: jest.fn(),
        update: jest.fn(),
        remove: jest.fn(),
        uploadIcon: jest.fn(),
    })),
}));

// אחרי ה־mock נייבא את שאר הקבצים
const { default: categoryRouter } = await import("../router/categoryRoutes.js");
const { service } = await import("../controllers/categoryController.js");
const { errorHandler } = await import("../middlewares/errorHandler.js");
const { CustomError } = await import("../utils/CustomError.js");

// בונים אפליקציה אמיתית
const app = express();
app.use(express.json());
app.use("/categories", categoryRouter);
app.use(errorHandler);

// משתיקים לוגים מה־errorHandler
beforeAll(() => {
    jest.spyOn(console, "error").mockImplementation(() => { });
});

afterAll(() => {
    console.error.mockRestore();
});

describe("Category Router (Integration)", () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    // --- POST /categories ---
    test("POST /categories creates root category with icon", async () => {
        const fake = { _id: "1", name: "Phones", icon: "http://example.com/icon.png" };
        service.create.mockResolvedValue(fake);

        const res = await request(app)
            .post("/categories")
            .send({ name: "Phones", icon: "http://example.com/icon.png" });

        expect(res.status).toBe(201);
        expect(res.body).toEqual(fake);
    });

    test("POST /categories creates sub-category with parentId", async () => {
        const fake = { _id: "2", name: "Smartphones", parentId: "1" };
        service.create.mockResolvedValue(fake);

        const res = await request(app)
            .post("/categories")
            .send({ name: "Smartphones", parentId: "1" });

        expect(res.status).toBe(201);
        expect(res.body).toEqual(fake);
    });

    test("POST /categories handles service error", async () => {
        service.create.mockRejectedValue(new Error("DB fail"));

        const res = await request(app)
            .post("/categories")
            .send({ name: "Fail", icon: "http://example.com/icon.png" });

        expect(res.status).toBe(500);
        expect(res.body).toEqual({
            status: 500,
            error: "DB fail",
        });
    });
    test("POST /categories with file should create category", async () => {
        const fake = { _id: "99", name: "With File", icon: "/uploads/icons/icon.png" };
        service.create.mockResolvedValue(fake);

        const res = await request(app)
            .post("/categories")
            .attach("icon", path.join(__dirname, "fixtures", "icon.png"))
            .field("name", "With File");

        expect(res.status).toBe(201);
        expect(res.body).toEqual(fake);
    });




    // --- GET /categories ---
    test("GET /categories lists categories", async () => {
        const fake = [{ _id: "1", name: "Phones" }];
        service.list.mockResolvedValue(fake);

        const res = await request(app).get("/categories");

        expect(res.status).toBe(200);
        expect(res.body).toEqual(fake);
    });

    test("GET /categories handles error", async () => {
        service.list.mockRejectedValue(new Error("fail"));

        const res = await request(app).get("/categories");

        expect(res.status).toBe(500);
        expect(res.body).toEqual({
            status: 500,
            error: "fail",
        });
    });

    // --- GET /categories/:id ---
    test("GET /categories/:id returns category", async () => {
        const fake = { _id: "1", name: "Phones" };
        service.getById.mockResolvedValue(fake);

        const res = await request(app).get("/categories/1");

        expect(res.status).toBe(200);
        expect(res.body).toEqual(fake);
    });

    test("GET /categories/:id handles not found", async () => {
        service.getById.mockRejectedValue(new CustomError("Category not found", 404));

        const res = await request(app).get("/categories/404");

        expect(res.status).toBe(404);
        expect(res.body).toEqual({
            status: 404,
            error: "Category not found",
        });
    });

    // --- PUT /categories/:id ---
    test("PUT /categories/:id updates category", async () => {
        const fake = { _id: "1", name: "Updated" };
        service.update.mockResolvedValue(fake);

        const res = await request(app).put("/categories/1").send({ name: "Updated" });

        expect(res.status).toBe(200);
        expect(res.body).toEqual(fake);
    });

    test("PUT /categories/:id handles not found", async () => {
        service.update.mockResolvedValue(null);

        const res = await request(app).put("/categories/404").send({ name: "Updated" });

        expect(res.status).toBe(404);
        expect(res.body).toEqual({ error: "Category not found" });
    });

    test("PUT /categories/:id handles error", async () => {
        service.update.mockRejectedValue(new Error("fail"));

        const res = await request(app).put("/categories/1").send({ name: "fail" });

        expect(res.status).toBe(500);
        expect(res.body).toEqual({
            status: 500,
            error: "fail",
        });
    });

    // --- DELETE /categories/:id ---
    test("DELETE /categories/:id removes category", async () => {
        service.remove.mockResolvedValue({});

        const res = await request(app).delete("/categories/1");

        expect(res.status).toBe(200);
        expect(res.body).toEqual({ ok: true });
    });

    test("DELETE /categories/:id handles error", async () => {
        service.remove.mockRejectedValue(new Error("fail"));

        const res = await request(app).delete("/categories/1");

        expect(res.status).toBe(500);
        expect(res.body).toEqual({
            status: 500,
            error: "fail",
        });
    });
});
