import { jest } from "@jest/globals";

// 🟦 Mock PasswordService
const serviceInstance = {
  changePassword: jest.fn(),
  requestPasswordReset: jest.fn(),
  resetPassword: jest.fn(),
};

jest.unstable_mockModule("../../service/pwd.service.js", () => ({
  PasswordService: jest.fn().mockImplementation(() => serviceInstance),
}));

// 🟦 Mock CustomError
jest.unstable_mockModule("../../utils/CustomError.js", () => ({
  CustomError: class CustomError extends Error {
    constructor(message, statusCode = 500) {
      super(message);
      this.statusCode = statusCode;
      this.status = statusCode;
    }
  },
}));

// 🟦 Dynamic imports after mocks
const { PasswordService } = await import("../../service/pwd.service.js");
const { CustomError } = await import("../../utils/CustomError.js");
const PasswordController = (await import("../../controllers/pwd.controller.js")).default;

// 🟩 Helper response mock
const mockRes = () => {
  const res = {};
  res.status = jest.fn(() => res);
  res.json = jest.fn(() => res);
  return res;
};

describe("PasswordController", () => {
  let controller;

  beforeEach(() => {
    jest.clearAllMocks();
    controller = new PasswordController();
  });

  // ---------- changePassword ----------
  describe("changePassword", () => {
    test("400 כשחסרים currentPassword ו-newPassword", async () => {
      const req = { body: {}, user: { userId: "u1" } };
      const res = mockRes();
      const next = jest.fn();

      await controller.changePassword(req, res, next);

      const err = next.mock.calls[0][0];
      expect(err).toBeInstanceOf(Error);
      expect(err.statusCode || err.status).toBe(400);
    });

    test("400 כשחסר currentPassword בלבד", async () => {
      const req = { body: { newPassword: "new" }, user: { userId: "u1" } };
      const res = mockRes();
      const next = jest.fn();

      await controller.changePassword(req, res, next);
      const err = next.mock.calls[0][0];
      expect(err.statusCode || err.status).toBe(400);
    });

    test("400 כשחסר newPassword בלבד", async () => {
      const req = { body: { currentPassword: "old" }, user: { userId: "u1" } };
      const res = mockRes();
      const next = jest.fn();

      await controller.changePassword(req, res, next);
      const err = next.mock.calls[0][0];
      expect(err.statusCode || err.status).toBe(400);
    });

    test("401 כשאין userId", async () => {
      const req = { body: { currentPassword: "old", newPassword: "new" }, user: null };
      const res = mockRes();
      const next = jest.fn();

      await controller.changePassword(req, res, next);

      const err = next.mock.calls[0][0];
      expect(err.statusCode || err.status).toBe(401);
    });

    test("200 בהצלחה", async () => {
      const req = { body: { currentPassword: "old", newPassword: "new" }, user: { userId: "u1" } };
      const res = mockRes();
      const next = jest.fn();
      serviceInstance.changePassword.mockResolvedValue({ success: true });

      await controller.changePassword(req, res, next);

      expect(PasswordService).toHaveBeenCalledTimes(1);
      expect(serviceInstance.changePassword).toHaveBeenCalledWith("u1", "old", "new");
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ status: 200, message: "הסיסמה עודכנה בהצלחה" });
      expect(next).not.toHaveBeenCalled();
    });

    test("מעביר CustomError ל-next", async () => {
      const req = { body: { currentPassword: "old", newPassword: "new" }, user: { userId: "u1" } };
      const res = mockRes();
      const next = jest.fn();
      serviceInstance.changePassword.mockRejectedValue(new CustomError("Bad", 401));

      await controller.changePassword(req, res, next);

      const err = next.mock.calls[0][0];
      expect(err).toBeInstanceOf(CustomError);
      expect(err.statusCode).toBe(401);
    });

    test("מעביר Error רגיל ל-next", async () => {
      const req = { body: { currentPassword: "old", newPassword: "new" }, user: { userId: "u1" } };
      const res = mockRes();
      const next = jest.fn();
      serviceInstance.changePassword.mockRejectedValue(new Error("DB error"));

      await controller.changePassword(req, res, next);

      const err = next.mock.calls[0][0];
      expect(err.message).toBe("DB error");
    });

    // ✅ כיסוי לענף ימין של req.body || {}
    test("400 כשאין req.body בכלל", async () => {
      const req = { user: { userId: "u1" } }; // בלי body
      const res = mockRes();
      const next = jest.fn();

      await controller.changePassword(req, res, next);
      const err = next.mock.calls[0][0];
      expect(err.statusCode || err.status).toBe(400);
    });
  });

  // ---------- forgotPassword ----------
  describe("forgotPassword", () => {
    test("400 כשאין email", async () => {
      const req = { body: {} };
      const res = mockRes();
      const next = jest.fn();

      await controller.forgotPassword(req, res, next);
      const err = next.mock.calls[0][0];
      expect(err.statusCode || err.status).toBe(400);
    });

    test("200 בהצלחה", async () => {
      const req = { body: { email: "a@a.com" } };
      const res = mockRes();
      const next = jest.fn();
      serviceInstance.requestPasswordReset.mockResolvedValue({ success: true });

      await controller.forgotPassword(req, res, next);

      expect(serviceInstance.requestPasswordReset).toHaveBeenCalledWith("a@a.com");
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        status: 200,
        message: "אם המשתמש קיים, נשלח אליו מייל לאיפוס סיסמה",
      });
      expect(next).not.toHaveBeenCalled();
    });

    test("מעביר שגיאה ל-next", async () => {
      const req = { body: { email: "a@a.com" } };
      const res = mockRes();
      const next = jest.fn();
      serviceInstance.requestPasswordReset.mockRejectedValue(new Error("SMTP fail"));

      await controller.forgotPassword(req, res, next);
      const err = next.mock.calls[0][0];
      expect(err.message).toBe("SMTP fail");
    });

    // ✅ כיסוי לענף ימין של req.body || {}
    test("400 כשאין req.body בכלל", async () => {
      const req = {}; // בלי body
      const res = mockRes();
      const next = jest.fn();

      await controller.forgotPassword(req, res, next);
      const err = next.mock.calls[0][0];
      expect(err.statusCode || err.status).toBe(400);
    });
  });

  // ---------- resetPassword ----------
  describe("resetPassword", () => {
    test("400 כשאין token וגם newPassword", async () => {
      const req = { body: {} };
      const res = mockRes();
      const next = jest.fn();

      await controller.resetPassword(req, res, next);
      const err = next.mock.calls[0][0];
      expect(err.statusCode || err.status).toBe(400);
    });

    test("400 כשחסר token בלבד", async () => {
      const req = { body: { newPassword: "abc" } };
      const res = mockRes();
      const next = jest.fn();

      await controller.resetPassword(req, res, next);
      const err = next.mock.calls[0][0];
      expect(err.statusCode || err.status).toBe(400);
    });

    test("400 כשחסר newPassword בלבד", async () => {
      const req = { body: { token: "tok" } };
      const res = mockRes();
      const next = jest.fn();

      await controller.resetPassword(req, res, next);
      const err = next.mock.calls[0][0];
      expect(err.statusCode || err.status).toBe(400);
    });

    test("200 בהצלחה", async () => {
      const req = { body: { token: "tok", newPassword: "new" } };
      const res = mockRes();
      const next = jest.fn();
      serviceInstance.resetPassword.mockResolvedValue({ success: true });

      await controller.resetPassword(req, res, next);

      expect(serviceInstance.resetPassword).toHaveBeenCalledWith("tok", "new");
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ status: 200, message: "הסיסמה אופסה בהצלחה" });
      expect(next).not.toHaveBeenCalled();
    });

    test("מעביר Error ל-next", async () => {
      const req = { body: { token: "tok", newPassword: "new" } };
      const res = mockRes();
      const next = jest.fn();
      serviceInstance.resetPassword.mockRejectedValue(new Error("DB fail"));

      await controller.resetPassword(req, res, next);
      const err = next.mock.calls[0][0];
      expect(err.message).toBe("DB fail");
    });

    // ✅ כיסוי לענף ימין של req.body || {}
    test("400 כשאין req.body בכלל", async () => {
      const req = {}; // בלי body
      const res = mockRes();
      const next = jest.fn();

      await controller.resetPassword(req, res, next);
      const err = next.mock.calls[0][0];
      expect(err.statusCode || err.status).toBe(400);
    });
  });
});
