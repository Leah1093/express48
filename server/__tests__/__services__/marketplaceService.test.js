import { jest } from "@jest/globals";

// 🟦 Mock כל המודולים
jest.unstable_mockModule("../../models/seller.js", () => ({
    Seller: {
        findOne: jest.fn(),
        findById: jest.fn(),
        create: jest.fn(),
        find: jest.fn(),
        countDocuments: jest.fn(),
    },
}));
jest.unstable_mockModule("../../models/store.js", () => ({
    Store: { findOne: jest.fn(), create: jest.fn() },
}));
jest.unstable_mockModule("../../models/user.js", () => ({
    User: { findById: jest.fn() },
}));
jest.unstable_mockModule("../../service/sessionSync.service.js", () => ({
    syncUserSessions: jest.fn(),
}));
jest.unstable_mockModule("../../utils/email/sendNewSellerRequestToAdmin.js", () => ({
    sendNewSellerRequestToAdmin: jest.fn(),
}));
jest.unstable_mockModule("../../utils/email/sendSellerRequestStatusEmail.js", () => ({
    sendSellerRequestStatusEmail: jest.fn(),
}));
jest.unstable_mockModule("../../utils/email/sendSellerRequestReceivedEmail.js", () => ({
    sendSellerRequestReceivedEmail: jest.fn(),
}));

// טעינה אחרי mocks
const { Seller } = await import("../../models/seller.js");
const { Store } = await import("../../models/store.js");
const { User } = await import("../../models/user.js");
const { syncUserSessions } = await import("../../service/sessionSync.service.js");
const { sendNewSellerRequestToAdmin } = await import("../../utils/email/sendNewSellerRequestToAdmin.js");
const { sendSellerRequestStatusEmail } = await import("../../utils/email/sendSellerRequestStatusEmail.js");
const { sendSellerRequestReceivedEmail } = await import("../../utils/email/sendSellerRequestReceivedEmail.js");
const { MarketplaceService } = await import("../../service/marketplace.service.js");
const { CustomError } = await import("../../utils/CustomError.js");

