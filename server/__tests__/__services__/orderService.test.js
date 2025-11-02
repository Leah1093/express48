import { jest } from "@jest/globals";

// --- Mock ל־Order ---
jest.unstable_mockModule("../../models/order.js", () => {
  const save = jest.fn();

  function Order(data) {
    return { ...data, save };
  }

  Order.__mockSave = save;

  Order.find = jest.fn();
  Order.findOne = jest.fn();
  Order.findByIdAndUpdate = jest.fn();
  Order.findOneAndDelete = jest.fn();

  return { Order };
});

// נטען אחרי שה־mock רשום
let Order, OrderService, CustomError;

beforeAll(async () => {
  ({ Order } = await import("../../models/order.js"));
  ({ OrderService } = await import("../../service/orderService.js"));
  ({ CustomError } = await import("../../utils/CustomError.js"));
});

describe("OrderService", () => {
  let service;

  beforeEach(() => {
    service = new OrderService();
    jest.clearAllMocks();
  });

  // ---- createOrder ----
  describe("createOrder", () => {
    test("should create order with valid items", async () => {
      Order.__mockSave.mockResolvedValue({ _id: "1", totalAmount: 200 });

      const res = await service.createOrder("u1", {
        addressId: "addr1",
        items: [{ price: 100, quantity: 2 }]
      });

      expect(res.totalAmount).toBe(200);
    });

    test("should throw if items empty", async () => {
      await expect(service.createOrder("u1", { items: [] }))
        .rejects.toThrow(/at least one item/);
    });

    test("should throw if item missing price", async () => {
      await expect(service.createOrder("u1", { items: [{ quantity: 1 }] }))
        .rejects.toThrow(/must have price and quantity/);
    });

    test("should wrap DB error in CustomError", async () => {
      Order.__mockSave.mockRejectedValue(new Error("DB fail"));

      await expect(service.createOrder("u1", {
        items: [{ price: 50, quantity: 1 }]
      })).rejects.toThrow(/Failed to create order/);
    });
  });

  // ---- getUserOrders ----
  describe("getUserOrders", () => {
    test("should return orders", async () => {
      Order.find.mockReturnValue({
        populate: () => ({ populate: () => ["o1"] })
      });

      const res = await service.getUserOrders("u1");
      expect(res).toEqual(["o1"]);
    });

    test("should throw CustomError on DB error", async () => {
      Order.find.mockImplementation(() => { throw new Error("DB fail"); });

      await expect(service.getUserOrders("u1"))
        .rejects.toThrow(/Failed to fetch user orders/);
    });
  });

  // ---- getOrderById ----
  describe("getOrderById", () => {
    test("should return order if exists", async () => {
      Order.findOne.mockReturnValue({
        populate: () => ({
          populate: () => ({
            populate: () => "order"
          })
        })
      });

      const res = await service.getOrderById("o1", "u1");
      expect(res).toBe("order");
    });

    test("should throw if not found", async () => {
      Order.findOne.mockReturnValue({
        populate: () => ({
          populate: () => ({
            populate: () => null
          })
        })
      });

      await expect(service.getOrderById("o1", "u1"))
        .rejects.toThrow(/Order not found/);
    });

    test("should wrap DB error in CustomError", async () => {
      Order.findOne.mockImplementation(() => { throw new Error("DB fail"); });

      await expect(service.getOrderById("o1", "u1"))
        .rejects.toThrow(/Failed to fetch order/);
    });
  });

  // ---- updateOrderStatus ----
  describe("updateOrderStatus", () => {
    test("should update status if valid", async () => {
      Order.findByIdAndUpdate.mockResolvedValue({ _id: "o1", status: "shipped" });

      const res = await service.updateOrderStatus("o1", "shipped");
      expect(res.status).toBe("shipped");
    });

    test("should throw if status invalid", async () => {
      await expect(service.updateOrderStatus("o1", "BAD"))
        .rejects.toThrow(/Invalid status/);
    });

    test("should throw if not found", async () => {
      Order.findByIdAndUpdate.mockResolvedValue(null);

      await expect(service.updateOrderStatus("o1", "shipped"))
        .rejects.toThrow(/Order not found/);
    });

    test("should wrap DB error in CustomError", async () => {
      Order.findByIdAndUpdate.mockRejectedValue(new Error("DB fail"));

      await expect(service.updateOrderStatus("o1", "shipped"))
        .rejects.toThrow(/Failed to update order status/);
    });
  });

  // ---- deleteOrder ----
  describe("deleteOrder", () => {
    test("should delete if exists", async () => {
      Order.findOneAndDelete.mockResolvedValue({ _id: "o1" });

      const res = await service.deleteOrder("o1", "u1");
      expect(res._id).toBe("o1");
    });

    test("should throw if not found", async () => {
      Order.findOneAndDelete.mockResolvedValue(null);

      await expect(service.deleteOrder("o1", "u1"))
        .rejects.toThrow(/Order not found/);
    });

    test("should wrap DB error in CustomError", async () => {
      Order.findOneAndDelete.mockRejectedValue(new Error("DB fail"));

      await expect(service.deleteOrder("o1", "u1"))
        .rejects.toThrow(/Failed to delete order/);
    });
  });
});
