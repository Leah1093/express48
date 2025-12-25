import { AffiliateService } from "../services/affiliate.service.js";
import { CustomError } from "../utils/CustomError.js";
import { Order } from "../models/order.js";
import { AffiliateProfile } from "../models/AffiliateProfile.js";
import { AffiliateCommission } from "../models/AffiliateProfile.js";
import { AffiliatePayoutService } from "../services/affiliatePayout.service.js";

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

export class AffiliateController {
  static async acceptTerms(req, res, next) {
    try {
      const userId = getUserId(req);
      if (!userId) throw new CustomError("Authorization required", 401);

      const payload = req.validated.body ?? req.body ?? {};

      const profile = await AffiliateService.acceptTerms(userId, payload, {
        ip: req.ip,
        userAgent: req.headers["user-agent"],
      });

      res.status(200).json({
        status: 200,
        affiliate: {
          status: profile.status,
          code: profile.code,
          termsAcceptedAt: profile.terms?.acceptedAt ?? null,
          termsVersion: profile.terms?.version ?? null,
        },
      });
    } catch (err) {
      next(err);
    }
  }

  static async apply(req, res, next) {
    try {
      const userId = getUserId(req);

      if (!userId) throw new CustomError("Authorization required", 401);

      const profile = await AffiliateService.apply(userId);

      res.status(201).json({
        status: 201,
        affiliate: {
          status: profile.status,
          code: profile.code,
          commissionRate: profile.commissionRate,
          joinedAt: profile.joinedAt,
        },
      });
    } catch (err) {
      next(err);
    }
  }

  static async me(req, res, next) {
    try {
      const userId = req.user?.userId || req.auth?.userId;
      if (!userId) throw new CustomError("Authorization required", 401);

      const profile = await AffiliateService.getMe(userId);

      res.status(200).json({
        status: 200,
        affiliate: profile
          ? {
              status: profile.status,
              code: profile.code,
              commissionRate: profile.commissionRate,
              joinedAt: profile.joinedAt,
              approvedAt: profile.approvedAt ?? null,
              termsAcceptedAt: profile.terms?.acceptedAt ?? null,
              termsVersion: profile.terms?.version ?? null,
              termsConfirmations: profile.terms?.confirmations ?? null,
            }
          : null,
      });
    } catch (err) {
      next(err);
    }
  }
  static async orders(req, res, next) {
    try {
      const userId = getUserId(req);
      if (!userId) throw new CustomError("Authorization required", 401);

      const profile = await AffiliateProfile.findOne({ userId }).select(
        "code status commissionRate"
      );
      if (!profile || profile.status !== "approved") {
        return res.status(200).json({ status: 200, orders: [] });
      }

      const query = {
        affiliateRef: profile.code,
        "payment.status": "paid",
        status: { $nin: ["canceled", "returned"] },
      };

      const orders = await Order.find(query)
        .sort({ createdAt: -1 })
        .select("orderId totalAmount status createdAt items");

      return res.status(200).json({ status: 200, orders });
    } catch (err) {
      next(err);
    }
  }
  static async summary(req, res, next) {
    try {
      const userId = getUserId(req);
      if (!userId) throw new CustomError("Authorization required", 401);

      const profile = await AffiliateProfile.findOne({ userId }).select(
        "code status commissionRate"
      );
      if (!profile || profile.status !== "approved") {
        return res.status(200).json({
          status: 200,
          summary: {
            count: 0,
            totalAmount: 0,
            paidCount: 0,
            paidAmount: 0,
            commissionRate: 0,
            estimatedCommissionPaid: 0,
          },
        });
      }

      const code = profile.code;

      const [paidAgg] = await Order.aggregate([
        {
          $match: {
            affiliateRef: code,
            "payment.status": "paid",
            status: { $nin: ["canceled", "returned"] },
          },
        },
        {
          $group: {
            _id: null,
            count: { $sum: 1 },
            totalAmount: { $sum: "$totalAmount" },
          },
        },
      ]);

      const paidAmount = paidAgg?.totalAmount ?? 0;
      const paidCount = paidAgg?.count ?? 0;

      const commissionRate =
        typeof profile.commissionRate === "number" ? profile.commissionRate : 0;

      const estimatedCommissionPaid = paidAmount * commissionRate;

      // 🔒 נועלים שה"כללי" == paid
      const count = paidCount;
      const totalAmount = paidAmount;

      return res.status(200).json({
        status: 200,
        summary: {
          count,
          totalAmount,
          paidCount,
          paidAmount,
          commissionRate,
          estimatedCommissionPaid,
        },
      });
    } catch (err) {
      next(err);
    }
  }
  static async trackClick(req, res, next) {
    try {
      const payload = req.validated?.body ?? req.body ?? {};

      const result = await AffiliateService.trackClick(payload, {
        ip: req.ip,
        userAgent: req.headers["user-agent"],
      });

      return res.status(200).json({ status: 200, ...result });
    } catch (err) {
      next(err);
    }
  }

