import request from "supertest";
import express from "express";
import { jest } from "@jest/globals";

// נבנה מוק ל-service כדי לשלוט בתשובות
jest.unstable_mockModule("../../service/addressService.js", () => {
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

// מוקים ל־auth ו־validate – פשוט מעבירים הלאה
jest.unstable_mockModule("../../middlewares/auth.js", () => ({
  authMiddleware: (req, res, next) => {
    req.user = { userId: "u1" }; // נכניס user מדומה
    next();
  },
}));

jest.unstable_mockModule("../../middlewares/validate.js", () => ({
  validate: () => (req, res, next) => next(),
}));

// נטען router אחרי המוקים
const router = (await import("../../router/addressRoutes.js")).default;
const { service } = await import("../../controllers/addressController.js");

const app = express();
app.use(express.json());

// errorHandler בסיסי
app.use("/addresses", router);
app.use((err, req, res, next) => {
  const status = err.status || 500;
  res.status(status).json({ status, error: err.message });
});

describe("Address Router (Integration)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("POST /addresses should create address", async () => {
    const fake = { _id: "a1", city: "Tel Aviv" };
    service.createAddress.mockResolvedValue(fake);

    const res = await request(app).post("/addresses").send({ city: "Tel Aviv" });

    expect(res.status).toBe(201);
    expect(res.body).toEqual(fake);
  });

  test("GET /addresses should list addresses", async () => {
    const fake = [{ _id: "a1" }];
    service.getUserAddresses.mockResolvedValue(fake);

    const res = await request(app).get("/addresses");

    expect(res.status).toBe(200);
    expect(res.body).toEqual(fake);
  });

  test("GET /addresses/:id should return one address", async () => {
    const fake = { _id: "a1" };
    service.getAddressById.mockResolvedValue(fake);

    const res = await request(app).get("/addresses/a1");

    expect(res.status).toBe(200);
    expect(res.body).toEqual(fake);
  });

  test("PUT /addresses/:id should update address", async () => {
    const fake = { _id: "a1", city: "Haifa" };
    service.updateAddress.mockResolvedValue(fake);

    const res = await request(app).put("/addresses/a1").send({ city: "Haifa" });

    expect(res.status).toBe(200);
    expect(res.body).toEqual(fake);
  });

  test("DELETE /addresses/:id should delete address", async () => {
    service.deleteAddress.mockResolvedValue({ _id: "a1" });

    const res = await request(app).delete("/addresses/a1");

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ message: "Deleted successfully" });
  });

  test("PATCH /addresses/:id/default should set default", async () => {
    const fake = { _id: "a1", isDefault: true };
    service.setDefaultAddress.mockResolvedValue(fake);

    const res = await request(app).patch("/addresses/a1/default");

    expect(res.status).toBe(200);
    expect(res.body).toEqual(fake);
  });

  test("should return error from service", async () => {
    service.createAddress.mockRejectedValue({ status: 400, message: "Bad data" });

    const res = await request(app).post("/addresses").send({ city: "" });

    expect(res.status).toBe(400);
    expect(res.body).toEqual({ status: 400, error: "Bad data" });
  });

  test("should return 500 for unexpected error", async () => {
    service.getUserAddresses.mockRejectedValue(new Error("Unexpected fail"));

    const res = await request(app).get("/addresses");

    expect(res.status).toBe(500);
    expect(res.body).toEqual({ status: 500, error: "Unexpected fail" });
  });
});
