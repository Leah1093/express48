import { jest } from "@jest/globals";

jest.unstable_mockModule("../../models/address.js", () => ({
    Address: {
        create: jest.fn(),
        find: jest.fn(),
        findById: jest.fn(),
        findByIdAndUpdate: jest.fn(),
        findOneAndUpdate: jest.fn(),
        findByIdAndDelete: jest.fn(),
        updateMany: jest.fn(),
    },
}));

jest.unstable_mockModule("../../utils/CustomError.js", () => ({
    CustomError: class CustomError extends Error {
        constructor(message, status, original) {
            super(message);
            this.status = status;
            this.original = original;
        }
    },
}));

const { Address } = await import("../../models/address.js");
const { AddressService } = await import("../../service/addressService.js");
const { CustomError } = await import("../../utils/CustomError.js");

describe("AddressService", () => {
    let service;
    beforeEach(() => {
        jest.clearAllMocks();
        service = new AddressService();
    });

    describe("createAddress", () => {
        test("should create new address", async () => {
            const fake = { _id: "1", city: "Tel Aviv" };
            Address.create.mockResolvedValue(fake);

            const result = await service.createAddress(fake);

            expect(Address.create).toHaveBeenCalledWith(fake);
            expect(result).toEqual(fake);
        });

        test("should throw DB error", async () => {
            Address.create.mockRejectedValue(new Error("DB error"));
            await expect(service.createAddress({}))
                .rejects.toThrow("שגיאה ביצירת כתובת");
        });
    });

    describe("getUserAddresses", () => {
        test("should return sorted addresses", async () => {
            const fake = [{ _id: "1" }];
            Address.find.mockReturnValue({
                sort: () => ({ lean: () => fake }),
            });

            const result = await service.getUserAddresses("u1");

            expect(Address.find).toHaveBeenCalledWith({ userId: "u1" });
            expect(result).toEqual(fake);
        });
    });

    describe("getAddressById", () => {
        test("should return address", async () => {
            const fake = { _id: "a1" };
            Address.findById.mockResolvedValue(fake);

            const result = await service.getAddressById("a1");

            expect(Address.findById).toHaveBeenCalledWith("a1");
            expect(result).toEqual(fake);
        });

        test("should throw 404 if not found", async () => {
            Address.findById.mockResolvedValue(null);
            await expect(service.getAddressById("x1"))
                .rejects.toThrow("כתובת לא נמצאה");
        });
    });

    describe("updateAddress", () => {
        test("should update address by id and userId", async () => {
            const fake = { _id: "a1", city: "Haifa" };
            Address.findOneAndUpdate.mockResolvedValue(fake);

            const result = await service.updateAddress("a1", "u1", { city: "Haifa" });

            expect(Address.findOneAndUpdate).toHaveBeenCalledWith(
                { _id: "a1", userId: "u1" },
                { city: "Haifa" },
                { new: true, runValidators: true }
            );
            expect(result).toEqual(fake);
        });

        test("should throw 404 if not found or not belongs to user", async () => {
            Address.findOneAndUpdate.mockResolvedValue(null);
            await expect(service.updateAddress("a1", "u1", {}))
                .rejects.toThrow("כתובת לא נמצאה או אינה שייכת למשתמש");
        });
    });

    describe("deleteAddress", () => {
        test("should delete address", async () => {
            const fake = { _id: "a1" };
            Address.findByIdAndDelete.mockResolvedValue(fake);

            const result = await service.deleteAddress("a1");

            expect(Address.findByIdAndDelete).toHaveBeenCalledWith("a1");
            expect(result).toEqual(fake);
        });

        test("should throw 404 if not found", async () => {
            Address.findByIdAndDelete.mockResolvedValue(null);
            await expect(service.deleteAddress("x1"))
                .rejects.toThrow("כתובת לא נמצאה");
        });
    });

    describe("setDefaultAddress", () => {
        test("should unset all defaults and set new default", async () => {
            const fake = { _id: "a1", isDefault: true };
            Address.updateMany.mockResolvedValue({});
            Address.findOneAndUpdate.mockResolvedValue(fake);

            const result = await service.setDefaultAddress("u1", "a1");

            expect(Address.updateMany).toHaveBeenCalledWith(
                { userId: "u1" },
                { $set: { isDefault: false } }
            );
            expect(Address.findOneAndUpdate).toHaveBeenCalledWith(
                { _id: "a1", userId: "u1" },
                { isDefault: true },
                { new: true }
            );
            expect(result).toEqual(fake);
        });

        test("should throw 404 if address not found or not belongs to user", async () => {
            Address.updateMany.mockResolvedValue({});
            Address.findOneAndUpdate.mockResolvedValue(null);

            await expect(service.setDefaultAddress("u1", "x1"))
                .rejects.toThrow("כתובת לא נמצאה או אינה שייכת למשתמש");
        });
    });

    describe("error flows", () => {
        test("getUserAddresses should throw DB error", async () => {
            Address.find.mockImplementation(() => { throw new Error("DB fail"); });

            await expect(service.getUserAddresses("u1"))
                .rejects.toThrow("שגיאה בשליפת כתובות");
        });

        test("getAddressById should throw DB error", async () => {
            Address.findById.mockRejectedValue(new Error("DB fail"));

            await expect(service.getAddressById("a1"))
                .rejects.toThrow("שגיאה בשליפת כתובת");
        });

        test("updateAddress should throw DB error", async () => {
            Address.findOneAndUpdate.mockRejectedValue(new Error("DB fail"));

            await expect(service.updateAddress("a1", "u1", {}))
                .rejects.toThrow("שגיאה בעדכון כתובת");
        });

        test("deleteAddress should throw DB error", async () => {
            Address.findByIdAndDelete.mockRejectedValue(new Error("DB fail"));

            await expect(service.deleteAddress("a1"))
                .rejects.toThrow("שגיאה במחיקת כתובת");
        });

        test("setDefaultAddress should throw DB error", async () => {
            Address.updateMany.mockRejectedValue(new Error("DB fail"));

            await expect(service.setDefaultAddress("u1", "a1"))
                .rejects.toThrow("שגיאה בהגדרת כתובת כברירת מחדל");
        });
    });

});