describe("MarketplaceService", () => {
    let service;

    beforeEach(() => {
        jest.clearAllMocks();
        service = new MarketplaceService();
        process.env.FRONTEND_URL = "http://frontend";
        process.env.ADMIN_EMAILS = "a@test.com,b@test.com";
    });

    // 🟩 createSeller
    describe("createSeller", () => {
        test("should throw if seller already exists", async () => {
            Seller.findOne.mockResolvedValue({ _id: "s1" });
            await expect(service.createSeller({ userId: "u1" }))
                .rejects.toThrow(CustomError);
        });

        test("should create seller and send emails", async () => {
            Seller.findOne.mockResolvedValue(null);
            const fakeSeller = { _id: "s2", userId: "u2", email: "x@test.com" };
            Seller.create.mockResolvedValue(fakeSeller);

            const result = await service.createSeller(fakeSeller);

            expect(result).toEqual(fakeSeller);
            expect(Seller.create).toHaveBeenCalled();
            expect(sendNewSellerRequestToAdmin).toHaveBeenCalled();
            expect(sendSellerRequestReceivedEmail).toHaveBeenCalled();
        });

        test("should not throw if email sending fails", async () => {
            Seller.findOne.mockResolvedValue(null);
            const fakeSeller = { _id: "s3", userId: "u3", email: "y@test.com" };
            Seller.create.mockResolvedValue(fakeSeller);

            sendNewSellerRequestToAdmin.mockRejectedValue(new Error("SMTP fail"));
            sendSellerRequestReceivedEmail.mockRejectedValue(new Error("SMTP fail"));

            const result = await service.createSeller(fakeSeller);
            expect(result).toEqual(fakeSeller);
        });
    });

    // 🟩 updateSeller
    describe("updateSeller", () => {
        test("should throw 404 if seller not found", async () => {
            Seller.findById.mockResolvedValue(null);
            await expect(
                service.updateSeller({ sellerId: "bad", data: {}, actor: {} })
            ).rejects.toThrow(/לא נמצא/);
        });

        test("should throw 403 if actor is not owner or admin", async () => {
            Seller.findById.mockResolvedValue({ userId: "owner" });
            await expect(
                service.updateSeller({ sellerId: "s1", data: {}, actor: { userId: "u2", role: "user" } })
            ).rejects.toThrow(/אין הרשאה/);
        });

        test("should allow admin update", async () => {
            const seller = { userId: "owner", save: jest.fn() };
            Seller.findById.mockResolvedValue(seller);

            await service.updateSeller({ sellerId: "s1", data: { phone: "123" }, actor: { role: "admin" } });

            expect(seller.save).toHaveBeenCalled();
            expect(seller.phone).toBe("123");
        });

        test("should allow owner update", async () => {
            const seller = { userId: "me", save: jest.fn() };
            Seller.findById.mockResolvedValue(seller);

            await service.updateSeller({ sellerId: "s1", data: { phone: "555" }, actor: { userId: "me" } });

            expect(seller.save).toHaveBeenCalled();
            expect(seller.phone).toBe("555");
        });
    });

    // 🟩 getSellerByUserId
    describe("getSellerByUserId", () => {
        test("should return null if no userId", () => {
            expect(service.getSellerByUserId(null)).toBeNull();
        });

        test("should call Seller.findOne if userId exists", () => {
            service.getSellerByUserId("u1");
            expect(Seller.findOne).toHaveBeenCalledWith({ userId: "u1" });
        });
    });

    // 🟩 listSellers
    describe("listSellers", () => {
        test("should throw on invalid limit", async () => {
            await expect(service.listSellers({ limit: -5, page: 1 }))
                .rejects.toThrow(/limit/);
        });

        test("should throw on invalid page", async () => {
            await expect(service.listSellers({ limit: 10, page: 0 }))
                .rejects.toThrow(/page/);
        });

        test("should return items and total", async () => {
            Seller.find.mockReturnValue({ sort: () => ({ skip: () => ({ limit: () => ["a", "b"] }) }) });
            Seller.countDocuments.mockResolvedValue(2);

            const result = await service.listSellers({ limit: 2, page: 1 });
            expect(result).toEqual({ items: ["a", "b"], total: 2, page: 1, limit: 2 });
        });

        test("should call Seller.find with $or when q provided", async () => {
            Seller.find.mockReturnValue({ sort: () => ({ skip: () => ({ limit: () => [] }) }) });
            Seller.countDocuments.mockResolvedValue(0);

            await service.listSellers({ q: "abc", limit: 10, page: 1 });

            expect(Seller.find).toHaveBeenCalledWith(
                expect.objectContaining({
                    $or: expect.any(Array),
                })
            );
        });
    });

    // 🟩 adminUpdateSellerStatus
    describe("adminUpdateSellerStatus", () => {
        test("should throw if seller not found", async () => {
            Seller.findById.mockResolvedValue(null);
            await expect(service.adminUpdateSellerStatus({ id: "bad", status: "approved", adminUserId: "a1" }))
                .rejects.toThrow(/לא נמצא/);
        });

        test("should update status and send email", async () => {
            const seller = { _id: "s1", userId: "u1", save: jest.fn() };
            Seller.findById.mockResolvedValue(seller);

            const result = await service.adminUpdateSellerStatus({ id: "s1", status: "rejected", note: "bad", adminUserId: "a1" });

            expect(result).toBe(seller);
            expect(sendSellerRequestStatusEmail).toHaveBeenCalled();
        });

        test("should approve seller, update user, create store and sync sessions", async () => {
            const seller = { _id: "s1", userId: "u1", save: jest.fn() };
            Seller.findById.mockResolvedValue(seller);

            const user = { role: "user", save: jest.fn() };
            User.findById.mockResolvedValue(user);

            Store.findOne.mockResolvedValue(null);
            Store.create.mockResolvedValue({ _id: "store1" });

            await service.adminUpdateSellerStatus({ id: "s1", status: "approved", adminUserId: "admin1" });

            expect(user.role).toBe("seller");
            expect(Store.create).toHaveBeenCalled();
            expect(syncUserSessions).toHaveBeenCalledWith("u1");
        });

        test("should call syncUserSessions at the end of approve flow", async () => {
            const seller = { _id: "s1", userId: "u1", save: jest.fn() };
            Seller.findById.mockResolvedValue(seller);

            const user = { role: "user", save: jest.fn() };
            User.findById.mockResolvedValue(user);

            Store.findOne.mockResolvedValue(null);
            Store.create.mockResolvedValue({ _id: "store1" });

            await service.adminUpdateSellerStatus({ id: "s1", status: "approved", adminUserId: "admin1" });

            expect(syncUserSessions).toHaveBeenCalledTimes(1);
            expect(syncUserSessions).toHaveBeenCalledWith("u1");
        });

    });

    // 🟩 השלמות לכיסוי מלא
describe("extra coverage for MarketplaceService", () => {
  test("should not create store if already exists", async () => {
    const seller = { _id: "s1", userId: "u1", save: jest.fn() };
    Seller.findById.mockResolvedValue(seller);
    User.findById.mockResolvedValue({ role: "seller", save: jest.fn() });

    Store.findOne.mockResolvedValue({ _id: "existingStore" });
    await service.adminUpdateSellerStatus({ id: "s1", status: "approved", adminUserId: "admin1" });

    expect(Store.create).not.toHaveBeenCalled();
    expect(syncUserSessions).toHaveBeenCalledWith("u1");
  });

  test("should set empty note if not provided", async () => {
    const seller = { _id: "s1", userId: "u1", save: jest.fn() };
    Seller.findById.mockResolvedValue(seller);

    await service.adminUpdateSellerStatus({ id: "s1", status: "pending", adminUserId: "a1" });

    expect(seller.lastAction.note).toBe("");
  });

  test("should skip user role update if user not found", async () => {
    const seller = { _id: "s1", userId: "u1", save: jest.fn() };
    Seller.findById.mockResolvedValue(seller);

    User.findById.mockResolvedValue(null);
    Store.findOne.mockResolvedValue(null);
    Store.create.mockResolvedValue({ _id: "store1" });

    await service.adminUpdateSellerStatus({ id: "s1", status: "approved", adminUserId: "admin1" });

    expect(Store.create).toHaveBeenCalled();
    expect(syncUserSessions).toHaveBeenCalled();
  });

  test("should use companyName or fullName in adminSellerPayload", async () => {
    Seller.findOne.mockResolvedValue(null);
    const fakeSeller = {
      _id: "s5",
      userId: "u5",
      email: "z@test.com",
      companyName: "MyCompany",
      fullName: "John Doe",
    };
    Seller.create.mockResolvedValue(fakeSeller);

    await service.createSeller(fakeSeller);

    expect(sendNewSellerRequestToAdmin).toHaveBeenCalledWith(
      expect.objectContaining({
        seller: expect.objectContaining({
          name: "John Doe",
        }),
      })
    );
  });

  test("should filter by status only", async () => {
    Seller.find.mockReturnValue({ sort: () => ({ skip: () => ({ limit: () => [] }) }) });
    Seller.countDocuments.mockResolvedValue(0);

    await service.listSellers({ status: "pending", limit: 10, page: 1 });

    expect(Seller.find).toHaveBeenCalledWith({ status: "pending" });
  });

test("should log warning if sendSellerRequestStatusEmail fails", async () => {
  console.warn = jest.fn();
  const seller = { _id: "s1", userId: "u1", save: jest.fn() };
  Seller.findById.mockResolvedValue(seller);
  sendSellerRequestStatusEmail.mockRejectedValue(new Error("SMTP fail"));

  await service.adminUpdateSellerStatus({ id: "s1", status: "pending", adminUserId: "a1" });

  // 🟡 לחכות ל־Promise queue הפנימית
  await new Promise(resolve => setImmediate(resolve));

  expect(console.warn).toHaveBeenCalledWith(
    expect.stringContaining("sendSellerRequestStatusEmail failed:"),
    expect.stringContaining("SMTP fail")
  );
});

});

});
