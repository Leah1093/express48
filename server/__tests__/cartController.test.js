import { jest } from '@jest/globals';
import * as cartController from '../controllers/cartController.js';
import { CartService } from '../service/cartService.js';

jest.mock('../service/cartService.js');

describe('cartController', () => {
  let req, res, next;
  beforeEach(() => {
    req = { user: { userId: 'u1' }, body: {}, params: {} };
    res = { json: jest.fn(), status: jest.fn().mockReturnThis() };
    next = jest.fn((err) => {
      const statusCode = err.status || err.statusCode || 500;
      const message = err.message || 'Internal Server Error';
      res.status(statusCode).json({ status: statusCode, error: message });
    });
    jest.clearAllMocks();
    jest.spyOn(CartService.prototype, 'getCart').mockResolvedValue({ userId: 'u1', items: [] });
    jest.spyOn(CartService.prototype, 'addToCart').mockResolvedValue({ items: [1,2] });
    jest.spyOn(CartService.prototype, 'removeFromCart').mockResolvedValue({ userId: 'u1', items: [] });
    jest.spyOn(CartService.prototype, 'removeProductCompletely').mockResolvedValue({ userId: 'u1', items: [] });
    jest.spyOn(CartService.prototype, 'clearCart').mockResolvedValue({ userId: 'u1', items: [] });
    jest.spyOn(CartService.prototype, 'mergeLocalCart').mockResolvedValue({ userId: 'u1', items: [{ productId: 'p1', quantity: 2 }] });
    jest.spyOn(CartService.prototype, 'updateItemQuantity').mockResolvedValue({ userId: 'u1', items: [{ productId: 'p1', quantity: 5 }] });
    jest.spyOn(CartService.prototype, 'toggleItemSelected').mockResolvedValue({ userId: 'u1', items: [{ _id: 'i1', selected: true }] });
    jest.spyOn(CartService.prototype, 'toggleSelectAll').mockResolvedValue({ userId: 'u1', items: [{ selected: true }] });
  });

  it('getCart returns cart', async () => {
    await cartController.getCart(req, res);
    expect(res.json).toHaveBeenCalledWith({ userId: 'u1', items: [] });
  });

  it('getCart handles error', async () => {
    const err = new Error('fail');
    err.name = 'CustomError';
    err.status = 404;
    jest.spyOn(CartService.prototype, 'getCart').mockRejectedValue(err);
    await cartController.getCart(req, res, next);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ status: 404, error: 'fail' });
  });

  it('addToCart returns items', async () => {
    req.body = { productId: 'p1', quantity: 2 };
    await cartController.addToCart(req, res);
    expect(res.json).toHaveBeenCalledWith({ items: [1,2] });
  });

  it('addToCart handles error', async () => {
    const err = new Error('fail');
    err.name = 'CustomError';
    err.status = 404;
    jest.spyOn(CartService.prototype, 'addToCart').mockRejectedValue(err);
    await cartController.addToCart(req, res, next);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ status: 404, error: 'fail' });
  });

  it('removeFromCart returns cart', async () => {
    req.body = { productId: 'p1' };
    await cartController.removeFromCart(req, res);
    expect(res.json).toHaveBeenCalledWith({ userId: 'u1', items: [] });
  });

  it('removeFromCart handles error', async () => {
    const err = new Error('fail');
    err.name = 'CustomError';
    err.status = 404;
    jest.spyOn(CartService.prototype, 'removeFromCart').mockRejectedValue(err);
    await cartController.removeFromCart(req, res, next);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ status: 404, error: 'fail' });
  });

  it('removeProductCompletely returns updatedCart', async () => {
    req.body = { productId: 'p1' };
    await cartController.removeProductCompletely(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ userId: 'u1', items: [] });
  });

  it('removeProductCompletely handles error', async () => {
    const err = new Error('fail');
    err.name = 'CustomError';
    err.status = 404;
    jest.spyOn(CartService.prototype, 'removeProductCompletely').mockRejectedValue(err);
    await cartController.removeProductCompletely(req, res, next);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ status: 404, error: 'fail' });
  });

  it('clearCart returns cart', async () => {
    await cartController.clearCart(req, res);
    expect(res.json).toHaveBeenCalledWith({ userId: 'u1', items: [] });
  });

  it('clearCart handles error', async () => {
    const err = new Error('fail');
    err.name = 'CustomError';
    err.status = 404;
    jest.spyOn(CartService.prototype, 'clearCart').mockRejectedValue(err);
    await cartController.clearCart(req, res, next);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ status: 404, error: 'fail' });
  });

  it('mergeLocalCart returns mergedCart', async () => {
    req.body = { items: [{ productId: 'p1', quantity: 2 }] };
    await cartController.mergeLocalCart(req, res, next);
    expect(res.json).toHaveBeenCalledWith({ userId: 'u1', items: [{ productId: 'p1', quantity: 2 }] });
  });

  it('mergeLocalCart handles error', async () => {
    const err = new Error('fail');
    err.name = 'CustomError';
    err.status = 404;
    jest.spyOn(CartService.prototype, 'mergeLocalCart').mockRejectedValue(err);
    await cartController.mergeLocalCart(req, res, next);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ status: 404, error: 'fail' });
  });

  it('updateItemQuantity returns updatedCart', async () => {
    req.body = { productId: 'p1', quantity: 5 };
    await cartController.updateItemQuantity(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ userId: 'u1', items: [{ productId: 'p1', quantity: 5 }] });
  });

  it('updateItemQuantity handles error', async () => {
    const err = new Error('fail');
    err.name = 'CustomError';
    err.status = 404;
    jest.spyOn(CartService.prototype, 'updateItemQuantity').mockRejectedValue(err);
    await cartController.updateItemQuantity(req, res, next);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ status: 404, error: 'fail' });
  });

  it('toggleSelected returns cart', async () => {
    req.params = { itemId: 'i1' };
    req.body = { selected: true };
    await cartController.toggleSelected(req, res, next);
    expect(res.json).toHaveBeenCalledWith({ userId: 'u1', items: [{ _id: 'i1', selected: true }] });
  });

  it('toggleSelected handles error', async () => {
    const err = new Error('fail');
    err.name = 'CustomError';
    err.status = 500;
    jest.spyOn(CartService.prototype, 'toggleItemSelected').mockRejectedValue(err);
    await cartController.toggleSelected(req, res, next);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ status: 500, error: 'fail' });
  });

  it('toggleSelecteAll returns cart', async () => {
    req.body = { selected: true };
    await cartController.toggleSelecteAll(req, res, next);
    expect(res.json).toHaveBeenCalledWith({ userId: 'u1', items: [{ selected: true }] });
  });

  it('toggleSelecteAll handles error', async () => {
    const err = new Error('fail');
    err.name = 'CustomError';
    err.status = 500;
    jest.spyOn(CartService.prototype, 'toggleSelectAll').mockRejectedValue(err);
    await cartController.toggleSelecteAll(req, res, next);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ status: 500, error: 'fail' });
  });
});
