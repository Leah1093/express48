// __tests__/entranceService.test.js
import { jest } from "@jest/globals";

// ---- Mock Models ----
jest.unstable_mockModule("../../models/user.js", () => ({
  User: {
    findOne: jest.fn(),
    create: jest.fn(),
    findById: jest.fn(),
  },
}));

jest.unstable_mockModule("../../models/password.js", () => ({
  Password: {
    create: jest.fn(),
    findOne: jest.fn(),
  },
}));

jest.unstable_mockModule("../../models/store.js", () => ({
  Store: {
    findOne: jest.fn(),
  },
}));

// ---- Mock bcrypt ----
jest.unstable_mockModule("bcrypt", () => ({
  default: {
    hash: jest.fn(),
    compare: jest.fn(),
  },
}));

// ---- Mock userQueries ----
jest.unstable_mockModule("../../mongoQueries/user.queries.js", () => ({
  userQueries: {
    findByEmail: jest.fn((email) => ({ email })),
  },
}));

// ---- Import mocked modules AFTER mocking ----
const { User } = await import("../../models/user.js");
const { Password } = await import("../../models/password.js");
const { Store } = await import("../../models/store.js");
const bcrypt = (await import("bcrypt")).default;
const { userQueries } = await import("../../mongoQueries/user.queries.js");

// ⚠️ EntranceService loaded only after mocks
const { EntranceService } = await import("../../service/entrance.service.js");

