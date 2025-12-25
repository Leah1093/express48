import { CustomError } from "../utils/CustomError.js";
import { AffiliatePayoutAdminService } from "../services/affiliatePayoutAdmin.service.js";

function getUserId(req) {
  return (
    req.user?._id ||
    req.user?.id ||
    req.user?.userId ||
    req.auth?.userId ||
    req.auth?._id ||
    req.auth?.id ||
    null
  );
}

// אם יש לך כבר middleware isAdmin - עדיף להשתמש בו בראוטר.
// פה אני שם בדיקת מינימום:
function mustAdmin(req) {
  const user = req.user || req.auth || null;
  const isAdmin = Boolean(user?.isAdmin || user?.role === "admin");
  if (!isAdmin) throw new CustomError("Not allowed", 403);
}

export class AffiliatePayoutAdminController {
  static async list(req, res, next) {
    try {
      mustAdmin(req);
      const payouts = await AffiliatePayoutAdminService.list(req.query);
      return res.status(200).json({ status: 200, payouts });
    } catch (err) {
      next(err);
    }
  }

  static async getById(req, res, next) {
    try {
      mustAdmin(req);
      const { id } = req.params;
      const data = await AffiliatePayoutAdminService.getById(id);
      return res.status(200).json({ status: 200, ...data });
    } catch (err) {
      next(err);
    }
  }

  static async approve(req, res, next) {
    try {
      mustAdmin(req);
      const { id } = req.params;
      const payout = await AffiliatePayoutAdminService.approve(id, req.body);
      return res.status(200).json({ status: 200, payout });
    } catch (err) {
      next(err);
    }
  }

  static async reject(req, res, next) {
    try {
      mustAdmin(req);
      const { id } = req.params;
      const payout = await AffiliatePayoutAdminService.reject(id, req.body);
      return res.status(200).json({ status: 200, payout });
    } catch (err) {
      next(err);
    }
  }

  static async markPaid(req, res, next) {
    try {
      mustAdmin(req);
      const { id } = req.params;
      const payout = await AffiliatePayoutAdminService.markPaid(id, req.body);
      return res.status(200).json({ status: 200, payout });
    } catch (err) {
      next(err);
    }
  }

  static async setProcessing(req, res, next) {
    try {
      mustAdmin(req);
      const { id } = req.params;
      const payout = await AffiliatePayoutAdminService.setProcessing(id);
      return res.status(200).json({ status: 200, payout });
    } catch (err) {
      next(err);
    }
  }
}
