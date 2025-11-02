import { jest } from "@jest/globals";
import { cookieNames } from "../../utils/cookies.js"; // 👈 נוסיף את זה

const mockRes = () => {
  const res = {};
  res.cookie = jest.fn().mockReturnValue(res);
  return res;
};

describe("Auth Service", () => {
  let loginFlow, refreshFlow, logoutFlow, logoutAllFlow;
  let createSession, rotateRefresh, revokeSession, revokeAllUserSessions;
  let signAccessToken;
  let CustomError;

  beforeAll(async () => {
    jest.unstable_mockModule("../../service/session.service.js", () => ({
      createSession: jest.fn(),
      rotateRefresh: jest.fn(),
      revokeSession: jest.fn(),
      revokeAllUserSessions: jest.fn(),
    }));

    jest.unstable_mockModule("../../utils/jwt.js", () => ({
      signAccessToken: jest.fn(),
    }));

    jest.unstable_mockModule("../../utils/CustomError.js", () => ({
      CustomError: class CustomError extends Error {
        constructor(message, status) {
          super(message);
          this.status = status;
        }
      },
    }));

    ({
      loginFlow,
      refreshFlow,
      logoutFlow,
      logoutAllFlow,
    } = await import("../../service/auth.service.js"));

    ({
      createSession,
      rotateRefresh,
      revokeSession,
      revokeAllUserSessions,
    } = await import("../../service/session.service.js"));

    ({ signAccessToken } = await import("../../utils/jwt.js"));
    ({ CustomError } = await import("../../utils/CustomError.js"));
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("loginFlow", () => {
    test("should create session and set cookies", async () => {
      const res = mockRes();
      createSession.mockResolvedValue({ refreshToken: "refresh123" });
      signAccessToken.mockReturnValue("access123");

      const result = await loginFlow({
        res,
        user: { _id: "u1", role: "admin" },
        userAgent: "UA",
        ipHash: "ip",
      });

      expect(createSession).toHaveBeenCalledWith(
        expect.objectContaining({ userId: "u1" })
      );
      expect(signAccessToken).toHaveBeenCalled();
      expect(res.cookie).toHaveBeenCalledTimes(2);
      expect(result).toEqual({ ok: true });
    });

    test("should throw if createSession fails", async () => {
      const res = mockRes();
      createSession.mockRejectedValue(new Error("DB fail"));

      await expect(
        loginFlow({
          res,
          user: { _id: "u1" },
          userAgent: "UA",
          ipHash: "ip",
        })
      ).rejects.toThrow("DB fail");
    });
  });

  describe("refreshFlow", () => {
    test("should throw CustomError if no token", async () => {
      const res = mockRes();
      const req = { cookies: {} };

      await expect(refreshFlow({ req, res })).rejects.toThrow(CustomError);
    });

    test("should refresh tokens successfully", async () => {
      const res = mockRes();
      const req = { cookies: { [cookieNames.refresh]: "refresh123" } }; // 👈 שימוש נכון
      rotateRefresh.mockResolvedValue({
        session: { userId: "u1", sessionId: "s1" },
        newToken: "newRefresh",
      });
      signAccessToken.mockReturnValue("access123");

      const result = await refreshFlow({ req, res });

      expect(rotateRefresh).toHaveBeenCalledWith({
        presentedToken: "refresh123",
      });
      expect(signAccessToken).toHaveBeenCalled();
      expect(res.cookie).toHaveBeenCalledTimes(2);
      expect(result.ok).toBe(true);
      expect(result.session).toEqual({ userId: "u1", sessionId: "s1" });
    });

    test("should throw if rotateRefresh fails", async () => {
      const res = mockRes();
      const req = { cookies: { [cookieNames.refresh]: "refresh123" } }; // 👈 שימוש נכון
      rotateRefresh.mockRejectedValue(new Error("rotate failed"));

      await expect(refreshFlow({ req, res })).rejects.toThrow("rotate failed");
    });
  });

  describe("logoutFlow", () => {
    test("should revoke session if sessionId provided", async () => {
      const res = mockRes();
      await logoutFlow({ res, sessionId: "s1" });

      expect(revokeSession).toHaveBeenCalledWith("s1");
      expect(res.cookie).toHaveBeenCalledTimes(2);
    });

    test("should not revoke session if no sessionId", async () => {
      const res = mockRes();
      await logoutFlow({ res });

      expect(revokeSession).not.toHaveBeenCalled();
      expect(res.cookie).toHaveBeenCalledTimes(2);
    });

    test("should throw if revokeSession fails", async () => {
      const res = mockRes();
      revokeSession.mockRejectedValue(new Error("DB error"));

      await expect(logoutFlow({ res, sessionId: "s1" })).rejects.toThrow(
        "DB error"
      );
    });
  });

  describe("logoutAllFlow", () => {
    test("should revoke all sessions and clear cookies", async () => {
      const res = mockRes();
      await logoutAllFlow({ res, userId: "u1" });

      expect(revokeAllUserSessions).toHaveBeenCalledWith("u1");
      expect(res.cookie).toHaveBeenCalledTimes(2);
    });

    test("should throw if revokeAllUserSessions fails", async () => {
      const res = mockRes();
      revokeAllUserSessions.mockRejectedValue(new Error("DB error"));

      await expect(logoutAllFlow({ res, userId: "u1" })).rejects.toThrow(
        "DB error"
      );
    });
  });
});
