
jest.unstable_mockModule("../utils/customError.js", () => ({
  __esModule: true,
  CustomError: class CustomError extends Error {
    constructor(message, status) {
      super(message);
      this.name = "CustomError";
      this.status = status;
    }
  }
}));

import { jest } from "@jest/globals";

jest.unstable_mockModule("../models/cart.js", () => {
  function Cart(data) {
    this.userId = data?.userId;
    this.items = data?.items || [];
    this.save = jest.fn().mockResolvedValue();
  }
  Cart.findOne = jest.fn();
  Cart.findOneAndUpdate = jest.fn();
  Cart.prototype = { save: jest.fn() };
  return { __esModule: true, Cart };
});
jest.unstable_mockModule("../models/Product.js", () => ({
  __esModule: true,
  Product: {
    findById: jest.fn(),
    find: jest.fn()
  }
}));
jest.unstable_mockModule("../mongoQueries/cartQueries.js", () => ({
  __esModule: true,
  cartQueries: {
    findByUserId: jest.fn()
  }
}));

const { CartService } = await import("../service/cartService.js");
const { Cart } = await import("../models/cart.js");
const { Product } = await import("../models/Product.js");
const { cartQueries } = await import("../mongoQueries/cartQueries.js");

function chainableMock(resolvedValue) {
  return {
    populate: jest.fn().mockResolvedValue(resolvedValue)
  };
}
function selectMock(obj) {
  obj.select = jest.fn().mockReturnThis();
  return obj;
}
function leanMock(obj, value) {
  obj.lean = jest.fn().mockResolvedValue(value);
  return obj;
}

