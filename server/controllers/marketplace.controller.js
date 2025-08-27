// controllers/marketplace.controller.js
import { MarketplaceService } from "../service/marketplace.service.js";
import { createSellerSchema, updateSellerSchema, adminUpdateStatusSchema } from "../validations/seller.schema.js";

export default class MarketplaceController {
  constructor(service = new MarketplaceService()) {
    this.service = service;
  }

  createSeller = async (req, res, next) => {
    try {
      const userId = req.user?.userId || req.user?._id;
      if (!userId) return res.status(401).json({ success: false, message: "Unauthorized" });

      const validated = createSellerSchema.parse({ ...req.body, userId });
      const seller = await this.service.createSeller(validated);

      res.status(201).json({ success: true, seller });
    } catch (err) {
      if (err.name === "ZodError")
        return res.status(400).json({ success: false, message: "ולידציה נכשלה", errors: err.errors });
      next(err);
    }
  };

  mySeller = async (req, res, next) => {
    try {
      const userId = req.user?.userId || req.user?._id;
      const seller = await this.service.getSellerByUserId(userId);
      if (!seller) return res.status(404).json({ success: false, message: "Seller לא נמצא" });
      res.status(200).json({ success: true, seller });
    } catch (err) { next(err); }
  };

  updateSeller = async (req, res, next) => {
    try {
      const { id } = req.params;
      const actor = { userId: req.user?.userId || req.user?._id, role: req.user?.role };
      const validated = updateSellerSchema.parse(req.body);

      const seller = await this.service.updateSeller({ sellerId: id, data: validated, actor });
      res.status(200).json({ success: true, seller });
    } catch (err) {
      if (err.name === "ZodError")
        return res.status(400).json({ success: false, message: "ולידציה נכשלה", errors: err.errors });
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
        limit: Number(limit) || 20
      });
      res.status(200).json({ success: true, ...data });
    } catch (err) { next(err); }
  };

  adminUpdateSellerStatus = async (req, res, next) => {
    try {
      const { id } = req.params;
      const { status, note } = adminUpdateStatusSchema.parse(req.body);
      const adminUserId = req.user?.userId || req.user?._id;

      const seller = await this.service.adminUpdateSellerStatus({ id, status, note, adminUserId });
      res.status(200).json({ success: true, seller });
    } catch (err) {
      if (err.name === "ZodError")
        return res.status(400).json({ success: false, message: "ולידציה נכשלה", errors: err.errors });
      next(err);
    }
  };
}