describe("EntranceService", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  // -------------------------
  // 📌 registerUser
  // -------------------------
  describe("registerUser", () => {
    it("צריך לזרוק שגיאה אם המייל כבר קיים", async () => {
      User.findOne.mockResolvedValue({ _id: "123" });

      const service = new EntranceService();
      await expect(
        service.registerUser({
          username: "U1",
          email: "test@test.com",
          phone: "0500000000",
          password: "123456",
        })
      ).rejects.toMatchObject({
        message: "המייל כבר קיים במערכת",
        statusCode: 409,
      });

      expect(User.findOne).toHaveBeenCalledWith({ email: "test@test.com" });
      expect(userQueries.findByEmail).toHaveBeenCalledWith("test@test.com");
    });

    it("צריך ליצור משתמש חדש עם סיסמה מוצפנת", async () => {
      User.findOne.mockResolvedValue(null);
      User.create.mockResolvedValue({
        _id: "123",
        username: "U1",
        email: "test@test.com",
        phone: "0500000000",
      });

      bcrypt.hash.mockResolvedValue("hashedPassword123");
      Password.create.mockResolvedValue({});

      const service = new EntranceService();
      const result = await service.registerUser({
        username: "U1",
        email: "test@test.com",
        phone: "0500000000",
        password: "123456",
      });

      expect(User.create).toHaveBeenCalledWith({
        username: "U1",
        email: "test@test.com",
        phone: "0500000000",
      });
      expect(bcrypt.hash).toHaveBeenCalledWith("123456", 10);
      expect(Password.create).toHaveBeenCalledWith({
        userId: "123",
        password: "hashedPassword123",
      });
      expect(result).toEqual({
        user: {
          _id: "123",
          username: "U1",
          email: "test@test.com",
          phone: "0500000000",
        },
      });
    });
  });

  // -------------------------
  // 📌 verifyCredentials
  // -------------------------
  describe("verifyCredentials", () => {
    it("צריך לזרוק שגיאה אם המשתמש לא קיים", async () => {
      User.findOne.mockResolvedValue(null);

      const service = new EntranceService();
      await expect(service.verifyCredentials("test@test.com", "123456"))
        .rejects.toThrow("INVALID_CREDENTIALS");
    });

    it("צריך לזרוק שגיאה אם אין רשומת סיסמה", async () => {
      User.findOne.mockResolvedValue({ _id: "123" });
      Password.findOne.mockResolvedValue(null);

      const service = new EntranceService();
      await expect(service.verifyCredentials("test@test.com", "123456"))
        .rejects.toThrow("INVALID_CREDENTIALS");
    });

    it("צריך לזרוק שגיאה אם הסיסמה שגויה", async () => {
      User.findOne.mockResolvedValue({ _id: "123" });
      Password.findOne.mockResolvedValue({ userId: "123", password: "hashed" });
      bcrypt.compare.mockResolvedValue(false);

      const service = new EntranceService();
      await expect(service.verifyCredentials("test@test.com", "wrongpass"))
        .rejects.toThrow("INVALID_CREDENTIALS");
    });

    it("צריך להחזיר user + sellerId + storeId אם הסיסמה נכונה", async () => {
      const mockUser = { _id: "123", email: "test@test.com" };
      User.findOne.mockResolvedValue(mockUser);
      Password.findOne.mockResolvedValue({ userId: "123", password: "hashed" });
      bcrypt.compare.mockResolvedValue(true);

      const service = new EntranceService();
      service.getSellerAndStore = jest.fn().mockResolvedValue({
        sellerId: "s1",
        storeId: "st1",
      });

      const result = await service.verifyCredentials("test@test.com", "123456");
      expect(result).toEqual({ user: mockUser, sellerId: "s1", storeId: "st1" });
    });
  });

  // -------------------------
  // 📌 getSellerAndStore
  // -------------------------
  describe("getSellerAndStore", () => {
    it("צריך להחזיר sellerId + storeId אם נמצא store", async () => {
      Store.findOne.mockReturnValue({
        select: jest.fn().mockResolvedValue({ _id: "st1", sellerId: "s1" }),
      });

      const service = new EntranceService();
      const result = await service.getSellerAndStore("u1");

      expect(Store.findOne).toHaveBeenCalledWith({ userId: "u1" });
      expect(result).toEqual({ sellerId: "s1", storeId: "st1" });
    });

    it("צריך להחזיר nullים אם לא נמצא store", async () => {
      Store.findOne.mockReturnValue({
        select: jest.fn().mockResolvedValue(null),
      });

      const service = new EntranceService();
      const result = await service.getSellerAndStore("u1");

      expect(result).toEqual({ sellerId: null, storeId: null });
    });
  });

  // -------------------------
  // 📌 findOrCreateGoogleUser
  // -------------------------
  describe("findOrCreateGoogleUser", () => {
    it("צריך להחזיר user קיים", async () => {
      const mockUser = { _id: "123", email: "test@test.com" };
      User.findOne.mockResolvedValue(mockUser);

      const service = new EntranceService();
      service.getSellerAndStore = jest.fn().mockResolvedValue({
        sellerId: "s1",
        storeId: "st1",
      });

      const result = await service.findOrCreateGoogleUser({
        email: "test@test.com",
        name: "Test",
      });

      expect(User.findOne).toHaveBeenCalledWith({ email: "test@test.com" });
      expect(result).toEqual({ user: mockUser, sellerId: "s1", storeId: "st1" });
    });

    it("צריך ליצור user חדש אם לא קיים", async () => {
      User.findOne.mockResolvedValue(null);
      const mockUser = { _id: "456", email: "new@test.com", username: "New" };
      User.create.mockResolvedValue(mockUser);

      const service = new EntranceService();
      service.getSellerAndStore = jest.fn().mockResolvedValue({
        sellerId: null,
        storeId: null,
      });

      const result = await service.findOrCreateGoogleUser({
        email: "new@test.com",
        name: "New",
      });

      expect(User.create).toHaveBeenCalledWith({
        username: "New",
        email: "new@test.com",
      });
      expect(result).toEqual({ user: mockUser, sellerId: null, storeId: null });
    });
  });

  // -------------------------
  // 📌 getUserById
  // -------------------------
  describe("getUserById", () => {
    it("צריך להחזיר user לפי id", async () => {
      const mockUser = {
        _id: "u1",
        username: "U1",
        email: "test@test.com",
        phone: "0500000000",
        role: "user",
        roles: ["user"],
      };
      User.findById.mockReturnValue({
        select: jest.fn().mockResolvedValue(mockUser),
      });

      const service = new EntranceService();
      const result = await service.getUserById("u1");

      expect(User.findById).toHaveBeenCalledWith("u1");
      expect(result).toEqual(mockUser);
    });

    it("צריך להחזיר null אם המשתמש לא נמצא", async () => {
      User.findById.mockReturnValue({
        select: jest.fn().mockResolvedValue(null),
      });

      const service = new EntranceService();
      const result = await service.getUserById("not_exist");

      expect(result).toBeNull();
    });
  });
});
