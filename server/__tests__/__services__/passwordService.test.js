import { jest } from "@jest/globals";

// 🟦 Mock models
jest.unstable_mockModule("../../models/user.js", () => ({
  User: { findOne: jest.fn() },
}));

jest.unstable_mockModule("../../models/password.js", () => ({
  Password: { findOne: jest.fn(), findOneAndUpdate: jest.fn() },
}));

jest.unstable_mockModule("../../models/passwordResetToken.js", () => ({
  PasswordResetToken: { create: jest.fn(), findOne: jest.fn(), deleteMany: jest.fn() },
}));

jest.unstable_mockModule("../../mongoQueries/user.queries.js", () => ({
  userQueries: { findByEmail: jest.fn((email) => ({ email })) },
}));

// 🟦 Mock email utils
jest.unstable_mockModule("../../utils/email/sendResetEmail.js", () => ({
  sendResetEmail: jest.fn(),
}));

jest.unstable_mockModule("../../utils/email/sendPasswordChangedEmail.js", () => ({
  sendPasswordChangedEmail: jest.fn(),
}));

// 🟦 Mock bcrypt (פתרון סופי ויציב)
jest.unstable_mockModule("bcrypt", () => {
  const fns = {
    compare: jest.fn(),
    hash: jest.fn(),
  };
  return {
    __esModule: true,
    default: fns, // import bcrypt from "bcrypt"
    ...fns,       // import * as bcrypt from "bcrypt"
  };
});

// 🟦 Mock crypto
jest.unstable_mockModule("crypto", () => ({
  __esModule: true,
  default: {},
  randomBytes: jest.fn(() => Buffer.from("abc")),
  createHash: jest.fn(() => ({
    update: jest.fn().mockReturnThis(),
    digest: jest.fn(() => "hashedtoken"),
  })),
}));

// 🟦 Import after mocks
const { PasswordService } = await import("../../service/pwd.service.js");
const { User } = await import("../../models/user.js");
const { Password } = await import("../../models/password.js");
const { PasswordResetToken } = await import("../../models/passwordResetToken.js");
const { sendResetEmail } = await import("../../utils/email/sendResetEmail.js");
const { sendPasswordChangedEmail } = await import("../../utils/email/sendPasswordChangedEmail.js");

// 🟩 כאן הייבוא הנכון של bcrypt
const bcrypt = (await import("bcrypt")).default;

