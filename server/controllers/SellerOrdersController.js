import { SellerOrdersService } from "../services/SellerOrdersService.js";
import { CustomError } from "../utils/CustomError.js";

export class SellerOrdersController {
  constructor() {
    this.sellerOrdersService = new SellerOrdersService();

    this.getSellerOrdersForSeller =
      this.getSellerOrdersForSeller.bind(this);
    this.updateOrderStatusForSeller =
      this.updateOrderStatusForSeller.bind(this);
  }

  // GET /seller/orders
  async getSellerOrdersForSeller(req, res, next) {
    try {
      const user = req.user;

      if (!user) {
        throw new CustomError("חייבים להיות מחוברים", 401);
      }

      if (!user.sellerId) {
        throw new CustomError("המשתמש אינו מוכר", 403);
      }

      const { status, search } = req.query;

      const orders =
        await this.sellerOrdersService.getSellerOrdersForSeller({
          sellerId: user.sellerId.toString(),
          status: status && String(status).trim(),
          search: search && String(search).trim(),
        });

      res.status(200).json(orders);
    } catch (err) {
      next(err);
    }
  }

  // PATCH /seller/orders/:orderId/status
  async updateOrderStatusForSeller(req, res, next) {
    try {
      const user = req.user;

      if (!user) {
        throw new CustomError("חייבים להיות מחוברים", 401);
      }

      if (!user.sellerId) {
        throw new CustomError("המשתמש אינו מוכר", 403);
      }

      const sellerId = user.sellerId.toString();
      const { orderId } = req.params;
      const { status } = req.body;

      const result =
        await this.sellerOrdersService.updateOrderStatusForSeller({
          sellerId,
          orderId,
          status,
        });

      return res.json(result);
    } catch (err) {
      next(err);
    }
  }
}

// את זה אפשר להשאיר אם את משתמשת בו במקום אחר,
// אבל כרגע ברוטר את גם ככה עושה new SellerOrdersController() בעצמך.
export const sellerOrdersController = new SellerOrdersController();
