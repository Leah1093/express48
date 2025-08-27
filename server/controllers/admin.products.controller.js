// controllers/admin.products.controller.js
import { AdminProductsService } from "../services/admin.products.service.js";
const service = new AdminProductsService();

export default class AdminProductsController {
  listPending = async (req, res, next) => {
    try {
      const page = Number(req.query.page || 1);
      const limit = Math.min(Number(req.query.limit || 20), 100);
      res.json(await service.listPending({ page, limit }));
    } catch (e) { next(e); }
  };

  setStatus = async (req, res, next) => {
    try {
      const adminId = req.user?.userId;
      const { action, reason } = req.body; // approve | reject | hide | archive
      const doc = await service.setStatus({ id: req.params.id, action, reason, adminId });
      res.json(doc);
    } catch (e) { next(e); }
  };
}