describe("PasswordService", () => {
  let service;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new PasswordService();
  });

  // ---------- changePassword ----------
  describe("changePassword", () => {
    test("should throw 404 if password record not found", async () => {
      Password.findOne.mockResolvedValue(null);
      await expect(service.changePassword("u1", "old", "new"))
        .rejects.toThrow("סיסמה לא קיימת עבור המשתמש");
    });

    test("should throw 401 if current password is incorrect", async () => {
      Password.findOne.mockResolvedValue({ password: "hashed" });
      bcrypt.compare.mockResolvedValueOnce(false);
      await expect(service.changePassword("u1", "wrong", "new"))
        .rejects.toThrow("הסיסמה הנוכחית שגויה");
    });

    test("should throw 400 if new password equals current", async () => {
      Password.findOne.mockResolvedValue({ password: "hashed" });
      bcrypt.compare
        .mockResolvedValueOnce(true)
        .mockResolvedValueOnce(true);
      await expect(service.changePassword("u1", "old", "old"))
        .rejects.toThrow("הסיסמה החדשה חייבת להיות שונה מהסיסמה הנוכחית");
    });

    test("should change password and send email successfully", async () => {
      const save = jest.fn();
      Password.findOne.mockResolvedValue({ password: "hashed", save });
      bcrypt.compare
        .mockResolvedValueOnce(true)
        .mockResolvedValueOnce(false);
      bcrypt.hash.mockResolvedValue("newhash");

      await expect(service.changePassword("u1", "old", "new"))
        .resolves.toEqual({ success: true, message: "Password changed successfully" });

      expect(save).toHaveBeenCalled();
      expect(sendPasswordChangedEmail).toHaveBeenCalledWith("u1");
    });

    test("should log warning if sendPasswordChangedEmail fails", async () => {
      console.warn = jest.fn();
      Password.findOne.mockResolvedValue({ password: "hashed", save: jest.fn() });
      bcrypt.compare
        .mockResolvedValueOnce(true)
        .mockResolvedValueOnce(false);
      bcrypt.hash.mockResolvedValue("newhash");
      sendPasswordChangedEmail.mockRejectedValue(new Error("SMTP fail"));

      await service.changePassword("u1", "old", "new");
      expect(console.warn).toHaveBeenCalledWith(
        expect.stringContaining("sendPasswordChangedEmail failed:"),
        expect.stringContaining("SMTP fail")
      );
    });
  });

  // ---------- requestPasswordReset ----------
  describe("requestPasswordReset", () => {
    test("should throw 404 if user not found", async () => {
      User.findOne.mockResolvedValue(null);
      await expect(service.requestPasswordReset("a@a.com"))
        .rejects.toThrow("משתמש לא נמצא");
    });

    test("should create token and send email successfully", async () => {
      User.findOne.mockResolvedValue({ _id: "u1", email: "a@a.com" });
      PasswordResetToken.create.mockResolvedValue(true);
      sendResetEmail.mockResolvedValue(true);

      await expect(service.requestPasswordReset("a@a.com"))
        .resolves.toEqual({ success: true, message: "Reset link sent successfully" });

      expect(PasswordResetToken.create).toHaveBeenCalled();
      expect(sendResetEmail).toHaveBeenCalled();
    });

    test("should log warning if sendResetEmail fails", async () => {
      console.warn = jest.fn();
      User.findOne.mockResolvedValue({ _id: "u1", email: "a@a.com" });
      PasswordResetToken.create.mockResolvedValue(true);
      sendResetEmail.mockRejectedValue(new Error("SMTP fail"));

      await service.requestPasswordReset("a@a.com");
      expect(console.warn).toHaveBeenCalledWith(
        expect.stringContaining("sendResetEmail failed:"),
        expect.stringContaining("SMTP fail")
      );
    });
  });

  // ---------- resetPassword ----------
  describe("resetPassword", () => {
    test("should throw 400 if token invalid or expired", async () => {
      PasswordResetToken.findOne.mockResolvedValue(null);
      await expect(service.resetPassword("badtoken", "newpass"))
        .rejects.toThrow("הקישור לא תקף או שפג תוקפו");
    });

    test("should reset password and delete token", async () => {
      const tokenRecord = { userId: "u1", expires: new Date(Date.now() + 10000) };
      PasswordResetToken.findOne.mockResolvedValue(tokenRecord);
      bcrypt.hash.mockResolvedValue("hashed");
      Password.findOneAndUpdate.mockResolvedValue(true);
      PasswordResetToken.deleteMany.mockResolvedValue(true);
      sendPasswordChangedEmail.mockResolvedValue(true);

      await expect(service.resetPassword("token", "newpass"))
        .resolves.toEqual({ success: true, message: "Password reset successfully" });

      expect(Password.findOneAndUpdate).toHaveBeenCalled();
      expect(PasswordResetToken.deleteMany).toHaveBeenCalled();
      expect(sendPasswordChangedEmail).toHaveBeenCalledWith("u1");
    });

    test("should log warning if sendPasswordChangedEmail fails", async () => {
      console.warn = jest.fn();
      const tokenRecord = { userId: "u1", expires: new Date(Date.now() + 10000) };
      PasswordResetToken.findOne.mockResolvedValue(tokenRecord);
      bcrypt.hash.mockResolvedValue("hashed");
      Password.findOneAndUpdate.mockResolvedValue(true);
      PasswordResetToken.deleteMany.mockResolvedValue(true);
      sendPasswordChangedEmail.mockRejectedValue(new Error("SMTP fail"));

      await service.resetPassword("token", "newpass");
      expect(console.warn).toHaveBeenCalledWith(
        expect.stringContaining("sendPasswordChangedEmail failed:"),
        expect.stringContaining("SMTP fail")
      );
    });
  });
});
