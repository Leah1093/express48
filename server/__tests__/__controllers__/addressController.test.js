import { jest } from "@jest/globals";

jest.unstable_mockModule("../../service/addressService", () => {
  return {
    AddressService: jest.fn().mockImplementation(() => ({
      createAddress: jest.fn(),
      getUserAddresses: jest.fn(),
      getAddressById: jest.fn(),
      updateAddress: jest.fn(),
      deleteAddress: jest.fn(),
      setDefaultAddress: jest.fn(),
    })),
  };
});

const { AddressController, service } = await import("../../controllers/addressController.js");

describe("AddressController", () => {
  let controller, req, res, next;

  beforeEach(() => {
    jest.clearAllMocks();
    controller = new AddressController();
    req = { user: { userId: "u1" }, body: {}, params: {} };
    res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    next = jest.fn();
  });

  describe("create", () => {
    test("should create address and return 201", async () => {
      const fake = { _id: "a1" };
      service.createAddress.mockResolvedValue(fake);

      await controller.create(req, res, next);

      expect(service.createAddress).toHaveBeenCalledWith({ userId: "u1" });
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(fake);
    });

    test("should call next on error", async () => {
      const err = new Error("fail");
      service.createAddress.mockRejectedValue(err);

      await controller.create(req, res, next);

      expect(next).toHaveBeenCalledWith(err);
    });
  });

  describe("list", () => {
    test("should return addresses", async () => {
      const fake = [{ _id: "a1" }];
      service.getUserAddresses.mockResolvedValue(fake);

      await controller.list(req, res, next);

      expect(res.json).toHaveBeenCalledWith(fake);
    });

    test("should call next on error", async () => {
      const err = new Error("fail");
      service.getUserAddresses.mockRejectedValue(err);

      await controller.list(req, res, next);

      expect(next).toHaveBeenCalledWith(err);
    });
  });

  describe("get", () => {
    test("should return address", async () => {
      const fake = { _id: "a1" };
      req.params.id = "a1";
      service.getAddressById.mockResolvedValue(fake);

      await controller.get(req, res, next);

      expect(res.json).toHaveBeenCalledWith(fake);
    });

    test("should call next on error", async () => {
      const err = new Error("fail");
      service.getAddressById.mockRejectedValue(err);

      await controller.get(req, res, next);

      expect(next).toHaveBeenCalledWith(err);
    });
  });

  describe("update", () => {
    test("should return updated address", async () => {
      const fake = { _id: "a1", city: "Haifa" };
      req.params.id = "a1";
      service.updateAddress.mockResolvedValue(fake);

      await controller.update(req, res, next);

      expect(res.json).toHaveBeenCalledWith(fake);
    });

    test("should call next on error", async () => {
      const err = new Error("fail");
      service.updateAddress.mockRejectedValue(err);

      await controller.update(req, res, next);

      expect(next).toHaveBeenCalledWith(err);
    });
  });

  describe("remove", () => {
    test("should delete and return success message", async () => {
      req.params.id = "a1";
      service.deleteAddress.mockResolvedValue({ _id: "a1" });

      await controller.remove(req, res, next);

      expect(res.json).toHaveBeenCalledWith({ message: "Deleted successfully" });
    });

    test("should call next on error", async () => {
      const err = new Error("fail");
      service.deleteAddress.mockRejectedValue(err);

      await controller.remove(req, res, next);

      expect(next).toHaveBeenCalledWith(err);
    });
  });

  describe("setDefault", () => {
    test("should set default and return updated address", async () => {
      const fake = { _id: "a1", isDefault: true };
      req.params.id = "a1";
      service.setDefaultAddress.mockResolvedValue(fake);

      await controller.setDefault(req, res, next);

      expect(res.json).toHaveBeenCalledWith(fake);
    });

    test("should call next on error", async () => {
      const err = new Error("fail");
      service.setDefaultAddress.mockRejectedValue(err);

      await controller.setDefault(req, res, next);

      expect(next).toHaveBeenCalledWith(err);
    });
  });
});