  static async analyticsSummary(req, res, next) {
    try {
      const userId = getUserId(req);
      if (!userId) throw new CustomError("Authorization required", 401);

      const base = await AffiliateService.analyticsSummary(userId, req.query);

      // אם אין פרופיל מאושר
      if (!base.code) {
        return res.status(200).json({ status: 200, summary: base });
      }

      const code = base.code;

      const ordersCount = await Order.countDocuments({
        affiliateRef: code,
        "payment.status": "paid",
        status: { $nin: ["canceled", "returned"] },
      });

      const paidAgg = await Order.aggregate([
        {
          $match: {
            affiliateRef: code,
            "payment.status": "paid",
            status: { $nin: ["canceled", "returned"] },
          },
        },
        {
          $group: {
            _id: null,
            count: { $sum: 1 },
            totalAmount: { $sum: "$totalAmount" },
          },
        },
      ]);

      const paidOrdersCount = paidAgg?.[0]?.count ?? 0;
      const paidAmount = paidAgg?.[0]?.totalAmount ?? 0;

      const estimatedCommissionPaid = paidAmount * (base.commissionRate || 0);

      return res.status(200).json({
        status: 200,
        summary: {
          clicks: base.clicks,
          uniqueClicks: base.uniqueClicks,
          ordersCount,
          paidOrdersCount,
          paidAmount,
          commissionRate: base.commissionRate || 0,
          estimatedCommissionPaid,
          entries: base.entries ?? 0,
          uniqueEntries: base.uniqueEntries ?? 0,
        },
      });
    } catch (err) {
      next(err);
    }
  }
  static async analyticsTimeseries(req, res, next) {
    try {
      const userId = getUserId(req);
      if (!userId) throw new CustomError("Authorization required", 401);

      const data = await AffiliateService.analyticsTimeseries(
        userId,
        req.query
      );

      return res.status(200).json({
        status: 200,
        series: data,
      });
    } catch (err) {
      next(err);
    }
  }
  // 8) רשימת עמלות לשותף המחובר
  static async commissions(req, res, next) {
    try {
      const userId = getUserId(req);
      if (!userId) throw new CustomError("Authorization required", 401);

      const profile = await AffiliateProfile.findOne({ userId }).select(
        "code status"
      );
      if (!profile || profile.status !== "approved") {
        return res.status(200).json({ status: 200, commissions: [] });
      }

      const raw = String(req.query.status || "all")
        .trim()
        .toLowerCase();
      const query = { affiliateCode: profile.code };

      if (raw && raw !== "all") {
        query.status = raw; // pending / approved / paid / void
      }

      const commissions = await AffiliateCommission.find(query)
        .sort({ createdAt: -1 })
        .select(
          "orderId baseAmount commissionRate commissionAmount status createdAt paidAt"
        );

      return res.status(200).json({ status: 200, commissions });
    } catch (err) {
      next(err);
    }
  }

  // 9) סיכום עמלות לשותף המחובר
  static async commissionsSummary(req, res, next) {
    try {
      const userId = getUserId(req);
      if (!userId) throw new CustomError("Authorization required", 401);

      const profile = await AffiliateProfile.findOne({ userId }).select(
        "code status"
      );
      if (!profile || profile.status !== "approved") {
        return res.status(200).json({
          status: 200,
          summary: {
            totalCount: 0,
            totalAmount: 0,
            pendingAmount: 0,
            eligibleAmount: 0,
            paidAmount: 0,
          },
        });
      }

      const code = profile.code;

      const agg = await AffiliateCommission.aggregate([
        { $match: { affiliateCode: code } },
        {
          $group: {
            _id: "$status",
            count: { $sum: 1 },
            amount: { $sum: "$commissionAmount" },
          },
        },
      ]);

      const byStatus = new Map();
      for (const r of agg) {
        byStatus.set(r._id, {
          count: r.count || 0,
          amount: r.amount || 0,
        });
      }

      const pendingAmount = byStatus.get("pending")?.amount || 0;
      const eligibleAmount = byStatus.get("eligible")?.amount || 0;
      const paidAmount = byStatus.get("paid")?.amount || 0;

      const totalCount =
        (byStatus.get("pending")?.count || 0) +
        (byStatus.get("eligible")?.count || 0) +
        (byStatus.get("paid")?.count || 0) +
        (byStatus.get("void")?.count || 0);

      const totalAmount =
        pendingAmount +
        eligibleAmount +
        paidAmount +
        (byStatus.get("void")?.amount || 0);

      return res.status(200).json({
        status: 200,
        summary: {
          totalCount,
          totalAmount,
          pendingAmount,
          eligibleAmount,
          paidAmount,
        },
      });
    } catch (err) {
      next(err);
    }
  }
  // 10) כמה זמין למשיכה
  static async payoutsAvailable(req, res, next) {
    try {
      const userId = getUserId(req);
      if (!userId) throw new CustomError("Authorization required", 401);

      const data = await AffiliatePayoutService.getAvailable(userId);
      return res.status(200).json({ status: 200, ...data });
    } catch (err) {
      next(err);
    }
  }

  // 11) היסטוריית משיכות
  static async payouts(req, res, next) {
    try {
      const userId = getUserId(req);
      if (!userId) throw new CustomError("Authorization required", 401);

      const payouts = await AffiliatePayoutService.listMyPayouts(userId);
      return res.status(200).json({ status: 200, payouts });
    } catch (err) {
      next(err);
    }
  }

  // 12) בקשת משיכה
  static async requestPayout(req, res, next) {
    try {
      const userId = getUserId(req);
      if (!userId) throw new CustomError("Authorization required", 401);

      const payload = req.validated?.body ?? req.body ?? {};
      const payout = await AffiliatePayoutService.requestPayout(
        userId,
        payload
      );

      return res.status(201).json({ status: 201, payout });
    } catch (err) {
      next(err);
    }
  }
}
