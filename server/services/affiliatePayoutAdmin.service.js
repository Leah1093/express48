import mongoose from "mongoose";
import { CustomError } from "../utils/CustomError.js";
import { AffiliatePayout } from "../models/AffiliatePayout.js";
import { AffiliateCommission } from "../models/AffiliateProfile.js";

function toObjectId(id) {
  if (!mongoose.isValidObjectId(id)) throw new CustomError("Invalid id", 400);
  return new mongoose.Types.ObjectId(id);
}

export class AffiliatePayoutAdminService {
  // רשימה לאדמין
  static async list(query = {}) {
    const status = String(query.status || "").trim().toLowerCase();

    const filter = {};
    if (status) filter.status = status;

    const payouts = await AffiliatePayout.find(filter)
      .sort({ createdAt: -1 })
      .select(
        "affiliateCode amount currency status method requestedAt approvedAt paidAt providerRef adminNote createdAt"
      );

    return payouts;
  }

  // פרטי בקשה + עמלות
  static async getById(payoutId) {
    const _id = toObjectId(payoutId);

    const payout = await AffiliatePayout.findById(_id).lean();
    if (!payout) throw new CustomError("Payout not found", 404);

    const commissions = await AffiliateCommission.find({
      _id: { $in: payout.commissionIds || [] },
    })
      .select(
        "orderId baseAmount commissionRate commissionAmount status lockedForPayoutId lockedAt createdAt paidAt"
      )
      .sort({ createdAt: 1 })
      .lean();

    return { payout, commissions };
  }

  // אישור (עדיין לא מסמן paid)
  static async approve(payoutId, payload = {}) {
    const _id = toObjectId(payoutId);
    const adminNote = payload?.adminNote ?? null;

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const payout = await AffiliatePayout.findById(_id, null, { session });
      if (!payout) throw new CustomError("Payout not found", 404);

      if (payout.status !== "requested") {
        throw new CustomError("Payout is not in requested status", 409);
      }

      // בודקים שכל העמלות עדיין נעולות על הבקשה הזאת ובסטטוס eligible
      const count = await AffiliateCommission.countDocuments(
        {
          _id: { $in: payout.commissionIds },
          affiliateCode: payout.affiliateCode,
          status: "eligible",
          lockedForPayoutId: payout._id,
        },
        { session }
      );

      if (count !== (payout.commissionIds?.length || 0)) {
        throw new CustomError("Commissions state mismatch", 409);
      }

      payout.status = "approved";
      payout.approvedAt = new Date();
      payout.adminNote = adminNote;
      await payout.save({ session });

      await session.commitTransaction();
      session.endSession();

      return payout;
    } catch (err) {
      await session.abortTransaction();
      session.endSession();
      throw err;
    }
  }

  // דחייה: משחרר נעילות
  static async reject(payoutId, payload = {}) {
    const _id = toObjectId(payoutId);
    const adminNote = payload?.adminNote ?? null;

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const payout = await AffiliatePayout.findById(_id, null, { session });
      if (!payout) throw new CustomError("Payout not found", 404);

      if (payout.status !== "requested" && payout.status !== "approved") {
        throw new CustomError("Payout cannot be rejected in current status", 409);
      }

      // משחררים נעילות רק לעמלות שעדיין eligible ונעולות על הבקשה
      await AffiliateCommission.updateMany(
        {
          _id: { $in: payout.commissionIds },
          affiliateCode: payout.affiliateCode,
          status: "eligible",
          lockedForPayoutId: payout._id,
        },
        { $set: { lockedForPayoutId: null, lockedAt: null } },
        { session }
      );

      payout.status = "rejected";
      payout.adminNote = adminNote;
      await payout.save({ session });

      await session.commitTransaction();
      session.endSession();

      return payout;
    } catch (err) {
      await session.abortTransaction();
      session.endSession();
      throw err;
    }
  }

  // אחרי שבאמת שילמת ידנית: markPaid -> commissions eligible->paid
  static async markPaid(payoutId, payload = {}) {
    const _id = toObjectId(payoutId);
    const providerRef = payload?.providerRef ?? null;
    const adminNote = payload?.adminNote ?? null;

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const payout = await AffiliatePayout.findById(_id, null, { session });
      if (!payout) throw new CustomError("Payout not found", 404);

      if (payout.status !== "approved" && payout.status !== "processing") {
        throw new CustomError("Payout is not approved/processing", 409);
      }

      const now = new Date();

      // מעדכנים את כל העמלות של הבקשה
      const res = await AffiliateCommission.updateMany(
        {
          _id: { $in: payout.commissionIds },
          affiliateCode: payout.affiliateCode,
          status: "eligible",
          lockedForPayoutId: payout._id,
        },
        {
          $set: {
            status: "paid",
            paidAt: now,
          },
        },
        { session }
      );

      const expected = payout.commissionIds?.length || 0;
      if ((res.modifiedCount ?? 0) !== expected) {
        throw new CustomError("Not all commissions were updated to paid", 409);
      }

      payout.status = "paid";
      payout.paidAt = now;
      payout.providerRef = providerRef;
      payout.adminNote = adminNote;
      await payout.save({ session });

      await session.commitTransaction();
      session.endSession();

      return payout;
    } catch (err) {
      await session.abortTransaction();
      session.endSession();
      throw err;
    }
  }

  // אופציונלי: אם התחלת לשלם ורוצה מצב ביניים
  static async setProcessing(payoutId) {
    const _id = toObjectId(payoutId);

    const payout = await AffiliatePayout.findById(_id);
    if (!payout) throw new CustomError("Payout not found", 404);

    if (payout.status !== "approved") {
      throw new CustomError("Payout must be approved first", 409);
    }

    payout.status = "processing";
    await payout.save();
    return payout;
  }
}
