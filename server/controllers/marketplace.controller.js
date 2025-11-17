import { MarketplaceService } from "../services/marketplace.service.js";
import { CustomError } from "../utils/CustomError.js";

export default class MarketplaceController {
  constructor(service = new MarketplaceService()) {
    this.service = service;
  }

  createSeller = async (req, res, next) => {
    try {
      const userId = req.user?.userId || req.user?._id;
      if (!userId) throw new CustomError("Unauthorized", 401);

      const seller = await this.service.createSeller({ ...req.body, userId });
      res.status(201).json({ success: true, seller });
    } catch (err) {
      next(err);
    }
  };

  mySeller = async (req, res, next) => {
    try {
      const userId = req.user?.userId || req.user?._id;
      const seller = await this.service.getSellerByUserId(userId);
      if (!seller) throw new CustomError("Seller לא נמצא", 404);

      res.status(200).json({ success: true, seller });
    } catch (err) {
      next(err);
    }
  };

  updateSeller = async (req, res, next) => {
    try {
      const { id } = req.params;
      const actor = { userId: req.user?.userId || req.user?._id, role: req.user?.role };
      const seller = await this.service.updateSeller({ sellerId: id, data: req.body, actor });
      res.status(200).json({ success: true, seller });
    } catch (err) {
      next(err);
    }
  };

  listSellers = async (req, res, next) => {
    try {
      const { status, q, page, limit } = req.query;
      const data = await this.service.listSellers({
        status,
        q,
        page: Number(page) || 1,
        limit: Number(limit) || 20,
      });
      res.status(200).json({ success: true, ...data });
    } catch (err) {
      next(err);
    }
  };

  adminUpdateSellerStatus = async (req, res, next) => {
    try {
      const { id } = req.params;
      const { status, note } = req.body;
      const adminUserId = req.user?.userId || req.user?._id;

      const seller = await this.service.adminUpdateSellerStatus({ id, status, note, adminUserId });
      res.status(200).json({ success: true, seller });
    } catch (err) {
      next(err);
    }
  };
}
