import { jest } from "@jest/globals";
import MarketplaceController from "../../controllers/marketplace.controller.js";
import { CustomError } from "../../utils/CustomError.js";

describe("MarketplaceController", () => {
  let controller;
  let service;
  let req, res, next;

  beforeEach(() => {
    service = {
      createSeller: jest.fn(),
      getSellerByUserId: jest.fn(),
      updateSeller: jest.fn(),
      listSellers: jest.fn(),
      adminUpdateSellerStatus: jest.fn(),
    };

    controller = new MarketplaceController(service);

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    req = { user: undefined, body: {}, params: {}, query: {} };
    next = jest.fn();
  });

  // ========== createSeller ==========
 test("createSeller: throws 401 CustomError when no userId", async () => {
  req.user = undefined; // אין משתמש
  
  await controller.createSeller(req, res, next);

  expect(next).toHaveBeenCalledWith(expect.any(CustomError));
  const err = next.mock.calls[0][0];
  expect(err.statusCode).toBe(401);
  expect(err.message).toBe("Unauthorized");
  expect(service.createSeller).not.toHaveBeenCalled();
  expect(res.status).not.toHaveBeenCalled();
});


  test("createSeller: success", async () => {
    req.user = { userId: "65d123456789abcdef012345" };
    req.body = { companyName: "Comp", fullName: "Seller", email: "t@test.com" };
    const fake = { id: "s1" };
    service.createSeller.mockResolvedValue(fake);

    await controller.createSeller(req, res, next);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({ success: true, seller: fake });
  });

  // ========== mySeller ==========
test("mySeller: throws 404 CustomError when seller not found", async () => {
  req.user = { userId: "u1" };
  service.getSellerByUserId.mockResolvedValue(null);

  await controller.mySeller(req, res, next);

  expect(next).toHaveBeenCalledWith(expect.any(CustomError));
  const err = next.mock.calls[0][0];
  expect(err.statusCode).toBe(404);
  expect(err.message).toBe("Seller לא נמצא");
  expect(res.status).not.toHaveBeenCalled();
});


  test("mySeller: success", async () => {
    req.user = { userId: "u1" };
    const fake = { id: "s1" };
    service.getSellerByUserId.mockResolvedValue(fake);

    await controller.mySeller(req, res, next);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ success: true, seller: fake });
  });

  // ========== updateSeller ==========
  test("updateSeller: success", async () => {
    req.user = { userId: "u1", role: "seller" };
    req.params = { id: "s1" };
    req.body = { phone: "123" };
    const fake = { id: "s1", phone: "123" };
    service.updateSeller.mockResolvedValue(fake);

    await controller.updateSeller(req, res, next);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ success: true, seller: fake });
  });

  test("updateSeller: forwards error", async () => {
    const err = new Error("update failed");
    req.user = { userId: "u1", role: "seller" };
    req.params = { id: "s1" };
    req.body = { phone: "123" };
    service.updateSeller.mockRejectedValue(err);

    await controller.updateSeller(req, res, next);
    expect(next).toHaveBeenCalledWith(err);
  });

  // ========== listSellers ==========
  test("listSellers: success", async () => {
    req.query = { q: "a", status: "new", page: "2", limit: "5" };
    const result = { items: [], total: 0, page: 2, limit: 5 };
    service.listSellers.mockResolvedValue(result);

    await controller.listSellers(req, res, next);

    expect(service.listSellers).toHaveBeenCalledWith({
      status: "new",
      q: "a",
      page: 2,
      limit: 5,
    });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ success: true, ...result });
  });

  test("listSellers: forwards error", async () => {
    const err = new Error("DB fail");
    service.listSellers.mockRejectedValue(err);

    await controller.listSellers(req, res, next);
    expect(next).toHaveBeenCalledWith(err);
  });

  // ========== adminUpdateSellerStatus ==========
  test("adminUpdateSellerStatus: success", async () => {
    req.user = { userId: "admin1" };
    req.params = { id: "s1" };
    req.body = { status: "approved", note: "ok" };
    const fake = { id: "s1", status: "approved" };
    service.adminUpdateSellerStatus.mockResolvedValue(fake);

    await controller.adminUpdateSellerStatus(req, res, next);

    expect(service.adminUpdateSellerStatus).toHaveBeenCalledWith({
      id: "s1",
      status: "approved",
      note: "ok",
      adminUserId: "admin1",
    });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ success: true, seller: fake });
  });

  test("adminUpdateSellerStatus: forwards error", async () => {
    const err = new Error("bad update");
    service.adminUpdateSellerStatus.mockRejectedValue(err);
    req.user = { userId: "admin1" };
    req.params = { id: "s1" };
    req.body = { status: "approved", note: "ok" };

    await controller.adminUpdateSellerStatus(req, res, next);
    expect(next).toHaveBeenCalledWith(err);
  });
});
