import mongoose from "mongoose";
import { CustomError } from "../utils/CustomError.js";
import { AffiliateProfile } from "../models/AffiliateProfile.js";
import { AffiliateCommission } from "../models/AffiliateProfile.js";
import { AffiliatePayout } from "../models/AffiliatePayout.js";

const MIN_PAYOUT = Number(process.env.AFFILIATE_MIN_PAYOUT ?? 100);

function mustApproved(profile) {
  if (!profile || profile.status !== "approved") throw new CustomError("Not allowed", 403);
}

function toNumber(n) {
  const x = Number(n);
  return Number.isFinite(x) ? x : 0;
}

export class AffiliatePayoutService {
  static async getAvailable(userId) {
    const profile = await AffiliateProfile.findOne({ userId }).select("code status");
    if (!profile || profile.status !== "approved") {
      return { availableAmount: 0, eligibleCount: 0, minPayoutAmount: MIN_PAYOUT };
    }

    const code = profile.code;

    const agg = await AffiliateCommission.aggregate([
      { $match: { affiliateCode: code, status: "eligible", lockedForPayoutId: null } },
      { $group: { _id: null, eligibleCount: { $sum: 1 }, availableAmount: { $sum: "$commissionAmount" } } },
    ]);

    return {
      availableAmount: agg?.[0]?.availableAmount ?? 0,
      eligibleCount: agg?.[0]?.eligibleCount ?? 0,
      minPayoutAmount: MIN_PAYOUT,
    };
  }

  static async listMyPayouts(userId) {
    const profile = await AffiliateProfile.findOne({ userId }).select("code status");
    if (!profile || profile.status !== "approved") return [];

    return AffiliatePayout.find({ affiliateCode: profile.code })
      .sort({ createdAt: -1 })
      .select("amount currency status method requestedAt approvedAt paidAt providerRef createdAt");
  }

  static async requestPayout(userId, payload = {}) {
    const profile = await AffiliateProfile.findOne({ userId }).select("code status");
    mustApproved(profile);

    const method = String(payload.method || "").trim().toLowerCase();
    if (!["bank", "paypal", "bit", "paybox"].includes(method)) {
      throw new CustomError("Invalid payout method", 400);
    }

    const payoutDetails = payload.payoutDetails ?? null;

    const requestedAmountRaw = payload.amount; // undefined => משוך הכל
    const requestedAmount = requestedAmountRaw == null ? null : toNumber(requestedAmountRaw);

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const code = profile.code;

      const eligible = await AffiliateCommission.find(
        { affiliateCode: code, status: "eligible", lockedForPayoutId: null },
        null,
        { session }
      )
        .sort({ createdAt: 1 })
        .select("_id commissionAmount createdAt");

      if (!eligible.length) throw new CustomError("No eligible commissions", 400);

      const totalAvailable = eligible.reduce((s, c) => s + (c.commissionAmount || 0), 0);

      const target =
        requestedAmount == null
          ? totalAvailable
          : Math.max(0, Math.min(requestedAmount, totalAvailable));

      if (target < MIN_PAYOUT) throw new CustomError(`Minimum payout is ${MIN_PAYOUT}`, 400);

      const picked = [];
      let sum = 0;
      for (const c of eligible) {
        if (sum >= target) break;
        picked.push(c._id);
        sum += c.commissionAmount || 0;
      }

      if (!picked.length) throw new CustomError("No eligible commissions", 400);

      const created = await AffiliatePayout.create(
        [
          {
            affiliateCode: code,
            amount: sum,
            currency: "ILS",
            status: "requested",
            method,
            payoutDetailsSnapshot: payoutDetails,
            commissionIds: picked,
            requestedAt: new Date(),
          },
        ],
        { session }
      );

      const payout = created[0];

      const lockRes = await AffiliateCommission.updateMany(
        { _id: { $in: picked }, affiliateCode: code, status: "eligible", lockedForPayoutId: null },
        { $set: { lockedForPayoutId: payout._id, lockedAt: new Date() } },
        { session }
      );

      if ((lockRes?.modifiedCount ?? 0) !== picked.length) {
        throw new CustomError("Some commissions were locked by another request", 409);
      }

      await session.commitTransaction();
      session.endSession();

      return payout;
    } catch (err) {
      await session.abortTransaction();
      session.endSession();
      throw err;
    }
  }
}
