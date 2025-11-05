import express from "express";
import request from "supertest";
import { jest } from "@jest/globals";

// 🟦 mock middlewares
jest.unstable_mockModule("../../middlewares/auth.js", () => ({
  authMiddleware: (req, res, next) => {
    req.user = { userId: "u1" };
    next();
  },
}));

jest.unstable_mockModule("../../middlewares/recaptchaV2.js", () => ({
  recaptchaV2Middleware: (req, res, next) => next(),
}));

jest.unstable_mockModule("../../middlewares/validate.js", () => ({
  validate: (schema) => (req, res, next) => {
    if (req.headers["x-validate-fail"]) {
      const err = new Error("Validation Error");
      err.statusCode = 400;
      return next(err);
    }
    next();
  },
}));

jest.unstable_mockModule("../../middlewares/rateLimit.middleware.js", () => ({
  resetPasswordLimiter: (req, res, next) => {
    if (req.headers["x-resetlimit-fail"]) {
      const err = new Error("Rate limit exceeded");
      err.statusCode = 429;
      return next(err);
    }
    next();
  },
  changePasswordLimiter: (req, res, next) => {
    if (req.headers["x-changelimit-fail"]) {
      const err = new Error("Rate limit exceeded");
      err.statusCode = 429;
      return next(err);
    }
    next();
  },
}));

// 🟦 mock controller
const changePassword = jest.fn();
const forgotPassword = jest.fn();
const resetPassword = jest.fn();

jest.unstable_mockModule("../../controllers/pwd.controller.js", () => ({
  default: jest.fn().mockImplementation(() => ({
    changePassword,
    forgotPassword,
    resetPassword,
  })),
}));

// 🟦 import router & error handler dynamically
const { passwordRouter } = await import("../../router/pwd.router.js");
const { errorHandler } = await import("../../middlewares/errorHandler.js");

// 🟩 create express app
const app = express();
app.use(express.json());
app.use("/password", passwordRouter);
app.use(errorHandler);

describe("Password Router (Integration)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ---------- /change-password ----------
  describe("POST /password/change-password", () => {
    test("201 כשמוצלח", async () => {
      changePassword.mockImplementation((req, res) =>
        res.status(201).json({ success: true })
      );

      const res = await request(app)
        .post("/password/change-password")
        .send({ currentPassword: "old", newPassword: "new" });

      expect(res.status).toBe(201);
      expect(res.body).toEqual({ success: true });
      expect(changePassword).toHaveBeenCalled();
    });

    test("400 כשולידציה נכשלת", async () => {
      const res = await request(app)
        .post("/password/change-password")
        .set("x-validate-fail", "1")
        .send({});

      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/Validation Error/);
    });

    test("429 כשנכשל RateLimit", async () => {
      const res = await request(app)
        .post("/password/change-password")
        .set("x-changelimit-fail", "1")
        .send({ currentPassword: "a", newPassword: "b" });

      expect(res.status).toBe(429);
      expect(res.body.error).toMatch(/Rate limit exceeded/);
    });

    test("500 כשיש שגיאה בקונטרולר", async () => {
      changePassword.mockImplementation(() => {
        throw new Error("DB error");
      });

      const res = await request(app)
        .post("/password/change-password")
        .send({ currentPassword: "old", newPassword: "new" });

      expect(res.status).toBe(500);
      // 🟩 חשוב: לפי errorHandler שלך מוחזר err.message המקורי
      expect(res.body.error).toBe("DB error");
    });
  });

  // ---------- /forgot-password ----------
  describe("POST /password/forgot-password", () => {
    test("200 כשמוצלח", async () => {
      forgotPassword.mockImplementation((req, res) =>
        res.status(200).json({ message: "OK" })
      );

      const res = await request(app)
        .post("/password/forgot-password")
        .send({ email: "a@a.com" });

      expect(res.status).toBe(200);
      expect(res.body).toEqual({ message: "OK" });
      expect(forgotPassword).toHaveBeenCalled();
    });

    test("400 כשולידציה נכשלת", async () => {
      const res = await request(app)
        .post("/password/forgot-password")
        .set("x-validate-fail", "1")
        .send({});

      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/Validation Error/);
    });

    test("429 כשRateLimit נחסם", async () => {
      const res = await request(app)
        .post("/password/forgot-password")
        .set("x-resetlimit-fail", "1")
        .send({ email: "a@a.com" });

      expect(res.status).toBe(429);
      expect(res.body.error).toMatch(/Rate limit exceeded/);
    });

    test("500 כשקונטרולר נופל", async () => {
      forgotPassword.mockImplementation(() => {
        throw new Error("SMTP fail");
      });

      const res = await request(app)
        .post("/password/forgot-password")
        .send({ email: "a@a.com" });

      expect(res.status).toBe(500);
      expect(res.body.error).toBe("SMTP fail");
    });
  });

  // ---------- /reset-password ----------
  describe("POST /password/reset-password", () => {
    test("200 כשמוצלח", async () => {
      resetPassword.mockImplementation((req, res) =>
        res.status(200).json({ done: true })
      );

      const res = await request(app)
        .post("/password/reset-password")
        .send({ token: "t", newPassword: "n" });

      expect(res.status).toBe(200);
      expect(res.body).toEqual({ done: true });
    });

    test("500 כשנופל בקונטרולר", async () => {
      resetPassword.mockImplementation(() => {
        throw new Error("DB fail");
      });

      const res = await request(app)
        .post("/password/reset-password")
        .send({ token: "t", newPassword: "n" });

      expect(res.status).toBe(500);
      expect(res.body.error).toBe("DB fail");
    });
  });
});
