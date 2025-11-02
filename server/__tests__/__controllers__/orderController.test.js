import { jest } from "@jest/globals";
import { CustomError } from "../../utils/CustomError.js";

// ====== Mocks ======
const mockCreateOrder = jest.fn();
const mockGetUserOrders = jest.fn();
const mockGetOrderById = jest.fn();
const mockUpdateOrderStatus = jest.fn();
const mockDeleteOrder = jest.fn();

jest.unstable_mockModule("../../service/orderService.js", () => ({
  OrderService: jest.fn().mockImplementation(() => ({
    createOrder: mockCreateOrder,
    getUserOrders: mockGetUserOrders,
    getOrderById: mockGetOrderById,
    updateOrderStatus: mockUpdateOrderStatus,
    deleteOrder: mockDeleteOrder,
  })),
}));

const { OrderController } = await import("../../controllers/orderController.js");

describe("OrderController", () => {
  let controller;
  let mockReq, mockRes, mockNext;

  beforeEach(() => {
    jest.clearAllMocks();
    controller = new OrderController();

    mockReq = {
      user: { userId: "u1" },
      body: {},
      params: { id: "o1" },
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    mockNext = jest.fn();
  });

  // ====== CREATE ======
  describe("create", () => {
    test("should return 201 on success", async () => {
      mockCreateOrder.mockResolvedValue({ _id: "o1" });
      mockReq.body = { items: [{ price: 100, quantity: 1 }] };

      await controller.create(mockReq, mockRes, mockNext);

      expect(mockCreateOrder).toHaveBeenCalledWith("u1", mockReq.body);
      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith({ _id: "o1" });
    });

    test("should call next on error", async () => {
      const error = new Error("DB fail");
      mockCreateOrder.mockRejectedValue(error);

      await controller.create(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  // ====== LIST ======
  describe("list", () => {
    test("should return user orders", async () => {
      mockGetUserOrders.mockResolvedValue(["o1"]);
      await controller.list(mockReq, mockRes, mockNext);

      expect(mockGetUserOrders).toHaveBeenCalledWith("u1");
      expect(mockRes.json).toHaveBeenCalledWith(["o1"]);
    });

    test("should call next on error", async () => {
      const error = new Error("DB fail");
      mockGetUserOrders.mockRejectedValue(error);

      await controller.list(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  // ====== GET ONE ======
  describe("getOne", () => {
    test("should return order if found", async () => {
      mockGetOrderById.mockResolvedValue({ _id: "o1" });
      await controller.getOne(mockReq, mockRes, mockNext);

      expect(mockRes.json).toHaveBeenCalledWith({ _id: "o1" });
    });

    test("should forward 404 if not found", async () => {
      mockGetOrderById.mockResolvedValue(null);
      await controller.getOne(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({ message: "ההזמנה לא נמצאה", status: 404 })
      );
    });

    test("should call next on error", async () => {
      const error = new Error("DB fail");
      mockGetOrderById.mockRejectedValue(error);

      await controller.getOne(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  // ====== UPDATE STATUS ======
  describe("updateStatus", () => {
    test("should update status if valid", async () => {
      mockReq.body = { status: "shipped" };
      mockUpdateOrderStatus.mockResolvedValue({ _id: "o1", status: "shipped" });

      await controller.updateStatus(mockReq, mockRes, mockNext);

      expect(mockUpdateOrderStatus).toHaveBeenCalledWith("o1", "shipped");
      expect(mockRes.json).toHaveBeenCalledWith({
        _id: "o1",
        status: "shipped",
      });
    });

    test("should forward 404 if not found", async () => {
      mockReq.body = { status: "shipped" };
      mockUpdateOrderStatus.mockResolvedValue(null);

      await controller.updateStatus(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({ message: "ההזמנה לא נמצאה", status: 404 })
      );
    });

    test("should call next on error", async () => {
      const error = new Error("DB fail");
      mockUpdateOrderStatus.mockRejectedValue(error);

      await controller.updateStatus(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  // ====== REMOVE ======
  describe("remove", () => {
    test("should delete order if exists", async () => {
      mockDeleteOrder.mockResolvedValue({ _id: "o1" });

      await controller.remove(mockReq, mockRes, mockNext);

      expect(mockDeleteOrder).toHaveBeenCalledWith("o1", "u1");
      expect(mockRes.json).toHaveBeenCalledWith({
        message: "ההזמנה נמחקה בהצלחה",
      });
    });

    test("should forward 404 if not found", async () => {
      mockDeleteOrder.mockResolvedValue(null);

      await controller.remove(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({ message: "ההזמנה לא נמצאה", status: 404 })
      );
    });

    test("should call next on error", async () => {
      const error = new Error("DB fail");
      mockDeleteOrder.mockRejectedValue(error);

      await controller.remove(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });
});