describe("CartService", () => {
  let service;
  beforeEach(() => {
    service = new CartService();
    jest.clearAllMocks();
  });

  describe("getCart", () => {
    it("returns cart if found", async () => {
      Cart.findOne.mockReturnValue(chainableMock({ userId: "u1", items: [1, 2] }));
      const cart = await service.getCart("u1");
      expect(cart).toEqual({ userId: "u1", items: [1, 2] });
    });
    it("returns empty cart if not found", async () => {
      Cart.findOne.mockReturnValue(chainableMock(null));
      const cart = await service.getCart("u2");
      expect(cart).toEqual({ userId: "u2", items: [] });
    });
  });

  describe("addToCart", () => {
    it("creates new cart if not exists", async () => {
      Cart.findOne.mockReturnValueOnce(null);
      Product.findById.mockReturnValue(selectMock(leanMock({}, { price: { amount: 10 } })));
      Cart.prototype.save = jest.fn().mockResolvedValue();
      Cart.findOne.mockReturnValueOnce(chainableMock({ userId: "u1", items: [{ productId: "p1", quantity: 1, unitPrice: 10 }] }));
      const cart = await service.addToCart("u1", "p1", 1);
      expect(cart.items[0]).toMatchObject({ productId: "p1", quantity: 1, unitPrice: 10 });
    });
    it("adds to existing cart", async () => {
      const cartMock = { items: [], save: jest.fn(), items: [] };
      Cart.findOne.mockReturnValueOnce(cartMock);
      cartMock.items.find = jest.fn().mockReturnValue(undefined);
      Product.findById.mockReturnValue(selectMock(leanMock({}, { price: { amount: 20 } })));
      Cart.findOne.mockReturnValueOnce(chainableMock({ userId: "u1", items: [{ productId: "p2", quantity: 1, unitPrice: 20 }] }));
      const cart = await service.addToCart("u1", "p2", 1);
      expect(cart.items[0]).toMatchObject({ productId: "p2", quantity: 1, unitPrice: 20 });
    });
    it("throws if product not found", async () => {
      Cart.findOne.mockReturnValueOnce(null);
      Product.findById.mockReturnValue(selectMock(leanMock({}, null)));
      await expect(service.addToCart("u1", "bad", 1)).rejects.toThrow("Product not found");
    });
  });

  describe("removeFromCart", () => {
    it("removes one quantity if >1", async () => {
      const cartMock = { items: [{ productId: "p1", quantity: 2 }], save: jest.fn() };
      Cart.findOne.mockResolvedValue(cartMock);
      const cart = await service.removeFromCart("u1", "p1");
      expect(cartMock.items[0].quantity).toBe(1);
    });
    it("removes item if quantity=1", async () => {
      const cartMock = { items: [{ productId: "p1", quantity: 1 }], save: jest.fn() };
      Cart.findOne.mockResolvedValue(cartMock);
      const cart = await service.removeFromCart("u1", "p1");
      expect(cartMock.items.length).toBe(0);
    });
    it("returns cart if item not found", async () => {
      const cartMock = { items: [{ productId: "p2", quantity: 1 }], save: jest.fn() };
      Cart.findOne.mockResolvedValue(cartMock);
      const cart = await service.removeFromCart("u1", "p1");
      expect(cart).toBe(cartMock);
    });
    it("throws if cart not found", async () => {
      Cart.findOne.mockResolvedValue(null);
      await expect(service.removeFromCart("u1", "p1")).rejects.toThrow("Cart not found");
    });
  });

  describe("removeProductCompletely", () => {
    it("removes all items with productId", async () => {
      const cartMock = { items: [{ productId: "p1", quantity: 1 }, { productId: "p1", quantity: 2 }], save: jest.fn() };
      Cart.findOne.mockResolvedValueOnce(cartMock);
      Cart.findOne.mockReturnValueOnce(chainableMock({ userId: "u1", items: [] }));
      const cart = await service.removeProductCompletely("u1", "p1");
      expect(cart.items.length).toBe(0);
    });
    it("throws if cart not found", async () => {
      Cart.findOne.mockResolvedValue(null);
      await expect(service.removeProductCompletely("u1", "p1")).rejects.toThrow("Cart not found");
    });
  });

  describe("clearCart", () => {
    it("clears items if cart exists", async () => {
      const cartMock = { items: [1, 2], save: jest.fn() };
      Cart.findOne.mockResolvedValue(cartMock);
      const cart = await service.clearCart("u1");
      expect(cartMock.items).toEqual([]);
    });
    it("returns null if cart not found", async () => {
      Cart.findOne.mockResolvedValue(null);
      const cart = await service.clearCart("u1");
      expect(cart).toBe(null);
    });
  });

  describe("mergeLocalCart", () => {
    it("creates new cart with local items", async () => {
      Cart.findOne.mockReturnValueOnce(null);
      Product.find.mockReturnValue(selectMock(leanMock({}, [{ _id: "p1", price: { amount: 10 } }] )));
      Cart.prototype.save = jest.fn().mockResolvedValue();
      Cart.findOne.mockReturnValueOnce(chainableMock({ userId: "u1", items: [{ productId: "p1", quantity: 2, unitPrice: 10 }] }));
      const cart = await service.mergeLocalCart("u1", [{ productId: "p1", quantity: 2 }]);
      expect(cart.items[0]).toMatchObject({ productId: "p1", quantity: 2, unitPrice: 10 });
    });
    it("merges with existing cart", async () => {
      const cartMock = { items: [{ productId: "p1", quantity: 1 }], save: jest.fn() };
      Cart.findOne.mockReturnValueOnce(cartMock);
      Product.find.mockReturnValue(selectMock(leanMock({}, [{ _id: "p1", price: { amount: 10 } }] )));
      Cart.findOne.mockReturnValueOnce(chainableMock({ userId: "u1", items: [{ productId: "p1", quantity: 3, unitPrice: 10 }] }));
      const cart = await service.mergeLocalCart("u1", [{ productId: "p1", quantity: 2 }]);
      expect(cart.items[0].quantity).toBe(3);
    });
    it("throws if product not found", async () => {
      Cart.findOne.mockReturnValueOnce(null);
      Product.find.mockReturnValue(selectMock(leanMock({}, [])));
      await expect(service.mergeLocalCart("u1", [{ productId: "bad", quantity: 1 }])).rejects.toThrow("Product not found: bad");
    });
  });

  describe("updateItemQuantity", () => {
    it("updates quantity", async () => {
      const cartMock = { items: [{ productId: "p1", quantity: 1 }], save: jest.fn() };
      Cart.findOne.mockReturnValueOnce(cartMock);
      Cart.findOne.mockReturnValueOnce(chainableMock({ userId: "u1", items: [{ productId: "p1", quantity: 5 }] }));
      const cart = await service.updateItemQuantity("u1", "p1", 5);
      expect(cart.items[0].quantity).toBe(5);
    });
    it("throws if cart not found", async () => {
      Cart.findOne.mockReturnValueOnce(null);
      await expect(service.updateItemQuantity("u1", "p1", 5)).rejects.toThrow("Cart not found");
    });
    it("throws if product not in cart", async () => {
      const cartMock = { items: [{ productId: "p2", quantity: 1 }], save: jest.fn() };
      Cart.findOne.mockReturnValueOnce(cartMock);
      await expect(service.updateItemQuantity("u1", "p1", 5)).rejects.toThrow("Product not found in cart");
    });
  });

  describe("toggleItemSelected", () => {
    it("updates selected for item", async () => {
      Cart.findOneAndUpdate.mockReturnValue(chainableMock({ userId: "u1", items: [{ _id: "i1", selected: true }] }));
      const cart = await service.toggleItemSelected("u1", "i1", true);
      expect(cart.items[0].selected).toBe(true);
    });
    it("throws if cart not found", async () => {
      Cart.findOneAndUpdate.mockReturnValue(chainableMock(null));
      await expect(service.toggleItemSelected("u1", "i1", true)).rejects.toThrow("Cart not found or item not found");
    });
  });

  describe("toggleSelectAll", () => {
    it("updates selected for all", async () => {
      Cart.findOneAndUpdate.mockReturnValue(chainableMock({ userId: "u1", items: [{ selected: true }, { selected: true }] }));
      const cart = await service.toggleSelectAll("u1", true);
      expect(cart.items.every(i => i.selected)).toBe(true);
    });
  });
});
