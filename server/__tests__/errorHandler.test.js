import { jest } from "@jest/globals";
import { errorHandler } from "../middlewares/errorHandler.js";

describe("errorHandler Middleware", () => {
    let req, res, next;

    beforeEach(() => {
        req = { originalUrl: "/test", method: "GET" };
        res = {
            statusCode: 200,
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };
        next = jest.fn();

        // משתיקים לוגים
        jest.spyOn(console, "error").mockImplementation(() => { });
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    afterAll(() => {
        console.error.mockRestore();
    });

    it("מחזיר את הודעת השגיאה אם היא קיימת", () => {
        const err = { message: "קרס DB" };

        errorHandler(err, req, res, next);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({
            status: 500,
            error: "קרס DB",
        });
    });

    it("מחזיר הודעת ברירת מחדל אם אין message", () => {
        const err = { statusCode: 401 }; // בלי message

        errorHandler(err, req, res, next);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({
            status: 401,
            error: "Authorization required",
        });
    });

    it("מחזיר את ההודעה מ־CustomError", () => {
        const err = { statusCode: 404, message: "מוצר לא נמצא" };

        errorHandler(err, req, res, next);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({
            status: 404,
            error: "מוצר לא נמצא",
        });
    });

    it("מחזיר הודעה default אם אין statusCode בכלל", () => {
        const err = {}; // בלי statusCode ובלי message

        errorHandler(err, req, res, next);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({
            status: 500,
            error: "Internal Server Error", // ✅ תואם ל-errMessageForClient(500)
        });
    });


    const cases = [
        { status: 400, expected: "Invalid request parameters" },
        { status: 401, expected: "Authorization required" },
        { status: 404, expected: "Not found" },
        { status: 407, expected: "Authorization failed" },
        { status: 409, expected: "An existing element already exists" },
        { status: 500, expected: "Internal Server Error" },
        { status: 999, expected: "Something went wrong!" },
    ];

    it.each(cases)(
        "מחזיר הודעת ברירת מחדל לסטטוס %s",
        ({ status, expected }) => {
            const err = { statusCode: status }; // בלי message

            errorHandler(err, req, res, next);

            expect(res.status).toHaveBeenCalledWith(status);
            expect(res.json).toHaveBeenCalledWith({
                status,
                error: expected,
            });
        }
    );
});
