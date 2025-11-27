import { SellerReportsService } from "../services/sellerReports.service.js";

const service = new SellerReportsService();

export class SellerReportsController {
  async productsSummary(req, res, next) {
    try {
      const role =
        req.auth?.role ||
        (Array.isArray(req.auth?.roles) ? req.auth.roles[0] : null);
      const sellerId = req.auth?.sellerId;
      const storeId = req.auth?.storeId;

      if (role !== "seller" && role !== "admin") {
        return res.status(403).json({ error: "Forbidden" });
      }

      const { page = 1, limit = 20, from, to } = req.query;

      const result = await service.productSummaryByDateRange({
        sellerId,
        storeId,
        from,
        to,
        page,
        limit,
      });

      return res.json(result);
    } catch (err) {
      next(err);
    }
  }

  async productDetails(req, res, next) {
    try {
      const role =
        req.auth?.role ||
        (Array.isArray(req.auth?.roles) ? req.auth.roles[0] : null);
      const sellerId = req.auth?.sellerId;
      const storeId = req.auth?.storeId;

      if (role !== "seller" && role !== "admin") {
        return res.status(403).json({ error: "Forbidden" });
      }

      const { id } = req.params;
      const { from, to } = req.query;

      const result = await service.productDetailsByDateRange({
        productId: id,
        sellerId,
        storeId,
        from,
        to,
      });

      return res.json(result);
    } catch (err) {
      next(err);
    }
  }
}
